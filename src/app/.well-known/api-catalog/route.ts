import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  return Response.json(
    {
      name: `${siteConfig.name} public discovery catalog`,
      description:
        "ParkChargeEV public SEO, AI discovery and product knowledge resources.",
      baseUrl: siteConfig.url,
      version: "2026-07-09",
      language: "tr-TR",
      resources: [
        {
          method: "GET",
          path: "/sitemap.xml",
          url: absoluteUrl("/sitemap.xml"),
          type: "application/xml",
          auth: "none",
          purpose: "Canonical indexable URL discovery."
        },
        {
          method: "GET",
          path: "/image-sitemap.xml",
          url: absoluteUrl("/image-sitemap.xml"),
          type: "application/xml",
          auth: "none",
          purpose: "Product and homepage image discovery."
        },
        {
          method: "GET",
          path: "/llms.txt",
          url: absoluteUrl("/llms.txt"),
          type: "text/plain",
          auth: "none",
          purpose: "Concise AI-readable site summary."
        },
        {
          method: "GET",
          path: "/llms-full.txt",
          url: absoluteUrl("/llms-full.txt"),
          type: "text/plain",
          auth: "none",
          purpose: "Expanded AI-readable product and guide knowledge base."
        },
        {
          method: "GET",
          path: "/api/markdown/urun/{slug}",
          url: absoluteUrl("/api/markdown/urun/{slug}"),
          type: "text/markdown",
          auth: "none",
          purpose: "Clean product facts for AI and search assistants."
        },
        {
          method: "GET",
          path: "/api/markdown/blog/{slug}",
          url: absoluteUrl("/api/markdown/blog/{slug}"),
          type: "text/markdown",
          auth: "none",
          purpose: "Clean guide article facts for AI and search assistants."
        },
        {
          method: "GET",
          path: "/api/health",
          url: absoluteUrl("/api/health"),
          type: "application/json",
          auth: "none",
          purpose: "Runtime health signal."
        }
      ]
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600"
      }
    }
  );
}
