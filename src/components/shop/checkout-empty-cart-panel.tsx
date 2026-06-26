import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export function CheckoutLoadingPanel() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="premium-loading-shell">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="mt-5 h-9 w-full max-w-xl" />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.58fr]">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={5} />
        </div>
      </div>
    </div>
  );
}

export function CheckoutEmptyCartPanel() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="rounded-lg border border-white/80 bg-white/88 p-6 text-center shadow-[0_24px_80px_rgba(6,51,38,0.10)] backdrop-blur-xl sm:p-10 lg:p-14">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-white">
          <ShoppingBag className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-normal text-primary">
          Ödeme için ürün gerekli
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-normal text-on-surface sm:text-5xl">
          Sepetiniz boş olduğu için ödeme başlatılamıyor.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
          Önce mağazadan ürün ekleyin. Ardından bu sayfada iletişim ve teslimat bilgilerinizi
          tamamlayıp güvenli ödeme alanına geçebilirsiniz.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/magaza"
            className="rounded-lg bg-primary px-7 py-4 text-base font-bold text-white"
          >
            Mağazaya git
          </Link>
          <Link
            href="/sepet"
            className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-7 py-4 text-base font-bold text-on-surface"
          >
            Sepete dön
          </Link>
        </div>
      </section>
    </main>
  );
}
