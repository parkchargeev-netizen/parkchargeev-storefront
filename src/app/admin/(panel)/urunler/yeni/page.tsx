import { ProductForm } from "@/components/admin/product-form";
import { getProductLookupOptions } from "@/server/admin/repository";

export default async function NewAdminProductPage() {
  const lookupOptions = await getProductLookupOptions();

  return (
    <div className="space-y-6">
      <section className="surface-card border border-slate-200 bg-white/95 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
          Yeni Urun
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Katalog kaydi olustur</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Urun bilgileri, varsayilan varyant, SEO alanlari ve AI summary tek formda kaydedilir.
        </p>
      </section>

      <ProductForm mode="create" lookupOptions={lookupOptions} />
    </div>
  );
}
