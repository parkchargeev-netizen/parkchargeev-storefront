import Link from "next/link";

import { formatPriceTRY } from "@/lib/format";
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
      <section className="surface-card border border-slate-200 bg-white/95 p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Urun Yonetimi
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Katalog ve SEO alanlari</h1>
          </div>
          <Link
            href="/admin/urunler/yeni"
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Yeni Urun
          </Link>
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Urun, slug veya SKU ara"
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          />
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          >
            <option value="">Tum durumlar</option>
            <option value="draft">Taslak</option>
            <option value="active">Aktif</option>
            <option value="archived">Pasif</option>
          </select>
          <button className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">
            Filtrele
          </button>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {result.items.map((product) => (
          <Link
            key={product.id}
            href={`/admin/urunler/${product.id}`}
            className="surface-card border border-slate-200 bg-white/95 p-6 transition hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{product.slug}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{product.name}</h2>
                <p className="mt-2 text-sm text-slate-600">{product.shortDescription}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {product.status}
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Fiyat</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {product.defaultVariant ? formatPriceTRY(product.defaultVariant.priceKurus) : "-"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Stok</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {product.defaultVariant?.stockQuantity ?? 0}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Kategori</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {product.categories.join(", ") || "-"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {result.nextCursor ? (
        <div className="flex justify-center">
          <Link
            href={`/admin/urunler?cursor=${encodeURIComponent(result.nextCursor)}`}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Sonraki sayfa
          </Link>
        </div>
      ) : null}
    </div>
  );
}
