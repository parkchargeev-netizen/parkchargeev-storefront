import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export function CheckoutLoadingPanel() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="rounded-[28px] border border-white/80 bg-white/88 p-6 shadow-[0_18px_60px_rgba(6,51,38,0.08)] backdrop-blur-xl">
        <p className="text-base font-semibold text-on-surface-variant">
          Ödeme adımı hazırlanıyor...
        </p>
      </div>
    </div>
  );
}

export function CheckoutEmptyCartPanel() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="rounded-[32px] border border-white/80 bg-white/88 p-6 text-center shadow-[0_24px_80px_rgba(6,51,38,0.10)] backdrop-blur-xl sm:p-10 lg:p-14">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary text-white">
          <ShoppingBag className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.32em] text-primary">
          Ödeme için ürün gerekli
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-[-0.05em] text-on-surface sm:text-5xl">
          Sepetiniz boş olduğu için ödeme başlatılamıyor.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
          Önce mağazadan ürün ekleyin. Ardından bu sayfada iletişim ve teslimat bilgilerinizi
          tamamlayıp PayTR güvenli ödeme ekranına geçebilirsiniz.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/magaza"
            className="rounded-2xl bg-primary px-7 py-4 text-base font-black text-white"
          >
            Mağazaya git
          </Link>
          <Link
            href="/sepet"
            className="rounded-2xl border border-outline-variant/40 bg-surface-container-low px-7 py-4 text-base font-black text-on-surface"
          >
            Sepete dön
          </Link>
        </div>
      </section>
    </main>
  );
}
