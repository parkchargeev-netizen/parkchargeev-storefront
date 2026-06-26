import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PremiumSection } from "@/components/ui/premium-section";
import { solutionRoutes } from "@/features/home/domain/home-content";
import { HomeIcon } from "@/features/home/ui/home-icon";
import { SectionHeading } from "@/features/home/ui/section-heading";
import { conversionDataAttributes } from "@/lib/conversion-events";

export function SolutionRoutesSection() {
  const primaryRoutes = solutionRoutes.slice(0, 3);
  const secondaryRoutes = solutionRoutes.slice(3);

  return (
    <PremiumSection className="premium-home-routes">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Çözüm alanları"
            title="Her kullanım senaryosu için ayrı karar yolu, ortak teknik standart."
            body="Bireysel satın alma, ortak otopark ve ticari operasyon ihtiyaçları aynı ürün listesine sıkıştırılmaz."
          />
          <Link href="/kurumsal-cozumler" className="btn-secondary shrink-0">
            Tüm çözümler
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="premium-route-grid mt-8 grid gap-4 lg:grid-cols-3">
          {primaryRoutes.map((route) => (
            <Link
              key={route.label}
              href={route.href}
              className="premium-route-card surface-card group"
              {...conversionDataAttributes("persona_route_click", {
                route: route.label,
                href: route.href
              })}
            >
              <div className="flex items-center justify-between gap-3">
                <HomeIcon
                  icon={route.icon}
                  className="h-11 w-11 bg-primary/10 text-primary"
                />
                <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-primary">
                  {route.accent}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-secondary">{route.label}</p>
                <h3 className="mt-2 text-xl font-bold leading-tight text-on-surface">
                  {route.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-on-surface-variant">
                  {route.body}
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-primary">
                {route.cta}
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>

        <div className="premium-route-secondary mt-4 grid gap-3 md:grid-cols-2">
          {secondaryRoutes.map((route) => (
            <Link
              key={route.label}
              href={route.href}
              className="premium-route-mini group"
              {...conversionDataAttributes("persona_route_click", {
                route: route.label,
                href: route.href
              })}
            >
              <HomeIcon icon={route.icon} className="premium-route-mini__icon" />
              <span>
                <small>{route.label}</small>
                <strong>{route.title}</strong>
              </span>
              <b>{route.accent}</b>
              <ArrowRight
                className="h-4 w-4 transition group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          ))}
        </div>
    </PremiumSection>
  );
}
