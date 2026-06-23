import {
  ArrowRight,
  BatteryCharging,
  Building2,
  Cable,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Home,
  MessageCircle,
  PlugZap,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  Truck,
  Users,
  Wrench,
  Zap,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";

import { ChargingVisual } from "@/components/home/charging-visual";
import { ProductCard } from "@/components/shop/product-card";
import { conversionDataAttributes } from "@/lib/conversion-events";
import {
  conversionRoutes,
  heroTrustSignals,
  installationSteps,
  proofSignals,
  type HomeIconKey
} from "@/lib/homepage-content";
import type {
  ArticleModel,
  ProductModel,
  TestimonialModel
} from "@/lib/mock-data";

type PremiumHomepageProps = {
  featuredProducts: ProductModel[];
  featuredArticles: ArticleModel[];
  testimonials: TestimonialModel[];
  whatsappHref: string;
};

const iconMap: Record<HomeIconKey, LucideIcon> = {
  battery: BatteryCharging,
  building: Building2,
  cable: Cable,
  clipboard: ClipboardCheck,
  gauge: Gauge,
  home: Home,
  message: MessageCircle,
  plug: PlugZap,
  shield: ShieldCheck,
  shopping: ShoppingBag,
  spark: Sparkles,
  timer: Timer,
  truck: Truck,
  users: Users,
  wrench: Wrench,
  zap: Zap
};

function IconBadge({ icon, className = "" }: { icon: HomeIconKey; className?: string }) {
  const Icon = iconMap[icon];

  return (
    <span className={`inline-flex items-center justify-center rounded-2xl ${className}`}>
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left"
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="premium-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-black leading-tight tracking-normal text-on-surface md:text-4xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-sm leading-7 text-on-surface-variant md:text-base">{body}</p>
      ) : null}
    </div>
  );
}

