import Link from "next/link";

export function CheckoutLoadingPanel() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="surface-card p-8">
        <p className="text-lg text-on-surface-variant">Ödeme adımı hazırlanıyor...</p>
      </div>
    </div>
  );
}

export function CheckoutEmptyCartPanel() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="surface-card p-10 text-center lg:p-14">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
          Ödeme için ürün gerekli
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
          Sepetiniz boş olduğu için ödeme başlatılamıyor
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-on-surface-variant">
          Önce mağazadan ürün ekleyin, ardından bu sayfada müşteri bilgilerinizi tamamlayıp
          PayTR iframe akışını başlatın.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/magaza"
            className="rounded-2xl bg-primary px-7 py-4 text-base font-semibold text-white"
          >
            Mağazaya git
          </Link>
          <Link
            href="/sepet"
            className="rounded-2xl border border-outline-variant/40 bg-surface-container-low px-7 py-4 text-base font-semibold text-on-surface"
          >
            Sepete dön
          </Link>
        </div>
      </div>
    </div>
  );
}
