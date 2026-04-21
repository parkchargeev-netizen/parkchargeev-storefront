import Link from "next/link";

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

        <div className="flex items-center gap-3">
          <Link
            href="/sepet"
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-2 text-sm font-medium text-on-surface transition hover:border-primary/30 hover:text-primary"
          >
            Sepetim
          </Link>
          <Link
            href="/iletisim"
            className="rounded-xl border border-primary/15 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/30"
          >
            Teklif Al
          </Link>
          <Link
            href="/giris"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(0,68,211,0.22)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_36px_rgba(0,68,211,0.28)]"
          >
            Giriş Yap
          </Link>
        </div>

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
