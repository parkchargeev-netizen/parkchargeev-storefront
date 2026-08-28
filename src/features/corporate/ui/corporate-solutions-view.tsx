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
          <p className="premium-eyebrow">Site ve işletme şarj altyapısı</p>
          <h1>Lokasyonunuzu yönetilebilir bir şarj operasyonuna dönüştürün.</h1>
          <p>
            Apartman, site, ofis, otel, filo ve ticari otopark projelerinde kapasiteyi, kullanıcı
            yönetimini, servis modelini ve yatırım geri dönüşünü sade bir teknik planla netleştiriyoruz.
          </p>
          <div className="corporate-hero__actions">
            <a href="#kurumsal-teklif" className="premium-btn premium-btn--primary">
              Projeyi değerlendirin
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link href="/kurumsal-cozumler/site-ve-apartman" className="btn-secondary">
              Örnek çözümü incele
            </Link>
          </div>
        </div>

        <div className="corporate-hero__panel" aria-label="Kurumsal proje yetkinlikleri">
          <div className="corporate-panel-card corporate-panel-card--featured">
            <span>Planlama standardı</span>
            <strong>Keşif + kapasite + cihaz + servis</strong>
            <p>Teklif öncesinde saha gereksinimleri ve işletim modeli aynı çerçevede netleşir.</p>
          </div>
          <div className="corporate-benefits">
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
        </div>
      </section>

      <section className="corporate-metrics" aria-label="Kurumsal çözüm standartları">
        {metrics.map((metric) => (
          <div key={metric.label} className="corporate-metric-card">
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </section>

      <section className="corporate-section">
        <div className="corporate-section__heading">
          <div>
            <p className="premium-eyebrow">Çözüm alanları</p>
            <h2>İşletim modelinize uygun şarj altyapısını seçin.</h2>
          </div>
          <p>
            Her senaryo kapasite, kullanıcı yönetimi, raporlama, ödeme akışı ve servis gereksinimleriyle
            ayrı değerlendirilir.
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
          <h2>Karardan devreye almaya kadar dört kontrollü aşama.</h2>
          <p>
            Teknik belirsizliği azaltan, sorumlulukları görünür tutan ve büyümeyi baştan hesaba katan
            bir çalışma modeli.
          </p>
          <div className="corporate-standard-list">
            {standards.map((standard) => (
              <span key={standard}>
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
                <strong>{item.title}</strong>
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
            Lokasyon, araç sayısı ve kullanım modelini paylaşın. Ekibimiz uygun mimari, cihaz ve devreye
            alma planıyla dönüş yapsın.
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
