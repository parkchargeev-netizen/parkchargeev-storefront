import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  ne,
  or,
  sql
} from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { revalidatePublicCatalog } from "@/server/catalog/cache";
import {
  products as marketingProducts,
  type ProductMediaModel,
  type ProductModel
} from "@/lib/mock-data";
import { inferProductMediaType } from "@/lib/product-media";
import {
  getDefaultProductDetailContent,
  getProductDetailContent,
  getProductDetailContentFromSchemaJsonLd,
  mergeProductDetailContent,
  productDetailContentSchemaKey,
  withProductDetailContentSchemaJsonLd
} from "@/lib/product-detail-content";
import { parseCableOptionPriceDeltaKurus } from "@/lib/product-options";
import { slugify } from "@/lib/slug";
import { getDb } from "@/server/db/client";
import type { AdminSessionPayload } from "@/server/auth/session";
import { hashPassword } from "@/server/auth/password";
import { recordAuditLog } from "@/server/admin/audit";
import { productCategoryOptions } from "@/server/admin/constants";
import { AdminProductConflictError } from "@/server/admin/product-errors";
import { getMarketingBlogSeedPosts } from "@/server/blog/repository";
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
  campaignProducts,
  categories,
  customers,
  inventoryMovements,
  merchandisingSlots,
  orderItems,
  orders,
  productCategoryAssignments,
  productMedia,
  productRelations,
  productReviews,
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

export const publicMerchandisingSlotKeys = {
  homeProductPortfolio: "home_product_portfolio",
  storeFeaturedProducts: "store_featured_products"
} as const;

export type PublicMerchandisingSlotKey =
  (typeof publicMerchandisingSlotKeys)[keyof typeof publicMerchandisingSlotKeys];

export const publicProductMerchandisingSections = [
  {
    slotKey: publicMerchandisingSlotKeys.homeProductPortfolio,
    title: "Anasayfa ürün portföyü",
    description: "Anasayfadaki Ürün portföyü bölümünde gösterilecek ürünleri ve sıralamayı yönetir.",
    maxItems: 12
  },
  {
    slotKey: publicMerchandisingSlotKeys.storeFeaturedProducts,
    title: "Mağaza öne çıkan ürünler",
    description: "Mağaza sayfasındaki Öne çıkanlar / Popüler şarj ürünleri alanını yönetir.",
    maxItems: 24
  }
] as const;


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
  return withProductDetailContentSchemaJsonLd({
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
  }, input.detailContent);
}

