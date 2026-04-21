import Link from "next/link";

import { ArticleCard } from "@/components/content/article-card";
import { ProductCard } from "@/components/shop/product-card";
import { SolutionCard } from "@/components/solutions/solution-card";
import {
  articles,
  products,
  services,
  solutionPages,
  testimonials,
  trustMetrics
} from "@/lib/mock-data";

export default function HomePage() {
  const featuredProducts = products.slice(0, 4);
  const featuredArticles = articles.slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="hero-orb-primary" />
        <div className="hero-orb-secondary" />
        <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-low px-4 py-2 text-sm font-medium text-secondary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              EV commerce, kurulum ve proje yönetimi tek platformda
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[1.02] tracking-[-0.08em] text-on-surface md:text-7xl">
              Şarj altyapısını
              <span className="text-gradient"> güvenle kurun</span>,
              <br />
              büyümeyi veriye taşıyın.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-on-surface-variant">
              ParkChargeEV; ev, site, iş yeri ve ticari lokasyonlar için ürün
              satışı, kurulum hizmeti, teknik destek ve proje danışmanlığını tek
              dijital deneyimde birleştirir.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/magaza"
                className="rounded-2xl bg-linear-to-r from-primary to-secondary px-7 py-4 text-center text-base font-semibold text-white shadow-[0_20px_60px_rgba(0,68,211,0.22)] transition hover:translate-y-[-1px]"
              >
                Mağazayı İncele
              </Link>
              <Link
                href="/kurumsal-cozumler"
                className="rounded-2xl border border-outline-variant/50 bg-surface-container-high px-7 py-4 text-center text-base font-semibold text-primary transition hover:border-primary/30"
              >
                Kurumsal Çözümler
              </Link>
            </div>
          </div>

          <div className="surface-card relative overflow-hidden p-6 lg:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-primary/8 via-white to-secondary/10" />
            <div className="relative">
              <div className="overflow-hidden rounded-[28px] border border-white/50 bg-slate-950 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                    Premium EV commerce
                  </span>
                  <span className="text-sm font-medium text-white/70">
                    PayTR + SEO ready
                  </span>
                </div>

                <div className="mt-20 grid gap-8 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">
                      Akıllı büyüme modeli
                    </p>
                    <p className="mt-4 text-4xl font-black tracking-[-0.06em]">
                      B2C + B2B
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/75">
                      Ürün satışı, kurulum, servis, blog ve teklif akışları aynı
                      yapıda.
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/6 p-6">
                    <p className="text-sm text-white/60">Öne çıkan modül</p>
                    <p className="mt-4 text-2xl font-bold tracking-[-0.04em]">
                      Kurumsal keşif akışı
                    </p>
                    <div className="mt-6 grid gap-3 text-sm text-white/80">
                      <p>Teklif toplama</p>
                      <p>Teknik keşif</p>
                      <p>Satış sonrası servis</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="-mt-10 ml-auto max-w-md rounded-[26px] border border-outline-variant/35 bg-white/80 p-5 shadow-[0_24px_70px_rgba(19,27,46,0.12)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold tracking-[-0.04em] text-on-surface">
                      SEO + GEO + AIEO
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Blog, FAQ, schema ve arama mimarisi hazır
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary-container px-3 py-2 text-sm font-semibold text-secondary">
                    Hazır
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {trustMetrics.map((metric) => (
            <div key={metric.label} className="surface-card p-6">
              <p className="text-sm uppercase tracking-[0.26em] text-on-surface-variant">
                {metric.label}
              </p>
              <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-primary">
                {metric.value}
              </p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                {metric.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
            Uçtan uca deneyim
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-on-surface">
            Sadece cihaz değil, tam çözüm sunuyoruz
          </h2>
          <p className="mt-4 text-lg leading-8 text-on-surface-variant">
            Ürün seçimi, teknik uygunluk, kurulum, servis ve operasyonel destek
            süreçlerini tek platformda bir araya getiriyoruz.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {services.slice(0, 2).map((service, index) => (
            <div key={service.id} className={index === 1 ? "soft-panel p-8" : "surface-card p-8"}>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                {service.title}
              </p>
              <p className="mt-4 text-base leading-7 text-on-surface-variant">
                {service.summary}
              </p>
              <Link href={service.href} className="mt-8 inline-block text-sm font-semibold text-primary">
                {service.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
              Öne çıkan ürünler
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] text-on-surface">
              Hızlı karar vermek için seçilmiş ürünler
            </h2>
          </div>
          <Link href="/magaza" className="text-sm font-semibold text-primary">
            Tüm ürünleri görüntüle
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-secondary">
              Kurumsal satış yüzeyi
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] text-on-surface">
              Segment bazlı çözüm sayfaları
            </h2>
          </div>
          <Link href="/kurumsal-cozumler" className="text-sm font-semibold text-primary">
            Tüm çözümleri görüntüle
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {solutionPages.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
              İçerik otoritesi
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] text-on-surface">
              AI arama ve organik görünürlük için içerik merkezi
            </h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-primary">
            Tüm yazıları görüntüle
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featuredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="overflow-hidden rounded-[32px] bg-slate-950 px-8 py-10 text-white shadow-[0_24px_80px_rgba(0,0,0,0.2)] lg:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/60">
            Sosyal kanıt
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.07em]">
            Karar vericilerin beklediği güven sinyalleri
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.id} className="rounded-[28px] border border-white/10 bg-white/6 p-6">
                <p className="text-base leading-8 text-white/80">“{item.quote}”</p>
                <div className="mt-6 border-t border-white/10 pt-6">
                  <p className="text-lg font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-white/60">
                    {item.role} · {item.company}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="surface-card p-10 text-center lg:p-14">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
            Projenizi birlikte planlayalım
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-on-surface">
            Ürün, kurulum ve proje ihtiyacınızı aynı akışta çözelim
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-on-surface-variant">
            ParkChargeEV yapısı bireysel alışveriş, kurumsal teklif ve servis
            talebini tek marka dilinde birleştirir.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/iletisim"
              className="rounded-2xl bg-primary px-7 py-4 text-base font-semibold text-white"
            >
              Biz Sizi Arayalım
            </Link>
            <Link
              href="/blog"
              className="rounded-2xl border border-outline-variant/40 bg-surface-container-low px-7 py-4 text-base font-semibold text-on-surface"
            >
              Rehber İçerikleri Gör
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
