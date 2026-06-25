import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { PublicSiteNavigation } from "@/features/navigation/domain/public-navigation";

type SiteShellProps = {
  children: ReactNode;
  navigation?: PublicSiteNavigation;
};

export function SiteShell({ children, navigation }: SiteShellProps) {
  return (
    <div className="site-experience-shell">
      <div className="site-scroll-progress" aria-hidden />
      <div className="site-ambient-circuit" data-motion-loop="ambient" aria-hidden>
        <span className="site-ambient-circuit__beam site-ambient-circuit__beam--one" />
        <span className="site-ambient-circuit__beam site-ambient-circuit__beam--two" />
        <span className="site-ambient-circuit__beam site-ambient-circuit__beam--three" />
      </div>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-xl"
      >
        İçeriğe geç
      </a>
      <SiteHeader navigation={navigation?.primary} />
      <div
        id="main-content"
        tabIndex={-1}
        className="site-page-transition relative z-10"
        data-motion-scope
      >
        {children}
      </div>
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
