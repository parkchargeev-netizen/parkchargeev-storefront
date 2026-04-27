import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { QuotesTable } from "@/components/admin/table/quotes-table";
import { listAdminQuotes } from "@/server/admin/repository";

type QuotesPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    cursor?: string;
  }>;
};

export default async function AdminQuotesPage({ searchParams }: QuotesPageProps) {
  const query = (await searchParams) ?? {};
  const result = await listAdminQuotes({
    q: query.q,
    status: query.status,
    cursor: query.cursor,
    limit: 12
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Teklifler"
        title="B2B pipeline ve geri donus kontrolu"
        description="Teklif listesi reusable tablo temelinde sade, hizli ve filtrelenebilir bir takip ekranina donustu."
        meta={
          <>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {result.items.length} teklif
            </span>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Pipeline hazirligi
            </span>
          </>
        }
      />

      <AdminFilterBar>
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Kisi, firma veya telefon ara"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
          />
          <input
            name="status"
            defaultValue={query.status ?? ""}
            placeholder="Durum filtre"
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
              href={`/admin/teklifler?cursor=${encodeURIComponent(result.nextCursor)}`}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Sonraki sayfa
            </Link>
          ) : (
            <span className="text-sm font-medium text-slate-500">Tum kayitlar yuklendi.</span>
          )
        }
      />
    </div>
  );
}
