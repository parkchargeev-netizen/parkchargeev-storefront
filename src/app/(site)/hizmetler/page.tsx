import type { Metadata } from "next";
import Link from "next/link";

import { ManagedPageRenderer } from "@/components/site/managed-page-renderer";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/ui/page-header";
import { services } from "@/lib/mock-data";
import { absoluteUrl } from "@/lib/site";
import {
  getBreadcrumbJsonLd,
  getServiceCatalogJsonLd
} from "@/lib/structured-data";
import { getPublishedSitePageBySlug } from "@/server/site/repository";

const installationSteps = [
  {
    step: "Adım 01",
    title: "Ücretsiz keşif",
    summary:
      "Mevcut altyapı, pano mesafesi, enerji kapasitesi ve cihaz konumu ilk değerlendirmede netleştirilir."
  },
  {
    step: "Adım 02",
    title: "Projelendirme ve planlama",
    summary:
      "Cihaz, kablo hattı, koruma elemanları ve saha uygulama detayları tek kurulum planında toplanır."
  },
  {
    step: "Adım 03",
    title: "Profesyonel kurulum",
    summary:
      "Saha uygunluğu teyit edilen lokasyonlarda montaj, bağlantı ve kullanıcı bilgilendirmesi birlikte tamamlanır."
  },
  {
    step: "Adım 04",
    title: "Test ve devreye alma",
    summary:
      "Sistem güvenlik kontrollerinden geçirilir; kullanım, garanti ve destek süreci açık şekilde teslim edilir."
  }
] as const;

const fallbackMetadata: Metadata = {
  title: "Hizmetler",
  description:
    "Şarj ünitesi kurulumu, teknik servis, kurumsal çözümler ve enerji danışmanlığı hizmetleri.",
  alternates: {
    canonical: "/hizmetler"
  }
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedSitePageBySlug("hizmetler");

  if (!page) {
    return fallbackMetadata;
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt,
    alternates: {
      canonical: page.canonicalUrl || absoluteUrl(`/${page.slug}`)
    },
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.excerpt,
      url: absoluteUrl(`/${page.slug}`),
      images: page.ogImageUrl ? [{ url: page.ogImageUrl }] : undefined
    },
    robots: {
      index: !page.noIndex,
      follow: !page.noIndex
    }
  };
}

export default async function ServicesPage() {
  const page = await getPublishedSitePageBySlug("hizmetler");
  const structuredData = [
    getServiceCatalogJsonLd(services),
    getBreadcrumbJsonLd([
      { name: "Ana Sayfa", path: "/" },
      { name: "Hizmetler", path: "/hizmetler" }
    ])
  ];

  if (page) {
    return (
      <>
        <JsonLd data={structuredData} />
        <ManagedPageRenderer page={page} variant="service" />
      </>
    );
  }

  return (
    <main className="services-page mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8" data-motion-scope>
      <JsonLd data={structuredData} />
      <PageHeader
        align="center"
        eyebrow="Kurulum ve teknik destek"
        title={
          <>
            Şarj cihazınızı
            <span className="text-gradient"> güvenli kurulumla tamamlayın</span>
          </>
        }
        body="Ev, site ve işletme projelerinde doğru cihaz seçimi, keşif, kurulum ve servis sürecini tek plan altında yönetiyoruz. Saha koşullarını netleştirir, uygun güç sınıfını belirler ve teslim sonrası desteği görünür tutarız."
      />

      <div className="services-page__grid mt-12 grid gap-5 md:grid-cols-2">
        {services.map((service, index) => (
          <article
            key={service.id}
            className={index === 1 ? "services-page__card services-page__card--dark" : "services-page__card surface-card"}
          >
            <h2>{service.title}</h2>
            <p className={index === 1 ? "text-white/80" : "text-on-surface-variant"}>
              {service.summary}
            </p>
            <Link
              href={service.href}
              className={index === 1 ? "services-page__link text-white" : "services-page__link text-primary"}
            >
              {service.cta}
            </Link>
          </article>
        ))}
      </div>

      <section className="services-page__local mt-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="services-page__eyebrow">Yerel kurulum</p>
            <h2>Sakarya ve Kocaeli şarj cihazı kurulum hizmetleri</h2>
            <p>
              Ev, site ve iş yeri projelerinde araç uyumu, pano kapasitesi, kablo hattı ve koruma
              ekipmanlarını şehir bazlı saha planıyla netleştirin.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/sarj-cihazi-kurulumu/sakarya" className="premium-btn premium-btn--secondary">
              Sakarya kurulumu
            </Link>
            <Link href="/sarj-cihazi-kurulumu/kocaeli" className="premium-btn premium-btn--secondary">
              Kocaeli kurulumu
            </Link>
          </div>
        </div>
      </section>

      <section className="services-page__process mt-12">
        <h2>Net kurulum süreci</h2>
        <p className="services-page__process-intro">
          Keşif, projelendirme, profesyonel kurulum ve devreye alma adımlarıyla cihazın sahada
          güvenle çalışmasını sağlıyoruz.
        </p>

        <div className="mt-10 grid gap-4">
          {installationSteps.map((item) => (
            <div key={item.step} className="services-page__step surface-card">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p>{item.step}</p>
                  <h3>{item.title}</h3>
                </div>
                <p className="max-w-2xl text-on-surface-variant">{item.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
