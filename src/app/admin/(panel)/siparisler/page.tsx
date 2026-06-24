import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { OrdersTable } from "@/components/admin/table/orders-table";
import { orderStatusOptions } from "@/server/admin/constants";
import { listAdminOrders } from "@/server/admin/order-repository";

type OrdersPageProps = {
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

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const query = (await searchParams) ?? {};
  const result = await listAdminOrders({
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
        eyebrow="Siparişler"
        title="Ödeme, karşılama ve durum takibi"
        description="Sipariş akışı artık yeniden kullanılabilir tablo yapısı üzerinde ilerliyor. PayTR ödeme durumu, sipariş aşaması ve müşteri özeti aynı listede okunuyor."
        action={
          <a
            href={buildHref("/api/admin/orders", query, { format: "csv", limit: "50" })}
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            CSV indir
          </a>
        }
        meta={
          <>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {result.items.length} sipariş
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Durum ve ödeme izleme
            </span>
          </>
        }
      />

      <AdminFilterBar>
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_170px_170px_auto]">
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Sipariş no, müşteri veya e-posta"
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
          />
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tüm durumlar</option>
            {orderStatusOptions.map((option) => (
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

      <OrdersTable
        items={result.items}
        footer={
          result.nextCursor ? (
            <Link
              href={buildHref("/admin/siparisler", query, { cursor: result.nextCursor })}
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
