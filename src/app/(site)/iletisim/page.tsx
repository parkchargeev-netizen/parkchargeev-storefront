import type { Metadata } from "next";

import { LeadForm } from "@/components/forms/lead-form";
import { JsonLd } from "@/components/seo/json-ld";
import { resolveContactReason } from "@/lib/contact-reasons";
import { globalFaqs } from "@/lib/mock-data";
import { serviceCoverageSummary } from "@/lib/service-coverage";
import { absoluteUrl } from "@/lib/site";
import type { PublicSiteSettings } from "@/lib/site-settings";
import {
  getFaqJsonLd,
  getLocalBusinessJsonLd
} from "@/lib/structured-data";
import { getPublishedSitePageBySlug } from "@/server/site/repository";
import { getPublicSiteSettings } from "@/server/site/settings";

const fallbackMetadata: Metadata = {
  title: "İletişim",
  description:
    "Keşif, teklif, kurulum, servis ve iş ortaklığı talepleri için ParkChargeEV ile iletişime geçin.",
  alternates: {
    canonical: "/iletisim"
  }
};

const parkChargeEvMapEmbedSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24183.475012350627!2d30.300722122192383!3d40.74146948542449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14ccadf3b93b47db%3A0xaa82c42f614e5ca1!2sSakarya%20Teknokent%20A.%C5%9E.!5e0!3m2!1str!2str!4v1779100960628!5m2!1str!2str";

function officeAddress(settings: PublicSiteSettings) {
  return `${settings.address.streetAddress}, ${settings.address.addressLocality} / ${settings.address.addressRegion}`;
}

type ContactPageProps = {
  searchParams?: Promise<{
    reason?: string;
    konu?: string;
  }>;
};

function getDefaultReason(params?: { reason?: string; konu?: string }) {
  return resolveContactReason(params?.reason ?? params?.konu);
}

function ContactJsonLd({ settings }: { settings: PublicSiteSettings }) {
  const localBusinessJsonLd = getLocalBusinessJsonLd(settings);
  const faqJsonLd = getFaqJsonLd(globalFaqs);

  return <JsonLd data={[localBusinessJsonLd, faqJsonLd]} />;
}

function OfficeMapCard({ settings }: { settings: PublicSiteSettings }) {
  const address = officeAddress(settings);
  const mapSrc = settings.mapEmbedUrl || parkChargeEvMapEmbedSrc;

  return (
    <div className="contact-map-card surface-card overflow-hidden p-0">
      <div className="p-4 lg:p-5">
        <p className="text-xs font-bold uppercase text-on-surface-variant">
          Adres haritası
        </p>
        <h2 className="mt-2 text-xl font-bold text-on-surface">Merkez ofis konumu</h2>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">{address}</p>
      </div>
      <iframe
        title="ParkChargeEV Sakarya Teknokent adres haritası"
        src={mapSrc}
        width="600"
        height="450"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        data-testid="contact-map-iframe"
        className="h-[160px] w-full border-0 lg:h-[180px]"
      />
    </div>
  );
}

function ContactInfoCards({ settings }: { settings: PublicSiteSettings }) {
  return (
    <div className="contact-info-grid grid gap-3">
      <div className="contact-info-card surface-card p-4">
        <p className="text-xs font-bold uppercase text-on-surface-variant">
          Telefon
        </p>
        <p className="mt-2 text-xl font-bold text-on-surface">
          {settings.phone}
        </p>
      </div>
      <div className="contact-info-card surface-card p-4">
        <p className="text-xs font-bold uppercase text-on-surface-variant">
          E-posta
        </p>
        <p className="mt-2 text-xl font-bold text-on-surface">
          {settings.email}
        </p>
      </div>
    </div>
  );
}

function ContactOnePage({
  defaultReason,
  settings
}: {
  defaultReason?: string;
  settings: PublicSiteSettings;
}) {
  return (
    <div className="contact-page contact-page--onepage mx-auto max-w-[92rem] px-4 py-4 sm:px-6 lg:px-8">
      <ContactJsonLd settings={settings} />

      <section className="contact-onepage-shell">
        <div className="contact-onepage-intro">

          <ContactInfoCards settings={settings} />
        </div>

        <LeadForm
          title="Teklif, keşif ve destek formu"
          description="İhtiyacınızı seçin; ürün, keşif veya kurulum adımını hızlıca planlayalım."
          compact
          defaultReason={defaultReason}
        />

        <aside className="contact-onepage-side">
          <OfficeMapCard settings={settings} />
        </aside>
      </section>
    </div>
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

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const defaultReason = getDefaultReason(params);
  const settings = await getPublicSiteSettings();

  return <ContactOnePage defaultReason={defaultReason} settings={settings} />;
}
