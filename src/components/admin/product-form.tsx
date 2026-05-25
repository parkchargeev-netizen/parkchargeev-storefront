"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";

import {
  productCategoryOptions,
  productStatusOptions,
  productTagOptions,
  vehicleBrandOptions
} from "@/server/admin/constants";
import { defaultProductDetailContent } from "@/lib/product-detail-content";
import { adminProductSchema } from "@/server/admin/validators";

type ProductFormValues = z.input<typeof adminProductSchema>;
type ProductDetailFormValues = NonNullable<ProductFormValues["detailContent"]>;

const detailContentDefaults = defaultProductDetailContent as ProductDetailFormValues;

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

type ProductLookupOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
  lookupOptions: ProductLookupOption[];
  catalogOptions?: {
    brands: ProductLookupOption[];
    categories: Array<{
      slug: string;
      name: string;
    }>;
  };
};

const emptyValues: ProductFormValues = {
  name: "",
  slug: "",
  status: "draft",
  brandId: "",
  shortDescription: "",
  description: "<p></p>",
  useCase: "",
  sku: "",
  variantTitle: "",
  powerLabel: "",
  cableLength: "",
  priceKurus: 0,
  compareAtKurus: 0,
  stockQuantity: 0,
  minimumStockThreshold: 0,
  inventoryTrackingEnabled: true,
  isVatIncluded: true,
  discountedPriceKurus: null,
  discountEndsAt: "",
  powerKw: "",
  chargeType: "ac",
  connectorType: "",
  phaseType: "single_phase",
  ipClass: "",
  hasWifi: false,
  hasRfid: false,
  has4g: false,
  installRequired: false,
  categories: ["ev-tipi"],
  tags: [],
  vehicleBrands: [],
  relatedProductIds: [],
  accessoryProductIds: [],
  variants: [],
  media: [],
  specs: [],
  detailContent: detailContentDefaults,
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  ogImageUrl: "",
  aiSummary: "",
  searchKeywords: [],
  adminNotes: ""
};

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProductForm({
  mode,
  productId,
  initialValues,
  lookupOptions,
  catalogOptions
}: ProductFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mergedDefaults = useMemo<ProductFormValues>(
    () => ({
      ...emptyValues,
      ...initialValues,
      categories: initialValues?.categories ?? emptyValues.categories,
      tags: initialValues?.tags ?? emptyValues.tags,
      vehicleBrands: initialValues?.vehicleBrands ?? emptyValues.vehicleBrands,
      relatedProductIds: initialValues?.relatedProductIds ?? emptyValues.relatedProductIds,
      accessoryProductIds:
        initialValues?.accessoryProductIds ?? emptyValues.accessoryProductIds,
      variants: initialValues?.variants ?? emptyValues.variants,
      media: initialValues?.media ?? emptyValues.media,
      specs: initialValues?.specs ?? emptyValues.specs,
      detailContent: {
        ...detailContentDefaults,
        ...initialValues?.detailContent,
        galleryItems:
          initialValues?.detailContent?.galleryItems ?? detailContentDefaults.galleryItems,
        galleryFeatureLabels:
          initialValues?.detailContent?.galleryFeatureLabels ??
          detailContentDefaults.galleryFeatureLabels,
        purchaseBenefits:
          initialValues?.detailContent?.purchaseBenefits ??
          detailContentDefaults.purchaseBenefits,
        seoIntents:
          initialValues?.detailContent?.seoIntents ??
          detailContentDefaults.seoIntents,
        useCases:
          initialValues?.detailContent?.useCases ??
          detailContentDefaults.useCases,
        highlights:
          initialValues?.detailContent?.highlights ??
          detailContentDefaults.highlights,
        purchaseReadiness:
          initialValues?.detailContent?.purchaseReadiness ??
          detailContentDefaults.purchaseReadiness,
        decisionChecks:
          initialValues?.detailContent?.decisionChecks ??
          detailContentDefaults.decisionChecks,
        support: {
          ...detailContentDefaults.support,
          ...initialValues?.detailContent?.support
        },
        policyDetails:
          initialValues?.detailContent?.policyDetails ??
          detailContentDefaults.policyDetails,
        faqs:
          initialValues?.detailContent?.faqs ??
          detailContentDefaults.faqs
      },
      searchKeywords: initialValues?.searchKeywords ?? emptyValues.searchKeywords
    }),
    [initialValues]
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<ProductFormValues>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: mergedDefaults
  });

  useEffect(() => {
    reset(mergedDefaults);
  }, [mergedDefaults, reset]);

  const mediaFields = useFieldArray({
    control,
    name: "media"
  });

  const variantFields = useFieldArray({
    control,
    name: "variants"
  });

  const specFields = useFieldArray({
    control,
    name: "specs"
  });

  const readinessFields = useFieldArray({
    control,
    name: "detailContent.purchaseReadiness"
  });

  const policyFields = useFieldArray({
    control,
    name: "detailContent.policyDetails"
  });

  const faqFields = useFieldArray({
    control,
    name: "detailContent.faqs"
  });

  const selectedCategories = watch("categories") ?? [];
  const selectedTags = watch("tags") ?? [];
  const selectedVehicles = watch("vehicleBrands") ?? [];
  const selectedKeywords = watch("searchKeywords") ?? [];
  const detailContent = (watch("detailContent") ?? detailContentDefaults) as ProductDetailFormValues;
  const categoryOptions =
    catalogOptions?.categories.length
      ? catalogOptions.categories.map((category) => ({
          slug: category.slug,
          label: category.name
        }))
      : productCategoryOptions;

  function toggleArrayValue(field: "categories" | "tags" | "vehicleBrands", value: string) {
    const current = watch(field) ?? [];

    if (current.includes(value)) {
      setValue(
        field,
        current.filter((item) => item !== value),
        { shouldValidate: true }
      );
      return;
    }

    setValue(field, [...current, value], {
      shouldValidate: true
    });
  }

  async function uploadMediaFile(file: File, targetIndex?: number) {
    setUploadMessage(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData
    });
    const data = (await response.json()) as { ok: boolean; url?: string; message?: string };

    setIsUploading(false);

    if (!response.ok || !data.ok || !data.url) {
      setUploadMessage(data.message ?? "Görsel yüklenemedi.");
      return;
    }

    if (typeof targetIndex === "number") {
      setValue(`media.${targetIndex}.url`, data.url, { shouldValidate: true });
    } else {
      mediaFields.append({
        url: data.url,
        altText: watch("name") || "Ürün görseli",
        isPrimary: mediaFields.fields.length === 0
      });
    }

    setUploadMessage("Görsel yüklendi.");
  }

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const endpoint =
      mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const variants = (values.variants ?? []).filter((variant) => variant.sku && variant.title);
    const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0];
    const payload = {
      ...values,
      ...(defaultVariant
        ? {
            sku: defaultVariant.sku,
            variantTitle: defaultVariant.title,
            powerLabel: defaultVariant.powerLabel ?? "",
            cableLength: defaultVariant.cableLength ?? "",
            connectorType: defaultVariant.connectorType ?? values.connectorType,
            priceKurus: defaultVariant.priceKurus,
            compareAtKurus: defaultVariant.compareAtKurus ?? 0,
            stockQuantity: defaultVariant.stockQuantity
          }
        : {}),
      slug: values.slug || values.name,
      variantTitle: defaultVariant?.title || values.variantTitle || values.name,
      variants: variants.map((variant, index) => ({
        ...variant,
        isDefault: defaultVariant ? variant === defaultVariant : index === 0
      })),
      searchKeywords: (values.searchKeywords ?? []).filter(Boolean)
    };

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as { ok: boolean; message?: string; product?: { id: string } };

    if (!response.ok || !data.ok) {
      setErrorMessage(data.message ?? "Kayıt işlemi başarısız.");
      return;
    }

    setSuccessMessage(mode === "create" ? "Ürün oluşturuldu." : "Ürün güncellendi.");

    if (mode === "create" && data.product?.id) {
      router.push(`/admin/urunler/${data.product.id}`);
    } else {
      router.refresh();
    }
  });

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">Temel Bilgiler</h2>
          <p className="mt-1 text-sm text-slate-600">
            Faz 1 kapsamında ürün kimliği, fiyat, stok ve SEO alanları birlikte yönetilir.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Ürün adı</label>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("name")}
            />
            {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("slug")}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Durum</label>
            <select className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("status")}>
              {productStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Marka</label>
            <select className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("brandId")}>
              <option value="">Marka yok</option>
              {(catalogOptions?.brands ?? []).map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Kısa açıklama</label>
            <textarea
              rows={3}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("shortDescription")}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Uzun açıklama</label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <RichTextEditor value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">SKU</label>
            <input className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("sku")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Varyant başlığı</label>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("variantTitle")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Fiyat (kurus)</label>
            <input
              type="number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("priceKurus", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Karşılaştırma fiyatı</label>
            <input
              type="number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("compareAtKurus", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Kampanyalı fiyat</label>
            <input
              type="number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("discountedPriceKurus", {
                setValueAs: (value) => (value === "" ? null : Number(value))
              })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Kampanya bitişi</label>
            <input
              type="datetime-local"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("discountEndsAt")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Stok</label>
            <input
              type="number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("stockQuantity", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Min stok eşiği</label>
            <input
              type="number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("minimumStockThreshold", { valueAsNumber: true })}
            />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input type="checkbox" className="h-4 w-4" {...register("inventoryTrackingEnabled")} />
            <span className="text-sm font-medium text-slate-700">Stok takibi açık</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input type="checkbox" className="h-4 w-4" {...register("isVatIncluded")} />
            <span className="text-sm font-medium text-slate-700">KDV dahil</span>
          </div>
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Varyantlar</h2>
            <p className="mt-1 text-sm text-slate-600">
              Fiyat, stok, kablo ve konnektör bilgisini varyant bazında yönetin.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              variantFields.append({
                sku: watch("sku") || "",
                title: watch("variantTitle") || watch("name") || "",
                powerLabel: watch("powerLabel") || "",
                cableLength: watch("cableLength") || "",
                connectorType: watch("connectorType") || "",
                stockQuantity: watch("stockQuantity") || 0,
                priceKurus: watch("priceKurus") || 0,
                compareAtKurus: watch("compareAtKurus") || 0,
                isDefault: variantFields.fields.length === 0
              })
            }
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Varyant ekle
          </button>
        </div>
        <div className="space-y-4">
          {variantFields.fields.map((field, index) => (
            <div key={field.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 xl:grid-cols-6">
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="SKU"
                {...register(`variants.${index}.sku`)}
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm xl:col-span-2"
                placeholder="Başlık"
                {...register(`variants.${index}.title`)}
              />
              <input
                type="number"
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Fiyat"
                {...register(`variants.${index}.priceKurus`, { valueAsNumber: true })}
              />
              <input
                type="number"
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Stok"
                {...register(`variants.${index}.stockQuantity`, { valueAsNumber: true })}
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" {...register(`variants.${index}.isDefault`)} />
                  Varsayılan
                </label>
                <button
                  type="button"
                  onClick={() => variantFields.remove(index)}
                  className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-700"
                >
                  Sil
                </button>
              </div>
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Power label"
                {...register(`variants.${index}.powerLabel`)}
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Kablo"
                {...register(`variants.${index}.cableLength`)}
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Konnektör"
                {...register(`variants.${index}.connectorType`)}
              />
              <input
                type="number"
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Karşılaştırma"
                {...register(`variants.${index}.compareAtKurus`, { valueAsNumber: true })}
              />
            </div>
          ))}
          {variantFields.fields.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Varyant eklenmezse üstteki varsayılan SKU, fiyat ve stok alanları kaydedilir.
            </p>
          ) : null}
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Kategoriler</p>
            <div className="space-y-2">
              {categoryOptions.map((option) => (
                <label key={option.slug} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(option.slug)}
                    onChange={() => toggleArrayValue("categories", option.slug)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Vitrin rozetleri</p>
            <div className="space-y-2">
              {productTagOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(option.value)}
                    onChange={() => toggleArrayValue("tags", option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Araç uyumluluğu</p>
            <div className="space-y-2">
              {vehicleBrandOptions.map((brand) => (
                <label key={brand} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedVehicles.includes(brand)}
                    onChange={() => toggleArrayValue("vehicleBrands", brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">Teknik Alanlar</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Güç (kW)" {...register("powerKw")} />
          <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("chargeType")}>
            <option value="ac">AC</option>
            <option value="dc">DC</option>
          </select>
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Konnektör tipi" {...register("connectorType")} />
          <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("phaseType")}>
            <option value="single_phase">Monofaz</option>
            <option value="three_phase">Trifaz</option>
          </select>
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="IP sınıfı" {...register("ipClass")} />
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Power label" {...register("powerLabel")} />
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Kablo uzunluğu" {...register("cableLength")} />
          <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" {...register("hasWifi")} />
              WiFi
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" {...register("hasRfid")} />
              RFID
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" {...register("has4g")} />
              4G
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" {...register("installRequired")} />
              Kurulum gerekir
            </label>
          </div>
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Görseller</h2>
            <p className="mt-1 text-sm text-slate-600">
              Ürün detay galerisindeki görsel URL ve başlıkları buradan yönetilir.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              {isUploading ? "Yükleniyor..." : "Dosya yükle"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={isUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadMediaFile(file);
                    event.currentTarget.value = "";
                  }
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => mediaFields.append({ url: "", altText: "", isPrimary: mediaFields.fields.length === 0 })}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              URL ekle
            </button>
          </div>
        </div>
        {uploadMessage ? (
          <p className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {uploadMessage}
          </p>
        ) : null}
        <div className="space-y-4">
          {mediaFields.fields.map((field, index) => (
            <div key={field.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_240px_auto]">
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="https://..."
                {...register(`media.${index}.url`)}
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Alt text"
                {...register(`media.${index}.altText`)}
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" {...register(`media.${index}.isPrimary`)} />
                  Ana görsel
                </label>
                <label className="cursor-pointer rounded-full border border-blue-200 px-3 py-2 text-sm text-blue-700">
                  Değiştir
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={isUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadMediaFile(file, index);
                        event.currentTarget.value = "";
                      }
                    }}
                  />
                </label>
                <button type="button" onClick={() => mediaFields.remove(index)} className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-700">
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-950">Teknik özellikler</h2>
          <button
            type="button"
            onClick={() => specFields.append({ groupName: "general", label: "", value: "" })}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Özellik ekle
          </button>
        </div>
        <div className="space-y-4">
          {specFields.fields.map((field, index) => (
            <div key={field.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[180px_1fr_1fr_auto]">
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Grup" {...register(`specs.${index}.groupName`)} />
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Başlık" {...register(`specs.${index}.label`)} />
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Değer" {...register(`specs.${index}.value`)} />
              <button type="button" onClick={() => specFields.remove(index)} className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-700">
                Sil
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">Ürün detay sayfası</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ürün sayfasındaki galeri etiketleri, karar kutuları, destek alanı ve güven metinleri
            ürün kaydıyla birlikte yönetilir.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Galeri sekmeleri
            </label>
            <textarea
              rows={4}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              value={detailContent.galleryFeatureLabels?.join("\n") ?? ""}
              onChange={(event) =>
                setValue("detailContent.galleryFeatureLabels", splitLines(event.target.value), {
                  shouldValidate: true
                })
              }
            />
          </div>
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="Galeri cihaz notu"
            {...register("detailContent.galleryDeviceCaption")}
          />
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="Teknik özellikler başlığı"
            {...register("detailContent.specsHeading")}
          />
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="Satın alma niyetleri başlığı"
            {...register("detailContent.intentHeading")}
          />
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="Kullanım senaryoları başlığı"
            {...register("detailContent.useCasesHeading")}
          />
          <textarea
            rows={3}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm md:col-span-2"
            placeholder="Satın alma niyetleri açıklaması"
            {...register("detailContent.intentBody")}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Satın alma niyeti etiketleri
            </label>
            <textarea
              rows={4}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              value={detailContent.useCases?.join("\n") ?? ""}
              onChange={(event) =>
                setValue("detailContent.useCases", splitLines(event.target.value), {
                  shouldValidate: true
                })
              }
            />
          </div>
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="Öne çıkan avantajlar başlığı"
            {...register("detailContent.highlightsHeading")}
          />
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="SSS başlığı"
            {...register("detailContent.faqHeading")}
          />
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="İlgili ürünler üst başlığı"
            {...register("detailContent.relatedEyebrow")}
          />
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="İlgili ürünler başlığı"
            {...register("detailContent.relatedHeading")}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Öne çıkan avantaj maddeleri
            </label>
            <textarea
              rows={4}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
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
            <h3 className="text-base font-semibold text-slate-900">Satın alma hazırlığı</h3>
            <button
              type="button"
              onClick={() => readinessFields.append({ label: "", value: "" })}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Kart ekle
            </button>
          </div>
          <div className="space-y-3">
            {readinessFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[240px_1fr_auto]"
              >
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Başlık"
                  {...register(`detailContent.purchaseReadiness.${index}.label`)}
                />
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Değer"
                  {...register(`detailContent.purchaseReadiness.${index}.value`)}
                />
                <button
                  type="button"
                  onClick={() => readinessFields.remove(index)}
                  className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-700"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="Destek kutusu başlığı"
            {...register("detailContent.support.title")}
          />
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="Destek buton metni"
            {...register("detailContent.support.ctaLabel")}
          />
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="Destek buton linki"
            {...register("detailContent.support.href")}
          />
          <textarea
            rows={3}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm md:col-span-2"
            placeholder="Destek kutusu açıklaması"
            {...register("detailContent.support.body")}
          />
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Teslimat, iade ve garanti akordiyonları
            </h3>
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
                key={field.id}
                className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[240px_1fr_auto]"
              >
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Başlık"
                  {...register(`detailContent.policyDetails.${index}.title`)}
                />
                <textarea
                  rows={2}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
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
                key={field.id}
                className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[280px_1fr_auto]"
              >
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Soru"
                  {...register(`detailContent.faqs.${index}.question`)}
                />
                <textarea
                  rows={2}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
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
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">SEO + AIEO</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Meta başlık" {...register("seoTitle")} />
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Kanonik URL" {...register("canonicalUrl")} />
          <textarea rows={3} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm md:col-span-2" placeholder="Meta açıklama" {...register("seoDescription")} />
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm md:col-span-2" placeholder="Open Graph görsel URL" {...register("ogImageUrl")} />
          <textarea rows={3} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm md:col-span-2" placeholder="AI özeti" {...register("aiSummary")} />
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Arama kelimeleri</label>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              placeholder="virgülle ayırın"
              value={selectedKeywords.join(", ")}
              onChange={(event) =>
                setValue(
                  "searchKeywords",
                  event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                  { shouldValidate: true }
                )
              }
            />
          </div>
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="mb-6 grid gap-5 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">İlgili ürünler</label>
            <Controller
              control={control}
              name="relatedProductIds"
              render={({ field }) => (
                <select
                  multiple
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Array.from(event.target.selectedOptions).map((option) => option.value))
                  }
                  className="h-48 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                >
                  {lookupOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Aksesuar önerileri</label>
            <Controller
              control={control}
              name="accessoryProductIds"
              render={({ field }) => (
                <select
                  multiple
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Array.from(event.target.selectedOptions).map((option) => option.value))
                  }
                  className="h-48 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                >
                  {lookupOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        </div>

        <textarea
          rows={4}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          placeholder="Admin notları"
          {...register("adminNotes")}
        />
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/urunler")}
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
        >
          Listeye dön
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
        >
          {isSubmitting ? "Kaydediliyor..." : mode === "create" ? "Ürün oluştur" : "Değişiklikleri kaydet"}
        </button>
      </div>
    </form>
  );
}
