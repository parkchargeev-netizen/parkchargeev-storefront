import type { ReactNode } from "react";

type AdminFilterBarProps = {
  children: ReactNode;
};

export function AdminFilterBar({ children }: AdminFilterBarProps) {
  return (
    <section className="surface-card border border-slate-200 bg-white/95 p-6">
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
