import type { Metadata } from "next";

import { ManagedPageRenderer } from "@/components/site/managed-page-renderer";
import { testimonials, trustMetrics } from "@/lib/mock-data";
import { absoluteUrl } from "@/lib/site";
import { getPublishedSitePageBySlug } from "@/server/site/repository";

const fallbackMetadata: Metadata = {
  title: "Hakkımızda",
  description:
    "ParkChargeEV'in elektrikli araç şarj cihazı, keşif, kurulum ve teknik destek yaklaşımı."
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedSitePageBySlug("hakkimizda");

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

export default async function AboutPage() {
  const managedPage = await getPublishedSitePageBySlug("hakkimizda");

  if (managedPage) {
    return <ManagedPageRenderer page={managedPage} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-primary">
            ParkChargeEV yaklaşımı
          </p>
          <h1 className="mt-5 text-5xl font-bold tracking-normal text-on-surface">
            ParkChargeEV,
            <span className="text-gradient"> doğru cihazı güvenli kurulumla</span>
            birlikte sunar
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant">
            Amacımız yalnızca wallbox satmak değil; aracınıza, otoparkınıza ve
            elektrik altyapınıza uygun ürünü keşif, kurulum ve teknik destekle
            güvenli bir satın alma deneyimine dönüştürmektir.
          </p>
        </div>

        <aside className="surface-card h-fit p-8">
          <p className="text-sm font-semibold uppercase tracking-normal text-secondary">
            Ne sunuyoruz?
          </p>
          <p className="mt-4 text-3xl font-bold tracking-normal text-on-surface">
            Cihaz + keşif + kurulum
          </p>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            Ev, site, işletme ve ticari lokasyonlar için ürün seçimini teknik
            uygunluk ve satış sonrası destekle birlikte planlayan çözüm modeli.
          </p>
        </aside>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {trustMetrics.map((metric) => (
          <div key={metric.label} className="surface-card p-6">
            <p className="text-sm uppercase tracking-normal text-on-surface-variant">
              {metric.label}
            </p>
            <p className="mt-3 text-4xl font-bold tracking-normal text-primary">
              {metric.value}
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {metric.detail}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Güvenli satın alma",
            body:
              "PayTR güvenli ödeme, açık fiyatlandırma, garanti ve sipariş görünürlüğü her ürün kararının temelidir."
          },
          {
            title: "Teknik uygunluk",
            body:
              "Cihaz seçimi tek başına yeterli değildir; pano, faz, kablo hattı, saha ve büyüme planı birlikte değerlendirilmelidir."
          },
          {
            title: "Karar rehberliği",
            body:
              "Ev kullanıcısı, site yönetimi ve işletme karar vericisi için soruları kısa, net ve uygulanabilir cevaplarla karşılarız."
          }
        ].map((item) => (
          <article key={item.title} className="surface-card p-8">
            <h2 className="text-3xl font-bold tracking-normal text-on-surface">
              {item.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-on-surface-variant">
              {item.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-14">
        <p className="text-sm font-semibold uppercase tracking-normal text-secondary">
          Sosyal kanıt
        </p>
        <h2 className="mt-4 text-4xl font-bold tracking-normal text-on-surface">
          Karar vericilerin duyduğu gerçek ihtiyaçlar
        </h2>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.id} className="surface-card p-8">
              <p className="text-base leading-8 text-on-surface-variant">
                “{item.quote}”
              </p>
              <div className="mt-6 border-t border-outline-variant/30 pt-6">
                <p className="text-lg font-semibold text-on-surface">{item.name}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {item.role} · {item.company}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
