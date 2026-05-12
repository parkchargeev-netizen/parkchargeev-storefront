"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { adminSitePageSchema } from "@/server/admin/validators";

type SitePageValues = z.input<typeof adminSitePageSchema>;

type SitePageFormProps = {
  mode: "create" | "edit";
  page?: Partial<SitePageValues> & { id?: string };
};

const statusOptions = [
  { value: "draft", label: "Taslak" },
  { value: "published", label: "Yayinda" },
  { value: "archived", label: "Arsiv" }
] as const;

const frequencyOptions = ["weekly", "monthly", "daily", "yearly", "never"] as const;

const contentTemplates = [
  {
    label: "Standart sayfa",
    body:
      "<h2>Baslik</h2><p>Sayfa aciklamasini buraya yazin.</p><h3>Detaylar</h3><ul><li>Birinci madde</li><li>Ikinci madde</li></ul>"
  },
  {
    label: "Hizmet sayfasi",
    body:
      "<h2>Hizmet kapsami</h2><p>Bu hizmetin kimler icin uygun oldugunu aciklayin.</p><h2>Suresi ve sureci</h2><p>Kesif, teklif, kurulum ve destek adimlarini yazin.</p>"
  },
  {
    label: "SEO landing",
    body:
      "<h2>Neden ParkChargeEV?</h2><p>Arama niyetine uygun guven unsurlarini yazin.</p><h2>Sik sorulan sorular</h2><p>Kisa cevaplarla donusum odakli bilgi verin.</p>"
  }
];

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-medium text-red-600">{message}</p> : null;
}

function countWords(value?: string) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function SitePageForm({ mode, page }: SitePageFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<SitePageValues>({
    resolver: zodResolver(adminSitePageSchema),
    defaultValues: {
      slug: page?.slug ?? "",
      title: page?.title ?? "",
      eyebrow: page?.eyebrow ?? "",
      excerpt: page?.excerpt ?? "",
      body: page?.body ?? "<p></p>",
      seoTitle: page?.seoTitle ?? "",
      seoDescription: page?.seoDescription ?? "",
      canonicalUrl: page?.canonicalUrl ?? "",
      ogImageUrl: page?.ogImageUrl ?? "",
      status: page?.status ?? "draft",
      showInSitemap: page?.showInSitemap ?? true,
      noIndex: page?.noIndex ?? false,
      sitemapPriority: page?.sitemapPriority ?? 70,
      changeFrequency: page?.changeFrequency ?? "monthly"
    }
  });
  const watchedSlug = watch("slug");
  const watchedTitle = watch("title");
  const watchedExcerpt = watch("excerpt");
  const watchedBody = watch("body");
  const watchedNoIndex = watch("noIndex");
  const previewPath = useMemo(() => {
    const normalized = (watchedSlug ?? "").replace(/^\/+|\/+$/g, "");
    return normalized ? `/${normalized}` : "/";
  }, [watchedSlug]);
  const wordCount = countWords(watchedBody);

  const onSubmit = handleSubmit(async (values) => {
    setFeedback(null);
    const response = await fetch("/api/admin/site/pages", {
      method: mode === "create" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...values,
        id: page?.id
      })
    });
    const data = (await response.json()) as { ok: boolean; message?: string };

    setFeedback(data.ok ? "Sayfa kaydedildi." : data.message ?? "Islem basarisiz.");

    if (data.ok) {
      if (mode === "create") {
        reset({
          slug: "",
          title: "",
          eyebrow: "",
          excerpt: "",
          body: "<p></p>",
          seoTitle: "",
          seoDescription: "",
          canonicalUrl: "",
          ogImageUrl: "",
          status: "draft",
          showInSitemap: true,
          noIndex: false,
          sitemapPriority: 70,
          changeFrequency: "monthly"
        });
      }

      router.refresh();
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Sayfa kimligi</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              URL, panel listesi ve public baslik alanini bu bolum belirler.
            </p>
          </div>
          <a
            href={previewPath}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            Onizle {previewPath}
          </a>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Sayfa basligi
            </span>
            <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="EV sarj hizmetleri" {...register("title")} />
            <span className="text-xs text-slate-500">{watchedTitle?.length ?? 0}/180 karakter</span>
            <FieldError message={errors.title?.message} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Slug
            </span>
            <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="ev-sarj-hizmetleri" {...register("slug")} />
            <span className="text-xs text-slate-500">Public URL: {previewPath}</span>
            <FieldError message={errors.slug?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">Hero ve kisa ozet</h3>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Ust etiket
            </span>
            <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Kurulum hizmeti" {...register("eyebrow")} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Kisa ozet
            </span>
            <textarea rows={4} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Sayfanin arama sonucu ve hero aciklamasi." {...register("excerpt")} />
            <span className="text-xs text-slate-500">{watchedExcerpt?.length ?? 0}/2000 karakter</span>
            <FieldError message={errors.excerpt?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Icerik govdesi</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              HTML desteklenir; script ve riskli tagler public tarafta temizlenir.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {wordCount} kelime
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {contentTemplates.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => setValue("body", template.body, { shouldDirty: true, shouldValidate: true })}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {template.label}
            </button>
          ))}
        </div>
        <textarea
          rows={12}
          className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm leading-6"
          placeholder="<h2>Baslik</h2><p>Sayfa icerigi</p>"
          {...register("body")}
        />
        <FieldError message={errors.body?.message} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">SEO ve sosyal paylasim</h3>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              SEO title
            </span>
            <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Google basligi" {...register("seoTitle")} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Canonical URL
            </span>
            <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="https://parkchargeev.com/sayfa" {...register("canonicalUrl")} />
          </label>
        </div>
        <label className="mt-3 grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            SEO description
          </span>
          <textarea rows={3} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Arama sonucunda gorunecek ozet." {...register("seoDescription")} />
        </label>
        <label className="mt-3 grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            OG image URL
          </span>
          <input className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="https://..." {...register("ogImageUrl")} />
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">Yayin ve sitemap</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-[160px_170px_160px_minmax(160px,1fr)_minmax(140px,1fr)]">
          <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("status")}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("changeFrequency")}>
            {frequencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input type="number" className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="SEO oncelik" {...register("sitemapPriority", { valueAsNumber: true })} />
          <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("showInSitemap")} />
            Sitemap listesine ekle
          </label>
          <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("noIndex")} />
            Noindex
          </label>
        </div>
        {watchedNoIndex ? (
          <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Noindex aktifse sayfa sitemap listesinde gorunmez ve arama motorlarina indexlenmemesi soylenir.
          </p>
        ) : null}
      </section>

      {feedback ? <p className="text-sm text-slate-600">{feedback}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70 lg:w-auto"
      >
        {isSubmitting ? "Kaydediliyor..." : mode === "create" ? "Detayli sayfa ekle" : "Sayfayi guncelle"}
      </button>
    </form>
  );
}
