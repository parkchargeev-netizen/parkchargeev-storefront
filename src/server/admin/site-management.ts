import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { and, asc, desc, eq, ilike, inArray, lt, or } from "drizzle-orm";
import { z } from "zod";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { logWarn } from "@/lib/server-logger";
import type { ProductModel } from "@/lib/mock-data";
import { slugify } from "@/lib/slug";
import { recordAuditLog } from "@/server/admin/audit";
import type {
  adminListQuerySchema,
  adminMerchandisingSlotsSchema,
  adminNavigationItemSchema,
  adminSiteSettingsSchema,
  adminSitePageSchema
} from "@/server/admin/validators";
import type { AdminSessionPayload } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { merchandisingSlots, navigationItems, products as productRows, sitePages, siteSettings } from "@/server/db/schema";
import { normalizePublicSiteSettings } from "@/lib/site-settings";
import { listPublicProducts, publicProductMerchandisingSections } from "@/server/admin/repository";
import { SITE_SETTINGS_KEY, rowToPublicSiteSettings } from "@/server/site/settings";

type ListQueryInput = z.infer<typeof adminListQuerySchema>;
type MerchandisingSlotsInput = z.infer<typeof adminMerchandisingSlotsSchema>;
type NavigationItemInput = z.infer<typeof adminNavigationItemSchema>;
type SitePageInput = z.infer<typeof adminSitePageSchema>;
type SiteSettingsInput = z.infer<typeof adminSiteSettingsSchema>;

const navigationAreas = ["primary", "footer", "legal"] as const;
const sitePageStatuses = ["draft", "published", "archived"] as const;

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

function normalizeSlug(slug: string) {
  return slugify(slug.replace(/^\/+|\/+$/g, ""));
}

function isNavigationArea(value?: string): value is (typeof navigationAreas)[number] {
  return Boolean(value && navigationAreas.includes(value as (typeof navigationAreas)[number]));
}

function isSitePageStatus(value?: string): value is (typeof sitePageStatuses)[number] {
  return Boolean(value && sitePageStatuses.includes(value as (typeof sitePageStatuses)[number]));
}

function revalidateSiteManagementCaches(slug?: string) {
  revalidateTag("site-pages");
  revalidateTag("site-navigation");
  revalidateTag("site-settings");
  revalidatePath("/admin");
  revalidatePath("/admin/site");
  revalidatePath("/", "layout");
  revalidatePath("/iletisim");
  revalidatePath("/sitemap.xml");

  if (slug) {
    revalidatePath(`/${slug}`);
  }
}

function getSiteSettingsValues(input: SiteSettingsInput) {
  return {
    brandName: input.brandName,
    description: input.description,
    logoUrl: input.logoUrl || null,
    logoAlt: input.logoAlt || input.brandName,
    phone: input.phone,
    email: input.email,
    whatsappPhone: input.whatsappPhone,
    supportHours: input.supportHours,
    streetAddress: input.streetAddress,
    addressLocality: input.addressLocality,
    addressRegion: input.addressRegion,
    postalCode: input.postalCode || "",
    addressCountry: input.addressCountry || "TR",
    mapEmbedUrl: input.mapEmbedUrl || null,
    maintenanceMode: input.maintenanceMode,
    maintenanceMessage: input.maintenanceMessage || null,
    shippingSettings: input.shippingSettings,
    taxSettings: input.taxSettings,
    paymentSettings: input.paymentSettings,
    serviceAreas: input.serviceAreas,
    socials: input.socials,
    updatedAt: new Date()
  };
}

async function loadAdminNavigationItems(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const db = getDb();
  const conditions = [];
  const cursor = decodeCursor(input.cursor);

  if (input.q) {
    conditions.push(or(ilike(navigationItems.label, `%${input.q}%`), ilike(navigationItems.href, `%${input.q}%`)));
  }

  if (isNavigationArea(input.status)) {
    conditions.push(eq(navigationItems.area, input.status));
  }

  if (cursor) {
    conditions.push(
      or(
        lt(navigationItems.updatedAt, new Date(cursor.updatedAt)),
        and(eq(navigationItems.updatedAt, new Date(cursor.updatedAt)), lt(navigationItems.id, cursor.id))
      )
    );
  }

  const rows = await db
    .select()
    .from(navigationItems)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(navigationItems.area, navigationItems.sortOrder, navigationItems.label)
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

export const listAdminNavigationItems = unstable_cache(
  loadAdminNavigationItems,
  ["admin-navigation-items"],
  {
    revalidate: 120,
    tags: ["site-navigation"]
  }
);

export async function getAdminNavigationItemById(id: string) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const [item] = await db.select().from(navigationItems).where(eq(navigationItems.id, id)).limit(1);
  return item ?? null;
}