function getProductAdminSortOrder(schemaJsonLd: unknown) {
  const detailContent = getProductDetailContentFromSchemaJsonLd(schemaJsonLd) as
    | { adminSortOrder?: unknown }
    | undefined;
  const parsed = Number(detailContent?.adminSortOrder ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

function productAdminSortOrderSql() {
  return sql<number>`coalesce(nullif(${products.schemaJsonLd} -> ${productDetailContentSchemaKey} ->> 'adminSortOrder', '')::integer, 0)`;
}

function revalidateProductSurfaces(slug: string) {
  revalidatePublicCatalog({ slugs: [slug] });
}

function revalidateBlogSurfaces(slug?: string) {
  revalidateTag("public-blog");
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/arama");
  revalidatePath("/llms.txt");
  revalidatePath("/sitemap.xml");

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getMarketingProductCategorySlug(product: ProductModel) {
  switch (product.category) {
    case "Ev Tipi":
      return "ev-tipi";
    case "İş Yeri Tipi":
      return "is-yeri-tipi";
    case "DC Hızlı Şarj":
      return "dc-hizli-sarj";
    case "Aksesuar":
      return "aksesuar";
    default:
      return slugify(product.category);
  }
}

function getMarketingProductTags(product: ProductModel) {
  const tags = new Set<string>();

  if (product.badge === "Çok Satan") {
    tags.add("best_seller");
  }

  if (product.badge === "Yeni" || product.badge === "Yeni Nesil") {
    tags.add("new");
  }

  if (product.badge === "Kurumsal") {
    tags.add("corporate");
  }

  if (product.compareAtKurus && product.compareAtKurus > product.priceKurus) {
    tags.add("discounted");
  }

  return [...tags];
}

function getMarketingStockQuantity(product: ProductModel) {
  if (product.stockLabel === "Stokta Yok") {
    return 0;
  }

  return product.stockLabel === "Az Stok" ? 3 : 12;
}

function getMarketingPowerKw(product: ProductModel) {
  return product.powerLabel.match(/[\d.]+/)?.[0] ?? null;
}

function getMarketingChargeType(product: ProductModel) {
  return product.powerLabel.toLocaleLowerCase("tr-TR").includes("dc") ? "dc" : "ac";
}

function getMarketingPhaseType(product: ProductModel) {
  return product.powerLabel.includes("11") || product.powerLabel.includes("22")
    ? "three_phase"
    : "single_phase";
}

function getMarketingConnectorType(product: ProductModel) {
  const values = product.specs.map((spec) => `${spec.label} ${spec.value}`).join(" ");

  if (values.includes("CCS2")) {
    return "CCS2";
  }

  return values.includes("Type 2") || product.category !== "DC Hızlı Şarj" ? "Type 2" : "CCS2";
}

function getMarketingIpClass(product: ProductModel) {
  return product.specs.find((spec) => spec.value.toUpperCase().includes("IP"))?.value ?? null;
}

function getMarketingVariantSku(product: ProductModel, index: number) {
  const suffix = index === 0 ? "STD" : `OPT-${index + 1}`;
  return `SKU-${product.slug.toUpperCase().replace(/[^A-Z0-9]/g, "-")}-${suffix}`.slice(0, 120);
}

async function ensureMarketingProductVariants(productId: string, product: ProductModel) {
  const db = getDb();
  const existingVariants = await db
    .select({
      sku: productVariants.sku,
      cableLength: productVariants.cableLength
    })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
  const existingCableLengths = new Set(
    existingVariants.map((variant) => variant.cableLength).filter(Boolean)
  );
  const connectorType = getMarketingConnectorType(product);
  const stockQuantity = getMarketingStockQuantity(product);
  const values = product.cableOptions
    .filter((option) => !existingCableLengths.has(option))
    .map((option, index) => {
      const absoluteIndex = existingVariants.length + index;
      const deltaKurus = parseCableOptionPriceDeltaKurus(option);
      const cleanOption = option.replace(/\s*\([^)]*\)\s*/g, "").trim();

      return {
        productId,
        sku: getMarketingVariantSku(product, absoluteIndex),
        title: cleanOption || option,
        powerLabel: product.powerLabel,
        cableLength: option,
        connectorType,
        stockQuantity,
        priceKurus: product.priceKurus + deltaKurus,
        compareAtKurus: product.compareAtKurus ? product.compareAtKurus + deltaKurus : null,
        isDefault: existingVariants.length === 0 && index === 0
      };
    });

  if (values.length > 0) {
    await db.insert(productVariants).values(values).onConflictDoNothing();
  }
}

let marketingProductsSeedPromise: Promise<void> | null = null;

async function seedMarketingProductsForAdmin() {
  const db = getDb();
  await ensureDefaultCategories();

  const existingProducts = await db
    .select({
      id: products.id,
      slug: products.slug
    })
    .from(products)
    .where(inArray(products.slug, marketingProducts.map((product) => product.slug)));
  const productIdBySlug = new Map(existingProducts.map((product) => [product.slug, product.id]));

  for (const marketingProduct of marketingProducts) {
    let productId = productIdBySlug.get(marketingProduct.slug);

    if (!productId) {
      const categorySlug = getMarketingProductCategorySlug(marketingProduct);
      const categoryRows = await resolveCategoryIds([categorySlug]);
      const primaryCategoryId = categoryRows[0]?.id ?? null;
      const connectorType = getMarketingConnectorType(marketingProduct);
      const stockQuantity = getMarketingStockQuantity(marketingProduct);
      const [createdProduct] = await db
        .insert(products)
        .values({
          name: marketingProduct.name,
          slug: marketingProduct.slug,
          status: "active",
          categoryId: primaryCategoryId,
          brandId: null,
          shortDescription: marketingProduct.summary,
          description: `<p>${escapeHtml(marketingProduct.description)}</p>`,
          useCase: marketingProduct.useCases[0] ?? null,
          seoTitle: `${marketingProduct.name} | ParkChargeEV`,
          seoDescription: marketingProduct.summary.slice(0, 320),
          canonicalUrl: `https://parkcharge.com/urun/${marketingProduct.slug}`,
          ogImageUrl: `https://placehold.co/1200x900/png?text=${encodeURIComponent(marketingProduct.name)}`,
          aiSummary: marketingProduct.summary.slice(0, 180),
          schemaJsonLd: withProductDetailContentSchemaJsonLd({
            "@context": "https://schema.org",
            "@type": "Product",
            name: marketingProduct.name,
            sku: getMarketingVariantSku(marketingProduct, 0)
          }, getProductDetailContent(marketingProduct)),
          defaultPriceKurus: marketingProduct.priceKurus,
          discountedPriceKurus: null,
          discountEndsAt: null,
          isVatIncluded: true,
          minimumStockThreshold: marketingProduct.stockLabel === "Az Stok" ? 2 : 3,
          inventoryTrackingEnabled: true,
          powerKw: getMarketingPowerKw(marketingProduct),
          chargeType: getMarketingChargeType(marketingProduct),
          connectorType,
          phaseType: getMarketingPhaseType(marketingProduct),
          ipClass: getMarketingIpClass(marketingProduct),
          hasWifi: marketingProduct.summary.toLocaleLowerCase("tr-TR").includes("uygulama"),
          hasBluetooth: marketingProduct.summary.toLocaleLowerCase("tr-TR").includes("bluetooth"),
          hasRfid: marketingProduct.summary.toLocaleLowerCase("tr-TR").includes("rfid"),
          has4g: false,
          installRequired: marketingProduct.category !== "Aksesuar",
          searchKeywords: marketingProduct.seoIntent,
          adminNotes: "Mağaza vitrininden otomatik oluşturulan yönetilebilir katalog kaydı."
        })
        .onConflictDoNothing()
        .returning({ id: products.id });

      productId = createdProduct?.id;

      if (!productId) {
        const [existingProduct] = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.slug, marketingProduct.slug))
          .limit(1);
        productId = existingProduct?.id;
      }

      if (productId) {
        const targetProductId = productId;

        if (primaryCategoryId) {
          await db
            .insert(productCategoryAssignments)
            .values({ productId: targetProductId, categoryId: primaryCategoryId })
            .onConflictDoNothing();
        }

        const tags = getMarketingProductTags(marketingProduct);
        if (tags.length > 0) {
          await db
            .insert(productTagAssignments)
            .values(tags.map((tag) => ({ productId: targetProductId, tag })))
            .onConflictDoNothing();
        }

        await db
          .insert(productMedia)
          .values(
            (marketingProduct.galleryItems?.length
              ? marketingProduct.galleryItems
              : ["Ön görünüm", "Yan profil", "Montaj görünümü", "Video"]
            ).map((item, index) => ({
              productId: targetProductId,
              url: `https://placehold.co/1200x900/png?text=${encodeURIComponent(`${marketingProduct.name} ${item}`)}`,
              altText: item,
              sortOrder: index,
              isPrimary: index === 0
            }))
          )
          .onConflictDoNothing();

        if (marketingProduct.specs.length > 0) {
          await db
            .insert(productSpecs)
            .values(
              marketingProduct.specs.map((spec, index) => ({
                productId: targetProductId,
                groupName: "general",
                label: spec.label,
                value: spec.value,
                sortOrder: index
              }))
            )
            .onConflictDoNothing();
        }
      }
    }

    if (productId) {
      await ensureMarketingProductVariants(productId, marketingProduct);
    }
  }
}

