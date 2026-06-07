import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import { formatPriceTRY } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import { getProductStoreProfile, getStoreFilterOptions } from "@/lib/shop-merchandising";
import {
  getBreadcrumbJsonLd,
  getProductImageUrl,
  stringifyJsonLd
} from "@/lib/structured-data";
import { listPublicProducts } from "@/server/admin/repository";

export const metadata: Metadata = {
  title: "Mağaza",
  description:
    "Ev, site, işletme ve ticari lokasyonlar için elektrikli araç şarj cihazı, kablo ve kurulum çözümlerini karşılaştırın.",
  alternates: {
    canonical: "/magaza"
  },
  openGraph: {
    title: "ParkChargeEV Mağaza",
    description: "Wallbox, kablo, DC hızlı şarj ve kurulum çözümleri.",
    url: "/magaza",
    type: "website"
  }
};

const sortOptions = [
  { value: "recommended", label: "Önerilenler" },
  { value: "price-asc", label: "Fiyat artan" },
  { value: "price-desc", label: "Fiyat azalan" },
  { value: "name-asc", label: "İsim A-Z" }
] as const;

const quickSegments = [
  { label: "Ev", href: "/magaza?category=Ev%20Tipi", detail: "7.4 / 11 kW" },
  { label: "Site", href: "/magaza?power=22%20kW", detail: "RFID + kurulum" },
  { label: "İşletme", href: "/magaza?installation=Sabit%20kurulum", detail: "22 kW AC" },
  { label: "DC", href: "/magaza?category=DC%20Hızlı%20Şarj", detail: "Ticari lokasyon" },
  { label: "Aksesuar", href: "/magaza?category=Aksesuar", detail: "Type 2 kablo" }
] as const;

type StorePageProps = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    power?: string;
    installation?: string;
  }>;
};

function matchesQuery(query: string, productText: string) {
  return productText.toLocaleLowerCase("tr-TR").includes(query);
}

