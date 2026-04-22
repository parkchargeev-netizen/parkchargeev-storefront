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
import { z } from "zod";

import { slugify } from "@/lib/slug";
import { getDb } from "@/server/db/client";
import type { AdminSessionPayload } from "@/server/auth/session";
import { recordAuditLog } from "@/server/admin/audit";
import {
  productCategoryOptions,
  quoteStatusOptions
} from "@/server/admin/constants";
import type {
  adminListQuerySchema,
  adminOrderUpdateSchema,
  adminProductSchema,
  adminQuoteUpdateSchema
} from "@/server/admin/validators";
import {
  adminUsers,
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

    const [variant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, input.id))
      .limit(1);

    if (variant) {
      await db
        .update(productVariants)
        .set({
          sku: input.sku,
          title: input.variantTitle,
          powerLabel: input.powerLabel || null,
          cableLength: input.cableLength || null,
          connectorType: input.connectorType || null,
          stockQuantity: input.stockQuantity,
          priceKurus: input.priceKurus,
          compareAtKurus: input.compareAtKurus ?? null,
          isDefault: true
        })
        .where(eq(productVariants.id, variant.id));
    } else {
      await db.insert(productVariants).values({
        productId: input.id,
        sku: input.sku,
        title: input.variantTitle,
        powerLabel: input.powerLabel || null,
        cableLength: input.cableLength || null,
        connectorType: input.connectorType || null,
        stockQuantity: input.stockQuantity,
        priceKurus: input.priceKurus,
        compareAtKurus: input.compareAtKurus ?? null,
        isDefault: true
      });
    }

    await writeProductCollections(
      input.id,
      input,
      actor,
      requestMeta?.ipAddress,
      requestMeta?.userAgent
    );

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

    return after;
  }

  const [createdProduct] = await db
    .insert(products)
    .values(baseProductValues)
    .returning({ id: products.id });

  await db.insert(productVariants).values({
    productId: createdProduct.id,
    sku: input.sku,
    title: input.variantTitle,
    powerLabel: input.powerLabel || null,
    cableLength: input.cableLength || null,
    connectorType: input.connectorType || null,
    stockQuantity: input.stockQuantity,
    priceKurus: input.priceKurus,
    compareAtKurus: input.compareAtKurus ?? null,
    isDefault: true
  });

  await writeProductCollections(
    createdProduct.id,
    input,
    actor,
    requestMeta?.ipAddress,
    requestMeta?.userAgent
  );

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

  return after;
}

export async function getProductLookupOptions() {
  const db = getDb();
  return db
    .select({
      id: products.id,
      name: products.name
    })
    .from(products)
    .orderBy(products.name);
}

export async function listAdminOrders(input: ListQueryInput) {
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

export async function getAdminDashboardSnapshot() {
  const db = getDb();
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);
  const weekStart = startOfWeek(now);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthlyTargetKurus = Number(process.env.ADMIN_MONTHLY_REVENUE_TARGET_KURUS ?? "2500000") * 100;

  const [
    todayRevenueRow,
    monthRevenueRow,
    pendingOrdersRow,
    pendingQuotesRow,
    openServiceRow,
    newCustomersRow,
    completedInstallationsRow,
    recentOrders,
    recentQuotes,
    recentServiceRequests,
    revenueTrendRows,
    quoteDistributionRows,
    orderDistributionRows
  ] = await Promise.all([
    db
      .select({
        total: sql<number>`coalesce(sum(${orders.totalKurus}), 0)`
      })
      .from(orders)
      .where(and(inArray(orders.status, [...revenueStatuses]), gte(orders.createdAt, todayStart))),
    db
      .select({
        total: sql<number>`coalesce(sum(${orders.totalKurus}), 0)`
      })
      .from(orders)
      .where(and(inArray(orders.status, [...revenueStatuses]), gte(orders.createdAt, monthStart))),
    db
      .select({ count: count() })
      .from(orders)
      .where(inArray(orders.status, [...pendingOrderStatuses])),
    db
      .select({ count: count() })
      .from(quoteRequests)
      .where(inArray(quoteRequests.status, openQuoteStatuses)),
    db
      .select({ count: count() })
      .from(serviceLeads)
      .where(
        and(
          ilike(serviceLeads.leadType, "%servis%"),
          inArray(serviceLeads.status, ["new", "contacted", "qualified"])
        )
      ),
    db
      .select({ count: count() })
      .from(customers)
      .where(gte(customers.createdAt, sevenDaysAgo)),
    db
      .select({ count: count() })
      .from(orders)
      .where(and(inArray(orders.status, ["delivered", "fulfilled"]), gte(orders.updatedAt, weekStart))),
    db
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
      .limit(10),
    db
      .select({
        id: quoteRequests.id,
        fullName: quoteRequests.fullName,
        companyName: quoteRequests.companyName,
        status: quoteRequests.status,
        updatedAt: quoteRequests.updatedAt
      })
      .from(quoteRequests)
      .orderBy(desc(quoteRequests.updatedAt))
      .limit(5),
    db
      .select({
        id: serviceLeads.id,
        fullName: serviceLeads.fullName,
        leadType: serviceLeads.leadType,
        status: serviceLeads.status,
        createdAt: serviceLeads.createdAt
      })
      .from(serviceLeads)
      .orderBy(desc(serviceLeads.createdAt))
      .limit(3),
    db.execute(sql`
      select
        to_char(date_trunc('month', ${orders.createdAt}), 'YYYY-MM') as month,
        coalesce(sum(${orders.totalKurus}), 0)::int as total
      from ${orders}
      where ${orders.status} = any(${sql.raw(`ARRAY['paid','confirmed','shipped','delivered','fulfilled']::order_status[]`)})
        and ${orders.createdAt} >= date_trunc('month', now()) - interval '11 months'
      group by 1
      order by 1 asc
    `),
    db.execute(sql`
      select ${quoteRequests.status} as status, count(*)::int as total
      from ${quoteRequests}
      group by ${quoteRequests.status}
      order by total desc
    `),
    db.execute(sql`
      select ${orders.status} as status, count(*)::int as total
      from ${orders}
      group by ${orders.status}
      order by total desc
    `)
  ]);

  const todayRevenue = Number(todayRevenueRow[0]?.total ?? 0);
  const monthRevenue = Number(monthRevenueRow[0]?.total ?? 0);
  const targetProgress = monthlyTargetKurus > 0 ? (monthRevenue / monthlyTargetKurus) * 100 : 0;

  return {
    kpis: {
      todayRevenue,
      monthRevenue,
      targetProgress,
      pendingOrders: pendingOrdersRow[0]?.count ?? 0,
      pendingQuotes: pendingQuotesRow[0]?.count ?? 0,
      openServiceRequests: openServiceRow[0]?.count ?? 0,
      completedInstallations: completedInstallationsRow[0]?.count ?? 0,
      newCustomers: newCustomersRow[0]?.count ?? 0
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
    }
  };
}
