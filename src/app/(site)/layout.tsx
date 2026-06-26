import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getLocalBusinessJsonLd,
  getOrganizationJsonLd,
  getWebsiteJsonLd
} from "@/lib/structured-data";
import { getPublicSiteNavigation } from "@/server/site/repository";

export const revalidate = 300;

export default async function PublicSiteLayout({ children }: { children: ReactNode }) {
  const [navigation, organizationJsonLd, localBusinessJsonLd, websiteJsonLd] =
    await Promise.all([
      getPublicSiteNavigation(),
      getOrganizationJsonLd(),
      getLocalBusinessJsonLd(),
      getWebsiteJsonLd()
    ]);

  return (
    <>
      <JsonLd data={[organizationJsonLd, localBusinessJsonLd, websiteJsonLd]} />
      <SiteShell navigation={navigation}>{children}</SiteShell>
    </>
  );
}
