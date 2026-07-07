import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { SiteAnnouncementBar } from "@/components/layout/site-announcement-bar";
import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import { SiteMobileMenu } from "@/components/layout/site-mobile-menu";
import { SitePrimaryNavigation } from "@/components/layout/site-primary-navigation";
import type { PublicNavigationItem } from "@/features/navigation/domain/public-navigation";
import { serviceCoverageSummary } from "@/lib/service-coverage";
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

      <div className="hidden border-b border-outline-variant/20 bg-[#063326]/95 text-white/86 md:block">
        <div className="mx-auto flex min-h-8 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1 text-xs font-bold sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-[#7eecc9]" aria-hidden />
              Güvenli alışveriş
            </span>
            <span>{serviceCoverageSummary.shipping}</span>
            <span>{serviceCoverageSummary.freeSurvey}</span>
            <span>{serviceCoverageSummary.installation}</span>
          </div>
          <Link
            href={`/iletisim?reason=${encodeURIComponent("Ücretsiz keşif talebi")}`}
            prefetch={false}
            className="inline-flex items-center gap-1 text-[#7eecc9]"
          >
            Keşif / teklif al
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>

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
