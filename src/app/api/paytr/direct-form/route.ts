import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import {
  buildPaytrDirectApiPayload,
  PAYTR_DIRECT_API_FORM_ACTION,
  redactPaytrPayload
} from "@/lib/paytr";
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
          message: "Cok fazla odeme hazirlama denemesi yapildi. Lutfen biraz sonra tekrar deneyin."
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds)
          }
        }
      );
    }

    const { db, merchantOid, order, userIp } = await createPaytrCheckoutOrder({
      body,
      flow: "direct_api",
      request
    });
    createdMerchantOid = merchantOid;

    const payload = buildPaytrDirectApiPayload({
      email: body.email,
      paymentAmountKurus: body.paymentAmountKurus,
      userIp,
      userName: body.userName,
      userAddress: body.userAddress,
      userPhone: body.userPhone,
      okUrl: absoluteUrl(`/odeme?status=success&oid=${merchantOid}`),
      failUrl: absoluteUrl(`/odeme?status=failed&oid=${merchantOid}`),
      items: body.items,
      merchantOid,
      installmentCount: 0,
      non3d: 0
    });

    await db
      .update(paytrTransactions)
      .set({
        rawRequest: {
          requestBody: {
            email: body.email,
            flow: "direct_api",
            itemCount: body.items.length,
            paymentAmountKurus: body.paymentAmountKurus
          },
          paytrPayload: redactPaytrPayload(payload)
        },
        updatedAt: new Date()
      })
      .where(eq(paytrTransactions.orderId, order.id));

    logInfo("paytr.direct_form.created", {
      merchantOid,
      orderId: order.id,
      itemCount: body.items.length,
      totalKurus: body.paymentAmountKurus,
      durationMs: durationSince(startedAt)
    });

    return NextResponse.json({
      ok: true,
      merchantOid,
      formAction: PAYTR_DIRECT_API_FORM_ACTION,
      fields: payload
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
        // Siparis kurulumunda hata olsa da asil hatayi bastirmiyoruz.
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

    logError("paytr.direct_form.failed", error, {
      merchantOid: createdMerchantOid,
      durationMs: durationSince(startedAt)
    });

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Beklenmeyen bir hata olustu."
      },
      { status: 500 }
    );
  }
}
