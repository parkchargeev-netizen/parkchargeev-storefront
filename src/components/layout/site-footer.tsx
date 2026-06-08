import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { serviceCoverageSummary } from "@/lib/service-coverage";
import { siteConfig } from "@/lib/site";
import type { PublicSiteNavigation } from "@/server/site/repository";

type SiteFooterProps = {
  navigation?: Pick<PublicSiteNavigation, "footer" | "legal">;
};

export function SiteFooter({
  navigation = {
    footer: siteConfig.footerNavigation,
    legal: siteConfig.legalNavigation
  }
}: SiteFooterProps) {
  return (
    <footer className="border-t border-outline-variant/40 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <BrandLogo />
            <p className="mt-4 max-w-xl text-sm leading-7 text-on-surface-variant">
              Ev, site, işletme ve ticari lokasyonlar için elektrikli araç şarj
              cihazı, keşif, kurulum ve teknik destek çözümleri.
            </p>
            <div className="mt-6 space-y-2 text-sm text-on-surface-variant">
              <p>{siteConfig.phone}</p>
              <p>{siteConfig.email}</p>
              <p>
                {serviceCoverageSummary.shipping} · {serviceCoverageSummary.freeSurvey} ·{" "}
                {serviceCoverageSummary.installation}
              </p>
              <p>
                {siteConfig.address.streetAddress}, {siteConfig.address.addressLocality} /{" "}
                {siteConfig.address.addressRegion}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Navigasyon
            </p>
            <div className="mt-5 grid gap-3 text-sm text-on-surface-variant">
              {navigation.footer.map((item) => (
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
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Destek
            </p>
            <div className="mt-5 grid gap-3 text-sm text-on-surface-variant">
              {navigation.legal.map((item) => (
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
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Hizmet kapsamı
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {siteConfig.serviceAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-outline-variant/35 pt-6 text-sm text-on-surface-variant">
          © 2026 {siteConfig.name}. Güvenli şarj ürünleri, keşif ve kurulum çözümleri.
        </div>
      </div>
    </footer>
  );
}
