import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  return Response.json(
    {
      openapi: "3.1.0",
      info: {
        title: `${siteConfig.name} Public Discovery API`,
        version: "2026-07-09",
        description:
          "Public, read-only SEO and AI discovery endpoints for ParkChargeEV product and guide content."
      },
      servers: [
        {
          url: siteConfig.url
        }
      ],
      paths: {
        "/llms.txt": {
          get: {
            summary: "Concise AI-readable site summary",
            responses: {
              "200": {
                description: "Plain text llms.txt response"
              }
            }
          }
        },
        "/llms-full.txt": {
          get: {
            summary: "Expanded AI-readable product and guide knowledge base",
            responses: {
              "200": {
                description: "Plain text expanded llms response"
              }
            }
          }
        },
        "/api/markdown/urun/{slug}": {
          get: {
            summary: "Product markdown facts",
            parameters: [
              {
                name: "slug",
                in: "path",
                required: true,
                schema: {
                  type: "string"
                }
              }
            ],
            responses: {
              "200": {
                description: "Markdown product summary"
              },
              "404": {
                description: "Product not found"
              }
            }
          }
        },
        "/api/markdown/blog/{slug}": {
          get: {
            summary: "Guide article markdown facts",
            parameters: [
              {
                name: "slug",
                in: "path",
                required: true,
                schema: {
                  type: "string"
                }
              }
            ],
            responses: {
              "200": {
                description: "Markdown article summary"
              },
              "404": {
                description: "Article not found"
              }
            }
          }
        },
        "/image-sitemap.xml": {
          get: {
            summary: "Image sitemap",
            responses: {
              "200": {
                description: "XML image sitemap"
              }
            }
          }
        }
      },
      externalDocs: {
        description: "Human-readable API service document",
        url: absoluteUrl("/docs/api")
      }
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600"
      }
    }
  );
}
