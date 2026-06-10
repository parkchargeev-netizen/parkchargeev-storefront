import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { QuotesTable } from "@/components/admin/table/quotes-table";
import { quoteStatusOptions } from "@/server/admin/constants";
import { listAdminQuotes } from "@/server/admin/repository";

type QuotesPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    cursor?: string;
    from?: string;
    to?: string;
  }>;
};

function buildHref(basePath: string, query: Record<string, string | undefined>, extra: Record<string, string>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value && key !== "cursor") {
      params.set(key, value);
    }
  }

  for (const [key, value] of Object.entries(extra)) {
    params.set(key, value);
  }

  return `${basePath}?${params.toString()}`;
}

export default async function AdminQuotesPage({ searchParams }: QuotesPageProps) {
  const query = (await searchParams) ?? {};
  const result = await listAdminQuotes({
    q: query.q,
    status: query.status,
    cursor: query.cursor,
    from: query.from,
    to: query.to,
    limit: 12
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Teklifler"
        title="B2B satış akışı ve geri dönüş kontrolü"
        description="Teklif listesi yeniden kullanılabilir tablo temelinde sade, hızlı ve filtrelenebilir bir takip ekranına dönüştü."
        action={
          <a
            href={buildHref("/api/admin/quotes", query, { format: "csv", limit: "50" })}
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            CSV indir
          </a>
        }
        meta={
          <>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {result.items.length} teklif
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Akış hazırlığı
            </span>
          </>
        }
      />

      <AdminFilterBar>
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_170px_170px_auto]">
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Kişi, firma veya telefon ara"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
          />
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tüm durumlar</option>
            {quoteStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            name="from"
            type="date"
            defaultValue={query.from ?? ""}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
          />
          <input
            name="to"
            type="date"
            defaultValue={query.to ?? ""}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
          />
          <button className="rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
            Filtrele
          </button>
        </form>
      </AdminFilterBar>

      <QuotesTable
        items={result.items}
        footer={
          result.nextCursor ? (
            <Link
              href={buildHref("/admin/teklifler", query, { cursor: result.nextCursor })}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Sonraki sayfa
            </Link>
          ) : (
            <span className="text-sm font-medium text-slate-500">Tüm kayıtlar yüklendi.</span>
          )
        }
      />
    </div>
  );
}
