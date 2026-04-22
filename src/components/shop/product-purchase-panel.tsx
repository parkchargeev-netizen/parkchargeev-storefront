"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import type { ProductModel } from "@/lib/mock-data";

type ProductPurchasePanelProps = {
  product: ProductModel;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  const [cableOption, setCableOption] = useState(product.cableOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isOutOfStock = product.stockLabel === "Stokta Yok";

  function handleAddToCart() {
    if (isOutOfStock) {
      return;
    }

    addItem({
      productId: product.id,
      cableOption,
      quantity
    });
    setFeedback(`${quantity} adet ürün sepete eklendi.`);
  }

  return (
    <div className="mt-8 rounded-[24px] bg-surface-container-low p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-on-surface-variant">
        Sipariş detayları
      </p>

      <div className="mt-5">
        <p className="text-sm font-medium text-on-surface-variant">Kablo uzunluğu</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {product.cableOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCableOption(option)}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                option === cableOption
                  ? "border-primary bg-white text-primary"
                  : "border-outline-variant/40 bg-surface text-on-surface hover:border-primary/20"
              }`}
            >
              {option}
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
            disabled={isOutOfStock}
            className="flex-1 rounded-2xl bg-linear-to-r from-primary to-secondary px-6 py-4 text-center text-base font-semibold text-white shadow-[0_18px_50px_rgba(0,68,211,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isOutOfStock ? "Stokta Yok" : "Sepete Ekle"}
          </button>
        </div>
        {feedback ? (
          <p className="mt-4 text-sm font-medium text-secondary">
            {feedback}{" "}
            <Link href="/sepet" className="text-primary underline underline-offset-4">
              Sepete git
            </Link>
          </p>
        ) : null}
      </div>

      <div className="mt-6 space-y-3 text-sm text-on-surface-variant">
        <p>Ücretsiz kargo ve hızlı gönderim</p>
        <p>2 yıl garanti ve kurulum desteği</p>
        <p>PayTR ile güvenli ödeme altyapısı</p>
      </div>
    </div>
  );
}
