import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";
import { leadStatusOptions } from "@/server/admin/constants";
import { listAdminServiceLeads } from "@/server/admin/repository";

type AdminServiceLeadsPageProps = {
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
  return `/api/admin/service-leads?${params.toString()}`;
}

function getLeadTone(status: string) {
  if (status === "won") {
    return "success" as const;
  }

  if (status === "lost") {
    return "danger" as const;
  }

  if (status === "contacted" || status === "qualified") {
    return "warning" as const;
  }

  return "info" as const;
}

function formatLeadStatus(status: string) {
  return leadStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export default async function AdminServiceLeadsPage({ searchParams }: AdminServiceLeadsPageProps) {
  const query = (await searchParams) ?? {};
  const result = await listAdminServiceLeads({ ...query, limit: 12 });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Saha Talepleri"
        title="Servis, keşif ve kurulum operasyonları"
        description="Saha talebi kayıtlarını listeleyin, durumları takip edin ve talebi saha ekibine atayın."
        action={
          <a href={buildExportHref(query)} className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white">
            CSV indir
          </a>
        }
        meta={
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {result.items.length} talep
          </span>
        }
      />

      <AdminFilterBar>
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_170px_170px_auto]">
          <input name="q" defaultValue={query.q ?? ""} placeholder="Ad, telefon veya talep tipi ara" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <select name="status" defaultValue={query.status ?? ""} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm">
            <option value="">Tüm durumlar</option>
            {leadStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input name="from" type="date" defaultValue={query.from ?? ""} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <input name="to" type="date" defaultValue={query.to ?? ""} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Filtrele</button>
        </form>
      </AdminFilterBar>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-3 py-3">Talep</th>
                <th className="px-3 py-3">İletişim</th>
                <th className="px-3 py-3">Lokasyon</th>
                <th className="px-3 py-3">Durum</th>
                <th className="px-3 py-3">Tarih</th>
                <th className="px-3 py-3">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.items.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-3 py-4">
                    <Link href={`/admin/saha/${lead.id}`} className="font-semibold text-slate-950 transition hover:text-[#063326]">
                      {lead.fullName}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{lead.leadType} / {lead.projectType ?? "-"}</p>
                  </td>
                  <td className="px-3 py-4 text-slate-600">
                    <p>{lead.phone}</p>
                    <p className="text-xs">{lead.email ?? "-"}</p>
                  </td>
                  <td className="px-3 py-4 text-slate-600">{[lead.city, lead.district].filter(Boolean).join(" / ") || "-"}</td>
                  <td className="px-3 py-4">
                    <AdminStatusBadge label={formatLeadStatus(lead.status)} tone={getLeadTone(lead.status)} />
                  </td>
                  <td className="px-3 py-4 text-slate-600">{new Date(lead.createdAt).toLocaleDateString("tr-TR")}</td>
                  <td className="px-3 py-4">
                    <Link href={`/admin/saha/${lead.id}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#063326]">
                      Detay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5">
          {result.nextCursor ? (
            <Link href={`/admin/saha?cursor=${encodeURIComponent(result.nextCursor)}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Sonraki sayfa
            </Link>
          ) : (
            <span className="text-sm font-medium text-slate-500">Tüm kayıtlar yüklendi.</span>
          )}
        </div>
      </section>
    </div>
  );
}
