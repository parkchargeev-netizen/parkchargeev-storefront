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

type ProductPurchasePanelProps = {
  product: ProductModel;
  benefits?: string[];
};

const defaultBenefits = [
  "Ücretsiz kargo ve hızlı gönderim",
  "2 yıl garanti ve kurulum desteği",
  "PayTR ile güvenli ödeme altyapısı"
];

export function ProductPurchasePanel({
  product,
  benefits = defaultBenefits
}: ProductPurchasePanelProps) {
  const { addItem, isHydrated } = useCart();
  const cableOptions = getProductCableOptions(product);
  const [cableOption, setCableOption] = useState(cableOptions[0]?.label ?? "");
  const cableOptionRef = useRef(cableOptions[0]?.label ?? "");
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedOption = getProductSelectedCableOption(product, cableOption);
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
    <>
      <div className="mt-8 flex flex-wrap items-end gap-4">
        <p className="text-5xl font-black tracking-[-0.08em] text-primary">
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

      <div className="mt-8 rounded-[24px] bg-surface-container-low p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-on-surface-variant">
        Sipariş detayları
      </p>

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
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
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
            className="flex-1 rounded-2xl bg-linear-to-r from-primary to-secondary px-6 py-4 text-center text-base font-semibold text-white shadow-[0_18px_50px_rgba(0,68,211,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
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
          <span className="font-semibold text-secondary">Ucretsiz</span>
        </div>
        <p className="mt-3 text-xs leading-5 text-on-surface-variant">
          KDV ve varsa kurulum kalemi sepet/teklif akışında ayrı gösterilir.
        </p>
      </div>

      <div className="mt-6 space-y-3 text-sm text-on-surface-variant">
        {benefits.map((benefit) => (
          <p key={benefit}>{benefit}</p>
        ))}
      </div>
      </div>
    </>
  );
}
