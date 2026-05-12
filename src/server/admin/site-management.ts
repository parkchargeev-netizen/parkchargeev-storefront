import { revalidateTag, unstable_cache } from "next/cache";
import { and, desc, eq, ilike, lt, or } from "drizzle-orm";
import { z } from "zod";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { slugify } from "@/lib/slug";
import { recordAuditLog } from "@/server/admin/audit";
import type {
  adminListQuerySchema,
  adminNavigationItemSchema,
  adminSitePageSchema
} from "@/server/admin/validators";
import type { AdminSessionPayload } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { navigationItems, sitePages } from "@/server/db/schema";

type ListQueryInput = z.infer<typeof adminListQuerySchema>;
type NavigationItemInput = z.infer<typeof adminNavigationItemSchema>;
type SitePageInput = z.infer<typeof adminSitePageSchema>;

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
      summary: `${input.label} navigasyon kaydi guncellendi.`,
      beforePayload: before,
      afterPayload: after,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });

    revalidateTag("site-navigation");
    return after;
  }

  const [created] = await db.insert(navigationItems).values(values).returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "navigation_item",
    entityId: created.id,
    action: "create",
    summary: `${created.label} navigasyon kaydi olusturuldu.`,
    afterPayload: created,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateTag("site-navigation");
  return created;
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
      summary: `${input.title} sayfasi guncellendi.`,
      beforePayload: before,
      afterPayload: after,
      ipAddress: requestMeta?.ipAddress,
      userAgent: requestMeta?.userAgent
    });

    revalidateTag("site-pages");
    return after;
  }

  const [created] = await db.insert(sitePages).values(values).returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "site_page",
    entityId: created.id,
    action: "create",
    summary: `${created.title} sayfasi olusturuldu.`,
    afterPayload: created,
    ipAddress: requestMeta?.ipAddress,
    userAgent: requestMeta?.userAgent
  });

  revalidateTag("site-pages");
  return created;
}
