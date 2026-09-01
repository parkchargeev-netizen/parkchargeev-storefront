"use client";

import { memo } from "react";
import type { z } from "zod";
import type {
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormSetValue
} from "react-hook-form";

import { productBadgePlacementGroups } from "@/lib/product-detail-content";
import { adminProductSchema } from "@/server/admin/validators";

type ProductFormValues = z.input<typeof adminProductSchema>;
type ProductDetailFormValues = NonNullable<ProductFormValues["detailContent"]>;

type ProductFormDetailSectionProps = {
  detailContent: ProductDetailFormValues;
  register: UseFormRegister<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  badgeFields: UseFieldArrayReturn<ProductFormValues, "detailContent.badges", "fieldId">;
  faqFields: UseFieldArrayReturn<ProductFormValues, "detailContent.faqs", "fieldId">;
};

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ExampleHint({ children }: { children: string }) {
  return <p className="mt-2 text-xs leading-5 text-slate-500">{children}</p>;
}

function ProductFormDetailSectionComponent({
  detailContent,
  register,
  setValue,
  badgeFields,
  faqFields
}: ProductFormDetailSectionProps) {
  return (
      <section id="detay" className="surface-card scroll-mt-28 overflow-hidden border border-slate-200 bg-white/95 p-0">
        <details className="group">
          <summary className="flex cursor-pointer list-none flex-col gap-2 px-6 py-5 transition hover:bg-emerald-50/55 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="block text-xs font-bold uppercase tracking-normal text-emerald-700">GeliÅŸmiÅŸ ayar</span>
              <span className="mt-1 block text-lg font-semibold text-slate-950">ÃœrÃ¼n sayfasÄ± iÃ§eriÄŸi</span>
              <span className="mt-1 block max-w-3xl text-sm leading-6 text-slate-600">Rozetler, yorum metinleri ve SSS alanlarÄ±nÄ± yalnÄ±zca ihtiyaÃ§ olduÄŸunda dÃ¼zenleyin.</span>
            </span>
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 group-open:bg-[#063326] group-open:text-white">
              AÃ§ / kapat
            </span>
          </summary>
          <div className="border-t border-slate-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">ÃœrÃ¼n detay sayfasÄ±</h2>
          <p className="mt-1 text-sm text-slate-600">
            ÃœrÃ¼n sayfasÄ±ndaki rozet, destek ve SSS iÃ§erikleri Ã¼rÃ¼n kaydÄ±yla birlikte yÃ¶netilir.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <ExampleHint>Ã‡ok satÄ±rlÄ± alanlarda her satÄ±r ayrÄ± madde olur. Ã–rnek: Ã–n gÃ¶rÃ¼nÃ¼m, Yan profil, Montaj gÃ¶rÃ¼nÃ¼mÃ¼.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Galeri sekmeleri
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              value={detailContent.galleryItems?.join("\n") ?? ""}
              onChange={(event) =>
                setValue("detailContent.galleryItems", splitLines(event.target.value), {
                  shouldValidate: true
                })
              }
            />
          </div>
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="ÃœrÃ¼n adÄ± Ã¼stÃ¼ ana rozet / Ã¼st metin"
            {...register("detailContent.heroEyebrow")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="ÃœrÃ¼n aÃ§Ä±klamasÄ± Ã¼st baÅŸlÄ±ÄŸÄ±"
            {...register("detailContent.descriptionEyebrow")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="ÃœrÃ¼n aÃ§Ä±klamasÄ± ana baÅŸlÄ±ÄŸÄ±"
            {...register("detailContent.descriptionHeading")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Teknik Ã¶zellikler baÅŸlÄ±ÄŸÄ±"
            {...register("detailContent.specsHeading")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="SatÄ±n alma niyetleri baÅŸlÄ±ÄŸÄ±"
            {...register("detailContent.intentHeading")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="KullanÄ±m senaryolarÄ± baÅŸlÄ±ÄŸÄ±"
            {...register("detailContent.useCasesHeading")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="KullanÄ±m CTA metni"
            {...register("detailContent.useCasesCtaLabel")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="KullanÄ±m CTA linki"
            {...register("detailContent.useCasesCtaHref")}
          />
          <textarea
            rows={3}
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2"
            placeholder="SatÄ±n alma niyetleri aÃ§Ä±klamasÄ±"
            {...register("detailContent.intentBody")}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              SatÄ±n alma niyeti etiketleri
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              value={detailContent.seoIntents?.join("\n") ?? ""}
              onChange={(event) =>
                setValue("detailContent.seoIntents", splitLines(event.target.value), {
                  shouldValidate: true
                })
              }
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              KullanÄ±m senaryolarÄ±
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              value={detailContent.useCases?.join("\n") ?? ""}
              onChange={(event) =>
                setValue("detailContent.useCases", splitLines(event.target.value), {
                  shouldValidate: true
                })
              }
            />
          </div>

          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="SSS baÅŸlÄ±ÄŸÄ±"
            {...register("detailContent.faqHeading")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Ä°lgili Ã¼rÃ¼nler Ã¼st baÅŸlÄ±ÄŸÄ±"
            {...register("detailContent.relatedEyebrow")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Ä°lgili Ã¼rÃ¼nler baÅŸlÄ±ÄŸÄ±"
            {...register("detailContent.relatedHeading")}
          />
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register("detailContent.relatedEnabled")} />
            Ä°lgili Ã¼rÃ¼nler bÃ¶lÃ¼mÃ¼nÃ¼ gÃ¶ster
          </label>
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Ä°lgili Ã¼rÃ¼n gÃ¶sterim adedi"
            type="number"
            min={0}
            max={12}
            {...register("detailContent.relatedLimit", { valueAsNumber: true })}
          />



        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">ÃœrÃ¼n etiketleri</h3>
              <p className="mt-1 text-sm text-slate-500">
                ÃœrÃ¼n adÄ± Ã¼stÃ¼, gÃ¶rsel kÃ¶ÅŸeleri ve Ã¼rÃ¼n kartÄ± iÃ§indeki badge metinlerini buradan yÃ¶netin.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                badgeFields.append({
                  label: "",
                  tone: "neutral",
                  position: "detail_title_top",
                  isActive: true,
                  sortOrder: badgeFields.fields.length + 1
                })
              }
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Etiket ekle
            </button>
          </div>
          <div className="space-y-3">
            {badgeFields.fields.map((field, index) => (
              <div
                key={field.fieldId}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_160px_280px_110px_auto]"
              >
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Etiket metni"
                  {...register(`detailContent.badges.${index}.label`)}
                />
                <select
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  {...register(`detailContent.badges.${index}.tone`)}
                >
                  <option value="neutral">NÃ¶tr</option>
                  <option value="primary">Birincil</option>
                  <option value="success">YeÅŸil</option>
                  <option value="warning">SarÄ±/Turuncu</option>
                  <option value="danger">KÄ±rmÄ±zÄ±</option>
                </select>
                <select
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  {...register(`detailContent.badges.${index}.position`)}
                >
                  {productBadgePlacementGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="SÄ±ra"
                  type="number"
                  {...register(`detailContent.badges.${index}.sortOrder`, { valueAsNumber: true })}
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" {...register(`detailContent.badges.${index}.isActive`)} />
                    Aktif
                  </label>
                  <button
                    type="button"
                    onClick={() => badgeFields.remove(index)}
                    className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-700"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Destek kutusu baÅŸlÄ±ÄŸÄ±"
            {...register("detailContent.support.title")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Destek buton metni"
            {...register("detailContent.support.ctaLabel")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Destek buton linki"
            {...register("detailContent.support.href")}
          />
          <textarea
            rows={3}
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2"
            placeholder="Destek kutusu aÃ§Ä±klamasÄ±"
            {...register("detailContent.support.body")}
          />
        </div>

        <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
          <h3 className="text-base font-semibold text-slate-900 md:col-span-3">
            SatÄ±n alma buton ve durum metinleri
          </h3>
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Fiyat Ã¼st metni" {...register("detailContent.actionLabels.priceEyebrow")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Sepete ekle metni" {...register("detailContent.actionLabels.addToCartLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Stok yok metni" {...register("detailContent.actionLabels.outOfStockLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Teknik Ã¶zellik butonu" {...register("detailContent.actionLabels.specsButtonLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Sepet link metni" {...register("detailContent.actionLabels.cartLinkLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Mobil toplam etiketi" {...register("detailContent.actionLabels.mobileTotalLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Adet etiketi" {...register("detailContent.actionLabels.quantityLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Ara toplam etiketi" {...register("detailContent.actionLabels.subtotalLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Sepet feedback ÅŸablonu" {...register("detailContent.actionLabels.feedbackTemplate")} />
        </div>

        <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
          <h3 className="text-base font-semibold text-slate-900 md:col-span-2">
            ÃœrÃ¼n yorumlarÄ± metinleri
          </h3>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            <input type="checkbox" {...register("detailContent.reviews.isEnabled")} />
            Yorum bÃ¶lÃ¼mÃ¼nÃ¼ gÃ¶ster
          </label>
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Yorum Ã¼st baÅŸlÄ±ÄŸÄ±" {...register("detailContent.reviews.eyebrow")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Yorum ana baÅŸlÄ±ÄŸÄ±" {...register("detailContent.reviews.heading")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Yorum sayÄ±sÄ± etiketi" {...register("detailContent.reviews.countLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Ä°lk yorum etiketi" {...register("detailContent.reviews.firstReviewLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="GÃ¶nder butonu" {...register("detailContent.reviews.submitLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="GÃ¶nderiliyor metni" {...register("detailContent.reviews.submittingLabel")} />
          <textarea rows={2} className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2" placeholder="BoÅŸ yorum durumu" {...register("detailContent.reviews.emptyText")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2" placeholder="BaÅŸarÄ±lÄ± yorum mesajÄ±" {...register("detailContent.reviews.successMessage")} />
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">SÄ±k sorulan sorular</h3>
            <button
              type="button"
              onClick={() => faqFields.append({ question: "", answer: "" })}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Soru ekle
            </button>
          </div>
          <div className="space-y-3">
            {faqFields.fields.map((field, index) => (
              <div
                key={field.fieldId}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[280px_1fr_auto]"
              >
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Soru"
                  {...register(`detailContent.faqs.${index}.question`)}
                />
                <textarea
                  rows={2}
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="YanÄ±t"
                  {...register(`detailContent.faqs.${index}.answer`)}
                />
                <button
                  type="button"
                  onClick={() => faqFields.remove(index)}
                  className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-700"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </div>
          </div>
        </details>
      </section>
  );
}
export const ProductFormDetailSection = memo(ProductFormDetailSectionComponent);
ProductFormDetailSection.displayName = "ProductFormDetailSection";





