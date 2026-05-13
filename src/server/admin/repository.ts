import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lt,
  or,
  sql
} from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { slugify } from "@/lib/slug";
import { getDb } from "@/server/db/client";
import type { AdminSessionPayload } from "@/server/auth/session";
import { hashPassword } from "@/server/auth/password";
import { recordAuditLog } from "@/server/admin/audit";
import {
  productCategoryOptions,
  quoteStatusOptions
} from "@/server/admin/constants";
import {
  getFallbackAdminDashboardSnapshot,
  getFallbackAdminOrderById,
  getFallbackAdminProductById,
  getFallbackAdminQuoteById,
  getFallbackProductLookupOptions,
  listFallbackAdminOrders,
  listFallbackAdminProducts,
  listFallbackAdminQuotes,
  updateFallbackAdminOrder,
  updateFallbackAdminQuote,
  upsertFallbackAdminProduct
} from "@/server/admin/fallback-store";
import type {
  adminBlogPostSchema,
  adminBrandSchema,
  adminCategorySchema,
  adminListQuerySchema,
  adminOrderUpdateSchema,
  adminPaytrOperationSchema,
  adminProductSchema,
  adminQuoteUpdateSchema,
  adminServiceLeadUpdateSchema,
  adminUserSchema
} from "@/server/admin/validators";
import {
  adminSessions,
  adminUsers,
  auditLogs,
  blogPosts,
  brands,
  cartItems,
  categories,
  customers,
  orderItems,
  orderStatusHistory,
  orders,
  paytrTransactions,
  productCategoryAssignments,
  productMedia,
  productRelations,
  productSpecs,
  productTagAssignments,
  productVehicleCompatibilities,
  productVariants,
  products,
  quoteActivities,
  quoteRequests,
  serviceLeads
} from "@/server/db/schema";

type ProductInput = z.infer<typeof adminProductSchema>;
type OrderUpdateInput = z.infer<typeof adminOrderUpdateSchema>;
type QuoteUpdateInput = z.infer<typeof adminQuoteUpdateSchema>;
type ListQueryInput = z.infer<typeof adminListQuerySchema>;
type AdminUserInput = z.infer<typeof adminUserSchema>;
type BlogPostInput = z.infer<typeof adminBlogPostSchema>;
type ServiceLeadUpdateInput = z.infer<typeof adminServiceLeadUpdateSchema>;
type BrandInput = z.infer<typeof adminBrandSchema>;
type CategoryInput = z.infer<typeof adminCategorySchema>;
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

const revenueStatuses = [
  "paid",
  "confirmed",
  "shipped",
  "delivered",
  "fulfilled"
] as const;
const pendingOrderStatuses = [
  "pending_payment",
  "payment_processing",
  "pending_confirmation"
] as const;
const openQuoteStatuses = quoteStatusOptions
  .map((option) => option.value)
  .filter((value) => value !== "won" && value !== "lost");

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date) {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

function buildProductSchemaJsonLd(input: ProductInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    sku: input.sku,
    description: input.shortDescription,
    category: input.categories.join(", "),
    image: input.media.map((item) => item.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: (input.priceKurus / 100).toFixed(2),
      availability:
        input.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock"
    }
  };
}

function normalizeProductVariants(input: ProductInput) {
  const variants =
    input.variants.length > 0
      ? input.variants
      : [
          {
            sku: input.sku,
            title: input.variantTitle,
            powerLabel: input.powerLabel,
            cableLength: input.cableLength,
            connectorType: input.connectorType,
            stockQuantity: input.stockQuantity,
            priceKurus: input.priceKurus,
            compareAtKurus: input.compareAtKurus,
            isDefault: true
          }
        ];

  const hasDefault = variants.some((variant) => variant.isDefault);
  let defaultSeen = false;

  return variants.map((variant, index) => {
    const isDefault = hasDefault ? variant.isDefault && !defaultSeen : index === 0;

    if (isDefault) {
      defaultSeen = true;
    }

    return {
      ...variant,
      isDefault
    };
  });
}

async function writeProductVariants(productId: string, input: ProductInput) {
  const db = getDb();
  const variants = normalizeProductVariants(input);
  const existing = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
  const existingIds = new Set(existing.map((variant) => variant.id));
  const incomingIds = new Set(variants.map((variant) => variant.id).filter(Boolean));

  for (const variant of variants) {
    const values = {
      productId,
      sku: variant.sku,
      title: variant.title,
      powerLabel: variant.powerLabel || null,
      cableLength: variant.cableLength || null,
      connectorType: variant.connectorType || null,
      stockQuantity: variant.stockQuantity,
      priceKurus: variant.priceKurus,
      compareAtKurus: variant.compareAtKurus ?? null,
      isDefault: variant.isDefault
    };

    if (variant.id && existingIds.has(variant.id)) {
      await db
        .update(productVariants)
        .set(values)
        .where(and(eq(productVariants.id, variant.id), eq(productVariants.productId, productId)));
      continue;
    }

    await db.insert(productVariants).values(values);
  }

  const removableIds = existing
    .map((variant) => variant.id)
    .filter((id) => !incomingIds.has(id));

  for (const id of removableIds) {
    const [orderReference] = await db
      .select({ total: count() })
      .from(orderItems)
      .where(eq(orderItems.variantId, id));
    const [cartReference] = await db
      .select({ total: count() })
      .from(cartItems)
      .where(eq(cartItems.variantId, id));

    if (Number(orderReference?.total ?? 0) === 0 && Number(cartReference?.total ?? 0) === 0) {
      await db.delete(productVariants).where(eq(productVariants.id, id));
    } else {
      await db
        .update(productVariants)
        .set({ isDefault: false, stockQuantity: 0 })
        .where(eq(productVariants.id, id));
    }
  }
}

