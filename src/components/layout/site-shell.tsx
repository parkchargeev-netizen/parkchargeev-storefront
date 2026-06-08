import type { ReactNode } from "react";

import { ChargingClickEffect } from "@/components/layout/charging-click-effect";
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
      <SiteAmbientBackground />
      <SiteHeader navigation={navigation?.primary} />
      <main className="site-page-transition relative z-10">{children}</main>
      <ChargingClickEffect />
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
