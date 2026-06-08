import type { ReactNode } from "react";

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
      <div className="site-ambient-background" aria-hidden>
        <span className="site-ambient-background__matrix" />
        <span className="site-ambient-background__sweep site-ambient-background__sweep--one" />
        <span className="site-ambient-background__sweep site-ambient-background__sweep--two" />
        <span className="site-ambient-background__sweep site-ambient-background__sweep--three" />
        <span className="site-ambient-background__connector-trace site-ambient-background__connector-trace--one" />
        <span className="site-ambient-background__connector-trace site-ambient-background__connector-trace--two" />
        <span className="site-ambient-background__connector-trace site-ambient-background__connector-trace--three" />
        <span className="site-ambient-background__data-stream site-ambient-background__data-stream--one" />
        <span className="site-ambient-background__data-stream site-ambient-background__data-stream--two" />
        <span className="site-ambient-background__data-stream site-ambient-background__data-stream--three" />
        <span className="site-ambient-background__aurora site-ambient-background__aurora--one" />
        <span className="site-ambient-background__aurora site-ambient-background__aurora--two" />
        <span className="site-ambient-background__line site-ambient-background__line--one" />
        <span className="site-ambient-background__line site-ambient-background__line--two" />
        <span className="site-ambient-background__line site-ambient-background__line--three" />
        <span className="site-ambient-background__flow site-ambient-background__flow--one" />
        <span className="site-ambient-background__flow site-ambient-background__flow--two" />
        <span className="site-ambient-background__flow site-ambient-background__flow--three" />
        <span className="site-ambient-background__beam site-ambient-background__beam--one" />
        <span className="site-ambient-background__beam site-ambient-background__beam--two" />
        <span className="site-ambient-background__beam site-ambient-background__beam--three" />
        <span className="site-ambient-background__ring site-ambient-background__ring--one" />
        <span className="site-ambient-background__ring site-ambient-background__ring--two" />
        <span className="site-ambient-background__ring site-ambient-background__ring--three" />
        <span className="site-ambient-background__pulse site-ambient-background__pulse--one" />
        <span className="site-ambient-background__pulse site-ambient-background__pulse--two" />
        <span className="site-ambient-background__particle site-ambient-background__particle--one" />
        <span className="site-ambient-background__particle site-ambient-background__particle--two" />
        <span className="site-ambient-background__particle site-ambient-background__particle--three" />
        <span className="site-ambient-background__particle site-ambient-background__particle--four" />
        <span className="site-ambient-background__particle site-ambient-background__particle--five" />
        <span className="site-ambient-background__particle site-ambient-background__particle--six" />
        <span className="site-ambient-background__particle site-ambient-background__particle--seven" />
        <span className="site-ambient-background__particle site-ambient-background__particle--eight" />
        <span className="site-ambient-background__particle site-ambient-background__particle--nine" />
      </div>
      <SiteHeader navigation={navigation?.primary} />
      <main className="site-page-transition relative z-10">{children}</main>
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
