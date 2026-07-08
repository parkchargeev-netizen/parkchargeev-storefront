import { ArrowRight, ClipboardCheck, MessageCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { ChargingVisual } from "@/components/home/charging-visual";
import {
  heroTrustSignals,
  solutionRoutes
} from "@/features/home/domain/home-content";
import { getHomeIcon, HomeIcon } from "@/features/home/ui/home-icon";
import { conversionDataAttributes } from "@/lib/conversion-events";

type HomeHeroProps = {
  whatsappHref: string;
};

export function HomeHero({ whatsappHref }: HomeHeroProps) {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/hero-realistic-ev-charging-desktop.avif"
        imageSrcSet="/images/hero-realistic-ev-charging-mobile.avif 760w, /images/hero-realistic-ev-charging-tablet.avif 1100w, /images/hero-realistic-ev-charging-desktop.avif 1600w"
        imageSizes="100vw"
        fetchPriority="high"
        type="image/avif"
      />
      <section className="premium-hero premium-hero--refined relative isolate overflow-hidden" data-motion="fade">
      <ChargingVisual />
      <div className="premium-hero__mesh" aria-hidden />

      <div className="premium-hero__inner relative z-10 mx-auto flex max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="premium-hero__copy max-w-[43rem]" data-motion="reveal">
          <p className="premium-hero__eyebrow">Elektrikli araç şarj cihazları</p>

          <div className="premium-hero__mobile-trust">
            {heroTrustSignals.map((item) => {
              const Icon = getHomeIcon(item.icon);

              return (
                <span key={item.label} className="premium-trust-pill">
                  <Icon className="h-4 w-4 text-emerald-300" aria-hidden />
                  {item.label}
                </span>
              );
            })}
          </div>

          <h1 className="mt-5 max-w-[43rem] text-4xl font-bold leading-tight tracking-normal text-white sm:text-5xl">
            Elektrikli araç şarj cihazınızı doğru güç ve kurulumla seçin.
          </h1>

          <div
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            data-motion="reveal"
            data-motion-order="2"
          >
            <Link
              href="/magaza"
              prefetch={false}
              className="premium-btn premium-btn--primary"
              {...conversionDataAttributes("hero_cta_click", {
                cta: "Şarj Cihazlarını İncele",
                href: "/magaza"
              })}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden />
              Şarj Cihazlarını İncele
            </Link>
            <Link
              href="/urun-secici"
              prefetch={false}
              className="premium-btn premium-btn--glass"
              {...conversionDataAttributes("hero_cta_click", {
                cta: "Çözümünü Bul",
                href: "/urun-secici"
              })}
            >
              <ClipboardCheck className="h-5 w-5" aria-hidden />
              Çözümünü Bul
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-btn premium-btn--ghost"
              {...conversionDataAttributes("whatsapp_click", {
                placement: "hero",
                href: whatsappHref
              })}
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Uzmanla Görüş
            </a>
          </div>
        </div>

        <div
          className="premium-hero__routes"
          aria-label="Şarj çözümü kullanım alanları"
          data-motion="slide"
          data-motion-order="3"
        >
          {solutionRoutes.slice(0, 3).map((route) => (
            <Link
              key={route.label}
              href={route.href}
              prefetch={false}
              className="premium-hero-route group"
            >
              <HomeIcon icon={route.icon} className="premium-hero-route__icon" />
              <span className="min-w-0">
                <span className="premium-hero-route__meta">
                  <small>{route.label}</small>
                  <em>{route.accent}</em>
                </span>
                <strong>{route.title}</strong>
              </span>
              <ArrowRight
                className="ml-auto h-4 w-4 shrink-0 transition group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </div>
      </section>
    </>
  );
}
