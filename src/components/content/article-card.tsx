import Link from "next/link";

import type { ArticleModel } from "@/lib/mock-data";

type ArticleCardProps = {
  article: ArticleModel;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="surface-card flex h-full flex-col p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
        {article.coverKicker}
      </p>
      <h3 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-on-surface">
        {article.title}
      </h3>
      <p className="mt-4 flex-1 text-sm leading-7 text-on-surface-variant">
        {article.excerpt}
      </p>
      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-on-surface-variant">
        <span>{article.readingMinutes} dk okuma</span>
        <span>{article.publishedAt}</span>
      </div>
      <Link
        href={`/blog/${article.slug}`}
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        Yazıyı Oku
      </Link>
    </article>
  );
}
