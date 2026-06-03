import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import { formatPriceTRY } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import {
  getStoreFilterOptions,
  getProductStoreProfile
} from "@/lib/shop-merchandising";
import {
  getBreadcrumbJsonLd,
  getProductImageUrl,
  stringifyJsonLd
} from "@/lib/structured-data";
import { listPublicProducts } from "@/server/admin/repository";

export const metadata: Metadata = {
  title: "Mağaza",
  alternates: {
    canonical: "/magaza"
  },
  openGraph: {
    title: "ParkChargeEV Mağaza",
    description:
      "Elektrikli araç şarj cihazı, wallbox, kablo ve kurulum çözümlerini karşılaştırın.",
    url: "/magaza",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ParkChargeEV Mağaza",
    description:
      "Elektrikli araç şarj cihazı, wallbox, kablo ve kurulum çözümlerini karşılaştırın."
  },
  description:
    "Ev tipi ve iş yeri tipi elektrikli araç şarj cihazları, kablolar ve kurulum çözümlerini keşfedin."
};

const sortOptions = [
  { value: "recommended", label: "Önerilenler" },
  { value: "price-asc", label: "Fiyat (artan)" },
  { value: "price-desc", label: "Fiyat (azalan)" },
  { value: "name-asc", label: "İsim (A-Z)" }
] as const;

const decisionGuides = [
  {
    label: "Ev için dengeli",
    title: "11 kW AC wallbox",
    detail: "Gece şarjı, villa ve günlük kullanım için güvenli başlangıç."
  },
  {
    label: "Hızlı AC",
    title: "22 kW trifaze",
    detail: "Togg, site otoparkı ve iş yerinde daha kısa bekleme süresi."
  },
  {
    label: "Kurumsal",
    title: "OCPP / RFID",
    detail: "Yetkilendirme, kullanıcı takibi ve çoklu istasyon yönetimi."
  },
  {
    label: "Altyapı",
    title: "Keşif + kurulum",
    detail: "Pano, sigorta, kablo hattı ve yük dengeleme netleştirilir."
  }
];

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

  if (category) {
    params.set("category", category);
  }

  if (q) {
    params.set("q", q);
  }

  if (sort && sort !== "recommended") {
    params.set("sort", sort);
  }

  if (power) {
    params.set("power", power);
  }

  if (installation) {
    params.set("installation", installation);
  }

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

  const categoryFilters = [
    {
      label: "Tüm Ürünler",
      value: "",
      count: optionScopedProducts.length,
      active: !selectedCategory
    },
    ...categoryLabels.map((label) => ({
      label,
      value: label,
      count: optionScopedProducts.filter((product) => product.category === label).length,
      active: selectedCategory === label
    }))
  ];

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
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
      />

      <section className="rounded-[32px] border border-outline-variant/45 bg-white p-7 shadow-[0_18px_50px_rgba(19,27,46,0.07)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
              EV şarj mağazası
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-0.08em] text-on-surface md:text-6xl">
              Wallbox, kablo ve kurulum kararını aynı ekranda netleştirin.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant">
              Güç, konnektör, pano uygunluğu ve kullanım senaryosunu birlikte
              filtreleyin; ürünü sepete eklemeden önce saha gereksinimini görün.
            </p>
          </div>
          <div className="grid gap-3 rounded-[24px] bg-surface-container-low p-5">
            {[
              ["Ürün", `${products.length} aktif seçenek`],
              ["Filtre", `${activeFilterCount} seçim uygulandı`],
              ["Fiyat", `${formatPriceTRY(minPrice)} - ${formatPriceTRY(maxPrice)}`]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span className="text-sm text-on-surface-variant">{label}</span>
                <span className="text-sm font-bold text-on-surface">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {decisionGuides.map((guide) => (
            <div
              key={guide.title}
              className="rounded-[22px] border border-outline-variant/35 bg-surface-container-low px-5 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {guide.label}
              </p>
              <p className="mt-2 text-lg font-bold text-on-surface">{guide.title}</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {guide.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[320px_1fr]">
        <aside className="w-full lg:sticky lg:top-28 lg:h-fit">
          <form action="/magaza" className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Ürün arama
            </p>
            <label className="mt-6 grid gap-2">
              <span className="text-sm text-on-surface-variant">Anahtar kelime</span>
              <input
                name="q"
                defaultValue={query}
                placeholder="Örn: 22 kW, RFID, Type 2"
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
              />
            </label>
            {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
            <label className="mt-4 grid gap-2">
              <span className="text-sm text-on-surface-variant">Güç sınıfı</span>
              <select
                name="power"
                defaultValue={selectedPower}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
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
              <span className="text-sm text-on-surface-variant">Kurulum tipi</span>
              <select
                name="installation"
                defaultValue={selectedInstallation}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
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
                    sort: selectedSort,
                    power: selectedPower || undefined,
                    installation: selectedInstallation || undefined
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
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">
              Kurulum desteği
            </p>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">
              Ürünü seçmeden önce pano kapasitesi, monofaze-trifaze altyapı,
              kablo hattı ve yük dengeleme ihtiyacını birlikte netleştirebiliriz.
            </p>
            <Link href="/iletisim" className="mt-6 inline-block text-sm font-semibold text-primary">
              Teknik keşif iste
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                  Görünen sonuç
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] text-on-surface">
                  {sortedProducts.length} ürün karşılaştırmaya hazır
                </h2>
              </div>
              {(selectedCategory || query || selectedPower || selectedInstallation || selectedSort !== "recommended") ? (
                <Link
                  href="/magaza"
                  className="rounded-full border border-outline-variant/40 px-4 py-3 text-sm font-semibold text-primary"
                >
                  Filtreleri Temizle
                </Link>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {[
                selectedCategory ? `Kategori: ${selectedCategory}` : "",
                query ? `Arama: ${query}` : "",
                selectedPower ? `Güç: ${selectedPower}` : "",
                selectedInstallation ? `Kurulum: ${selectedInstallation}` : ""
              ]
                .filter(Boolean)
                .map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface"
                  >
                    {item}
                  </span>
                ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                ["Kargo", "Stoktaki ürünlerde ücretsiz sevkiyat"],
                ["Kurulum", "Keşif ve saha uygunluk danışmanlığı"],
                ["Güvenli ödeme", "PayTR iframe ile kart verisi korunur"]
              ].map(([label, detail]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-outline-variant/35 bg-white px-4 py-3"
                >
                  <p className="text-sm font-semibold text-on-surface">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">{detail}</p>
                </div>
              ))}
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
    </div>
  );
}
