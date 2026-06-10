import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { buildPaytrIframePayload, redactPaytrPayload } from "@/lib/paytr";
import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { durationSince, logError, logInfo, logWarn } from "@/lib/server-logger";
import { absoluteUrl } from "@/lib/site";
import { getDb } from "@/server/db/client";
import { orders, paytrTransactions } from "@/server/db/schema";
import { requestPaytrIframeToken } from "@/server/paytr/client";
import {
  createPaytrCheckoutOrder,
  isPaytrCheckoutPriçingError,
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
    const body = paytrCheckoutRequestSchema.parse(await request.json());
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
        flow: "iframe",
        request
      });
    createdMerchantOid = merchantOid;

    const payload = buildPaytrIframePayload({
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

    const result = await requestPaytrIframeToken(payload);

    if (result.status !== "success") {
      await db
        .update(orders)
        .set({
          status: "failed",
          paymentStatus: "token_failed",
          updatedAt: new Date()
        })
        .where(eq(orders.id, order.id));

      await db
        .update(paytrTransactions)
        .set({
          rawRequest: {
            requestBody: body,
            paytrPayload: redactPaytrPayload(payload),
            paytrError: result
          },
          updatedAt: new Date()
        })
        .where(eq(paytrTransactions.orderId, order.id));

      logWarn("paytr.token.rejected", {
        merchantOid,
        reason: result.reason,
        durationMs: durationSince(startedAt)
      });

      return NextResponse.json(
        {
          ok: false,
          message: "PayTR token alınamadı.",
          details: result
        },
        { status: 400 }
      );
    }

    await db
      .update(paytrTransactions)
      .set({
        iframeToken: result.token,
        status: "token_received",
        rawRequest: {
          requestBody: body,
          paytrPayload: redactPaytrPayload(payload)
        },
        updatedAt: new Date()
      })
      .where(eq(paytrTransactions.orderId, order.id));

    logInfo("paytr.token.created", {
      merchantOid,
      orderId: order.id,
      itemCount: items.length,
      totalKurus: paymentAmountKurus,
      durationMs: durationSince(startedAt)
    });

    return NextResponse.json({
      ok: true,
      iframeToken: result.token,
      merchantOid
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
        // Sipariş kurulumunda hata olsa da asıl hatayı bastırmıyoruz.
      }
    }

    if (isRuntimeConfigError(error)) {
      logWarn("paytr.token.runtime_config_error", {
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

    if (isPaytrCheckoutPriçingError(error)) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message
        },
        { status: 400 }
      );
    }

    logError("paytr.token.failed", error, {
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
