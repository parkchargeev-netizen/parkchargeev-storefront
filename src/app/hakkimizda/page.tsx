import type { Metadata } from "next";

import { testimonials, trustMetrics } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "ParkChargeEV'in marka yaklaşımı, uzmanlık alanları ve neden premium EV commerce modeli olarak konumlandığı."
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
            Marka yaklaşımı
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-[-0.08em] text-on-surface">
            ParkChargeEV,
            <span className="text-gradient"> satış ile mühendisliği</span>
            aynı deneyimde buluşturur
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant">
            Doğru konumlandırma; yalnızca wallbox satan bir mağaza olmak değil,
            ürün, saha uygunluğu, kurulum, teknik servis ve içerik otoritesini tek
            dijital omurgada birleştirmektir.
          </p>
        </div>

        <aside className="surface-card h-fit p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">
            Konumlandırma özeti
          </p>
          <p className="mt-4 text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Premium EV commerce
          </p>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            Ürün vitrinini, kurulum hizmetini, teknik destek katmanını ve AI
            arama görünürlüğünü birlikte kurgulayan hibrit büyüme modeli.
          </p>
        </aside>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {trustMetrics.map((metric) => (
          <div key={metric.label} className="surface-card p-6">
            <p className="text-sm uppercase tracking-[0.26em] text-on-surface-variant">
              {metric.label}
            </p>
            <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-primary">
              {metric.value}
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {metric.detail}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Ticaret disiplini",
            body:
              "Güvenli ödeme, açık fiyatlandırma, garanti ve sipariş görünürlüğü e-ticaret tarafının temelidir."
          },
          {
            title: "Mühendislik yaklaşımı",
            body:
              "Cihaz seçimi tek başına yeterli değildir; saha, enerji kapasitesi ve büyüme planı birlikte kurgulanmalıdır."
          },
          {
            title: "İçerik otoritesi",
            body:
              "SEO, GEO ve answer engine görünürlüğü için kullanıcı sorularına doğrudan cevap veren içerik mimarisi gerekir."
          }
        ].map((item) => (
          <article key={item.title} className="surface-card p-8">
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
              {item.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-on-surface-variant">
              {item.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-14">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-secondary">
          Sosyal kanıt
        </p>
        <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-on-surface">
          Karar vericilerin duyduğu gerçek ihtiyaçlar
        </h2>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.id} className="surface-card p-8">
              <p className="text-base leading-8 text-on-surface-variant">
                “{item.quote}”
              </p>
              <div className="mt-6 border-t border-outline-variant/30 pt-6">
                <p className="text-lg font-semibold text-on-surface">{item.name}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {item.role} · {item.company}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
