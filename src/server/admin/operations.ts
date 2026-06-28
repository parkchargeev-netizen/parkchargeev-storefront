import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  or,
  sql
} from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { slugify } from "@/lib/slug";
import { hasDatabaseConfig } from "@/lib/runtime-config";
import { recordAuditLog } from "@/server/admin/audit";
import type {
  adminBannerSchema,
  adminCampaignSchema,
  adminInventoryAdjustmentSchema,
  adminListQuerySchema,
  adminMerchandisingSlotSchema,
  adminNotificationPatchSchema
} from "@/server/admin/validators";
import type { AdminSessionPayload } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import {
  adminNotifications,
  auditLogs,
  banners,
  campaignCategories,
  campaignProducts,
  campaigns,
  categories,
  inventoryMovements,
  orderItems,
  orders,
  paytrTransactions,
  productCategoryAssignments,
  productVariants,
  products,
  merchandisingSlots
} from "@/server/db/schema";

type ListQueryInput = z.infer<typeof adminListQuerySchema>;
type InventoryAdjustmentInput = z.infer<typeof adminInventoryAdjustmentSchema>;
type NotificationPatchInput = z.infer<typeof adminNotificationPatchSchema>;
type BannerInput = z.infer<typeof adminBannerSchema>;
type CampaignInput = z.infer<typeof adminCampaignSchema>;
type MerchandisingSlotInput = z.infer<typeof adminMerchandisingSlotSchema>;
type ListResult<T> = { items: T[]; nextCursor: string | null };

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
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as CursorPayload;
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

function getDateConditions(column: Parameters<typeof gte>[0], input: ListQueryInput) {
  const conditions = [];
  const fromDate = parseFilterDate(input.from);
  const toDate = parseFilterDate(input.to, true);

  if (fromDate) {
    conditions.push(gte(column, fromDate));
  }

  if (toDate) {
    conditions.push(lt(column, toDate));
  }

  return conditions;
}

function revalidateCommerceAdmin() {
  revalidateTag("admin-dashboard");
  revalidateTag("public-products");
  revalidatePath("/");
  revalidatePath("/magaza");
  revalidatePath("/admin");
}

export async function createAdminNotification(input: {
  title: string;
  body: string;
  tone?: string;
  href?: string | null;
  entityType?: string | null;
  entityId?: string | null;
}) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const [row] = await db
    .insert(adminNotifications)
    .values({
      title: input.title,
      body: input.body,
      tone: input.tone ?? "info",
      href: input.href ?? null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null
    })
    .returning();

  return row;
}

export async function listAdminNotifications(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null, unreadCount: 0 };
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(or(ilike(adminNotifications.title, `%${input.q}%`), ilike(adminNotifications.body, `%${input.q}%`)));
  }

  if (input.status === "read") {
    conditions.push(eq(adminNotifications.isRead, true));
  }

  if (input.status === "unread") {
    conditions.push(eq(adminNotifications.isRead, false));
  }

  conditions.push(...getDateConditions(adminNotifications.createdAt, input));

  if (cursor) {
    conditions.push(
      or(
        lt(adminNotifications.createdAt, new Date(cursor.updatedAt)),
        and(
          eq(adminNotifications.createdAt, new Date(cursor.updatedAt)),
          lt(adminNotifications.id, cursor.id)
        )
      )
    );
  }

  const [unread] = await db
    .select({ total: count() })
    .from(adminNotifications)
    .where(eq(adminNotifications.isRead, false));
  const rows = await db
    .select()
    .from(adminNotifications)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(adminNotifications.createdAt), desc(adminNotifications.id))
    .limit(input.limit + 1);
  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;

  return {
    items,
    unreadCount: Number(unread?.total ?? 0),
    nextCursor: hasMore
      ? encodeCursor({
          updatedAt: items.at(-1)?.createdAt.toISOString() ?? new Date().toISOString(),
          id: items.at(-1)?.id ?? ""
        })
      : null
  };
}

