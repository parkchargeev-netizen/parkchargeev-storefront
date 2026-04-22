import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { buildPaytrIframePayload } from "@/lib/paytr";
import {
  getRuntimeConfigErrorPayload,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { absoluteUrl } from "@/lib/site";
import { getDb } from "@/server/db/client";
import {
  customers,
  orderItems,
  orders,
  paytrTransactions
} from "@/server/db/schema";

const tokenRequestSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(2),
  userAddress: z.string().min(5),
  userPhone: z.string().min(10),
  paymentAmountKurus: z.number().int().positive(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
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
  let createdMerchantOid: string | null = null;

  try {
    const body = tokenRequestSchema.parse(await request.json());
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
    const merchantOid = `PCEV-${randomUUID()}`;
    createdMerchantOid = merchantOid;

    const [customer] = await db
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

    const [order] = await db
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

    await db.insert(orderItems).values(
      body.items.map((item) => {
        const unitPriceKurus = Math.round(Number(item.unitPrice) * 100);

        return {
          orderId: order.id,
          productName: item.title,
          quantity: item.quantity,
          unitPriceKurus,
          lineTotalKurus: unitPriceKurus * item.quantity
        };
      })
    );

    await db.insert(paytrTransactions).values({
      orderId: order.id,
      merchantOid,
      paymentAmountKurus: body.paymentAmountKurus,
      rawRequest: {
        requestBody: body
      }
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

    const formData = new URLSearchParams(payload);

    const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString(),
      cache: "no-store"
    });

    const result = (await response.json()) as
      | { status: "success"; token: string }
      | { status: "failed"; reason?: string };

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
      return NextResponse.json(getRuntimeConfigErrorPayload(error), {
        status: 503
      });
    }

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
