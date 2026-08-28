import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SolutionModel } from "@/lib/mock-data";

type SolutionCardProps = {
  solution: SolutionModel;
};

export function SolutionCard({ solution }: SolutionCardProps) {
  return (
    <article className="solution-card group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/70 bg-white/88 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.07)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,0.12)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 opacity-70" />

      <div className="relative z-10">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-secondary">{solution.segment}</p>

          <h3 className="mt-3 text-lg font-bold leading-tight text-on-surface md:text-xl">
            {solution.title}
          </h3>
        </div>

        <div className="mt-4 rounded-lg bg-[#EEF5F1] px-4 py-3">
          <p className="text-xs leading-5 text-on-surface-variant">{solution.heroLabel}</p>

          <p className="mt-1 text-base font-bold leading-tight text-primary">
            {solution.heroMetric}
          </p>
        </div>
      </div>

      <p className="relative z-10 mt-4 line-clamp-3 flex-1 text-sm leading-6 text-on-surface-variant">
        {solution.summary}
      </p>

      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        {solution.useCases.slice(0, 2).map((item) => (
          <span
            key={item}
            className="rounded-full bg-primary/7 px-3 py-1.5 text-xs font-semibold text-on-surface-variant ring-1 ring-primary/10"
          >
            {item}
          </span>
        ))}
      </div>

      <Link
        href={`/kurumsal-cozumler/${solution.slug}`}
        className="relative z-10 mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-primary transition-all duration-300 group-hover:gap-3"
      >
        Çözümü incele
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
