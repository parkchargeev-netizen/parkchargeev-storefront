import { Children, type ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  meta?: ReactNode;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
  meta
}: AdminPageHeaderProps) {
  const actionItems = action ? Children.toArray(action) : [];
  const metaItems = meta ? Children.toArray(meta) : [];

  return (
    <section className="surface-card border border-slate-200 bg-white/95 p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          {metaItems.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-3">{metaItems}</div>
          ) : null}
        </div>

        {actionItems.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">{actionItems}</div>
        ) : null}
      </div>
    </section>
  );
}
