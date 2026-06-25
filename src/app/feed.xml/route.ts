import { absoluteUrl, siteConfig } from "@/lib/site";
import { listPublicBlogArticles } from "@/server/blog/repository";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await listPublicBlogArticles();
  const latestArticleDate = articles.reduce(
    (latest, article) => {
      const articleDate = new Date(article.updatedAt ?? article.publishedAt);
      return articleDate > latest ? articleDate : latest;
    },
    new Date("2026-06-25T00:00:00+03:00")
  );
  const items = articles
    .map((article) => {
      const url = absoluteUrl(`/blog/${article.slug}`);
      const publicationDate = new Date(
        article.updatedAt ?? article.publishedAt
      ).toUTCString();

      return [
        "<item>",
        `<title>${escapeXml(article.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<description>${escapeXml(article.seoDescription)}</description>`,
        `<category>${escapeXml(article.category)}</category>`,
        `<pubDate>${publicationDate}</pubDate>`,
        "</item>"
      ].join("");
    })
    .join("");
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${escapeXml(siteConfig.name)} EV Şarj Rehberleri</title>`,
    `<link>${escapeXml(absoluteUrl("/blog"))}</link>`,
    `<atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />`,
    `<description>${escapeXml("Elektrikli araç şarj cihazı, kurulum, maliyet ve teknik karar rehberleri.")}</description>`,
    "<language>tr-TR</language>",
    `<lastBuildDate>${latestArticleDate.toUTCString()}</lastBuildDate>`,
    items,
    "</channel>",
    "</rss>"
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600"
    }
  });
}
