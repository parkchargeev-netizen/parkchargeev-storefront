import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { buildPaytrDirectFormPayload, redactPaytrPayload } from "@/lib/paytr";
import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { durationSince, logError, logInfo, logWarn } from "@/lib/server-logger";
import { absoluteUrl } from "@/lib/site";
import { getDb } from "@/server/db/client";
import { orders, paytrTransactions } from "@/server/db/schema";
import {
  createPaytrCheckoutOrder,
  isPaytrCheckoutPricingError,
  paytrCheckoutRequestSchema
} from "@/server/paytr/checkout-order";
import {
  consumePaytrTokenAttempt,
  getPaytrTokenRateLimitKey
} from "@/server/paytr/rate-limit";

export async function POST(request: Request) {
  const startedAt = Date.now();
  let createdMerchantOid: string | null = null;

  try {
    let requestBody: unknown;

    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          message: "Ödeme isteği okunamadı. Lütfen sayfayı yenileyip tekrar deneyin."
        },
        { status: 400 }
      );
    }

    const body = paytrCheckoutRequestSchema.parse(requestBody);
    const rateLimit = consumePaytrTokenAttempt(
      getPaytrTokenRateLimitKey(request, body.email)
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: "Çok fazla ödeme hazırlama denemesi yapıldı. Lütfen biraz sonra tekrar deneyin."
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds)
          }
        }
      );
    }

    const { db, items, merchantOid, order, paymentAmountKurus, userIp } =
      await createPaytrCheckoutOrder({
        body,
        flow: "direct_api",
        request
      });
    createdMerchantOid = merchantOid;

    const fields = buildPaytrDirectFormPayload({
      email: body.email,
      paymentAmountKurus,
      userIp,
      userName: body.userName,
      userAddress: body.userAddress,
      userPhone: body.userPhone,
      okUrl: absoluteUrl(`/odeme?status=success&oid=${merchantOid}`),
      failUrl: absoluteUrl(`/odeme?status=failed&oid=${merchantOid}`),
      items,
      merchantOid
    });

    await db
      .update(paytrTransactions)
      .set({
        status: "token_received",
        rawRequest: {
          requestBody: {
            email: body.email,
            flow: "direct_api",
            itemCount: body.items.length,
            paymentAmountKurus,
            serverPriced: true
          },
          paytrPayload: redactPaytrPayload(fields)
        },
        updatedAt: new Date()
      })
      .where(eq(paytrTransactions.orderId, order.id));

    logInfo("paytr.direct_form.created", {
      merchantOid,
      orderId: order.id,
      itemCount: items.length,
      totalKurus: paymentAmountKurus,
      durationMs: durationSince(startedAt)
    });

    return NextResponse.json({
      ok: true,
      action: "https://www.paytr.com/odeme",
      merchantOid,
      fields
    });
  } catch (error) {
    if (createdMerchantOid) {
      try {
        const db = getDb();

        await db
          .update(orders)
          .set({
            status: "failed",
            paymentStatus: "setup_failed",
            updatedAt: new Date()
          })
          .where(eq(orders.merchantOid, createdMerchantOid));
      } catch {
        // Asıl hatayı bastırmıyoruz.
      }
    }

    if (isRuntimeConfigError(error)) {
      logWarn("paytr.direct_form.runtime_config_error", {
        area: error.area,
        missingKeys: error.missingKeys,
        merchantOid: createdMerchantOid,
        durationMs: durationSince(startedAt)
      });

      return NextResponse.json(getRuntimeConfigErrorPayload(error), {
        status: 503
      });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ödeme bilgileri eksik veya geçersiz.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    if (isPaytrCheckoutPricingError(error)) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message
        },
        { status: 400 }
      );
    }

    logError("paytr.direct_form.failed", error, {
      merchantOid: createdMerchantOid,
      durationMs: durationSince(startedAt)
    });

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
      },
      { status: 500 }
    );
  }
}
