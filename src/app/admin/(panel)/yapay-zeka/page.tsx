import { Brain, FileText, Sparkles, TrendingUp } from "lucide-react";

import { AiGenerateButton } from "@/components/admin/admin-intelligence-actions";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminAiModules, listAdminAiInsights, listAdminAiRuns } from "@/server/admin/ai-operations";

const aiStats = [
  { label: "Aktif modül", key: "modules", icon: Brain },
  { label: "Açık öneri", key: "openInsights", icon: Sparkles },
  { label: "Son üretim", key: "runs", icon: FileText },
  { label: "Güvenli mod", key: "mode", icon: TrendingUp }
] as const;

export default async function AdminAiCenterPage() {
  const [insightsResult, runs] = await Promise.all([
    listAdminAiInsights({ limit: 12 }),
    listAdminAiRuns({ limit: 8 })
  ]);
  const modules = getAdminAiModules();
  const openAiEnabled = Boolean(process.env.OPENAI_API_KEY?.trim());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Yapay Zeka Merkezi"
        title="Operasyon, ürün, SEO ve risk kararları için AI destekli yönetim."
        body="AI önerileri admin onayı olmadan veriyi değiştirmez. OpenAI anahtarı yoksa sistem güvenli kural tabanlı öneri üretir."
        actions={
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
            {openAiEnabled ? "OpenAI bağlantısı aktif" : "OpenAI anahtarı yok, güvenli öneri modu aktif"}
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-4">
        {aiStats.map(({ label, key, icon: Icon }) => {
          const value =
            key === "modules"
              ? modules.length
              : key === "openInsights"
                ? insightsResult.items.filter((item) => item.status === "open").length
                : key === "runs"
                  ? runs.length
                  : openAiEnabled
                    ? "OpenAI"
                    : "Heuristik";

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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <div className="surface-card border border-white/70 p-5 lg:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-emerald-700">AI modülleri</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">Üretilebilir öneriler</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Her modül gerçek dashboard, risk ve operasyon verisini kullanır. Veri yoksa boş durum veya güvenli öneri döner.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {modules.map((module) => (
              <article
                key={module.key}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{module.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                    AI
                  </span>
                </div>
                <div className="mt-5">
                  <AiGenerateButton moduleKey={module.key} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="surface-card border border-white/70 p-5">
            <p className="text-sm font-bold uppercase text-emerald-700">Son öneriler</p>
            <div className="mt-4 space-y-3">
              {insightsResult.items.length > 0 ? (
                insightsResult.items.map((insight) => (
                  <article key={insight.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-bold text-slate-950">{insight.title}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                        {insight.confidence}%
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">{insight.summary}</p>
                    {insight.actionHref ? (
                      <a
                        href={insight.actionHref}
                        className="mt-3 inline-flex text-sm font-bold text-emerald-800 hover:text-emerald-950"
                      >
                        {insight.actionLabel || "Aksiyona git"}
                      </a>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Henüz AI önerisi yok. Bir modül seçip öneri üretin.
                </div>
              )}
            </div>
          </section>

          <section className="surface-card border border-white/70 p-5">
            <p className="text-sm font-bold uppercase text-emerald-700">Üretim geçmişi</p>
            <div className="mt-4 space-y-3">
              {runs.length > 0 ? (
                runs.map((run) => (
                  <div key={run.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-950">{run.moduleKey}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                        {run.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {run.provider} {run.model ? `· ${run.model}` : ""} · {run.durationMs}ms
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Üretim geçmişi boş.
                </div>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
