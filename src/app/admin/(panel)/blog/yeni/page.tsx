import { BlogPostForm } from "@/components/admin/blog-post-form";

export default function NewAdminBlogPostPage() {
  return (
    <div className="space-y-6">
      <section className="surface-card border border-slate-200 bg-white/95 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
          Yeni İçerik
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Blog yazısı oluştur</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Başlık, gövde, yayın tarihi ve SEO alanları tek formda kaydedilir.
        </p>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <BlogPostForm mode="create" />
      </section>
    </div>
  );
}