export async function ensureMarketingProductsVisibleInAdmin() {
  if (!hasDatabaseConfig()) {
    return;
  }

  marketingProductsSeedPromise ??= seedMarketingProductsForAdmin().catch((error) => {
    marketingProductsSeedPromise = null;
    console.warn("Marketing product catalog could not be seeded for admin.", error);
  });

  await marketingProductsSeedPromise;
}

type ProductRow = typeof products.$inferSelect;
type ProductCollections = Awaited<ReturnType<typeof hydrateProductCollections>>;

type ProductCollectionOptions = {
  includeMedia?: boolean;
  includeSpecs?: boolean;
  includeTags?: boolean;
  includeVehicles?: boolean;
  includeRelations?: boolean;
  toleratePartial?: boolean;
};

const productCollectionReadTimeoutMs = 3500;

function createEmptyProductCollections() {
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

async function withCollectionReadFallback<T>(label: string, promise: Promise<T>, fallback: T) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const guardedPromise = promise.catch((error) => {
    console.warn(
      `Admin product ${label} collection could not be loaded.`,
      error instanceof Error ? error.message : error
    );
    return fallback;
  });

  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`Admin product ${label} collection read timed out.`);
      resolve(fallback);
    }, productCollectionReadTimeoutMs);
  });

  try {
    return await Promise.race([guardedPromise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function collectionRead<T>(
  label: string,
  promise: Promise<T>,
  fallback: T,
  toleratePartial: boolean
) {
  return toleratePartial
    ? withCollectionReadFallback(label, promise, fallback)
    : promise;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getPublicCategoryLabel(categorySlugs: string[], base?: ProductModel) {
  const primarySlug = categorySlugs[0];
  const option = productCategoryOptions.find((item) => item.slug === primarySlug);

  return option?.label ?? base?.category ?? primarySlug ?? "Şarj Çözümleri";
}

function getPublicProductBadge(tags: string[], base?: ProductModel) {
  const values = new Set(tags);

  if (values.has("best_seller")) {
    return "Çok Satan";
  }

  if (values.has("new")) {
    return "Yeni";
  }

  if (values.has("corporate")) {
    return "Kurumsal";
  }

  if (values.has("discounted")) {
    return "İndirimli";
  }

  return base?.badge;
}

function getPublicStockLabel(stockQuantity: number): ProductModel["stockLabel"] {
  if (stockQuantity <= 0) {
    return "Stokta Yok";
  }

  return stockQuantity <= 3 ? "Az Stok" : "Stokta";
}

function getPublicPowerLabel(
  row: ProductRow,
  defaultVariant: (typeof productVariants.$inferSelect) | undefined,
  base?: ProductModel
) {
  if (defaultVariant?.powerLabel) {
    return defaultVariant.powerLabel;
  }

  if (row.powerKw) {
    return `${row.powerKw}kW ${row.chargeType?.toUpperCase() ?? "AC"}`;
  }

  return base?.powerLabel ?? "AC";
}

function mapAdminProductToPublicProduct(
  row: ProductRow,
  collections: ProductCollections
): ProductModel {
  const base = marketingProducts.find((item) => item.slug === row.slug);
  const variants = collections.variants.get(row.id) ?? [];
  const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0];
  const tags = collections.tags.get(row.id) ?? [];
  const categorySlugs = collections.categories.get(row.id) ?? [];
  const specRows = collections.specs.get(row.id) ?? [];
  const mediaRows = [...(collections.media.get(row.id) ?? [])].sort(
    (left, right) => left.sortOrder - right.sortOrder
  );
  const priceKurus = defaultVariant?.priceKurus ?? row.defaultPriceKurus;
  const compareAtKurus =
    defaultVariant?.compareAtKurus ??
    row.discountedPriceKurus ??
    base?.compareAtKurus;
  const cableOptions = [
    ...new Set(
      variants
        .map((variant) => variant.cableLength)
        .filter((value): value is string => Boolean(value))
    )
  ];
  const specs =
    specRows.length > 0
      ? specRows.map((spec) => ({ groupName: spec.groupName, label: spec.label, value: spec.value }))
      : base?.specs ?? [];
  const media: ProductMediaModel[] = mediaRows.map((item, index) => ({
    url: item.url,
    altText: item.altText || `${row.name} görsel ${index + 1}`,
    mediaType: inferProductMediaType(item.url, item.mediaType),
    sortOrder: item.sortOrder,
    isPrimary: item.isPrimary
  }));
  const primaryImage =
    media.find((item) => item.isPrimary && item.mediaType === "image") ??
    media.find((item) => item.mediaType === "image");
  const publicBase: ProductModel = {
    id: base?.id ?? row.id,
    slug: row.slug,
    updatedAt: row.updatedAt.toISOString(),
    name: row.name,
    category: getPublicCategoryLabel(categorySlugs, base),
    badge: getPublicProductBadge(tags, base),
    tags: tags.length ? tags : base?.tags ?? [],
    summary: row.shortDescription || base?.summary || row.name,
    description: stripHtml(row.description) || base?.description || row.shortDescription,
    descriptionHtml: row.description,
    priceKurus,
    compareAtKurus: compareAtKurus && compareAtKurus > priceKurus ? compareAtKurus : undefined,
    stockLabel: getPublicStockLabel(defaultVariant?.stockQuantity ?? 0),
    powerLabel: getPublicPowerLabel(row, defaultVariant, base),
    cableOptions: cableOptions.length > 0 ? cableOptions : base?.cableOptions ?? ["Standart"],
    variants: variants.length
      ? variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          title: variant.title,
          powerLabel: variant.powerLabel ?? undefined,
          cableLength: variant.cableLength ?? undefined,
          connectorType: variant.connectorType ?? undefined,
          stockQuantity: variant.stockQuantity,
          priceKurus: variant.priceKurus,
          compareAtKurus: variant.compareAtKurus ?? undefined,
          isDefault: variant.isDefault
        }))
      : base?.variants,
    imageUrl: primaryImage?.url ?? base?.imageUrl,
    media: media.length ? media : base?.media,
    galleryItems: media.length
      ? media.map((item) => item.altText)
      : base?.galleryItems,
    specs,
    highlights: base?.highlights ?? [],
    useCases: row.useCase ? [row.useCase] : base?.useCases ?? [],
    seoIntent: row.searchKeywords?.length ? row.searchKeywords : base?.seoIntent ?? [],
    faqs: base?.faqs ?? []
  };
  const detailContent = mergeProductDetailContent(
    getDefaultProductDetailContent(publicBase),
    getProductDetailContentFromSchemaJsonLd(row.schemaJsonLd)
  );

  return {
    ...publicBase,
    galleryItems: detailContent.galleryItems,
    detailContent,
    highlights: detailContent.highlights,
    useCases: detailContent.useCases,
    seoIntent: detailContent.seoIntents,
    faqs: detailContent.faqs
  };
}

