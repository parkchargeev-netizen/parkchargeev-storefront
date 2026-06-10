import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SolutionModel } from "@/lib/mock-data";

type SolutionCardProps = {
  solution: SolutionModel;
};

export function SolutionCard({ solution }: SolutionCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 opacity-70" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="max-w-[60%]">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-secondary">
            {solution.segment}
          </p>

          <h3 className="mt-5 text-3xl font-extrabold leading-tight tracking-[-0.055em] text-on-surface md:text-4xl">
            {solution.title}
          </h3>
        </div>

        <div className="rounded-[28px] bg-[#EEF5F1] px-6 py-5 min-w-[180px] max-w-[220px] text-left">
          <p className="text-sm leading-6 text-on-surface-variant">
            {solution.heroLabel}
          </p>

          <p className="mt-3 text-xl md:text-2xl font-extrabold leading-tight tracking-[-0.03em] text-primary">
            {solution.heroMetric}
          </p>
        </div>
      </div>

      <p className="relative z-10 mt-8 flex-1 text-base leading-8 text-on-surface-variant">
        {solution.summary}
      </p>

      <div className="relative z-10 mt-8 flex flex-wrap gap-3">
        {solution.useCases.map((item) => (
          <span
            key={item}
            className="rounded-full bg-primary/7 px-4 py-2 text-sm font-semibold text-on-surface-variant ring-1 ring-primary/10"
          >
            {item}
          </span>
        ))}
      </div>

      <Link
        href={`/kurumsal-cozumler/${solution.slug}`}
        className="relative z-10 mt-10 inline-flex w-fit items-center gap-2 rounded-full text-sm font-bold text-primary transition-all duration-300 group-hover:gap-3"
      >
        Çözümü İncele
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </article>
  );
}