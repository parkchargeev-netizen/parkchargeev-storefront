"use client";

import {
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  Wrench,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/providers/cart-provider";
import { ProductCard } from "@/components/shop/product-card";
import { ProductDevicePreview } from "@/components/shop/product-device-preview";
import {
  enrichCartItems,
  getEnrichedCartSubtotalKurus,
  getEnrichedCartTaxKurus,
  getEnrichedCartTotalKurus,
  type EnrichedCartItem
} from "@/lib/cart";
import { formatPriceTRY } from "@/lib/format";
import { products } from "@/lib/mock-data";
import { getDisplayProductImageUrl } from "@/lib/product-media";
import { serviceCoverageSummary } from "@/lib/service-coverage";
import { getProductStoreProfile } from "@/lib/shop-merchandising";
import { siteConfig } from "@/lib/site";

const checkoutSteps = ["Sepet", "Teslimat", "Kurulum", "Ödeme"] as const;

const cartTrustSignals = [
  { icon: ShieldCheck, label: "PayTR güvenli ödeme" },
  { icon: Truck, label: "81 il ürün kargosu" },
  { icon: BadgeCheck, label: "Garanti + teknik destek" }
] as const;

function getWhatsAppHref() {
  return `https://wa.me/${siteConfig.whatsappPhone}?text=${encodeURIComponent(
    "Merhaba, ParkChargeEV sepetimdeki ürünler ve kurulum için destek istiyorum."
  )}`;
}

function getProductImageUrl(item: EnrichedCartItem) {
  return getDisplayProductImageUrl(item.product.imageUrl);
}

export function CartPageClient() {
  const {
    items: cartItems,
    isHydrated,
    updateQuantity,
    removeItem
  } = useCart();
  const items = enrichCartItems(cartItems);
  const subtotalKurus = getEnrichedCartSubtotalKurus(items);
  const taxKurus = getEnrichedCartTaxKurus(items);
  const totalKurus = getEnrichedCartTotalKurus(items);
  const whatsappHref = getWhatsAppHref();
  const hasInstallableProduct = items.some(
    (item) => getProductStoreProfile(item.product).installationMode !== "Kurulum gerekmez"
  );

  const suggestions = products
    .filter((product) => !items.some((item) => item.product.id === product.id))
    .sort((left, right) => {
      const leftIsAccessory = left.category.toLocaleLowerCase("tr-TR").includes("aksesuar");
      const rightIsAccessory = right.category.toLocaleLowerCase("tr-TR").includes("aksesuar");

      if (leftIsAccessory === rightIsAccessory) {
        return left.priceKurus - right.priceKurus;
      }

      return leftIsAccessory ? -1 : 1;
    })
    .slice(0, 3);

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="cart-summary-card p-7">
          <p className="text-base font-semibold text-on-surface-variant">
            Sepetiniz hazırlanıyor...
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="cart-hero">
          <div className="relative z-10 max-w-3xl">
            <p className="premium-eyebrow text-emerald-300">Sepet boş</p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
              Doğru şarj çözümünü mağazadan seçin.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
              Ev tipi wallbox, site/ofis AC istasyonları ve Type 2 aksesuarları kısa kartlarla karşılaştırın.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/magaza" className="premium-btn premium-btn--primary">
                Mağazaya Git
              </Link>
              <Link href="/urun-secici" className="premium-btn premium-btn--glass">
                Ürün Seçici
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="cart-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="cart-hero">
        <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <Link
              href="/magaza"
              className="inline-flex items-center gap-2 text-sm font-black text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Alışverişe devam et
            </Link>
            <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              Sepetin hazır. Ödeme ve teslimat net.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
              Ürünleri, KDV dahil toplamı, 81 il kargoyu ve varsa keşif ihtiyacını tek ekranda kontrol edin.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/12 bg-white/[0.14] p-4 backdrop-blur">
            <div className="flex flex-wrap gap-2">
              {checkoutSteps.map((step, index) => (
                <span key={step} className="cart-step-pill" data-active={index === 0}>
                  {index + 1}
                  {step}
                </span>
              ))}
            </div>
            <div className="mt-5 grid gap-2">
              {cartTrustSignals.map((signal) => {
                const Icon = signal.icon;

                return (
                  <div key={signal.label} className="flex items-center gap-3 text-sm font-bold text-white/76">
                    <Icon className="h-4 w-4 text-emerald-300" aria-hidden />
                    {signal.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_390px]">
        <section className="space-y-4">
          {items.map((item) => {
            const profile = getProductStoreProfile(item.product);

            return (
              <article key={`${item.product.id}-${item.cableOption}`} className="cart-summary-card p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-[132px_1fr]">
                  <Link
                    href={`/urun/${item.product.slug}`}
                    className="relative overflow-hidden rounded-[22px] bg-surface-container-low"
                  >
                    {getProductImageUrl(item) ? (
                      <Image
                        src={getProductImageUrl(item) as string}
                        alt={item.product.name}
                        width={300}
                        height={240}
                        loading="lazy"
                        unoptimized
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <ProductDevicePreview
                        productName={item.product.name}
                        powerLabel={item.product.powerLabel}
                        className="rounded-[22px]"
                      />
                    )}
                  </Link>

                  <div className="min-w-0">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                            {profile.powerTier}
                          </span>
                          <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-black text-secondary">
                            {profile.installationMode}
                          </span>
                        </div>
                        <Link
                          href={`/urun/${item.product.slug}`}
                          className="mt-3 block text-2xl font-black leading-tight text-on-surface transition hover:text-primary"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-on-surface-variant">
                          {item.product.summary}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id, item.cableOption)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-outline-variant/40 bg-white text-on-surface-variant transition hover:border-red-200 hover:text-red-600"
                        aria-label={`${item.product.name} ürününü sepetten kaldır`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {[
                        ["Varyant", item.cableOption],
                        ["Uyum", profile.connectorHint],
                        ["Kurulum", profile.installationHint]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl bg-surface-container-low px-4 py-3">
                          <p className="text-[10px] font-black uppercase text-on-surface-variant">
                            {label}
                          </p>
                          <p className="mt-1 text-sm font-black leading-5 text-on-surface">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-outline-variant/40 bg-white p-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.cableOption, item.quantity - 1)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
                          aria-label="Miktarı azalt"
                        >
                          <Minus className="h-4 w-4" aria-hidden />
                        </button>
                        <span className="min-w-9 text-center text-sm font-black text-on-surface">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.cableOption, item.quantity + 1)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
                          aria-label="Miktarı artır"
                        >
                          <Plus className="h-4 w-4" aria-hidden />
                        </button>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-xs font-black uppercase text-on-surface-variant">
                          Satır toplamı
                        </p>
                        <p className="mt-1 text-3xl font-black text-primary">
                          {formatPriceTRY(item.lineTotalKurus)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {hasInstallableProduct ? (
            <div className="cart-summary-card p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Wrench className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-on-surface">
                      Kurulum keşfini sepete bağlayın
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                      Pano, faz, kablo hattı ve koruma ekipmanı ödeme öncesi netleşsin.
                      {` ${serviceCoverageSummary.installation}.`}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/iletisim?reason=${encodeURIComponent("Ev tipi kurulum talebi")}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-primary/20 bg-white px-5 py-3 text-sm font-black text-primary"
                >
                  Keşif Ekle
                </Link>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="cart-summary-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase text-primary">Sipariş özeti</p>
                <h2 className="mt-2 text-3xl font-black text-on-surface">
                  {items.length} kalem
                </h2>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-container text-secondary">
                <CreditCard className="h-5 w-5" aria-hidden />
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Ara toplam</span>
                <span className="font-semibold text-on-surface">{formatPriceTRY(subtotalKurus)}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Kargo</span>
                <span className="font-black text-secondary">81 il</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>KDV (%20)</span>
                <span className="font-semibold text-on-surface">{formatPriceTRY(taxKurus)}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-outline-variant/35 pt-5">
              <div className="flex items-end justify-between gap-4">
                <span className="text-base font-black text-on-surface">Genel toplam</span>
                <span className="text-4xl font-black text-primary">
                  {formatPriceTRY(totalKurus)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                {serviceCoverageSummary.shipping}. Kurulum keşfi teklif kapsamına göre ayrıca
                netleşir. {serviceCoverageSummary.installation}.
              </p>
            </div>

            <Link
              href="/odeme"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-primary to-secondary px-6 py-4 text-sm font-black text-white shadow-[0_18px_50px_rgba(6,51,38,0.22)]"
            >
              Güvenli Ödemeye Geç
              <Zap className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-secondary/20 bg-secondary-container/35 px-6 py-4 text-sm font-black text-secondary"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp Destek
            </a>

            <div className="mt-5 rounded-[22px] bg-surface-container-low p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                <p className="text-sm font-black text-on-surface">Terk azaltıcı not</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                Adres ve kurulum tercihini ödeme akışında kısa adımlarla alıyoruz; üyelik zorunlu değil.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {suggestions.length > 0 ? (
        <section className="mt-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="premium-eyebrow">Sepeti tamamla</p>
              <h2 className="mt-3 text-3xl font-black text-on-surface">
                Kablo, aksesuar ve alternatif cihazlar
              </h2>
            </div>
            <Link href="/magaza" className="btn-secondary shrink-0">
              Tüm mağaza
            </Link>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {suggestions.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="cart-mobile-checkout-bar">
        <div>
          <span>Genel toplam</span>
          <strong>{formatPriceTRY(totalKurus)}</strong>
        </div>
        <Link href="/odeme">Ödemeye Geç</Link>
      </div>
    </div>
  );
}
