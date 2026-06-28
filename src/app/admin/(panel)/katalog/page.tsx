import { CatalogForm } from "@/components/admin/catalog-form";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { listAdminCatalog } from "@/server/admin/repository";

export default async function AdminCatalogPage() {
  const catalog = await listAdminCatalog();
  const activeBrands = catalog.brands.filter((brand) => brand.isActive).length;
  const activeCategories = catalog.categories.filter((category) => category.isActive).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Katalog Yönetimi"
        title="Marka ve kategori operasyon merkezi"
        description="Mağaza filtrelerini, ürün formlarını ve SEO sinyallerini besleyen marka/kategori kayıtlarını tek ekrandan yönetin."
        meta={
          <>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {catalog.brands.length} marka
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {catalog.categories.length} kategori
            </span>
          </>
        }
      />

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: "Toplam marka", value: catalog.brands.length, detail: `${activeBrands} aktif` },
          {
            label: "Toplam kategori",
            value: catalog.categories.length,
            detail: `${activeCategories} aktif`
          },
          {
            label: "Pasif marka",
            value: catalog.brands.length - activeBrands,
            detail: "Silmeden gizlenen kayıtlar"
          },
          {
            label: "Pasif kategori",
            value: catalog.categories.length - activeCategories,
            detail: "Ürün formundan kaldırılanlar"
          }
        ].map((item) => (
          <div key={item.label} className="surface-card border border-white/70 p-5">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
              {item.label}
            </p>
            <p className="mt-3 text-4xl font-bold tracking-normal text-[#063326]">
              {item.value}
            </p>
            <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="surface-card border border-white/70 p-6">
          <p className="text-xs font-bold uppercase tracking-normal text-[#0f8f6f]">
            Marka oluştur
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Yeni marka</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ürünlerin marka filtrelerini, katalog güvenini ve arama görünürlüğünü besleyen
            kayıtları buradan yönetin.
          </p>
          <div className="mt-5">
            <CatalogForm type="brand" />
          </div>
        </section>

        <section className="surface-card border border-white/70 p-6">
          <p className="text-xs font-bold uppercase tracking-normal text-[#0f8f6f]">
            Kategori oluştur
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Yeni kategori</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Mağaza, ürün formu ve arama filtreleri için üst/alt kategori düzenini buradan
            kurun.
          </p>
          <div className="mt-5">
            <CatalogForm type="category" categories={catalog.categories} />
          </div>
        </section>
      </div>

      <section className="surface-card border border-white/70 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#0f8f6f]">
              Marka sözlüğü
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Markalar</h2>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-[#063326]">
            {activeBrands} aktif marka
          </span>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {catalog.brands.map((brand) => (
            <div key={brand.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">{brand.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{brand.slug}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    brand.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {brand.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
              <CatalogForm type="brand" item={brand} />
            </div>
          ))}
          {catalog.brands.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
              Henüz marka yok.
            </p>
          ) : null}
        </div>
      </section>

      <section className="surface-card border border-white/70 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#0f8f6f]">
              Kategori ağı
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Kategoriler</h2>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-[#063326]">
            {activeCategories} aktif kategori
          </span>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {catalog.categories.map((category) => (
            <div key={category.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">{category.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{category.slug}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    category.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {category.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
              <CatalogForm type="category" item={category} categories={catalog.categories} />
            </div>
          ))}
          {catalog.categories.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
              Henüz kategori yok.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
