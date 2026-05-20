import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/admin",
          "/api/admin/",
          "/api/customer",
          "/api/customer/",
          "/api/paytr",
          "/api/paytr/",
          "/api/cart-intent",
          "/api/orders",
          "/api/orders/",
          "/api/lead",
          "/sepet",
          "/odeme",
          "/giris",
          "/hesabim",
          "/sentry-example-page",
          "/api/sentry-example-api"
        ]
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
