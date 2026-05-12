import { sanitizeRichTextHtml } from "@/lib/sanitize-html";

type ManagedPage = {
  title: string;
  eyebrow: string | null;
  excerpt: string;
  body: string;
};

type ManagedPageRendererProps = {
  page: ManagedPage;
};

export function ManagedPageRenderer({ page }: ManagedPageRendererProps) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
      <section className="border-b border-outline-variant/40 pb-10">
        {page.eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
            {page.eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
          {page.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-on-surface-variant">
          {page.excerpt}
        </p>
      </section>

      <article
        className="managed-richtext mt-10 max-w-none leading-8 text-on-surface-variant"
        dangerouslySetInnerHTML={{
          __html: sanitizeRichTextHtml(page.body)
        }}
      />
    </div>
  );
}
