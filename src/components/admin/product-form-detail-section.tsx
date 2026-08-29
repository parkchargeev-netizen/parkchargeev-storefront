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
  infoCardFields: UseFieldArrayReturn<ProductFormValues, "detailContent.infoCards", "fieldId">;
  readinessFields: UseFieldArrayReturn<ProductFormValues, "detailContent.purchaseReadiness", "fieldId">;
  trustBlockFields: UseFieldArrayReturn<ProductFormValues, "detailContent.trustBlocks", "fieldId">;
  policyFields: UseFieldArrayReturn<ProductFormValues, "detailContent.policyDetails", "fieldId">;
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
  infoCardFields,
  readinessFields,
  trustBlockFields,
  policyFields,
  faqFields
}: ProductFormDetailSectionProps) {
  return (
      <section id="detay" className="surface-card scroll-mt-28 overflow-hidden border border-slate-200 bg-white/95 p-0">
        <details className="group">
          <summary className="flex cursor-pointer list-none flex-col gap-2 px-6 py-5 transition hover:bg-emerald-50/55 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="block text-xs font-bold uppercase tracking-normal text-emerald-700">Gelişmiş ayar</span>
              <span className="mt-1 block text-lg font-semibold text-slate-950">Ürün sayfası içeriği</span>
              <span className="mt-1 block max-w-3xl text-sm leading-6 text-slate-600">Rozetler, karar kartları, güven metinleri, yorum metinleri ve SSS alanlarını yalnızca ihtiyaç olduğunda düzenleyin.</span>
            </span>
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 group-open:bg-[#063326] group-open:text-white">
              Aç / kapat
            </span>
          </summary>
          <div className="border-t border-slate-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">Ürün detay sayfası</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ürün sayfasındaki galeri etiketleri, karar kutuları, destek alanı ve güven metinleri
            ürün kaydıyla birlikte yönetilir.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <ExampleHint>Çok satırlı alanlarda her satır ayrı madde olur. Örnek: Ön görünüm, Yan profil, Montaj görünümü.</ExampleHint>
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
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Galeri özellik rozetleri
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              value={detailContent.galleryFeatureLabels?.join("\n") ?? ""}
              onChange={(event) =>
                setValue("detailContent.galleryFeatureLabels", splitLines(event.target.value), {
                  shouldValidate: true
                })
              }
            />
          </div>
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Galeri cihaz notu"
            {...register("detailContent.galleryDeviceCaption")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Ürün adı üstü ana rozet / üst metin"
            {...register("detailContent.heroEyebrow")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Ürün açıklaması üst başlığı"
            {...register("detailContent.descriptionEyebrow")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Ürün açıklaması ana başlığı"
            {...register("detailContent.descriptionHeading")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Teknik özellikler başlığı"
            {...register("detailContent.specsHeading")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Satın alma niyetleri başlığı"
            {...register("detailContent.intentHeading")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Kullanım senaryoları başlığı"
            {...register("detailContent.useCasesHeading")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Kullanım CTA metni"
            {...register("detailContent.useCasesCtaLabel")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Kullanım CTA linki"
            {...register("detailContent.useCasesCtaHref")}
          />
          <textarea
            rows={3}
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2"
            placeholder="Satın alma niyetleri açıklaması"
            {...register("detailContent.intentBody")}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Satın alma niyeti etiketleri
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
              Kullanım senaryoları
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
            placeholder="Öne çıkan avantajlar başlığı"
            {...register("detailContent.highlightsHeading")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="SSS başlığı"
            {...register("detailContent.faqHeading")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="İlgili ürünler üst başlığı"
            {...register("detailContent.relatedEyebrow")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="İlgili ürünler başlığı"
            {...register("detailContent.relatedHeading")}
          />
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register("detailContent.relatedEnabled")} />
            İlgili ürünler bölümünü göster
          </label>
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="İlgili ürün gösterim adedi"
            type="number"
            min={0}
            max={12}
            {...register("detailContent.relatedLimit", { valueAsNumber: true })}
          />
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register("detailContent.smartFeaturesEnabled")} />
            Bağlantı/kontrol bölümünü göster
          </label>
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Bağlantı/kontrol üst başlığı"
            {...register("detailContent.smartFeaturesEyebrow")}
          />
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2"
            placeholder="Bağlantı/kontrol ana başlığı"
            {...register("detailContent.smartFeaturesHeading")}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Öne çıkan avantaj maddeleri
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              value={detailContent.highlights?.join("\n") ?? ""}
              onChange={(event) =>
                setValue("detailContent.highlights", splitLines(event.target.value), {
                  shouldValidate: true
                })
              }
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Satın alma güven maddeleri
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              value={detailContent.purchaseBenefits?.join("\n") ?? ""}
              onChange={(event) =>
                setValue("detailContent.purchaseBenefits", splitLines(event.target.value), {
                  shouldValidate: true
                })
              }
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Karar bilgilendirme kutuları
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              value={detailContent.decisionChecks?.join("\n") ?? ""}
              onChange={(event) =>
                setValue("detailContent.decisionChecks", splitLines(event.target.value), {
                  shouldValidate: true
                })
              }
            />
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Ürün etiketleri</h3>
              <p className="mt-1 text-sm text-slate-500">
                Ürün adı üstü, görsel köşeleri ve ürün kartı içindeki badge metinlerini buradan yönetin.
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
                  <option value="neutral">Nötr</option>
                  <option value="primary">Birincil</option>
                  <option value="success">Yeşil</option>
                  <option value="warning">Sarı/Turuncu</option>
                  <option value="danger">Kırmızı</option>
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
                  placeholder="Sıra"
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

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Görsel altı hızlı bilgi kartları</h3>
              <p className="mt-1 text-sm text-slate-500">
                Kategori, Kullanım, Altyapı, Güç, Soket ve Kurulum kartları bu listeden beslenir.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                infoCardFields.append({
                  label: "",
                  value: "",
                  description: "",
                  iconName: "",
                  isActive: true,
                  sortOrder: infoCardFields.fields.length + 1
                })
              }
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Bilgi kartı ekle
            </button>
          </div>
          <div className="space-y-3">
            {infoCardFields.fields.map((field, index) => (
              <div
                key={field.fieldId}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[180px_1fr_120px_auto]"
              >
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Başlık"
                  {...register(`detailContent.infoCards.${index}.label`)}
                />
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Değer"
                  {...register(`detailContent.infoCards.${index}.value`)}
                />
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Sıra"
                  type="number"
                  {...register(`detailContent.infoCards.${index}.sortOrder`, { valueAsNumber: true })}
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" {...register(`detailContent.infoCards.${index}.isActive`)} />
                    Aktif
                  </label>
                  <button
                    type="button"
                    onClick={() => infoCardFields.remove(index)}
                    className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-700"
                  >
                    Sil
                  </button>
                </div>
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2"
                  placeholder="Açıklama (opsiyonel)"
                  {...register(`detailContent.infoCards.${index}.description`)}
                />
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2"
                  placeholder="İkon adı (opsiyonel)"
                  {...register(`detailContent.infoCards.${index}.iconName`)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Ürün özeti kartları
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Ürün açıklamasının üstünde görünen Güç, Bağlantı, Kurulum ve Kullanım gibi
                kısa karar kartlarını buradan yönetin.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                readinessFields.append({
                  label: "",
                  value: "",
                  description: "",
                  iconName: "",
                  isActive: true,
                  sortOrder: readinessFields.fields.length + 1
                })
              }
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Özet kart ekle
            </button>
          </div>
          <div className="space-y-3">
            {readinessFields.fields.map((field, index) => (
              <div
                key={field.fieldId}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[180px_1fr_120px_auto]"
              >
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Başlık"
                  {...register(`detailContent.purchaseReadiness.${index}.label`)}
                />
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Değer"
                  {...register(`detailContent.purchaseReadiness.${index}.value`)}
                />
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Sıra"
                  type="number"
                  {...register(`detailContent.purchaseReadiness.${index}.sortOrder`, { valueAsNumber: true })}
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" {...register(`detailContent.purchaseReadiness.${index}.isActive`)} />
                    Aktif
                  </label>
                  <button
                    type="button"
                    onClick={() => readinessFields.remove(index)}
                    className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-700"
                  >
                    Sil
                  </button>
                </div>
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2"
                  placeholder="Kart açıklaması"
                  {...register(`detailContent.purchaseReadiness.${index}.description`)}
                />
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2"
                  placeholder="İkon adı (güç, bağlantı, kurulum, kontrol...)"
                  {...register(`detailContent.purchaseReadiness.${index}.iconName`)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Destek kutusu başlığı"
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
            placeholder="Destek kutusu açıklaması"
            {...register("detailContent.support.body")}
          />
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              <input type="checkbox" {...register("detailContent.trustEnabled")} />
              Güven ve satın alma bölümünü göster
            </label>
            <input
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
              placeholder="Güven bölümü üst başlığı"
              {...register("detailContent.trustEyebrow")}
            />
            <input
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
              placeholder="Güven bölümü başlığı"
              {...register("detailContent.trustHeading")}
            />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Güven kartları</h3>
            <button
              type="button"
              onClick={() =>
                trustBlockFields.append({
                  title: "",
                  body: "",
                  iconName: "shield",
                  isActive: true,
                  sortOrder: trustBlockFields.fields.length + 1
                })
              }
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Güven kartı ekle
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {trustBlockFields.fields.map((field, index) => (
              <div
                key={field.fieldId}
                className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_140px_120px_auto]"
              >
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Kart başlığı"
                  {...register(`detailContent.trustBlocks.${index}.title`)}
                />
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="İkon"
                  {...register(`detailContent.trustBlocks.${index}.iconName`)}
                />
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Sıra"
                  type="number"
                  {...register(`detailContent.trustBlocks.${index}.sortOrder`, { valueAsNumber: true })}
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" {...register(`detailContent.trustBlocks.${index}.isActive`)} />
                    Aktif
                  </label>
                  <button
                    type="button"
                    onClick={() => trustBlockFields.remove(index)}
                    className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-700"
                  >
                    Sil
                  </button>
                </div>
                <textarea
                  rows={2}
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-4"
                  placeholder="Kart açıklaması"
                  {...register(`detailContent.trustBlocks.${index}.body`)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
          <h3 className="text-base font-semibold text-slate-900 md:col-span-3">
            Satın alma buton ve durum metinleri
          </h3>
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Fiyat üst metni" {...register("detailContent.actionLabels.priceEyebrow")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Sepete ekle metni" {...register("detailContent.actionLabels.addToCartLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Stok yok metni" {...register("detailContent.actionLabels.outOfStockLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Teknik özellik butonu" {...register("detailContent.actionLabels.specsButtonLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Sepet link metni" {...register("detailContent.actionLabels.cartLinkLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Mobil toplam etiketi" {...register("detailContent.actionLabels.mobileTotalLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Adet etiketi" {...register("detailContent.actionLabels.quantityLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Ara toplam etiketi" {...register("detailContent.actionLabels.subtotalLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Sepet feedback şablonu" {...register("detailContent.actionLabels.feedbackTemplate")} />
        </div>

        <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
          <h3 className="text-base font-semibold text-slate-900 md:col-span-2">
            Ürün yorumları metinleri
          </h3>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            <input type="checkbox" {...register("detailContent.reviews.isEnabled")} />
            Yorum bölümünü göster
          </label>
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Yorum üst başlığı" {...register("detailContent.reviews.eyebrow")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Yorum ana başlığı" {...register("detailContent.reviews.heading")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Yorum sayısı etiketi" {...register("detailContent.reviews.countLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="İlk yorum etiketi" {...register("detailContent.reviews.firstReviewLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Gönder butonu" {...register("detailContent.reviews.submitLabel")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Gönderiliyor metni" {...register("detailContent.reviews.submittingLabel")} />
          <textarea rows={2} className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2" placeholder="Boş yorum durumu" {...register("detailContent.reviews.emptyText")} />
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2" placeholder="Başarılı yorum mesajı" {...register("detailContent.reviews.successMessage")} />
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Teslimat, iade ve garanti akordiyonları
              </h3>
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" {...register("detailContent.policiesEnabled")} />
                Bu bölümü ürün sayfasında göster
              </label>
            </div>
            <button
              type="button"
              onClick={() => policyFields.append({ title: "", body: "" })}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Akordiyon ekle
            </button>
          </div>
          <div className="space-y-3">
            {policyFields.fields.map((field, index) => (
              <div
                key={field.fieldId}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[240px_1fr_auto]"
              >
                <input
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Başlık"
                  {...register(`detailContent.policyDetails.${index}.title`)}
                />
                <textarea
                  rows={2}
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Açıklama"
                  {...register(`detailContent.policyDetails.${index}.body`)}
                />
                <button
                  type="button"
                  onClick={() => policyFields.remove(index)}
                  className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-700"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Sık sorulan sorular</h3>
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
                  placeholder="Yanıt"
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