export async function upsertAdminNavigationItem(
  input: NavigationItemInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const values = {
    area: input.area,
    label: input.label,
    href: input.href,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    opensInNewTab: input.opensInNewTab,
    rel: input.rel || null,
    updatedAt: new Date()
  };

  if (input.id) {
    const [before] = await db.select().from(navigationItems).where(eq(navigationItems.id, input.id)).limit(1);
    await db.update(navigationItems).set(values).where(eq(navigationItems.id, input.id));
    const [after] = await db.select().from(navigationItems).where(eq(navigationItems.id, input.id)).limit(1);

    await recordAuditLog({
      db,
      actor,
      entityType: "navigation_item",
      entityId: input.id,
      action: "update",
      summary: `${input.label} navigasyon kaydı güncellendi.`,
      beforePayload: before,
      afterPayload: after,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });

    revalidateSiteManagementCaches();
    return after;
  }

  const [created] = await db.insert(navigationItems).values(values).returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "navigation_item",
    entityId: created.id,
    action: "create",
    summary: `${created.label} navigasyon kaydı oluşturuldu.`,
    afterPayload: created,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateSiteManagementCaches();
  return created;
}

export async function deleteAdminNavigationItem(
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const [before] = await db.select().from(navigationItems).where(eq(navigationItems.id, id)).limit(1);

  if (!before) {
    revalidateSiteManagementCaches();
    return null;
  }

  await db.delete(navigationItems).where(eq(navigationItems.id, id));

  try {
    await recordAuditLog({
      db,
      actor,
      entityType: "navigation_item",
      entityId: id,
      action: "delete",
      summary: `${before.label} navigasyon kaydı silindi.`,
      beforePayload: before,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });
  } catch (error) {
    logWarn("admin.navigation_item.delete_audit_failed", {
      navigationItemId: id,
      message: error instanceof Error ? error.message : "unknown"
    });
  }

  revalidateSiteManagementCaches();
  return before;
}

export async function getAdminSiteSettings() {
  if (!hasDatabaseConfig()) {
    return normalizePublicSiteSettings(null);
  }

  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.singletonKey, SITE_SETTINGS_KEY))
      .limit(1);

    return rowToPublicSiteSettings(row);
  } catch (error) {
    logWarn("admin.site_settings.load_failed", {
      message: error instanceof Error ? error.message : "unknown"
    });
    return normalizePublicSiteSettings(null);
  }
}

export async function upsertAdminSiteSettings(
  input: SiteSettingsInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const values = getSiteSettingsValues(input);
  const [before] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.singletonKey, SITE_SETTINGS_KEY))
    .limit(1);

  if (before) {
    await db
      .update(siteSettings)
      .set(values)
      .where(eq(siteSettings.singletonKey, SITE_SETTINGS_KEY));
  } else {
    await db.insert(siteSettings).values({
      singletonKey: SITE_SETTINGS_KEY,
      ...values
    });
  }

  const [after] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.singletonKey, SITE_SETTINGS_KEY))
    .limit(1);

  await recordAuditLog({
    db,
    actor,
    entityType: "site_settings",
    entityId: SITE_SETTINGS_KEY,
    action: before ? "update" : "create",
    summary: "Site genel ayarları güncellendi.",
    beforePayload: before ?? null,
    afterPayload: after ?? values,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateSiteManagementCaches();
  return rowToPublicSiteSettings(after);
}

async function loadAdminSitePages(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const db = getDb();
  const conditions = [];
  const cursor = decodeCursor(input.cursor);

  if (input.q) {
    conditions.push(or(ilike(sitePages.title, `%${input.q}%`), ilike(sitePages.slug, `%${input.q}%`)));
  }

  if (isSitePageStatus(input.status)) {
    conditions.push(eq(sitePages.status, input.status));
  }

  if (cursor) {
    conditions.push(
      or(
        lt(sitePages.updatedAt, new Date(cursor.updatedAt)),
        and(eq(sitePages.updatedAt, new Date(cursor.updatedAt)), lt(sitePages.id, cursor.id))
      )
    );
  }

  const rows = await db
    .select({
      id: sitePages.id,
      slug: sitePages.slug,
      title: sitePages.title,
      excerpt: sitePages.excerpt,
      status: sitePages.status,
      showInSitemap: sitePages.showInSitemap,
      noIndex: sitePages.noIndex,
      updatedAt: sitePages.updatedAt
    })
    .from(sitePages)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(sitePages.updatedAt), desc(sitePages.id))
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

export const listAdminSitePages = unstable_cache(loadAdminSitePages, ["admin-site-pages"], {
  revalidate: 120,
  tags: ["site-pages"]
});

export async function getAdminSitePageById(id: string) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const [page] = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
  return page ?? null;
}