async function ensureDefaultCategories() {
  const db = getDb();

  await db
    .insert(categories)
    .values(
      productCategoryOptions.map((item) => ({
        name: item.label,
        slug: item.slug,
        description: `${item.label} kategori kaydi`
      }))
    )
    .onConflictDoNothing();
}

async function resolveCategoryIds(categorySlugs: string[]) {
  await ensureDefaultCategories();
  const db = getDb();
  const rows = await db
    .select({
      id: categories.id,
      slug: categories.slug
    })
    .from(categories)
    .where(inArray(categories.slug, categorySlugs));

  return rows;
}

async function hydrateProductCollections(productIds: string[]) {
  const db = getDb();

  if (productIds.length === 0) {
    return {
      variants: new Map<string, (typeof productVariants.$inferSelect)[]>(),
      media: new Map<string, (typeof productMedia.$inferSelect)[]>(),
      specs: new Map<string, (typeof productSpecs.$inferSelect)[]>(),
      tags: new Map<string, string[]>(),
      categories: new Map<string, string[]>(),
      vehicles: new Map<string, string[]>(),
      relations: new Map<string, Array<{ id: string; type: string }>>()
    };
  }

  const [variantsRows, mediaRows, specRows, tagRows, categoryRows, vehicleRows, relationRows] =
    await Promise.all([
      db
        .select()
        .from(productVariants)
        .where(inArray(productVariants.productId, productIds)),
      db
        .select()
        .from(productMedia)
        .where(inArray(productMedia.productId, productIds)),
      db
        .select()
        .from(productSpecs)
        .where(inArray(productSpecs.productId, productIds)),
      db
        .select()
        .from(productTagAssignments)
        .where(inArray(productTagAssignments.productId, productIds)),
      db
        .select({
          productId: productCategoryAssignments.productId,
          slug: categories.slug
        })
        .from(productCategoryAssignments)
        .innerJoin(categories, eq(categories.id, productCategoryAssignments.categoryId))
        .where(inArray(productCategoryAssignments.productId, productIds)),
      db
        .select()
        .from(productVehicleCompatibilities)
        .where(inArray(productVehicleCompatibilities.productId, productIds)),
      db
        .select()
        .from(productRelations)
        .where(inArray(productRelations.productId, productIds))
    ]);

  const variants = new Map<string, (typeof productVariants.$inferSelect)[]>();
  const media = new Map<string, (typeof productMedia.$inferSelect)[]>();
  const specs = new Map<string, (typeof productSpecs.$inferSelect)[]>();
  const tags = new Map<string, string[]>();
  const categoriesMap = new Map<string, string[]>();
  const vehicles = new Map<string, string[]>();
  const relations = new Map<string, Array<{ id: string; type: string }>>();

  for (const row of variantsRows) {
    variants.set(row.productId, [...(variants.get(row.productId) ?? []), row]);
  }

  for (const row of mediaRows) {
    media.set(row.productId, [...(media.get(row.productId) ?? []), row]);
  }

  for (const row of specRows) {
    specs.set(row.productId, [...(specs.get(row.productId) ?? []), row]);
  }

  for (const row of tagRows) {
    tags.set(row.productId, [...(tags.get(row.productId) ?? []), row.tag]);
  }

  for (const row of categoryRows) {
    categoriesMap.set(row.productId, [
      ...(categoriesMap.get(row.productId) ?? []),
      row.slug
    ]);
  }

  for (const row of vehicleRows) {
    vehicles.set(row.productId, [
      ...(vehicles.get(row.productId) ?? []),
      row.vehicleBrand
    ]);
  }

  for (const row of relationRows) {
    relations.set(row.productId, [
      ...(relations.get(row.productId) ?? []),
      { id: row.relatedProductId, type: row.relationType }
    ]);
  }

  return {
    variants,
    media,
    specs,
    tags,
    categories: categoriesMap,
    vehicles,
    relations
  };
}

