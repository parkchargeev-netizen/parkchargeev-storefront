import type { Metadata } from "next";

import { ArticleCard } from "@/components/content/article-card";
import { listPublicBlogArticles } from "@/server/blog/repository";

export const metadata: Metadata = {
  title: "Blog",
  alternates: {
    canonical: "/blog"
  },
  description:
    "Elektrikli araç şarj cihazları, kurulum süreçleri, maliyet rehberleri ve kurumsal çözüm içerikleri."
};

export default async function BlogPage() {
  const articles = await listPublicBlogArticles();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
          Satın alma rehberleri
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
          Şarj cihazı ve kurulum kararınızı netleştiren rehberler
        </h1>
        <p className="mt-6 text-lg leading-8 text-on-surface-variant">
          Ev tipi wallbox, 11 kW / 22 kW farkı, apartman otoparkı kurulumu ve
          kurumsal şarj yatırımı için kısa, uygulanabilir ve güven veren içerikler.
        </p>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </section>
    </div>
  );
}
