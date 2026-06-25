import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { getAuthenticatedAdmin } from "@/server/auth/guards";

export default async function AdminLoginPage() {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (authenticatedAdmin) {
    redirect("/admin");
  }

  return (
    <main
      className="admin-experience admin-login-experience min-h-screen px-4 py-10"
      data-motion-scope
    >
      <div className="admin-ambient-layer" data-motion-loop="ambient" aria-hidden>
        <span className="admin-ambient-layer__line admin-ambient-layer__line--one" />
        <span className="admin-ambient-layer__line admin-ambient-layer__line--two" />
        <span className="admin-ambient-layer__line admin-ambient-layer__line--three" />
      </div>
      <div className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <PageHeader
            eyebrow="ParkChargeEV Admin"
            title="E-ticaret, teklif ve sipariş operasyonlarını tek panelden yönetin."
            body="Ürün yönetimi, sipariş durumları, teklif akışı ve temel KPI göstergeleri aynı çalışma alanında birleşir."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Rol bazlı JWT koruması",
              "PayTR ödeme durum takibi",
              "Audit log hazır veri modeli"
            ].map((item) => (
              <Surface key={item} density="compact" motion="scale">
                <p className="text-sm font-medium text-slate-700">{item}</p>
              </Surface>
            ))}
          </div>
        </section>

        <Surface as="section" className="border-white/70 bg-white/90 p-8" motion="slide">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-950">Yönetici Girişi</h2>
          </div>
          <LoginForm />
        </Surface>
      </div>
    </main>
  );
}
