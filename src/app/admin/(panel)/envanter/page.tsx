import Link from "next/link";

import { InventoryAdjustmentForm } from "@/components/admin/operation-forms";
import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { listInventoryMovements } from "@/server/admin/operations";

type InventoryPageProps = {
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
    if (value && key !== "cursor") params.set(key, value);
  }

  for (const [key, value] of Object.entries(extra)) {
    params.set(key, value);
  }

  return `${basePath}?${params.toString()}`;
}

export default async function AdminInventoryPage({ searchParams }: InventoryPageProps) {
  const query = (await searchParams) ?? {};
  const result = await listInventoryMovements({
    q: query.q,
    status: query.status,
    cursor: query.cursor,
    from: query.from,
    to: query.to,
    limit: 20
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Stok ve Envanter"
        title="Stok hareketleri ve kritik düzeltmeler"
        description="Ürün formu, PayTR sipariş akışı ve manuel düzeltmelerden gelen stok hareketleri tek listede izlenir."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <AdminFilterBar>
            <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_170px_170px_auto]">
              <input name="q" defaultValue={query.q ?? ""} placeholder="SKU veya hareket nedeni ara" className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm" />
              <select name="status" defaultValue={query.status ?? ""} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm">
                <option value="">Tüm hareketler</option>
                <option value="product_created">Ürün eklendi</option>
                <option value="manual_update">Stok güncellendi</option>
                <option value="manual_adjustment">Manuel düzeltme</option>
                <option value="order_paid">Sipariş nedeniyle azaldı</option>
                <option value="variant_archived">Varyant arşivlendi</option>
              </select>
              <input name="from" type="date" defaultValue={query.from ?? ""} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm" />
              <input name="to" type="date" defaultValue={query.to ?? ""} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm" />
              <button className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Filtrele</button>
            </form>
          </AdminFilterBar>

          <section className="surface-card overflow-hidden border border-slate-200 bg-white/95">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    {["Ürün", "SKU", "Hareket", "Önce", "Sonra", "Fark", "Tarih"].map((header) => (
                      <th key={header} className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.items.length > 0 ? (
                    result.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="border-b border-slate-100 px-4 py-4 text-sm font-semibold text-slate-900">{item.productName ?? "-"}</td>
                        <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">{item.sku ?? "-"}</td>
                        <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">{item.reason}</td>
                        <td className="border-b border-slate-100 px-4 py-4 text-sm">{item.quantityBefore}</td>
                        <td className="border-b border-slate-100 px-4 py-4 text-sm">{item.quantityAfter}</td>
                        <td className="border-b border-slate-100 px-4 py-4 text-sm font-bold">{item.quantityDelta}</td>
                        <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-500">{new Date(item.createdAt).toLocaleString("tr-TR")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-14 text-center text-sm text-slate-500">Henüz stok hareketi yok.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              {result.nextCursor ? (
                <Link href={buildHref("/admin/envanter", query, { cursor: result.nextCursor })} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                  Sonraki sayfa
                </Link>
              ) : (
                <span className="text-sm font-medium text-slate-500">Tüm kayıtlar yüklendi.</span>
              )}
            </div>
          </section>
        </section>

        <aside>
          <InventoryAdjustmentForm />
        </aside>
      </div>
    </div>
  );
}