export async function upsertAdminSitePage(
  input: SitePageInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const values = {
    slug: normalizeSlug(input.slug),
    title: input.title,
    eyebrow: input.eyebrow || null,
    excerpt: input.excerpt,
    body: input.body,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    ogImageUrl: input.ogImageUrl || null,
    status: input.status,
    showInSitemap: input.showInSitemap,
    noIndex: input.noIndex,
    sitemapPriority: input.sitemapPriority,
    changeFrequency: input.changeFrequency,
    updatedAt: new Date()
  };

  if (input.id) {
    const before = await getAdminSitePageById(input.id);
    await db.update(sitePages).set(values).where(eq(sitePages.id, input.id));
    const after = await getAdminSitePageById(input.id);

    await recordAuditLog({
      db,
      actor,
      entityType: "site_page",
      entityId: input.id,
      action: "update",
      summary: `${input.title} sayfası güncellendi.`,
      beforePayload: before,
      afterPayload: after,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });

    revalidateSiteManagementCaches(values.slug);
    return after;
  }

  const [created] = await db.insert(sitePages).values(values).returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "site_page",
    entityId: created.id,
    action: "create",
    summary: `${created.title} sayfası oluşturuldu.`,
    afterPayload: created,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateSiteManagementCaches(created.slug);
  return created;
}

export async function deleteAdminSitePage(
  id: string,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const [before] = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);

  if (!before) {
    revalidateSiteManagementCaches();
    return null;
  }

  const pageHref = `/${before.slug}`;

  await db.transaction(async (tx) => {
    await tx.delete(sitePages).where(eq(sitePages.id, id));
    await tx.delete(navigationItems).where(eq(navigationItems.href, pageHref));
  });

  revalidateSiteManagementCaches(before.slug);

  try {
    await recordAuditLog({
      db,
      actor,
      entityType: "site_page",
      entityId: id,
      action: "delete",
      summary: `${before.title} sayfası silindi.`,
      beforePayload: before,
      afterPayload: { removedNavigationHref: pageHref },
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });
  } catch (error) {
    logWarn("admin.site_page.delete_audit_failed", {
      pageId: id,
      slug: before.slug,
      message: error instanceof Error ? error.message : "unknown"
    });
  }

  return before;
}

type AdminProductMerchandisingProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  powerLabel: string;
  stockLabel: string;
  imageUrl: string | null;
};

type AdminProductMerchandisingSlot = {
  id: string;
  slotKey: string;
  productId: string | null;
  sortOrder: number;
  isActive: boolean;
};

function getManagedMerchandisingSlotKeys() {
  return publicProductMerchandisingSections.map((section) => section.slotKey);
}

function mapPublicProductToMerchandisingOption(
  product: ProductModel
): AdminProductMerchandisingProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    powerLabel: product.powerLabel,
    stockLabel: product.stockLabel,
    imageUrl: product.imageUrl ?? null
  };
}

