"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { Car, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, type Resolver, useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";

import { normalizeAdminProductPayload } from "@/lib/admin-product-payload";
import { inferProductMediaType } from "@/lib/product-media";
import {
  productCategoryOptions,
  productStatusOptions,
  productTagOptions,
  vehicleBrandOptions
} from "@/server/admin/constants";
import { defaultProductDetailContent } from "@/lib/product-detail-content";
import { slugify } from "@/lib/slug";
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

type ProductMutationResponse = {
  ok: boolean;
  message?: string;
  issues?: Array<{
    path: string;
    message: string;
  }>;
  product?: {
    id: string;
  };
};

const baseProductFormResolver = zodResolver(adminProductSchema) as unknown as Resolver<ProductFormValues>;
const productFormResolver: Resolver<ProductFormValues> = (values, context, options) =>
  baseProductFormResolver(normalizeAdminProductPayload(values), context, options);

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

const productFormSections = [
  { id: "temel-bilgiler", label: "Temel" },
  { id: "fiyat-stok", label: "Fiyat/Stok" },
  { id: "varyantlar", label: "Varyantlar" },
  { id: "katalog", label: "Katalog" },
  { id: "teknik", label: "Teknik" },
  { id: "görseller", label: "Görseller" },
  { id: "özellikler", label: "Özellikler" },
  { id: "detay", label: "Detay" },
  { id: "seo", label: "SEO" },
  { id: "iliskiler", label: "Iliskiler" }
];

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ExampleHint({ children }: { children: string }) {
  return <p className="mt-2 text-xs leading-5 text-slate-500">{children}</p>;
}

