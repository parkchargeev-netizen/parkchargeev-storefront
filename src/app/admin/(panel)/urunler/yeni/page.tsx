import { ProductForm } from "@/components/admin/product-form";
import { getAdminProductFormOptions } from "@/server/admin/product-form-options";

export default async function NewAdminProductPage() {
  const { lookupOptions, catalogOptions } = await getAdminProductFormOptions();

  return (
    <div className="space-y-6">
      <section className="surface-card border border-slate-200 bg-white/95 p-8">
        <p className="text-sm font-semibold uppercase tracking-normal text-[#0f8f6f]">
          Yeni Ürün
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Katalog kaydı oluştur</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Ürün bilgileri, varsayılan varyant, SEO alanları ve AI özeti tek formda kaydedilir.
        </p>
      </section>

      <ProductForm
        mode="create"
        lookupOptions={lookupOptions}
        catalogOptions={catalogOptions}
      />
    </div>
  );
}