async function loadPublicProducts() {
  if (!hasDatabaseConfig()) {
    return marketingProducts;
  }

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.status, "active"))
      .orderBy(asc(productAdminSortOrderSql()), desc(products.updatedAt), desc(products.id));

    if (rows.length === 0) {
      return [];
    }

    const collections = await hydrateProductCollections(rows.map((row) => row.id), {
      includeSpecs: false
    });
    return rows.map((row) => mapAdminProductToPublicProduct(row, collections));
  } catch {
    console.warn("Public products could not be loaded. Falling back to marketing products.");
    return marketingProducts;
  }
}

export const listPublicProducts = unstable_cache(
  loadPublicProducts,
  ["public-products"],
  {
    revalidate: 300,
    tags: ["public-products"]
  }
);

function isUuidValue(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function listPublicProductsByIds(productIds: readonly string[]) {
  const uniqueIds = [...new Set(productIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return [];
  }

  const fallbackProducts = uniqueIds
    .map((id) => marketingProducts.find((product) => product.id === id))
    .filter((product): product is ProductModel => Boolean(product));
  const databaseIds = uniqueIds.filter(isUuidValue);

  if (!hasDatabaseConfig() || databaseIds.length === 0) {
    return fallbackProducts;
  }

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.status, "active"), inArray(products.id, databaseIds)));
    const collections = await hydrateProductCollections(rows.map((row) => row.id), {
      includeMedia: false,
      includeSpecs: false,
      includeTags: false,
      includeVehicles: false,
      includeRelations: false
    });
    const productMap = new Map(
      rows.map((row) => {
        const product = mapAdminProductToPublicProduct(row, collections);
        return [product.id, product] as const;
      })
    );

    return uniqueIds
      .map((id) => productMap.get(id) ?? fallbackProducts.find((product) => product.id === id))
      .filter((product): product is ProductModel => Boolean(product));
  } catch {
    console.warn("Requested checkout products could not be loaded. Falling back to marketing data.");
    return fallbackProducts;
  }
}

export async function searchPublicProducts(query: string, limit = 12) {
  const normalizedQuery = query.trim();
  const safeLimit = Math.min(Math.max(limit, 1), 24);

  if (!normalizedQuery) {
    return [];
  }

  const fallbackProducts = marketingProducts
    .filter((product) =>
      [
        product.name,
        product.slug,
        product.summary,
        product.description,
        product.category,
        product.powerLabel,
        ...product.highlights,
        ...product.useCases,
        ...product.seoIntent
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(normalizedQuery.toLocaleLowerCase("tr-TR"))
    )
    .slice(0, safeLimit);

  if (!hasDatabaseConfig()) {
    return fallbackProducts;
  }

  try {
    const db = getDb();
    const pattern = "%" + normalizedQuery + "%";
    const rows = await withCollectionReadFallback(
      "public search",
      db
            .select()
            .from(products)
            .where(
              and(
                eq(products.status, "active"),
                or(
                  ilike(products.name, pattern),
                  ilike(products.slug, pattern),
                  ilike(products.shortDescription, pattern),
                  ilike(products.description, pattern),
                  ilike(products.useCase, pattern),
                  ilike(products.powerKw, pattern),
                  ilike(products.connectorType, pattern)
                )
              )
            )
            .orderBy(desc(products.updatedAt), desc(products.id))
            .limit(safeLimit),
      []
    );
    const collections = await hydrateProductCollections(rows.map((row) => row.id), {
      includeSpecs: false,
      includeVehicles: false,
      includeRelations: false
    });

    return rows.map((row) => mapAdminProductToPublicProduct(row, collections));
  } catch {
    console.warn("Public product search could not be loaded. Falling back to marketing data.");
    return fallbackProducts;
  }
}

export async function listPublicMerchandisingProducts(
  slotKey: PublicMerchandisingSlotKey,
  fallbackProducts: ProductModel[],
  limit: number
) {
  const fallback = fallbackProducts.slice(0, limit);

  if (!hasDatabaseConfig()) {
    return fallback;
  }

  try {
    const db = getDb();
    const rows = await db
      .select({
        productId: merchandisingSlots.productId
      })
      .from(merchandisingSlots)
      .where(and(eq(merchandisingSlots.slotKey, slotKey), eq(merchandisingSlots.isActive, true)))
      .orderBy(asc(merchandisingSlots.sortOrder), asc(merchandisingSlots.createdAt));

    const productMap = new Map(fallbackProducts.map((product) => [product.id, product]));
    const selectedProducts = rows
      .map((row) => (row.productId ? productMap.get(row.productId) : undefined))
      .filter((product): product is ProductModel => Boolean(product))
      .slice(0, limit);

    return selectedProducts.length > 0 ? selectedProducts : fallback;
  } catch {
    console.warn('Public merchandising slot "' + slotKey + '" could not be loaded. Falling back to product order.');
    return fallback;
  }
}

async function loadPublicProductSlugs() {
  const fallbackSlugs = marketingProducts.map((product) => product.slug);

  if (!hasDatabaseConfig()) {
    return fallbackSlugs;
  }

  try {
    const db = getDb();
    const rows = await db
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.status, "active"))
      .orderBy(desc(products.updatedAt), desc(products.id));

    return rows.map((row) => row.slug);
  } catch {
    console.warn("Public product slugs could not be loaded. Falling back to marketing slugs.");
    return fallbackSlugs;
  }
}

