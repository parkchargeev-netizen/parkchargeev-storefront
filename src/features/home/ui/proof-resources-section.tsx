import Link from "next/link";

import { proofSignals } from "@/features/home/domain/home-content";
import { HomeIcon } from "@/features/home/ui/home-icon";
import { SectionHeading } from "@/features/home/ui/section-heading";
import type { ArticleModel, TestimonialModel } from "@/lib/mock-data";

type ProofResourcesSectionProps = {
  articles: ArticleModel[];
  testimonials: TestimonialModel[];
};

export function ProofResourcesSection({
  articles,
  testimonials
}: ProofResourcesSectionProps) {
  return (
    <section className="premium-section premium-light-section">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Operasyon güveni"
            title="Kararı kolaylaştıran kanıtlar, teslimden sonra devam eden destek."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {proofSignals.map((signal) => (
              <div key={signal.label} className="premium-signal-card">
                <HomeIcon
                  icon={signal.icon}
                  className="h-10 w-10 bg-primary/10 text-primary"
                />
                <p className="mt-3 text-sm font-bold leading-5 text-on-surface">
                  {signal.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {testimonials.slice(0, 2).map((item) => (
              <article key={item.id} className="premium-quote-card">
                <p className="line-clamp-3 text-sm leading-6 text-on-surface-variant">
                  &quot;{item.quote}&quot;
                </p>
                <p className="mt-4 text-sm font-bold text-on-surface">{item.name}</p>
                <p className="text-xs text-on-surface-variant">
                  {item.role}, {item.company}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-outline-variant/45 bg-surface-container-low p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="premium-eyebrow">Bilgi merkezi</p>
              <h3 className="mt-2 text-2xl font-bold text-on-surface">
                Teknik karar rehberleri
              </h3>
            </div>
            <Link href="/blog" className="text-sm font-bold text-primary">
              Tümü
            </Link>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Link
              href="/elektrikli-arac-sarj-rehberi"
              className="border border-outline-variant/40 bg-white px-4 py-3 text-sm font-bold text-primary transition hover:border-primary/40"
            >
              EV şarj rehberi
            </Link>
            <Link
              href="/elektrikli-arac-sarj-sozlugu"
              className="border border-outline-variant/40 bg-white px-4 py-3 text-sm font-bold text-primary transition hover:border-primary/40"
            >
              Teknik sözlük
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="premium-resource-link group"
              >
                <span className="text-xs font-bold uppercase text-primary">
                  {article.coverKicker}
                </span>
                <span className="mt-2 block text-lg font-bold leading-tight text-on-surface">
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
