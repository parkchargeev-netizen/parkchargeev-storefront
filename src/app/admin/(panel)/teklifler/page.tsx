import Link from "next/link";

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
      <section className="surface-card border border-slate-200 bg-white/95 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
          Teklifler
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">B2B pipeline ve takip</h1>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Kisi, firma veya telefon ara"
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          />
          <input
            name="status"
            defaultValue={query.status ?? ""}
            placeholder="Durum filtre"
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          />
          <button className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">
            Filtrele
          </button>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {result.items.map((quote) => (
          <Link
            key={quote.id}
            href={`/admin/teklifler/${quote.id}`}
            className="surface-card border border-slate-200 bg-white/95 p-6 transition hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{quote.segment}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{quote.fullName}</h2>
                <p className="mt-2 text-sm text-slate-600">{quote.companyName || "Bireysel talep"}</p>
                <p className="mt-1 text-sm text-slate-500">{quote.phone}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {quote.status}
              </span>
            </div>
            <p className="mt-5 text-sm text-slate-600">
              Atanan temsilci: {quote.assignedAdminName || "Atanmamis"}
            </p>
          </Link>
        ))}
      </section>

      {result.nextCursor ? (
        <div className="flex justify-center">
          <Link
            href={`/admin/teklifler?cursor=${encodeURIComponent(result.nextCursor)}`}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Sonraki sayfa
          </Link>
        </div>
      ) : null}
    </div>
  );
}
