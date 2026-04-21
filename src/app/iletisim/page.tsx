import type { Metadata } from "next";

import { LeadForm } from "@/components/forms/lead-form";
import { globalFaqs, trustMetrics } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site";
import {
  getFaqJsonLd,
  getLocalBusinessJsonLd
} from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Keşif, teklif, kurulum, servis ve iş ortaklığı talepleri için ParkChargeEV ile iletişime geçin."
};

export default function ContactPage() {
  const localBusinessJsonLd = getLocalBusinessJsonLd();
  const faqJsonLd = getFaqJsonLd(globalFaqs);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
            İletişim ve lead yönetimi
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
            Projenizi paylaşın,
            <span className="text-gradient"> doğru çözümü birlikte kuralım</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">
            Bireysel kurulum, kurumsal proje, bakım, bayi adaylığı veya teknik
            destek taleplerinizi aynı iletişim mimarisinde toplayacak sayfa.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="surface-card p-6">
              <p className="text-sm uppercase tracking-[0.26em] text-on-surface-variant">
                Telefon
              </p>
              <p className="mt-3 text-2xl font-bold text-on-surface">
                {siteConfig.phone}
              </p>
            </div>
            <div className="surface-card p-6">
              <p className="text-sm uppercase tracking-[0.26em] text-on-surface-variant">
                E-posta
              </p>
              <p className="mt-3 text-2xl font-bold text-on-surface">
                {siteConfig.email}
              </p>
            </div>
            <div className="surface-card p-6">
              <p className="text-sm uppercase tracking-[0.26em] text-on-surface-variant">
                Merkez Ofis
              </p>
              <p className="mt-3 text-lg font-semibold text-on-surface">
                {siteConfig.address.streetAddress}, {siteConfig.address.addressLocality} / {siteConfig.address.addressRegion}
              </p>
            </div>
          </div>
        </div>

        <LeadForm
          title="Teklif, keşif ve destek formu"
          description="Talebinizin türünü seçin; ekip doğru satış veya destek akışıyla size geri dönüş yapsın."
        />
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

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-secondary">
              Sık sorulan sorular
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-on-surface">
              İletişim öncesi netlik
            </h2>
          </div>
        </div>
        <div className="mt-8 grid gap-4">
          {globalFaqs.map((item) => (
            <article key={item.question} className="surface-card p-6">
              <h3 className="text-xl font-semibold text-on-surface">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
