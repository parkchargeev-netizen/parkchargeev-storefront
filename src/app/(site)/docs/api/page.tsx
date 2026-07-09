export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <section className="surface-card p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary">
          API Service Doc
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-normal text-on-surface">
          ParkChargeEV servis dokümanı
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-on-surface-variant">
          Bu doküman, AI agent ve arama motoru odaklı servis keşfini desteklemek için
          yayınlanır. Faz 1 kapsamında sağlık, admin oturum ve katalog keşif endpoint&apos;leri
          burada referanslanır.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-lg bg-surface-container-low p-5">
            <h2 className="text-lg font-semibold text-on-surface">Health</h2>
            <p className="mt-3 text-sm text-on-surface-variant">`/api/health`</p>
          </article>
          <article className="rounded-lg bg-surface-container-low p-5">
            <h2 className="text-lg font-semibold text-on-surface">API Catalog</h2>
            <p className="mt-3 text-sm text-on-surface-variant">
              `/.well-known/api-catalog`
            </p>
          </article>
          <article className="rounded-lg bg-surface-container-low p-5">
            <h2 className="text-lg font-semibold text-on-surface">OpenAPI</h2>
            <p className="mt-3 text-sm text-on-surface-variant">
              `/.well-known/openapi.json`
            </p>
          </article>
          <article className="rounded-lg bg-surface-container-low p-5">
            <h2 className="text-lg font-semibold text-on-surface">AI Summary</h2>
            <p className="mt-3 text-sm text-on-surface-variant">`/llms.txt`</p>
          </article>
          <article className="rounded-lg bg-surface-container-low p-5">
            <h2 className="text-lg font-semibold text-on-surface">AI Full</h2>
            <p className="mt-3 text-sm text-on-surface-variant">`/llms-full.txt`</p>
          </article>
          <article className="rounded-lg bg-surface-container-low p-5">
            <h2 className="text-lg font-semibold text-on-surface">Image Sitemap</h2>
            <p className="mt-3 text-sm text-on-surface-variant">`/image-sitemap.xml`</p>
          </article>
        </div>
      </section>
    </div>
  );
}
