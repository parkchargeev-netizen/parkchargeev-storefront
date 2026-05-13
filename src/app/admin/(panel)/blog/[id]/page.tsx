import { notFound } from "next/navigation";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { getAdminBlogPostById } from "@/server/admin/repository";

type EditBlogPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  const post = await getAdminBlogPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="surface-card border border-slate-200 bg-white/95 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
          İçerik Düzenle
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">{post.title}</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Slug, yayın tarihi, gövde ve SEO alanlarını güncelleyin.
        </p>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <BlogPostForm
          mode="edit"
          postId={post.id}
          initialValues={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            body: post.body,
            seoTitle: post.seoTitle ?? "",
            seoDescription: post.seoDescription ?? "",
            publishedAt: post.publishedAt ? post.publishedAt.toISOString().slice(0, 16) : ""
          }}
        />
      </section>
    </div>
  );
}
