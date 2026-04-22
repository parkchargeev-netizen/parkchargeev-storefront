import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Siparişlerinizi, cihazlarınızı ve servis taleplerinizi yönetin."
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-6 py-12">
      <div className="surface-card w-full max-w-xl p-8 lg:p-10">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.34em] text-primary">
          ParkChargeEV
        </p>
        <h1 className="mt-5 text-center text-5xl font-black tracking-[-0.08em] text-on-surface">
          Müşteri girişi hazırlanıyor
        </h1>
        <p className="mt-4 text-center text-base text-on-surface-variant">
          Sipariş, servis ve cihaz paneli için kimlik doğrulama entegrasyonu henüz yayında
          değil. Bu ekranı sahte submit yerine dürüst preview durumunda gösteriyoruz.
        </p>

        <div className="mt-8 rounded-[24px] bg-surface-container-low p-5 text-sm leading-7 text-on-surface-variant">
          Şimdilik teklif, keşif ve ödeme akışları mağaza, iletişim ve checkout ekranları
          üzerinden çalışır. Giriş özelliği eklendiğinde bu alan gerçek auth formuna dönecek.
        </div>

        <div className="mt-10 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
              E-posta adresi
            </span>
            <input
              type="email"
              placeholder="ornek@sirket.com"
              disabled
              className="rounded-2xl border border-outline-variant/45 bg-surface-container-low px-4 py-4 outline-none opacity-70"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
              Şifre
            </span>
            <input
              type="password"
              placeholder="********"
              disabled
              className="rounded-2xl border border-outline-variant/45 bg-surface-container-low px-4 py-4 outline-none opacity-70"
            />
          </label>

          <div className="flex items-center justify-between gap-4 text-sm text-on-surface-variant">
            <label className="flex items-center gap-3 opacity-70">
              <input type="checkbox" disabled className="rounded border-outline-variant" />
              Beni hatırla
            </label>
            <span className="font-semibold text-primary/70">Şifre sıfırlama yakında</span>
          </div>

          <button
            type="button"
            disabled
            className="mt-3 rounded-2xl bg-linear-to-r from-primary to-secondary px-6 py-4 text-base font-semibold text-white opacity-60"
          >
            Yakında Aktif
          </button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled
            className="rounded-2xl border border-outline-variant/45 bg-white px-5 py-4 text-sm font-medium text-on-surface opacity-60"
          >
            Kurumsal SSO yakında
          </button>
          <button
            type="button"
            disabled
            className="rounded-2xl border border-outline-variant/45 bg-white px-5 py-4 text-sm font-medium text-on-surface opacity-60"
          >
            Google ile giriş yakında
          </button>
        </div>
      </div>
    </div>
  );
}
