import type { Metadata } from "next";
import Link from "next/link";

import { ManagedPageRenderer } from "@/components/site/managed-page-renderer";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/ui/page-header";
import { services } from "@/lib/mock-data";
import { serviceCoverageSummary } from "@/lib/service-coverage";
import { absoluteUrl } from "@/lib/site";
import {
  getBreadcrumbJsonLd,
  getServiceCatalogJsonLd
} from "@/lib/structured-data";
import { getPublishedSitePageBySlug } from "@/server/site/repository";

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
        <ManagedPageRenderer page={page} />
      </>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8" data-motion-scope>
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
        body={`Ev kullanıcısından site yönetimine, ofis otoparkından ticari sahaya kadar cihaz, keşif, kurulum ve servis sürecini tek plan içinde yönetiyoruz. ${serviceCoverageSummary.shipping}; ${serviceCoverageSummary.freeSurvey}; ${serviceCoverageSummary.installation}.`}
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {services.map((service, index) => (
          <article
            key={service.id}
            className={index === 1 ? "overflow-hidden rounded-lg bg-primary p-8 text-white" : "surface-card p-8"}
          >
            <h2 className="text-3xl font-bold tracking-normal">
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

      <section className="mt-12 border-y border-outline-variant/35 bg-white py-10">
        <div className="flex flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-primary">Yerel kurulum</p>
            <h2 className="mt-3 text-3xl font-bold text-on-surface">
              Sakarya ve Kocaeli şarj cihazı kurulum hizmetleri
            </h2>
            <p className="mt-4 text-base leading-8 text-on-surface-variant">
              Ev, site ve iş yeri projelerinde araç uyumu, pano kapasitesi, kablo
              hattı ve koruma ekipmanlarını şehir bazlı saha planıyla netleştirin.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sarj-cihazi-kurulumu/sakarya"
              className="premium-btn premium-btn--secondary"
            >
              Sakarya kurulumu
            </Link>
            <Link
              href="/sarj-cihazi-kurulumu/kocaeli"
              className="premium-btn premium-btn--secondary"
            >
              Kocaeli kurulumu
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-12 overflow-hidden rounded-lg border border-outline-variant/35 bg-surface-container-low p-8 lg:p-12">
        <h2 className="text-4xl font-bold tracking-normal text-on-surface">
          Net kurulum süreci
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-on-surface-variant">
          Keşif, projelendirme, profesyonel kurulum ve devreye alma adımlarıyla
          cihazın sahada güvenle çalışmasını sağlıyoruz.
        </p>

        <div className="mt-10 grid gap-5">
          {[
            {
              step: "Adım 01",
              title: "Ücretsiz keşif",
              summary:
                "Türkiye genelinden alınan taleplerde mevcut altyapı, pano mesafesi, enerji kapasitesi ve cihaz lokasyonu ön değerlendirmeye alınır."
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
                "Saha uygunluğu teyit edilen lokasyonlarda standartlara uygun montaj, bağlantı ve kullanıcı eğitimi birlikte tamamlanır."
            },
            {
              step: "Adım 04",
              title: "Test ve devreye alma",
              summary:
                "Sistem güvenlik testlerinden geçirilir, kullanım ve destek süreci net şekilde teslim edilir."
            }
          ].map((item) => (
            <div key={item.step} className="surface-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-normal text-primary">
                    {item.step}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-normal text-on-surface">
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
    </main>
  );
}
