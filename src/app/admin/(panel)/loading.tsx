function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />;
}

export default function AdminPanelLoading() {
  return (
    <div className="space-y-6">
      <section className="surface-card border border-slate-200 bg-white/95 p-8">
        <SkeletonBlock className="h-4 w-48" />
        <SkeletonBlock className="mt-4 h-10 w-full max-w-3xl" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-2xl" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <SkeletonBlock className="h-48" />
        <SkeletonBlock className="h-48" />
        <SkeletonBlock className="h-48" />
        <SkeletonBlock className="h-48" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
      </section>
    </div>
  );
}
