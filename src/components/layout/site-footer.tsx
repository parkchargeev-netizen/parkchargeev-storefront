import Link from "next/link";
import { ArrowRight, ExternalLink, Headphones, MapPin, Phone } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import type { PublicSiteNavigation } from "@/features/navigation/domain/public-navigation";
import { formatPublicNavigationLabel } from "@/lib/public-navigation-labels";
import { serviceCoverageSummary } from "@/lib/service-coverage";
import { siteConfig } from "@/lib/site";
import { getFallbackSiteSettings, type PublicSiteSettings } from "@/lib/site-settings";

type SiteFooterProps = {
  navigation?: Pick<PublicSiteNavigation, "footer" | "legal">;
  settings?: PublicSiteSettings;
};

function normalizeExternalHref(value?: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "";
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function SiteFooter({
  navigation = {
    footer: siteConfig.footerNavigation,
    legal: siteConfig.legalNavigation
  },
  settings
}: SiteFooterProps) {
  const publicSettings = settings ?? getFallbackSiteSettings();
  const socialLinks = [
    { key: "instagram", label: "Instagram", href: normalizeExternalHref(publicSettings.socials.instagram) },
    { key: "facebook", label: "Facebook", href: normalizeExternalHref(publicSettings.socials.facebook) },
    { key: "linkedin", label: "LinkedIn", href: normalizeExternalHref(publicSettings.socials.linkedin) },
    { key: "youtube", label: "YouTube", href: normalizeExternalHref(publicSettings.socials.youtube) }
  ].filter((item) => item.href);

  return (
    <footer className="site-footer border-t border-outline-variant/40 bg-white" data-motion-scope>
      <div className="site-footer__project bg-[#063326] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase text-emerald-300">Proje masası</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">
              Şarj altyapınızı ürün, kurulum ve servis planıyla birlikte kuralım.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/iletisim?reason=Kurumsal%20teklif"
              className="premium-btn premium-btn--primary"
            >
              Proje teklifi al
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/urun-secici" className="premium-btn premium-btn--glass">
              Ürün seçici
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <BrandLogo settings={publicSettings} />
            <p className="mt-4 max-w-xl text-sm leading-7 text-on-surface-variant">
              {publicSettings.description}
            </p>
            <div className="mt-6 space-y-3 text-sm text-on-surface-variant">
              <a
                href={`tel:${publicSettings.phone}`}
                className="flex items-center gap-2 transition hover:text-primary"
              >
                <Phone className="h-4 w-4" aria-hidden />
                {publicSettings.phone}
              </a>
              <a
                href={`mailto:${publicSettings.email}`}
                className="flex items-center gap-2 transition hover:text-primary"
              >
                <Headphones className="h-4 w-4" aria-hidden />
                {publicSettings.email}
              </a>
              <p>
                {serviceCoverageSummary.shipping} · {serviceCoverageSummary.freeSurvey} ·{" "}
                {serviceCoverageSummary.installation}
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {publicSettings.address.streetAddress},{" "}
                  {publicSettings.address.addressLocality} /{" "}
                  {publicSettings.address.addressRegion}
                </span>
              </p>
            </div>

            {socialLinks.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-normal text-primary">
                  Sosyal medya
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialLinks.map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${publicSettings.brandName} ${item.label} hesabını aç`}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:text-primary hover:shadow-sm"
                    >
                      {item.label}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase text-primary">Navigasyon</p>
            <div className="mt-5 grid gap-3 text-sm text-on-surface-variant">
              {navigation.footer.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.opensInNewTab ? "_blank" : undefined}
                  rel={item.rel ?? (item.opensInNewTab ? "noopener noreferrer" : undefined)}
                  className="transition hover:text-primary"
                >
                  {formatPublicNavigationLabel(item)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase text-primary">Destek</p>
            <div className="mt-5 grid gap-3 text-sm text-on-surface-variant">
              {navigation.legal.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.opensInNewTab ? "_blank" : undefined}
                  rel={item.rel ?? (item.opensInNewTab ? "noopener noreferrer" : undefined)}
                  className="transition hover:text-primary"
                >
                  {formatPublicNavigationLabel(item)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase text-primary">Bilgi ve bölgeler</p>
            <div className="mt-5 grid gap-3 text-sm text-on-surface-variant">
              <Link href="/elektrikli-arac-sarj-rehberi" className="transition hover:text-primary">
                Elektrikli araç şarj rehberi
              </Link>
              <Link href="/elektrikli-arac-sarj-sozlugu" className="transition hover:text-primary">
                EV şarj sözlüğü
              </Link>
              <Link href="/sarj-cihazi-kurulumu/sakarya" className="transition hover:text-primary">
                Sakarya şarj cihazı kurulumu
              </Link>
              <Link href="/sarj-cihazi-kurulumu/kocaeli" className="transition hover:text-primary">
                Kocaeli şarj cihazı kurulumu
              </Link>
            </div>
            <p className="mt-7 text-sm font-semibold uppercase text-primary">Hizmet kapsamı</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {publicSettings.serviceAreas.map((area) => (
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

        <div className="mt-10 flex flex-col gap-3 border-t border-outline-variant/35 pt-6 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
          <span>
            © 2026 {publicSettings.brandName}. Güvenli şarj ürünleri, keşif ve kurulum çözümleri.
          </span>
          <span>
            Bu site{" "}
            <a
              href="https://digicoreyazilim.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary underline-offset-4 transition hover:text-secondary hover:underline"
            >
              Digicore Yazılım
            </a>{" "}
            tarafından yapılmıştır.
          </span>
        </div>
      </div>
    </footer>
  );
}
