import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { ProductsTable } from "@/components/admin/table/products-table";
import { listAdminProducts } from "@/server/admin/repository";

type ProductListPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    cursor?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: ProductListPageProps) {
  const query = (await searchParams) ?? {};
  const result = await listAdminProducts({
    q: query.q,
    status: query.status,
    cursor: query.cursor,
    limit: 12
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Urun Yonetimi"
        title="Katalog, fiyat ve SEO kontrol merkezi"
        description="Reusable data table foundation ile katalog takibi, fiyat / stok gorunurlugu ve urun SEO alanlari tek listede toplandi."
        action={
          <Link
            href="/admin/urunler/yeni"
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Yeni Urun
          </Link>
        }
        meta={
          <>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {result.items.length} urun
            </span>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Cursor tabanli listeleme aktif
            </span>
          </>
        }
      />

      <AdminFilterBar>
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Urun, slug veya SKU ara"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
          />
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tum durumlar</option>
            <option value="draft">Taslak</option>
            <option value="active">Aktif</option>
            <option value="archived">Pasif</option>
          </select>
          <button className="rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
            Filtrele
          </button>
        </form>
      </AdminFilterBar>

      <ProductsTable
        items={result.items}
        footer={
          result.nextCursor ? (
            <Link
              href={`/admin/urunler?cursor=${encodeURIComponent(result.nextCursor)}`}
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
