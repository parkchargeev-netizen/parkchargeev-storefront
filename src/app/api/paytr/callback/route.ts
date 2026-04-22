import { eq } from "drizzle-orm";

import { verifyPaytrCallbackHash } from "@/lib/paytr";
import { getDb } from "@/server/db/client";
import { orderStatusHistory, orders, paytrTransactions } from "@/server/db/schema";

export async function POST(request: Request) {
  const formData = await request.formData();

  const payload = {
    merchant_oid: String(formData.get("merchant_oid") ?? ""),
    status: String(formData.get("status") ?? "") as "success" | "failed",
    total_amount: String(formData.get("total_amount") ?? ""),
    hash: String(formData.get("hash") ?? ""),
    payment_type: String(formData.get("payment_type") ?? ""),
    currency: String(formData.get("currency") ?? ""),
    payment_amount: String(formData.get("payment_amount") ?? ""),
    failed_reason_code: String(formData.get("failed_reason_code") ?? ""),
    failed_reason_msg: String(formData.get("failed_reason_msg") ?? "")
  };

  if (!verifyPaytrCallbackHash(payload)) {
    return new Response("PAYTR notification failed: bad hash", { status: 400 });
  }

  const db = getDb();
  const [order] = await db
    .select({
      id: orders.id
    })
    .from(orders)
    .where(eq(orders.merchantOid, payload.merchant_oid))
    .limit(1);

  if (!order) {
    return new Response("PAYTR notification failed: order not found", { status: 404 });
  }

  await db
    .update(paytrTransactions)
    .set({
      totalAmountKurus: Number(payload.total_amount || payload.payment_amount || "0"),
      status: payload.status === "success" ? "callback_success" : "callback_failed",
      rawCallback: payload,
      updatedAt: new Date()
    })
    .where(eq(paytrTransactions.merchantOid, payload.merchant_oid));

  await db
    .update(orders)
    .set({
      status: payload.status === "success" ? "pending_confirmation" : "failed",
      paymentStatus: payload.status === "success" ? "paid" : "failed",
      paytrLastSyncedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(orders.id, order.id));

  await db.insert(orderStatusHistory).values({
    orderId: order.id,
    fromStatus: null,
    toStatus: payload.status === "success" ? "pending_confirmation" : "failed",
    note:
      payload.status === "success"
        ? "PayTR callback ile odeme onayi alindi."
        : payload.failed_reason_msg || "PayTR callback odeme hatasi bildirdi."
  });

  return new Response("OK");
}
