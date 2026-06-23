import type { Metadata } from "next";
import { Headphones, Search, ShieldCheck, SlidersHorizontal, Truck, X } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import { StoreProductSelectorAccordion } from "@/components/shop/store-product-selector-accordion";
import { conversionDataAttributes } from "@/lib/conversion-events";
import { absoluteUrl } from "@/lib/site";
import { getProductStoreProfile, getStoreFilterOptions } from "@/lib/shop-merchandising";
import {
  getBreadcrumbJsonLd,
  getProductImageUrl,
  stringifyJsonLd
} from "@/lib/structured-data";
import { listPublicProducts } from "@/server/admin/repository";

export const metadata: Metadata = {
  title: "EV Şarj Mağazası | Ev, Site ve İşletme Çözümleri",
  description:
    "Ev tipi wallbox, site ve apartman şarj altyapısı, işletme otoparkı, DC hızlı şarj ve Type 2 aksesuarları araç uyumu ve kurulum ihtiyacıyla karşılaştırın.",
  alternates: {
    canonical: "/magaza"
  },
  openGraph: {
    title: "ParkChargeEV EV Şarj Mağazası",
    description: "Doğru cihazı, kurulum ihtiyacını ve araç uyumunu tek ekranda karşılaştırın.",
    url: "/magaza",
    type: "website"
  }
};

const sortOptions = [
  { value: "recommended", label: "Karar için önerilenler" },
  { value: "price-asc", label: "Fiyat artan" },
  { value: "price-desc", label: "Fiyat azalan" },
  { value: "name-asc", label: "İsim A-Z" }
] as const;

const quickSegments = [
  { label: "Ev tipi", href: "/magaza?power=7.4%20kW", detail: "7.4 / 11 kW wallbox" },
  { label: "Site yönetimi", href: "/magaza?power=22%20kW", detail: "RFID + ortak kullanım" },
  { label: "Ofis otoparkı", href: "/magaza?installation=Sabit%20kurulum", detail: "22 kW AC + servis" },
  { label: "Type 2 aksesuar", href: "/magaza?category=Aksesuar", detail: "Kablo ve uyum" }
] as const;

const storeAssuranceItems = [
  { icon: ShieldCheck, title: "Güvenli ödeme", detail: "PayTR altyapısı" },
  { icon: Truck, title: "81 ile gönderim", detail: "Takipli ürün kargosu" },
  { icon: Headphones, title: "Uzman desteği", detail: "Ürün ve kurulum danışmanlığı" }
] as const;

