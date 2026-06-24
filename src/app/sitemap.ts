import type { MetadataRoute } from "next";

import { solutionPages } from "@/lib/mock-data";
import { absoluteUrl } from "@/lib/site";
import { listPublicProducts } from "@/server/admin/repository";
import { listPublicBlogArticles } from "@/server/blog/repository";
import { listPublishedSitePagesForSitemap } from "@/server/site/repository";

const siteContentLastModified = new Date("2026-06-24T00:00:00+03:00");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [managedPages, products, blogArticles] = await Promise.all([
    listPublishedSitePagesForSitemap(),
    listPublicProducts(),
    listPublicBlogArticles()
  ]);
  const managedRouteSet = new Set(managedPages.map((page) => `/${page.slug}`));
  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/magaza", changeFrequency: "daily", priority: 0.9 },
    { path: "/urun-secici", changeFrequency: "monthly", priority: 0.82 },
    { path: "/karsilastir", changeFrequency: "monthly", priority: 0.82 },
    { path: "/hizmetler", changeFrequency: "monthly", priority: 0.86 },
    { path: "/kurumsal-cozumler", changeFrequency: "monthly", priority: 0.86 },
    { path: "/hakkimizda", changeFrequency: "yearly", priority: 0.72 },
    { path: "/iletisim", changeFrequency: "yearly", priority: 0.78 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.84 }
  ];

  return [
    ...staticRoutes.filter((route) => !managedRouteSet.has(route.path)).map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: siteContentLastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority
    })),
    ...managedPages.map((page) => ({
      url: absoluteUrl(`/${page.slug}`),
      lastModified: page.updatedAt,
      changeFrequency: page.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: page.sitemapPriority / 100
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/urun/${product.slug}`),
      lastModified: product.updatedAt
        ? new Date(product.updatedAt)
        : siteContentLastModified,
      changeFrequency: "weekly" as const,
      priority: 0.76
    })),
    ...blogArticles.map((article) => ({
      url: absoluteUrl(`/blog/${article.slug}`),
      lastModified: new Date(article.updatedAt ?? article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.72
    })),
    ...solutionPages.map((solution) => ({
      url: absoluteUrl(`/kurumsal-cozumler/${solution.slug}`),
      lastModified: siteContentLastModified,
      changeFrequency: "monthly" as const,
      priority: 0.78
    }))
  ];
}
