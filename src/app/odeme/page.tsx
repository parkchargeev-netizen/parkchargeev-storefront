import type { Metadata } from "next";

import { formatPriceTRY } from "@/lib/format";

export const metadata: Metadata = {
  title: "Ödeme",
  description: "PayTR ile güvenli ödeme adımı."
};

export default function CheckoutPage() {
  const subtotal = 1700000;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px] lg:px-8">
      <section className="space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-secondary">
            256-bit güvenli ödeme
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
            Ödeme işlemi
          </h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            Siparişinizin son adımı. PayTR iFrame akışı bu sayfaya bağlanacak
            şekilde hazırlandı.
          </p>
        </header>

        <div className="surface-card p-8">
          <div className="grid gap-4 md:grid-cols-3">
            {["Adres", "Kargo", "Ödeme"].map((step, index) => (
              <div
                key={step}
                className={`rounded-[24px] border px-5 py-5 ${
                  index < 2
                    ? "border-primary bg-surface-container-low"
                    : "border-outline-variant/40 bg-white"
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                  Adım {index + 1}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.05em] text-on-surface">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-5">
            <div className="rounded-[24px] bg-surface-container-low p-5">
              <p className="text-lg font-bold text-on-surface">Teslimat Adresi</p>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Ahmet Yılmaz · Barbaros Bulvarı No:145 D:12 Beşiktaş / İstanbul
              </p>
            </div>
            <div className="rounded-[24px] bg-surface-container-low p-5">
              <p className="text-lg font-bold text-on-surface">Kargo Yöntemi</p>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Yurtiçi Kargo · Standart Teslimat (1-3 iş günü)
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            PayTR iFrame alanı
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-on-surface-variant">
            Frontend bu aşamada kendi kart formunu barındırmayacak. Sunucu
            tarafında `api/paytr/token` çağrısı ile `iframe_token` üretilecek ve
            PayTR formu güvenli şekilde burada gösterilecek.
          </p>
          <div className="mt-8 rounded-[28px] border border-dashed border-primary/35 bg-linear-to-br from-primary/6 via-white to-secondary/8 p-10 text-center">
            <p className="text-lg font-semibold text-on-surface">
              PayTR ödeme kutusu bu alana yerleşecek
            </p>
            <p className="mt-3 text-sm text-on-surface-variant">
              Callback URL siparişin gerçek doğrulama noktası olacak
            </p>
          </div>
        </div>
      </section>

      <aside className="surface-card h-fit p-8">
        <h2 className="text-4xl font-black tracking-[-0.07em] text-on-surface">
          Sipariş Özeti
        </h2>
        <div className="mt-6 space-y-4 text-base">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span>Ara Toplam</span>
            <span>{formatPriceTRY(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant">
            <span>Kargo Tutarı</span>
            <span>₺0</span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant">
            <span>Kargo İndirimi</span>
            <span className="font-semibold text-secondary">-₺0</span>
          </div>
        </div>
        <div className="mt-6 border-t border-outline-variant/35 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-on-surface">Ödenecek Tutar</span>
            <span className="text-4xl font-black tracking-[-0.06em] text-primary">
              {formatPriceTRY(subtotal)}
            </span>
          </div>
        </div>
        <button className="mt-8 w-full rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white">
          Siparişi Onayla ve Öde
        </button>
      </aside>
    </div>
  );
}

