import type { Metadata } from "next";
import { CheckCircle2, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/ui/page-header";
import {
  getInstallationLocation,
  installationLocations
} from "@/features/seo/domain/ev-charging-content";
import {
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getLocalInstallationServiceJsonLd
} from "@/lib/structured-data";

type InstallationCityPageProps = {
  params: Promise<{ city: string }>;
};

export function generateStaticParams() {
  return installationLocations.map((location) => ({ city: location.slug }));
}

export async function generateMetadata({
  params
}: InstallationCityPageProps): Promise<Metadata> {
  const { city } = await params;
  const location = getInstallationLocation(city);

  if (!location) {
    return { title: "Kurulum bölgesi bulunamadı" };
  }

  return {
    title: location.title,
    description: location.description,
    alternates: {
      canonical: `/sarj-cihazi-kurulumu/${location.slug}`
    },
    openGraph: {
      title: `${location.title} | ParkChargeEV`,
      description: location.description,
      url: `/sarj-cihazi-kurulumu/${location.slug}`,
      type: "website"
    }
  };
}

export default async function InstallationCityPage({
  params
}: InstallationCityPageProps) {
  const { city } = await params;
  const location = getInstallationLocation(city);

  if (!location) {
    notFound();
  }

  const path = `/sarj-cihazi-kurulumu/${location.slug}`;
  const structuredData = [
    getLocalInstallationServiceJsonLd({
      city: location.city,
      path,
      description: location.description
    }),
    getBreadcrumbJsonLd([
      { name: "Ana Sayfa", path: "/" },
      { name: "Hizmetler", path: "/hizmetler" },
      { name: location.title, path }
    ]),
    getFaqJsonLd(location.faqs)
  ];

  return (
    <main data-motion-scope>
      <JsonLd data={structuredData} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <PageHeader
          align="center"
          eyebrow={`${location.city} keşif ve kurulum`}
          title={location.title}
          body={location.introduction}
        />

        <div className="mt-9 flex flex-wrap justify-center gap-2">
          {location.districts.map((district) => (
            <span
              key={district}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface"
            >
              <MapPin className="h-4 w-4 text-primary" aria-hidden />
              {district}
            </span>
          ))}
        </div>
      </section>

      <section className="border-y border-outline-variant/35 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="premium-eyebrow">Yerel hizmet yaklaşımı</p>
              <h2 className="mt-3 text-3xl font-bold text-on-surface">
                Cihaz ve tesisat aynı planın parçasıdır
              </h2>
              <p className="mt-4 text-base leading-8 text-on-surface-variant">
                {location.localContext}
              </p>
            </div>
            <div className="grid gap-5">
              {location.process.map((item, index) => (
                <article
                  key={item.title}
                  className="grid gap-4 border-t border-outline-variant/45 pt-5 sm:grid-cols-[auto_1fr]"
                >
                  <span className="text-sm font-bold text-primary">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="premium-eyebrow">Kurulum kapsamı</p>
            <h2 className="mt-3 text-3xl font-bold text-on-surface">
              Keşifte kontrol edilen temel başlıklar
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Araç bağlantı tipi ve AC kabul gücü",
                "Pano ve abonelik kapasitesi",
                "Monofaze veya trifaze yapı",
                "Kablo mesafesi ve güzergahı",
                "Kaçak akım ve aşırı akım koruması",
                "İç veya dış ortam montaj koşulları",
                "Çok kullanıcılı sahalarda yetkilendirme",
                "Gelecekteki cihaz sayısı ve yük yönetimi"
              ].map((item) => (
                <p
                  key={item}
                  className="flex items-start gap-3 bg-surface-container-low p-4 text-sm leading-6 text-on-surface"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <aside className="bg-primary p-8 text-white">
            <h2 className="text-3xl font-bold">Kurulum talebinizi oluşturun</h2>
            <p className="mt-4 text-base leading-8 text-white/80">
              Araç modeli, otopark tipi ve şehir bilgisini paylaşın. Cihaz ile
              kurulum kalemlerini ayrı gösteren uygunluk planını birlikte
              netleştirelim.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/iletisim?reason=${encodeURIComponent(`${location.city} şarj cihazı kurulumu`)}`}
                className="premium-btn premium-btn--glass"
              >
                Kurulum talebi
              </Link>
              <Link href="/magaza" className="premium-btn premium-btn--primary">
                Ürünleri incele
              </Link>
            </div>
          </aside>
        </div>

        <section className="mt-12 border-t border-outline-variant/45 pt-10">
          <h2 className="text-3xl font-bold text-on-surface">Sık sorulan sorular</h2>
          <div className="mt-6 divide-y divide-outline-variant/40 border-y border-outline-variant/40">
            {location.faqs.map((faq) => (
              <details key={faq.question} className="py-1">
                <summary className="cursor-pointer py-5 text-base font-bold text-on-surface">
                  {faq.question}
                </summary>
                <p className="max-w-4xl pb-5 text-sm leading-7 text-on-surface-variant">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
