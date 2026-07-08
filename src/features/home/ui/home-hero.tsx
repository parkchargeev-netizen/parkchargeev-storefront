import {
  ArrowDown,
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Home,
  MapPin,
  MessageCircle,
  PlugZap,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Wrench,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HomeHeroMotionLayer } from "@/features/home/ui/home-hero-motion";
import { conversionDataAttributes } from "@/lib/conversion-events";

type HomeHeroProps = {
  whatsappHref: string;
};

const heroStats = [
  { value: "22 kW", label: "AC şarj çözümleri" },
  { value: "81 il", label: "cihaz gönderimi" },
  { value: "3 adım", label: "seçim ve kurulum" }
] as const;

const trustIndicators = [
  { icon: ShieldCheck, label: "Güvenli satın alma" },
  { icon: Wrench, label: "Keşif ve kurulum planı" },
  { icon: Award, label: "Kurumsal destek" }
] as const;

const solutionCards = [
  {
    icon: Home,
    label: "Ev",
    title: "Günlük kullanıma uygun wallbox",
    accent: "7.4 / 11 kW",
    href: "/magaza?segment=Ev"
  },
  {
    icon: Building2,
    label: "Site",
    title: "Yönetime hazır ortak kullanım",
    accent: "RFID",
    href: "/kurumsal-cozumler/site-ve-apartman"
  },
  {
    icon: PlugZap,
    label: "İşletme",
    title: "Ölçeklenebilir şarj operasyonu",
    accent: "OCPP",
    href: "/iletisim?reason=Kurumsal%20teklif"
  }
] as const;

const coverageBadges = ["Sakarya keşif", "Kocaeli kurulum", "81 ile gönderim"] as const;

export function HomeHero({ whatsappHref }: HomeHeroProps) {
  return (
    <section className="enterprise-hero" aria-labelledby="home-hero-title">
      <div className="enterprise-hero__media" aria-hidden>
        <Image
          src="/images/hero-realistic-ev-charging-desktop.avif"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="enterprise-hero__image"
        />
        <span className="enterprise-hero__veil" />
        <span className="enterprise-hero__charge enterprise-hero__charge--one" />
        <span className="enterprise-hero__charge enterprise-hero__charge--two" />
        <span className="enterprise-hero__charge enterprise-hero__charge--three" />
        <span className="enterprise-hero__orb enterprise-hero__orb--one" />
        <span className="enterprise-hero__orb enterprise-hero__orb--two" />
      </div>
      <HomeHeroMotionLayer />

      <div className="enterprise-hero__grid" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <div className="enterprise-hero__content">
        <div className="enterprise-hero__copy" data-motion="reveal">
          <div className="enterprise-hero__kicker">
            <Sparkles className="h-4 w-4" aria-hidden />
            Elektrikli araç şarj platformu
          </div>

          <h1 id="home-hero-title">
            Şarj cihazınızı doğru güç, güvenli kurulum ve net seçimle alın.
          </h1>

          <p className="enterprise-hero__lead">
            Ev, site ve işletme kullanımına uygun Type 2 şarj cihazlarını güç,
            altyapı ve kurulum ihtiyacına göre karşılaştırın; doğru ürüne hızlıca ulaşın.
          </p>

          <div className="enterprise-hero__actions" data-motion="reveal" data-motion-order="2">
            <Link
              href="/magaza"
              prefetch={false}
              className="enterprise-hero__button enterprise-hero__button--primary"
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
              className="enterprise-hero__button enterprise-hero__button--secondary"
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
              className="enterprise-hero__button enterprise-hero__button--ghost"
              {...conversionDataAttributes("whatsapp_click", {
                placement: "hero",
                href: whatsappHref
              })}
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Uzmanla Görüş
            </a>
          </div>

          <div
            className="enterprise-hero__trust"
            aria-label="ParkChargeEV güven göstergeleri"
            data-motion="slide"
            data-motion-order="3"
          >
            {trustIndicators.map((item) => {
              const Icon = item.icon;

              return (
                <span key={item.label}>
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>

        <aside className="enterprise-hero__panel" aria-label="ParkChargeEV öne çıkan bilgiler">
          <div className="enterprise-hero__panel-glow" aria-hidden />

          <div className="enterprise-hero__review">
            <div className="enterprise-hero__review-stars" aria-label="Müşteri değerlendirmesi">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
              ))}
            </div>
            <p>
              “Ürün seçimi, keşif ve kurulum kapsamı tek akışta netleşti.”
            </p>
            <span>Site yönetimi müşterisi</span>
          </div>

          <div className="enterprise-hero__stats" aria-label="ParkChargeEV istatistikleri">
            {heroStats.map((stat) => (
              <div key={stat.label} className="enterprise-hero__stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="enterprise-hero__coverage">
            <div className="enterprise-hero__coverage-title">
              <MapPin className="h-4 w-4" aria-hidden />
              Kurulum ve teslimat kapsamı
            </div>
            <div className="enterprise-hero__coverage-badges">
              {coverageBadges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          </div>

          <div className="enterprise-hero__meter" aria-hidden>
            <span />
          </div>
        </aside>
      </div>

      <nav
        className="enterprise-hero__solutions"
        aria-label="Şarj çözümü kullanım alanları"
        data-motion="slide"
        data-motion-order="4"
      >
        {solutionCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.label} href={card.href} prefetch={false} className="enterprise-hero__solution">
              <span className="enterprise-hero__solution-icon">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="enterprise-hero__solution-copy">
                <small>
                  {card.label}
                  <em>{card.accent}</em>
                </small>
                <strong>{card.title}</strong>
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          );
        })}
      </nav>

      <a href="#one-cikan-urunler" className="enterprise-hero__scroll" aria-label="Ürünlere kaydır">
        <span>Kaydır</span>
        <ArrowDown className="h-4 w-4" aria-hidden />
      </a>

      <div className="enterprise-hero__status" aria-hidden>
        <CheckCircle2 className="h-4 w-4" />
        Canlı stok ve kurulum desteği
      </div>
    </section>
  );
}
