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
    <>
      <SiteHeader navigation={navigation?.primary} />
      <main>{children}</main>
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
    </>
  );
}
