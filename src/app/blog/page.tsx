import type { Metadata } from "next";

import { ArticleCard } from "@/components/content/article-card";
import { articles } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Elektrikli araç şarj istasyonları, kurulum süreçleri, maliyet rehberleri ve kurumsal çözüm içerikleri."
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
          SEO + GEO + AIEO içerik merkezi
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
          EV charging karar yolculuğunu besleyen içerikler
        </h1>
        <p className="mt-6 text-lg leading-8 text-on-surface-variant">
          Satın alma niyeti, kurulum araştırması ve kurumsal proje değerlendirme
          süreçlerinde görünür olmak için rehber, karşılaştırma ve çözüm odaklı
          içerik kümesi.
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
