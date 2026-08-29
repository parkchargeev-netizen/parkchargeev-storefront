import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/content/article-card";
import { ProductCard } from "@/components/shop/product-card";
import { SolutionCard } from "@/components/solutions/solution-card";
import { PageHeader } from "@/components/ui/page-header";
import { solutionPages } from "@/lib/mock-data";
import { matchesSearchQuery } from "@/lib/search-normalization";
import { searchPublicBlogArticles } from "@/server/blog/repository";
import { searchPublicProducts } from "@/server/admin/repository";

export const metadata: Metadata = {
  title: "Arama",
  robots: {
    index: false,
    follow: false
  },
  description:
    "Ürün, çözüm ve içerik sayfaları arasında arama yapın."
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  let matchedProducts: Awaited<ReturnType<typeof searchPublicProducts>> = [];
  let matchedArticles: Awaited<ReturnType<typeof searchPublicBlogArticles>> = [];
  let matchedSolutions: (typeof solutionPages)[number][] = [];

  if (!query) {
    matchedProducts = [];
  } else {
    [matchedArticles, matchedProducts] = await Promise.all([
      searchPublicBlogArticles(query, 12),
      searchPublicProducts(query, 12)
    ]);
    matchedSolutions = solutionPages
      .filter((solution) =>
        matchesSearchQuery(
          [
            solution.title,
            solution.slug,
            solution.summary,
            solution.segment,
            solution.introduction,
            solution.features,
            solution.outcomes,
            solution.useCases,
            solution.faq.map((faq) => faq.question + " " + faq.answer)
          ],
          query
        )
      )
      .slice(0, 12);
  }
  const totalResults = matchedProducts.length + matchedArticles.length + matchedSolutions.length;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8" data-motion-scope>
      <section className="surface-card p-8">
        <PageHeader eyebrow="Site içi arama" title="Ne arıyorsunuz?" />
        <form action="/arama" className="mt-8 flex flex-col gap-4 sm:flex-row">
          <label htmlFor="site-search-query" className="sr-only">
            Site içinde ara
          </label>
          <input
            id="site-search-query"
            name="q"
            defaultValue={q}
            placeholder="Örn: 11 kW, apartman, kurulum, wallbox..."
            className="flex-1 rounded-lg border border-outline-variant/45 bg-white px-5 py-4 outline-none transition focus:border-primary"
          />
          <button className="rounded-lg bg-primary px-6 py-4 font-semibold text-white">
            Ara
          </button>
        </form>
      </section>

      {!query ? (
        <section className="mt-10 surface-card p-8">
          <p className="text-lg leading-8 text-on-surface-variant">
            Ürün, çözüm ve blog sayfaları arasında arama yapmak için bir ifade girin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["ev tipi şarj", "22 kW", "kurulum talebi", "apartman çözümü"].map((item) => (
              <Link
                key={item}
                href={`/arama?q=${encodeURIComponent(item)}`}
                className="rounded-full bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface"
              >
                {item}
              </Link>
            ))}
          </div>
        </section>
      ) : totalResults === 0 ? (
        <section className="mt-10 surface-card p-8">
          <h2 className="text-3xl font-bold tracking-normal text-on-surface">
            Sonuç bulunamadı
          </h2>
          <p className="mt-4 text-base leading-8 text-on-surface-variant">
            Farklı bir ifade deneyin veya aşağıdaki popüler aramaları kullanın.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["ev tipi şarj", "22 kW", "site çözümü", "keşif", "kurulum talebi"].map((item) => (
              <Link
                key={item}
                href={`/arama?q=${encodeURIComponent(item)}`}
                className="rounded-full bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface"
              >
                {item}
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section className="mt-10">
            <h2 className="text-3xl font-bold tracking-normal text-on-surface">
              Ürünler ({matchedProducts.length})
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {matchedProducts.map((product, index) => (
                <ProductCard key={product.id} navigationPrefetch={index < 6} product={product} />
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-3xl font-bold tracking-normal text-on-surface">
              Kurumsal çözümler ({matchedSolutions.length})
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {matchedSolutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          </section>


          <section className="mt-12">
            <h2 className="text-3xl font-bold tracking-normal text-on-surface">
              İçerikler ({matchedArticles.length})
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {matchedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
