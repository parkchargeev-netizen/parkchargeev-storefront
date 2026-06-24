"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import type { PublicNavigationItem } from "@/features/navigation/domain/public-navigation";
import { formatPublicNavigationLabel } from "@/lib/public-navigation-labels";

type SiteMobileMenuProps = {
  navigation: ReadonlyArray<PublicNavigationItem>;
};

export function SiteMobileMenu({ navigation }: SiteMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = isOpen ? X : Menu;
  const buttonLabel = isOpen ? "Menüyü kapat" : "Menüyü aç";

  return (
    <div className="lg:hidden">
      <button
        id="mobile-menu-toggle"
        type="button"
        aria-label={buttonLabel}
        aria-controls="site-mobile-menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        data-cy="mobile-menu-toggle"
        data-menu-toggle="site"
        data-testid="mobile-menu-toggle"
        title={buttonLabel}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-outline-variant/45 bg-white text-on-surface transition hover:border-primary/35 hover:text-primary"
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          id="site-mobile-menu"
          data-testid="site-mobile-menu"
          className="absolute left-0 top-full w-full border-b border-white/20 bg-slate-950/94 text-white shadow-[0_22px_60px_rgba(15,23,42,0.22)] backdrop-blur-2xl"
        >
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6">
            <nav aria-label="Mobil site menüsü" className="grid grid-cols-2 gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.opensInNewTab ? "_blank" : undefined}
                  rel={item.rel ?? (item.opensInNewTab ? "noopener noreferrer" : undefined)}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/[0.14] px-4 py-3 text-sm font-black text-white/80 transition hover:border-primary/35 hover:text-white"
                >
                  {formatPublicNavigationLabel(item)}
                </Link>
              ))}
            </nav>
            <SiteHeaderActions className="grid grid-cols-2 gap-2 sm:grid-cols-5 [&>*]:w-full" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
