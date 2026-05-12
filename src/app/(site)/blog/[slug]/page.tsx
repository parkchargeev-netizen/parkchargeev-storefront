import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/content/article-card";
import {
  articles,
  getArticleBySlug,
  getRelatedArticles
} from "@/lib/mock-data";
import {
  getArticleJsonLd,
  getBreadcrumbJsonLd,
  getFaqJsonLd
} from "@/lib/structured-data";

type ArticleDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params
}: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: "Yazı bulunamadı" };
  }

  return {
    title: article.title,
    description: article.seoDescription
  };
}

export default async function ArticleDetailPage({
  params
}: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article);
  const articleJsonLd = getArticleJsonLd(article);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: article.title, path: `/blog/${article.slug}` }
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {article.faq ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqJsonLd(article.faq)) }}
        />
      ) : null}

      <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/" className="transition hover:text-primary">
          Ana Sayfa
        </Link>
        <span>›</span>
        <Link href="/blog" className="transition hover:text-primary">
          Blog
        </Link>
        <span>›</span>
        <span className="text-on-surface">{article.title}</span>
      </div>

      <article className="surface-card p-8 lg:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
          {article.coverKicker}
        </p>
        <h1 className="mt-5 text-5xl font-black tracking-[-0.08em] text-on-surface">
          {article.title}
        </h1>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-on-surface-variant">
          <span>{article.category}</span>
          <span>{article.readingMinutes} dk okuma</span>
          <span>{article.publishedAt}</span>
        </div>
        <p className="mt-8 text-lg leading-8 text-on-surface-variant">
          {article.excerpt}
        </p>

        <div className="mt-10 space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
                {section.heading}
              </h2>
              <div className="mt-5 space-y-5 text-base leading-8 text-on-surface-variant">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="mt-6 space-y-3 text-base leading-8 text-on-surface-variant">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </article>

      {article.faq ? (
        <section className="mt-10 surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Sık sorulan sorular
          </h2>
          <div className="mt-6 space-y-4">
            {article.faq.map((item) => (
              <article key={item.question} className="rounded-[24px] bg-surface-container-low p-5">
                <h3 className="text-lg font-semibold text-on-surface">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-secondary">
              Sonraki içerikler
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-on-surface">
              İlgili rehberler
            </h2>
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {relatedArticles.map((relatedArticle) => (
            <ArticleCard key={relatedArticle.id} article={relatedArticle} />
          ))}
        </div>
      </section>
    </div>
  );
}
