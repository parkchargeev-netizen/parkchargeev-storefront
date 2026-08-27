import { and, desc, ilike, isNotNull, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import {
  estimateReadingMinutes,
  renderArticleBodyHtml,
  sanitizeBlogHtml,
  stripHtml
} from "@/lib/blog-content";
import { articles, type ArticleModel } from "@/lib/mock-data";
import { hasDatabaseConfig } from "@/lib/runtime-config";
import { matchesSearchQuery } from "@/lib/search-normalization";
import { getDb } from "@/server/db/client";
import { blogPosts } from "@/server/db/schema";

export type PublicBlogArticle = ArticleModel & {
  bodyHtml: string;
  source: "database" | "fallback";
};

function getFallbackPublicArticles(): PublicBlogArticle[] {
  return articles.map((article) => ({
    ...article,
    updatedAt: article.updatedAt ?? article.publishedAt,
    bodyHtml: renderArticleBodyHtml(article),
    source: "fallback"
  }));
}

function mapBlogPostToPublicArticle(
  post: typeof blogPosts.$inferSelect
): PublicBlogArticle {
  const publishedAt = post.publishedAt ?? post.updatedAt;
  const bodyHtml = sanitizeBlogHtml(post.body);
  const bodyText = stripHtml(`${post.excerpt} ${bodyHtml}`);

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: "Rehber",
    excerpt: post.excerpt,
    coverKicker: "ParkChargeEV Rehber",
    publishedAt: publishedAt.toISOString().slice(0, 10),
    updatedAt: post.updatedAt.toISOString(),
    readingMinutes: estimateReadingMinutes(bodyText),
    seoDescription: post.seoDescription || post.excerpt,
    sections: [],
    bodyHtml,
    faq: [],
    source: "database"
  };
}

async function loadPublicBlogArticles() {
  const fallbackArticles = getFallbackPublicArticles();

  if (!hasDatabaseConfig()) {
    return fallbackArticles;
  }

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(blogPosts)
      .where(sql`${blogPosts.publishedAt} is not null`)
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.updatedAt));
    const databaseArticles = rows.map(mapBlogPostToPublicArticle);
    const databaseSlugs = new Set(databaseArticles.map((article) => article.slug));

    return [
      ...databaseArticles,
      ...fallbackArticles.filter((article) => !databaseSlugs.has(article.slug))
    ];
  } catch (error) {
    console.warn("Public blog articles could not be loaded.", error);
    return fallbackArticles;
  }
}

export const listPublicBlogArticles = unstable_cache(
  loadPublicBlogArticles,
  ["public-blog-articles-v3"],
  {
    revalidate: 300,
    tags: ["public-blog"]
  }
);

async function withBlogSearchTimeout<T>(promise: Promise<T>, fallback: T) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => resolve(fallback), 3500);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function searchPublicBlogArticles(query: string, limit = 12) {
  const normalizedQuery = query.trim();
  const safeLimit = Math.min(Math.max(limit, 1), 24);

  if (!normalizedQuery) {
    return [];
  }

  const fallbackArticles = getFallbackPublicArticles()
    .filter((article) =>
      matchesSearchQuery(
        [article.title, article.slug, article.excerpt, article.seoDescription, stripHtml(article.bodyHtml)],
        normalizedQuery
      )
    )
    .slice(0, safeLimit);

  if (!hasDatabaseConfig()) {
    return fallbackArticles;
  }

  try {
    const db = getDb();
    const pattern = "%" + normalizedQuery + "%";
    const rows = await withBlogSearchTimeout(
      db
            .select()
            .from(blogPosts)
            .where(
              and(
                isNotNull(blogPosts.publishedAt),
                or(
                  ilike(blogPosts.title, pattern),
                  ilike(blogPosts.slug, pattern),
                  ilike(blogPosts.excerpt, pattern),
                  ilike(blogPosts.body, pattern),
                  ilike(blogPosts.seoDescription, pattern)
                )
              )
            )
            .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.updatedAt))
            .limit(safeLimit),
      []
    );
    const databaseArticles = rows.map(mapBlogPostToPublicArticle);
    const databaseSlugs = new Set(databaseArticles.map((article) => article.slug));

    return [
      ...databaseArticles,
      ...fallbackArticles.filter((article) => !databaseSlugs.has(article.slug))
    ].slice(0, safeLimit);
  } catch (error) {
    console.warn("Public blog search could not be loaded.", error);
    return fallbackArticles;
  }
}

export async function listPublicBlogSlugs() {
  const publicArticles = await listPublicBlogArticles();
  return publicArticles.map((article) => article.slug);
}

export async function getPublicBlogArticleBySlug(slug: string) {
  const publicArticles = await listPublicBlogArticles();
  return publicArticles.find((article) => article.slug === slug);
}

export async function getRelatedPublicBlogArticles(
  article: PublicBlogArticle,
  limit = 2
) {
  const publicArticles = await listPublicBlogArticles();

  return publicArticles
    .filter((candidate) => candidate.slug !== article.slug)
    .sort((a, b) => {
      const categoryScore =
        Number(b.category === article.category) - Number(a.category === article.category);
      return categoryScore || b.publishedAt.localeCompare(a.publishedAt);
    })
    .slice(0, limit);
}

export function getMarketingBlogSeedPosts() {
  return articles.map((article) => ({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    body: renderArticleBodyHtml(article),
    seoTitle: article.title,
    seoDescription: article.seoDescription,
    publishedAt: new Date(`${article.publishedAt}T09:00:00.000Z`),
    updatedAt: new Date(`${article.publishedAt}T09:00:00.000Z`)
  }));
}