function TechnicalFieldExamples() {
  const examples = [
    {
      title: "Ev tipi wallbox",
      body: "Güç: 11 | Tip: AC | Konnektör: Type 2 | Faz: Trifaz | IP: IP54 | Kablo: Soketli veya 5 m"
    },
    {
      title: "Site / ofis cihazı",
      body: "Güç: 22 | Tip: AC | Konnektör: Type 2 | Faz: Trifaz | IP: IP65 | Akıllı: RFID, OCPP, yük dengeleme"
    },
    {
      title: "Aksesuar / kablo",
      body: "Güç: 22 kW uyumlu | Konnektör: Type 2 - Type 2 | Faz: Trifaz | Kablo: 5 m veya 7 m"
    }
  ];

  return (
    <div className="mb-5 grid gap-3 md:grid-cols-3">
      {examples.map((example) => (
        <div key={example.title} className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-sm font-black text-[#063326]">{example.title}</p>
          <p className="mt-2 text-xs leading-5 text-slate-600">{example.body}</p>
        </div>
      ))}
    </div>
  );
}

function TechnicalSpecExamples() {
  const examples = [
    ["Teknik", "Maksimum güç", "22 kW"],
    ["Teknik", "Konnektör", "Type 2"],
    ["Kurulum", "Faz yapısı", "Trifaz"],
    ["Akıllı özellik", "Uzaktan yönetim", "RFID / OCPP uyumlu"]
  ];

  return (
    <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {examples.map(([groupName, label, value]) => (
        <div key={`${groupName}-${label}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
            Grup: {groupName}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">Başlık: {label}</p>
          <p className="mt-1 text-xs font-semibold text-emerald-800">Değer: {value}</p>
        </div>
      ))}
    </div>
  );
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function escapeHtmlText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function phaseLabel(value: string) {
  if (value === "three_phase") {
    return "trifaz";
  }

  if (value === "single_phase") {
    return "monofaz";
  }

  return "altyapı";
}

function uniqueList(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function specKey(label: string) {
  return label.trim().toLocaleLowerCase("tr-TR");
}

function normalizeVehicleBrand(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function hasVehicleBrand(values: string[], nextValue: string) {
  const normalizedNextValue = normalizeVehicleBrand(nextValue).toLocaleLowerCase("tr-TR");

  return values.some(
    (value) => normalizeVehicleBrand(value).toLocaleLowerCase("tr-TR") === normalizedNextValue
  );
}

function mergeVehicleBrands(values: string[]) {
  return values.reduce<string[]>((accumulator, value) => {
    const normalizedValue = normalizeVehicleBrand(value);

    if (normalizedValue && !hasVehicleBrand(accumulator, normalizedValue)) {
      accumulator.push(normalizedValue);
    }

    return accumulator;
  }, []);
}

export function ProductForm({
  mode,
  productId,
  initialValues,
  lookupOptions,
  catalogOptions
}: ProductFormProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [vehicleBrandInput, setVehicleBrandInput] = useState("");

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
    formState: { errors, isSubmitting, isSubmitted },
    setValue,
    watch
  } = useForm<ProductFormValues>({
    resolver: productFormResolver,
    defaultValues: mergedDefaults
  });

  const mediaFields = useFieldArray({
    control,
    name: "media",
    keyName: "fieldId"
  });

  const variantFields = useFieldArray({
    control,
    name: "variants",
    keyName: "fieldId"
  });

  const specFields = useFieldArray({
    control,
    name: "specs",
    keyName: "fieldId"
  });

  const readinessFields = useFieldArray({
    control,
    name: "detailContent.purchaseReadiness",
    keyName: "fieldId"
  });

  const policyFields = useFieldArray({
    control,
    name: "detailContent.policyDetails",
    keyName: "fieldId"
  });

  const faqFields = useFieldArray({
    control,
    name: "detailContent.faqs",
    keyName: "fieldId"
  });

  const selectedCategories = watch("categories") ?? [];
  const selectedTags = watch("tags") ?? [];
  const selectedVehicles = watch("vehicleBrands") ?? [];
  const selectedKeywords = watch("searchKeywords") ?? [];
  const currentName = watch("name");
  const currentSlug = watch("slug");
  const shortDescriptionValue = watch("shortDescription") ?? "";
  const descriptionValue = watch("description") ?? "";
  const powerKwValue = watch("powerKw") ?? "";
  const powerLabelValue = watch("powerLabel") ?? "";
  const cableLengthValue = watch("cableLength") ?? "";
  const chargeTypeValue = watch("chargeType") ?? "ac";
  const connectorTypeValue = watch("connectorType") ?? "";
  const phaseTypeValue = watch("phaseType") ?? "";
  const ipClassValue = watch("ipClass") ?? "";
  const hasWifiValue = Boolean(watch("hasWifi"));
  const hasRfidValue = Boolean(watch("hasRfid"));
  const has4gValue = Boolean(watch("has4g"));
  const installRequiredValue = Boolean(watch("installRequired"));
  const mediaValues = watch("media") ?? [];
  const specValues = watch("specs") ?? [];
  const variantValues = watch("variants") ?? [];
  const seoTitleValue = watch("seoTitle") ?? "";
  const seoDescriptionValue = watch("seoDescription") ?? "";
  const aiSummaryValue = watch("aiSummary") ?? "";
  const detailContent = (watch("detailContent") ?? detailContentDefaults) as ProductDetailFormValues;
  const smartFeatureLabels = uniqueList([
    hasWifiValue ? "Wi-Fi" : "",
    hasRfidValue ? "RFID" : "",
    has4gValue ? "4G" : ""
  ]);
  const powerText = cleanText(powerLabelValue || (powerKwValue ? `${powerKwValue} kW` : ""));
  const chargeText = cleanText(chargeTypeValue).toUpperCase();
  const connectorText = cleanText(connectorTypeValue || "Type 2");
  const phaseText = phaseLabel(phaseTypeValue);
  const featureAuditItems = [
    {
      label: "Ürün adı",
      ok: cleanText(currentName).length > 2,
      detail: "Başlık karar verme ve SEO için net olmalı."
    },
    {
      label: "Kısa açıklama",
      ok: cleanText(shortDescriptionValue).length >= 70,
      detail: "Kullanım alanı, güç, uyum ve kurulum bilgisi özetlenmeli."
    },
    {
      label: "Uzun açıklama",
      ok: cleanText(descriptionValue).replace(/<[^>]+>/g, "").length >= 180,
      detail: "Fayda, teknik detay, kurulum, teslimat ve güven bilgisi olmalı."
    },
    {
      label: "Güç + şarj tipi",
      ok: Boolean(powerText && chargeText),
      detail: "7.4/11/22 kW veya DC güç sınıfı net olmalı."
    },
    {
      label: "Faz + konnektör",
      ok: Boolean(connectorText && phaseTypeValue),
      detail: "Type 2/CCS2 ve monofaz/trifaz bilgisi yazılmalı."
    },
    {
      label: "Akıllı özellikler",
      ok: smartFeatureLabels.length > 0 || specValues.some((item) => /ocpp|yük|yük|load|wifi|wi-fi|rfid/i.test(`${item.label} ${item.value}`)),
      detail: "Wi-Fi, RFID, 4G, OCPP veya yük dengeleme sinyali eklenmeli."
    },
    {
      label: "Kurulum bilgisi",
      ok: installRequiredValue || cleanText(descriptionValue).toLocaleLowerCase("tr-TR").includes("kurulum"),
      detail: "Keşif, pano, faz, kablo hattı veya montaj notu olmalı."
    },
    {
      label: "Teknik tablo",
      ok: specValues.filter((item) => cleanText(item.label) && cleanText(item.value)).length >= 6,
      detail: "Güç, faz, konnektör, IP, akıllı özellik ve kapsam maddeleri olmalı."
    },
    {
      label: "Görsel + alt text",
      ok: mediaValues.some((item) => cleanText(item.url) && cleanText(item.altText)),
      detail: "En az bir görsel ve anlamli alt text girilmeli."
    },
    {
      label: "SEO + AI",
      ok: Boolean(cleanText(seoTitleValue) && cleanText(seoDescriptionValue) && cleanText(aiSummaryValue)),
      detail: "Meta başlık, meta açıklama ve AI özeti tamamlanmalı."
    }
  ];
  const readyFeatureCount = featureAuditItems.filter((item) => item.ok).length;
  const featureReadinessPercent = Math.round((readyFeatureCount / featureAuditItems.length) * 100);
  const hasValidationErrors = isSubmitted && Object.keys(errors).length > 0;
  const categoryOptions =
    catalogOptions?.categories.length
      ? catalogOptions.categories.map((category) => ({
          slug: category.slug,
          label: category.name
        }))
      : productCategoryOptions;
  const vehicleOptions = mergeVehicleBrands([...vehicleBrandOptions, ...selectedVehicles]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

  function addVehicleBrand() {
    const nextVehicleBrand = normalizeVehicleBrand(vehicleBrandInput);

    if (!nextVehicleBrand || nextVehicleBrand.length > 60) {
      return;
    }

    if (hasVehicleBrand(selectedVehicles, nextVehicleBrand)) {
      setVehicleBrandInput("");
      return;
    }

    setValue("vehicleBrands", [...selectedVehicles, nextVehicleBrand], {
      shouldDirty: true,
      shouldValidate: true
    });
    setVehicleBrandInput("");
  }

  function removeVehicleBrand(vehicleBrand: string) {
    const normalizedVehicleBrand = normalizeVehicleBrand(vehicleBrand).toLocaleLowerCase("tr-TR");

    setValue(
      "vehicleBrands",
      selectedVehicles.filter(
        (item) => normalizeVehicleBrand(item).toLocaleLowerCase("tr-TR") !== normalizedVehicleBrand
      ),
      {
        shouldDirty: true,
        shouldValidate: true
      }
    );
  }

  function fillSlugFromName() {
    const nextSlug = slugify(currentSlug || currentName || "");

    if (nextSlug) {
      setValue("slug", nextSlug, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }

  function appendCoreSpecsFromFields() {
    const existingSpecKeys = new Set(
      (watch("specs") ?? [])
        .filter((item) => cleanText(item.label))
        .map((item) => specKey(item.label ?? ""))
    );
    const variantSummary = uniqueList(
      (watch("variants") ?? [])
        .map((variant) =>
          [variant.powerLabel, variant.cableLength, variant.connectorType].filter(Boolean).join(" / ")
        )
        .filter(Boolean)
    ).join(", ");
    const smartSummary = smartFeatureLabels.length
      ? smartFeatureLabels.join(", ")
      : "Standart kontrol";
    const candidateSpecs = [
      {
        groupName: "Teknik",
        label: "Güç",
        value: powerText
      },
      {
        groupName: "Teknik",
        label: "Şarj tipi",
        value: chargeText
      },
      {
        groupName: "Teknik",
        label: "Faz",
        value: phaseText
      },
      {
        groupName: "Teknik",
        label: "Konnektor",
        value: connectorText
      },
      {
        groupName: "Teknik",
        label: "IP sınıfı",
        value: cleanText(ipClassValue)
      },
      {
        groupName: "Akıllı özellik",
        label: "Bağlantı ve erişim",
        value: smartSummary
      },
      {
        groupName: "Kurulum",
        label: "Kurulum gereksinimi",
        value: installRequiredValue
          ? "Keşif ve profesyonel kurulum önerilir"
          : "Ürün kargo ile teslim edilir; uygunluk destekle netleşir"
      },
      {
        groupName: "Kurulum",
        label: "Hizmet kapsamı",
        value: "81 il ürün kargosu; Türkiye geneli keşif ve kurulum talebi"
      },
      {
        groupName: "Uyum",
        label: "Araç uyumu",
        value: selectedVehicles.length ? selectedVehicles.join(", ") : connectorText
      },
      {
        groupName: "Varyant",
        label: "Varyant özeti",
        value: variantSummary || cleanText(cableLengthValue)
      },
      {
        groupName: "Ticari",
        label: "Yönetim özellikleri",
        value: specValues.some((item) => /ocpp|yük|yük|load/i.test(`${item.label} ${item.value}`))
          ? ""
          : "OCPP, yük dengeleme veya RFID ihtiyacı varsa teklif aşamasında netleştirilir"
      }
    ];

    candidateSpecs
      .filter((item) => cleanText(item.value))
      .filter((item) => !existingSpecKeys.has(specKey(item.label)))
      .forEach((item) => specFields.append(item));
  }

  function buildProductCopyFromFeatures() {
    const productName = cleanText(currentName) || "ParkChargeEV şarj çözümü";
    const usageArea = selectedCategories.includes("aksesuar")
      ? "aksesuar ihtiyacı"
      : selectedCategories.includes("dc-hizli-sarj")
        ? "ticari lokasyon ve hızlı şarj yatırımı"
        : selectedCategories.includes("is-yeri-tipi")
          ? "işletme, ofis ve otopark kullanımı"
          : "ev tipi AC şarj kullanımı";
    const smartSummary = smartFeatureLabels.length
      ? smartFeatureLabels.join(", ")
      : "net teknik seçim";
    const vehicleSummary = selectedVehicles.length
      ? selectedVehicles.join(", ")
      : `${connectorText} uyumlu elektrikli araçlar`;
    const installSummary = installRequiredValue
      ? "Kurulum öncesi pano, faz, kablo hattı ve koruma ekipmanı kontrol edilerek ilerlenir."
      : "Ürün kargo ile teslim edilir; uyumluluk veya montaj soruları destek ekibiyle netleştirilebilir.";
    const primaryPower = powerText || `${chargeText} şarj`;
    const shortDescription =
      `${productName}, ${usageArea} için ${primaryPower} güç sınıfı, ${connectorText} konnektör, ${phaseText} altyapı ve ${smartSummary} özelliklerini tek pakette sunar.`;
    const descriptionParagraphs = [
      `${productName}, ${usageArea} için doğru cihaz, doğru altyapı ve güvenli kullanım odağıyla hazırlanmış bir ParkChargeEV çözümüdür.`,
      `Teknik tarafta ${primaryPower}, ${connectorText} konnektör, ${phaseText} faz yapısı${ipClassValue ? `, ${ipClassValue} koruma sınıfı` : ""} ve ${smartSummary} bilgisi öne çıkar.`,
      `Uyum tarafında ${vehicleSummary} için karar vermeyi kolaylaştırır. ${installSummary}`,
      "Ürünler Türkiye genelinde 81 ile kargolanır."
    ];
    const featureBullets = uniqueList([
      primaryPower ? `${primaryPower} güç sınıfı` : "",
      connectorText ? `${connectorText} konnektör uyumu` : "",
      phaseText ? `${phaseText} altyapı bilgisi` : "",
      smartSummary ? `${smartSummary} özellikleri` : "",
      "81 il ürün kargosu",
      "Türkiye geneli keşif talebi",
      "Saha uygunluğuna göre kurulum planı"
    ]);
    const descriptionHtml = [
      ...descriptionParagraphs.map((paragraph) => `<p>${escapeHtmlText(paragraph)}</p>`),
      `<ul>${featureBullets.map((item) => `<li>${escapeHtmlText(item)}</li>`).join("")}</ul>`
    ].join("");
    const seoTitle = `${productName} | ParkChargeEV`;
    const seoDescription = shortDescription.slice(0, 310);
    const aiSummary = `${productName}; ${primaryPower}, ${connectorText}, ${phaseText} ve kurulum/kargo kapsamı net olan EV şarj çözümüdür.`.slice(0, 178);

    setValue("shortDescription", shortDescription.slice(0, 360), {
      shouldDirty: true,
      shouldValidate: true
    });
    setValue("description", descriptionHtml, { shouldDirty: true, shouldValidate: true });
    setValue("seoTitle", seoTitle.slice(0, 255), { shouldDirty: true, shouldValidate: true });
    setValue("seoDescription", seoDescription, { shouldDirty: true, shouldValidate: true });
    setValue("aiSummary", aiSummary, { shouldDirty: true, shouldValidate: true });
    setValue(
      "detailContent.galleryFeatureLabels",
      uniqueList([primaryPower, connectorText, phaseText, ...smartFeatureLabels, "81 il kargo"]),
      { shouldDirty: true, shouldValidate: true }
    );
    setValue(
      "detailContent.highlights",
      uniqueList([
        `${primaryPower} güç sınıfı ile net seçim`,
        `${connectorText} uyumlu araçlar için pratik kullanım`,
        installRequiredValue
          ? "Keşif ve kurulum planıyla altyapı riski azalır"
          : "Kargo ile hızlı teslimata uygun ürün akışı",
        "ParkChargeEV destek ekibiyle karar ve kurulum süreci netleşir"
      ]),
      { shouldDirty: true, shouldValidate: true }
    );
    setValue(
      "detailContent.purchaseBenefits",
      uniqueList([
        "Güvenli ödeme ve sipariş takibi",
        "Kurulum: Sakarya ve Kocaeli",
        "Türkiye geneli keşif talebi",
        "Saha uygunluğuna göre planlı kurulum"
      ]),
      { shouldDirty: true, shouldValidate: true }
    );
    setValue(
      "detailContent.decisionChecks",
      uniqueList([
        "Aracınızın konnektör ve AC/DC uyumunu kontrol edin.",
        "Pano, faz ve kablo hattı durumunu keşif veya destekle netleştirin.",
        "Ev, site veya işletme ihtiyacına göre güç sınıfını seçin."
      ]),
      { shouldDirty: true, shouldValidate: true }
    );
    setValue(
      "detailContent.seoIntents",
      uniqueList([
        `${productName} fiyat`,
        `${powerText || chargeText} şarj cihazı`,
        `${connectorText} şarj cihazı`,
        "elektrikli araç şarj cihazı kurulumu"
      ]),
      { shouldDirty: true, shouldValidate: true }
    );
    setValue(
      "detailContent.useCases",
      uniqueList([
        usageArea,
        "evde planlı şarj",
        "site ve apartman otoparkı",
        "işletme ve ofis otoparkı"
      ]),
      { shouldDirty: true, shouldValidate: true }
    );
  }

  async function uploadMediaFile(file: File, targetIndex?: number) {
    setUploadMessage(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData
      });
      const data = (await response.json().catch(() => ({
        ok: false,
        message: "Sunucu yanıtı okunamadı."
      }))) as { ok: boolean; url?: string; mediaType?: "image" | "video"; message?: string };

      if (!response.ok || !data.ok || !data.url) {
        setUploadMessage(data.message ?? "Görsel yüklenemedi.");
        return;
      }

      if (typeof targetIndex === "number") {
        setValue(`media.${targetIndex}.url`, data.url, { shouldValidate: true });
        setValue(`media.${targetIndex}.mediaType`, data.mediaType ?? inferProductMediaType(data.url), {
          shouldValidate: true
        });
      } else {
        mediaFields.append({
          mediaType: data.mediaType ?? inferProductMediaType(data.url),
          url: data.url,
          altText: watch("name") || "Ürün görseli",
          isPrimary: mediaFields.fields.length === 0
        });
      }

      setUploadMessage("Görsel yüklendi.");
    } catch {
      setUploadMessage("Görsel yüklenirken sunucuya ulaşılamadı.");
    } finally {
      setIsUploading(false);
    }
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

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json().catch(() => ({
        ok: false,
        message: "Sunucu yanıtı okunamadı."
      }))) as ProductMutationResponse;

      if (!response.ok || !data.ok) {
        const issueText = data.issues?.length
          ? ` ${data.issues
              .slice(0, 4)
              .map((issue) => issue.message)
              .join(" ")}`
          : "";
        setErrorMessage(`${data.message ?? "Kayit işlemi başarısız."}${issueText}`);
        return;
      }

      setSuccessMessage(mode === "create" ? "Ürün oluşturuldu." : "Ürün güncellendi.");

      if (mode === "create" && data.product?.id) {
        router.push(`/admin/urunler/${data.product.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setErrorMessage("Sunucuya ulaşılamadı. Lütfen tekrar deneyin.");
    }
  });

  return (
    <form className="space-y-8" onSubmit={onSubmit} noValidate aria-busy={!isHydrated || isSubmitting}>
      <div className="sticky top-4 z-20 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">Form bolumleri</p>
            <p className="text-xs text-slate-500">
              {hasValidationErrors ? "Eksik alanlar var; bolumlerden hızlıca kontrol edin." : "Ürün kaydında hızlı gezinme."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {productFormSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                {section.label}
              </a>
            ))}
          </div>
          <button
            type="submit"
            disabled={!isHydrated || isSubmitting}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
      <fieldset
        disabled={!isHydrated || isSubmitting}
        className="space-y-8 disabled:cursor-wait disabled:opacity-75"
      >
      <section className="surface-card scroll-mt-28 border border-emerald-100 bg-white/95 p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] xl:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Ürün içerik asistanı
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Açıklama, teknik özellik, SEO ve AI metni eksiksiz ilerlesin.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Ürün metninde güç, faz, konnektör, akıllı özellikler, kurulum, kargo, uyumlu
              araçlar, garanti/destek ve SEO sinyalleri birlikte görünmeli. Eksik alanları
              kontrol edip tek tıkla taslak metin üretebilirsiniz.
            </p>
            <div className="mt-5 rounded-3xl bg-[#063326] p-5 text-white">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/76">
                    İçerik hazırlık skoru
                  </p>
                  <p className="mt-2 text-4xl font-black tracking-[-0.04em]">
                    %{featureReadinessPercent}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#063326]">
                  {readyFeatureCount}/{featureAuditItems.length} tamam
                </span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
                <span
                  className="block h-full rounded-full bg-[#7eecc9]"
                  style={{ width: `${featureReadinessPercent}%` }}
                />
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={buildProductCopyFromFeatures}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Özelliklerden metin oluştur
              </button>
              <button
                type="button"
                onClick={appendCoreSpecsFromFields}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                Eksik teknik özellikleri ekle
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {featureAuditItems.map((item) => (
              <div
                key={item.label}
                className={`rounded-3xl border p-4 ${
                  item.ok
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-amber-200 bg-amber-50/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-black ${
                      item.ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.ok ? "Hazir" : "Eksik"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="temel-bilgiler" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
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
            <ExampleHint>Örnek: HomeCharge Pro 11kW</ExampleHint>
            {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("slug", {
                onBlur: fillSlugFromName
              })}
            />
            <ExampleHint>Örnek: homecharge-pro-11kw. Boş bırakırsanız ürün adından üretilebilir.</ExampleHint>
            <button
              type="button"
              onClick={fillSlugFromName}
              className="mt-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Slug oluştur
            </button>
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
            <ExampleHint>Taslak siteye çıkmaz; Aktif seçilirse mağazada görünür.</ExampleHint>
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
            <ExampleHint>Marka yoksa boş bırakın; markaları Katalog ekranından ekleyebilirsiniz.</ExampleHint>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Kısa açıklama</label>
            <textarea
              rows={3}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("shortDescription")}
            />
            <ExampleHint>Örnek: Ev kullanıcıları için 11kW AC şarj, zamanlama ve enerji takibi sunar.</ExampleHint>
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
            <ExampleHint>Örnek: Kurulum, uyumlu araçlar, garanti ve teslimat bilgisini kısa paragraflarla yazın.</ExampleHint>
          </div>
        </div>
      </section>

      <section id="fiyat-stok" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">SKU</label>
            <input className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("sku")} />
            <ExampleHint>Örnek: HCP-11KW-5M</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Varyant başlığı</label>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("variantTitle")}
            />
            <ExampleHint>Örnek: 5 Metre Kablo</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Fiyat (kurus)</label>
            <input
              type="number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("priceKurus", { valueAsNumber: true })}
            />
            <ExampleHint>Örnek: 12.490 TL için 1249000 girin.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Karşılaştırma fiyatı</label>
            <input
              type="number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("compareAtKurus", { valueAsNumber: true })}
            />
            <ExampleHint>Örnek: Eski fiyat 13.990 TL ise 1399000 girin.</ExampleHint>
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
            <ExampleHint>Örnek: Kampanya fiyatı 11.990 TL ise 1199000 girin.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Kampanya bitişi</label>
            <input
              type="datetime-local"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("discountEndsAt")}
            />
            <ExampleHint>Örnek: Kampanya yoksa boş bırakın.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Stok</label>
            <input
              type="number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("stockQuantity", { valueAsNumber: true })}
            />
            <ExampleHint>Örnek: 24</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Min stok eşiği</label>
            <input
              type="number"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              {...register("minimumStockThreshold", { valueAsNumber: true })}
            />
            <ExampleHint>Örnek: 3; stok bu seviyeye inince takip kolaylaşır.</ExampleHint>
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

      <section id="varyantlar" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Varyantlar</h2>
            <p className="mt-1 text-sm text-slate-600">
              Fiyat, stok, kablo ve konnektör bilgisini varyant bazında yönetin.
            </p>
            <ExampleHint>Örnek varyantlar: 5 Metre - 12.490 TL, 7.5 Metre - 13.290 TL.</ExampleHint>
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
            <div key={field.fieldId} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 xl:grid-cols-6">
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

      <section id="katalog" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Kategoriler</p>
            <ExampleHint>Örnek: Ev tipi cihazlar için Ev Tipi kategorisini işaretleyin.</ExampleHint>
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
            <ExampleHint>Örnek: Çok satan veya stokta rozetleri ürün kartında görünür.</ExampleHint>
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

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-[#063326]">
                <Car className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-black text-slate-900">Araç uyumluluğu</p>
                <ExampleHint>
                  Hazır markalardan seçin veya yeni araç/marka adı ekleyin. Seçili araçlar ürün detayında uyumluluk sinyali olarak kullanılır.
                </ExampleHint>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={vehicleBrandInput}
                maxLength={60}
                onChange={(event) => setVehicleBrandInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addVehicleBrand();
                  }
                }}
                className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Örn. Mercedes-Benz, Volvo, Kia"
              />
              <button
                type="button"
                onClick={addVehicleBrand}
                disabled={!normalizeVehicleBrand(vehicleBrandInput)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#063326] px-4 py-3 text-sm font-black text-white transition hover:bg-[#0b4b39] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Ekle
              </button>
            </div>

            {selectedVehicles.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedVehicles.map((brand) => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-[#063326]"
                  >
                    {brand}
                    <button
                      type="button"
                      onClick={() => removeVehicleBrand(brand)}
                      className="rounded-full p-0.5 text-[#063326] transition hover:bg-white"
                      aria-label={`${brand} uyumluluğunu kaldır`}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                Henüz uyumlu araç eklenmedi.
              </p>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {vehicleOptions.map((brand) => {
                const checked = hasVehicleBrand(selectedVehicles, brand);

                return (
                  <label
                    key={brand}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      checked
                        ? "border-emerald-200 bg-emerald-50 text-[#063326]"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        checked ? removeVehicleBrand(brand) : toggleArrayValue("vehicleBrands", brand)
                      }
                    />
                    <span>{brand}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="teknik" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">Teknik Alanlar</h2>
          <ExampleHint>Örnek: Güç 11, konnektör Type 2, IP sınıfı IP54, kablo uzunluğu 5 Metre.</ExampleHint>
        </div>

        <TechnicalFieldExamples />

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

      <section id="görseller" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Görseller</h2>
            <p className="mt-1 text-sm text-slate-600">
              Ürün detay galerisindeki görsel URL ve başlıkları buradan yönetilir.
            </p>
            <ExampleHint>Örnek URL: https://site.com/homecharge-pro.jpg; alt text: HomeCharge Pro 11kW ön görünüm.</ExampleHint>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
              {isUploading ? "Yükleniyor..." : "Dosya yükle"}
              <input
                type="file"
                accept="image/*,video/mp4,video/webm,video/ogg"
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
              onClick={() =>
                mediaFields.append({
                  mediaType: "image",
                  url: "",
                  altText: "",
                  isPrimary: mediaFields.fields.length === 0
                })
              }
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
            <div key={field.fieldId} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[160px_1fr_220px_auto]">
              <select
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                {...register(`media.${index}.mediaType`)}
                onChange={(event) => {
                  setValue(`media.${index}.mediaType`, event.target.value as "image" | "video", {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                <option value="image">Görsel</option>
                <option value="video">Video</option>
              </select>
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="https://... veya /uploads/..."
                {...register(`media.${index}.url`)}
                onBlur={(event) => {
                  const inferredType = inferProductMediaType(event.currentTarget.value);
                  if (inferredType === "video") {
                    setValue(`media.${index}.mediaType`, inferredType, {
                      shouldDirty: true,
                      shouldValidate: true
                    });
                  }
                }}
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
                <label className="cursor-pointer rounded-full border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
                  Değiştir
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/ogg"
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

      <section id="özellikler" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Teknik özellikler</h2>
            <ExampleHint>Örnek satır: Grup general, başlık Koruma sınıfı, değer IP54.</ExampleHint>
          </div>
          <button
            type="button"
            onClick={() => specFields.append({ groupName: "general", label: "", value: "" })}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Özellik ekle
          </button>
        </div>
        <TechnicalSpecExamples />
        <div className="space-y-4">
          {specFields.fields.map((field, index) => (
            <div key={field.fieldId} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[180px_1fr_1fr_auto]">
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

      <section id="detay" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
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
                key={field.fieldId}
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
                key={field.fieldId}
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
                key={field.fieldId}
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

      <section id="seo" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">SEO + AIEO</h2>
          <ExampleHint>Örnek meta başlık: HomeCharge Pro 11kW EV Şarj Cihazı. AI özeti tek cümle, satış odaklı olmalı.</ExampleHint>
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

      <section id="iliskiler" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
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

      {hasValidationErrors ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Formda eksik veya hatalı alanlar var. Ürün adı, açıklama, SKU, fiyat,
          stok, kategori ve SEO alanlarını kontrol edin.
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
          disabled={!isHydrated || isSubmitting}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
        >
          {!isHydrated
            ? "Hazırlanıyor..."
            : isSubmitting
              ? "Kaydediliyor..."
              : mode === "create"
                ? "Ürün oluştur"
                : "Değişiklikleri kaydet"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