export async function updateAdminNotifications(
  input: NotificationPatchInput,
  actor: AdminSessionPayload | null
) {
  if (!hasDatabaseConfig()) {
    return { updatedCount: input.ids.length };
  }

  const db = getDb();
  await db
    .update(adminNotifications)
    .set({ isRead: input.isRead, readAt: input.isRead ? new Date() : null })
    .where(inArray(adminNotifications.id, input.ids));

  await recordAuditLog({
    db,
    actor,
    entityType: "admin_notification",
    entityId: input.ids.join(","),
    action: "bulk_update",
    summary: `${input.ids.length} bildirim ${input.isRead ? "okundu" : "okunmadı"} olarak işaretlendi.`
  });

  return { updatedCount: input.ids.length };
}

export async function listInventoryMovements(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(or(ilike(inventoryMovements.sku, `%${input.q}%`), ilike(inventoryMovements.reason, `%${input.q}%`)));
  }

  if (input.status) {
    conditions.push(eq(inventoryMovements.reason, input.status));
  }

  conditions.push(...getDateConditions(inventoryMovements.createdAt, input));

  if (cursor) {
    conditions.push(
      or(
        lt(inventoryMovements.createdAt, new Date(cursor.updatedAt)),
        and(
          eq(inventoryMovements.createdAt, new Date(cursor.updatedAt)),
          lt(inventoryMovements.id, cursor.id)
        )
      )
    );
  }

  const rows = await db
    .select({
      id: inventoryMovements.id,
      productId: inventoryMovements.productId,
      variantId: inventoryMovements.variantId,
      sku: inventoryMovements.sku,
      quantityBefore: inventoryMovements.quantityBefore,
      quantityAfter: inventoryMovements.quantityAfter,
      quantityDelta: inventoryMovements.quantityDelta,
      reason: inventoryMovements.reason,
      note: inventoryMovements.note,
      orderId: inventoryMovements.orderId,
      createdAt: inventoryMovements.createdAt,
      productName: products.name
    })
    .from(inventoryMovements)
    .leftJoin(products, eq(products.id, inventoryMovements.productId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(inventoryMovements.createdAt), desc(inventoryMovements.id))
    .limit(input.limit + 1);
  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;

  return {
    items,
    nextCursor: hasMore
      ? encodeCursor({
          updatedAt: items.at(-1)?.createdAt.toISOString() ?? new Date().toISOString(),
          id: items.at(-1)?.id ?? ""
        })
      : null
  };
}

export async function adjustInventory(
  input: InventoryAdjustmentInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const [variant] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, input.variantId))
    .limit(1);

  if (!variant) {
    return null;
  }

  await db
    .update(productVariants)
    .set({ stockQuantity: input.quantityAfter })
    .where(eq(productVariants.id, input.variantId));

  const movementValues = {
    productId: variant.productId,
    variantId: variant.id,
    sku: variant.sku,
    quantityBefore: variant.stockQuantity,
    quantityAfter: input.quantityAfter,
    quantityDelta: input.quantityAfter - variant.stockQuantity,
    reason: "manual_adjustment",
    note: input.note || null,
    adminUserId: actor?.sub ?? null
  };
  const [movement] = await db.insert(inventoryMovements).values(movementValues).returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "inventory",
    entityId: variant.id,
    action: "manual_adjustment",
    summary: `${variant.sku} stok değeri ${variant.stockQuantity} -> ${input.quantityAfter} güncellendi.`,
    beforePayload: variant,
    afterPayload: movementValues,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateCommerceAdmin();
  return movement;
}

export async function listAdminBanners(
  input: ListQueryInput
): Promise<ListResult<InferSelectModel<typeof banners>>> {
  return listSimpleContentRows(banners, input) as Promise<
    ListResult<InferSelectModel<typeof banners>>
  >;
}

export async function upsertAdminBanner(
  input: BannerInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  return upsertSimpleContentRow("banner", banners, input, actor, requestMeta);
}

export async function archiveAdminBanner(
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  return archiveSimpleContentRow("banner", banners, id, actor, requestMeta);
}

export async function deleteAdminBanner(
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  return deleteSimpleContentRow("banner", banners, id, actor, requestMeta);
}

export async function listAdminCampaigns(
  input: ListQueryInput
): Promise<ListResult<InferSelectModel<typeof campaigns>>> {
  return listSimpleContentRows(campaigns, input) as Promise<
    ListResult<InferSelectModel<typeof campaigns>>
  >;
}

