import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getLocalBusinessJsonLd,
  getOrganizationJsonLd,
  getWebsiteJsonLd
} from "@/lib/structured-data";
import { getPublicSiteNavigation } from "@/server/site/repository";
import { getPublicSiteSettings } from "@/server/site/settings";

export const revalidate = 300;

export default async function PublicSiteLayout({ children }: { children: ReactNode }) {
  const [navigation, settings] = await Promise.all([
    getPublicSiteNavigation(),
    getPublicSiteSettings()
  ]);
  const organizationJsonLd = getOrganizationJsonLd(settings);
  const localBusinessJsonLd = getLocalBusinessJsonLd(settings);
  const websiteJsonLd = getWebsiteJsonLd(settings);

  if (settings.maintenanceMode) {
    return (
      <>
        <JsonLd data={[organizationJsonLd, localBusinessJsonLd, websiteJsonLd]} />
        <main className="min-h-screen bg-[#061712] px-6 py-16 text-white">
          <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
              ParkChargeEV
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
              Site kisa bir bakimda.
            </h1>
            <p className="mt-5 text-base leading-8 text-emerald-50/80 md:text-lg">
              {settings.maintenanceMessage ||
                "Elektrikli arac sarj cozumleri platformumuzu daha iyi bir deneyim icin guncelliyoruz. Kisa sure sonra tekrar yayinda olacagiz."}
            </p>
            <div className="mt-8 rounded-lg border border-white/10 bg-white/10 p-5 text-sm leading-7 text-emerald-50/80">
              Acil kurulum, teklif veya destek talepleri icin {settings.phone} ve {settings.email}
              uzerinden bize ulasabilirsiniz.
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <JsonLd data={[organizationJsonLd, localBusinessJsonLd, websiteJsonLd]} />
      <SiteShell navigation={navigation} settings={settings}>{children}</SiteShell>
    </>
  );
}
