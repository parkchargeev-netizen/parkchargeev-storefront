import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/content/article-card";
import { LeadForm } from "@/components/forms/lead-form";
import {
  getArticlesForSolution,
  getSolutionBySlug,
  solutionPages
} from "@/lib/mock-data";
import {
  getBreadcrumbJsonLd,
  getFaqJsonLd
} from "@/lib/structured-data";

type SolutionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return solutionPages.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({
  params
}: SolutionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    return { title: "Çözüm bulunamadı" };
  }

  return {
    title: solution.title,
    description: solution.summary
  };
}

export default async function SolutionDetailPage({
  params
}: SolutionPageProps) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  const relatedArticles = getArticlesForSolution(solution.slug);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Kurumsal Çözümler", path: "/kurumsal-cozumler" },
    { name: solution.title, path: `/kurumsal-cozumler/${solution.slug}` }
  ]);
  const faqJsonLd = getFaqJsonLd(solution.faq);
  const defaultReasonBySlug: Record<string, string> = {
    "site-ve-apartman": "Site / apartman çözümü",
    "is-yeri-ve-ofis": "İş yeri / ofis projesi",
    "filo-ve-otopark": "Filo / otopark projesi"
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/" className="transition hover:text-primary">
          Ana Sayfa
        </Link>
        <span>›</span>
        <Link href="/kurumsal-cozumler" className="transition hover:text-primary">
          Kurumsal Çözümler
        </Link>
        <span>›</span>
        <span className="text-on-surface">{solution.title}</span>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
            {solution.segment}
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-[-0.08em] text-on-surface">
            {solution.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant">
            {solution.introduction}
          </p>
        </div>

        <aside className="surface-card h-fit p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">
            Ana metrik
          </p>
          <p className="mt-4 text-4xl font-black tracking-[-0.06em] text-primary">
            {solution.heroMetric}
          </p>
          <p className="mt-3 text-base leading-7 text-on-surface-variant">
            {solution.heroLabel}
          </p>
          <Link
            href="/iletisim"
            className="mt-8 inline-block rounded-2xl bg-primary px-5 py-4 text-sm font-semibold text-white"
          >
            Projeyi Değerlendir
          </Link>
        </aside>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Çözüm kapsamı
          </h2>
          <div className="mt-6 space-y-4">
            {solution.features.map((feature) => (
              <div key={feature} className="rounded-[22px] bg-surface-container-low px-5 py-5 text-sm leading-7 text-on-surface-variant">
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Beklenen çıktılar
          </h2>
          <div className="mt-6 space-y-4">
            {solution.outcomes.map((outcome) => (
              <div key={outcome} className="rounded-[22px] bg-surface-container-low px-5 py-5 text-sm leading-7 text-on-surface-variant">
                {outcome}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 overflow-hidden rounded-[32px] bg-linear-to-br from-primary to-primary-container p-8 text-white shadow-[0_24px_80px_rgba(0,68,211,0.24)] lg:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/70">
          Kullanım senaryoları
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {solution.useCases.map((item) => (
            <div key={item} className="rounded-[24px] bg-white/10 p-5">
              <p className="text-xl font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Sık sorulan sorular
          </h2>
          <div className="mt-6 space-y-4">
            {solution.faq.map((item) => (
              <article key={item.question} className="rounded-[24px] bg-surface-container-low p-5">
                <h3 className="text-lg font-semibold text-on-surface">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>

        <LeadForm
          compact
          title="Bu çözüm için keşif talebi"
          description={`${solution.title} kapsamında lokasyon, araç sayısı ve kullanım modelinizi paylaşın.`}
          defaultReason={defaultReasonBySlug[solution.slug]}
        />
      </section>

      {relatedArticles.length > 0 ? (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-secondary">
                İçerik kümeleri
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-on-surface">
                Bu çözüme bağlı rehber içerikler
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
