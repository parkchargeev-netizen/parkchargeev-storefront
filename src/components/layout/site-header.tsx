import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import { SiteMobileMenu } from "@/components/layout/site-mobile-menu";
import { serviceCoverageSummary } from "@/lib/service-coverage";
import { siteConfig } from "@/lib/site";
import type { PublicNavigationItem } from "@/server/site/repository";

type SiteHeaderProps = {
  navigation?: ReadonlyArray<PublicNavigationItem>;
};

const navLabelMap: Record<string, string> = {
  "/": "Ana",
  "/magaza": "Mağaza",
  "/urun-secici": "Seçici",
  "/kurumsal-cozumler": "Kurumsal",
  "/hizmetler": "Kurulum",
  "/blog": "Blog",
  "/iletisim": "İletişim"
};

export function SiteHeader({ navigation = siteConfig.primaryNavigation }: SiteHeaderProps) {
  const visibleNavigation = navigation
    .filter((item) => item.href !== "/karsilastir")
    .slice(0, 7);

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/78 shadow-[0_10px_38px_rgba(6,51,38,0.07)] backdrop-blur-2xl">
      <div className="hidden border-b border-outline-variant/20 bg-[#063326]/95 text-white/74 md:block">
        <div className="mx-auto flex min-h-8 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1 text-xs font-bold sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-[#7eecc9]" aria-hidden />
              PayTR güvenli ödeme
            </span>
            <span>{serviceCoverageSummary.shipping}</span>
            <span>{serviceCoverageSummary.freeSurvey}</span>
            <span>{serviceCoverageSummary.installation}</span>
          </div>
          <Link
            href={`/iletisim?reason=${encodeURIComponent("Ücretsiz keşif talebi")}`}
            className="inline-flex items-center gap-1 text-[#7eecc9]"
          >
            Sakarya keşif talebi
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="relative mx-auto flex min-h-[68px] w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center"
          aria-label={`${siteConfig.name} ana sayfa`}
        >
          <BrandLogo />
        </Link>

        <nav
          aria-label="Birincil navigasyon"
          className="hidden min-w-0 items-center gap-1 rounded-full border border-outline-variant/35 bg-white/76 p-1 text-sm font-black text-on-surface-variant shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] xl:flex"
        >
          {visibleNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.opensInNewTab ? "_blank" : undefined}
              rel={item.rel ?? (item.opensInNewTab ? "noopener noreferrer" : undefined)}
              className={`rounded-full px-3.5 py-2 transition hover:bg-[#e5fff5] hover:text-primary ${
                item.href === "/magaza"
                  ? "bg-[#063326] text-[#7eecc9] shadow-[0_10px_28px_rgba(6,51,38,0.16)] hover:bg-linear-to-r hover:from-[#063326] hover:via-[#0f8f6f] hover:to-[#7eecc9] hover:text-white hover:shadow-[0_14px_34px_rgba(6,51,38,0.24)]"
                  : ""
              }`}
            >
              {navLabelMap[item.href] ?? item.label}
            </Link>
          ))}
        </nav>

        <SiteHeaderActions className="hidden items-center gap-2 lg:flex" />
        <SiteMobileMenu navigation={navigation} />
      </div>
    </header>
  );
}
