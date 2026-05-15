import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { buildPaytrIframePayload, generateMerchantOid } from "@/lib/paytr";
import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { durationSince, logError, logInfo, logWarn } from "@/lib/server-logger";
import { absoluteUrl } from "@/lib/site";
import { getDb } from "@/server/db/client";
import {
  customers,
  orderItems,
  orders,
  paytrTransactions
} from "@/server/db/schema";
import { requestPaytrIframeToken } from "@/server/paytr/client";
import {
  consumePaytrTokenAttempt,
  getPaytrTokenRateLimitKey
} from "@/server/paytr/rate-limit";

const tokenRequestSchema = z.object({
  email: z.string().trim().email().max(100),
  userName: z.string().trim().min(2).max(60),
  userAddress: z.string().trim().min(5).max(400),
  userPhone: z.string().trim().min(10).max(20),
  paymentAmountKurus: z.number().int().positive(),
  items: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(180),
        unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? fullName,
    lastName: parts.slice(1).join(" ") || null
  };
}

function createOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `PCEV-${stamp}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let createdMerchantOid: string | null = null;

  try {
    const body = tokenRequestSchema.parse(await request.json());
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

    const db = getDb();
    const forwardedFor = request.headers.get("x-forwarded-for");
    const userIp =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      process.env.PAYTR_TEST_USER_IP ||
      "127.0.0.1";
    const { firstName, lastName } = splitFullName(body.userName);
    const subtotalKurus = body.items.reduce(
      (total, item) => total + Math.round(Number(item.unitPrice) * 100) * item.quantity,
      0
    );
    const taxKurus = Math.max(body.paymentAmountKurus - subtotalKurus, 0);
    const merchantOid = generateMerchantOid();
    createdMerchantOid = merchantOid;

    const { order } = await db.transaction(async (tx) => {
      const [customer] = await tx
        .insert(customers)
        .values({
          email: body.email,
          firstName,
          lastName,
          phone: body.userPhone,
          role: "guest"
        })
        .onConflictDoUpdate({
          target: customers.email,
          set: {
            firstName,
            lastName,
            phone: body.userPhone
          }
        })
        .returning({
          id: customers.id
        });

      const [createdOrder] = await tx
        .insert(orders)
        .values({
          customerId: customer.id,
          orderNumber: createOrderNumber(),
          merchantOid,
          status: "pending_payment",
          currency: "TRY",
          subtotalKurus,
          shippingKurus: 0,
          taxKurus,
          totalKurus: body.paymentAmountKurus,
          paymentProvider: "paytr",
          paymentStatus: "pending"
        })
        .returning({
          id: orders.id
        });

      await tx.insert(orderItems).values(
        body.items.map((item) => {
          const unitPriceKurus = Math.round(Number(item.unitPrice) * 100);

          return {
            orderId: createdOrder.id,
            productName: item.title,
            quantity: item.quantity,
            unitPriceKurus,
            lineTotalKurus: unitPriceKurus * item.quantity
          };
        })
      );

      await tx.insert(paytrTransactions).values({
        orderId: createdOrder.id,
        merchantOid,
        paymentAmountKurus: body.paymentAmountKurus,
        rawRequest: {
          requestBody: {
            email: body.email,
            itemCount: body.items.length,
            paymentAmountKurus: body.paymentAmountKurus
          }
        }
      });

      return {
        order: createdOrder
      };
    });

    const payload = buildPaytrIframePayload({
      email: body.email,
      paymentAmountKurus: body.paymentAmountKurus,
      userIp,
      userName: body.userName,
      userAddress: body.userAddress,
      userPhone: body.userPhone,
      okUrl: absoluteUrl(`/odeme?status=success&oid=${merchantOid}`),
      failUrl: absoluteUrl(`/odeme?status=failed&oid=${merchantOid}`),
      items: body.items,
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
            paytrPayload: payload,
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
          paytrPayload: payload
        },
        updatedAt: new Date()
      })
      .where(eq(paytrTransactions.orderId, order.id));

    logInfo("paytr.token.created", {
      merchantOid,
      orderId: order.id,
      itemCount: body.items.length,
      totalKurus: body.paymentAmountKurus,
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
