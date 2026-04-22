"use client";

import Link from "next/link";

import { useCart } from "@/components/providers/cart-provider";

export function SiteHeaderActions() {
  const { totalQuantity } = useCart();

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/arama"
        className="rounded-xl border border-outline-variant/40 bg-white px-4 py-2 text-sm font-medium text-on-surface transition hover:border-primary/30 hover:text-primary"
      >
        Ara
      </Link>
      <Link
        href="/sepet"
        className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-2 text-sm font-medium text-on-surface transition hover:border-primary/30 hover:text-primary"
      >
        Sepetim{totalQuantity > 0 ? ` (${totalQuantity})` : ""}
      </Link>
      <Link
        href="/iletisim"
        className="rounded-xl border border-primary/15 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/30"
      >
        Teklif Al
      </Link>
      <Link
        href="/giris"
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(0,68,211,0.22)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_36px_rgba(0,68,211,0.28)]"
      >
        Giriş Yap
      </Link>
    </div>
  );
}
