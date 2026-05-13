"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { adminBlogPostSchema } from "@/server/admin/validators";

type BlogPostValues = z.infer<typeof adminBlogPostSchema>;

const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor").then((module) => module.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[220px] rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Editör yükleniyor...
      </div>
    )
  }
);

type BlogPostFormProps = {
  mode: "create" | "edit";
  postId?: string;
  initialValues?: Partial<BlogPostValues>;
};

export function BlogPostForm({ mode, postId, initialValues }: BlogPostFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<BlogPostValues>({
    resolver: zodResolver(adminBlogPostSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      slug: initialValues?.slug ?? "",
      excerpt: initialValues?.excerpt ?? "",
      body: initialValues?.body ?? "<p></p>",
      seoTitle: initialValues?.seoTitle ?? "",
      seoDescription: initialValues?.seoDescription ?? "",
      publishedAt: initialValues?.publishedAt ?? ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setFeedback(null);
    const endpoint = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${postId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...values,
        slug: values.slug || values.title
      })
    });
    const data = (await response.json()) as { ok: boolean; message?: string; post?: { id: string } };

    if (!data.ok) {
      setFeedback(data.message ?? "İçerik kaydedilemedi.");
      return;
    }

    setFeedback("İçerik kaydedildi.");

    if (mode === "create" && data.post?.id) {
      router.push(`/admin/blog/${data.post.id}`);
      return;
    }

    router.refresh();
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          placeholder="Başlık"
          {...register("title")}
        />
        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          placeholder="Slug"
          {...register("slug")}
        />
      </div>
      <textarea
        rows={3}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
        placeholder="Özet"
        {...register("excerpt")}
      />
      <Controller
        control={control}
        name="body"
        render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          placeholder="SEO title"
          {...register("seoTitle")}
        />
        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          placeholder="Yayın tarihi"
          type="datetime-local"
          {...register("publishedAt")}
        />
      </div>
      <textarea
        rows={3}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
        placeholder="SEO description"
        {...register("seoDescription")}
      />
      {errors.title || errors.excerpt || errors.body ? (
        <p className="text-sm text-red-600">
          {errors.title?.message || errors.excerpt?.message || errors.body?.message}
        </p>
      ) : null}
      {feedback ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {feedback}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isSubmitting ? "Kaydediliyor..." : "İçeriği kaydet"}
      </button>
    </form>
  );
}
