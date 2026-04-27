import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { OrdersTable } from "@/components/admin/table/orders-table";
import { listAdminOrders } from "@/server/admin/repository";

type OrdersPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    cursor?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const query = (await searchParams) ?? {};
  const result = await listAdminOrders({
    q: query.q,
    status: query.status,
    cursor: query.cursor,
    limit: 12
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Siparisler"
        title="Odeme, fulfilment ve durum takibi"
        description="Siparis akisi artik reusable data table omurgasi uzerinde ilerliyor. PayTR odeme durumu, siparis asamasi ve musteri ozeti ayni listede okunuyor."
        meta={
          <>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {result.items.length} siparis
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Durum ve odeme izleme
            </span>
          </>
        }
      />

      <AdminFilterBar>
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Siparis no, musteri veya e-posta"
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

      <OrdersTable
        items={result.items}
        footer={
          result.nextCursor ? (
            <Link
              href={`/admin/siparisler?cursor=${encodeURIComponent(result.nextCursor)}`}
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