export async function upsertAdminCampaign(
  input: CampaignInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const slug = slugify(input.slug || input.name);
  const values = {
    name: input.name,
    slug,
    description: input.description || null,
    status: input.status,
    discountType: input.discountType,
    discountValue: input.discountValue,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
    updatedAt: new Date()
  };
  const [before] = input.id
    ? await db.select().from(campaigns).where(eq(campaigns.id, input.id)).limit(1)
    : [];
  const [row] = input.id
    ? await db.update(campaigns).set(values).where(eq(campaigns.id, input.id)).returning()
    : await db.insert(campaigns).values(values).returning();

  await db.delete(campaignProducts).where(eq(campaignProducts.campaignId, row.id));
  await db.delete(campaignCategories).where(eq(campaignCategories.campaignId, row.id));

  if (input.productIds.length > 0) {
    await db
      .insert(campaignProducts)
      .values(input.productIds.map((productId) => ({ campaignId: row.id, productId })))
      .onConflictDoNothing();
  }

  if (input.categoryIds.length > 0) {
    await db
      .insert(campaignCategories)
      .values(input.categoryIds.map((categoryId) => ({ campaignId: row.id, categoryId })))
      .onConflictDoNothing();
  }

  await recordAuditLog({
    db,
    actor,
    entityType: "campaign",
    entityId: row.id,
    action: before ? "update" : "create",
    summary: `${input.name} kampanyası kaydedildi.`,
    beforePayload: before ?? null,
    afterPayload: row,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateCommerceAdmin();
  return row;
}

export async function archiveAdminCampaign(
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  return archiveSimpleContentRow("campaign", campaigns, id, actor, requestMeta);
}

export async function deleteAdminCampaign(
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return { deletedCount: 0 };
  }

  const db = getDb();
  const [before] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);

  if (!before) {
    return { deletedCount: 0 };
  }

  await db.delete(campaignProducts).where(eq(campaignProducts.campaignId, id));
  await db.delete(campaignCategories).where(eq(campaignCategories.campaignId, id));
  await db.delete(campaigns).where(eq(campaigns.id, id));

  await recordAuditLog({
    db,
    actor,
    entityType: "campaign",
    entityId: id,
    action: "delete",
    summary: `${before.name} kampanyası kalıcı olarak silindi.`,
    beforePayload: before,
    afterPayload: null,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateCommerceAdmin();
  return { deletedCount: 1 };
}

export async function listAdminMerchandisingSlots(
  input: ListQueryInput
): Promise<ListResult<InferSelectModel<typeof merchandisingSlots>>> {
  return listSimpleContentRows(merchandisingSlots, input) as Promise<
    ListResult<InferSelectModel<typeof merchandisingSlots>>
  >;
}

export async function upsertAdminMerchandisingSlot(
  input: MerchandisingSlotInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const values = {
    slotKey: input.slotKey,
    title: input.title || null,
    productId: input.productId || null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
    updatedAt: new Date()
  };
  const [before] = input.id
    ? await db.select().from(merchandisingSlots).where(eq(merchandisingSlots.id, input.id)).limit(1)
    : [];
  const [row] = input.id
    ? await db.update(merchandisingSlots).set(values).where(eq(merchandisingSlots.id, input.id)).returning()
    : await db.insert(merchandisingSlots).values(values).returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "merchandising_slot",
    entityId: row.id,
    action: before ? "update" : "create",
    summary: `${input.slotKey} vitrin slotu kaydedildi.`,
    beforePayload: before ?? null,
    afterPayload: row,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateCommerceAdmin();
  return row;
}

export async function archiveAdminMerchandisingSlot(
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return { updatedCount: 0 };
  }

  const db = getDb();
  const [before] = await db
    .select()
    .from(merchandisingSlots)
    .where(eq(merchandisingSlots.id, id))
    .limit(1);

  if (!before) {
    return { updatedCount: 0 };
  }

  const [row] = await db
    .update(merchandisingSlots)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(merchandisingSlots.id, id))
    .returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "merchandising_slot",
    entityId: id,
    action: "archive",
    summary: `${before.slotKey} vitrin slotu pasife alindi.`,
    beforePayload: before,
    afterPayload: row,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateCommerceAdmin();
  return { updatedCount: 1 };
}

