import Link from "next/link";

import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import { SiteMobileMenu } from "@/components/layout/site-mobile-menu";
import { siteConfig } from "@/lib/site";
import type { PublicNavigationItem } from "@/server/site/repository";

type SiteHeaderProps = {
  navigation?: ReadonlyArray<PublicNavigationItem>;
};

export function SiteHeader({ navigation = siteConfig.primaryNavigation }: SiteHeaderProps) {
  const visibleNavigation = navigation.filter((item) => item.href !== "/");

  return (
    <header className="sticky top-0 z-50 border-b border-white/55 bg-white/78 shadow-[0_10px_36px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="relative mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-[1.65rem] font-black leading-none text-primary"
          aria-label={`${siteConfig.name} ana sayfa`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-sm font-black text-white shadow-[0_14px_34px_rgba(0,68,211,0.26)]">
            EV
          </span>
          <span>{siteConfig.name}</span>
        </Link>

        <nav
          aria-label="Birincil navigasyon"
          className="hidden min-w-0 items-center gap-1 rounded-2xl border border-outline-variant/35 bg-white/70 p-1 text-sm font-bold text-on-surface-variant lg:flex"
        >
          <Link href="/" className="rounded-xl px-3 py-2 transition hover:bg-surface-container-low hover:text-primary">
            Ana Sayfa
          </Link>
          {visibleNavigation.slice(0, 6).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.opensInNewTab ? "_blank" : undefined}
              rel={item.rel ?? (item.opensInNewTab ? "noopener noreferrer" : undefined)}
              className="rounded-xl px-3 py-2 transition hover:bg-surface-container-low hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <SiteHeaderActions className="hidden items-center gap-2 lg:flex" />
        <SiteMobileMenu navigation={navigation} />
      </div>
    </header>
  );
}
