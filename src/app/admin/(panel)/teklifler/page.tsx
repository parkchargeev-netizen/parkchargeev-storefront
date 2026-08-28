import type { ReactNode } from "react";

import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";
import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { QuotesTable } from "@/components/admin/table/quotes-table";
import { ServiceLeadsTable } from "@/components/admin/table/service-leads-table";
import { leadStatusOptions, quoteStatusOptions } from "@/server/admin/constants";
import { listAdminQuotes, listAdminServiceLeads } from "@/server/admin/repository";

type RequestView = "teklif" | "saha";

type RequestsPageQuery = {
  q?: string;
  status?: string;
  cursor?: string;
  from?: string;
  to?: string;
  view?: string;
};

type RequestsPageProps = {
  searchParams?: Promise<RequestsPageQuery>;
};

type StatusOption = {
  value: string;
  label: string;
};

function parseView(view?: string): RequestView {
  return view === "saha" ? "saha" : "teklif";
}

function buildHref(basePath: string, query: Record<string, string | undefined>, extra: Record<string, string>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value && key !== "cursor") {
      params.set(key, value);
    }
  }

  for (const [key, value] of Object.entries(extra)) {
    if (value) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

function buildExportHref(view: RequestView, query: Record<string, string | undefined>) {
  const endpoint = view === "saha" ? "/api/admin/service-leads" : "/api/admin/quotes";
  return buildHref(endpoint, query, { format: "csv", limit: "50", view: "" });
}

function countLabel(view: RequestView, count: number) {
  return view === "saha" ? `${count} saha talebi` : `${count} teklif`;
}

function renderNextFooter({
  activeView,
  query,
  nextCursor
}: {
  activeView: RequestView;
  query: RequestsPageQuery;
  nextCursor: string | null;
}) {
  if (!nextCursor) {
    return <span className="text-sm font-medium text-slate-500">Tüm kayıtlar yüklendi.</span>;
  }

  return (
    <AdminPrefetchLink
      href={buildHref("/admin/teklifler", query, { view: activeView, cursor: nextCursor })}
      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
    >
      Sonraki sayfa
    </AdminPrefetchLink>
  );
}

function RequestViewTabs({ activeView, query }: { activeView: RequestView; query: RequestsPageQuery }) {
  const tabs: Array<{ view: RequestView; label: string; description: string }> = [
    {
      view: "teklif",
      label: "Teklif talepleri",
      description: "Satış ve teklif süreci"
    },
    {
      view: "saha",
      label: "Saha / kurulum",
      description: "Keşif, servis ve kurulum"
    }
  ];

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm sm:grid-cols-2">
      {tabs.map((tab) => {
        const isActive = activeView === tab.view;

        return (
          <AdminPrefetchLink
            key={tab.view}
            href={buildHref("/admin/teklifler", query, { view: tab.view, cursor: "" })}
            aria-current={isActive ? "page" : undefined}
            className={isActive
              ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[#063326] shadow-sm"
              : "rounded-xl border border-transparent px-4 py-3 text-slate-600 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"}
          >
            <span className="block text-sm font-bold">{tab.label}</span>
            <span className="mt-1 block text-xs font-medium opacity-75">{tab.description}</span>
          </AdminPrefetchLink>
        );
      })}
    </div>
  );
}

function RequestsFilterBar({
  query,
  activeView,
  statusOptions
}: {
  query: RequestsPageQuery;
  activeView: RequestView;
  statusOptions: StatusOption[];
}) {
  return (
    <AdminFilterBar>
      <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_170px_170px_auto]">
        <input type="hidden" name="view" value={activeView} />
        <input
          name="q"
          defaultValue={query.q ?? ""}
          placeholder={activeView === "saha" ? "Ad, telefon veya talep tipi ara" : "Kişi, firma veya telefon ara"}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
        />
        <select
          name="status"
          defaultValue={query.status ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
        >
          <option value="">Tüm durumlar</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          name="from"
          type="date"
          defaultValue={query.from ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
        />
        <input
          name="to"
          type="date"
          defaultValue={query.to ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
        />
        <button className="rounded-lg border border-slate-300 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
          Filtrele
        </button>
      </form>
    </AdminFilterBar>
  );
}

function RequestsPageFrame({
  activeView,
  query,
  count,
  children
}: {
  activeView: RequestView;
  query: RequestsPageQuery;
  count: number;
  children: ReactNode;
}) {
  const statusOptions = activeView === "saha" ? leadStatusOptions : quoteStatusOptions;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Talep Yönetimi"
        title="Teklif ve saha talepleri tek ekranda"
        description="Satış teklifleri ile keşif, servis ve kurulum taleplerini aynı operasyon sayfasında takip edin; sekmelerle doğru kuyruğa geçin."
        action={
          <a
            href={buildExportHref(activeView, query)}
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            CSV indir
          </a>
        }
        meta={
          <>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {countLabel(activeView, count)}
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {activeView === "saha" ? "Saha kuyruğu" : "Teklif kuyruğu"}
            </span>
          </>
        }
      />

      <RequestViewTabs activeView={activeView} query={query} />
      <RequestsFilterBar query={query} activeView={activeView} statusOptions={[...statusOptions]} />
      {children}
    </div>
  );
}

export default async function AdminRequestsPage({ searchParams }: RequestsPageProps) {
  const query = (await searchParams) ?? {};
  const activeView = parseView(query.view);

  if (activeView === "saha") {
    const result = await listAdminServiceLeads({
      q: query.q,
      status: query.status,
      cursor: query.cursor,
      from: query.from,
      to: query.to,
      limit: 12
    });

    return (
      <RequestsPageFrame activeView={activeView} query={query} count={result.items.length}>
        <ServiceLeadsTable
          items={result.items}
          footer={renderNextFooter({ activeView, query, nextCursor: result.nextCursor })}
        />
      </RequestsPageFrame>
    );
  }

  const result = await listAdminQuotes({
    q: query.q,
    status: query.status,
    cursor: query.cursor,
    from: query.from,
    to: query.to,
    limit: 12
  });

  return (
    <RequestsPageFrame activeView={activeView} query={query} count={result.items.length}>
      <QuotesTable
        items={result.items}
        footer={renderNextFooter({ activeView, query, nextCursor: result.nextCursor })}
      />
    </RequestsPageFrame>
  );
}