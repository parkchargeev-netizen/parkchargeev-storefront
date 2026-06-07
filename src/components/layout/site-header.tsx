import Link from "next/link";
import { BadgeCheck, Bolt, ChevronRight } from "lucide-react";

import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import { SiteMobileMenu } from "@/components/layout/site-mobile-menu";
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
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/72 shadow-[0_10px_38px_rgba(15,23,42,0.07)] backdrop-blur-2xl">
      <div className="hidden border-b border-outline-variant/20 bg-slate-950/90 text-white/72 md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-xs font-bold sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
              PayTR güvenli ödeme
            </span>
            <span>Kurulum + keşif desteği</span>
            <span>Type 2 araç uyumu</span>
          </div>
          <Link href="/iletisim?reason=Hizli%20kesif" className="inline-flex items-center gap-1 text-emerald-300">
            24 saat içinde keşif planı
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="relative mx-auto flex min-h-[68px] w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-2 text-[1.45rem] font-black leading-none text-primary sm:text-[1.6rem]"
          aria-label={`${siteConfig.name} ana sayfa`}
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-primary text-sm font-black text-white shadow-[0_14px_34px_rgba(0,68,211,0.26)]">
            <Bolt className="h-5 w-5" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-secondary-container shadow-[0_0_18px_rgba(107,255,143,0.75)]" />
          </span>
          <span>{siteConfig.name}</span>
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
              className={`rounded-full px-3.5 py-2 transition hover:bg-surface-container-low hover:text-primary ${
                item.href === "/magaza"
                  ? "bg-slate-950 text-white shadow-[0_10px_28px_rgba(15,23,42,0.14)] hover:bg-linear-to-r hover:from-primary hover:via-secondary hover:to-primary-container hover:text-white hover:shadow-[0_14px_34px_rgba(0,68,211,0.26)]"
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
