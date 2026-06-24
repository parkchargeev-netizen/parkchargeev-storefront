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
  { value: "published", label: "Yayında" },
  { value: "archived", label: "Arşiv" }
] as const;

const frequencyOptions = ["weekly", "monthly", "daily", "yearly", "never"] as const;

const contentTemplates = [
  {
    label: "Standart sayfa",
    body:
      "<h2>Başlık</h2><p>Sayfa açıklamasını buraya yazın.</p><h3>Detaylar</h3><ul><li>Birinci madde</li><li>İkinci madde</li></ul>"
  },
  {
    label: "Hizmet sayfası",
    body:
      "<h2>Hizmet kapsamı</h2><p>Bu hizmetin kimler için uygun olduğunu açıklayın.</p><h2>Süresi ve süreci</h2><p>Keşif, teklif, kurulum ve destek adımlarını yazın.</p>"
  },
  {
    label: "SEO açılış sayfası",
    body:
      "<h2>Neden ParkChargeEV?</h2><p>Arama niyetine uygun güven unsurlarını yazın.</p><h2>Sık sorulan sorular</h2><p>Kısa cevaplarla dönüşüm odaklı bilgi verin.</p>"
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

function GuidanceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-normal text-emerald-800">
        {title}
      </p>
      <ul className="mt-2 grid gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
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

    setFeedback(data.ok ? "Sayfa kaydedildi." : data.message ?? "İşlem başarısız.");

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
      <section className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-normal text-emerald-200">
          İçerik editörü
        </p>
        <h3 className="mt-2 text-lg font-semibold">Bu sayfa nasıl hazırlanmalı?</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["1. Niyet", "Sayfanın hangi müşteri sorusunu çözdüğünü ilk cümlede netleştirin."],
            ["2. Güven", "Kurulum, garanti, ödeme, kargo ve destek bilgisini kısa cümlelerle verin."],
            ["3. Aksiyon", "Sayfa sonunda tek ana CTA bırakın: teklif al, keşif iste veya mağazaya git."]
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg bg-white/8 p-3">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-2 text-xs leading-5 text-white/70">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Sayfa kimliği</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              URL, panel listesi ve yayındaki başlık alanını bu bölüm belirler.
            </p>
          </div>
          <a
            href={previewPath}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            Önizle {previewPath}
          </a>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Sayfa başlığı
            </span>
            <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="EV şarj hizmetleri" {...register("title")} />
            <span className="text-xs text-slate-500">{watchedTitle?.length ?? 0}/180 karakter</span>
            <FieldError message={errors.title?.message} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Slug
            </span>
            <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="ev-sarj-hizmetleri" {...register("slug")} />
            <span className="text-xs text-slate-500">Yayındaki URL: {previewPath}</span>
            <FieldError message={errors.slug?.message} />
          </label>
        </div>
        <GuidanceList
          title="Başlık ve URL önerisi"
          items={[
            "Başlık 45-70 karakter aralığında, ürün veya hizmet niyetini açık söylesin.",
            "Slug kısa ve Türkçe karakter içermeyen okunabilir kelimelerden oluşsun.",
            "Önizleme linkini açıp sayfanın yayında nasıl görüneceğini kontrol edin.",
            "Ana menüye eklenecek sayfalarda başlık ve menü etiketi aynı olmak zorunda değildir."
          ]}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">Hero ve kısa özet</h3>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Üst etiket
            </span>
            <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Kurulum hizmeti" {...register("eyebrow")} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Kısa özet
            </span>
            <textarea rows={4} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Sayfanın arama sonucu ve hero açıklaması." {...register("excerpt")} />
            <span className="text-xs text-slate-500">{watchedExcerpt?.length ?? 0}/2000 karakter</span>
            <FieldError message={errors.excerpt?.message} />
          </label>
        </div>
        <GuidanceList
          title="Hero metni önerisi"
          items={[
            "Üst etiket kısa kategori gibi çalışsın: Kurulum, Site çözümü, Ticari şarj.",
            "Kısa özet tek paragraf olsun; kime uygun, ne sağlar, nasıl ilerlenir sorularını yanıtlasın.",
            "Fiyat, şehir veya teslimat kapsamı kritikse bu alanda saklamayın, açık yazın.",
            "Uzun açıklamaları gövdeye bırakın; hero metni satış kapısı gibi çalışmalı."
          ]}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">İçerik gövdesi</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              HTML desteklenir; script ve riskli etiketler yayındaki tarafta temizlenir.
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
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#063326]"
            >
              {template.label}
            </button>
          ))}
        </div>
        <textarea
          rows={12}
          className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm leading-6"
          placeholder="<h2>Başlık</h2><p>Sayfa içeriği</p>"
          {...register("body")}
        />
        <FieldError message={errors.body?.message} />
        <GuidanceList
          title="Gövde içeriği önerisi"
          items={[
            "Her bölümde tek fikir anlatın; H2 başlıkları taranabilir olsun.",
            "Madde listeleriyle kurulum adımı, garanti, uyumluluk ve sık itirazları netleştirin.",
            "HTML kullanırken h2, h3, p, ul, li ve strong etiketleri yeterlidir.",
            "Script, iframe veya karmaşık stil eklemeyin; yayın tarafı performans için temizlenir."
          ]}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">SEO ve sosyal paylaşım</h3>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              SEO title
            </span>
            <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Google başlığı" {...register("seoTitle")} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Canonical URL
            </span>
            <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="https://parkchargeev.com/sayfa" {...register("canonicalUrl")} />
          </label>
        </div>
        <label className="mt-3 grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
            SEO description
          </span>
          <textarea rows={3} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Arama sonucunda görünecek özet." {...register("seoDescription")} />
        </label>
        <label className="mt-3 grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
            OG image URL
          </span>
          <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="https://..." {...register("ogImageUrl")} />
        </label>
        <GuidanceList
          title="SEO kontrol listesi"
          items={[
            "SEO title anahtar kelimeyi ve marka adını doğal biçimde taşısın.",
            "SEO description 140-160 karakter civarında, tıklama vaadini net versin.",
            "Canonical URL yalnızca özel bir gereklilik varsa doldurulsun.",
            "Sosyal görsel yüksek kaliteli ve mümkünse 1200x630 oranında olsun."
          ]}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">Yayın ve sitemap</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-[160px_170px_160px_minmax(160px,1fr)_minmax(140px,1fr)]">
          <select className="rounded-lg border border-slate-300 px-4 py-3 text-sm" {...register("status")}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select className="rounded-lg border border-slate-300 px-4 py-3 text-sm" {...register("changeFrequency")}>
            {frequencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input type="number" className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="SEO öncelik" {...register("sitemapPriority", { valueAsNumber: true })} />
          <label className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("showInSitemap")} />
            Sitemap listesine ekle
          </label>
          <label className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("noIndex")} />
            Noindex
          </label>
        </div>
        {watchedNoIndex ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Noindex aktifse sayfa sitemap listesinde görünmez ve arama motorlarına indexlenmemesi söylenir.
          </p>
        ) : null}
        <GuidanceList
          title="Yayın kararı"
          items={[
            "Taslak içerik ziyaretçiye görünmez; yayın için Published durumunu seçin.",
            "Satışa destek veren sayfalar sitemap içinde kalmalı.",
            "Teşekkür, test veya kampanya sonrası kapanan sayfalarda noindex kullanılabilir.",
            "Öncelik değeri ana hizmet sayfalarında yüksek, destek sayfalarında orta tutulabilir."
          ]}
        />
      </section>

      {feedback ? <p className="text-sm text-slate-600">{feedback}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70 lg:w-auto"
      >
        {isSubmitting ? "Kaydediliyor..." : mode === "create" ? "Detaylı sayfa ekle" : "Sayfayı güncelle"}
      </button>
    </form>
  );
}
