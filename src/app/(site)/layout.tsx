import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";
import { CartProvider } from "@/components/providers/cart-provider";
import {
  getLocalBusinessJsonLd,
  getOrganizationJsonLd,
  getWebsiteJsonLd
} from "@/lib/structured-data";
import { getPublicSiteNavigation } from "@/server/site/repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicSiteLayout({ children }: { children: ReactNode }) {
  const [navigation, organizationJsonLd, localBusinessJsonLd, websiteJsonLd] =
    await Promise.all([
      getPublicSiteNavigation(),
      getOrganizationJsonLd(),
      getLocalBusinessJsonLd(),
      getWebsiteJsonLd()
    ]);

  return (
    <CartProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <SiteShell navigation={navigation}>{children}</SiteShell>
    </CartProvider>
  );
}
