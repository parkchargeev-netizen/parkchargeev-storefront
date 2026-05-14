import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lt,
  or
} from "drizzle-orm";
import { z } from "zod";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { recordAuditLog } from "@/server/admin/audit";
import {
  getFallbackAdminOrderById,
  listFallbackAdminOrders,
  updateFallbackAdminOrder
} from "@/server/admin/fallback-store";
import type {
  adminListQuerySchema,
  adminOrderUpdateSchema,
  adminPaytrOperationSchema
} from "@/server/admin/validators";
import { getDb } from "@/server/db/client";
import {
  adminUsers,
  orderItems,
  orderStatusHistory,
  orders,
  paytrTransactions
} from "@/server/db/schema";
import type { AdminSessionPayload } from "@/server/auth/session";

type ListQueryInput = z.infer<typeof adminListQuerySchema>;
type OrderUpdateInput = z.infer<typeof adminOrderUpdateSchema>;
type PaytrOperationInput = z.infer<typeof adminPaytrOperationSchema>;

type CursorPayload = {
  updatedAt: string;
  id: string;
};

function encodeCursor(payload: CursorPayload) {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

function decodeCursor(cursor?: string) {
  if (!cursor) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf-8")
    ) as CursorPayload;
  } catch {
    return null;
  }
}

function parseFilterDate(value?: string, endOfDay = false) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (endOfDay && !value.includes("T")) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

export async function listAdminOrders(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return listFallbackAdminOrders(input);
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(
      or(
        ilike(orders.orderNumber, `%${input.q}%`),
        ilike(orders.customerName, `%${input.q}%`),
        ilike(orders.customerEmail, `%${input.q}%`)
      )
    );
  }

  if (input.status) {
    conditions.push(eq(orders.status, input.status as typeof orders.$inferSelect.status));
  }

  const fromDate = parseFilterDate(input.from);
  const toDate = parseFilterDate(input.to, true);

  if (fromDate) {
    conditions.push(gte(orders.createdAt, fromDate));
  }

  if (toDate) {
    conditions.push(lt(orders.createdAt, toDate));
  }

  if (cursor) {
    conditions.push(
      or(
        lt(orders.updatedAt, new Date(cursor.updatedAt)),
        and(eq(orders.updatedAt, new Date(cursor.updatedAt)), lt(orders.id, cursor.id))
      )
    );
  }

  const rows = await db
    .select()
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.updatedAt), desc(orders.id))
    .limit(input.limit + 1);

  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;
  const itemRows =
    items.length > 0
      ? await db
          .select()
          .from(orderItems)
          .where(inArray(orderItems.orderId, items.map((item) => item.id)))
      : [];

  return {
    items: items.map((item) => ({
      ...item,
      items: itemRows.filter((orderItem) => orderItem.orderId === item.id)
    })),
    nextCursor: hasMore
      ? encodeCursor({
          updatedAt: items.at(-1)?.updatedAt.toISOString() ?? new Date().toISOString(),
          id: items.at(-1)?.id ?? ""
        })
      : null
  };
}

export async function getAdminOrderById(id: string) {
  if (!hasDatabaseConfig()) {
    return getFallbackAdminOrderById(id);
  }

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  if (!order) {
    return null;
  }

  const [items, history, transaction] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db
      .select({
        id: orderStatusHistory.id,
        fromStatus: orderStatusHistory.fromStatus,
        toStatus: orderStatusHistory.toStatus,
        note: orderStatusHistory.note,
        createdAt: orderStatusHistory.createdAt,
        adminName: adminUsers.fullName
      })
      .from(orderStatusHistory)
      .leftJoin(adminUsers, eq(adminUsers.id, orderStatusHistory.adminUserId))
      .where(eq(orderStatusHistory.orderId, id))
      .orderBy(desc(orderStatusHistory.createdAt)),
    db
      .select()
      .from(paytrTransactions)
      .where(eq(paytrTransactions.orderId, id))
      .limit(1)
  ]);

  return {
    ...order,
    items,
    history,
    transaction: transaction[0] ?? null
  };
}

