"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import { trackConversionEvent } from "@/lib/conversion-events";
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

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
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

  function addCurrentSelection() {
    if (isOutOfStock) {
      return;
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
      purchaseMode: "cart",
      cableOption: cableOptionRef.current
    });
    setFeedback(`${quantity} adet ürün sepete eklendi.`);
  }

  function selectCableOption(nextCableOption: string) {
    cableOptionRef.current = nextCableOption;
    setCableOption(nextCableOption);
  }

  function scrollToTechnicalSpecs() {
    document
      .getElementById("technical-specs")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="product-purchase-panel product-purchase-panel--focused">
      <div className="product-mobile-inline-atc" aria-label="Mobil hızlı sepete ekle">
        <div>
          <span>Sepet toplamı</span>
          <strong>{formatPriceTRY(estimatedLineTotal)}</strong>
        </div>
        <button
          type="button"
          onClick={addCurrentSelection}
          disabled={isAddDisabled}
          aria-busy={!isHydrated}
        >
          {isOutOfStock ? "Stokta Yok" : "Sepete Ekle"}
        </button>
      </div>

      <div className="product-purchase-panel__price mt-5 rounded-lg border border-primary/12 bg-white p-5 shadow-[0_18px_44px_rgba(6,51,38,0.08)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-on-surface-variant">
              ParkChargeEV fiyatı
            </p>
            <p className="mt-2 text-4xl font-bold text-primary md:text-5xl">
              {formatPriceTRY(selectedOption.priceKurus)}
            </p>
          </div>
          {selectedOption.compareAtKurus ? (
            <div className="pb-1 text-right">
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
      </div>

      <div className="product-purchase-panel__controls mt-5 rounded-lg bg-surface-container-low p-5">
        {cableOptions.length > 1 ? (
          <div>
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
          ) : null}

        <div className={cableOptions.length > 1 ? "mt-5" : ""}>
          <p className="text-sm font-medium text-on-surface-variant">Adet</p>
          <div className="product-purchase-panel__action-row mt-3 flex flex-col gap-3">
            <div className="flex items-center gap-4 rounded-lg bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="text-xl text-on-surface-variant transition hover:text-primary"
                aria-label="Adeti azalt"
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
                aria-label="Adeti artır"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={addCurrentSelection}
              disabled={isAddDisabled}
              aria-busy={!isHydrated}
              className="product-purchase-panel__add-button inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-primary to-secondary px-6 py-4 text-center text-base font-semibold text-white shadow-[0_18px_50px_rgba(6,51,38,0.22)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
              {isOutOfStock ? "Stokta Yok" : "Sepete Ekle"}
            </button>
            <button
              type="button"
              onClick={scrollToTechnicalSpecs}
              className="product-purchase-panel__spec-button inline-flex w-full items-center justify-center rounded-lg border border-primary/20 bg-white px-6 py-3.5 text-sm font-bold text-primary transition hover:border-primary/40 hover:bg-primary/5"
            >
              Teknik Özellikleri İncele
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

        <div className="product-purchase-panel__subtotal mt-5 rounded-lg border border-outline-variant/35 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-on-surface-variant">Tahmini ara toplam</span>
            <span className="text-lg font-bold text-on-surface">
              {formatPriceTRY(estimatedLineTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
