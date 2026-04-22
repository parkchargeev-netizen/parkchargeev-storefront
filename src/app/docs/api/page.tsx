export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <section className="surface-card p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
          API Service Doc
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.07em] text-on-surface">
          ParkChargeEV servis dokumani
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-on-surface-variant">
          Bu dokuman, AI agent ve arama motoru odakli servis kesfini desteklemek icin
          yayinlanir. Faz 1 kapsaminda saglik, admin oturum ve katalog kesif endpoint&apos;leri
          burada referanslanir.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-[24px] bg-surface-container-low p-5">
            <h2 className="text-lg font-semibold text-on-surface">Health</h2>
            <p className="mt-3 text-sm text-on-surface-variant">`/api/health`</p>
          </article>
          <article className="rounded-[24px] bg-surface-container-low p-5">
            <h2 className="text-lg font-semibold text-on-surface">API Catalog</h2>
            <p className="mt-3 text-sm text-on-surface-variant">
              `/.well-known/api-catalog`
            </p>
          </article>
          <article className="rounded-[24px] bg-surface-container-low p-5">
            <h2 className="text-lg font-semibold text-on-surface">OpenAPI</h2>
            <p className="mt-3 text-sm text-on-surface-variant">
              `/.well-known/openapi.json`
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