function buildStoreHref({
  category,
  q,
  sort,
  power,
  installation
}: {
  category?: string;
  q?: string;
  sort?: string;
  power?: string;
  installation?: string;
}) {
  const params = new URLSearchParams();

  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (sort && sort !== "recommended") params.set("sort", sort);
  if (power) params.set("power", power);
  if (installation) params.set("installation", installation);

  const query = params.toString();
  return query ? `/magaza?${query}` : "/magaza";
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const products = await listPublicProducts();
  const params = await searchParams;
  const categoryLabels = [...new Set(products.map((product) => product.category))];
  const filterOptions = getStoreFilterOptions(products);
  const query = params.q?.trim() ?? "";
  const normalizedQuery = query.toLocaleLowerCase("tr-TR");
  const selectedCategory = categoryLabels.includes(params.category ?? "")
    ? (params.category as string)
    : "";
  const selectedPower = filterOptions.powerTiers.includes(
    params.power as (typeof filterOptions.powerTiers)[number]
  )
    ? (params.power as string)
    : "";
  const selectedInstallation = filterOptions.installationModes.includes(
    params.installation as (typeof filterOptions.installationModes)[number]
  )
    ? (params.installation as string)
    : "";
  const selectedSort = sortOptions.some((option) => option.value === params.sort)
    ? (params.sort as (typeof sortOptions)[number]["value"])
    : "recommended";

  const searchScopedProducts = normalizedQuery
    ? products.filter((product) => {
        const profile = getProductStoreProfile(product);

        return matchesQuery(
          normalizedQuery,
          `${product.name} ${product.summary} ${product.category} ${product.powerLabel} ${product.seoIntent.join(" ")} ${profile.powerTier} ${profile.connectorHint} ${profile.installationMode} ${profile.primaryFit}`
        );
      })
    : products;

  const optionScopedProducts = searchScopedProducts.filter((product) => {
    const profile = getProductStoreProfile(product);

    return (
      (!selectedPower || profile.powerTier === selectedPower) &&
      (!selectedInstallation || profile.installationMode === selectedInstallation)
    );
  });

  const filteredProducts = optionScopedProducts.filter(
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

  const visiblePriceSource = sortedProducts.length ? sortedProducts : products;
  const minPrice = visiblePriceSource.length
    ? Math.min(...visiblePriceSource.map((product) => product.priceKurus))
    : 0;
  const maxPrice = visiblePriceSource.length
    ? Math.max(...visiblePriceSource.map((product) => product.priceKurus))
    : 0;
  const activeFilterCount = [
    selectedCategory,
    query,
    selectedPower,
    selectedInstallation,
    selectedSort !== "recommended" ? selectedSort : ""
  ].filter(Boolean).length;
  const categoryFilters = [
    { label: "Tümü", value: "", count: optionScopedProducts.length, active: !selectedCategory },
    ...categoryLabels.map((label) => ({
      label,
      value: label,
      count: optionScopedProducts.filter((product) => product.category === label).length,
      active: selectedCategory === label
    }))
  ];
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ParkChargeEV ürün listesi",
    itemListElement: sortedProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        url: absoluteUrl(`/urun/${product.slug}`),
        image: getProductImageUrl(product),
        offers: {
          "@type": "Offer",
          priceCurrency: "TRY",
          price: (product.priceKurus / 100).toFixed(2),
          availability:
            product.stockLabel === "Stokta Yok"
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock"
        }
      }
    }))
  };
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Mağaza", path: "/magaza" }
  ]);

  return (
    <div className="store-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
      />

      <section className="store-hero">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="premium-eyebrow text-emerald-300">EV şarj mağazası</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
              Cihazı seçin. Kurulumu netleştirin.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/68">
              Ev, site ve işletme için uygun wallbox, DC ünite ve aksesuarları tek ekranda karşılaştırın.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/12 bg-white/10 p-5 text-white backdrop-blur">
            {[
              ["Ürün", `${products.length} seçenek`],
              ["Filtre", `${activeFilterCount} aktif`],
              ["Fiyat", `${formatPriceTRY(minPrice)} - ${formatPriceTRY(maxPrice)}`]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2">
                <span className="text-sm text-white/58">{label}</span>
                <span className="text-sm font-black">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickSegments.map((segment) => (
            <Link key={segment.label} href={segment.href} className="store-segment-card">
              <span className="text-lg font-black">{segment.label}</span>
              <span className="text-xs font-bold text-white/58">{segment.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="w-full lg:sticky lg:top-24 lg:h-fit">
          <form action="/magaza" className="surface-card p-5">
            <p className="text-sm font-black uppercase text-primary">Filtrele</p>
            <label className="mt-5 grid gap-2">
              <span className="text-sm text-on-surface-variant">Arama</span>
              <input
                name="q"
                defaultValue={query}
                placeholder="22 kW, RFID, Type 2"
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
            <label className="mt-4 grid gap-2">
              <span className="text-sm text-on-surface-variant">Güç</span>
              <select
                name="power"
                defaultValue={selectedPower}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
              >
                <option value="">Tüm güçler</option>
                {filterOptions.powerTiers.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 grid gap-2">
              <span className="text-sm text-on-surface-variant">Kurulum</span>
              <select
                name="installation"
                defaultValue={selectedInstallation}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
              >
                <option value="">Tüm kurulumlar</option>
                {filterOptions.installationModes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 grid gap-2">
              <span className="text-sm text-on-surface-variant">Sıralama</span>
              <select
                name="sort"
                defaultValue={selectedSort}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
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
              className="mt-5 w-full rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white"
            >
              Uygula
            </button>
          </form>

          <div className="surface-card mt-5 p-5">
            <p className="text-sm font-black uppercase text-primary">Kategoriler</p>
            <div className="mt-4 grid gap-2">
              {categoryFilters.map((filter) => (
                <Link
                  key={filter.label}
                  href={buildStoreHref({
                    category: filter.value || undefined,
                    q: query || undefined,
                    sort: selectedSort,
                    power: selectedPower || undefined,
                    installation: selectedInstallation || undefined
                  })}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                    filter.active ? "bg-surface-container-low text-primary" : "hover:bg-surface-container-low"
                  }`}
                >
                  <span className="font-black">{filter.label}</span>
                  <span className="text-xs font-black text-outline">{filter.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <section className="store-results min-w-0">
          <header className="store-results__header mb-6 rounded-[24px] border border-outline-variant/40 bg-white/88 p-5 shadow-[0_16px_44px_rgba(19,27,46,0.06)] backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-primary">Sonuçlar</p>
                <h2 className="mt-2 text-3xl font-black text-on-surface">
                  {sortedProducts.length} ürün
                </h2>
              </div>
              {(selectedCategory || query || selectedPower || selectedInstallation || selectedSort !== "recommended") ? (
                <Link
                  href="/magaza"
                  className="rounded-full border border-outline-variant/40 px-4 py-3 text-sm font-black text-primary"
                >
                  Filtreleri temizle
                </Link>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ["Güvenli ödeme", "PayTR altyapısı"],
                ["Kurulum", "Keşif ile netleşir"],
                ["Destek", "Satış sonrası servis"]
              ].map(([label, detail]) => (
                <div key={label} className="rounded-2xl bg-surface-container-low px-4 py-3">
                  <p className="text-sm font-black text-on-surface">{label}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{detail}</p>
                </div>
              ))}
            </div>
          </header>

          {sortedProducts.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <h2 className="text-3xl font-black text-on-surface">Sonuç bulunamadı</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-on-surface-variant">
                Filtreleri sadeleştirerek tekrar deneyin veya teknik keşif isteyin.
              </p>
              <Link
                href="/magaza"
                className="mt-7 inline-flex rounded-2xl bg-primary px-6 py-4 text-base font-black text-white"
              >
                Tüm ürünler
              </Link>
            </div>
          ) : (
            <div className="store-product-grid grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
