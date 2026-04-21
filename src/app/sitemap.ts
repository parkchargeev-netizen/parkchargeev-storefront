import type { MetadataRoute } from "next";

import { articles, products, solutionPages } from "@/lib/mock-data";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
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
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
      changeFrequency: "weekly" as const,
      priority: route === "/" ? 1 : 0.8
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
