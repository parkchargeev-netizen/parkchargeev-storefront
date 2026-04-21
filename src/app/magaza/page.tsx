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

const categoryLabels = ["Ev Tipi", "İş Yeri Tipi", "DC Hızlı Şarj", "Aksesuar"];

const categoryFilters = [
  { label: "Tüm Ürünler", count: products.length, active: true },
  ...categoryLabels.map((label) => ({
    label,
    count: products.filter((product) => product.category === label).length,
    active: false
  }))
];

const minPrice = Math.min(...products.map((product) => product.priceKurus));
const maxPrice = Math.max(...products.map((product) => product.priceKurus));

export default function StorePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 lg:flex-row lg:px-8">
      <aside className="w-full lg:sticky lg:top-28 lg:w-80">
        <div className="surface-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Kategoriler
          </p>
          <div className="mt-6 space-y-3">
            {categoryFilters.map((filter) => (
              <label
                key={filter.label}
                className="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 transition hover:bg-surface-container-low"
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
                <span className="text-xs font-semibold text-outline">
                  {filter.count}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="surface-card mt-6 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Fiyat aralığı
          </p>
          <div className="mt-6">
            <div className="h-2 rounded-full bg-surface-container-high">
              <div className="h-2 w-2/3 rounded-full bg-primary" />
            </div>
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
          </div>
        </div>

        <div className="surface-card mt-6 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">
            Kurulum desteği
          </p>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            Ürün satın alma öncesinde keşif ve teknik uygunluk desteği almak için
            kurumsal veya bireysel talep bırakabilirsiniz.
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
            Ev, iş yeri ve ticari lokasyonlar için yüksek performanslı şarj
            ürünlerini; kurulum ve destek katmanıyla birlikte keşfedin.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-on-surface-variant">
              Toplam {products.length} ürün listeleniyor
            </p>
            <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              Sırala:{" "}
              <span className="font-semibold text-on-surface">Önerilenler</span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
