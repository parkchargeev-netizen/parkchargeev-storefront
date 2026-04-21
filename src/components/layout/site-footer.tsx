import Link from "next/link";

import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/40 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <p className="text-2xl font-black tracking-[-0.05em] text-on-surface">
              {siteConfig.name}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-on-surface-variant">
              Elektrikli araç şarj istasyonu ürünleri, kurulum hizmetleri ve
              teknik destek süreçlerini tek platformda buluşturan premium EV
              commerce deneyimi.
            </p>
            <div className="mt-6 space-y-2 text-sm text-on-surface-variant">
              <p>{siteConfig.phone}</p>
              <p>{siteConfig.email}</p>
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
              {siteConfig.footerNavigation.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-primary">
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
              {siteConfig.legalNavigation.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-primary">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Hizmet alanı
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
          © 2026 {siteConfig.name}. Hız, performans, güvenlik ve SEO odaklı EV commerce altyapısı.
        </div>
      </div>
    </footer>
  );
}