async function writeProductCollections(
  productId: string,
  input: ProductInput,
  actor: AdminSessionPayload | null,
  ipAddress?: string | null,
  userAgent?: string | null
) {
  const db = getDb();
  const categoryRows = await resolveCategoryIds(input.categories);

  await db.delete(productCategoryAssignments).where(eq(productCategoryAssignments.productId, productId));
  await db.delete(productTagAssignments).where(eq(productTagAssignments.productId, productId));
  await db.delete(productVehicleCompatibilities).where(
    eq(productVehicleCompatibilities.productId, productId)
  );
  await db.delete(productRelations).where(eq(productRelations.productId, productId));
  await db.delete(productMedia).where(eq(productMedia.productId, productId));
  await db.delete(productSpecs).where(eq(productSpecs.productId, productId));

  if (categoryRows.length > 0) {
    await db.insert(productCategoryAssignments).values(
      categoryRows.map((row) => ({
        productId,
        categoryId: row.id
      }))
    );
  }

  if (input.tags.length > 0) {
    await db.insert(productTagAssignments).values(
      input.tags.map((tag) => ({
        productId,
        tag
      }))
    );
  }

  if (input.vehicleBrands.length > 0) {
    await db.insert(productVehicleCompatibilities).values(
      input.vehicleBrands.map((vehicleBrand) => ({
        productId,
        vehicleBrand
      }))
    );
  }

  const productRelationsToInsert = [
    ...input.relatedProductIds.map((relatedProductId) => ({
      productId,
      relatedProductId,
      relationType: "related" as const
    })),
    ...input.accessoryProductIds.map((relatedProductId) => ({
      productId,
      relatedProductId,
      relationType: "accessory" as const
    }))
  ];

  if (productRelationsToInsert.length > 0) {
    await db.insert(productRelations).values(productRelationsToInsert);
  }

  if (input.media.length > 0) {
    await db.insert(productMedia).values(
      input.media.map((item, index) => ({
        productId,
        url: item.url,
        altText: item.altText,
        isPrimary: item.isPrimary || index === 0,
        sortOrder: index
      }))
    );
  }

  if (input.specs.length > 0) {
    await db.insert(productSpecs).values(
      input.specs.map((item, index) => ({
        productId,
        groupName: item.groupName,
        label: item.label,
        value: item.value,
        sortOrder: index
      }))
    );
  }

  await recordAuditLog({
    db,
    actor,
    entityType: "product_collections",
    entityId: productId,
    action: "sync",
    summary: "Urun koleksiyon alanlari senkronize edildi.",
    afterPayload: {
      categories: input.categories,
      tags: input.tags,
      vehicleBrands: input.vehicleBrands
    },
    ipAddress,
    userAgent
  });
}

export async function listAdminProducts(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return listFallbackAdminProducts(input);
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(
      or(ilike(products.name, `%${input.q}%`), ilike(products.slug, `%${input.q}%`))
    );
  }

  if (input.status && ["draft", "active", "archived"].includes(input.status)) {
    conditions.push(eq(products.status, input.status as typeof products.$inferSelect.status));
  }

  const fromDate = parseFilterDate(input.from);
  const toDate = parseFilterDate(input.to, true);

  if (fromDate) {
    conditions.push(gte(products.updatedAt, fromDate));
  }

  if (toDate) {
    conditions.push(lt(products.updatedAt, toDate));
  }

  if (cursor) {
    conditions.push(
      or(
        lt(products.updatedAt, new Date(cursor.updatedAt)),
        and(
          eq(products.updatedAt, new Date(cursor.updatedAt)),
          lt(products.id, cursor.id)
        )
      )
    );
  }

  const rows = await db
    .select()
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(products.updatedAt), desc(products.id))
    .limit(input.limit + 1);

  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;
  const collections = await hydrateProductCollections(items.map((item) => item.id));

  return {
    items: items.map((item) => {
      const variants = collections.variants.get(item.id) ?? [];
      const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0];
      const media = collections.media.get(item.id) ?? [];
      return {
        ...item,
        defaultVariant,
        variants,
        media,
        tags: collections.tags.get(item.id) ?? [],
        categories: collections.categories.get(item.id) ?? [],
        vehicles: collections.vehicles.get(item.id) ?? []
      };
    }),
    nextCursor: hasMore
      ? encodeCursor({
          updatedAt: items.at(-1)?.updatedAt.toISOString() ?? new Date().toISOString(),
          id: items.at(-1)?.id ?? ""
        })
      : null
  };
}

export async function getAdminProductById(id: string) {
  if (!hasDatabaseConfig()) {
    return getFallbackAdminProductById(id);
  }

  const db = getDb();
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);

  if (!product) {
    return null;
  }

  const collections = await hydrateProductCollections([id]);
  const variants = collections.variants.get(id) ?? [];
  const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0];

  return {
    ...product,
    defaultVariant,
    variants,
    media: collections.media.get(id) ?? [],
    specs: collections.specs.get(id) ?? [],
    tags: collections.tags.get(id) ?? [],
    categories: collections.categories.get(id) ?? [],
    vehicles: collections.vehicles.get(id) ?? [],
    relatedProductIds:
      collections.relations
        .get(id)
        ?.filter((item) => item.type === "related")
        .map((item) => item.id) ?? [],
    accessoryProductIds:
      collections.relations
        .get(id)
        ?.filter((item) => item.type === "accessory")
        .map((item) => item.id) ?? []
  };
}

