import { ArrowRight, ClipboardCheck, MessageCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { ChargingVisual } from "@/components/home/charging-visual";
import { solutionRoutes } from "@/features/home/domain/home-content";
import { HomeIcon } from "@/features/home/ui/home-icon";
import { conversionDataAttributes } from "@/lib/conversion-events";

type HomeHeroProps = {
  whatsappHref: string;
};

export function HomeHero({ whatsappHref }: HomeHeroProps) {
  const heroMetrics = [
    { label: "Güç aralığı", value: "7.4 - 22 kW" },
    { label: "Soket uyumu", value: "Type 2" },
    { label: "Karar akışı", value: "Ürün + kurulum" }
  ] as const;

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
      <section className="home-landing-hero" data-motion="fade">
        <div className="home-landing-hero__ambient" aria-hidden />

        <div className="home-landing-hero__inner">
          <div className="home-landing-hero__copy" data-motion="reveal">
            <p className="home-landing-hero__eyebrow">ParkChargeEV şarj mağazası</p>
            <h1>EV şarj cihazını, kullanım alanına ve altyapına göre seç.</h1>
            <p className="home-landing-hero__lead">
              Ev, site, işletme ve ticari sahalar için AC wallbox, Type 2 aksesuar ve
              kurulum ihtiyacını tek akışta karşılaştırın.
            </p>

            <div
              className="home-landing-hero__actions"
              data-motion="reveal"
              data-motion-order="2"
            >
              <Link
                href="/magaza"
                prefetch={false}
                className="home-landing-hero__button home-landing-hero__button--primary"
                {...conversionDataAttributes("hero_cta_click", {
                  cta: "Şarj cihazlarını incele",
                  href: "/magaza"
                })}
              >
                <ShoppingBag className="h-5 w-5" aria-hidden />
                Şarj cihazlarını incele
              </Link>
              <Link
                href="/urun-secici"
                prefetch={false}
                className="home-landing-hero__button home-landing-hero__button--secondary"
                {...conversionDataAttributes("hero_cta_click", {
                  cta: "Çözümünü bul",
                  href: "/urun-secici"
                })}
              >
                <ClipboardCheck className="h-5 w-5" aria-hidden />
                Çözümünü bul
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="home-landing-hero__button home-landing-hero__button--ghost"
                {...conversionDataAttributes("whatsapp_click", {
                  placement: "hero",
                  href: whatsappHref
                })}
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                WhatsApp danışmanlığı
              </a>
            </div>

            <div className="home-landing-hero__metrics" aria-label="Hızlı karar bilgileri">
              {heroMetrics.map((item) => (
                <span key={item.label}>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="home-landing-hero__stage" data-motion="slide" data-motion-order="2">
            <div className="home-landing-hero__visual">
              <ChargingVisual />
            </div>
            <div className="home-landing-hero__panel" aria-label="Satın alma karar özeti">
              <span>Bugün en hızlı başlangıç</span>
              <strong>Ürünü seç, altyapıyı doğrula, sepetten ilerle.</strong>
              <p>Hazır ürünlerde mağaza akışı; keşif gereken projelerde danışmanlık.</p>
            </div>
          </div>

          <div
            className="home-landing-hero__routes"
            aria-label="Şarj çözümü kullanım alanları"
            data-motion="slide"
            data-motion-order="3"
          >
            {solutionRoutes.map((route) => (
              <Link
                key={route.label}
                href={route.href}
                prefetch={false}
                className="home-landing-hero__route group"
                {...conversionDataAttributes("persona_route_click", {
                  route: route.label,
                  href: route.href
                })}
              >
                <HomeIcon icon={route.icon} className="home-landing-hero__route-icon" />
                <span>
                  <small>{route.label}</small>
                  <strong>{route.title}</strong>
                </span>
                <em>{route.accent}</em>
                <ArrowRight
                  className="home-landing-hero__route-arrow transition group-hover:translate-x-1"
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