export async function deleteAdminMerchandisingSlot(
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  return deleteSimpleContentRow("merchandising_slot", merchandisingSlots, id, actor, requestMeta);
}

type SimpleContentTable = typeof banners | typeof campaigns | typeof merchandisingSlots;

async function listSimpleContentRows(table: SimpleContentTable, input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if ("deletedAt" in table) {
    conditions.push(isNull(table.deletedAt));
  }

  if (input.q && "title" in table) {
    conditions.push(ilike(table.title, `%${input.q}%`));
  }

  if (input.q && "name" in table) {
    conditions.push(ilike(table.name, `%${input.q}%`));
  }

  if (input.status && "status" in table) {
    conditions.push(eq(table.status, input.status));
  }

  conditions.push(...getDateConditions(table.createdAt, input));

  if (cursor) {
    conditions.push(
      or(
        lt(table.createdAt, new Date(cursor.updatedAt)),
        and(eq(table.createdAt, new Date(cursor.updatedAt)), lt(table.id, cursor.id))
      )
    );
  }

  const rows = await db
    .select()
    .from(table)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(table.createdAt), desc(table.id))
    .limit(input.limit + 1);
  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;

  return {
    items,
    nextCursor: hasMore
      ? encodeCursor({
          updatedAt: items.at(-1)?.createdAt.toISOString() ?? new Date().toISOString(),
          id: items.at(-1)?.id ?? ""
        })
      : null
  };
}

