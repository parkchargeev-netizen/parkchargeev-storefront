import { ProductFormLoader } from "@/components/admin/product-form-loader";
import { getAdminProductFormOptions } from "@/server/admin/product-form-options";

export default async function NewAdminProductPage() {
  const { lookupOptions, catalogOptions } = await getAdminProductFormOptions();

  return (
    <div className="space-y-6">
      <section className="surface-card border border-slate-200 bg-white/95 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-normal text-[#0f8f6f]">
          Yeni Ürün
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Ürün ekle</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Karmaşık alanlar gelişmiş panellere taşındı. Ürünü hızlıca yayına hazırlamak için önce ad, açıklama, fiyat, stok, teknik değer ve görsel bilgilerini doldurun.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["1", "Temel bilgi", "Ad, slug, durum, marka ve açıklama."],
            ["2", "Satış verisi", "Fiyat, stok, SKU ve kampanya bilgisi."],
            ["3", "Görsel ve teknik", "Ana görsel, teknik alanlar ve ürün özellikleri."]
          ].map(([step, title, body]) => (
            <div key={step} className="rounded-lg border border-emerald-100 bg-emerald-50/55 p-4">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#063326] text-xs font-bold text-white">
                {step}
              </span>
              <p className="mt-3 text-sm font-bold text-slate-950">{title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <ProductFormLoader
        mode="create"
        lookupOptions={lookupOptions}
        catalogOptions={catalogOptions}
      />
    </div>
  );
}
