import Link from "next/link";

import { formatPriceTRY } from "@/lib/format";
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
      <section className="surface-card border border-slate-200 bg-white/95 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
          Siparisler
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">PayTR ve durum yonetimi</h1>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Siparis no, musteri veya e-posta"
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

      <section className="space-y-4">
        {result.items.map((order) => (
          <Link
            key={order.id}
            href={`/admin/siparisler/${order.id}`}
            className="surface-card block border border-slate-200 bg-white/95 p-6 transition hover:-translate-y-0.5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{order.orderNumber}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  {order.customerName || "Misafir musteri"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {order.items.map((item) => item.productName).join(", ") || "Urun bulunamadi"}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Toplam</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatPriceTRY(order.totalKurus)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Durum</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{order.status}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Odeme</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {order.paymentStatus}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {result.nextCursor ? (
        <div className="flex justify-center">
          <Link
            href={`/admin/siparisler?cursor=${encodeURIComponent(result.nextCursor)}`}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Sonraki sayfa
          </Link>
        </div>
      ) : null}
    </div>
  );
}
