"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BadgeCheck, CreditCard, ShieldCheck, ShoppingCart, Truck, Zap } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import { trackConversionEvent } from "@/lib/conversion-events";
import { formatPriceTRY } from "@/lib/format";
import type { ProductModel } from "@/lib/mock-data";
import {
  getProductCableOptions,
  getProductSelectedCableOption
} from "@/lib/product-options";
import { getProductStoreProfile } from "@/lib/shop-merchandising";

type ProductPurchasePanelProps = {
  product: ProductModel;
  benefits?: string[];
};

const defaultBenefits = [
  "Tek sayfa güvenli ödeme",
  "Garanti ve teknik destek",
  "Keşifle doğru kurulum"
];

export function ProductPurchasePanel({
  product,
  benefits = defaultBenefits
}: ProductPurchasePanelProps) {
  const { addItem, isHydrated } = useCart();
  const router = useRouter();
  const cableOptions = getProductCableOptions(product);
  const [cableOption, setCableOption] = useState(cableOptions[0]?.label ?? "");
  const cableOptionRef = useRef(cableOptions[0]?.label ?? "");
  const [purchaseMode, setPurchaseMode] = useState<"product" | "survey">("product");
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedOption = getProductSelectedCableOption(product, cableOption);
  const storeProfile = getProductStoreProfile(product);
  const isOutOfStock = product.stockLabel === "Stokta Yok";
  const isAddDisabled = isOutOfStock || !isHydrated;
  const estimatedLineTotal = selectedOption.priceKurus * quantity;
  const selectedVariant =
    product.variants?.find((variant) => variant.cableLength === cableOption) ??
    product.variants?.find((variant) => variant.isDefault) ??
    product.variants?.[0];
  const selectedSku = selectedVariant?.sku ?? product.slug.toUpperCase();
  const discountPercent = selectedOption.compareAtKurus
    ? Math.round(
        ((selectedOption.compareAtKurus - selectedOption.priceKurus) /
          selectedOption.compareAtKurus) *
          100
      )
    : null;
  const purchaseTrustSignals = [
    { label: "Uyum", detail: storeProfile.connectorHint, icon: BadgeCheck },
    { label: "Kurulum", detail: storeProfile.installationMode, icon: Zap },
    { label: "Ödeme", detail: "Güvenli checkout", icon: ShieldCheck }
  ];

  function addCurrentSelection() {
    if (isOutOfStock) {
      return false;
    }

    addItem({
      productId: product.id,
      cableOption: cableOptionRef.current,
      quantity,
      productSnapshot: product
    });
    trackConversionEvent("add_to_cart", {
      productId: product.id,
      productName: product.name,
      category: product.category,
      priceKurus: selectedOption.priceKurus,
      quantity,
      purchaseMode,
      cableOption: cableOptionRef.current
    });
    setFeedback(`${quantity} adet ürün sepete eklendi.`);
    return true;
  }

  function handleAddToCart() {
    addCurrentSelection();
  }

  function handleBuyNow() {
    if (addCurrentSelection()) {
      router.push("/checkout");
    }
  }

  function selectCableOption(nextCableOption: string) {
    cableOptionRef.current = nextCableOption;
    setCableOption(nextCableOption);
  }

  function selectPurchaseMode(nextPurchaseMode: "product" | "survey") {
    setPurchaseMode(nextPurchaseMode);
    trackConversionEvent("purchase_mode_select", {
      productId: product.id,
      productName: product.name,
      mode: nextPurchaseMode
    });
  }

  return (
    <div className="product-purchase-panel">
      <div className="product-mobile-inline-atc" aria-label="Mobil hızlı sepete ekle">
        <div>
          <span>Sepet toplamı</span>
          <strong>{formatPriceTRY(estimatedLineTotal)}</strong>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAddDisabled}
          aria-busy={!isHydrated}
        >
          {isOutOfStock ? "Stokta Yok" : "Sepete Ekle"}
        </button>
      </div>

      <div className="product-purchase-panel__price mt-8 rounded-lg border border-primary/12 bg-white p-5 shadow-[0_18px_44px_rgba(6,51,38,0.08)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-on-surface-variant">
              ParkChargeEV fiyatı
            </p>
            <p className="mt-2 text-5xl font-bold text-primary">
              {formatPriceTRY(selectedOption.priceKurus)}
            </p>
          </div>
        {selectedOption.compareAtKurus ? (
          <div className="pb-1">
            <p className="text-lg font-semibold text-on-surface-variant line-through">
              {formatPriceTRY(selectedOption.compareAtKurus)}
            </p>
            {discountPercent ? (
              <p className="mt-1 text-sm font-semibold text-secondary">
                %{discountPercent} avantaj
              </p>
            ) : null}
          </div>
        ) : null}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="product-purchase-panel__deal product-purchase-panel__deal--red">
            <CreditCard className="h-4 w-4" aria-hidden />
            <span>Havale/EFT ve kartlı ödeme</span>
          </div>
          <div className="product-purchase-panel__deal product-purchase-panel__deal--dark">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            <span>Güvenli PayTR altyapısı</span>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-outline-variant/35 bg-surface-container-low p-4">
          <p className="text-sm font-medium text-on-surface-variant">Miktar</p>
          <div className="product-purchase-panel__action-row mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 rounded-lg bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="text-xl text-on-surface-variant transition hover:text-primary"
                aria-label="Miktarı azalt"
              >
                -
              </button>
              <span className="min-w-8 text-center text-lg font-semibold text-on-surface">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                className="text-xl text-on-surface-variant transition hover:text-primary"
                aria-label="Miktarı artır"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddDisabled}
              aria-busy={!isHydrated}
              className="product-purchase-panel__add-button inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-primary to-secondary px-6 py-4 text-center text-base font-semibold text-white shadow-[0_18px_50px_rgba(6,51,38,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
              {isOutOfStock ? "Stokta Yok" : "Sepete Ekle"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isAddDisabled}
              aria-busy={!isHydrated}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-4 text-center text-base font-bold text-white shadow-[0_18px_50px_rgba(16,185,129,0.22)] transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Zap className="h-5 w-5" aria-hidden />
              Hemen Satın Al
            </button>
          </div>
          {feedback ? (
            <p className="mt-4 text-sm font-medium text-secondary" aria-live="polite">
              {feedback}{" "}
              <Link href="/sepet" className="text-primary underline underline-offset-4">
                Sepete git
              </Link>
            </p>
          ) : null}
        </div>
      </div>

      <div className="product-purchase-panel__trust mt-5 grid gap-2 sm:grid-cols-3">
        {purchaseTrustSignals.map((signal) => {
          const Icon = signal.icon;

          return (
            <div key={signal.label} className="rounded-lg border border-outline-variant/35 bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <p className="text-xs font-semibold uppercase text-on-surface-variant">
                  {signal.label}
                </p>
              </div>
              <p className="mt-1 text-sm font-bold leading-5 text-on-surface">{signal.detail}</p>
            </div>
          );
        })}
      </div>
      <p className="product-purchase-panel__fit-note mt-3 rounded-lg bg-surface-container-low px-4 py-3 text-xs leading-5 text-on-surface-variant">
        Emin değilseniz keşifle ilerleyin. Ürün kodu: <strong>{selectedSku}</strong>
      </p>

      <div className="product-purchase-panel__route mt-8 rounded-lg bg-surface-container-low p-6">
        <p className="text-sm font-semibold uppercase text-on-surface-variant">
          1 karar yeterli
        </p>

        <div className="mt-5">
          <p className="text-sm font-medium text-on-surface-variant">Nasıl ilerlemek istersiniz?</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              {
                value: "product",
                label: "Ürün siparişi",
                detail: "Stoktan sevk"
              },
              {
                value: "survey",
                label: "Keşifle al",
                detail: storeProfile.installationMode
              }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={purchaseMode === option.value}
                onClick={() => selectPurchaseMode(option.value as "product" | "survey")}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                  purchaseMode === option.value
                    ? "border-primary bg-white text-primary"
                    : "border-outline-variant/40 bg-surface text-on-surface hover:border-primary/20"
                }`}
              >
                <span>{option.label}</span>
                <span className="mt-1 block text-xs text-on-surface-variant">
                  {option.detail}
                </span>
              </button>
            ))}
          </div>
          {purchaseMode === "survey" ? (
            <p className="mt-3 rounded-lg border border-primary/15 bg-white px-4 py-3 text-xs leading-5 text-on-surface-variant">
              Sepete ekleyin, keşifte hat, pano ve randevu bilgisi netleşsin.
            </p>
          ) : null}
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-on-surface-variant">Kablo uzunluğu</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {cableOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={option.label === cableOption}
                disabled={!isHydrated}
                onClick={() => selectCableOption(option.label)}
                className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                  option.label === cableOption
                    ? "border-primary bg-white text-primary"
                    : "border-outline-variant/40 bg-surface text-on-surface hover:border-primary/20"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span>{option.label}</span>
                {option.priceDeltaKurus > 0 ? (
                  <span className="mt-1 block text-xs text-on-surface-variant">
                    {formatPriceTRY(option.priceKurus)}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-outline-variant/35 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-on-surface-variant">Tahmini ara toplam</span>
            <span className="text-lg font-bold text-on-surface">
              {formatPriceTRY(estimatedLineTotal)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm text-on-surface-variant">
            <span className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4" aria-hidden />
              Kargo
            </span>
            <span className="font-semibold text-primary">
              Sepette netleşir
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm text-on-surface-variant">
            <span>Teslimat</span>
            <span className="font-semibold text-primary">
              {purchaseMode === "survey" ? "Keşif talebi önerilir" : "Stok ve operasyon planına göre"}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-on-surface-variant">
            KDV, teslimat ve varsa kurulum kalemi sepette netleşir.
          </p>
        </div>

        {purchaseMode === "survey" ? (
          <Link
            href={`/iletisim?reason=${encodeURIComponent(`${product.name} kurulum keşfi`)}`}
            className="mt-4 block rounded-lg border border-primary/20 bg-white px-5 py-4 text-center text-sm font-semibold text-primary"
          >
            Kurulum keşfi iste
          </Link>
        ) : null}

        <div className="product-purchase-panel__benefits mt-6 flex flex-wrap gap-2 text-sm text-on-surface-variant">
          {benefits.map((benefit) => (
            <span key={benefit}>{benefit}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
