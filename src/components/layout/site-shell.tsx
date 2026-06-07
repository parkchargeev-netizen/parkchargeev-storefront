import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { PublicSiteNavigation } from "@/server/site/repository";

type SiteShellProps = {
  children: ReactNode;
  navigation?: PublicSiteNavigation;
};

export function SiteShell({ children, navigation }: SiteShellProps) {
  return (
    <div className="site-experience-shell">
      <div className="site-ambient-background" aria-hidden>
        <span className="site-ambient-background__line site-ambient-background__line--one" />
        <span className="site-ambient-background__line site-ambient-background__line--two" />
        <span className="site-ambient-background__pulse site-ambient-background__pulse--one" />
        <span className="site-ambient-background__pulse site-ambient-background__pulse--two" />
      </div>
      <SiteHeader navigation={navigation?.primary} />
      <main className="relative z-10">{children}</main>
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
