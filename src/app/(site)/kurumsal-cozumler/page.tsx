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
            Kurumsal şarj çözümleri
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-[-0.08em] text-on-surface md:text-6xl">
            Site, ofis ve ticari sahalar için
            <span className="text-gradient"> net teklif ve güvenli kurulum</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">
            Site yönetimleri, ofisler, otopark işletmeleri ve filolar için ürün,
            keşif, kurulum, kapasite planı ve servis katmanlarını tek proje
            akışında kurguluyoruz.
          </p>
        </div>

          <div className="group relative overflow-hidden rounded-[34px] border border-white/70 bg-white/85 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.14)]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl transition-all duration-700 group-hover:scale-125" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-secondary/15 blur-3xl transition-all duration-700 group-hover:scale-125" />

          <div className="relative z-10">
            <p className="inline-flex rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-secondary">
              Neden ayrı kurumsal süreç?
            </p>

            <div className="mt-7 grid gap-4">
              {[
                "Yönetim, teknik ekip ve kullanıcıların beklentisi aynı teklif içinde net görünmeli",
                "Cihaz fiyatı, keşif, elektrik altyapısı, bakım ve servis kapsamı ayrı gösterilmeli",
                "RFID, adil kullanım, enerji planı ve büyüme senaryosu baştan tasarlanmalı"
              ].map((item, index) => (
                <div
                  key={item}
                  className="group/item relative overflow-hidden rounded-[26px] border border-transparent bg-[#EEF5F1] p-5 text-sm leading-7 text-on-surface-variant transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-[#E7F2EB] hover:shadow-[0_14px_40px_rgba(15,118,110,0.12)]"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-primary/60 transition-all duration-300 group-hover/item:w-2" />

                  <div className="flex items-start gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-primary shadow-sm transition-transform duration-300 group-hover/item:scale-110">
                      {index + 1}
                    </span>

                    <p className="font-medium">{item}</p>
                  </div>
                </div>
              ))}
            </div>
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
              Her segment için ayrı çözüm yolu
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-on-surface-variant">
            Site yönetimi, ofis otoparkı, filo ve ticari saha yatırımı farklı
            karar kriterlerine sahiptir. Her senaryoda doğru ürün, keşif ve servis
            kapsamı ayrı netleştirilir.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {solutionPages.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>
      </section>

      <section className="group relative mt-14 overflow-hidden rounded-[36px] bg-slate-950 px-8 py-12 text-white shadow-[0_28px_90px_rgba(0,0,0,0.28)] lg:px-12">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl transition-all duration-700 group-hover:scale-125" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl transition-all duration-700 group-hover:scale-125" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_35%,rgba(16,185,129,0.12))]" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-between">
            <div>
              <p className="inline-flex rounded-full border border-white/10 bg-white/[0.14] px-4 py-2 text-sm font-semibold uppercase tracking-[0.34em] text-white/82 backdrop-blur">
                Teklif süreci
              </p>

              <h2 className="mt-6 max-w-xl text-4xl font-black leading-tight tracking-[-0.07em] md:text-5xl">
                Kurumsal projede karar nasıl hızlanır?
              </h2>

              <p className="mt-5 max-w-md text-base leading-8 text-white/78">
                İhtiyaçtan keşfe, tekliften bakım planına kadar tüm adımlar net,
                ölçülebilir ve hızlı ilerler.
              </p>
            </div>

            <div className="mt-8 hidden rounded-[28px] border border-white/10 bg-white/[0.14] p-5 backdrop-blur md:block">
              <p className="text-sm text-white/76">Ortalama süreç</p>
              <p className="mt-2 text-3xl font-black text-emerald-300">
                4 adımda net teklif
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              "İhtiyaç formu ve hızlı geri dönüş",
              "Teknik keşif ve kapasite değerlendirmesi",
              "Ürün + saha + servis kapsamı ayrıştırılmış teklif",
              "Kurulum sonrası raporlama ve bakım planı"
            ].map((item, index) => (
              <div
                key={item}
                className="group/item relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.07] px-6 py-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-white/[0.11] hover:shadow-[0_18px_50px_rgba(16,185,129,0.16)]"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-emerald-300 opacity-70 transition-all duration-300 group-hover/item:w-2" />

                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/15 text-lg font-black text-emerald-300 ring-1 ring-emerald-300/25 transition-transform duration-300 group-hover/item:scale-110">
                    {index + 1}
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/45">
                      Adım {index + 1}
                    </p>

                    <p className="mt-2 text-lg font-semibold leading-7 text-white">
                      {item}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14">
        <LeadForm
          title="Kurumsal keşif ve teklif formu"
          description="Site, iş yeri, ofis, filo veya otopark projenizi paylaşın; doğru cihaz, keşif, kurulum ve servis kapsamını birlikte netleştirelim."
          defaultReason="İş yeri / ofis projesi"
        />
      </section>
    </div>
  );
}
