import type { ReactNode } from "react";

import { SiteAmbientBackground } from "@/components/layout/site-ambient-background";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollMotion } from "@/components/layout/scroll-motion";
import type { PublicSiteNavigation } from "@/server/site/repository";

type SiteShellProps = {
  children: ReactNode;
  navigation?: PublicSiteNavigation;
};

export function SiteShell({ children, navigation }: SiteShellProps) {
  return (
    <div className="site-experience-shell">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-xl"
      >
        İçeriğe geç
      </a>
      <SiteAmbientBackground />
      <SiteHeader navigation={navigation?.primary} />
      <main id="main-content" tabIndex={-1} className="site-page-transition relative z-10">
        {children}
      </main>
      <ScrollMotion />
      <SiteFooter
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
