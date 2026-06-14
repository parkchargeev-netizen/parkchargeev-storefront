import { unstable_cache } from "next/cache";
import { desc, eq, and } from "drizzle-orm";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { formatPublicNavigationLabel } from "@/lib/public-navigation-labels";
import { siteConfig } from "@/lib/site";
import { getDb } from "@/server/db/client";
import { navigationItems, sitePages } from "@/server/db/schema";

const retiredPublicHrefs = new Set(["/harita"]);
const retiredPublicSlugs = new Set(["harita"]);

export type PublicNavigationItem = {
  id?: string;
  label: string;
  href: string;
  opensInNewTab?: boolean;
  rel?: string | null;
};

export type PublicSiteNavigation = {
  primary: ReadonlyArray<PublicNavigationItem>;
  footer: ReadonlyArray<PublicNavigationItem>;
  legal: ReadonlyArray<PublicNavigationItem>;
};

function fallbackNavigation(): PublicSiteNavigation {
  return {
    primary: filterRetiredNavigation(siteConfig.primaryNavigation),
    footer: filterRetiredNavigation(siteConfig.footerNavigation),
    legal: filterRetiredNavigation(siteConfig.legalNavigation)
  };
}

function filterRetiredNavigation<T extends PublicNavigationItem>(items: readonly T[]) {
  return items.filter((item) => !retiredPublicHrefs.has(item.href));
}

async function loadPublicSiteNavigation(): Promise<PublicSiteNavigation> {
  if (!hasDatabaseConfig()) {
    return fallbackNavigation();
  }

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(navigationItems)
      .where(eq(navigationItems.isActive, true))
      .orderBy(navigationItems.area, navigationItems.sortOrder, navigationItems.label);

    if (rows.length === 0) {
      return fallbackNavigation();
    }

    const navigation: Record<keyof PublicSiteNavigation, PublicNavigationItem[]> = {
      primary: [],
      footer: [],
      legal: []
    };

    for (const row of rows) {
      if (retiredPublicHrefs.has(row.href)) {
        continue;
      }

      navigation[row.area].push({
        id: row.id,
        label: formatPublicNavigationLabel({ href: row.href, label: row.label }),
        href: row.href,
        opensInNewTab: row.opensInNewTab,
        rel: row.rel
      });
    }

    return {
      primary: navigation.primary.length > 0 ? navigation.primary : fallbackNavigation().primary,
      footer: navigation.footer.length > 0 ? navigation.footer : fallbackNavigation().footer,
      legal: navigation.legal.length > 0 ? navigation.legal : fallbackNavigation().legal
    };
  } catch (error) {
    console.warn("Public navigation could not be loaded.", error);
    return fallbackNavigation();
  }
}

export const getPublicSiteNavigation = unstable_cache(
  loadPublicSiteNavigation,
  ["public-site-navigation"],
  { revalidate: 300, tags: ["site-navigation"] }
);

export const getPublishedSitePageBySlug = unstable_cache(
  async (slug: string) => {
    if (!hasDatabaseConfig()) {
      return null;
    }

    try {
      const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");

      if (retiredPublicSlugs.has(normalizedSlug)) {
        return null;
      }

      const db = getDb();
      const [page] = await db
        .select()
        .from(sitePages)
        .where(and(eq(sitePages.slug, normalizedSlug), eq(sitePages.status, "published")))
        .limit(1);

      return page ?? null;
    } catch (error) {
      console.warn("Published site page could not be loaded.", error);
      return null;
    }
  },
  ["published-site-page"],
  { revalidate: 300, tags: ["site-pages"] }
);

export const listPublishedSitePagesForSitemap = unstable_cache(
  async () => {
    if (!hasDatabaseConfig()) {
      return [];
    }

    try {
      const db = getDb();
      const pages = await db
        .select({
          slug: sitePages.slug,
          updatedAt: sitePages.updatedAt,
          sitemapPriority: sitePages.sitemapPriority,
          changeFrequency: sitePages.changeFrequency
        })
        .from(sitePages)
        .where(
          and(
            eq(sitePages.status, "published"),
            eq(sitePages.showInSitemap, true),
            eq(sitePages.noIndex, false)
          )
        )
        .orderBy(desc(sitePages.updatedAt));

      return pages.filter((page) => !retiredPublicSlugs.has(page.slug));
    } catch (error) {
      console.warn("Published site pages for sitemap could not be loaded.", error);
      return [];
    }
  },
  ["published-site-pages-sitemap"],
  { revalidate: 300, tags: ["site-pages"] }
);