export async function upsertAdminProduct(
  input: ProductInput,
  actor: AdminSessionPayload | null,
  requestMeta?: {
    ipAddress?: string | null;
    userAgent?: string | null;
  }
) {
  if (!hasDatabaseConfig()) {
    return upsertFallbackAdminProduct(input);
  }

  const db = getDb();
  const categoryRows = await resolveCategoryIds(input.categories);
  const primaryCategoryId = categoryRows[0]?.id ?? null;
  const slug = slugify(input.slug || input.name);
  const schemaJsonLd = buildProductSchemaJsonLd({ ...input, slug });
  const baseProductValues = {
    name: input.name,
    slug,
    status: input.status,
    categoryId: primaryCategoryId,
    brandId: input.brandId || null,
    shortDescription: input.shortDescription,
    description: input.description,
    useCase: input.useCase || null,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    ogImageUrl: input.ogImageUrl || null,
    aiSummary: input.aiSummary || null,
    schemaJsonLd,
    defaultPriceKurus: input.priceKurus,
    discountedPriceKurus: input.discountedPriceKurus ?? null,
    discountEndsAt: input.discountEndsAt ? new Date(input.discountEndsAt) : null,
    isVatIncluded: input.isVatIncluded,
    minimumStockThreshold: input.minimumStockThreshold,
    inventoryTrackingEnabled: input.inventoryTrackingEnabled,
    powerKw: input.powerKw || null,
    chargeType: input.chargeType ?? null,
    connectorType: input.connectorType || null,
    phaseType: input.phaseType ?? null,
    ipClass: input.ipClass || null,
    hasWifi: input.hasWifi,
    hasRfid: input.hasRfid,
    has4g: input.has4g,
    installRequired: input.installRequired,
    searchKeywords: input.searchKeywords,
    adminNotes: input.adminNotes || null,
    updatedAt: new Date()
  };

  if (input.id) {
    const before = await getAdminProductById(input.id);

    await db.update(products).set(baseProductValues).where(eq(products.id, input.id));

    await writeProductCollections(
      input.id,
      input,
      actor,
      requestMeta?.ipAddress,
      requestMeta?.userAgent
    );
    await writeProductVariants(input.id, input);

    const after = await getAdminProductById(input.id);

    await recordAuditLog({
      db,
      actor,
      entityType: "product",
      entityId: input.id,
      action: "update",
      summary: `${input.name} urunu guncellendi.`,
      beforePayload: before,
      afterPayload: after,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });

    revalidateTag("admin-product-lookup");

    return after;
  }

  const [createdProduct] = await db
    .insert(products)
    .values(baseProductValues)
    .returning({ id: products.id });

  await writeProductCollections(
    createdProduct.id,
    input,
    actor,
    requestMeta?.ipAddress,
    requestMeta?.userAgent
  );
  await writeProductVariants(createdProduct.id, input);

  const after = await getAdminProductById(createdProduct.id);

  await recordAuditLog({
    db,
    actor,
    entityType: "product",
    entityId: createdProduct.id,
    action: "create",
    summary: `${input.name} urunu olusturuldu.`,
    afterPayload: after,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateTag("admin-product-lookup");

  return after;
}

async function loadProductLookupOptions() {
  if (!hasDatabaseConfig()) {
    return getFallbackProductLookupOptions();
  }

  const db = getDb();
  return db
    .select({
      id: products.id,
      name: products.name
    })
    .from(products)
    .orderBy(products.name);
}

export const getProductLookupOptions = unstable_cache(
  loadProductLookupOptions,
  ["admin-product-lookup"],
  {
    revalidate: 120,
    tags: ["admin-product-lookup"]
  }
);

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
  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, items.map((item) => item.id)));

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

