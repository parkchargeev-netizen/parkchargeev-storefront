import type { ReactNode } from "react";

import { SiteAmbientLayer } from "@/components/layout/site-ambient-layer";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteSocialQuickLinks } from "@/components/layout/site-social-quick-links";
import { ProductCardMediaRuntime } from "@/components/shop/product-card-media-runtime";
import { ProductCompareRuntime } from "@/components/shop/product-compare-runtime";
import type { PublicSiteNavigation } from "@/features/navigation/domain/public-navigation";
import type { PublicSiteSettings } from "@/lib/site-settings";

type SiteShellProps = {
  children: ReactNode;
  navigation?: PublicSiteNavigation;
  settings?: PublicSiteSettings;
};

export function SiteShell({ children, navigation, settings }: SiteShellProps) {
  return (
    <div className="site-experience-shell">
      <div className="site-scroll-progress" aria-hidden />
      <SiteAmbientLayer />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-xl"
      >
        İçeriğe geç
      </a>
      <SiteHeader navigation={navigation?.primary} settings={settings} />
      <div
        id="main-content"
        tabIndex={-1}
        className="site-page-transition relative z-10"
        data-motion-scope
      >
        {children}
      </div>
      <SiteSocialQuickLinks settings={settings} />
      <ProductCardMediaRuntime />
      <ProductCompareRuntime />
      <SiteFooter
        settings={settings}
        navigation={
          navigation
            ? {
                footer: navigation.footer,
                legal: navigation.legal
              }
            : undefined
        }
      />
    </div>
  );
}
