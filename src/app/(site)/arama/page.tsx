import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/content/article-card";
import { ProductCard } from "@/components/shop/product-card";
import { SolutionCard } from "@/components/solutions/solution-card";
import { articles, products, solutionPages } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Arama",
  description:
    "Ürün, çözüm ve içerikler arasında arama yapın."
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLocaleLowerCase("tr-TR");

  const matchedProducts = query
    ? products.filter((product) =>
        `${product.name} ${product.summary} ${product.category}`.toLocaleLowerCase("tr-TR").includes(query)
      )
    : [];

  const matchedArticles = query
    ? articles.filter((article) =>
        `${article.title} ${article.excerpt} ${article.category}`.toLocaleLowerCase("tr-TR").includes(query)
      )
    : [];

  const matchedSolutions = query
    ? solutionPages.filter((solution) =>
        `${solution.title} ${solution.summary} ${solution.segment}`.toLocaleLowerCase("tr-TR").includes(query)
      )
    : [];
  const totalResults =
    matchedProducts.length + matchedArticles.length + matchedSolutions.length;

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
            Ürün, çözüm ve blog içerikleri arasında arama yapmak için bir ifade girin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["ev tipi şarj", "22 kW", "apartman çözümü", "kurulum"].map((item) => (
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
            {["ev tipi şarj", "22 kW", "site çözümü", "kurulum"].map((item) => (
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
