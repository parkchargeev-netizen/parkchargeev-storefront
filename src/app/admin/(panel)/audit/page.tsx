import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { listAdminAuditLogs } from "@/server/admin/repository";

type AdminAuditPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    cursor?: string;
    from?: string;
    to?: string;
  }>;
};

function buildExportHref(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value);
    }
  }

  params.set("format", "csv");
  params.set("limit", "50");
  return `/api/admin/audit?${params.toString()}`;
}

export default async function AdminAuditPage({ searchParams }: AdminAuditPageProps) {
  const query = (await searchParams) ?? {};
  const result = await listAdminAuditLogs({ ...query, limit: 12 });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Audit Log"
        title="Admin islem kayitlari"
        description="Mutasyonlarin aktor, varlik, aksiyon, IP ve payload detaylarini takip edin."
        action={
          <a href={buildExportHref(query)} className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white">
            CSV indir
          </a>
        }
        meta={
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {result.items.length} log
          </span>
        }
      />

      <AdminFilterBar>
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_170px_170px_auto]">
          <input name="q" defaultValue={query.q ?? ""} placeholder="Varlik, aksiyon veya ozet ara" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <input name="status" defaultValue={query.status ?? ""} placeholder="Entity type" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <input name="from" type="date" defaultValue={query.from ?? ""} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <input name="to" type="date" defaultValue={query.to ?? ""} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Filtrele</button>
        </form>
      </AdminFilterBar>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="space-y-4">
          {result.items.map((log) => (
            <article key={log.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {log.entityType} / {log.action}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{log.summary ?? "Ozet yok"}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {log.actorEmail ?? "Sistem"} / {log.ipAddress ?? "-"} / {new Date(log.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {log.entityId}
                </span>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">Payload detaylari</summary>
                <pre className="mt-3 max-h-96 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
                  {JSON.stringify(
                    { before: log.beforePayload, after: log.afterPayload, userAgent: log.userAgent },
                    null,
                    2
                  )}
                </pre>
              </details>
            </article>
          ))}
          {result.items.length === 0 ? (
            <p className="text-sm text-slate-500">Audit log bulunamadi.</p>
          ) : null}
        </div>
        <div className="mt-5">
          {result.nextCursor ? (
            <Link href={`/admin/audit?cursor=${encodeURIComponent(result.nextCursor)}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Sonraki sayfa
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
