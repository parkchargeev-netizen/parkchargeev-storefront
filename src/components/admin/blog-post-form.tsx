"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { adminBlogPostSchema } from "@/server/admin/validators";

type BlogPostValues = z.infer<typeof adminBlogPostSchema>;
type BlogPostSaveResponse = {
  ok: boolean;
  message?: string;
  post?: {
    id: string;
  };
};

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

async function readSaveResponse(response: Response): Promise<BlogPostSaveResponse> {
  try {
    return (await response.json()) as BlogPostSaveResponse;
  } catch {
    return {
      ok: false,
      message: response.ok
        ? "İçerik kaydedildi ancak yanıt okunamadı."
        : "İçerik kaydedilemedi."
    };
  }
}

export function BlogPostForm({ mode, postId, initialValues }: BlogPostFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    watch,
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
  const titleValue = watch("title") ?? "";
  const excerptValue = watch("excerpt") ?? "";
  const bodyValue = watch("body") ?? "";
  const seoTitleValue = watch("seoTitle") ?? "";
  const seoDescriptionValue = watch("seoDescription") ?? "";
  const plainBody = bodyValue.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const effectiveSeoTitle = seoTitleValue || titleValue;
  const effectiveDescription = seoDescriptionValue || excerptValue;
  const seoSignals = [
    {
      label: "SEO başlık",
      detail: `${effectiveSeoTitle.length}/70 karakter`,
      ok: effectiveSeoTitle.length >= 35 && effectiveSeoTitle.length <= 70
    },
    {
      label: "Meta açıklama",
      detail: `${effectiveDescription.length}/160 karakter`,
      ok: effectiveDescription.length >= 120 && effectiveDescription.length <= 320
    },
    {
      label: "GEO yerel niyet",
      detail: "Türkiye, şehir veya lokasyon bağlamı",
      ok: /türkiye|istanbul|ankara|izmir|site|apartman|iş yeri|filo|otopark/i.test(
        `${excerptValue} ${plainBody}`
      )
    },
    {
      label: "AIEO yapı",
      detail: "Başlık, soru veya SSS blokları",
      ok: /<h2|<h3|\?|faq|sss|sık sorulan/i.test(bodyValue)
    }
  ];
  const readySignalCount = seoSignals.filter((signal) => signal.ok).length;

  const onSubmit = handleSubmit(async (values) => {
    setFeedback(null);
    const endpoint = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${postId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
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
      const data = await readSaveResponse(response);

      if (!response.ok || !data.ok) {
        setFeedback(data.message ?? "İçerik kaydedilemedi.");
        return;
      }

      setFeedback("İçerik kaydedildi.");

      if (mode === "create" && data.post?.id) {
        router.push(`/admin/blog/${data.post.id}`);
        return;
      }

      router.refresh();
    } catch {
      setFeedback("Sunucuya ulaşılamadı. Bağlantıyı kontrol edip tekrar deneyin.");
    }
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
      <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              SEO / GEO / AIEO kalite kontrolü
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Admin içeriği yayına çıkmadan önce arama ve cevap motoru sinyalleri.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {readySignalCount}/{seoSignals.length} hazır
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {seoSignals.map((signal) => (
            <div
              key={signal.label}
              className={`rounded-2xl border px-4 py-3 ${
                signal.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{signal.label}</p>
                <span className="text-xs font-semibold">
                  {signal.ok ? "Hazır" : "Geliştir"}
                </span>
              </div>
              <p className="mt-1 text-xs opacity-80">{signal.detail}</p>
            </div>
          ))}
        </div>
      </section>
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
