import type { Metadata } from "next";

import { LeadForm } from "@/components/forms/lead-form";
import { SolutionCard } from "@/components/solutions/solution-card";
import { solutionPages, trustMetrics } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Kurumsal Çözümler",
  description:
    "Site, apartman, iş yeri, ofis, filo ve otopark projeleri için kurumsal EV şarj altyapısı çözümleri."
};

export default function CorporateSolutionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
            Kurumsal satış mimarisi
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-[-0.08em] text-on-surface md:text-6xl">
            EV charging projelerini
            <span className="text-gradient"> tekliften operasyona</span>
            taşıyan yapı
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">
            Site yönetimleri, ofisler, otopark işletmeleri ve filolar için ürün,
            keşif, kurulum, kapasite planı ve servis katmanlarını tek proje
            akışında kurguluyoruz.
          </p>
        </div>

        <div className="surface-card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">
            Neden ayrı bir kurumsal akış?
          </p>
          <div className="mt-6 grid gap-4">
            {[
              "B2C mağaza akışı ile kurumsal teklif akışı birbirinden ayrılmalı",
              "Karar verici, kullanıcı ve teknik ekip aynı sayfada farklı bilgiye ihtiyaç duyar",
              "Şarj altyapısında cihaz kadar enerji planı ve saha organizasyonu da satılır"
            ].map((item) => (
              <div key={item} className="rounded-[24px] bg-surface-container-low p-5 text-sm leading-7 text-on-surface-variant">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-secondary">
              Kullanım senaryoları
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-on-surface">
              Her segment için ayrı satış dili
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-on-surface-variant">
            ParkChargeEV'in kurumsal büyüme modeli; tek tip ürün sayfası yerine,
            ihtiyaca göre uzmanlaşmış landing page yapısı üzerinden ilerlemelidir.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {solutionPages.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>
      </section>

      <section className="mt-14 overflow-hidden rounded-[32px] bg-slate-950 px-8 py-10 text-white shadow-[0_24px_80px_rgba(0,0,0,0.2)] lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/60">
              Teklif süreci
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.07em]">
              Kurumsal projede dönüşüm nasıl artar?
            </h2>
          </div>
          <div className="grid gap-4">
            {[
              "İhtiyaç formu ve hızlı geri dönüş",
              "Teknik keşif ve kapasite değerlendirmesi",
              "Ürün + saha + servis kapsamı ayrıştırılmış teklif",
              "Kurulum sonrası raporlama ve bakım planı"
            ].map((item, index) => (
              <div key={item} className="rounded-[24px] border border-white/10 bg-white/6 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/50">
                  Adım {index + 1}
                </p>
                <p className="mt-2 text-lg font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14">
        <LeadForm
          title="Kurumsal keşif ve teklif formu"
          description="Site, iş yeri, ofis, filo veya otopark projenizi paylaşın; ihtiyaç analiziyle birlikte doğru çözüm mimarisini kuralım."
          defaultReason="İş yeri / ofis projesi"
        />
      </section>
    </div>
  );
}
