export default function AdminPanelLoading() {
  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="soft-panel px-6 py-5">
        <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded-full bg-slate-200" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-full bg-slate-100" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="soft-panel p-5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-5 h-8 w-32 animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="soft-panel p-6">
        <div className="h-5 w-48 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
