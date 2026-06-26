"use client";

import { Menu, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import type { PublicNavigationItem } from "@/features/navigation/domain/public-navigation";

type SiteMobileMenuProps = {
  navigation: ReadonlyArray<PublicNavigationItem>;
};

const SiteMobileMenuPanel = dynamic(
  () =>
    import("@/components/layout/site-mobile-menu-panel").then(
      (module) => module.SiteMobileMenuPanel
    ),
  {
    ssr: false,
    loading: () => null
  }
);

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
        <SiteMobileMenuPanel
          navigation={navigation}
          onNavigate={() => setIsOpen(false)}
        />
      ) : null}
    </div>
  );
}
