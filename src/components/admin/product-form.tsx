"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";

import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  productCategoryOptions,
  productStatusOptions,
  productTagOptions,
  vehicleBrandOptions
} from "@/server/admin/constants";
import { adminProductSchema } from "@/server/admin/validators";

type ProductFormValues = z.input<typeof adminProductSchema>;

type ProductLookupOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
  lookupOptions: ProductLookupOption[];
};

const emptyValues: ProductFormValues = {
  name: "",
  slug: "",
  status: "draft",
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
  media: [],
  specs: [],
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  ogImageUrl: "",
  aiSummary: "",
  searchKeywords: [],
  adminNotes: ""
};

export function ProductForm({
  mode,
  productId,
  initialValues,
  lookupOptions
}: ProductFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      media: initialValues?.media ?? emptyValues.media,
      specs: initialValues?.specs ?? emptyValues.specs,
      searchKeywords: initialValues?.searchKeywords ?? emptyValues.searchKeywords
    }),
    [initialValues]
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<ProductFormValues>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: mergedDefaults
  });

  const mediaFields = useFieldArray({
    control,
    name: "media"
  });

  const specFields = useFieldArray({
    control,
    name: "specs"
  });

  const selectedCategories = watch("categories") ?? [];
  const selectedTags = watch("tags") ?? [];
  const selectedVehicles = watch("vehicleBrands") ?? [];
  const selectedKeywords = watch("searchKeywords") ?? [];

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

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const endpoint =
      mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...values,
        slug: values.slug || values.name,
        variantTitle: values.variantTitle || values.name,
        searchKeywords: (values.searchKeywords ?? []).filter(Boolean)
      })
    });

    const data = (await response.json()) as { ok: boolean; message?: string; product?: { id: string } };

    if (!response.ok || !data.ok) {
      setErrorMessage(data.message ?? "Kayit islemi basarisiz.");
      return;
    }

    setSuccessMessage(mode === "create" ? "Urun olusturuldu." : "Urun guncellendi.");

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
            Faz 1 kapsaminda urun kimligi, fiyat, stok ve SEO alanlari birlikte yonetilir.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Urun adi</label>
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

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Kisa aciklama</label>
            <textarea
              rows={3}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("shortDescription")}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Uzun aciklama</label>
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
            <label className="mb-2 block text-sm font-medium text-slate-700">Varyant basligi</label>
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
            <label className="mb-2 block text-sm font-medium text-slate-700">Karsilastirma fiyati</label>
            <input
              type="number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("compareAtKurus", { valueAsNumber: true })}
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
            <label className="mb-2 block text-sm font-medium text-slate-700">Min stok esigi</label>
            <input
              type="number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("minimumStockThreshold", { valueAsNumber: true })}
            />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input type="checkbox" className="h-4 w-4" {...register("inventoryTrackingEnabled")} />
            <span className="text-sm font-medium text-slate-700">Stok takibi acik</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input type="checkbox" className="h-4 w-4" {...register("isVatIncluded")} />
            <span className="text-sm font-medium text-slate-700">KDV dahil</span>
          </div>
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Kategoriler</p>
            <div className="space-y-2">
              {productCategoryOptions.map((option) => (
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
            <p className="mb-3 text-sm font-semibold text-slate-800">Etiketler</p>
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
            <p className="mb-3 text-sm font-semibold text-slate-800">Arac uyumlulugu</p>
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
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Guc (kW)" {...register("powerKw")} />
          <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("chargeType")}>
            <option value="ac">AC</option>
            <option value="dc">DC</option>
          </select>
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Konnektor tipi" {...register("connectorType")} />
          <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("phaseType")}>
            <option value="single_phase">Monofaz</option>
            <option value="three_phase">Trifaz</option>
          </select>
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="IP sinifi" {...register("ipClass")} />
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Power label" {...register("powerLabel")} />
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Kablo uzunlugu" {...register("cableLength")} />
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
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-950">Gorseller</h2>
          <button
            type="button"
            onClick={() => mediaFields.append({ url: "", altText: "", isPrimary: mediaFields.fields.length === 0 })}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Gorsel ekle
          </button>
        </div>
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
                  Ana gorsel
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
          <h2 className="text-xl font-semibold text-slate-950">Teknik ozellikler</h2>
          <button
            type="button"
            onClick={() => specFields.append({ groupName: "general", label: "", value: "" })}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Ozellik ekle
          </button>
        </div>
        <div className="space-y-4">
          {specFields.fields.map((field, index) => (
            <div key={field.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[180px_1fr_1fr_auto]">
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Grup" {...register(`specs.${index}.groupName`)} />
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Baslik" {...register(`specs.${index}.label`)} />
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Deger" {...register(`specs.${index}.value`)} />
              <button type="button" onClick={() => specFields.remove(index)} className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-700">
                Sil
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">SEO + AIEO</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Meta title" {...register("seoTitle")} />
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Canonical URL" {...register("canonicalUrl")} />
          <textarea rows={3} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm md:col-span-2" placeholder="Meta description" {...register("seoDescription")} />
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm md:col-span-2" placeholder="Open Graph gorsel URL" {...register("ogImageUrl")} />
          <textarea rows={3} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm md:col-span-2" placeholder="AI summary" {...register("aiSummary")} />
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Arama kelimeleri</label>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              placeholder="virgulle ayirin"
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
            <label className="mb-2 block text-sm font-medium text-slate-700">Ilgili urunler</label>
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
            <label className="mb-2 block text-sm font-medium text-slate-700">Aksesuar onerileri</label>
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
          placeholder="Admin notlari"
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
          Listeye don
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
        >
          {isSubmitting ? "Kaydediliyor..." : mode === "create" ? "Urun olustur" : "Degisiklikleri kaydet"}
        </button>
      </div>
    </form>
  );
}
