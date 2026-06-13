import type { Metadata } from "next";
import Link from "next/link";

import { ManagedPageRenderer } from "@/components/site/managed-page-renderer";
import { services } from "@/lib/mock-data";
import { serviceCoverageSummary } from "@/lib/service-coverage";
import { absoluteUrl } from "@/lib/site";
import { getPublishedSitePageBySlug } from "@/server/site/repository";

const fallbackMetadata: Metadata = {
  title: "Hizmetler",
  description:
    "Şarj ünitesi kurulumu, teknik servis, kurumsal çözümler ve enerji danışmanlığı hizmetleri."
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

  if (page) {
    return <ManagedPageRenderer page={page} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
          Kurulum ve teknik destek
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
          Şarj cihazınızı
          <span className="text-gradient"> güvenli kurulumla tamamlayın</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-on-surface-variant">
          Ev kullanıcısından site yönetimine, ofis otoparkından ticari sahaya kadar
          cihaz, keşif, kurulum ve servis sürecini tek plan içinde yönetiyoruz.
          {` ${serviceCoverageSummary.shipping}; ${serviceCoverageSummary.freeSurvey}; ${serviceCoverageSummary.installation}.`}
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
