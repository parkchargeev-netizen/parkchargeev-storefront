import type { Metadata } from "next";
import Link from "next/link";

import { services } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Hizmetler",
  description:
    "Şarj ünitesi kurulumu, teknik servis, kurumsal çözümler ve enerji danışmanlığı hizmetleri."
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
          Sürdürülebilir mobilite
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
          Geleceğin enerjisini
          <span className="text-gradient"> bugünden inşa edin</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-on-surface-variant">
          Bireysel kullanıcıdan filo operasyonuna kadar EV charging altyapısını
          ürün, keşif, kurulum ve teknik destek katmanlarıyla kurguluyoruz.
        </p>
      </section>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {services.map((service, index) => (
          <article
            key={service.id}
            className={index === 1 ? "overflow-hidden rounded-[28px] bg-primary p-8 text-white" : "surface-card p-8"}
          >
            <h2 className="text-3xl font-bold tracking-[-0.05em]">
              {service.title}
            </h2>
            <p
              className={`mt-4 text-base leading-7 ${
                index === 1 ? "text-white/80" : "text-on-surface-variant"
              }`}
            >
              {service.summary}
            </p>
            <Link
              href={service.href}
              className={`mt-8 inline-block text-sm font-semibold ${
                index === 1 ? "text-white" : "text-primary"
              }`}
            >
              {service.cta}
            </Link>
          </article>
        ))}
      </div>

      <section className="mt-12 overflow-hidden rounded-[32px] border border-outline-variant/35 bg-surface-container-low p-8 lg:p-12">
        <h2 className="text-4xl font-black tracking-[-0.07em] text-on-surface">
          Zahmetsiz kurulum süreci
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-on-surface-variant">
          Ücretsiz keşif, projelendirme, profesyonel kurulum ve test/devreye alma
          olmak üzere dört adımlı anahtar teslim akış tasarlıyoruz.
        </p>

        <div className="mt-10 grid gap-5">
          {[
            {
              step: "Adım 01",
              title: "Ücretsiz keşif",
              summary:
                "Mevcut altyapı, pano mesafesi, enerji kapasitesi ve cihaz lokasyonu analiz edilir."
            },
            {
              step: "Adım 02",
              title: "Projelendirme ve planlama",
              summary:
                "Cihaz, kablo, koruma elemanları ve saha uygulama detayları netleştirilir."
            },
            {
              step: "Adım 03",
              title: "Profesyonel kurulum",
              summary:
                "Standartlara uygun montaj, bağlantı ve kullanıcı eğitimi birlikte tamamlanır."
            },
            {
              step: "Adım 04",
              title: "Test ve devreye alma",
              summary:
                "Sistem güvenlik testlerinden geçirilir ve PayTR dahil ticari akışlar devreye alınır."
            }
          ].map((item) => (
            <div key={item.step} className="surface-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                    {item.step}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-on-surface">
                    {item.title}
                  </h3>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-on-surface-variant">
                  {item.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
