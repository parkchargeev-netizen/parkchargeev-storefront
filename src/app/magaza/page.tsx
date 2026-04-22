import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import { formatPriceTRY } from "@/lib/format";
import { products } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Mağaza",
  description:
    "Ev tipi ve iş yeri tipi elektrikli araç şarj istasyonları, kablolar ve kurulum çözümlerini keşfedin."
};

const categoryLabels = [...new Set(products.map((product) => product.category))];

const sortOptions = [
  { value: "recommended", label: "Önerilenler" },
  { value: "price-asc", label: "Fiyat (artan)" },
  { value: "price-desc", label: "Fiyat (azalan)" },
  { value: "name-asc", label: "İsim (A-Z)" }
] as const;

type StorePageProps = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
  }>;
};

function matchesQuery(query: string, productText: string) {
  return productText.toLocaleLowerCase("tr-TR").includes(query);
}

function buildStoreHref({
  category,
  q,
  sort
}: {
  category?: string;
  q?: string;
  sort?: string;
}) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (q) {
    params.set("q", q);
  }

  if (sort && sort !== "recommended") {
    params.set("sort", sort);
  }

  const query = params.toString();
  return query ? `/magaza?${query}` : "/magaza";
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const normalizedQuery = query.toLocaleLowerCase("tr-TR");
  const selectedCategory = categoryLabels.includes(params.category ?? "")
    ? (params.category as string)
    : "";
  const selectedSort = sortOptions.some((option) => option.value === params.sort)
    ? (params.sort as (typeof sortOptions)[number]["value"])
    : "recommended";

  const searchScopedProducts = normalizedQuery
    ? products.filter((product) =>
        matchesQuery(
          normalizedQuery,
          `${product.name} ${product.summary} ${product.category} ${product.powerLabel} ${product.seoIntent.join(" ")}`
        )
      )
    : products;

  const categoryFilters = [
    {
      label: "Tüm Ürünler",
      value: "",
      count: searchScopedProducts.length,
      active: !selectedCategory
    },
    ...categoryLabels.map((label) => ({
      label,
      value: label,
      count: searchScopedProducts.filter((product) => product.category === label).length,
      active: selectedCategory === label
    }))
  ];

  const filteredProducts = searchScopedProducts.filter(
    (product) => !selectedCategory || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((left, right) => {
    switch (selectedSort) {
      case "price-asc":
        return left.priceKurus - right.priceKurus;
      case "price-desc":
        return right.priceKurus - left.priceKurus;
      case "name-asc":
        return left.name.localeCompare(right.name, "tr");
      default:
        return 0;
    }
  });

  const minPrice = sortedProducts.length
    ? Math.min(...sortedProducts.map((product) => product.priceKurus))
    : Math.min(...products.map((product) => product.priceKurus));
  const maxPrice = sortedProducts.length
    ? Math.max(...sortedProducts.map((product) => product.priceKurus))
    : Math.max(...products.map((product) => product.priceKurus));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 lg:flex-row lg:px-8">
      <aside className="w-full lg:sticky lg:top-28 lg:w-80">
        <form action="/magaza" className="surface-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Ürün arama
          </p>
          <label className="mt-6 grid gap-2">
            <span className="text-sm text-on-surface-variant">Anahtar kelime</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="Örn: 11 kW, RFID, type 2"
              className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
            />
          </label>
          {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
          <label className="mt-4 grid gap-2">
            <span className="text-sm text-on-surface-variant">Sıralama</span>
            <select
              name="sort"
              defaultValue={selectedSort}
              className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white"
          >
            Filtreleri Uygula
          </button>
        </form>

        <div className="surface-card mt-6 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Kategoriler
          </p>
          <div className="mt-6 space-y-3">
            {categoryFilters.map((filter) => (
              <Link
                key={filter.label}
                href={buildStoreHref({
                  category: filter.value || undefined,
                  q: query || undefined,
                  sort: selectedSort
                })}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 transition ${
                  filter.active
                    ? "bg-surface-container-low"
                    : "hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-5 w-5 rounded-md border ${
                      filter.active
                        ? "border-primary bg-primary"
                        : "border-outline-variant"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      filter.active
                        ? "font-semibold text-on-surface"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {filter.label}
                  </span>
                </div>
                <span className="text-xs font-semibold text-outline">{filter.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="surface-card mt-6 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Görünen fiyat aralığı
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-surface-container-low p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                En az
              </p>
              <p className="mt-2 text-xl font-bold">{formatPriceTRY(minPrice)}</p>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                En çok
              </p>
              <p className="mt-2 text-xl font-bold">{formatPriceTRY(maxPrice)}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            Önceki sahte slider yerine, gerçekten ekranda kalan ürünlerin fiyat bandı gösterilir.
          </p>
        </div>

        <div className="surface-card mt-6 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">
            Kurulum desteği
          </p>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            Ürün satın alma öncesinde keşif ve teknik uygunluk desteği almak için kurumsal
            veya bireysel talep bırakabilirsiniz.
          </p>
          <Link href="/iletisim" className="mt-6 inline-block text-sm font-semibold text-primary">
            Teklif Al
          </Link>
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="mb-10">
          <h1 className="text-5xl font-black tracking-[-0.08em] text-on-surface">
            Akıllı Şarj Çözümleri
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-on-surface-variant">
            Ev, iş yeri ve ticari lokasyonlar için yüksek performanslı şarj ürünlerini;
            kurulum ve destek katmanıyla birlikte keşfedin.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            <p className="text-sm text-on-surface-variant">
              Görünen sonuç: {sortedProducts.length} ürün
            </p>
            <div className="flex flex-wrap gap-3">
              {selectedCategory ? (
                <span className="rounded-full bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface">
                  Kategori: {selectedCategory}
                </span>
              ) : null}
              {query ? (
                <span className="rounded-full bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface">
                  Arama: {query}
                </span>
              ) : null}
              {(selectedCategory || query || selectedSort !== "recommended") ? (
                <Link
                  href="/magaza"
                  className="rounded-full border border-outline-variant/40 px-4 py-3 text-sm font-semibold text-primary"
                >
                  Filtreleri Temizle
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        {sortedProducts.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
              Sonuç bulunamadı
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-on-surface-variant">
              Seçtiğiniz kategori ve arama terimiyle eşleşen ürün bulunamadı. Aramayı
              genişletmeyi veya filtreleri temizlemeyi deneyin.
            </p>
            <Link
              href="/magaza"
              className="mt-8 inline-block rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white"
            >
              Tüm Ürünleri Gör
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
