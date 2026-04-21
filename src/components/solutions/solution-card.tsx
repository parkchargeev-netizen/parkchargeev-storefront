import Link from "next/link";

import type { SolutionModel } from "@/lib/mock-data";

type SolutionCardProps = {
  solution: SolutionModel;
};

export function SolutionCard({ solution }: SolutionCardProps) {
  return (
    <article className="surface-card flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-secondary">
            {solution.segment}
          </p>
          <h3 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-on-surface">
            {solution.title}
          </h3>
        </div>
        <div className="rounded-[22px] bg-surface-container-low px-4 py-3 text-right">
          <p className="text-sm text-on-surface-variant">{solution.heroLabel}</p>
          <p className="mt-1 text-xl font-bold text-primary">{solution.heroMetric}</p>
        </div>
      </div>

      <p className="mt-5 flex-1 text-sm leading-7 text-on-surface-variant">
        {solution.summary}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {solution.useCases.map((item) => (
          <span
            key={item}
            className="rounded-full bg-surface-container px-3 py-2 text-xs font-semibold text-on-surface-variant"
          >
            {item}
          </span>
        ))}
      </div>

      <Link
        href={`/kurumsal-cozumler/${solution.slug}`}
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        Çözümü İncele
      </Link>
    </article>
  );
}