function PremiumHero({ whatsappHref }: { whatsappHref: string }) {
  const primaryRoutes = conversionRoutes.slice(0, 3);

  return (
    <section className="premium-hero relative isolate overflow-hidden">
      <ChargingVisual />
      <div className="premium-hero__mesh" aria-hidden />

      <div className="premium-hero__inner relative z-10 mx-auto flex max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="premium-hero__copy max-w-[42rem]">
          <p className="premium-hero__eyebrow">ParkChargeEV şarj çözümleri</p>
          <div className="premium-hero__mobile-trust">
            {heroTrustSignals.slice(0, 3).map((item) => {
              const Icon = iconMap[item.icon];

              return (
                <span key={item.label} className="premium-trust-pill">
                  <Icon className="h-4 w-4 text-emerald-300" aria-hidden />
                  {item.label}
                </span>
              );
            })}
          </div>

          <h1 className="mt-5 max-w-[42rem] text-[2.45rem] font-black leading-[1.02] tracking-normal text-white sm:text-5xl lg:text-[3.55rem]">
            Şarj cihazını değil, doğru çözümü seçin.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/82 sm:text-lg">
            Aracınıza uygun cihazı güvenli kurulum ve uzman desteğiyle birlikte planlayın.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/magaza?segment=Ev"
              className="premium-btn premium-btn--primary"
              {...conversionDataAttributes("hero_cta_click", {
                cta: "Ürünleri İncele",
                href: "/magaza?segment=Ev"
              })}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden />
              Ürünleri İncele
            </Link>
            <Link
              href={`/iletisim?reason=${encodeURIComponent("Ücretsiz keşif talebi")}`}
              className="premium-btn premium-btn--glass"
              {...conversionDataAttributes("hero_cta_click", {
                cta: "Ücretsiz Keşif İste",
                href: "/iletisim?reason=Ücretsiz keşif talebi"
              })}
            >
              <ClipboardCheck className="h-5 w-5" aria-hidden />
              Ücretsiz Keşif İste
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-btn premium-btn--ghost"
              {...conversionDataAttributes("hero_cta_click", {
                cta: "WhatsApp",
                href: whatsappHref
              })}
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="premium-hero__routes" aria-label="Kullanım alanına göre çözüm seçimi">
          {primaryRoutes.map((route) => (
            <Link key={route.label} href={route.href} className="premium-hero-route group">
              <IconBadge icon={route.icon} className="premium-hero-route__icon" />
              <span className="min-w-0">
                <small>{route.label}</small>
                <strong>{route.title}</strong>
              </span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSpotlight({ products }: { products: ProductModel[] }) {
  return (
    <section className="premium-section premium-product-spotlight">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Mağaza"
            title="En çok tercih edilen şarj ürünleri."
          />
          <Link href="/magaza" className="btn-secondary shrink-0">
            Mağazaya Git
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="premium-product-spotlight__grid mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PersonaRouteSection() {
  const primaryRoutes = conversionRoutes.slice(0, 3);
  const secondaryRoutes = conversionRoutes.slice(3);

  return (
    <section className="premium-section premium-home-routes">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Doğru yol"
            title="İhtiyacınızı seçin, doğru satış akışına geçin."
            body="Ev kullanıcısı hızlı ürün seçimine, site ve işletme karar vericisi keşif veya teklif akışına yönlenir."
          />
          <Link href="/urun-secici" className="btn-secondary shrink-0">
            Ürün Seçici
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
                <IconBadge icon={route.icon} className="h-11 w-11 bg-primary/10 text-primary" />
                <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-black text-primary">
                  {route.accent}
                </span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">
                  {route.label}
                </p>
                <h3 className="mt-2 text-xl font-black leading-tight text-on-surface">
                  {route.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-on-surface-variant">
                  {route.body}
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-black text-primary">
                {route.cta}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
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
              <IconBadge icon={route.icon} className="premium-route-mini__icon" />
              <span>
                <small>{route.label}</small>
                <strong>{route.title}</strong>
              </span>
              <b>{route.accent}</b>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConversionFunnelSection() {
  const lanes = [
    {
      icon: "shopping",
      title: "Hızlı alışveriş",
      body: "Aksesuar, kablo ve hazır ürünlerde fiyat, stok ve 81 il kargo net görünür.",
      cta: "Mağazayı aç",
      href: "/magaza"
    },
    {
      icon: "clipboard",
      title: "Uygunluk kontrolü",
      body: "Güç, faz, soket ve kurulum ihtiyacı ürün seçiciyle sade şekilde netleşir.",
      cta: "Ürün seçici",
      href: "/urun-secici"
    },
    {
      icon: "building",
      title: "Kurumsal teklif",
      body: "Site, ofis, filo ve ticari lokasyonlar için keşif ve teklif akışı ayrılır.",
      cta: "Teklif al",
      href: "/iletisim?reason=Kurumsal%20teklif"
    }
  ] as const;

  return (
    <section className="premium-section premium-funnel-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="premium-funnel-shell">
          <div className="premium-funnel-shell__copy">
            <p className="premium-eyebrow">Satış yolu</p>
            <h2>Her ziyaretçi aynı kararı vermiyor. Akış ona göre kısalıyor.</h2>
            <p>
              Yeni EV sahibi hızlı ürüne, site yöneticisi keşfe, işletme karar vericisi teklife
              yönlenir. Böylece sayfa kalabalığı azalır, karar sürtünmesi düşer.
            </p>
          </div>

          <div className="premium-funnel-lanes">
            {lanes.map((lane, index) => (
              <Link key={lane.title} href={lane.href} className="premium-funnel-lane group">
                <span className="premium-funnel-lane__step">0{index + 1}</span>
                <IconBadge icon={lane.icon} className="premium-funnel-lane__icon" />
                <strong>{lane.title}</strong>
                <small>{lane.body}</small>
                <span className="premium-funnel-lane__cta">
                  {lane.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>

          <div className="premium-funnel-proof">
            {["PayTR güvenli ödeme", "81 il ürün kargosu", "Keşif ve kurulum desteği"].map((item) => (
              <span key={item}>
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InstallationFlow() {
  return (
    <section className="premium-section premium-install-section">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
        <div>
          <p className="premium-eyebrow text-emerald-300">Kurulum güveni</p>
          <h2 className="mt-3 text-2xl font-black leading-tight tracking-normal text-white md:text-4xl">
            Satın almadan kuruluma üç net adım.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 md:text-base">
            İhtiyacınızı belirleyin, altyapıyı kontrol edin ve kurulumu güvenle tamamlayın.
          </p>
          <Link href="/hizmetler" className="premium-btn premium-btn--primary mt-7">
            Kurulum Hizmetini İncele
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {installationSteps.slice(0, 3).map((item) => (
            <article key={item.step} className="premium-install-card">
              <div className="flex items-center justify-between">
                <IconBadge icon={item.icon} className="h-11 w-11 bg-white/[0.14] text-emerald-300" />
                <span className="text-sm font-black text-white/76">{item.step}</span>
              </div>
              <h3 className="mt-5 text-xl font-black text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/76">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProofAndResources({
  articles,
  testimonials
}: {
  articles: ArticleModel[];
  testimonials: TestimonialModel[];
}) {
  return (
    <section className="premium-section premium-light-section">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Güven"
            title="Satın alma süreciniz güvende."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {proofSignals.map((signal) => (
              <div key={signal.label} className="premium-signal-card">
                <IconBadge icon={signal.icon} className="h-10 w-10 bg-primary/10 text-primary" />
                <p className="mt-3 text-sm font-black leading-5 text-on-surface">{signal.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {testimonials.slice(0, 2).map((item) => (
              <article key={item.id} className="premium-quote-card">
                <p className="line-clamp-3 text-sm leading-6 text-on-surface-variant">
                  &quot;{item.quote}&quot;
                </p>
                <p className="mt-4 text-sm font-black text-on-surface">{item.name}</p>
                <p className="text-xs text-on-surface-variant">{item.company}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-outline-variant/45 bg-surface-container-low p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="premium-eyebrow">Rehberler</p>
              <h3 className="mt-2 text-2xl font-black text-on-surface">Satın alma rehberleri.</h3>
            </div>
            <Link href="/blog" className="text-sm font-black text-primary">
              Tümü
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {articles.map((article) => (
              <Link key={article.id} href={`/blog/${article.slug}`} className="premium-resource-link group">
                <span className="text-xs font-black uppercase text-primary">
                  {article.coverKicker}
                </span>
                <span className="mt-2 block text-lg font-black leading-tight text-on-surface">
                  {article.title}
                </span>
                <span className="mt-2 line-clamp-2 text-sm leading-6 text-on-surface-variant">
                  {article.excerpt}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta({ whatsappHref }: { whatsappHref: string }) {
  return (
    <section className="premium-section premium-final-cta">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <p className="premium-eyebrow text-emerald-300">Son adım</p>
        <h2 className="mt-4 text-3xl font-black leading-tight text-white md:text-5xl">
          Cihazı, keşfi ve kurulum planını bugün netleştirelim.
        </h2>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/magaza?segment=Ev" className="premium-btn premium-btn--primary">
            Ev Tipi Ürünleri Gör
          </Link>
          <Link href="/iletisim?reason=Kurumsal%20teklif" className="premium-btn premium-btn--glass">
            Kurumsal Teklif Al
          </Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="premium-btn premium-btn--ghost">
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export function PremiumHomepage({
  featuredProducts,
  featuredArticles,
  testimonials,
  whatsappHref
}: PremiumHomepageProps) {
  return (
    <main className="premium-home-page">
      <PremiumHero whatsappHref={whatsappHref} />
      <PersonaRouteSection />
      <ConversionFunnelSection />
      <ProductSpotlight products={featuredProducts} />
      <InstallationFlow />
      <ProofAndResources articles={featuredArticles} testimonials={testimonials} />
      <FinalCta whatsappHref={whatsappHref} />
    </main>
  );
}
