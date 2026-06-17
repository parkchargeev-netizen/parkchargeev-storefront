import { and, eq, gte, sql } from "drizzle-orm";

import { type PaytrCallbackPayload, verifyPaytrCallbackHash } from "@/lib/paytr";
import { durationSince, logError, logInfo, logWarn } from "@/lib/server-logger";
import { getDb } from "@/server/db/client";
import {
  orderItems,
  orderStatusHistory,
  orders,
  paytrTransactions,
  productVariants
} from "@/server/db/schema";

function parsePaytrKurus(value?: string) {
  if (!value) {
    return null;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount);
}

function normalizePaytrCurrency(value?: string | null) {
  const currency = value?.trim().toUpperCase();

  if (!currency) {
    return null;
  }

  return currency === "TL" ? "TRY" : currency;
}

function isProcessedDuplicate({
  orderPaymentStatus,
  payloadStatus,
  transactionStatus
}: {
  orderPaymentStatus: string;
  payloadStatus: "success" | "failed";
  transactionStatus?: string | null;
}) {
  if (transactionStatus === "callback_success") {
    return true;
  }

  if (transactionStatus === "callback_failed" && payloadStatus === "failed") {
    return true;
  }

  return orderPaymentStatus === "paid";
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const formData = await request.formData();
  const rawStatus = String(formData.get("status") ?? "");

  if (rawStatus !== "success" && rawStatus !== "failed") {
    logWarn("paytr.callback.invalid_status", {
      merchantOid: String(formData.get("merchant_oid") ?? ""),
      status: rawStatus,
      durationMs: durationSince(startedAt)
    });
    return new Response("PAYTR notification failed: invalid status", { status: 400 });
  }

  const status: PaytrCallbackPayload["status"] = rawStatus;
  const payload: PaytrCallbackPayload = {
    merchant_oid: String(formData.get("merchant_oid") ?? ""),
    status,
    total_amount: String(formData.get("total_amount") ?? ""),
    hash: String(formData.get("hash") ?? ""),
    payment_type: String(formData.get("payment_type") ?? ""),
    currency: String(formData.get("currency") ?? ""),
    payment_amount: String(formData.get("payment_amount") ?? ""),
    failed_reason_code: String(formData.get("failed_reason_code") ?? ""),
    failed_reason_msg: String(formData.get("failed_reason_msg") ?? ""),
    installment_count: String(formData.get("installment_count") ?? ""),
    test_mode: String(formData.get("test_mode") ?? "")
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
        currency: orders.currency,
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
      payload.status === "success"
        ? order.paymentStatus === "paid"
          ? order.status
          : ("pending_confirmation" as const)
        : ("failed" as const);
    const nextPaymentStatus = payload.status === "success" ? "paid" : "failed";

    if (
      isProcessedDuplicate({
        orderPaymentStatus: order.paymentStatus,
        payloadStatus: payload.status,
        transactionStatus: transaction?.status
      })
    ) {
      logInfo("paytr.callback.duplicate_ignored", {
        merchantOid: payload.merchant_oid,
        status: payload.status,
        durationMs: durationSince(startedAt)
      });
      return new Response("OK");
    }

    const paymentAmountKurus = parsePaytrKurus(payload.payment_amount);
    const totalAmountKurus = parsePaytrKurus(payload.total_amount);

    if (payload.status === "success") {
      if (totalAmountKurus === null) {
        logWarn("paytr.callback.invalid_amount", {
          merchantOid: payload.merchant_oid,
          paymentAmount: payload.payment_amount,
          totalAmount: payload.total_amount,
          durationMs: durationSince(startedAt)
        });
        return new Response("PAYTR notification failed: invalid amount", { status: 400 });
      }

      if (totalAmountKurus !== order.totalKurus) {
        logWarn("paytr.callback.amount_mismatch", {
          merchantOid: payload.merchant_oid,
          callbackPaymentAmountKurus: paymentAmountKurus,
          callbackTotalAmountKurus: totalAmountKurus,
          orderTotalKurus: order.totalKurus,
          durationMs: durationSince(startedAt)
        });
        return new Response("PAYTR notification failed: amount mismatch", { status: 400 });
      }

      const callbackCurrency = normalizePaytrCurrency(payload.currency);
      const orderCurrency = normalizePaytrCurrency(order.currency);

      if (!callbackCurrency || callbackCurrency !== orderCurrency) {
        logWarn("paytr.callback.currency_mismatch", {
          merchantOid: payload.merchant_oid,
          callbackCurrency: payload.currency,
          orderCurrency: order.currency,
          durationMs: durationSince(startedAt)
        });
        return new Response("PAYTR notification failed: currency mismatch", { status: 400 });
      }
    }

    await db.transaction(async (tx) => {
      let stockWarningNote: string | null = null;

      if (payload.status === "success") {
        const purchasedItems = await tx
          .select({
            variantId: orderItems.variantId,
            quantity: orderItems.quantity
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        for (const item of purchasedItems) {
          if (!item.variantId) {
            continue;
          }

          const [updatedVariant] = await tx
            .update(productVariants)
            .set({
              stockQuantity: sql`${productVariants.stockQuantity} - ${item.quantity}`
            })
            .where(
              and(
                eq(productVariants.id, item.variantId),
                gte(productVariants.stockQuantity, item.quantity)
              )
            )
            .returning({ id: productVariants.id });

          if (!updatedVariant) {
            stockWarningNote =
              "Ödeme alındı; stok azaltımı yapılamadı. Manuel stok ve teslimat kontrolü gerekli.";
          }
        }
      }

      const transactionValues = {
        totalAmountKurus: totalAmountKurus ?? paymentAmountKurus ?? 0,
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
          paymentAmountKurus: paymentAmountKurus ?? order.totalKurus,
          ...transactionValues
        });
      }

      await tx
        .update(orders)
        .set({
          status: nextOrderStatus,
          paymentStatus: nextPaymentStatus,
          ...(stockWarningNote ? { statusNote: stockWarningNote } : {}),
          paytrLastSyncedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(orders.id, order.id));

      if (order.status !== nextOrderStatus || order.paymentStatus !== nextPaymentStatus) {
        await tx.insert(orderStatusHistory).values({
          orderId: order.id,
          fromStatus: order.status,
          toStatus: nextOrderStatus,
          note:
            payload.status === "success"
              ? stockWarningNote ?? "PayTR callback ile ödeme onayı alındı."
              : payload.failed_reason_msg || "PayTR callback ödeme hatasi bildirdi."
        });
      }
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
