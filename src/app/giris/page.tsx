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
          Tekrar hoş geldiniz
        </h1>
        <p className="mt-4 text-center text-base text-on-surface-variant">
          Siparişlerinizi, servis taleplerinizi ve cihaz profilinizi buradan
          yönetin.
        </p>

        <form className="mt-10 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
              E-posta adresi
            </span>
            <input
              type="email"
              placeholder="ornek@sirket.com"
              className="rounded-2xl border border-outline-variant/45 bg-surface-container-low px-4 py-4 outline-none ring-0 transition focus:border-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
              Şifre
            </span>
            <input
              type="password"
              placeholder="********"
              className="rounded-2xl border border-outline-variant/45 bg-surface-container-low px-4 py-4 outline-none ring-0 transition focus:border-primary"
            />
          </label>

          <div className="flex items-center justify-between gap-4 text-sm text-on-surface-variant">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-outline-variant" />
              Beni hatırla
            </label>
            <button type="button" className="font-semibold text-primary">
              Şifremi unuttum
            </button>
          </div>

          <button
            type="submit"
            className="mt-3 rounded-2xl bg-linear-to-r from-primary to-secondary px-6 py-4 text-base font-semibold text-white shadow-[0_20px_50px_rgba(0,68,211,0.22)]"
          >
            Giriş Yap
          </button>
        </form>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button className="rounded-2xl border border-outline-variant/45 bg-white px-5 py-4 text-sm font-medium text-on-surface">
            Kurumsal SSO ile giriş
          </button>
          <button className="rounded-2xl border border-outline-variant/45 bg-white px-5 py-4 text-sm font-medium text-on-surface">
            Google ile giriş
          </button>
        </div>
      </div>
    </div>
  );
}

