import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { ProductsTable } from "@/components/admin/table/products-table";
import { listAdminCatalog, listAdminProducts } from "@/server/admin/repository";

type ProductListPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    cursor?: string;
    from?: string;
    to?: string;
    category?: string;
    brand?: string;
    stock?: string;
    sort?: string;
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

export default async function AdminProductsPage({ searchParams }: ProductListPageProps) {
  const query = (await searchParams) ?? {};
  const [result, catalog] = await Promise.all([
    listAdminProducts({
      q: query.q,
      status: query.status,
      cursor: query.cursor,
      from: query.from,
      to: query.to,
      category: query.category,
      brand: query.brand,
      stock: query.stock,
      sort: query.sort,
      limit: 12
    }),
    listAdminCatalog()
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ürün Yönetimi"
        title="Katalog, fiyat ve SEO kontrol merkezi"
        description="Yeniden kullanılabilir tablo yapısıyla katalog takibi, fiyat / stok görünürlüğü ve ürün SEO alanları tek listede toplandı."
        action={
          <>
            <a
              href={buildHref("/api/admin/products", query, { format: "csv", limit: "50" })}
              className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              CSV indir
            </a>
            <Link
              href="/admin/urunler/yeni"
              prefetch={false}
              className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Yeni Ürün
            </Link>
          </>
        }
        meta={
          <>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {result.items.length} ürün
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Cursor tabanli listeleme aktif
            </span>
          </>
        }
      />

      <AdminFilterBar>
        <form className="grid gap-4 lg:grid-cols-4 xl:grid-cols-[minmax(0,1.4fr)_160px_160px_160px_160px_160px_auto]">
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Ürün, slug veya SKU ara"
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
          />
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tüm durumlar</option>
            <option value="draft">Taslak</option>
            <option value="active">Aktif</option>
            <option value="archived">Pasif</option>
          </select>
          <select
            name="category"
            defaultValue={query.category ?? ""}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tum kategoriler</option>
            {catalog.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            name="brand"
            defaultValue={query.brand ?? ""}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tum markalar</option>
            {catalog.brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <select
            name="stock"
            defaultValue={query.stock ?? ""}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tum stoklar</option>
            <option value="available">Stokta</option>
            <option value="low">Kritik stok</option>
            <option value="out">Stok yok</option>
          </select>
          <select
            name="sort"
            defaultValue={query.sort ?? ""}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Varsayilan</option>
            <option value="manual_order">Manuel sıra</option>
            <option value="name_asc">Ada gore</option>
            <option value="price_desc">Fiyat yuksek</option>
            <option value="stock_asc">Stok azalan risk</option>
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

      <ProductsTable
        items={result.items}
        footer={
          result.nextCursor ? (
            <Link
              href={buildHref("/admin/urunler", query, { cursor: result.nextCursor })}
              prefetch={false}
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
