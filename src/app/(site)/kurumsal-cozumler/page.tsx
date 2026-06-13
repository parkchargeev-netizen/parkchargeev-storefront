import type { Metadata } from "next";
import { CheckCircle2, ClipboardCheck, Gauge, Wrench } from "lucide-react";

import { LeadForm } from "@/components/forms/lead-form";
import { SolutionCard } from "@/components/solutions/solution-card";
import { solutionPages } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Kurumsal Çözümler",
  description:
    "Site, apartman, iş yeri, ofis, filo ve otopark projeleri için kurumsal EV şarj altyapısı çözümleri."
};

const projectBenefits = [
  {
    icon: Gauge,
    title: "Kapasite planı",
    body: "Mevcut güç, araç sayısı ve büyüme ihtiyacı birlikte değerlendirilir."
  },
  {
    icon: ClipboardCheck,
    title: "Net teklif",
    body: "Cihaz, altyapı, kurulum ve servis kalemleri ayrı gösterilir."
  },
  {
    icon: Wrench,
    title: "Planlı devreye alma",
    body: "Keşiften teslimata kadar tek teknik akışla ilerlenir."
  }
] as const;

const projectSteps = [
  "İhtiyacı ve lokasyonu paylaşın",
  "Teknik kapasiteyi birlikte değerlendirelim",
  "Ürün, saha ve servis teklifini netleştirelim",
  "Kurulum ve devreye alma planını başlatalım"
] as const;

export default function CorporateSolutionsPage() {
  return (
    <main className="corporate-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="corporate-hero">
        <div className="corporate-hero__copy">
          <p className="premium-eyebrow">Kurumsal şarj çözümleri</p>
          <h1>Site, ofis ve otoparklar için ölçeklenebilir şarj altyapısı.</h1>
          <p>
            Cihaz seçimini, elektrik altyapısını ve kurulum sürecini tek proje
            planında netleştirin.
          </p>
          <a href="#kurumsal-teklif" className="premium-btn premium-btn--primary">
            Projeyi Değerlendir
          </a>
        </div>

        <div className="corporate-benefits" aria-label="Kurumsal proje avantajları">
          {projectBenefits.map((item) => {
            const Icon = item.icon;

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

      <section className="corporate-section">
        <div className="corporate-section__heading">
          <div>
            <p className="premium-eyebrow">Kullanım senaryoları</p>
            <h2>Projenize uygun çözüm yolunu seçin.</h2>
          </div>
          <p>
            Site yönetimi, iş yeri ve filo projeleri için karar kriterleri ayrı
            ele alınır.
          </p>
        </div>

        <div className="corporate-solution-grid">
          {solutionPages.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>
      </section>

      <section className="corporate-process">
        <div>
          <p className="premium-eyebrow text-emerald-300">Teklif süreci</p>
          <h2>Dört adımda uygulanabilir proje planı.</h2>
          <p>Teknik belirsizliği azaltan kısa ve ölçülebilir bir süreç.</p>
        </div>

        <ol>
          {projectSteps.map((item, index) => (
            <li key={item}>
              <span>{index + 1}</span>
              <p>{item}</p>
              <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden />
            </li>
          ))}
        </ol>
      </section>

      <section id="kurumsal-teklif" className="corporate-lead-section">
        <div className="corporate-lead-section__copy">
          <p className="premium-eyebrow">Projenizi paylaşın</p>
          <h2>İlk değerlendirme için temel bilgiler yeterli.</h2>
          <p>
            Lokasyon, araç sayısı ve kullanım modelini iletin. Ekibimiz uygun
            cihaz ve altyapı planıyla dönüş yapsın.
          </p>
          <ul>
            <li>İhtiyaca uygun güç ve cihaz önerisi</li>
            <li>Kurulum kapsamı ve saha gereksinimleri</li>
            <li>Servis ve büyüme planı</li>
          </ul>
        </div>

        <LeadForm
          compact
          title="Kurumsal teklif formu"
          description="Projenizin temel bilgilerini paylaşın; teknik kapsamı birlikte netleştirelim."
          defaultReason="İş yeri / ofis projesi"
        />
      </section>
    </main>
  );
}
