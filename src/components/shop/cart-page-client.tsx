"use client";

import Link from "next/link";

import { useCart } from "@/components/providers/cart-provider";
import { ProductCard } from "@/components/shop/product-card";
import { formatPriceTRY } from "@/lib/format";
import { products } from "@/lib/mock-data";

export function CartPageClient() {
  const {
    items,
    isHydrated,
    subtotalKurus,
    taxKurus,
    totalKurus,
    updateQuantity,
    removeItem
  } = useCart();

  const suggestions = products
    .filter((product) => !items.some((item) => item.product.id === product.id))
    .slice(0, 3);

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="surface-card p-8">
          <p className="text-lg text-on-surface-variant">Sepetiniz hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="surface-card p-10 text-center lg:p-14">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
            Sepetiniz boş
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
            Ürün eklediğinizde sipariş özeti burada görünecek
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-on-surface-variant">
            Mağazaya dönerek ürün karşılaştırabilir, kurumsal çözüm sayfalarından keşif
            talebi bırakabilir veya rehber içeriklerle satın alma kararınızı netleştirebilirsiniz.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/magaza"
              className="rounded-2xl bg-primary px-7 py-4 text-base font-semibold text-white"
            >
              Mağazaya Git
            </Link>
            <Link
              href="/kurumsal-cozumler"
              className="rounded-2xl border border-outline-variant/40 bg-surface-container-low px-7 py-4 text-base font-semibold text-on-surface"
            >
              Kurumsal Çözümler
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <h1 className="text-6xl font-black tracking-[-0.09em] text-on-surface">
        Alışveriş Sepeti
      </h1>
      <p className="mt-4 text-lg text-on-surface-variant">
        Sepetinizdeki ürünler gerçek fiyat ve miktar bilgileriyle senkron tutulur.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          {items.map((item) => (
            <article key={`${item.product.id}-${item.cableOption}`} className="surface-card flex gap-5 p-5">
              <div className="h-28 w-28 rounded-[22px] bg-linear-to-br from-surface-container to-surface-container-high" />
              <div className="flex flex-1 flex-col justify-between gap-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
                      {item.product.name}
                    </h2>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {item.product.powerLabel} · {item.product.summary}
                    </p>
                    <p className="mt-2 text-sm font-medium text-primary">
                      {item.cableOption}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id, item.cableOption)}
                    className="text-sm font-semibold text-on-surface-variant transition hover:text-red-600"
                  >
                    Kaldır
                  </button>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4 rounded-full bg-surface-container-low px-4 py-3 text-on-surface">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.cableOption, item.quantity - 1)
                      }
                      className="text-xl text-on-surface-variant transition hover:text-primary"
                      aria-label="Miktarı azalt"
                    >
                      -
                    </button>
                    <span className="min-w-8 text-center text-lg font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.cableOption, item.quantity + 1)
                      }
                      className="text-xl text-on-surface-variant transition hover:text-primary"
                      aria-label="Miktarı artır"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-3xl font-black tracking-[-0.05em] text-on-surface">
                    {formatPriceTRY(item.lineTotalKurus)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="surface-card h-fit p-8">
          <h2 className="text-4xl font-black tracking-[-0.07em] text-on-surface">
            Sipariş Özeti
          </h2>
          <div className="mt-8 space-y-4 text-base">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>Ara Toplam</span>
              <span>{formatPriceTRY(subtotalKurus)}</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>Kargo</span>
              <span className="font-semibold text-secondary">Ücretsiz</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>KDV (%20)</span>
              <span>{formatPriceTRY(taxKurus)}</span>
            </div>
          </div>
          <div className="mt-6 border-t border-outline-variant/35 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-on-surface">Genel Toplam</span>
              <span className="text-4xl font-black tracking-[-0.06em] text-primary">
                {formatPriceTRY(totalKurus)}
              </span>
            </div>
          </div>

          <Link
            href="/odeme"
            className="mt-8 block rounded-2xl bg-linear-to-r from-primary to-secondary px-6 py-4 text-center text-base font-semibold text-white shadow-[0_18px_50px_rgba(0,68,211,0.22)]"
          >
            Ödeme Adımına Geç
          </Link>
        </aside>
      </div>

      {suggestions.length > 0 ? (
        <section className="mt-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
                Önerilen ürünler
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-on-surface">
                Sepetinizi tamamlayabilecek alternatifler
              </h2>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {suggestions.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
