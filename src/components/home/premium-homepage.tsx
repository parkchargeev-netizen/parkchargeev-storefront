import {
  ArrowRight,
  BadgeCheck,
  BatteryCharging,
  Building2,
  Cable,
  ClipboardCheck,
  Gauge,
  Home,
  MessageCircle,
  PlugZap,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  Users,
  Wrench,
  Zap,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";

import { AnimatedMetricValue } from "@/components/home/animated-metric-value";
import { ChargingVisual } from "@/components/home/charging-visual";
import { ProductCard } from "@/components/shop/product-card";
import {
  conversionRoutes,
  heroStats,
  heroTrustSignals,
  installationSteps,
  powerChoices,
  proofSignals,
  type HomeIconKey
} from "@/lib/homepage-content";
import type {
  ArticleModel,
  ProductModel,
  TestimonialModel,
  TrustMetricModel
} from "@/lib/mock-data";

type PremiumHomepageProps = {
  featuredProducts: ProductModel[];
  featuredArticles: ArticleModel[];
  testimonials: TestimonialModel[];
  trustMetrics: TrustMetricModel[];
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
  return (
    <section className="premium-hero relative isolate overflow-hidden">
      <div className="premium-hero__mesh" aria-hidden />

      <div className="premium-hero__inner relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(28rem,0.82fr)] lg:px-8">
        <div className="premium-hero__copy max-w-[38rem]">
          <div className="flex flex-wrap gap-2">
            {heroTrustSignals.map((item) => {
              const Icon = iconMap[item.icon];

              return (
                <span key={item.label} className="premium-trust-pill">
                  <Icon className="h-4 w-4 text-emerald-300" aria-hidden />
                  {item.label}
                </span>
              );
            })}
          </div>

          <p className="mt-8 text-xs font-black uppercase text-emerald-300">
            ParkChargeEV premium şarj platformu
          </p>
          <h1 className="mt-4 max-w-[38rem] text-[2.55rem] font-black leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-[3.95rem]">
            Doğru cihaz. Güvenli kurulum. Net karar.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
            Ev, site ve işletmeniz için uyumlu cihazı bulun; keşif ve kurulum desteğiyle güvenle ilerleyin.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/magaza?segment=Ev" className="premium-btn premium-btn--primary">
              <ShoppingBag className="h-5 w-5" aria-hidden />
              Ev Tipi Cihazları Gör
            </Link>
            <Link href="/iletisim?reason=Ucretsiz%20kesif" className="premium-btn premium-btn--glass">
              <ClipboardCheck className="h-5 w-5" aria-hidden />
              Ücretsiz Keşif İste
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="premium-btn premium-btn--ghost">
              <MessageCircle className="h-5 w-5" aria-hidden />
              WhatsApp
            </a>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="premium-hero-stat">
                <p className="text-lg font-black text-white md:text-2xl">{stat.value}</p>
                <p className="mt-1 text-xs font-bold text-white/58">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-hero__visual">
          <ChargingVisual />
        </div>
      </div>
    </section>
  );
}

function TrustMetrics({ metrics }: { metrics: TrustMetricModel[] }) {
  return (
    <section className="premium-section premium-section--tight">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {metrics.map((metric) => (
          <div key={metric.label} className="premium-metric-card">
            <p className="text-2xl font-black text-primary">
              <AnimatedMetricValue value={metric.value} />
            </p>
            <p className="mt-1 text-xs font-black uppercase text-on-surface-variant">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ConversionRoutes() {
  return (
    <section className="premium-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Kendi rotanı seç"
          title="İhtiyacınıza göre doğru çözüme gidin."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {conversionRoutes.map((route) => (
            <Link key={route.label} href={route.href} className="premium-route-card group">
              <div className="flex items-center justify-between gap-3">
                <IconBadge icon={route.icon} className="h-11 w-11 bg-primary/10 text-primary" />
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-emerald-300">
                  {route.accent}
                </span>
              </div>
              <p className="mt-5 text-xs font-black uppercase text-primary">
                {route.label}
              </p>
              <h3 className="mt-2 text-xl font-black leading-tight text-on-surface">{route.title}</h3>
              <p className="mt-3 min-h-12 text-sm leading-6 text-on-surface-variant">{route.body}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                {route.cta}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function MotionStorySection() {
  const stories = [
    ["Ev", "Gece şarjı", "11 kW"],
    ["Site", "RFID akışı", "22 kW"],
    ["Ticari", "ROI saha", "DC"]
  ] as const;

  return (
    <section className="premium-section premium-motion-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Canlı deneyim"
            title="Şarj akışını canlı hissedin."
          />
          <Link href="/urun-secici" className="premium-btn premium-btn--glass shrink-0">
            Uygunluğu Kontrol Et
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {stories.map(([segment, title, metric], index) => (
            <article key={segment} className="motion-story-card">
              <div className="motion-story-card__visual">
                <span className="motion-story-card__beam" />
                <span className="motion-story-card__device" />
                <span className="motion-story-card__socket" />
                <span className="motion-story-card__pulse" />
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-emerald-300">{segment}</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{title}</h3>
                </div>
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white">
                  {metric}
                </span>
              </div>
              <div
                className="motion-story-card__progress"
                style={{ animationDelay: `${index * 0.8}s` }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PowerChoiceSection() {
  return (
    <section className="premium-section premium-light-section">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <SectionHeading
          eyebrow="Güç seçimi"
          title="Ev, site ve işletme için doğru güç."
        />

        <div className="grid gap-3 md:grid-cols-2">
          {powerChoices.map((choice) => (
            <Link key={choice.power} href={choice.href} className="premium-power-card group">
              <div className="flex items-center justify-between gap-4">
                <IconBadge icon={choice.icon} className="h-12 w-12 bg-white text-primary shadow-sm" />
                <p className="text-3xl font-black text-primary">{choice.power}</p>
              </div>
              <h3 className="mt-5 text-lg font-black text-on-surface">{choice.title}</h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{choice.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSpotlight({ products }: { products: ProductModel[] }) {
  return (
    <section className="premium-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Mağaza"
            title="Öne çıkan şarj çözümleri."
          />
          <Link href="/magaza" className="btn-secondary shrink-0">
            Mağazaya Git
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function InstallationFlow() {
  return (
    <section className="premium-section premium-install-section">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
        <div>
          <p className="premium-eyebrow text-emerald-300">Kurulum güveni</p>
          <h2 className="mt-3 text-2xl font-black leading-tight tracking-normal text-white md:text-4xl">
            Cihaz satışı, teknik güvenle tamamlanır.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/68 md:text-base">
            Pano, faz ve kablo hattı netleşsin; montaj güvenle tamamlansın.
          </p>
          <Link href="/hizmetler" className="premium-btn premium-btn--primary mt-7">
            Kurulum Hizmetini İncele
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {installationSteps.map((item) => (
            <article key={item.step} className="premium-install-card">
              <div className="flex items-center justify-between">
                <IconBadge icon={item.icon} className="h-11 w-11 bg-white/10 text-emerald-300" />
                <span className="text-sm font-black text-white/36">{item.step}</span>
              </div>
              <h3 className="mt-5 text-xl font-black text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/64">{item.body}</p>
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
            eyebrow="Sosyal kanıt"
            title="Karar öncesi güven sinyalleri."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {proofSignals.map((signal) => (
              <div key={signal.label} className="premium-signal-card">
                <IconBadge icon={signal.icon} className="h-10 w-10 bg-primary/10 text-primary" />
                <p className="mt-3 text-sm font-black leading-5 text-on-surface">{signal.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {testimonials.map((item) => (
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
              <h3 className="mt-2 text-2xl font-black text-on-surface">Kısa rehberler.</h3>
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
          Bugün doğru cihaz ve kurulum planını netleştirelim.
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
  trustMetrics,
  whatsappHref
}: PremiumHomepageProps) {
  return (
    <main className="premium-home-page">
      <PremiumHero whatsappHref={whatsappHref} />
      <TrustMetrics metrics={trustMetrics} />
      <ConversionRoutes />
      <PowerChoiceSection />
      <ProductSpotlight products={featuredProducts} />
      <InstallationFlow />
      <ProofAndResources articles={featuredArticles} testimonials={testimonials} />
      <FinalCta whatsappHref={whatsappHref} />
    </main>
  );
}
