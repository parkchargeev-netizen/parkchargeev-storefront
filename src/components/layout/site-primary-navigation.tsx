"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import type { PublicNavigationItem } from "@/features/navigation/domain/public-navigation";
import { formatPublicNavigationLabel } from "@/lib/public-navigation-labels";

type SitePrimaryNavigationProps = {
  items: ReadonlyArray<PublicNavigationItem>;
};

const navLabelMap: Record<string, string> = {
  "/": "Anasayfa",
  "/magaza": "Mağaza",
  "/urun-secici": "Seçici",
  "/kurumsal-cozumler": "Site & İşletme",
  "/hizmetler": "Kurulum",
  "/blog": "Blog",
  "/iletisim": "İletişim"
};

function isActiveNavigationItem(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SitePrimaryNavigation({ items }: SitePrimaryNavigationProps) {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Birincil navigasyon"
      className="hidden min-w-0 items-center gap-1 rounded-full border border-outline-variant/35 bg-white/76 p-1 text-sm font-bold text-on-surface-variant shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] xl:flex"
    >
      {items.map((item) => {
        const isActive = isActiveNavigationItem(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            target={item.opensInNewTab ? "_blank" : undefined}
            rel={item.rel ?? (item.opensInNewTab ? "noopener noreferrer" : undefined)}
            aria-current={isActive ? "page" : undefined}
            className={clsx(
              "rounded-full px-3.5 py-2 transition hover:bg-[#e5fff5] hover:text-primary",
              isActive &&
                "bg-[#063326] text-[#7eecc9] shadow-[0_10px_28px_rgba(6,51,38,0.16)] hover:bg-linear-to-r hover:from-[#063326] hover:via-[#0f8f6f] hover:to-[#7eecc9] hover:text-white hover:shadow-[0_14px_34px_rgba(6,51,38,0.24)]"
            )}
          >
            {navLabelMap[item.href] ?? formatPublicNavigationLabel(item)}
          </Link>
        );
      })}
    </nav>
  );
}
