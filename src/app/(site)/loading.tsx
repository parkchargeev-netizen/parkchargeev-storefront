import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function PublicSiteLoading() {
  return (
    <main
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="premium-loading-shell">
        <div className="max-w-3xl">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="mt-5 h-11 w-full max-w-2xl" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
          <Skeleton className="mt-2 h-4 w-3/4 max-w-lg" />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </main>
  );
}
