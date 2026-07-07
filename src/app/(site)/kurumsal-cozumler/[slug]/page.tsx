import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/content/article-card";
import { LeadForm } from "@/components/forms/lead-form";
import { JsonLd } from "@/components/seo/json-ld";
import { withCleanCorporateSolutionCopy } from "@/features/corporate/domain/corporate-solution-copy";
import {
  getArticlesForSolution,
  getSolutionBySlug,
  solutionPages
} from "@/lib/mock-data";
import {
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getSolutionServiceJsonLd
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
  const rawSolution = getSolutionBySlug(slug);

  if (!rawSolution) {
    return { title: "Çözüm bulunamadı" };
  }

  const solution = withCleanCorporateSolutionCopy(rawSolution);

  return {
    title: solution.title,
    description: solution.summary,
    alternates: {
      canonical: `/kurumsal-cozumler/${solution.slug}`
    }
  };
}

export default async function SolutionDetailPage({
  params
}: SolutionPageProps) {
  const { slug } = await params;
  const rawSolution = getSolutionBySlug(slug);

  if (!rawSolution) {
    notFound();
  }

  const solution = withCleanCorporateSolutionCopy(rawSolution);
  const relatedArticles = getArticlesForSolution(solution.slug);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Kurumsal Çözümler", path: "/kurumsal-cozumler" },
    { name: solution.title, path: `/kurumsal-cozumler/${solution.slug}` }
  ]);
  const faqJsonLd = getFaqJsonLd(solution.faq);
  const serviceJsonLd = getSolutionServiceJsonLd(solution);
  const defaultReasonBySlug: Record<string, string> = {
    "site-ve-apartman": "Site / apartman çözümü",
    "is-yeri-ve-ofis": "İş yeri / ofis projesi",
    "filo-ve-otopark": "Filo / otopark projesi"
  };

  return (
    <main className="corporate-detail-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd data={[serviceJsonLd, breadcrumbJsonLd, faqJsonLd]} />

      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant sm:text-sm">
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

      <section className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">{solution.segment}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-on-surface md:text-5xl">
            {solution.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-on-surface-variant">
            {solution.introduction}
          </p>
        </div>

        <aside className="surface-card h-fit p-5">
          <p className="text-xs font-semibold uppercase text-secondary">Ana metrik</p>
          <p className="mt-3 text-3xl font-bold text-primary">{solution.heroMetric}</p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            {solution.heroLabel}
          </p>
          <Link
            href="/iletisim"
            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white"
          >
            Projeyi değerlendir
          </Link>
        </aside>
      </section>

      <section className="mt-9 grid gap-5 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-2xl font-bold text-on-surface">Çözüm kapsamı</h2>
          <div className="mt-4 grid gap-3">
            {solution.features.map((feature) => (
              <div
                key={feature}
                className="rounded-lg bg-surface-container-low px-4 py-3 text-sm leading-6 text-on-surface-variant"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-2xl font-bold text-on-surface">Beklenen çıktılar</h2>
          <div className="mt-4 grid gap-3">
            {solution.outcomes.map((outcome) => (
              <div
                key={outcome}
                className="rounded-lg bg-surface-container-low px-4 py-3 text-sm leading-6 text-on-surface-variant"
              >
                {outcome}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-9 overflow-hidden rounded-lg bg-linear-to-br from-primary to-primary-container p-5 text-white shadow-[0_20px_60px_rgba(6,51,38,0.2)] sm:p-7">
        <p className="text-xs font-semibold uppercase text-white/82">Kullanım senaryoları</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {solution.useCases.map((item) => (
            <div key={item} className="rounded-lg bg-white/[0.12] p-4">
              <p className="text-base font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-9 grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div className="surface-card p-5">
          <h2 className="text-2xl font-bold text-on-surface">Sık sorulan sorular</h2>
          <div className="mt-4 grid gap-3">
            {solution.faq.map((item) => (
              <article key={item.question} className="rounded-lg bg-surface-container-low p-4">
                <h3 className="text-base font-semibold text-on-surface">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.answer}</p>
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
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-secondary">İçerik kümeleri</p>
              <h2 className="mt-3 text-2xl font-bold text-on-surface md:text-3xl">
                Bu çözüme bağlı rehber içerikler
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
