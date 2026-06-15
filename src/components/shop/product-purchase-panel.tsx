"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
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
  "PayTR güvenli ödeme ve net sipariş takibi",
  "Garanti, servis ve kurulum desteği",
  "Keşif talebiyle yanlış ürün riskini azaltma"
];

export function ProductPurchasePanel({
  product,
  benefits = defaultBenefits
}: ProductPurchasePanelProps) {
  const { addItem, isHydrated } = useCart();
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
  const discountPercent = selectedOption.compareAtKurus
    ? Math.round(
        ((selectedOption.compareAtKurus - selectedOption.priceKurus) /
          selectedOption.compareAtKurus) *
          100
      )
    : null;
  const purchaseTrustSignals = [
    { label: "Araç", detail: storeProfile.connectorHint },
    { label: "Saha", detail: storeProfile.installationMode },
    { label: "Ödeme", detail: "PayTR + garanti" }
  ];

  function handleAddToCart() {
    if (isOutOfStock) {
      return;
    }

    addItem({
      productId: product.id,
      cableOption: cableOptionRef.current,
      quantity,
      productSnapshot: product
    });
    setFeedback(`${quantity} adet ürün sepete eklendi.`);
  }

  function selectCableOption(nextCableOption: string) {
    cableOptionRef.current = nextCableOption;
    setCableOption(nextCableOption);
  }

  return (
    <div className="product-purchase-panel">
      <div className="product-mobile-summary-atc" aria-label="Mobil hızlı sepete ekle">
        <div>
          <span>Sepet toplamı</span>
          <strong>{formatPriceTRY(estimatedLineTotal)}</strong>
          <small>{purchaseMode === "survey" ? "Keşif ile ilerle" : "81 il kargo"}</small>
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

      <div className="product-purchase-panel__price mt-8 flex flex-wrap items-end gap-4">
        <p className="text-5xl font-black text-primary">
          {formatPriceTRY(selectedOption.priceKurus)}
        </p>
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

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {purchaseTrustSignals.map((signal) => (
          <div key={signal.label} className="rounded-2xl border border-outline-variant/35 bg-white px-4 py-3">
            <p className="text-[10px] font-semibold uppercase text-on-surface-variant">
              {signal.label}
            </p>
            <p className="mt-1 text-sm font-bold leading-5 text-on-surface">{signal.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 rounded-2xl bg-surface-container-low px-4 py-3 text-xs leading-5 text-on-surface-variant">
        Emin değilseniz ürünle birlikte keşif akışını seçin; pano, faz, kablo hattı ve koruma ekipmanı netleştirilir.
      </p>

      <div className="mt-8 rounded-[24px] bg-surface-container-low p-6">
        <p className="text-sm font-semibold uppercase text-on-surface-variant">
          Satın alma yolu
        </p>

        <div className="mt-5">
          <p className="text-sm font-medium text-on-surface-variant">Nasıl ilerlemek istersiniz?</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              {
                value: "product",
                label: "Ürünü satın al",
                detail: "Stoktan sevkiyat"
              },
              {
                value: "survey",
                label: "Keşifle ilerle",
                detail: storeProfile.installationMode
              }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={purchaseMode === option.value}
                onClick={() => setPurchaseMode(option.value as "product" | "survey")}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
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
            <p className="mt-3 rounded-2xl border border-primary/15 bg-white px-4 py-3 text-xs leading-5 text-on-surface-variant">
              Ürünü sepete ekleyip kurulum kapsamı için keşif talebi bırakabilirsiniz.
              Keşif sonrası kablo hattı, pano ve randevu bilgisi netleşir.
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
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
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

        <div className="mt-6">
          <p className="text-sm font-medium text-on-surface-variant">Miktar</p>
          <div className="product-purchase-panel__action-row mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3">
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
              className="product-purchase-panel__add-button flex-1 rounded-2xl bg-linear-to-r from-primary to-secondary px-6 py-4 text-center text-base font-semibold text-white shadow-[0_18px_50px_rgba(6,51,38,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isOutOfStock ? "Stokta Yok" : "Sepete Ekle"}
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

        <div className="mt-6 rounded-2xl border border-outline-variant/35 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-on-surface-variant">Tahmini ara toplam</span>
            <span className="text-lg font-bold text-on-surface">
              {formatPriceTRY(estimatedLineTotal)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm text-on-surface-variant">
            <span>Kargo</span>
            <span className="font-semibold text-secondary">81 il</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm text-on-surface-variant">
            <span>Kurulum akışı</span>
            <span className="font-semibold text-primary">
              {purchaseMode === "survey" ? "Keşif talebi önerilir" : "Ürün sevkiyatı"}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-on-surface-variant">
            Ürün kargosu Türkiye&apos;nin 81 iline yapılır. KDV ve varsa kurulum kalemi
            sepet/teklif akışında ayrı gösterilir.
          </p>
        </div>

        {purchaseMode === "survey" ? (
          <Link
            href={`/iletisim?reason=${encodeURIComponent(`${product.name} kurulum keşfi`)}`}
            className="mt-4 block rounded-2xl border border-primary/20 bg-white px-5 py-4 text-center text-sm font-semibold text-primary"
          >
            Kurulum keşfi iste
          </Link>
        ) : null}

        <div className="mt-6 space-y-3 text-sm text-on-surface-variant">
          {benefits.map((benefit) => (
            <p key={benefit}>{benefit}</p>
          ))}
        </div>
      </div>

      <div className="product-mobile-sticky-atc" aria-label="Mobil hızlı satın alma">
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
    </div>
  );
}