export async function listAdminQuotes(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return listFallbackAdminQuotes(input);
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(
      or(
        ilike(quoteRequests.fullName, `%${input.q}%`),
        ilike(quoteRequests.companyName, `%${input.q}%`),
        ilike(quoteRequests.phone, `%${input.q}%`)
      )
    );
  }

  if (input.status) {
    conditions.push(
      eq(quoteRequests.status, input.status as typeof quoteRequests.$inferSelect.status)
    );
  }

  const fromDate = parseFilterDate(input.from);
  const toDate = parseFilterDate(input.to, true);

  if (fromDate) {
    conditions.push(gte(quoteRequests.createdAt, fromDate));
  }

  if (toDate) {
    conditions.push(lt(quoteRequests.createdAt, toDate));
  }

  if (cursor) {
    conditions.push(
      or(
        lt(quoteRequests.updatedAt, new Date(cursor.updatedAt)),
        and(
          eq(quoteRequests.updatedAt, new Date(cursor.updatedAt)),
          lt(quoteRequests.id, cursor.id)
        )
      )
    );
  }

  const rows = await db
    .select({
      id: quoteRequests.id,
      fullName: quoteRequests.fullName,
      companyName: quoteRequests.companyName,
      segment: quoteRequests.segment,
      email: quoteRequests.email,
      phone: quoteRequests.phone,
      city: quoteRequests.city,
      district: quoteRequests.district,
      estimatedLocation: quoteRequests.estimatedLocation,
      requestNotes: quoteRequests.requestNotes,
      status: quoteRequests.status,
      assignedAdminId: quoteRequests.assignedAdminId,
      source: quoteRequests.source,
      createdAt: quoteRequests.createdAt,
      updatedAt: quoteRequests.updatedAt,
      assignedAdminName: adminUsers.fullName
    })
    .from(quoteRequests)
    .leftJoin(adminUsers, eq(adminUsers.id, quoteRequests.assignedAdminId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(quoteRequests.updatedAt), desc(quoteRequests.id))
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

export async function getAdminQuoteById(id: string) {
  if (!hasDatabaseConfig()) {
    return getFallbackAdminQuoteById(id);
  }

  const db = getDb();
  const [quote] = await db
    .select({
      id: quoteRequests.id,
      fullName: quoteRequests.fullName,
      companyName: quoteRequests.companyName,
      segment: quoteRequests.segment,
      email: quoteRequests.email,
      phone: quoteRequests.phone,
      city: quoteRequests.city,
      district: quoteRequests.district,
      estimatedLocation: quoteRequests.estimatedLocation,
      requestNotes: quoteRequests.requestNotes,
      status: quoteRequests.status,
      assignedAdminId: quoteRequests.assignedAdminId,
      source: quoteRequests.source,
      createdAt: quoteRequests.createdAt,
      updatedAt: quoteRequests.updatedAt,
      assignedAdminName: adminUsers.fullName
    })
    .from(quoteRequests)
    .leftJoin(adminUsers, eq(adminUsers.id, quoteRequests.assignedAdminId))
    .where(eq(quoteRequests.id, id))
    .limit(1);

  if (!quote) {
    return null;
  }

  const activities = await db
    .select({
      id: quoteActivities.id,
      activityType: quoteActivities.activityType,
      note: quoteActivities.note,
      payload: quoteActivities.payload,
      createdAt: quoteActivities.createdAt,
      adminName: adminUsers.fullName
    })
    .from(quoteActivities)
    .leftJoin(adminUsers, eq(adminUsers.id, quoteActivities.adminUserId))
    .where(eq(quoteActivities.quoteRequestId, id))
    .orderBy(desc(quoteActivities.createdAt));

  return {
    ...quote,
    activities
  };
}

export async function updateAdminQuote(
  id: string,
  input: QuoteUpdateInput,
  actor: AdminSessionPayload | null,
  requestMeta?: {
    ipAddress?: string | null;
    userAgent?: string | null;
  }
) {
  if (!hasDatabaseConfig()) {
    return updateFallbackAdminQuote(id, input, actor);
  }

  const db = getDb();
  const before = await getAdminQuoteById(id);

  if (!before) {
    return null;
  }

  await db
    .update(quoteRequests)
    .set({
      status: input.status,
      assignedAdminId: input.assignedAdminId ?? before.assignedAdminId,
      updatedAt: new Date()
    })
    .where(eq(quoteRequests.id, id));

  await db.insert(quoteActivities).values({
    quoteRequestId: id,
    adminUserId: actor?.sub ?? null,
    activityType: "status_change",
    note: input.note || `${input.status} durumuna guncellendi.`,
    payload: {
      fromStatus: before.status,
      toStatus: input.status
    }
  });

  const after = await getAdminQuoteById(id);

  await recordAuditLog({
    db,
    actor,
    entityType: "quote_request",
    entityId: id,
    action: "update",
    summary: `${before.fullName} teklif kaydi guncellendi.`,
    beforePayload: before,
    afterPayload: after,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  return after;
}

async function loadAdminDashboardSnapshot() {
  if (!hasDatabaseConfig()) {
    return getFallbackAdminDashboardSnapshot();
  }

  const db = getDb();
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);
  const weekStart = startOfWeek(now);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthlyTargetKurus = Number(process.env.ADMIN_MONTHLY_REVENUE_TARGET_KURUS ?? "2500000");
  const todayStartIso = todayStart.toISOString();
  const monthStartIso = monthStart.toISOString();
  const weekStartIso = weekStart.toISOString();
  const sevenDaysAgoIso = sevenDaysAgo.toISOString();

  const emptySnapshot = {
    kpis: {
      todayRevenue: 0,
      monthRevenue: 0,
      targetProgress: 0,
      pendingOrders: 0,
      pendingQuotes: 0,
      openServiceRequests: 0,
      completedInstallations: 0,
      newCustomers: 0
    },
    charts: {
      revenueTrend: [],
      quoteDistribution: [],
      orderDistribution: []
    },
    activity: {
      recentOrders: [],
      recentQuotes: [],
      recentServiceRequests: []
    },
    security: {
      activeSessions: 0,
      recentAuditLogs: []
    }
  };

  try {
    const kpiRows = await db.execute(sql`
      select
        (select coalesce(sum(${orders.totalKurus}), 0)::int from ${orders}
          where ${orders.status} = any(${sql.raw(`ARRAY['paid','confirmed','shipped','delivered','fulfilled']::order_status[]`)})
            and ${orders.createdAt} >= ${todayStartIso}::timestamptz) as today_revenue,
        (select coalesce(sum(${orders.totalKurus}), 0)::int from ${orders}
          where ${orders.status} = any(${sql.raw(`ARRAY['paid','confirmed','shipped','delivered','fulfilled']::order_status[]`)})
            and ${orders.createdAt} >= ${monthStartIso}::timestamptz) as month_revenue,
        (select count(*)::int from ${orders}
          where ${orders.status} = any(${sql.raw(`ARRAY['pending_payment','payment_processing','pending_confirmation']::order_status[]`)})) as pending_orders,
        (select count(*)::int from ${quoteRequests}
          where ${quoteRequests.status} = any(${sql.raw(`ARRAY['new','reviewing','proposal_sent','negotiation']::quote_request_status[]`)})) as pending_quotes,
        (select count(*)::int from ${serviceLeads}
          where ${serviceLeads.leadType} ilike '%servis%'
            and ${serviceLeads.status} = any(${sql.raw(`ARRAY['new','contacted','qualified']::lead_status[]`)})) as open_service_requests,
        (select count(*)::int from ${orders}
          where ${orders.status} = any(${sql.raw(`ARRAY['delivered','fulfilled']::order_status[]`)})
            and ${orders.updatedAt} >= ${weekStartIso}::timestamptz) as completed_installations,
        (select count(*)::int from ${customers}
          where ${customers.createdAt} >= ${sevenDaysAgoIso}::timestamptz) as new_customers
    `);

    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        totalKurus: orders.totalKurus,
        status: orders.status,
        updatedAt: orders.updatedAt
      })
      .from(orders)
      .orderBy(desc(orders.updatedAt))
      .limit(10);

    const recentQuotes = await db
      .select({
        id: quoteRequests.id,
        fullName: quoteRequests.fullName,
        companyName: quoteRequests.companyName,
        status: quoteRequests.status,
        updatedAt: quoteRequests.updatedAt
      })
      .from(quoteRequests)
      .orderBy(desc(quoteRequests.updatedAt))
      .limit(5);

    const recentServiceRequests = await db
      .select({
        id: serviceLeads.id,
        fullName: serviceLeads.fullName,
        leadType: serviceLeads.leadType,
        status: serviceLeads.status,
        createdAt: serviceLeads.createdAt
      })
      .from(serviceLeads)
      .orderBy(desc(serviceLeads.createdAt))
      .limit(3);

    const revenueTrendRows = await db.execute(sql`
      select
        to_char(date_trunc('month', ${orders.createdAt}), 'YYYY-MM') as month,
        coalesce(sum(${orders.totalKurus}), 0)::int as total
      from ${orders}
      where ${orders.status} = any(${sql.raw(`ARRAY['paid','confirmed','shipped','delivered','fulfilled']::order_status[]`)})
        and ${orders.createdAt} >= date_trunc('month', now()) - interval '11 months'
      group by 1
      order by 1 asc
    `);

    const quoteDistributionRows = await db.execute(sql`
      select ${quoteRequests.status}::text as status, count(*)::int as total
      from ${quoteRequests}
      group by ${quoteRequests.status}
      order by 1 asc
    `);

    const orderDistributionRows = await db.execute(sql`
      select ${orders.status}::text as status, count(*)::int as total
      from ${orders}
      group by ${orders.status}
      order by 1 asc
    `);

    const activeSessionRows = await db
      .select({ total: count() })
      .from(adminSessions)
      .where(gte(adminSessions.expiresAt, now));

    const recentAuditLogs = await db
      .select({
        id: auditLogs.id,
        entityType: auditLogs.entityType,
        action: auditLogs.action,
        summary: auditLogs.summary,
        createdAt: auditLogs.createdAt
      })
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(4);

    const kpis = kpiRows[0] as Record<string, unknown> | undefined;
    const todayRevenue = Number(kpis?.today_revenue ?? 0);
    const monthRevenue = Number(kpis?.month_revenue ?? 0);
    const targetProgress = monthlyTargetKurus > 0 ? (monthRevenue / monthlyTargetKurus) * 100 : 0;

    return {
      kpis: {
        todayRevenue,
        monthRevenue,
        targetProgress,
        pendingOrders: Number(kpis?.pending_orders ?? 0),
        pendingQuotes: Number(kpis?.pending_quotes ?? 0),
        openServiceRequests: Number(kpis?.open_service_requests ?? 0),
        completedInstallations: Number(kpis?.completed_installations ?? 0),
        newCustomers: Number(kpis?.new_customers ?? 0)
      },
      charts: {
        revenueTrend: revenueTrendRows.map((row) => ({
          month: String(row.month),
          total: Number(row.total)
        })),
        quoteDistribution: quoteDistributionRows.map((row) => ({
          status: String(row.status),
          total: Number(row.total)
        })),
        orderDistribution: orderDistributionRows.map((row) => ({
          status: String(row.status),
          total: Number(row.total)
        }))
      },
      activity: {
        recentOrders,
        recentQuotes,
        recentServiceRequests
      },
      security: {
        activeSessions: Number(activeSessionRows[0]?.total ?? 0),
        recentAuditLogs
      }
    };
  } catch (error) {
    console.warn("Admin dashboard snapshot could not be loaded.", error);
    return emptySnapshot;
  }
}

