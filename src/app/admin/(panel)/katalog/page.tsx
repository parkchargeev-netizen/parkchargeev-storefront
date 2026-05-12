import { CatalogForm } from "@/components/admin/catalog-form";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { listAdminCatalog } from "@/server/admin/repository";

export default async function AdminCatalogPage() {
  const catalog = await listAdminCatalog();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Katalog Yonetimi"
        title="Marka ve kategori sozlugu"
        description="Urun formunun beslendigi marka ve kategori kayitlarini panelden yonetin."
        meta={
          <>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {catalog.brands.length} marka
            </span>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {catalog.categories.length} kategori
            </span>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Yeni marka</h2>
          <div className="mt-5">
            <CatalogForm type="brand" />
          </div>
        </section>

        <section className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Yeni kategori</h2>
          <div className="mt-5">
            <CatalogForm type="category" categories={catalog.categories} />
          </div>
        </section>
      </div>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <h2 className="text-xl font-semibold text-slate-950">Markalar</h2>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {catalog.brands.map((brand) => (
            <div key={brand.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <CatalogForm type="brand" item={brand} />
            </div>
          ))}
          {catalog.brands.length === 0 ? (
            <p className="text-sm text-slate-500">Henuz marka yok.</p>
          ) : null}
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <h2 className="text-xl font-semibold text-slate-950">Kategoriler</h2>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {catalog.categories.map((category) => (
            <div key={category.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <CatalogForm type="category" item={category} categories={catalog.categories} />
            </div>
          ))}
          {catalog.categories.length === 0 ? (
            <p className="text-sm text-slate-500">Henuz kategori yok.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
