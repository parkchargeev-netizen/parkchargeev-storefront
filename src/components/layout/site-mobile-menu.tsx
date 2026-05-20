"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import type { PublicNavigationItem } from "@/server/site/repository";

type SiteMobileMenuProps = {
  navigation: ReadonlyArray<PublicNavigationItem>;
};

export function SiteMobileMenu({ navigation }: SiteMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = isOpen ? X : Menu;
  const buttonLabel = isOpen ? "Menüyü kapat / Close menu" : "Menüyü aç / Open menu";

  return (
    <div className="2xl:hidden">
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
        className="menu-toggle mobile-menu-toggle site-mobile-menu-toggle hamburger hamburger-menu inline-flex h-11 w-11 items-center justify-center rounded-xl border border-outline-variant/45 bg-white text-on-surface transition hover:border-primary/35 hover:text-primary"
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          id="site-mobile-menu"
          data-testid="site-mobile-menu"
          className="absolute left-0 top-full w-full border-b border-outline-variant/40 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.12)]"
        >
          <div className="mx-auto grid max-w-7xl gap-4 px-6 py-5">
            <nav aria-label="Mobil site menüsü" className="grid gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.opensInNewTab ? "_blank" : undefined}
                  rel={item.rel ?? (item.opensInNewTab ? "noopener noreferrer" : undefined)}
                  className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface transition hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <SiteHeaderActions className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
