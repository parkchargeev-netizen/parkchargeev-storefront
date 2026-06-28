import { Activity, Clock, PlayCircle, ShieldCheck } from "lucide-react";

import {
  AutomationForm,
  AutomationRunButton
} from "@/components/admin/admin-intelligence-actions";
import { PageHeader } from "@/components/ui/page-header";
import { listAdminAutomations } from "@/server/admin/ai-operations";

const automationStats = [
  { label: "Toplam otomasyon", key: "total", icon: Activity },
  { label: "Aktif otomasyon", key: "active", icon: ShieldCheck },
  { label: "Son çalıştırma", key: "runs", icon: PlayCircle },
  { label: "Hatalı run", key: "failed", icon: Clock }
] as const;

function formatDate(value: Date | string | null) {
  if (!value) {
    return "Henüz çalışmadı";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function AdminAutomationsPage() {
  const result = await listAdminAutomations({ limit: 50 });
  const activeCount = result.items.filter((item) => item.status === "active").length;
  const failedRuns = result.runs.filter((run) => run.status === "failed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Otomasyon Merkezi"
        title="Kritik operasyon sinyallerini zamanlı ve manuel aksiyonlara bağlayın."
        body="Kritik stok, ödeme hatası, geciken sipariş, eksik ürün içeriği ve günlük rapor süreçleri tek panelden yönetilir."
      />

      <section className="grid gap-4 lg:grid-cols-4">
        {automationStats.map(({ label, key, icon: Icon }) => {
          const value =
            key === "total"
              ? result.items.length
              : key === "active"
                ? activeCount
                : key === "runs"
                  ? result.runs.length
                  : failedRuns;

          return (
          <article key={key} className="surface-card border border-white/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-800">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
          </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="surface-card border border-white/70 p-5 lg:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-emerald-700">Canlı otomasyonlar</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">Zamanlı ve manuel akışlar</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Vercel Cron saatte bir endpoint’i çağırır. Manuel çalıştırma audit log ve run geçmişi üretir.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {result.items.length > 0 ? (
              result.items.map((automation) => (
                <article
                  key={automation.id}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">{automation.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{automation.description}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                      {automation.status === "active" ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <dt className="text-xs font-bold uppercase text-slate-400">Zamanlama</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{automation.schedule}</dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <dt className="text-xs font-bold uppercase text-slate-400">Son durum</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{automation.lastStatus || "Yok"}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Son çalışma: {formatDate(automation.lastRunAt)}
                  </p>
                  {automation.lastMessage ? (
                    <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                      {automation.lastMessage}
                    </p>
                  ) : null}
                  <div className="mt-5">
                    <AutomationRunButton automationId={automation.id} />
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-600 md:col-span-2">
                Henüz otomasyon yok. Varsayılan otomasyonlar migration sonrası otomatik oluşur.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="surface-card border border-white/70 p-5">
            <p className="text-sm font-bold uppercase text-emerald-700">Yeni otomasyon</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Kontrollü akış ekle</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Özel otomasyonlar da aynı run log, audit log ve bildirim altyapısını kullanır.
            </p>
            <div className="mt-5">
              <AutomationForm />
            </div>
          </section>

          <section className="surface-card border border-white/70 p-5">
            <p className="text-sm font-bold uppercase text-emerald-700">Run geçmişi</p>
            <div className="mt-4 space-y-3">
              {result.runs.length > 0 ? (
                result.runs.map((run) => (
                  <article key={run.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-950">{run.automationKey}</h3>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(run.createdAt)}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                        {run.status}
                      </span>
                    </div>
                    {run.summary ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">{run.summary}</p>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Henüz otomasyon çalıştırma kaydı yok.
                </div>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
