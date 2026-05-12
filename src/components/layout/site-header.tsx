import Link from "next/link";

import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import { siteConfig } from "@/lib/site";
import type { PublicNavigationItem } from "@/server/site/repository";

type SiteHeaderProps = {
  navigation?: ReadonlyArray<PublicNavigationItem>;
};

export function SiteHeader({ navigation = siteConfig.primaryNavigation }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/40 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="text-3xl font-black tracking-[-0.06em] text-primary"
        >
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-on-surface-variant xl:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.opensInNewTab ? "_blank" : undefined}
              rel={item.rel ?? (item.opensInNewTab ? "noopener noreferrer" : undefined)}
              className="transition hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <SiteHeaderActions />

        <nav className="flex w-full items-center gap-4 overflow-x-auto pb-1 text-sm font-medium text-on-surface-variant xl:hidden">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.opensInNewTab ? "_blank" : undefined}
              rel={item.rel ?? (item.opensInNewTab ? "noopener noreferrer" : undefined)}
              className="whitespace-nowrap transition hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