export const getAdminDashboardSnapshot = unstable_cache(
  loadAdminDashboardSnapshot,
  ["admin-dashboard-snapshot"],
  { revalidate: 45, tags: ["admin-dashboard"] }
);

export async function listAdminUsers(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(
      or(ilike(adminUsers.fullName, `%${input.q}%`), ilike(adminUsers.email, `%${input.q}%`))
    );
  }

  if (input.status) {
    conditions.push(eq(adminUsers.status, input.status as typeof adminUsers.$inferSelect.status));
  }

  const fromDate = parseFilterDate(input.from);
  const toDate = parseFilterDate(input.to, true);

  if (fromDate) {
    conditions.push(gte(adminUsers.updatedAt, fromDate));
  }

  if (toDate) {
    conditions.push(lt(adminUsers.updatedAt, toDate));
  }

  if (cursor) {
    conditions.push(
      or(
        lt(adminUsers.updatedAt, new Date(cursor.updatedAt)),
        and(eq(adminUsers.updatedAt, new Date(cursor.updatedAt)), lt(adminUsers.id, cursor.id))
      )
    );
  }

  const rows = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      fullName: adminUsers.fullName,
      role: adminUsers.role,
      status: adminUsers.status,
      phone: adminUsers.phone,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt
    })
    .from(adminUsers)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(adminUsers.updatedAt), desc(adminUsers.id))
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

export async function upsertAdminUser(
  input: AdminUserInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const now = new Date();

  if (input.id) {
    const [before] = await db.select().from(adminUsers).where(eq(adminUsers.id, input.id)).limit(1);

    if (!before) {
      return null;
    }

    const passwordChanged = Boolean(input.password);

    await db
      .update(adminUsers)
      .set({
        email: input.email.toLowerCase(),
        fullName: input.fullName,
        role: input.role,
        status: input.status,
        phone: input.phone || null,
        ...(passwordChanged ? { passwordHash: hashPassword(input.password as string) } : {}),
        updatedAt: now
      })
      .where(eq(adminUsers.id, input.id));

    if (input.status !== "active" || passwordChanged) {
      await db.delete(adminSessions).where(eq(adminSessions.adminUserId, input.id));
    }

    const [after] = await db.select().from(adminUsers).where(eq(adminUsers.id, input.id)).limit(1);

    await recordAuditLog({
      db,
      actor,
      entityType: "admin_user",
      entityId: input.id,
      action: "update",
      summary: `${input.email} admin kullanicisi guncellendi.`,
      beforePayload: before,
      afterPayload: after,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });

    return after;
  }

  if (!input.password) {
    throw new Error("Yeni admin kullanicisi icin sifre gereklidir.");
  }

  const [created] = await db
    .insert(adminUsers)
    .values({
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      role: input.role,
      status: input.status,
      phone: input.phone || null,
      passwordHash: hashPassword(input.password),
      updatedAt: now
    })
    .returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "admin_user",
    entityId: created.id,
    action: "create",
    summary: `${created.email} admin kullanicisi olusturuldu.`,
    afterPayload: created,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  return created;
}

