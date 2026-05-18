import type { Metadata } from "next";

import { LeadForm } from "@/components/forms/lead-form";
import { ManagedPageRenderer } from "@/components/site/managed-page-renderer";
import { globalFaqs, trustMetrics } from "@/lib/mock-data";
import { absoluteUrl, siteConfig } from "@/lib/site";
import {
  getFaqJsonLd,
  getLocalBusinessJsonLd,
  stringifyJsonLd
} from "@/lib/structured-data";
import { getPublishedSitePageBySlug } from "@/server/site/repository";

const fallbackMetadata: Metadata = {
  title: "İletişim",
  description:
    "Keşif, teklif, kurulum, servis ve iş ortaklığı talepleri için ParkChargeEV ile iletişime geçin."
};

const parkChargeEvMapEmbedSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24183.475012350627!2d30.300722122192383!3d40.74146948542449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14ccadf3b93b47db%3A0xaa82c42f614e5ca1!2sSakarya%20Teknokent%20A.%C5%9E.!5e0!3m2!1str!2str!4v1779100960628!5m2!1str!2str";

function officeAddress() {
  return `${siteConfig.address.streetAddress}, ${siteConfig.address.addressLocality} / ${siteConfig.address.addressRegion}`;
}

function ContactJsonLd() {
  const localBusinessJsonLd = getLocalBusinessJsonLd();
  const faqJsonLd = getFaqJsonLd(globalFaqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(faqJsonLd) }}
      />
    </>
  );
}

function OfficeMapCard() {
  const address = officeAddress();

  return (
    <div className="surface-card overflow-hidden p-0">
      <div className="p-6">
        <p className="text-sm uppercase tracking-[0.26em] text-on-surface-variant">
          Adres haritası
        </p>
        <h2 className="mt-3 text-2xl font-bold text-on-surface">Merkez ofis konumu</h2>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">{address}</p>
      </div>
      <iframe
        title="ParkChargeEV Sakarya Teknokent adres haritası"
        src={parkChargeEvMapEmbedSrc}
        width="600"
        height="450"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        data-testid="contact-map-iframe"
        className="h-[320px] w-full border-0"
      />
    </div>
  );
}

function ContactInfoCards() {
  return (
    <div className="grid gap-4">
      <div className="surface-card p-6">
        <p className="text-sm uppercase tracking-[0.26em] text-on-surface-variant">
          Telefon
        </p>
        <p className="mt-3 text-2xl font-bold text-on-surface">
          {siteConfig.phone}
        </p>
      </div>
      <div className="surface-card p-6">
        <p className="text-sm uppercase tracking-[0.26em] text-on-surface-variant">
          E-posta
        </p>
        <p className="mt-3 text-2xl font-bold text-on-surface">
          {siteConfig.email}
        </p>
      </div>
      <div className="surface-card p-6">
        <p className="text-sm uppercase tracking-[0.26em] text-on-surface-variant">
          Merkez Ofis
        </p>
        <p className="mt-3 text-lg font-semibold text-on-surface">{officeAddress()}</p>
      </div>
      <OfficeMapCard />
    </div>
  );
}

function ManagedContactDetails() {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <ContactInfoCards />
      <LeadForm
        title="Teklif, keşif ve destek formu"
        description="Talebinizin türünü seçin; ekip doğru satış veya destek akışıyla size geri dönüş yapsın."
      />
    </section>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedSitePageBySlug("iletisim");

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

export default async function ContactPage() {
  const page = await getPublishedSitePageBySlug("iletisim");

  if (page) {
    return (
      <>
        <ContactJsonLd />
        <ManagedPageRenderer page={page} />
        <ManagedContactDetails />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <ContactJsonLd />

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
            İletişim ve lead yönetimi
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
            Projenizi paylaşın,
            <span className="text-gradient"> doğru çözümü birlikte kuralım</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">
            Bireysel kurulum, kurumsal proje, bakım, bayi adaylığı veya teknik
            destek taleplerinizi aynı iletişim mimarisinde toplayacak sayfa.
          </p>

          <div className="mt-8">
            <ContactInfoCards />
          </div>
        </div>

        <LeadForm
          title="Teklif, keşif ve destek formu"
          description="Talebinizin türünü seçin; ekip doğru satış veya destek akışıyla size geri dönüş yapsın."
        />
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {trustMetrics.map((metric) => (
          <div key={metric.label} className="surface-card p-6">
            <p className="text-sm uppercase tracking-[0.26em] text-on-surface-variant">
              {metric.label}
            </p>
            <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-primary">
              {metric.value}
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {metric.detail}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-secondary">
              Sık sorulan sorular
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-on-surface">
              İletişim öncesi netlik
            </h2>
          </div>
        </div>
        <div className="mt-8 grid gap-4">
          {globalFaqs.map((item) => (
            <article key={item.question} className="surface-card p-6">
              <h3 className="text-xl font-semibold text-on-surface">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
