import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  ShieldCheck,
  Wrench,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";

import { LeadForm } from "@/components/forms/lead-form";
import { SolutionCard } from "@/components/solutions/solution-card";
import type { CorporateSolutionsPageData } from "@/features/corporate/application/get-corporate-solutions-page-data";

const benefitIcons: Record<string, LucideIcon> = {
  gauge: Gauge,
  clipboard: ClipboardCheck,
  wrench: Wrench
};

export function CorporateSolutionsView({
  benefits,
  metrics,
  projectSteps,
  standards,
  solutions
}: CorporateSolutionsPageData) {
  return (
    <main className="corporate-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="corporate-hero">
        <div className="corporate-hero__copy">
          <p className="premium-eyebrow">Kurumsal şarj altyapısı</p>
          <h1>Lokasyonunuzu ölçeklenebilir bir şarj operasyonuna dönüştürün.</h1>
          <p>
            Site, ofis, otel, filo ve ticari otopark projelerinde cihazdan önce
            kapasiteyi, işletim modelini ve büyüme planını tasarlayın.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#kurumsal-teklif" className="premium-btn premium-btn--primary">
              Projeyi değerlendirin
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link href="/kurumsal-cozumler/site-ve-apartman" className="btn-secondary">
              Örnek çözümü incele
            </Link>
          </div>
        </div>

        <div className="corporate-benefits" aria-label="Kurumsal proje yetkinlikleri">
          {benefits.map((item) => {
            const Icon = benefitIcons[item.icon] ?? ShieldCheck;

            return (
              <article key={item.title} className="corporate-benefit">
                <span>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="mt-6 grid overflow-hidden rounded-lg border border-outline-variant/35 bg-white shadow-[0_18px_55px_rgba(6,51,38,0.08)] sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Kurumsal çözüm standartları"
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="border-b border-outline-variant/30 p-5 last:border-b-0 sm:border-r sm:odd:border-r sm:[&:nth-child(n+3)]:border-b-0 lg:border-b-0"
          >
            <strong className="block text-2xl font-bold text-primary">{metric.value}</strong>
            <span className="mt-1 block text-sm text-on-surface-variant">{metric.label}</span>
          </div>
        ))}
      </section>

      <section className="corporate-section">
        <div className="corporate-section__heading">
          <div>
            <p className="premium-eyebrow">Sektörel çözümler</p>
            <h2>İşletim modelinize uygun proje yolunu seçin.</h2>
          </div>
          <p>
            Her senaryo kapasite, kullanıcı yönetimi, raporlama ve servis
            gereksinimleriyle ayrı ele alınır.
          </p>
        </div>

        <div className="corporate-solution-grid">
          {solutions.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>
      </section>

      <section className="corporate-process">
        <div>
          <p className="premium-eyebrow text-emerald-300">Proje yaşam döngüsü</p>
          <h2>Karardan operasyona dört kontrollü aşama.</h2>
          <p>
            Teknik belirsizliği azaltan, sorumlulukları görünür tutan ve büyümeyi
            baştan hesaba katan çalışma modeli.
          </p>
          <div className="mt-6 grid gap-2">
            {standards.map((standard) => (
              <span key={standard} className="flex items-center gap-2 text-sm text-white/78">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden />
                {standard}
              </span>
            ))}
          </div>
        </div>

        <ol>
          {projectSteps.map((item, index) => (
            <li key={item.title}>
              <span>{index + 1}</span>
              <div>
                <strong className="text-sm font-bold text-white">{item.title}</strong>
                <p>{item.body}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
            </li>
          ))}
        </ol>
      </section>

      <section id="kurumsal-teklif" className="corporate-lead-section">
        <div className="corporate-lead-section__copy">
          <p className="premium-eyebrow">Proje değerlendirmesi</p>
          <h2>İlk teknik çerçeve için temel bilgiler yeterli.</h2>
          <p>
            Lokasyon, araç sayısı ve kullanım modelini paylaşın. Ekibimiz uygun
            mimari, cihaz ve devreye alma planıyla dönüş yapsın.
          </p>
          <ul>
            <li>Kapasite ve güç sınıfı önerisi</li>
            <li>Kurulum kapsamı ve saha gereksinimleri</li>
            <li>İşletim, raporlama ve servis planı</li>
          </ul>
        </div>

        <LeadForm
          compact
          title="Kurumsal proje formu"
          description="Temel proje bilgilerini paylaşın; teknik kapsamı ve sonraki adımı birlikte netleştirelim."
          defaultReason="İş yeri / ofis projesi"
        />
      </section>
    </main>
  );
}
