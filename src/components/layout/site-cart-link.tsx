"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/components/providers/cart-provider";

export function SiteCartLink() {
  const { totalQuantity } = useCart();

  return (
    <Link
      href="/sepet"
      aria-label={`Sepetim${totalQuantity > 0 ? `, ${totalQuantity} ürün` : ""}`}
      className="relative inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-3 text-sm font-black text-on-surface transition hover:border-primary/30 hover:text-primary"
    >
      <ShoppingCart className="h-5 w-5" aria-hidden />
      <span className="hidden xl:inline">Sepet</span>
      {totalQuantity > 0 ? (
        <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-black text-white">
          {totalQuantity}
        </span>
      ) : null}
    </Link>
  );
}
