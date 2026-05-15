import { randomUUID } from "node:crypto";

import { z } from "zod";

import { generateMerchantOid } from "@/lib/paytr";
import { getDb } from "@/server/db/client";
import { customers, orderItems, orders, paytrTransactions } from "@/server/db/schema";

export const paytrCheckoutRequestSchema = z.object({
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

export type PaytrCheckoutRequest = z.infer<typeof paytrCheckoutRequestSchema>;
export type PaytrCheckoutFlow = "iframe" | "direct_api";

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

export function getPaytrUserIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return (
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    process.env.PAYTR_TEST_USER_IP ||
    "127.0.0.1"
  );
}

export async function createPaytrCheckoutOrder({
  body,
  flow,
  request
}: {
  body: PaytrCheckoutRequest;
  flow: PaytrCheckoutFlow;
  request: Request;
}) {
  const db = getDb();
  const userIp = getPaytrUserIp(request);
  const { firstName, lastName } = splitFullName(body.userName);
  const subtotalKurus = body.items.reduce(
    (total, item) =>
      total + Math.round(Number(item.unitPrice) * 100) * item.quantity,
    0
  );
  const taxKurus = Math.max(body.paymentAmountKurus - subtotalKurus, 0);
  const merchantOid = generateMerchantOid();

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
        paymentStatus: "pending",
        customerName: body.userName,
        customerEmail: body.email,
        customerPhone: body.userPhone
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
          flow,
          itemCount: body.items.length,
          paymentAmountKurus: body.paymentAmountKurus
        }
      }
    });

    return {
      order: createdOrder
    };
  });

  return {
    db,
    order,
    merchantOid,
    userIp
  };
}
