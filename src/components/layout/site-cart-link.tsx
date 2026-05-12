"use client";

import Link from "next/link";

import { useCart } from "@/components/providers/cart-provider";

export function SiteCartLink() {
  const { totalQuantity } = useCart();

  return (
    <Link
      href="/sepet"
      className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-2 text-sm font-medium text-on-surface transition hover:border-primary/30 hover:text-primary"
    >
      Sepetim{totalQuantity > 0 ? ` (${totalQuantity})` : ""}
    </Link>
  );
}
