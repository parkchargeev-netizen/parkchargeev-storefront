import clsx from "clsx";

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
  variant?: "default" | "service";
};

export function ManagedPageRenderer({ page, variant = "default" }: ManagedPageRendererProps) {
  return (
    <main
      className={clsx(
        "managed-page mx-auto px-4 py-10 sm:px-6 lg:px-8",
        variant === "service" ? "managed-page--service max-w-6xl" : "max-w-5xl"
      )}
      data-motion-scope
    >
      <section className="managed-page__header border-b border-outline-variant/40 pb-9">
        <PageHeader eyebrow={page.eyebrow} title={page.title} body={page.excerpt} />
      </section>

      <article
        className="managed-richtext mt-9 max-w-none text-on-surface-variant"
        data-motion="reveal"
        dangerouslySetInnerHTML={{
          __html: sanitizeRichTextHtml(page.body)
        }}
      />
    </main>
  );
}
