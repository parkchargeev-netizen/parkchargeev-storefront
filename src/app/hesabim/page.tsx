import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hesabım",
  description: "Profil, adres ve güvenlik ayarları."
};

export default function AccountPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[280px_1fr_360px] lg:px-8">
      <aside className="surface-card p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Kullanıcı paneli
        </p>
        <div className="mt-6 space-y-2">
          {["Panel", "Şarjlarım", "Ödemeler", "Cihazlarım", "Ayarlar"].map(
            (item, index) => (
              <div
                key={item}
                className={`rounded-2xl px-4 py-4 text-sm font-medium ${
                  index === 4
                    ? "bg-surface-container-low text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                {item}
              </div>
            )
          )}
        </div>
      </aside>

      <section className="space-y-6">
        <header>
          <h1 className="text-5xl font-black tracking-[-0.08em] text-on-surface">
            Profilim
          </h1>
          <p className="mt-4 text-lg leading-8 text-on-surface-variant">
            Bu alan gerçek hesap paneli yayınlanana kadar read-only preview olarak gösterilir.
          </p>
        </header>

        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Kişisel Bilgiler
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Ad", "Ahmet"],
              ["Soyad", "Yılmaz"],
              ["E-posta Adresi", "ahmet.yilmaz@example.com"],
              ["Telefon Numarası", "+90 532 123 45 67"]
            ].map(([label, value]) => (
              <label key={label} className="grid gap-2">
                <span className="text-sm text-on-surface-variant">{label}</span>
                <input
                  defaultValue={value}
                  disabled
                  className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 opacity-70"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled
            className="mt-6 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white opacity-60"
          >
            Düzenleme yakında aktif
          </button>
        </div>

        <div className="surface-card p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
              Adres Yönetimi
            </h2>
            <button
              type="button"
              disabled
              className="rounded-2xl bg-surface-container-high px-4 py-3 text-sm font-semibold text-primary opacity-60"
            >
              Yeni Ekle yakında
            </button>
          </div>
          <div className="mt-6 grid gap-4">
            {[
              "Ev Adresi · Kadıköy / İstanbul",
              "İş Yeri · Beşiktaş / İstanbul"
            ].map((address) => (
              <div
                key={address}
                className="rounded-[24px] bg-surface-container-low px-5 py-5 text-on-surface"
              >
                {address}
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="surface-card p-8 text-center">
          <div className="mx-auto h-28 w-28 rounded-full bg-linear-to-br from-primary to-secondary" />
          <h2 className="mt-5 text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Ahmet Yılmaz
          </h2>
          <p className="mt-2 text-on-surface-variant">Preview Üye</p>
          <div className="mt-6 rounded-full bg-secondary-container px-4 py-3 text-sm font-semibold text-secondary">
            Hesap paneli entegrasyonu geliştirme aşamasında
          </div>
        </div>

        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Güvenlik
          </h2>
          <div className="mt-6 grid gap-4">
            {["Mevcut Şifre", "Yeni Şifre", "Yeni Şifre (Tekrar)"].map((item) => (
              <label key={item} className="grid gap-2">
                <span className="text-sm text-on-surface-variant">{item}</span>
                <input
                  type="password"
                  defaultValue="********"
                  disabled
                  className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 opacity-70"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled
            className="mt-6 rounded-2xl bg-surface-container-high px-6 py-4 text-base font-semibold text-primary opacity-60"
          >
            Şifre güncelleme yakında
          </button>
        </div>
      </aside>
    </div>
  );
}