function revalidateProductMerchandisingCaches() {
  revalidateTag("public-products");
  revalidatePath("/");
  revalidatePath("/magaza");
  revalidatePath("/admin");
  revalidatePath("/admin/site");
}

export async function listAdminProductMerchandising(): Promise<{
  sections: typeof publicProductMerchandisingSections;
  products: AdminProductMerchandisingProduct[];
  slots: AdminProductMerchandisingSlot[];
}> {
  const productOptions = (await listPublicProducts()).map(mapPublicProductToMerchandisingOption);

  if (!hasDatabaseConfig()) {
    return {
      sections: publicProductMerchandisingSections,
      products: productOptions,
      slots: []
    };
  }

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: merchandisingSlots.id,
        slotKey: merchandisingSlots.slotKey,
        productId: merchandisingSlots.productId,
        sortOrder: merchandisingSlots.sortOrder,
        isActive: merchandisingSlots.isActive
      })
      .from(merchandisingSlots)
      .where(inArray(merchandisingSlots.slotKey, getManagedMerchandisingSlotKeys()))
      .orderBy(asc(merchandisingSlots.slotKey), asc(merchandisingSlots.sortOrder));

    return {
      sections: publicProductMerchandisingSections,
      products: productOptions,
      slots: rows
    };
  } catch (error) {
    logWarn("admin.product_merchandising.load_failed", {
      message: error instanceof Error ? error.message : "unknown"
    });

    return {
      sections: publicProductMerchandisingSections,
      products: productOptions,
      slots: []
    };
  }
}

function normalizeMerchandisingInput(input: MerchandisingSlotsInput, validProductIds: Set<string>) {
  const managedSlotKeys = new Set(getManagedMerchandisingSlotKeys());
  const seen = new Set<string>();

  return input.slots
    .filter((slot) => managedSlotKeys.has(slot.slotKey) && validProductIds.has(slot.productId))
    .sort((left, right) => left.slotKey.localeCompare(right.slotKey) || left.sortOrder - right.sortOrder)
    .filter((slot) => {
      const key = slot.slotKey + ":" + slot.productId;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .map((slot, index) => ({
      slotKey: slot.slotKey,
      productId: slot.productId,
      title:
        publicProductMerchandisingSections.find((section) => section.slotKey === slot.slotKey)?.title ??
        null,
      sortOrder: Number.isFinite(slot.sortOrder) ? slot.sortOrder : index,
      isActive: slot.isActive,
      updatedAt: new Date()
    }));
}

export async function updateAdminProductMerchandising(
  input: MerchandisingSlotsInput,
  actor: AdminSessionPayload | null,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    return listAdminProductMerchandising();
  }

  const db = getDb();
  const managedSlotKeys = getManagedMerchandisingSlotKeys();
  const requestedProductIds = [...new Set(input.slots.map((slot) => slot.productId))];
  const activeProductRowsPromise = requestedProductIds.length > 0
    ? db
        .select({ id: productRows.id })
        .from(productRows)
        .where(and(eq(productRows.status, "active"), inArray(productRows.id, requestedProductIds)))
    : Promise.resolve([] as Array<{ id: string }>);
  const [activeProductRows, beforeRows] = await Promise.all([
    activeProductRowsPromise,
    db.select().from(merchandisingSlots).where(inArray(merchandisingSlots.slotKey, managedSlotKeys))
  ]);
  const validProductIds = new Set(activeProductRows.map((product) => product.id));
  const values = normalizeMerchandisingInput(input, validProductIds);

  await db.transaction(async (tx) => {
    await tx.delete(merchandisingSlots).where(inArray(merchandisingSlots.slotKey, managedSlotKeys));

    if (values.length > 0) {
      await tx.insert(merchandisingSlots).values(values);
    }
  });

  const afterRows = await db
    .select()
    .from(merchandisingSlots)
    .where(inArray(merchandisingSlots.slotKey, managedSlotKeys));

  await recordAuditLog({
    db,
    actor,
    entityType: "product_merchandising",
    entityId: "public-product-slots",
    action: "update",
    summary: "Anasayfa ve mağaza ürün vitrinleri güncellendi.",
    beforePayload: beforeRows,
    afterPayload: afterRows,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateProductMerchandisingCaches();
  return listAdminProductMerchandising();
}
