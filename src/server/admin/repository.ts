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
import { productCategoryOptions } from "@/server/admin/constants";
import {
  getFallbackAdminProductById,
  getFallbackAdminQuoteById,
  getFallbackProductLookupOptions,
  listFallbackAdminProducts,
  listFallbackAdminQuotes,
  updateFallbackAdminQuote,
  upsertFallbackAdminProduct
} from "@/server/admin/fallback-store";
import type {
  adminBlogPostSchema,
  adminBrandSchema,
  adminCategorySchema,
  adminListQuerySchema,
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
  orders,
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
type QuoteUpdateInput = z.infer<typeof adminQuoteUpdateSchema>;
type ListQueryInput = z.infer<typeof adminListQuerySchema>;
type AdminUserInput = z.infer<typeof adminUserSchema>;
type BlogPostInput = z.infer<typeof adminBlogPostSchema>;
type ServiceLeadUpdateInput = z.infer<typeof adminServiceLeadUpdateSchema>;
type BrandInput = z.infer<typeof adminBrandSchema>;
type CategoryInput = z.infer<typeof adminCategorySchema>;

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
        description: `${item.label} kategori kaydı`
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
    summary: "Ürün koleksiyon alanları senkronize edildi.",
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
      summary: `${input.name} ürünü güncellendi.`,
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
    summary: `${input.name} ürünü oluşturuldu.`,
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
    note: input.note || `${input.status} durumuna güncellendi.`,
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
    summary: `${before.fullName} teklif kaydı güncellendi.`,
    beforePayload: before,
    afterPayload: after,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  return after;
}

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
      summary: `${input.email} admin kullanıcısı güncellendi.`,
      beforePayload: before,
      afterPayload: after,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });

    return after;
  }

  if (!input.password) {
    throw new Error("Yeni admin kullanıcısı için şifre gereklidir.");
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
    summary: `${created.email} admin kullanıcısı oluşturuldu.`,
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
    summary: `${before.fullName} saha talebi güncellendi.`,
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
      summary: `${input.title} içeriği güncellendi.`,
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
    summary: `${created.title} içeriği oluşturuldu.`,
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
      summary: `${input.name} markası güncellendi.`,
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
    summary: `${created.name} markası oluşturuldu.`,
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
      summary: `${input.name} kategorisi güncellendi.`,
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
    summary: `${created.name} kategorisi oluşturuldu.`,
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
