import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { ProductComparisonClient } from "@/components/site/product-comparison-client";
import { JsonLd } from "@/components/seo/json-ld";
import { formatPriceTRY } from "@/lib/format";
import { products } from "@/lib/mock-data";
import { getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Şarj Cihazı Karşılaştırma",
  description:
    "11 kW ve 22 kW AC şarj cihazları, AC ve DC hızlı şarj seçenekleri, ev tipi ve iş yeri tipi kurulumlar arasındaki farkları karşılaştırın.",
  alternates: {
    canonical: "/karsilastir"
  }
};

const comparisonRows = [
  {
    title: "11 kW vs 22 kW",
    left: "11 kW AC, ev ve site kullanımı için dengeli bir kurulum maliyeti sunar.",
    right: "22 kW AC, iş yeri ve çoklu kullanıcı senaryolarında daha yüksek güç sağlar.",
    bestFor: "Üç faz altyapısı olan konutlarda 11 kW, ticari otoparklarda 22 kW öne çıkar."
  },
  {
    title: "AC vs DC",
    left: "AC cihazlar uzun süreli park ve gece şarjı için ekonomik çözümdür.",
    right: "DC hızlı şarj, kısa sürede enerji aktarımı gereken ticari lokasyonlarda kullanılır.",
    bestFor: "Park süresi uzunsa AC, araç dönüş hızı kritikse DC tercih edilir."
  },
  {
    title: "Ev tipi vs iş yeri tipi",
    left: "Ev tipi cihazlarda kolay kullanım, kompakt gövde ve güvenli montaj önceliklidir.",
    right: "İş yeri tipi cihazlarda RFID, raporlama, OCPP ve çoklu kullanıcı yönetimi öne çıkar.",
    bestFor: "Tek kullanıcıda ev tipi, kullanıcı ayrımı gereken lokasyonlarda iş yeri tipi daha uygundur."
  }
] as const;

const faqs = [
  {
    question: "11 kW ve 22 kW arasında nasıl karar verilir?",
    answer:
      "Elektrik altyapısı, araç kabul gücü, park süresi ve kullanıcı sayısı birlikte değerlendirilmelidir. Ev ve site senaryolarında 11 kW çoğu zaman dengeli bir seçimdir."
  },
  {
    question: "DC hızlı şarj her işletme için gerekli midir?",
    answer:
      "Hayır. DC cihazlar yüksek yatırım ve enerji altyapısı ister. Araçların uzun süre park ettiği otoparklarda AC cihazlar daha verimli olabilir."
  },
  {
    question: "İş yeri için RFID neden önemlidir?",
    answer:
      "RFID veya kullanıcı yetkilendirme, çalışan ve ziyaretçi kullanımını ayırarak maliyet ve erişim kontrolünü kolaylaştırır."
  }
];

export default function ComparePage() {
  const acProducts = products.filter((product) =>
    product.powerLabel.toLocaleLowerCase("tr-TR").includes("ac")
  );
  const dcProducts = products.filter((product) =>
    product.powerLabel.toLocaleLowerCase("tr-TR").includes("dc")
  );
  const acStartPrice = acProducts.length
    ? formatPriceTRY(Math.min(...acProducts.map((item) => item.priceKurus)))
    : "Teklif alın";
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Karşılaştırma", path: "/karsilastir" }
  ]);
  const faqJsonLd = getFaqJsonLd(faqs);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <JsonLd data={[breadcrumbJsonLd, faqJsonLd]} />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Ürün karşılaştırma
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.06em] text-on-surface md:text-6xl">
            11 kW, 22 kW, AC ve DC şarj cihazlarını karşılaştır
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant">
            Kurulum yerine, araç sayısına ve park süresine göre doğru güç sınıfını seçmek
            yatırım maliyetini ve kullanım deneyimini doğrudan etkiler.
          </p>
        </div>
        <aside className="surface-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Hızlı karar
          </p>
          <div className="mt-5 space-y-3 text-sm leading-6 text-on-surface-variant">
            {[
              "Ev ve gece şarjı için 7.4 kW veya 11 kW AC",
              "İş yeri ve çoklu kullanıcı için 22 kW AC",
              "Kısa park süresi ve ticari gelir modeli için DC hızlı şarj"
            ].map((item) => (
              <div key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Link
            href="/urun-secici"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
          >
            Akıllı seçiciye git
            <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </section>

      <ProductComparisonClient products={products} />

      <section className="mt-12 grid gap-5">
        {comparisonRows.map((row) => (
          <article key={row.title} className="surface-card p-6">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-on-surface">
              {row.title}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-surface-container-low p-4 text-sm leading-7 text-on-surface-variant">
                {row.left}
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4 text-sm leading-7 text-on-surface-variant">
                {row.right}
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold leading-7 text-on-surface">
                {row.bestFor}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              AC ürünler
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-on-surface">
              Ev, site ve iş yeri için öneriler
            </h2>
          </div>
          <p className="text-sm font-semibold text-on-surface-variant">
            Başlangıç fiyatı {acStartPrice}
          </p>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {acProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {dcProducts.length ? (
        <section className="mt-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              DC hızlı şarj
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-on-surface">
              Ticari ve yüksek devirli lokasyonlar
            </h2>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {dcProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 surface-card p-8">
        <h2 className="text-3xl font-black tracking-[-0.05em] text-on-surface">
          Sık sorulan sorular
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-2xl bg-surface-container-low p-5">
              <h3 className="text-base font-semibold text-on-surface">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
