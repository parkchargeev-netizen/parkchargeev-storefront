import type { Metadata } from "next";
import Link from "next/link";

import { formatPriceTRY } from "@/lib/format";
import { products } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Sepetim",
  description: "Alışveriş sepetiniz ve sipariş özetiniz."
};

const cartItems = [
  { product: products[0], quantity: 1 },
  { product: products[3], quantity: 2 }
];

const subtotal = cartItems.reduce(
  (total, item) => total + item.product.priceKurus * item.quantity,
  0
);
const tax = Math.round(subtotal * 0.2);
const total = subtotal + tax;

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <h1 className="text-6xl font-black tracking-[-0.09em] text-on-surface">
        Alışveriş Sepeti
      </h1>
      <p className="mt-4 text-lg text-on-surface-variant">
        Sürdürülebilir enerji yolculuğunuz için seçtiğiniz ürünler.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          {cartItems.map((item) => (
            <article key={item.product.id} className="surface-card flex gap-5 p-5">
              <div className="h-28 w-28 rounded-[22px] bg-linear-to-br from-surface-container to-surface-container-high" />
              <div className="flex flex-1 flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
                    {item.product.name}
                  </h2>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {item.product.powerLabel} · {item.product.summary}
                  </p>
                  <div className="mt-4 flex items-center gap-4 rounded-full bg-surface-container-low px-4 py-3 text-on-surface">
                    <span>−</span>
                    <span className="text-lg font-semibold">{item.quantity}</span>
                    <span>+</span>
                  </div>
                </div>
                <p className="text-3xl font-black tracking-[-0.05em] text-on-surface">
                  {formatPriceTRY(item.product.priceKurus * item.quantity)}
                </p>
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
              <span>{formatPriceTRY(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>Kargo</span>
              <span className="font-semibold text-secondary">Ücretsiz</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>KDV (%20)</span>
              <span>{formatPriceTRY(tax)}</span>
            </div>
          </div>
          <div className="mt-6 border-t border-outline-variant/35 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-on-surface">Genel Toplam</span>
              <span className="text-4xl font-black tracking-[-0.06em] text-primary">
                {formatPriceTRY(total)}
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
    </div>
  );
}