type StorePageProps = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    power?: string;
    installation?: string;
    view?: string;
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
  installation,
  view
}: {
  category?: string;
  q?: string;
  sort?: string;
  power?: string;
  installation?: string;
  view?: string;
}) {
  const params = new URLSearchParams();

  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (sort && sort !== "recommended") params.set("sort", sort);
  if (power) params.set("power", power);
  if (installation) params.set("installation", installation);
  if (view && view !== "grid") params.set("view", view);

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
  const selectedView = params.view === "list" ? "list" : "grid";

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

  const activeFilterCount = [
    selectedCategory,
    query,
    selectedPower,
    selectedInstallation,
    selectedView !== "grid" ? selectedView : "",
    selectedSort !== "recommended" ? selectedSort : ""
  ].filter(Boolean).length;
  const featuredProducts = products.slice(0, 6);
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
  const renderFilterFields = (compact = false) => (
    <>
      <label className="store-filter-field">
        <span>Arama</span>
        <input
          name="q"
          defaultValue={query}
          placeholder="Araç, güç, RFID, Type 2"
        />
      </label>
      {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
      <label className="store-filter-field">
        <span>Güç</span>
        <select name="power" defaultValue={selectedPower}>
          <option value="">Tüm güç seviyeleri</option>
          {filterOptions.powerTiers.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="store-filter-field">
        <span>Kurulum</span>
        <select name="installation" defaultValue={selectedInstallation}>
          <option value="">Tüm kurulum seçenekleri</option>
          {filterOptions.installationModes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="store-filter-field">
        <span>Sıralama</span>
        <select name="sort" defaultValue={selectedSort}>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="store-filter-submit"
        {...conversionDataAttributes("product_filter_apply", {
          source: compact ? "mobile" : "desktop",
          selectedCategory: selectedCategory || "all",
          selectedPower: selectedPower || "all",
          selectedInstallation: selectedInstallation || "all"
        })}
      >
        {compact ? "Sonuçları Göster" : "Filtreleri Uygula"}
      </button>
    </>
  );

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

      <section className="store-commerce-header">
        <div className="store-commerce-header__top">
          <div>
            <p className="premium-eyebrow">ParkChargeEV mağaza</p>
          </div>

          <form action="/magaza" className="store-hero-search">
              <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <input
                name="q"
                defaultValue={query}
                aria-label="Mağazada ürün ara"
                placeholder="Ürün, güç, Type 2 veya RFID ara"
              />
              <button type="submit">Ara</button>
          </form>
        </div>

        <div className="store-commerce-header__nav">
          <div className="store-segment-grid">
          {quickSegments.map((segment) => (
            <Link
              key={segment.label}
              href={segment.href}
              className="store-segment-card"
              {...conversionDataAttributes("store_quick_segment_click", {
                segment: segment.label,
                href: segment.href
              })}
            >
              <span className="text-base font-black">{segment.label}</span>
              <span className="text-xs font-bold text-on-surface-variant">{segment.detail}</span>
            </Link>
          ))}
          </div>

          <div className="store-inline-assurance" aria-label="Mağaza güvenceleri">
            {storeAssuranceItems.map((item) => {
              const Icon = item.icon;

              return (
                <span key={item.title}>
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.title}
                </span>
              );
            })}
          </div>
        </div>

        <StoreProductSelectorAccordion products={products} />
      </section>

      {activeFilterCount === 0 && featuredProducts.length > 0 ? (
        <section className="store-featured mt-6" aria-labelledby="store-featured-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="premium-eyebrow">Öne çıkanlar</p>
              <h2 id="store-featured-title" className="mt-2 text-2xl font-black text-on-surface md:text-3xl">
                Popüler şarj ürünleri
              </h2>
            </div>
            <a href="#urun-listesi" className="btn-secondary shrink-0">
              Tüm ürünler
            </a>
          </div>

          <div className="store-product-rail mt-5" aria-label="Öne çıkan ürünler">
            {featuredProducts.map((product) => (
              <div key={`featured-${product.id}`} className="store-product-slide">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="store-mobile-tools">
        <details className="store-mobile-filter">
          <summary>
            <SlidersHorizontal className="store-mobile-filter__filter-icon" aria-hidden />
            <X className="store-mobile-filter__close-icon" aria-hidden />
            <span className="store-mobile-filter__open-label">Filtrele ve Sırala</span>
            <span className="store-mobile-filter__close-label">Filtreleri Kapat</span>
            {activeFilterCount > 0 ? <b>{activeFilterCount}</b> : null}
          </summary>
          <span className="store-mobile-filter__backdrop" aria-hidden />
          <div className="store-mobile-filter__panel">
            <div className="store-mobile-filter__heading">
              <p>Ürünleri daraltın</p>
              <span>{sortedProducts.length} seçenek</span>
            </div>
            <form action="/magaza" className="store-filter-form store-filter-form--mobile">
              {renderFilterFields(true)}
            </form>
          </div>
        </details>
      </div>

      <div className="store-catalog-layout">
        <aside className="store-filter-sidebar">
          <form action="/magaza" className="store-filter-form surface-card">
            <p className="store-filter-title">Ürünleri filtrele</p>
            {renderFilterFields()}
          </form>

        </aside>

        <section id="urun-listesi" className="store-results min-w-0 scroll-mt-28">
          <header className="store-results__header">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="store-results__eyebrow">Sonuçlar</p>
                <h2>
                  {sortedProducts.length} uygun seçenek
                </h2>
                <p className="store-results__summary">
                  {activeFilterCount > 0
                    ? `${activeFilterCount} filtre uygulanıyor.`
                    : "Filtreleyin, karşılaştırın ve doğru ürünü seçin."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={buildStoreHref({
                    category: selectedCategory || undefined,
                    q: query || undefined,
                    sort: selectedSort,
                    power: selectedPower || undefined,
                    installation: selectedInstallation || undefined,
                    view: "grid"
                  })}
                  className={`store-view-toggle ${selectedView === "grid" ? "store-view-toggle--active" : ""}`}
                >
                  Kart
                </Link>
                <Link
                  href={buildStoreHref({
                    category: selectedCategory || undefined,
                    q: query || undefined,
                    sort: selectedSort,
                    power: selectedPower || undefined,
                    installation: selectedInstallation || undefined,
                    view: "list"
                  })}
                  className={`store-view-toggle ${selectedView === "list" ? "store-view-toggle--active" : ""}`}
                >
                  Liste
                </Link>
                {(selectedCategory || query || selectedPower || selectedInstallation || selectedSort !== "recommended" || selectedView !== "grid") ? (
                  <Link
                    href="/magaza"
                    className="rounded-full border border-outline-variant/40 px-4 py-3 text-sm font-black text-primary"
                  >
                    Filtreleri temizle
                  </Link>
                ) : null}
              </div>
            </div>

          </header>

          {sortedProducts.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <h2 className="text-3xl font-black text-on-surface">Sonuç bulunamadı</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-on-surface-variant">
                Filtreleri sadeleştirerek tekrar deneyin ya da aracınız ve otoparkınız için keşif talebi bırakın.
              </p>
              <Link
                href="/magaza"
                className="mt-7 inline-flex rounded-2xl bg-primary px-6 py-4 text-base font-black text-white"
              >
                Tüm ürünler
              </Link>
            </div>
          ) : (
            <div className={selectedView === "list" ? "store-product-grid grid gap-4" : "store-product-grid store-product-grid--commerce grid gap-5 md:grid-cols-2 xl:grid-cols-3"}>
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  layout={selectedView === "list" ? "store" : "standard"}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