export const listPublicProductSlugs = unstable_cache(
  loadPublicProductSlugs,
  ["public-product-slugs"],
  {
    revalidate: 300,
    tags: ["public-products"]
  }
);

async function loadPublicProductBySlug(slug: string) {
  const fallbackProduct = marketingProducts.find((product) => product.slug === slug);

  if (!hasDatabaseConfig()) {
    return fallbackProduct;
  }

  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.status, "active")))
      .limit(1);

    if (!row) {
      return undefined;
    }

    const collections = await hydrateProductCollections([row.id]);

    return mapAdminProductToPublicProduct(row, collections);
  } catch {
    console.warn(`Public product "${slug}" could not be loaded. Falling back to marketing data.`);
    return fallbackProduct;
  }
}

export const getPublicProductBySlug = unstable_cache(
  loadPublicProductBySlug,
  ["public-product-by-slug"],
  {
    revalidate: 300,
    tags: ["public-products"]
  }
);

export async function getPublicRelatedProducts(product: ProductModel, limit = 3) {
  const safeLimit = Math.min(Math.max(limit, 1), 8);
  const rankCandidates = (candidates: ProductModel[]) =>
    candidates
      .filter((candidate) => candidate.id !== product.id)
      .map((candidate) => ({
        product: candidate,
        score:
          (candidate.category === product.category ? 4 : 0) +
          candidate.seoIntent.filter((intent) => product.seoIntent.includes(intent)).length +
          candidate.useCases.filter((useCase) => product.useCases.includes(useCase)).length
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, safeLimit)
      .map((item) => item.product);
  const fallbackCandidates = marketingProducts.filter((candidate) => candidate.slug !== product.slug);

  if (!hasDatabaseConfig()) {
    return rankCandidates(fallbackCandidates);
  }

  try {
    const db = getDb();
    const [sourceRow] = await db
      .select({ categoryId: products.categoryId })
      .from(products)
      .where(and(eq(products.slug, product.slug), eq(products.status, "active")))
      .limit(1);
    const candidateRows = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.status, "active"),
          ne(products.slug, product.slug),
          sourceRow?.categoryId ? eq(products.categoryId, sourceRow.categoryId) : undefined
        )
      )
      .orderBy(desc(products.updatedAt), desc(products.id))
      .limit(Math.max(safeLimit * 3, 12));
    const collections = await hydrateProductCollections(candidateRows.map((row) => row.id), {
      includeSpecs: false,
      includeVehicles: false,
      includeRelations: false
    });

    return rankCandidates(
      candidateRows.map((row) => mapAdminProductToPublicProduct(row, collections))
    );
  } catch {
    console.warn("Related products could not be loaded. Falling back to marketing data.");
    return rankCandidates(fallbackCandidates);
  }
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

type NormalizedProductVariant = ReturnType<typeof normalizeProductVariants>[number];

function findDuplicateValue(values: string[]) {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      return value;
    }

    seen.add(value);
  }

  return null;
}

async function assertProductWriteIsUnique(
  db: ReturnType<typeof getDb>,
  productId: string | undefined,
  slug: string,
  variants: NormalizedProductVariant[]
) {
  const duplicateSku = findDuplicateValue(variants.map((variant) => variant.sku));

  if (duplicateSku) {
    throw new AdminProductConflictError(
      `${duplicateSku} SKU değeri form içinde birden fazla kez kullanılmış.`
    );
  }

  const [slugConflict] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (slugConflict && slugConflict.id !== productId) {
    throw new AdminProductConflictError(
      "Bu slug ile kayıtlı başka bir ürün var. Lütfen benzersiz bir slug kullanın."
    );
  }

  const skus = variants.map((variant) => variant.sku);

  if (skus.length === 0) {
    return;
  }

  const skuConflicts = await db
    .select({
      sku: productVariants.sku,
      productId: productVariants.productId
    })
    .from(productVariants)
    .where(inArray(productVariants.sku, skus));
  const conflictingSku = skuConflicts.find((variant) => variant.productId !== productId);

  if (conflictingSku) {
    throw new AdminProductConflictError(
      `${conflictingSku.sku} SKU değeri başka bir üründe kullanılıyor.`
    );
  }
}

