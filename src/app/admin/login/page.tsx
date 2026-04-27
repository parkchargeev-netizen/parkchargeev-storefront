import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getAuthenticatedAdmin } from "@/server/auth/guards";

export default async function AdminLoginPage() {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (authenticatedAdmin) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,68,211,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(0,162,91,0.12),transparent_28%),#f8fafc] px-4 py-10">
      <div className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
            ParkChargeEV Admin
          </p>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
            E-ticaret, teklif ve siparis operasyonlarini tek panelden yonetin.
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Faz 1 kapsaminda urun CRUD, siparis durum yonetimi, teklif pipeline takibi ve temel KPI dashboard bu panelde bir araya getirildi.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Rol bazli JWT korumasi",
              "PayTR odeme durum takibi",
              "Audit log hazir veri modeli"
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <p className="text-sm font-medium text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card border border-white/70 bg-white/90 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-950">Yonetici Girisi</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ilk kurulumda `.env` veya `.env.local` icindeki bootstrap admin bilgileri ile giris yapabilirsiniz.
            </p>
          </div>
          <LoginForm />
        </section>
      </div>
    </div>
  );
}
