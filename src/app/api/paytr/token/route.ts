import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  buildPaytrIframePayload,
  buildPaytrLinkPayload,
  redactPaytrPayload
} from "@/lib/paytr";
import {
  PAYTR_CHECKOUT_CLIENT_VERSION,
  PAYTR_CHECKOUT_VERSION_HEADER
} from "@/lib/paytr-checkout-contract";
import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { durationSince, logError, logInfo, logWarn } from "@/lib/server-logger";
import { absoluteUrl } from "@/lib/site";
import { getDb } from "@/server/db/client";
import { orders, paytrTransactions } from "@/server/db/schema";
import {
  requestPaytrIframeToken,
  requestPaytrPaymentLink
} from "@/server/paytr/client";
import {
  createPaytrCheckoutOrder,
  isPaytrCheckoutPricingError,
  paytrCheckoutRequestSchema
} from "@/server/paytr/checkout-order";
import {
  consumePaytrTokenAttempt,
  getPaytrTokenRateLimitKey
} from "@/server/paytr/rate-limit";

function getPaytrTokenFailureMessage(reason?: string) {
  const normalizedReason = reason?.toLocaleLowerCase("tr-TR") ?? "";

  if (
    normalizedReason.includes("magaza aktif degil") ||
    normalizedReason.includes("mağaza aktif değil")
  ) {
    return "PayTR mağazası aktif görünmüyor veya canlı/test mod ayarları uyuşmuyor. PayTR panelinde mağaza aktivasyonu, API bilgileri ve test modu ayarlarını kontrol edin.";
  }

  if (
    normalizedReason.includes("merchant_id") ||
    normalizedReason.includes("magaza no") ||
    normalizedReason.includes("mağaza no")
  ) {
    return "PayTR mağaza numarası doğrulanamadı. PAYTR_MERCHANT_ID değerinin PayTR panelindeki sayısal mağaza numarası olduğundan emin olun.";
  }

  if (
    normalizedReason.includes("gecersiz paytr_token") ||
    normalizedReason.includes("geçersiz paytr_token")
  ) {
    return "PayTR güvenlik imzası doğrulanamadı. Merchant key/salt bilgileri ve müşteri IP değeri kontrol edilmelidir.";
  }

  return "PayTR ödeme oturumu başlatılamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.";
}

function isLinkOnlyPaytrMerchant(reason?: string) {
  const normalizedReason = reason?.toLocaleLowerCase("tr-TR") ?? "";

  return (
    normalizedReason.includes("yalnizca link cozumu") ||
    normalizedReason.includes("yalnızca link çözümü") ||
    normalizedReason.includes("basic api")
  );
}

function getPaytrLinkCallbackUrl() {
  const configuredUrl = process.env.PAYTR_CALLBACK_URL?.trim();
  const callbackUrl = configuredUrl || absoluteUrl("/api/paytr/callback");

  try {
    if (new URL(callbackUrl).protocol === "https:") {
      return callbackUrl;
    }
  } catch {
    // Aşağıdaki güvenli production callback adresine düşülür.
  }

  return "https://parkchargeev.com/api/paytr/callback";
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let createdMerchantOid: string | null = null;

  if (
    request.headers.get(PAYTR_CHECKOUT_VERSION_HEADER) !==
    PAYTR_CHECKOUT_CLIENT_VERSION
  ) {
    return NextResponse.json(
      {
        ok: false,
        code: "checkout_client_outdated",
        message:
          "Ödeme ekranı güncellendi. Lütfen bu sekmeyi Ctrl+F5 ile yenileyip ödemeyi tekrar başlatın."
      },
      {
        status: 409,
        headers: {
          "Cache-Control": "no-store",
          [PAYTR_CHECKOUT_VERSION_HEADER]: PAYTR_CHECKOUT_CLIENT_VERSION
        }
      }
    );
  }

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
      let linkFailure: Record<string, unknown> | null = null;

      if (isLinkOnlyPaytrMerchant(result.reason)) {
        const linkPayload = buildPaytrLinkPayload({
          name: items.map((item) => item.title).join(", "),
          paymentAmountKurus,
          callbackUrl: getPaytrLinkCallbackUrl(),
          callbackId: merchantOid,
          userName: body.userName
        });
        const linkResult = await requestPaytrPaymentLink(linkPayload);

        if (linkResult.status === "success") {
          await db
            .update(paytrTransactions)
            .set({
              status: "token_received",
              rawRequest: {
                requestBody: {
                  ...body,
                  flow: "link_api"
                },
                iframeRejection: result,
                paytrLinkPayload: redactPaytrPayload(linkPayload),
                paytrLinkId: linkResult.id,
                paymentUrl: linkResult.link
              },
              updatedAt: new Date()
            })
            .where(eq(paytrTransactions.orderId, order.id));

          logInfo("paytr.link.created", {
            merchantOid,
            orderId: order.id,
            itemCount: items.length,
            totalKurus: paymentAmountKurus,
            durationMs: durationSince(startedAt)
          });

          return NextResponse.json({
            ok: true,
            paymentFlow: "link",
            paymentUrl: linkResult.link,
            merchantOid
          });
        }

        linkFailure = {
          status: linkResult.status,
          reason: linkResult.reason,
          raw: linkResult.raw
        };
        logWarn("paytr.link.rejected", {
          merchantOid,
          reason: linkResult.reason,
          durationMs: durationSince(startedAt)
        });
      }

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
            paytrError: result,
            ...(linkFailure ? { paytrLinkError: linkFailure } : {})
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
          code: "paytr_provider_rejected",
          message: getPaytrTokenFailureMessage(result.reason),
          details: linkFailure ?? result
        },
        { status: 200 }
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

    if (isPaytrCheckoutPricingError(error)) {
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