async function writeProductVariants(
  productId: string,
  input: ProductInput,
  normalizedVariants?: NormalizedProductVariant[],
  actor?: AdminSessionPayload | null
) {
  const db = getDb();
  const variants = normalizedVariants ?? normalizeProductVariants(input);
  const existing = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      stockQuantity: productVariants.stockQuantity
    })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
  const existingIds = new Set(existing.map((variant) => variant.id));
  const existingIdBySku = new Map(existing.map((variant) => [variant.sku, variant.id]));
  const retainedExistingIds = new Set<string>();

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
    const targetVariantId =
      variant.id && existingIds.has(variant.id)
        ? variant.id
        : existingIdBySku.get(variant.sku);

    if (targetVariantId) {
      const previousVariant = existing.find((item) => item.id === targetVariantId);
      await db
        .update(productVariants)
        .set(values)
        .where(and(eq(productVariants.id, targetVariantId), eq(productVariants.productId, productId)));
      const previousStock = previousVariant?.stockQuantity ?? 0;
      if (previousStock !== variant.stockQuantity) {
        await db.insert(inventoryMovements).values({
          productId,
          variantId: targetVariantId,
          sku: variant.sku,
          quantityBefore: previousStock,
          quantityAfter: variant.stockQuantity,
          quantityDelta: variant.stockQuantity - previousStock,
          reason: "manual_update",
          note: "Admin ürün formu üzerinden stok güncellendi.",
          adminUserId: actor?.sub ?? null
        });
      }
      retainedExistingIds.add(targetVariantId);
      continue;
    }

    const [createdVariant] = await db
      .insert(productVariants)
      .values(values)
      .returning({ id: productVariants.id });

    await db.insert(inventoryMovements).values({
      productId,
      variantId: createdVariant.id,
      sku: variant.sku,
      quantityBefore: 0,
      quantityAfter: variant.stockQuantity,
      quantityDelta: variant.stockQuantity,
      reason: "product_created",
      note: "Admin ürün formu üzerinden varyant oluşturuldu.",
      adminUserId: actor?.sub ?? null
    });
  }

  const removableIds = existing
    .map((variant) => variant.id)
    .filter((id) => !retainedExistingIds.has(id));

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
      const previousVariant = existing.find((variant) => variant.id === id);
      await db
        .update(productVariants)
        .set({ isDefault: false, stockQuantity: 0 })
        .where(eq(productVariants.id, id));
      await db.insert(inventoryMovements).values({
        productId,
        variantId: id,
        sku: previousVariant?.sku ?? null,
        quantityBefore: previousVariant?.stockQuantity ?? 0,
        quantityAfter: 0,
        quantityDelta: -(previousVariant?.stockQuantity ?? 0),
        reason: "variant_archived",
        note: "Sipariş veya sepet bağı olan varyant silinemedi, stok sıfırlandı.",
        adminUserId: actor?.sub ?? null
      });
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

