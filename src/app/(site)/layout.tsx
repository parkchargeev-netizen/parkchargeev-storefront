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

  return (
    <>
      <JsonLd data={[organizationJsonLd, localBusinessJsonLd, websiteJsonLd]} />
      <SiteShell navigation={navigation} settings={settings}>{children}</SiteShell>
    </>
  );
}