export async function listAdminUserSessions(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(
      or(ilike(adminUsers.email, `%${input.q}%`), ilike(adminUsers.fullName, `%${input.q}%`))
    );
  }

  const fromDate = parseFilterDate(input.from);
  const toDate = parseFilterDate(input.to, true);

  if (fromDate) {
    conditions.push(gte(adminSessions.createdAt, fromDate));
  }

  if (toDate) {
    conditions.push(lt(adminSessions.createdAt, toDate));
  }

  if (cursor) {
    conditions.push(
      or(
        lt(adminSessions.createdAt, new Date(cursor.updatedAt)),
        and(eq(adminSessions.createdAt, new Date(cursor.updatedAt)), lt(adminSessions.id, cursor.id))
      )
    );
  }

  const rows = await db
    .select({
      id: adminSessions.id,
      adminUserId: adminSessions.adminUserId,
      adminName: adminUsers.fullName,
      adminEmail: adminUsers.email,
      ipAddress: adminSessions.ipAddress,
      userAgent: adminSessions.userAgent,
      expiresAt: adminSessions.expiresAt,
      lastSeenAt: adminSessions.lastSeenAt,
      createdAt: adminSessions.createdAt
    })
    .from(adminSessions)
    .leftJoin(adminUsers, eq(adminUsers.id, adminSessions.adminUserId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(adminSessions.createdAt), desc(adminSessions.id))
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

export async function listAdminServiceLeads(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(
      or(
        ilike(serviceLeads.fullName, `%${input.q}%`),
        ilike(serviceLeads.phone, `%${input.q}%`),
        ilike(serviceLeads.email, `%${input.q}%`),
        ilike(serviceLeads.leadType, `%${input.q}%`)
      )
    );
  }

  if (input.status) {
    conditions.push(eq(serviceLeads.status, input.status as typeof serviceLeads.$inferSelect.status));
  }

  const fromDate = parseFilterDate(input.from);
  const toDate = parseFilterDate(input.to, true);

  if (fromDate) {
    conditions.push(gte(serviceLeads.createdAt, fromDate));
  }

  if (toDate) {
    conditions.push(lt(serviceLeads.createdAt, toDate));
  }

  if (cursor) {
    conditions.push(
      or(
        lt(serviceLeads.createdAt, new Date(cursor.updatedAt)),
        and(eq(serviceLeads.createdAt, new Date(cursor.updatedAt)), lt(serviceLeads.id, cursor.id))
      )
    );
  }

  const rows = await db
    .select()
    .from(serviceLeads)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(serviceLeads.createdAt), desc(serviceLeads.id))
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

export async function getAdminServiceLeadById(id: string) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const [lead] = await db.select().from(serviceLeads).where(eq(serviceLeads.id, id)).limit(1);
  return lead ?? null;
}

export async function updateAdminServiceLead(
  id: string,
  input: ServiceLeadUpdateInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const before = await getAdminServiceLeadById(id);

  if (!before) {
    return null;
  }

  const payload =
    before.payload && typeof before.payload === "object" && !Array.isArray(before.payload)
      ? { ...(before.payload as Record<string, unknown>) }
      : {};
  const notes = Array.isArray(payload.adminNotes) ? payload.adminNotes : [];
  const nextPayload = {
    ...payload,
    assignedAdminId: input.assignedAdminId ?? payload.assignedAdminId ?? null,
    adminNotes: input.note
      ? [
          ...notes,
          {
            note: input.note,
            adminUserId: actor?.sub ?? null,
            createdAt: new Date().toISOString()
          }
        ]
      : notes
  };

  await db
    .update(serviceLeads)
    .set({
      status: input.status,
      payload: nextPayload
    })
    .where(eq(serviceLeads.id, id));

  const after = await getAdminServiceLeadById(id);

  await recordAuditLog({
    db,
    actor,
    entityType: "service_lead",
    entityId: id,
    action: "update",
    summary: `${before.fullName} saha talebi guncellendi.`,
    beforePayload: before,
    afterPayload: after,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  return after;
}

export async function listAdminBlogPosts(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(or(ilike(blogPosts.title, `%${input.q}%`), ilike(blogPosts.slug, `%${input.q}%`)));
  }

  if (input.status === "published") {
    conditions.push(sql`${blogPosts.publishedAt} is not null`);
  } else if (input.status === "draft") {
    conditions.push(sql`${blogPosts.publishedAt} is null`);
  }

  const fromDate = parseFilterDate(input.from);
  const toDate = parseFilterDate(input.to, true);

  if (fromDate) {
    conditions.push(gte(blogPosts.updatedAt, fromDate));
  }

  if (toDate) {
    conditions.push(lt(blogPosts.updatedAt, toDate));
  }

  if (cursor) {
    conditions.push(
      or(
        lt(blogPosts.updatedAt, new Date(cursor.updatedAt)),
        and(eq(blogPosts.updatedAt, new Date(cursor.updatedAt)), lt(blogPosts.id, cursor.id))
      )
    );
  }

  const rows = await db
    .select()
    .from(blogPosts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogPosts.updatedAt), desc(blogPosts.id))
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

export async function getAdminBlogPostById(id: string) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return post ?? null;
}

