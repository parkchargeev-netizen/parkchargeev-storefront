import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/content/article-card";
import { ProductCard } from "@/components/shop/product-card";
import { SolutionCard } from "@/components/solutions/solution-card";
import { locationPages } from "@/lib/location-pages";
import { articles, products, solutionPages } from "@/lib/mock-data";
import { matchesSearchQuery } from "@/lib/search-normalization";

export const metadata: Metadata = {
  title: "Arama",
  robots: {
    index: false,
    follow: false
  },
  description:
    "Ürün, çözüm, içerik ve lokasyon sayfaları arasında arama yapın."
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const matchedProducts = query
    ? products.filter((product) =>
        matchesSearchQuery(
          [
            product.name,
            product.slug,
            product.summary,
            product.description,
            product.category,
            product.powerLabel,
            product.highlights,
            product.useCases,
            product.seoIntent,
            product.specs.map((spec) => `${spec.label} ${spec.value}`),
            product.faqs.map((faq) => `${faq.question} ${faq.answer}`)
          ],
          query
        )
      )
    : [];

  const matchedArticles = query
    ? articles.filter((article) =>
        matchesSearchQuery(
          [
            article.title,
            article.slug,
            article.category,
            article.excerpt,
            article.seoDescription,
            article.coverKicker,
            article.sections.map((section) =>
              [
                section.heading,
                ...section.paragraphs,
                ...(section.bullets ?? [])
              ].join(" ")
            ),
            article.faq?.map((faq) => `${faq.question} ${faq.answer}`) ?? []
          ],
          query
        )
      )
    : [];

  const matchedSolutions = query
    ? solutionPages.filter((solution) =>
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
            solution.faq.map((faq) => `${faq.question} ${faq.answer}`)
          ],
          query
        )
      )
    : [];
  const matchedLocations = query
    ? locationPages.filter((page) =>
        matchesSearchQuery(
          [page.city, page.slug, page.region, page.summary, page.districts, page.useCases],
          query
        )
      )
    : [];
  const totalResults =
    matchedProducts.length +
    matchedArticles.length +
    matchedSolutions.length +
    matchedLocations.length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <section className="surface-card p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
          Site içi arama
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
          Ne arıyorsunuz?
        </h1>
        <form action="/arama" className="mt-8 flex flex-col gap-4 sm:flex-row">
          <input
            name="q"
            defaultValue={q}
            placeholder="Örn: 11 kW, apartman, kurulum, wallbox..."
            className="flex-1 rounded-2xl border border-outline-variant/45 bg-white px-5 py-4 outline-none transition focus:border-primary"
          />
          <button className="rounded-2xl bg-primary px-6 py-4 font-semibold text-white">
            Ara
          </button>
        </form>
      </section>

      {!query ? (
        <section className="mt-10 surface-card p-8">
          <p className="text-lg leading-8 text-on-surface-variant">
            Ürün, çözüm, blog ve lokasyon sayfaları arasında arama yapmak için bir ifade girin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["ev tipi şarj", "22 kW", "İstanbul kurulum", "apartman çözümü"].map((item) => (
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
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Sonuç bulunamadı
          </h2>
          <p className="mt-4 text-base leading-8 text-on-surface-variant">
            Farklı bir ifade deneyin veya aşağıdaki popüler aramaları kullanın.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["ev tipi şarj", "22 kW", "site çözümü", "İstanbul", "kurulum"].map((item) => (
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
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
              Ürünler ({matchedProducts.length})
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {matchedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
              Kurumsal çözümler ({matchedSolutions.length})
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {matchedSolutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
              Lokasyon sayfaları ({matchedLocations.length})
            </h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {matchedLocations.map((page) => (
                <Link
                  key={page.slug}
                  href={`/elektrikli-arac-sarj-istasyonu-kurulumu/${page.slug}`}
                  className="surface-card block p-6 transition hover:border-primary/30 hover:bg-surface-container-low"
                >
                  <p className="text-lg font-semibold text-on-surface">
                    {page.city} şarj istasyonu kurulumu
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {page.summary}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
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
    </div>
  );
}
