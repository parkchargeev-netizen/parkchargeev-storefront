import { and, eq, gte, sql } from "drizzle-orm";

import {
  type PaytrCallbackPayload,
  verifyPaytrCallbackHash,
  verifyPaytrLinkCallbackHash
} from "@/lib/paytr";
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

function getPaytrFailureStatusNote(payload: PaytrCallbackPayload) {
  const reasonCode = payload.failed_reason_code?.trim();
  const reasonMessage = payload.failed_reason_msg?.trim();

  if (reasonCode && reasonMessage) {
    return `PayTR odeme hatasi (${reasonCode}): ${reasonMessage}`;
  }

  if (reasonMessage) {
    return `PayTR odeme hatasi: ${reasonMessage}`;
  }

  if (reasonCode) {
    return `PayTR odeme hatasi kodu: ${reasonCode}`;
  }

  return "PayTR odeme hatasi bildirdi. Kart 3D Secure dogrulamasi veya banka onayi tamamlanamadi.";
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
    callback_id: String(formData.get("callback_id") ?? ""),
    merchant_id: String(formData.get("merchant_id") ?? ""),
    payment_type: String(formData.get("payment_type") ?? ""),
    currency: String(formData.get("currency") ?? ""),
    payment_amount: String(formData.get("payment_amount") ?? ""),
    failed_reason_code: String(formData.get("failed_reason_code") ?? ""),
    failed_reason_msg: String(formData.get("failed_reason_msg") ?? ""),
    installment_count: String(formData.get("installment_count") ?? ""),
    test_mode: String(formData.get("test_mode") ?? "")
  };
  const isLinkCallback = Boolean(payload.callback_id);
  const orderMerchantOid = payload.callback_id || payload.merchant_oid;

  try {
    const isHashValid = isLinkCallback
      ? verifyPaytrLinkCallbackHash(payload)
      : verifyPaytrCallbackHash(payload);

    if (!isHashValid) {
      logWarn("paytr.callback.bad_hash", {
        merchantOid: orderMerchantOid,
        providerMerchantOid: payload.merchant_oid,
        paymentFlow: isLinkCallback ? "link" : "iframe",
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
      .where(eq(orders.merchantOid, orderMerchantOid))
      .limit(1);

    if (!order) {
      logWarn("paytr.callback.order_not_found", {
        merchantOid: orderMerchantOid,
        providerMerchantOid: payload.merchant_oid,
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
      .where(eq(paytrTransactions.merchantOid, orderMerchantOid))
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
    const paytrFailureStatusNote =
      payload.status === "failed" ? getPaytrFailureStatusNote(payload) : null;

    if (
      isProcessedDuplicate({
        orderPaymentStatus: order.paymentStatus,
        payloadStatus: payload.status,
        transactionStatus: transaction?.status
      })
    ) {
      logInfo("paytr.callback.duplicate_ignored", {
        merchantOid: orderMerchantOid,
        providerMerchantOid: payload.merchant_oid,
        status: payload.status,
        durationMs: durationSince(startedAt)
      });
      return new Response("OK");
    }

    const paymentAmountKurus = parsePaytrKurus(payload.payment_amount);
    const totalAmountKurus = parsePaytrKurus(payload.total_amount);

    if (payload.status === "success") {
      const verifiedAmountKurus = paymentAmountKurus ?? totalAmountKurus;

      if (totalAmountKurus === null || verifiedAmountKurus === null) {
        logWarn("paytr.callback.invalid_amount", {
          merchantOid: orderMerchantOid,
          providerMerchantOid: payload.merchant_oid,
          paymentAmount: payload.payment_amount,
          totalAmount: payload.total_amount,
          durationMs: durationSince(startedAt)
        });
        return new Response("PAYTR notification failed: invalid amount", { status: 400 });
      }

      if (verifiedAmountKurus !== order.totalKurus) {
        logWarn("paytr.callback.amount_mismatch", {
          merchantOid: orderMerchantOid,
          providerMerchantOid: payload.merchant_oid,
          callbackPaymentAmountKurus: paymentAmountKurus,
          callbackTotalAmountKurus: totalAmountKurus,
          orderTotalKurus: order.totalKurus,
          durationMs: durationSince(startedAt)
        });
        return new Response("PAYTR notification failed: amount mismatch", { status: 400 });
      }

      const callbackCurrency = normalizePaytrCurrency(payload.currency);
      const orderCurrency = normalizePaytrCurrency(order.currency);

      if (callbackCurrency && orderCurrency && callbackCurrency !== orderCurrency) {
        logWarn("paytr.callback.currency_mismatch", {
          merchantOid: orderMerchantOid,
          providerMerchantOid: payload.merchant_oid,
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
          merchantOid: orderMerchantOid,
          paymentAmountKurus: paymentAmountKurus ?? order.totalKurus,
          ...transactionValues
        });
      }

      await tx
        .update(orders)
        .set({
          status: nextOrderStatus,
          paymentStatus: nextPaymentStatus,
          ...(stockWarningNote || paytrFailureStatusNote
            ? { statusNote: stockWarningNote ?? paytrFailureStatusNote }
            : {}),
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
              : paytrFailureStatusNote ?? "PayTR callback ödeme hatasi bildirdi."
        });
      }
    });

    logInfo("paytr.callback.processed", {
      merchantOid: orderMerchantOid,
      providerMerchantOid: payload.merchant_oid,
      paymentFlow: isLinkCallback ? "link" : "iframe",
      status: payload.status,
      orderStatus: nextOrderStatus,
      transactionStatus: nextTransactionStatus,
      durationMs: durationSince(startedAt)
    });

    return new Response("OK");
  } catch (error) {
    logError("paytr.callback.failed", error, {
      merchantOid: orderMerchantOid,
      providerMerchantOid: payload.merchant_oid,
      status: payload.status,
      durationMs: durationSince(startedAt)
    });

    return new Response("PAYTR notification failed: internal error", { status: 500 });
  }
}
