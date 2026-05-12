import type { MetadataRoute } from "next";

import { articles, products, solutionPages } from "@/lib/mock-data";
import { absoluteUrl } from "@/lib/site";
import { listPublishedSitePagesForSitemap } from "@/server/site/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const managedPages = await listPublishedSitePagesForSitemap();
  const managedRouteSet = new Set(managedPages.map((page) => `/${page.slug}`));
  const staticRoutes = [
    "/",
    "/magaza",
    "/harita",
    "/hizmetler",
    "/kurumsal-cozumler",
    "/hakkimizda",
    "/iletisim",
    "/blog",
    "/arama",
    "/giris",
    "/hesabim",
    "/sepet",
    "/odeme"
  ];

  return [
    ...staticRoutes.filter((route) => !managedRouteSet.has(route)).map((route) => ({
      url: absoluteUrl(route),
      changeFrequency: "weekly" as const,
      priority: route === "/" ? 1 : 0.8
    })),
    ...managedPages.map((page) => ({
      url: absoluteUrl(`/${page.slug}`),
      lastModified: page.updatedAt,
      changeFrequency: page.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: page.sitemapPriority / 100
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/urun/${product.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.7
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/blog/${article.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.72
    })),
    ...solutionPages.map((solution) => ({
      url: absoluteUrl(`/kurumsal-cozumler/${solution.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.76
    }))
  ];
}