async function hydrateProductCollections(
  productIds: string[],
  options: ProductCollectionOptions = {}
) {
  const db = getDb();
  const includeMedia = options.includeMedia ?? true;
  const includeSpecs = options.includeSpecs ?? true;
  const includeTags = options.includeTags ?? true;
  const includeVehicles = options.includeVehicles ?? true;
  const includeRelations = options.includeRelations ?? true;
  const toleratePartial = options.toleratePartial ?? false;

  if (productIds.length === 0) {
    return createEmptyProductCollections();
  }

  const specRowsPromise: Promise<(typeof productSpecs.$inferSelect)[]> = includeSpecs
    ? collectionRead(
        "specs",
        db
          .select()
          .from(productSpecs)
          .where(inArray(productSpecs.productId, productIds)),
        [],
        toleratePartial
      )
    : Promise.resolve([]);
  const mediaRowsPromise: Promise<(typeof productMedia.$inferSelect)[]> = includeMedia
    ? collectionRead(
        "media",
        db
          .select()
          .from(productMedia)
          .where(inArray(productMedia.productId, productIds)),
        [],
        toleratePartial
      )
    : Promise.resolve([]);
  const tagRowsPromise: Promise<(typeof productTagAssignments.$inferSelect)[]> = includeTags
    ? collectionRead(
        "tags",
        db
          .select()
          .from(productTagAssignments)
          .where(inArray(productTagAssignments.productId, productIds)),
        [],
        toleratePartial
      )
    : Promise.resolve([]);
  const vehicleRowsPromise: Promise<(typeof productVehicleCompatibilities.$inferSelect)[]> =
    includeVehicles
      ? collectionRead(
          "vehicles",
          db
            .select()
            .from(productVehicleCompatibilities)
            .where(inArray(productVehicleCompatibilities.productId, productIds)),
          [],
          toleratePartial
        )
      : Promise.resolve([]);
  const relationRowsPromise: Promise<(typeof productRelations.$inferSelect)[]> = includeRelations
    ? collectionRead(
        "relations",
        db
          .select()
          .from(productRelations)
          .where(inArray(productRelations.productId, productIds)),
        [],
        toleratePartial
      )
    : Promise.resolve([]);
  const [variantsRows, mediaRows, specRows, tagRows, categoryRows, vehicleRows, relationRows] =
    await Promise.all([
      collectionRead(
        "variants",
        db
          .select()
          .from(productVariants)
          .where(inArray(productVariants.productId, productIds)),
        [],
        toleratePartial
      ),
      mediaRowsPromise,
      specRowsPromise,
      tagRowsPromise,
      collectionRead(
        "categories",
        db
          .select({
            productId: productCategoryAssignments.productId,
            slug: categories.slug
          })
          .from(productCategoryAssignments)
          .innerJoin(categories, eq(categories.id, productCategoryAssignments.categoryId))
          .where(inArray(productCategoryAssignments.productId, productIds)),
        [],
        toleratePartial
      ),
      vehicleRowsPromise,
      relationRowsPromise
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

  const sortedMedia = [...input.media].sort((left, right) => {
    const leftOrder = Number(left.sortOrder ?? 0);
    const rightOrder = Number(right.sortOrder ?? 0);

    return leftOrder - rightOrder;
  });

  if (sortedMedia.length > 0) {
    await db.insert(productMedia).values(
      sortedMedia.map((item, index) => ({
        productId,
        mediaType: item.mediaType ?? inferProductMediaType(item.url),
        url: item.url,
        altText: item.altText ?? "",
        isPrimary: item.isPrimary || index === 0,
        sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1
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

  if (input.brand) {
    conditions.push(eq(products.brandId, input.brand));
  }

  if (input.category) {
    const isCategoryUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        input.category
      );
    const categoryRows = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        isCategoryUuid
          ? or(eq(categories.id, input.category), eq(categories.slug, input.category))
          : eq(categories.slug, input.category)
      );

    if (categoryRows.length === 0) {
      return { items: [], nextCursor: null };
    }

    const assignments = await db
      .select({ productId: productCategoryAssignments.productId })
      .from(productCategoryAssignments)
      .where(
        inArray(
          productCategoryAssignments.categoryId,
          categoryRows.map((category) => category.id)
        )
      );

    if (assignments.length === 0) {
      return { items: [], nextCursor: null };
    }

    conditions.push(inArray(products.id, assignments.map((assignment) => assignment.productId)));
  }

  if (input.stock && ["low", "out", "available"].includes(input.stock)) {
    const variantRows = await db
      .select({
        productId: productVariants.productId,
        stockQuantity: productVariants.stockQuantity
      })
      .from(productVariants);
    const stockProductIds = new Set<string>();

    for (const variant of variantRows) {
      if (input.stock === "out" && variant.stockQuantity <= 0) {
        stockProductIds.add(variant.productId);
      }

      if (input.stock === "low" && variant.stockQuantity > 0 && variant.stockQuantity <= 3) {
        stockProductIds.add(variant.productId);
      }

      if (input.stock === "available" && variant.stockQuantity > 0) {
        stockProductIds.add(variant.productId);
      }
    }

    if (stockProductIds.size === 0) {
      return { items: [], nextCursor: null };
    }

    conditions.push(inArray(products.id, [...stockProductIds]));
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

  const orderByClauses =
    input.sort === "manual_order"
      ? [asc(productAdminSortOrderSql()), desc(products.updatedAt), desc(products.id)]
      : input.sort === "name_asc"
      ? [asc(products.name), desc(products.id)]
      : input.sort === "price_desc"
        ? [desc(products.defaultPriceKurus), desc(products.id)]
        : input.sort === "stock_asc"
          ? [
              sql`(
                select min(${productVariants.stockQuantity})
                from ${productVariants}
                where ${productVariants.productId} = ${products.id}
              ) asc nulls last`,
              desc(products.id)
            ]
          : [desc(products.updatedAt), desc(products.id)];

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      shortDescription: products.shortDescription,
      status: products.status,
      defaultPriceKurus: products.defaultPriceKurus,
      discountedPriceKurus: products.discountedPriceKurus,
      schemaJsonLd: products.schemaJsonLd,
      updatedAt: products.updatedAt
    })
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderByClauses)
    .limit(input.limit + 1);

  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;
  const collections = await hydrateProductCollections(items.map((item) => item.id), {
    includeMedia: false,
    includeSpecs: false,
    includeTags: false,
    includeVehicles: false,
    includeRelations: false,
    toleratePartial: true
  });

  return {
    items: items.map((item) => {
      const variants = collections.variants.get(item.id) ?? [];
      const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0];
      const media = collections.media.get(item.id) ?? [];
      return {
        ...item,
        sortOrder: getProductAdminSortOrder(item.schemaJsonLd),
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

export async function updateAdminProductStatuses(
  ids: string[],
  status: typeof products.$inferSelect.status,
  actor: AdminSessionPayload | null,
  requestMeta?: {
    ipAddress?: string | null;
    userAgent?: string | null;
  }
) {
  if (!hasDatabaseConfig()) {
    return { updatedCount: ids.length };
  }

  const db = getDb();
  const beforeRows = await db.select().from(products).where(inArray(products.id, ids));

  if (beforeRows.length === 0) {
    return { updatedCount: 0 };
  }

  await db
    .update(products)
    .set({ status, updatedAt: new Date() })
    .where(inArray(products.id, beforeRows.map((item) => item.id)));

  for (const product of beforeRows) {
    await recordAuditLog({
      db,
      actor,
      entityType: "product",
      entityId: product.id,
      action: status === "archived" ? "archive" : "status_update",
      summary: `${product.name} ürünü ${status} durumuna alındı.`,
      beforePayload: product,
      afterPayload: { ...product, status },
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });
    revalidateProductSurfaces(product.slug);
  }

  return { updatedCount: beforeRows.length };
}

export async function deleteAdminProducts(
  ids: string[],
  actor: AdminSessionPayload | null,
  requestMeta?: {
    ipAddress?: string | null;
    userAgent?: string | null;
  }
) {
  const blocked: Array<{ id: string; name: string; reason: string }> = [];

  if (!hasDatabaseConfig()) {
    return { deletedCount: ids.length, blocked };
  }

  const db = getDb();
  const beforeRows = await db.select().from(products).where(inArray(products.id, ids));
  const productIds = beforeRows.map((product) => product.id);

  if (productIds.length === 0) {
    return { deletedCount: 0, blocked };
  }

  const variants = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(inArray(productVariants.productId, productIds));
  const variantIds = variants.map((variant) => variant.id);

  await db.delete(campaignProducts).where(inArray(campaignProducts.productId, productIds));
  if (variantIds.length > 0) {
    await db.delete(cartItems).where(inArray(cartItems.variantId, variantIds));
    await db
      .update(orderItems)
      .set({ productId: null, variantId: null })
      .where(or(inArray(orderItems.productId, productIds), inArray(orderItems.variantId, variantIds)));
  } else {
    await db.update(orderItems).set({ productId: null }).where(inArray(orderItems.productId, productIds));
  }
  await db
    .update(merchandisingSlots)
    .set({ productId: null, updatedAt: new Date() })
    .where(inArray(merchandisingSlots.productId, productIds));
  await db
    .delete(productRelations)
    .where(
      or(
        inArray(productRelations.productId, productIds),
        inArray(productRelations.relatedProductId, productIds)
      )
    );
  await db.delete(productCategoryAssignments).where(inArray(productCategoryAssignments.productId, productIds));
  await db.delete(productTagAssignments).where(inArray(productTagAssignments.productId, productIds));
  await db.delete(productVehicleCompatibilities).where(inArray(productVehicleCompatibilities.productId, productIds));
  await db.delete(productReviews).where(inArray(productReviews.productId, productIds));
  await db.delete(productMedia).where(inArray(productMedia.productId, productIds));
  await db.delete(productSpecs).where(inArray(productSpecs.productId, productIds));
  await db.delete(inventoryMovements).where(inArray(inventoryMovements.productId, productIds));
  await db.delete(productVariants).where(inArray(productVariants.productId, productIds));
  await db.delete(products).where(inArray(products.id, productIds));

  await Promise.all(
    beforeRows.map((product) =>
      recordAuditLog({
        db,
        actor,
        entityType: "product",
        entityId: product.id,
        action: "delete",
        summary: product.name + " ürünü kalıcı olarak silindi.",
        beforePayload: product,
        afterPayload: null,
        ipAddress: requestMeta?.ipAddress,
        userAgent: requestMeta?.userAgent
      })
    )
  );
  beforeRows.forEach((product) => revalidateProductSurfaces(product.slug));

  return { deletedCount: beforeRows.length, blocked };
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

  const collections = await hydrateProductCollections([id], {
    toleratePartial: true
  });
  const variants = collections.variants.get(id) ?? [];
  const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0];

  return {
    ...product,
    detailContent: getProductDetailContentFromSchemaJsonLd(product.schemaJsonLd),
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
  const normalizedVariants = normalizeProductVariants(input);
  await assertProductWriteIsUnique(db, input.id, slug, normalizedVariants);
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
    hasBluetooth: input.hasBluetooth,
    hasRfid: input.hasRfid,
    has4g: input.has4g,
    installRequired: input.installRequired,
    searchKeywords: input.searchKeywords,
    adminNotes: input.adminNotes || null,
    updatedAt: new Date()
  };

  if (input.id) {
    const before = await getAdminProductById(input.id);

    if (!before) {
      return null;
    }

    await db.update(products).set(baseProductValues).where(eq(products.id, input.id));

    await writeProductCollections(
      input.id,
      input,
      actor,
      requestMeta?.ipAddress,
      requestMeta?.userAgent
    );
    await writeProductVariants(input.id, input, normalizedVariants, actor);

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

    revalidateProductSurfaces(slug);

    if (before.slug !== slug) {
      revalidatePath(`/urun/${before.slug}`);
    }

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
  await writeProductVariants(createdProduct.id, input, normalizedVariants, actor);

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

  revalidateProductSurfaces(slug);

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
  await ensureMarketingBlogPosts(db);
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
  await ensureMarketingBlogPosts(db);
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return post ?? null;
}

async function ensureMarketingBlogPosts(db = getDb()) {
  const seedPosts = getMarketingBlogSeedPosts();

  if (seedPosts.length === 0) {
    return;
  }

  await db.insert(blogPosts).values(seedPosts).onConflictDoNothing();
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

    revalidateBlogSurfaces(after?.slug ?? slug);
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

  revalidateBlogSurfaces(created.slug);
  return created;
}

async function loadAdminCatalog() {
  if (!hasDatabaseConfig()) {
    return { brands: [], categories: [] };
  }

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
    description: input.description || null,
    isActive: input.isActive,
    deletedAt: input.isActive ? null : new Date()
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
    revalidatePublicCatalog({ revalidateAllProductPages: true });
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
  revalidatePublicCatalog({ revalidateAllProductPages: true });
  return created;
}

export async function deleteAdminBrand(
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return { deletedCount: 0, blockedReason: null };
  }

  const db = getDb();
  const [before] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);

  if (!before) {
    return { deletedCount: 0, blockedReason: "Marka bulunamadı." };
  }

  const [productReference] = await db
    .select({ total: count() })
    .from(products)
    .where(eq(products.brandId, id));

  if (Number(productReference?.total ?? 0) > 0) {
    return {
      deletedCount: 0,
      blockedReason: "Bu markaya bağlı ürünler var. Önce ürünleri başka markaya taşıyın veya markayı pasife alın."
    };
  }

  await db.delete(brands).where(eq(brands.id, id));
  await recordAuditLog({
    db,
    actor,
    entityType: "brand",
    entityId: id,
    action: "delete",
    summary: `${before.name} markası kalıcı olarak silindi.`,
    beforePayload: before,
    afterPayload: null,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });
  revalidateTag("admin-catalog");
  revalidatePublicCatalog({ revalidateAllProductPages: true });
  return { deletedCount: 1, blockedReason: null };
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
    parentId: input.parentId ?? null,
    isActive: input.isActive,
    deletedAt: input.isActive ? null : new Date()
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
    revalidatePublicCatalog({ revalidateAllProductPages: true });
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
  revalidatePublicCatalog({ revalidateAllProductPages: true });
  return created;
}

export async function deleteAdminCategory(
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return { deletedCount: 0, blockedReason: null };
  }

  const db = getDb();
  const [before] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);

  if (!before) {
    return { deletedCount: 0, blockedReason: "Kategori bulunamadı." };
  }

  const [childReference] = await db
    .select({ total: count() })
    .from(categories)
    .where(eq(categories.parentId, id));
  const [primaryProductReference] = await db
    .select({ total: count() })
    .from(products)
    .where(eq(products.categoryId, id));
  const [assignedProductReference] = await db
    .select({ total: count() })
    .from(productCategoryAssignments)
    .where(eq(productCategoryAssignments.categoryId, id));

  if (
    Number(childReference?.total ?? 0) > 0 ||
    Number(primaryProductReference?.total ?? 0) > 0 ||
    Number(assignedProductReference?.total ?? 0) > 0
  ) {
    return {
      deletedCount: 0,
      blockedReason:
        "Bu kategori ürün veya alt kategori bağlantısı taşıyor. Önce bağlantıları taşıyın veya kategoriyi pasife alın."
    };
  }

  await db.delete(categories).where(eq(categories.id, id));
  await recordAuditLog({
    db,
    actor,
    entityType: "category",
    entityId: id,
    action: "delete",
    summary: `${before.name} kategorisi kalıcı olarak silindi.`,
    beforePayload: before,
    afterPayload: null,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });
  revalidateTag("admin-catalog");
  revalidatePublicCatalog({ revalidateAllProductPages: true });
  return { deletedCount: 1, blockedReason: null };
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