export async function upsertAdminBlogPost(
  input: BlogPostInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const slug = slugify(input.slug || input.title);
  const values = {
    title: input.title,
    slug,
    excerpt: input.excerpt,
    body: input.body,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
    updatedAt: new Date()
  };

  if (input.id) {
    const before = await getAdminBlogPostById(input.id);

    await db.update(blogPosts).set(values).where(eq(blogPosts.id, input.id));
    const after = await getAdminBlogPostById(input.id);

    await recordAuditLog({
      db,
      actor,
      entityType: "blog_post",
      entityId: input.id,
      action: "update",
      summary: `${input.title} icerigi guncellendi.`,
      beforePayload: before,
      afterPayload: after,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });

    return after;
  }

  const [created] = await db.insert(blogPosts).values(values).returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "blog_post",
    entityId: created.id,
    action: "create",
    summary: `${created.title} icerigi olusturuldu.`,
    afterPayload: created,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  return created;
}

async function loadAdminCatalog() {
  if (!hasDatabaseConfig()) {
    return { brands: [], categories: [] };
  }

  await ensureDefaultCategories();
  const db = getDb();
  const [brandRows, categoryRows] = await Promise.all([
    db.select().from(brands).orderBy(brands.name),
    db.select().from(categories).orderBy(categories.name)
  ]);

  return {
    brands: brandRows,
    categories: categoryRows
  };
}

export const listAdminCatalog = unstable_cache(loadAdminCatalog, ["admin-catalog"], {
  revalidate: 120,
  tags: ["admin-catalog"]
});

export async function upsertAdminBrand(
  input: BrandInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const values = {
    name: input.name,
    slug: slugify(input.slug || input.name),
    websiteUrl: input.websiteUrl || null,
    description: input.description || null
  };

  if (input.id) {
    await db.update(brands).set(values).where(eq(brands.id, input.id));
    await recordAuditLog({
      db,
      actor,
      entityType: "brand",
      entityId: input.id,
      action: "update",
      summary: `${input.name} markasi guncellendi.`,
      afterPayload: values,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });
    revalidateTag("admin-catalog");
    return { id: input.id, ...values };
  }

  const [created] = await db.insert(brands).values(values).returning();
  await recordAuditLog({
    db,
    actor,
    entityType: "brand",
    entityId: created.id,
    action: "create",
    summary: `${created.name} markasi olusturuldu.`,
    afterPayload: created,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });
  revalidateTag("admin-catalog");
  return created;
}

export async function upsertAdminCategory(
  input: CategoryInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const values = {
    name: input.name,
    slug: slugify(input.slug || input.name),
    description: input.description || null,
    parentId: input.parentId ?? null
  };

  if (input.id) {
    await db.update(categories).set(values).where(eq(categories.id, input.id));
    await recordAuditLog({
      db,
      actor,
      entityType: "category",
      entityId: input.id,
      action: "update",
      summary: `${input.name} kategorisi guncellendi.`,
      afterPayload: values,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });
    revalidateTag("admin-catalog");
    return { id: input.id, ...values };
  }

  const [created] = await db.insert(categories).values(values).returning();
  await recordAuditLog({
    db,
    actor,
    entityType: "category",
    entityId: created.id,
    action: "create",
    summary: `${created.name} kategorisi olusturuldu.`,
    afterPayload: created,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });
  revalidateTag("admin-catalog");
  return created;
}

export async function listAdminAuditLogs(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(
      or(
        ilike(auditLogs.entityType, `%${input.q}%`),
        ilike(auditLogs.entityId, `%${input.q}%`),
        ilike(auditLogs.action, `%${input.q}%`),
        ilike(auditLogs.summary, `%${input.q}%`)
      )
    );
  }

  if (input.status) {
    conditions.push(eq(auditLogs.entityType, input.status));
  }

  const fromDate = parseFilterDate(input.from);
  const toDate = parseFilterDate(input.to, true);

  if (fromDate) {
    conditions.push(gte(auditLogs.createdAt, fromDate));
  }

  if (toDate) {
    conditions.push(lt(auditLogs.createdAt, toDate));
  }

  if (cursor) {
    conditions.push(
      or(
        lt(auditLogs.createdAt, new Date(cursor.updatedAt)),
        and(eq(auditLogs.createdAt, new Date(cursor.updatedAt)), lt(auditLogs.id, cursor.id))
      )
    );
  }

  const rows = await db
    .select({
      id: auditLogs.id,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      action: auditLogs.action,
      summary: auditLogs.summary,
      beforePayload: auditLogs.beforePayload,
      afterPayload: auditLogs.afterPayload,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      createdAt: auditLogs.createdAt,
      actorName: adminUsers.fullName,
      actorEmail: adminUsers.email
    })
    .from(auditLogs)
    .leftJoin(adminUsers, eq(adminUsers.id, auditLogs.actorAdminId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
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
          statusNote: input.note || "PayTR transaction durumuna gore manuel mutabakat yapildi.",
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
