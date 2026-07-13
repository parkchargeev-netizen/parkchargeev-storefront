import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { SiteAnnouncementBar } from "@/components/layout/site-announcement-bar";
import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import { SiteMobileMenu } from "@/components/layout/site-mobile-menu";
import { SitePrimaryNavigation } from "@/components/layout/site-primary-navigation";
import type { PublicNavigationItem } from "@/features/navigation/domain/public-navigation";
import { siteConfig } from "@/lib/site";
import type { PublicSiteSettings } from "@/lib/site-settings";

type SiteHeaderProps = {
  navigation?: ReadonlyArray<PublicNavigationItem>;
  settings?: PublicSiteSettings;
};

export function SiteHeader({ navigation = siteConfig.primaryNavigation, settings }: SiteHeaderProps) {
  const visibleNavigation = navigation
    .filter((item) => item.href !== "/karsilastir")
    .slice(0, 7);
  const brandName = settings?.brandName ?? siteConfig.name;

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/78 shadow-[0_10px_38px_rgba(6,51,38,0.07)] backdrop-blur-2xl">
      <SiteAnnouncementBar settings={settings} />
      <div className="relative mx-auto flex min-h-[68px] w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          prefetch={false}
          className="group inline-flex shrink-0 items-center"
          aria-label={`${brandName} ana sayfa`}
        >
          <BrandLogo settings={settings} />
        </Link>

        <SitePrimaryNavigation items={visibleNavigation} />

        <SiteHeaderActions settings={settings} className="hidden items-center gap-2 lg:flex" />
        <SiteMobileMenu navigation={navigation} settings={settings} />
      </div>
    </header>
  );
}
