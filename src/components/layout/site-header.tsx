import Link from "next/link";

import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
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
          {siteConfig.primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <SiteHeaderActions />

        <nav className="flex w-full items-center gap-4 overflow-x-auto pb-1 text-sm font-medium text-on-surface-variant xl:hidden">
          {siteConfig.primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