async function upsertSimpleContentRow(
  entityType: string,
  table: typeof banners,
  input: BannerInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const values = {
    placement: input.placement,
    title: input.title,
    subtitle: input.subtitle || null,
    imageUrl: input.imageUrl || null,
    ctaLabel: input.ctaLabel || null,
    ctaHref: input.ctaHref || null,
    status: input.status,
    sortOrder: input.sortOrder,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
    updatedAt: new Date()
  };
  const [before] = input.id
    ? await db.select().from(table).where(eq(table.id, input.id)).limit(1)
    : [];
  const [row] = input.id
    ? await db.update(table).set(values).where(eq(table.id, input.id)).returning()
    : await db.insert(table).values(values).returning();

  await recordAuditLog({
    db,
    actor,
    entityType,
    entityId: row.id,
    action: before ? "update" : "create",
    summary: `${input.title} kaydedildi.`,
    beforePayload: before ?? null,
    afterPayload: row,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateCommerceAdmin();
  return row;
}

async function archiveSimpleContentRow(
  entityType: string,
  table: typeof banners | typeof campaigns,
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return { updatedCount: 0 };
  }

  const db = getDb();
  const [before] = await db.select().from(table).where(eq(table.id, id)).limit(1);

  if (!before) {
    return { updatedCount: 0 };
  }

  const [row] = await db
    .update(table)
    .set({ status: "archived", deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(table.id, id))
    .returning();

  await recordAuditLog({
    db,
    actor,
    entityType,
    entityId: id,
    action: "archive",
    summary: `${entityType} arşivlendi.`,
    beforePayload: before,
    afterPayload: row,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateCommerceAdmin();
  return { updatedCount: 1 };
}

async function deleteSimpleContentRow(
  entityType: string,
  table: SimpleContentTable,
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return { deletedCount: 0 };
  }

  const db = getDb();
  const [before] = await db.select().from(table).where(eq(table.id, id)).limit(1);

  if (!before) {
    return { deletedCount: 0 };
  }

  await db.delete(table).where(eq(table.id, id));

  await recordAuditLog({
    db,
    actor,
    entityType,
    entityId: id,
    action: "delete",
    summary: `${entityType} kalıcı olarak silindi.`,
    beforePayload: before,
    afterPayload: null,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateCommerceAdmin();
  return { deletedCount: 1 };
}

function riskLevel(score: number) {
  if (score >= 80) return "kritik";
  if (score >= 60) return "yüksek";
  if (score >= 35) return "orta";
  return "düşük";
}

export async function getAdminRiskSnapshot() {
  if (!hasDatabaseConfig()) {
    return { score: 0, level: "düşük", items: [] };
  }

  const db = getDb();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const [lowStock] = await db.execute(sql`
    select count(*)::int as total
    from ${productVariants}
    where ${productVariants.stockQuantity} <= 3
  `);
  const [outStock] = await db.execute(sql`
    select count(*)::int as total
    from ${productVariants}
    where ${productVariants.stockQuantity} <= 0
  `);
  const [paymentFailures] = await db
    .select({ total: count() })
    .from(paytrTransactions)
    .where(and(eq(paytrTransactions.status, "callback_failed"), gte(paytrTransactions.updatedAt, sevenDaysAgo)));
  const [delayedOrders] = await db
    .select({ total: count() })
    .from(orders)
    .where(
      and(
        inArray(orders.status, ["paid", "confirmed", "pending_confirmation"]),
        lt(orders.updatedAt, twoDaysAgo)
      )
    );
  const [cancelledOrders] = await db
    .select({ total: count() })
    .from(orders)
    .where(and(inArray(orders.status, ["cancelled", "refunded", "failed"]), gte(orders.updatedAt, sevenDaysAgo)));
  const [securityEvents] = await db
    .select({ total: count() })
    .from(auditLogs)
    .where(and(inArray(auditLogs.action, ["login_failed", "forbidden", "unauthorized"]), gte(auditLogs.createdAt, sevenDaysAgo)));
  const [incompleteProducts] = await db
    .select({ total: count() })
    .from(products)
    .where(or(eq(products.shortDescription, ""), eq(products.description, ""), isNull(products.defaultPriceKurus)));

  const items = [
    {
      key: "low_stock",
      label: "Düşük stok riski",
      score: Math.min(100, Number(lowStock?.total ?? 0) * 12 + Number(outStock?.total ?? 0) * 20),
      description: "Kritik seviyeye inen veya tükenen varyantları gösterir.",
      action: "Stokları yenile veya ürünü pasife al.",
      href: "/admin/urunler?stock=low"
    },
    {
      key: "payment_failure",
      label: "Ödeme hatası riski",
      score: Math.min(100, Number(paymentFailures?.total ?? 0) * 18),
      description: "Son 7 gündeki başarısız PayTR callback kayıtlarını izler.",
      action: "PayTR kayıtlarını ve sipariş ödeme durumlarını kontrol et.",
      href: "/admin/paytr?status=callback_failed"
    },
    {
      key: "order_delay",
      label: "Sipariş gecikme riski",
      score: Math.min(100, Number(delayedOrders?.total ?? 0) * 16),
      description: "Onaylı fakat iki gündür hareket etmeyen siparişleri izler.",
      action: "Kargo ve operasyon durumunu güncelle.",
      href: "/admin/siparisler"
    },
    {
      key: "returns",
      label: "İptal / iade riski",
      score: Math.min(100, Number(cancelledOrders?.total ?? 0) * 14),
      description: "Son 7 gündeki iptal, iade ve başarısız siparişleri takip eder.",
      action: "İptal nedenlerini denetle ve ürün açıklamalarını iyileştir.",
      href: "/admin/siparisler?status=cancelled"
    },
    {
      key: "security",
      label: "Güvenlik riski",
      score: Math.min(100, Number(securityEvents?.total ?? 0) * 20),
      description: "Yetkisiz erişim ve başarısız giriş sinyallerini takip eder.",
      action: "Audit log ve admin oturumlarını denetle.",
      href: "/admin/audit"
    },
    {
      key: "product_quality",
      label: "Eksik ürün bilgisi riski",
      score: Math.min(100, Number(incompleteProducts?.total ?? 0) * 15),
      description: "Fiyatı, açıklaması veya temel bilgisi eksik ürünleri işaretler.",
      action: "Ürünleri düzenle ve yayın kontrol listesini tamamla.",
      href: "/admin/urunler?status=draft"
    }
  ].map((item) => ({
    ...item,
    level: riskLevel(item.score)
  }));
  const score = Math.round(items.reduce((sum, item) => sum + item.score, 0) / items.length);

  return {
    score,
    level: riskLevel(score),
    items
  };
}
