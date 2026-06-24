import { PageHeader } from "@/components/ui/page-header";
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
    <main className="mx-auto max-w-5xl px-6 py-12 lg:px-8" data-motion-scope>
      <section className="border-b border-outline-variant/40 pb-10">
        <PageHeader
          eyebrow={page.eyebrow}
          title={page.title}
          body={page.excerpt}
        />
      </section>

      <article
        className="managed-richtext mt-10 max-w-none leading-8 text-on-surface-variant"
        data-motion="reveal"
        dangerouslySetInnerHTML={{
          __html: sanitizeRichTextHtml(page.body)
        }}
      />
    </main>
  );
}
