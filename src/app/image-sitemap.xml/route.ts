import { absoluteUrl, siteConfig } from "@/lib/site";
import { getProductImageUrl } from "@/lib/structured-data";
import { listPublicProducts } from "@/server/admin/repository";

export const revalidate = 3600;

type ImageEntry = {
  loc: string;
  title: string;
  caption: string;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toAbsoluteMediaUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
}

function getProductImages(product: Awaited<ReturnType<typeof listPublicProducts>>[number]) {
  const urls = new Set<string>([getProductImageUrl(product)]);

  product.media
    ?.filter((media) => media.mediaType === "image")
    .forEach((media) => {
      if (media.url) {
        urls.add(toAbsoluteMediaUrl(media.url));
      }
    });

  return Array.from(urls).map<ImageEntry>((loc) => ({
    loc,
    title: product.name,
    caption: `${product.name} - ${product.powerLabel} ${product.category} elektrikli araç şarj çözümü`
  }));
}

export async function GET() {
  const products = await listPublicProducts();
  const entries = [
    {
      url: absoluteUrl("/"),
      images: [
        {
          loc: absoluteUrl("/images/hero-realistic-ev-charging-desktop.webp"),
          title: `${siteConfig.name} elektrikli araç şarj çözümleri`,
          caption:
            "ParkChargeEV ev, site, iş yeri ve ticari lokasyonlar için elektrikli araç şarj cihazı ve kurulum çözümleri."
        }
      ]
    },
    ...products.map((product) => ({
      url: absoluteUrl(`/urun/${product.slug}`),
      images: getProductImages(product)
    }))
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries.map((entry) =>
      [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        ...entry.images.map((image) =>
          [
            "    <image:image>",
            `      <image:loc>${escapeXml(image.loc)}</image:loc>`,
            `      <image:title>${escapeXml(image.title)}</image:title>`,
            `      <image:caption>${escapeXml(image.caption)}</image:caption>`,
            "    </image:image>"
          ].join("\n")
        ),
        "  </url>"
      ].join("\n")
    ),
    "</urlset>"
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
