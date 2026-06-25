import type { Metadata } from "next";
import { ArrowUpRight, BookOpen, Calculator, Cable, Gauge, Wrench } from "lucide-react";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/ui/page-header";
import { evGuideClusters } from "@/features/seo/domain/ev-charging-content";
import { absoluteUrl } from "@/lib/site";
import { getBreadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Elektrikli Araç Şarj Rehberi",
  description:
    "Elektrikli araç şarj cihazı seçimi, 7.4 kW, 11 kW, 22 kW, evde kurulum, şarj maliyeti, Type 2, CCS2, AC ve DC şarj rehberleri.",
  alternates: {
    canonical: "/elektrikli-arac-sarj-rehberi"
  },
  openGraph: {
    title: "Elektrikli Araç Şarj Rehberi | ParkChargeEV",
    description:
      "EV şarj cihazı, güç, maliyet, kurulum, konnektör ve kurumsal altyapı kararları için kapsamlı bilgi merkezi.",
    url: "/elektrikli-arac-sarj-rehberi",
    type: "website"
  }
};

const decisionPath = [
  {
    icon: Cable,
    title: "Araç uyumunu doğrulayın",
    description:
      "Konnektör tipini ve aracın kabul ettiği azami AC gücü kontrol edin."
  },
  {
    icon: Gauge,
    title: "Gerçek güç ihtiyacını belirleyin",
    description:
      "Günlük kilometre, park süresi ve elektrik altyapısını birlikte değerlendirin."
  },
  {
    icon: Wrench,
    title: "Kurulumu ürünle birlikte planlayın",
    description:
      "Pano, kablo hattı, koruma ekipmanları ve montaj alanını keşifle netleştirin."
  }
];

export default function EvChargingGuidePage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl("/elektrikli-arac-sarj-rehberi#collection"),
    name: "Elektrikli Araç Şarj Rehberi",
    description: metadata.description,
    url: absoluteUrl("/elektrikli-arac-sarj-rehberi"),
    inLanguage: "tr-TR",
    about: evGuideClusters.flatMap((cluster) => cluster.keywords),
    hasPart: evGuideClusters.map((cluster) => ({
      "@type": "WebPage",
      name: cluster.title,
      description: cluster.description,
      url: absoluteUrl(cluster.href)
    }))
  };
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Elektrikli Araç Şarj Rehberi", path: "/elektrikli-arac-sarj-rehberi" }
  ]);

  return (
    <main data-motion-scope>
      <JsonLd data={[collectionJsonLd, breadcrumbJsonLd]} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <PageHeader
          align="center"
          eyebrow="EV şarj bilgi merkezi"
          title="Elektrikli araç şarj cihazı hakkında doğru kararı tek merkezden verin"
          body="Elektrikli araç şarj aleti fiyatından ev tipi wallbox kurulumuna, 11 kW ve 22 kW farkından Type 2 ve CCS2 bağlantılarına kadar satın alma ve proje kararlarını sadeleştiren teknik rehberler."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {decisionPath.map((item) => (
            <article
              key={item.title}
              className="border-t-2 border-primary bg-surface-container-low p-6"
            >
              <item.icon className="h-6 w-6 text-primary" aria-hidden />
              <h2 className="mt-5 text-xl font-bold text-on-surface">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-outline-variant/35 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="premium-eyebrow">Konu kümeleri</p>
              <h2 className="mt-3 text-3xl font-bold text-on-surface md:text-4xl">
                Arama niyetine göre EV şarj rehberleri
              </h2>
              <p className="mt-4 text-base leading-8 text-on-surface-variant">
                Her başlık, kullanıcıların satın alma, kurulum veya teknik bilgi
                ararken sorduğu belirli bir soruyu yanıtlar.
              </p>
            </div>
            <Link
              href="/elektrikli-arac-sarj-sozlugu"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              EV şarj sözlüğü
            </Link>
          </div>

          <div className="mt-9 grid gap-x-8 gap-y-10 md:grid-cols-2">
            {evGuideClusters.map((cluster) => (
              <article key={cluster.href} className="border-t border-outline-variant/50 pt-6">
                <h3 className="text-2xl font-bold text-on-surface">{cluster.title}</h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  {cluster.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {cluster.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface-variant"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <Link
                  href={cluster.href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary"
                >
                  Rehberi incele
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <div>
          <p className="premium-eyebrow">Satın alma kararı</p>
          <h2 className="mt-3 text-3xl font-bold text-on-surface md:text-4xl">
            En yüksek güç değil, doğru eşleşme daha değerlidir
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-on-surface-variant">
            Şarj hızını yalnızca cihaz belirlemez. Aracın dahili şarj ünitesi,
            tesisatın faz ve güç kapasitesi, günlük enerji ihtiyacı ve park süresi
            birlikte değerlendirilmelidir. Bu nedenle ürün sayfasından önce karar
            rehberini, siparişten önce de kurulum kapsamını kontrol edin.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/urun-secici" className="premium-btn premium-btn--primary">
              Ürün seçici
            </Link>
            <Link href="/magaza" className="premium-btn premium-btn--secondary">
              Şarj cihazlarını karşılaştır
            </Link>
          </div>
        </div>

        <aside className="border-l-4 border-secondary bg-surface-container-low p-7">
          <Calculator className="h-7 w-7 text-secondary" aria-hidden />
          <h2 className="mt-5 text-2xl font-bold text-on-surface">
            Şarj maliyetini hesaplarken
          </h2>
          <p className="mt-3 text-sm leading-7 text-on-surface-variant">
            Bataryaya eklenecek enerji, şarj kaybı ve güncel elektrik birim
            fiyatını birlikte kullanın. Sabit bir fiyat vermek yerine her tarife
            değişiminde güncellenebilen formülü esas alın.
          </p>
          <Link
            href="/blog/elektrikli-arac-sarj-maliyeti-hesaplama"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary"
          >
            Maliyet hesabını öğren
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </aside>
      </section>
    </main>
  );
}
