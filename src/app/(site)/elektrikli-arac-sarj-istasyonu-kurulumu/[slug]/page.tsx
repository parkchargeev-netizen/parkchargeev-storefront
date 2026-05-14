import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getLocationPageBySlug,
  locationPages
} from "@/lib/location-pages";
import { products } from "@/lib/mock-data";
import { absoluteUrl, siteConfig } from "@/lib/site";
import {
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  stringifyJsonLd
} from "@/lib/structured-data";

type LocationServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return locationPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params
}: LocationServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLocationPageBySlug(slug);

  if (!page) {
    return {
      title: "Lokasyon bulunamadı"
    };
  }

  return {
    title: `${page.city} Elektrikli Araç Şarj İstasyonu Kurulumu`,
    description: page.summary,
    alternates: {
      canonical: `/elektrikli-arac-sarj-istasyonu-kurulumu/${page.slug}`
    },
    openGraph: {
      title: `${page.city} EV Şarj Kurulumu`,
      description: page.summary,
      type: "website"
    }
  };
}

export default async function LocationServicePage({
  params
}: LocationServicePageProps) {
  const { slug } = await params;
  const page = getLocationPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const recommendedProducts = products.filter((product) =>
    page.useCases.some((useCase) =>
      `${product.category} ${product.useCases.join(" ")} ${product.summary}`
        .toLocaleLowerCase("tr-TR")
        .includes(useCase.toLocaleLowerCase("tr-TR").split(" ")[0])
    )
  );
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${page.city} elektrikli araç şarj istasyonu kurulumu`,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      telephone: siteConfig.phone
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: page.city
    },
    serviceType: "Elektrikli araç şarj istasyonu kurulumu",
    url: absoluteUrl(`/elektrikli-arac-sarj-istasyonu-kurulumu/${page.slug}`),
    description: page.summary
  };
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Lokasyonlar", path: "/hizmetler" },
    {
      name: `${page.city} Şarj İstasyonu Kurulumu`,
      path: `/elektrikli-arac-sarj-istasyonu-kurulumu/${page.slug}`
    }
  ]);
  const faqJsonLd = getFaqJsonLd(page.faqs);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(faqJsonLd) }}
      />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            {page.region} bölgesi
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.06em] text-on-surface md:text-6xl">
            {page.city} elektrikli araç şarj istasyonu kurulumu
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant">
            {page.summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/iletisim"
              className="rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-white"
            >
              Keşif Talebi Oluştur
            </Link>
            <Link
              href="/urun-secici"
              className="rounded-2xl border border-outline-variant/45 bg-white px-6 py-4 text-sm font-semibold text-primary"
            >
              Ürün Seçiciyi Aç
            </Link>
          </div>
        </div>

        <aside className="surface-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Talep sinyali
          </p>
          <p className="mt-4 text-3xl font-black tracking-[-0.05em] text-on-surface">
            {page.heroMetric}
          </p>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            {page.demandSignal}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {page.districts.map((district) => (
              <span
                key={district}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface"
              >
                {district}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Keşif ve altyapı",
            body: "Pano kapasitesi, faz durumu, kablo güzergahı ve güvenlik bileşenleri kontrol edilir."
          },
          {
            title: "Cihaz ve güç seçimi",
            body: "7.4 kW, 11 kW, 22 kW AC veya DC hızlı şarj seçenekleri kullanım senaryosuna göre netleştirilir."
          },
          {
            title: "Devreye alma ve servis",
            body: "Montaj, test, kullanıcı bilgilendirmesi ve bakım planı tek operasyon akışında tamamlanır."
          }
        ].map((item) => (
          <article key={item.title} className="surface-card p-6">
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-on-surface">
              {item.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 surface-card p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Kullanım senaryoları
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-on-surface">
              {page.city} için önerilen proje tipleri
            </h2>
          </div>
          <Link href="/karsilastir" className="text-sm font-semibold text-primary">
            Ürünleri karşılaştır
          </Link>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {page.useCases.map((useCase) => (
            <div key={useCase} className="rounded-2xl bg-surface-container-low p-4">
              <p className="text-sm font-semibold text-on-surface">{useCase}</p>
              <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                Keşif, enerji hesabı ve cihazlandırma bu senaryoya göre uyarlanır.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-8">
          <h2 className="text-3xl font-black tracking-[-0.05em] text-on-surface">
            Sık sorulan sorular
          </h2>
          <div className="mt-6 space-y-4">
            {page.faqs.map((faq) => (
              <article key={faq.question} className="rounded-2xl bg-surface-container-low p-5">
                <h3 className="text-base font-semibold text-on-surface">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-card p-8">
          <h2 className="text-3xl font-black tracking-[-0.05em] text-on-surface">
            Öne çıkan ürünler
          </h2>
          <div className="mt-6 space-y-4">
            {(recommendedProducts.length > 0 ? recommendedProducts : products.slice(0, 3)).map(
              (product) => (
                <Link
                  key={product.id}
                  href={`/urun/${product.slug}`}
                  className="block rounded-2xl border border-outline-variant/35 bg-white p-4 transition hover:border-primary/30 hover:bg-surface-container-low"
                >
                  <p className="text-sm font-semibold text-on-surface">{product.name}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {product.powerLabel} - {product.category}
                  </p>
                </Link>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