export async function updateAdminOrder(
  id: string,
  input: OrderUpdateInput,
  actor: AdminSessionPayload | null,
  requestMeta?: {
    ipAddress?: string | null;
    userAgent?: string | null;
  }
) {
  if (!hasDatabaseConfig()) {
    return updateFallbackAdminOrder(id, input, actor);
  }

  const db = getDb();
  const before = await getAdminOrderById(id);

  if (!before) {
    return null;
  }

  await db
    .update(orders)
    .set({
      status: input.status,
      paymentStatus:
        input.status === "cancelled" || input.status === "failed"
          ? "failed"
          : before.paymentStatus,
      statusNote: input.note || null,
      shippingCarrier: input.shippingCarrier || null,
      trackingNumber: input.trackingNumber || null,
      trackingUrl: input.trackingUrl || null,
      updatedAt: new Date()
    })
    .where(eq(orders.id, id));

  await db.insert(orderStatusHistory).values({
    orderId: id,
    adminUserId: actor?.sub ?? null,
    fromStatus: before.status,
    toStatus: input.status,
    note: input.note || null
  });

  const after = await getAdminOrderById(id);

  await recordAuditLog({
    db,
    actor,
    entityType: "order",
    entityId: id,
    action: "update",
    summary: `${before.orderNumber} siparisinin durumu guncellendi.`,
    beforePayload: before,
    afterPayload: after,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  return after;
}

export async function listAdminPaytrTransactions(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(
      or(
        ilike(paytrTransactions.merchantOid, `%${input.q}%`),
        ilike(orders.orderNumber, `%${input.q}%`),
        ilike(orders.customerEmail, `%${input.q}%`)
      )
    );
  }

  if (input.status) {
    conditions.push(eq(paytrTransactions.status, input.status as typeof paytrTransactions.$inferSelect.status));
  }

  const fromDate = parseFilterDate(input.from);
  const toDate = parseFilterDate(input.to, true);

  if (fromDate) {
    conditions.push(gte(paytrTransactions.createdAt, fromDate));
  }

  if (toDate) {
    conditions.push(lt(paytrTransactions.createdAt, toDate));
  }

  if (cursor) {
    conditions.push(
      or(
        lt(paytrTransactions.updatedAt, new Date(cursor.updatedAt)),
        and(
          eq(paytrTransactions.updatedAt, new Date(cursor.updatedAt)),
          lt(paytrTransactions.id, cursor.id)
        )
      )
    );
  }

  const rows = await db
    .select({
      id: paytrTransactions.id,
      orderId: paytrTransactions.orderId,
      merchantOid: paytrTransactions.merchantOid,
      paymentAmountKurus: paytrTransactions.paymentAmountKurus,
      totalAmountKurus: paytrTransactions.totalAmountKurus,
      status: paytrTransactions.status,
      rawRequest: paytrTransactions.rawRequest,
      rawCallback: paytrTransactions.rawCallback,
      createdAt: paytrTransactions.createdAt,
      updatedAt: paytrTransactions.updatedAt,
      orderNumber: orders.orderNumber,
      orderStatus: orders.status,
      paymentStatus: orders.paymentStatus,
      customerEmail: orders.customerEmail
    })
    .from(paytrTransactions)
    .leftJoin(orders, eq(orders.id, paytrTransactions.orderId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(paytrTransactions.updatedAt), desc(paytrTransactions.id))
    .limit(input.limit + 1);

  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;

  return {
    items,
    nextCursor: hasMore
      ? encodeCursor({
          updatedAt: items.at(-1)?.updatedAt.toISOString() ?? new Date().toISOString(),
          id: items.at(-1)?.id ?? ""
        })
      : null
  };
}

export async function runAdminPaytrOperation(
  transactionId: string,
  input: PaytrOperationInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const [transaction] = await db
    .select()
    .from(paytrTransactions)
    .where(eq(paytrTransactions.id, transactionId))
    .limit(1);

  if (!transaction) {
    return null;
  }

  const nextOrderValues =
    input.action === "mark_refunded"
      ? {
          status: "refunded" as const,
          paymentStatus: "refunded",
          statusNote: input.note || "Admin tarafindan iade olarak isaretlendi.",
          updatedAt: new Date()
        }
      : {
          status:
            transaction.status === "callback_success" ? ("pending_confirmation" as const) : ("failed" as const),
          paymentStatus: transaction.status === "callback_success" ? "paid" : "failed",
          statusNote: input.note || "PayTR islem durumuna gore manuel mutabakat yapildi.",
          updatedAt: new Date()
        };

  await db.update(orders).set(nextOrderValues).where(eq(orders.id, transaction.orderId));

  await db.insert(orderStatusHistory).values({
    orderId: transaction.orderId,
    adminUserId: actor?.sub ?? null,
    fromStatus: null,
    toStatus: nextOrderValues.status,
    note: nextOrderValues.statusNote
  });

  await recordAuditLog({
    db,
    actor,
    entityType: "paytr_transaction",
    entityId: transaction.id,
    action: input.action,
    summary: input.note || "PayTR operasyonu uygulandi.",
    beforePayload: transaction,
    afterPayload: nextOrderValues,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  return getAdminOrderById(transaction.orderId);
}
