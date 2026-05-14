import { eq } from "drizzle-orm";

import { verifyPaytrCallbackHash } from "@/lib/paytr";
import { durationSince, logError, logInfo, logWarn } from "@/lib/server-logger";
import { getDb } from "@/server/db/client";
import { orderStatusHistory, orders, paytrTransactions } from "@/server/db/schema";

export async function POST(request: Request) {
  const startedAt = Date.now();
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

  try {
    if (!verifyPaytrCallbackHash(payload)) {
      logWarn("paytr.callback.bad_hash", {
        merchantOid: payload.merchant_oid,
        durationMs: durationSince(startedAt)
      });
      return new Response("PAYTR notification failed: bad hash", { status: 400 });
    }

    const db = getDb();
    const [order] = await db
      .select({
        id: orders.id,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        totalKurus: orders.totalKurus
      })
      .from(orders)
      .where(eq(orders.merchantOid, payload.merchant_oid))
      .limit(1);

    if (!order) {
      logWarn("paytr.callback.order_not_found", {
        merchantOid: payload.merchant_oid,
        durationMs: durationSince(startedAt)
      });
      return new Response("PAYTR notification failed: order not found", { status: 404 });
    }

    const [transaction] = await db
      .select({
        id: paytrTransactions.id,
        status: paytrTransactions.status
      })
      .from(paytrTransactions)
      .where(eq(paytrTransactions.merchantOid, payload.merchant_oid))
      .limit(1);
    const nextTransactionStatus =
      payload.status === "success" ? ("callback_success" as const) : ("callback_failed" as const);
    const nextOrderStatus =
      payload.status === "success" ? ("pending_confirmation" as const) : ("failed" as const);
    const nextPaymentStatus = payload.status === "success" ? "paid" : "failed";
    const isDuplicate =
      transaction?.status === nextTransactionStatus &&
      order.status === nextOrderStatus &&
      order.paymentStatus === nextPaymentStatus;

    if (isDuplicate) {
      logInfo("paytr.callback.duplicate_ignored", {
        merchantOid: payload.merchant_oid,
        status: payload.status,
        durationMs: durationSince(startedAt)
      });
      return new Response("OK");
    }

    await db.transaction(async (tx) => {
      const transactionValues = {
        totalAmountKurus: Number(payload.total_amount || payload.payment_amount || "0"),
        status: nextTransactionStatus,
        rawCallback: payload,
        updatedAt: new Date()
      };

      if (transaction) {
        await tx
          .update(paytrTransactions)
          .set(transactionValues)
          .where(eq(paytrTransactions.id, transaction.id));
      } else {
        await tx.insert(paytrTransactions).values({
          orderId: order.id,
          merchantOid: payload.merchant_oid,
          paymentAmountKurus: order.totalKurus,
          ...transactionValues
        });
      }

      await tx
        .update(orders)
        .set({
          status: nextOrderStatus,
          paymentStatus: nextPaymentStatus,
          paytrLastSyncedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(orders.id, order.id));

      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: nextOrderStatus,
        note:
          payload.status === "success"
            ? "PayTR callback ile odeme onayi alindi."
            : payload.failed_reason_msg || "PayTR callback odeme hatasi bildirdi."
      });
    });

    logInfo("paytr.callback.processed", {
      merchantOid: payload.merchant_oid,
      status: payload.status,
      orderStatus: nextOrderStatus,
      transactionStatus: nextTransactionStatus,
      durationMs: durationSince(startedAt)
    });

    return new Response("OK");
  } catch (error) {
    logError("paytr.callback.failed", error, {
      merchantOid: payload.merchant_oid,
      status: payload.status,
      durationMs: durationSince(startedAt)
    });

    return new Response("PAYTR notification failed: internal error", { status: 500 });
  }
}
