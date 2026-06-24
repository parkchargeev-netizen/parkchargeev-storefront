import type { Metadata } from "next";

import { ArticleCard } from "@/components/content/article-card";
import { PageHeader } from "@/components/ui/page-header";
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
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8" data-motion-scope>
      <PageHeader
        align="center"
        eyebrow="Satın alma rehberleri"
        title="Şarj cihazı ve kurulum kararınızı netleştiren rehberler"
        body="Ev tipi wallbox, 11 kW / 22 kW farkı, apartman otoparkı kurulumu ve kurumsal şarj yatırımı için kısa, uygulanabilir ve güven veren içerikler."
      />

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </section>
    </main>
  );
}
