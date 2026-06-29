"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import {
  Boxes,
  Car,
  CheckCircle2,
  CircleAlert,
  ImagePlus,
  Link as LinkIcon,
  PackageCheck,
  Plus,
  Save,
  SearchCheck,
  Sparkles,
  UploadCloud,
  X
} from "lucide-react";
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
      <div className="min-h-[220px] rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
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

type MediaUploadResponse = {
  ok: boolean;
  url?: string;
  mediaType?: "image" | "video";
  done?: boolean;
  receivedChunks?: number;
  totalChunks?: number;
  message?: string;
  missingEnvironment?: string[];
  setupAction?: string;
  storageBucket?: string;
};

type UploadNotice = {
  tone: "success" | "error" | "info";
  message: string;
  detail?: string;
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
        <div key={example.title} className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-sm font-bold text-[#063326]">{example.title}</p>
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
        <div key={`${groupName}-${label}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
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

function createSmartFeature(sortOrder: number) {
  return {
    title: "",
    description: "",
    iconName: "sparkles",
    isActive: true,
    sortOrder
  };
}

function createTechnicalSpecItem(sortOrder: number) {
  return {
    name: "",
    value: "",
    unit: "",
    description: "",
    isActive: true,
    sortOrder
  };
}

function createTechnicalGroup(sortOrder: number, title = "Genel Bilgiler") {
  return {
    title,
    description: "",
    isActive: true,
    sortOrder,
    items: [createTechnicalSpecItem(1)]
  };
}

function buildTechnicalGroupsFromSpecs(specs: ProductFormValues["specs"]) {
  const groupMap = new Map<string, ReturnType<typeof createTechnicalGroup>>();

  (specs ?? []).forEach((spec, index) => {
    const label = cleanText(spec.label);
    const value = cleanText(spec.value);

    if (!label || !value) {
      return;
    }

    const groupName = cleanText(spec.groupName) || "Genel Bilgiler";
    const existingGroup =
      groupMap.get(groupName) ?? {
        ...createTechnicalGroup(groupMap.size + 1, groupName),
        items: []
      };

    existingGroup.items.push({
      name: label,
      value,
      unit: "",
      description: "",
      isActive: true,
      sortOrder: index + 1
    });
    groupMap.set(groupName, existingGroup);
  });

  return Array.from(groupMap.values());
}

function buildSmartFeaturesFromSpecs(specs: ProductFormValues["specs"]) {
  return (specs ?? [])
    .filter((spec) => {
      const haystack = `${spec.groupName ?? ""} ${spec.label ?? ""} ${spec.value ?? ""}`.toLocaleLowerCase("tr-TR");
      return /akıllı|akilli|wifi|wi-fi|rfid|4g|ocpp|yük|yuk|load|uygulama/.test(haystack);
    })
    .map((spec, index) => ({
      title: cleanText(spec.label),
      description: cleanText(spec.value),
      iconName: "sparkles",
      isActive: true,
      sortOrder: index + 1
    }))
    .filter((feature) => feature.title && feature.description);
}

function flattenTechnicalGroupsToSpecs(
  groups: ProductDetailFormValues["technicalGroups"],
  fallbackSpecs: ProductFormValues["specs"]
) {
  const specs = (groups ?? []).flatMap((group) => {
    const groupName = cleanText(group.title) || "Teknik";

    if (group.isActive === false) {
      return [];
    }

    return (group.items ?? [])
      .filter((item) => item.isActive !== false && cleanText(item.name) && cleanText(item.value))
      .map((item) => ({
        groupName,
        label: cleanText(item.name),
        value: [cleanText(item.value), cleanText(item.unit)].filter(Boolean).join(" ")
      }));
  });

  return specs.length ? specs : (fallbackSpecs ?? []);
}

function validateStructuredProductDetails(detailContent: ProductDetailFormValues) {
  const issues: string[] = [];

  (detailContent.smartFeatures ?? []).forEach((feature, index) => {
    const hasAnyValue = [feature.title, feature.description, feature.iconName].some((value) => cleanText(value));

    if (hasAnyValue && (!cleanText(feature.title) || !cleanText(feature.description))) {
      issues.push(`${index + 1}. akıllı özellikte başlık ve açıklama zorunlu.`);
    }
  });

  (detailContent.technicalGroups ?? []).forEach((group, groupIndex) => {
    const visibleItems = group.items ?? [];
    const hasAnyGroupValue =
      [group.title, group.description].some((value) => cleanText(value)) ||
      visibleItems.some((item) =>
        [item.name, item.value, item.unit, item.description].some((value) => cleanText(value))
      );

    if (hasAnyGroupValue && !cleanText(group.title)) {
      issues.push(`${groupIndex + 1}. teknik grupta grup başlığı zorunlu.`);
    }

    visibleItems.forEach((item, itemIndex) => {
      const hasAnyItemValue = [item.name, item.value, item.unit, item.description].some((value) => cleanText(value));

      if (hasAnyItemValue && (!cleanText(item.name) || !cleanText(item.value))) {
        issues.push(`${groupIndex + 1}. teknik grubun ${itemIndex + 1}. satırında özellik adı ve değer zorunlu.`);
      }
    });
  });

  return issues;
}

const adminPriceFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0
});

const maxImageUploadBytes = 12 * 1024 * 1024;
const maxVideoUploadBytes = 80 * 1024 * 1024;
const videoChunkBytes = 1.5 * 1024 * 1024;

function formatBytes(bytes: number) {
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;
}

function formatPriceAmount(value: unknown) {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return "Fiyat yok";
  }

  return adminPriceFormatter.format(numberValue);
}

function storedKurusToFormAmount(value: unknown) {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return 0;
  }

  return Math.round(numberValue / 100);
}

function formAmountToStoredKurus(value: unknown) {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return 0;
  }

  return Math.round(numberValue * 100);
}

function nullableFormAmountToStoredKurus(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount = formAmountToStoredKurus(value);

  return amount > 0 ? amount : null;
}

function withFormPriceAmounts(values: ProductFormValues): ProductFormValues {
  return {
    ...values,
    priceKurus: storedKurusToFormAmount(values.priceKurus),
    compareAtKurus: storedKurusToFormAmount(values.compareAtKurus),
    discountedPriceKurus:
      values.discountedPriceKurus === null || values.discountedPriceKurus === undefined
        ? null
        : storedKurusToFormAmount(values.discountedPriceKurus),
    variants: (values.variants ?? []).map((variant) => ({
      ...variant,
      priceKurus: storedKurusToFormAmount(variant.priceKurus),
      compareAtKurus: storedKurusToFormAmount(variant.compareAtKurus)
    }))
  };
}

function withStoredKurusPrices<T extends Record<string, unknown>>(values: T): T {
  const variants = Array.isArray(values.variants)
    ? values.variants.map((variant) => {
        if (!variant || typeof variant !== "object") {
          return variant;
        }

        const row = variant as Record<string, unknown>;

        return {
          ...row,
          priceKurus: formAmountToStoredKurus(row.priceKurus),
          compareAtKurus: formAmountToStoredKurus(row.compareAtKurus)
        };
      })
    : values.variants;

  return {
    ...values,
    priceKurus: formAmountToStoredKurus(values.priceKurus),
    compareAtKurus: formAmountToStoredKurus(values.compareAtKurus),
    discountedPriceKurus: nullableFormAmountToStoredKurus(values.discountedPriceKurus),
    variants
  };
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const text = await response.text().catch(() => "");

  if (!text) {
    return {
      ok: false,
      message:
        response.status === 413
          ? "Dosya sunucu yükleme sınırını aşıyor. Video yükleme için parçalara bölünmüş akış kullanılmalı."
          : fallbackMessage
    } as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {
      ok: false,
      message:
        response.status === 413
          ? "Dosya sunucu yükleme sınırını aşıyor. Video yükleme için parçalara bölünmüş akış kullanılmalı."
          : fallbackMessage
    } as T;
  }
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
  const [uploadNotice, setUploadNotice] = useState<UploadNotice | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [vehicleBrandInput, setVehicleBrandInput] = useState("");

  const mergedDefaults = useMemo<ProductFormValues>(
    () => withFormPriceAmounts({
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
        smartFeatures:
          initialValues?.detailContent?.smartFeatures?.length
            ? initialValues.detailContent.smartFeatures
            : buildSmartFeaturesFromSpecs(initialValues?.specs),
        technicalGroups:
          initialValues?.detailContent?.technicalGroups?.length
            ? initialValues.detailContent.technicalGroups
            : buildTechnicalGroupsFromSpecs(initialValues?.specs),
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

  const smartFeatureFields = useFieldArray({
    control,
    name: "detailContent.smartFeatures",
    keyName: "fieldId"
  });

  const technicalGroupFields = useFieldArray({
    control,
    name: "detailContent.technicalGroups",
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
  const smartFeatureValues = detailContent.smartFeatures ?? [];
  const technicalGroupValues = detailContent.technicalGroups ?? [];
  const flattenedTechnicalSpecValues = flattenTechnicalGroupsToSpecs(technicalGroupValues, specValues);
  const smartFeatureLabels = uniqueList([
    hasWifiValue ? "Wi-Fi" : "",
    hasRfidValue ? "RFID" : "",
    has4gValue ? "4G" : "",
    ...smartFeatureValues
      .filter((feature) => feature.isActive !== false)
      .map((feature) => cleanText(feature.title))
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
      ok: smartFeatureLabels.length > 0 || flattenedTechnicalSpecValues.some((item) => /ocpp|yük|yuk|load|wifi|wi-fi|rfid/i.test(`${item.label} ${item.value}`)),
      detail: "Wi-Fi, RFID, 4G, OCPP veya yük dengeleme sinyali eklenmeli."
    },
    {
      label: "Kurulum bilgisi",
      ok: installRequiredValue || cleanText(descriptionValue).toLocaleLowerCase("tr-TR").includes("kurulum"),
      detail: "Keşif, pano, faz, kablo hattı veya montaj notu olmalı."
    },
    {
      label: "Teknik tablo",
      ok: flattenedTechnicalSpecValues.filter((item) => cleanText(item.label) && cleanText(item.value)).length >= 6,
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
  const primaryMedia = mediaValues.find((item) => item.isPrimary) ?? mediaValues[0];
  const hasPrimaryMedia = Boolean(primaryMedia?.url);
  const defaultVariantFromForm = variantValues.find((variant) => variant.isDefault) ?? variantValues[0];
  const displayPrice = formatPriceAmount(defaultVariantFromForm?.priceKurus ?? watch("priceKurus"));
  const displayStock = Number(defaultVariantFromForm?.stockQuantity ?? watch("stockQuantity") ?? 0);
  const stockThreshold = Number(watch("minimumStockThreshold") ?? 0);
  const stockState =
    displayStock <= 0
      ? "Stok yok"
      : stockThreshold > 0 && displayStock <= stockThreshold
        ? "Düşük stok"
        : "Stok hazır";
  const seoTitleLength = cleanText(seoTitleValue).length;
  const seoDescriptionLength = cleanText(seoDescriptionValue).length;
  const plainDescriptionLength = cleanText(descriptionValue).replace(/<[^>]+>/g, "").length;
  const publicationChecklist = [
    {
      label: "Ürün kimliği",
      detail: cleanText(currentName) || "Ad ve slug bekleniyor",
      ok: cleanText(currentName).length > 2 && Boolean(currentSlug || currentName),
      icon: PackageCheck
    },
    {
      label: "Fiyat ve stok",
      detail: `${displayPrice} / ${stockState}`,
      ok: Number(watch("priceKurus") ?? 0) > 0 && displayStock > 0,
      icon: Boxes
    },
    {
      label: "Medya",
      detail: hasPrimaryMedia ? `${mediaValues.length} medya` : "Ana görsel bekleniyor",
      ok: hasPrimaryMedia && mediaValues.some((item) => cleanText(item.altText)),
      icon: ImagePlus
    },
    {
      label: "Teknik veri",
      detail: `${flattenedTechnicalSpecValues.length} özellik / ${variantValues.length || 1} varyant`,
      ok: flattenedTechnicalSpecValues.length >= 4 && Boolean(powerText || connectorText),
      icon: Sparkles
    },
    {
      label: "SEO ve AI",
      detail: `${seoTitleLength}/60 başlık, ${seoDescriptionLength}/160 açıklama, ${plainDescriptionLength} içerik`,
      ok:
        seoTitleLength >= 35 &&
        seoTitleLength <= 70 &&
        seoDescriptionLength >= 110 &&
        seoDescriptionLength <= 170 &&
        cleanText(aiSummaryValue).length >= 40,
      icon: SearchCheck
    }
  ];
  const publishReadyCount = publicationChecklist.filter((item) => item.ok).length;
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
      flattenedTechnicalSpecValues
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
        value: flattenedTechnicalSpecValues.some((item) => /ocpp|yük|yuk|load/i.test(`${item.label} ${item.value}`))
          ? ""
          : "OCPP, yük dengeleme veya RFID ihtiyacı varsa teklif aşamasında netleştirilir"
      }
    ];

    const nextGroups = [...technicalGroupValues];

    candidateSpecs
      .filter((item) => cleanText(item.value))
      .filter((item) => !existingSpecKeys.has(specKey(item.label)))
      .forEach((item) => {
        const groupIndex = nextGroups.findIndex((group) => cleanText(group.title) === item.groupName);
        const nextItem = {
          name: item.label,
          value: item.value,
          unit: "",
          description: "",
          isActive: true,
          sortOrder: groupIndex >= 0 ? (nextGroups[groupIndex].items?.length ?? 0) + 1 : 1
        };

        if (groupIndex >= 0) {
          nextGroups[groupIndex] = {
            ...nextGroups[groupIndex],
            items: [...(nextGroups[groupIndex].items ?? []), nextItem]
          };
          return;
        }

        nextGroups.push({
          title: item.groupName,
          description: "",
          isActive: true,
          sortOrder: nextGroups.length + 1,
          items: [nextItem]
        });
      });

    setValue("detailContent.technicalGroups", nextGroups, {
      shouldDirty: true,
      shouldValidate: true
    });

    if (
      smartSummary !== "Standart kontrol" &&
      !smartFeatureValues.some((feature) => specKey(feature.title) === specKey("Bağlantı ve erişim"))
    ) {
      smartFeatureFields.append({
        title: "Bağlantı ve erişim",
        description: smartSummary,
        iconName: "wifi",
        isActive: true,
        sortOrder: smartFeatureValues.length + 1
      });
    }
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

  function applyUploadedMedia(data: MediaUploadResponse, targetIndex?: number) {
    if (!data.url) {
      return;
    }

    if (typeof targetIndex === "number") {
      setValue(`media.${targetIndex}.url`, data.url, { shouldValidate: true });
      setValue(`media.${targetIndex}.mediaType`, data.mediaType ?? inferProductMediaType(data.url), {
        shouldValidate: true
      });
      return;
    }

    mediaFields.append({
      mediaType: data.mediaType ?? inferProductMediaType(data.url),
      url: data.url,
      altText: watch("name") || "Ürün medyası",
      isPrimary: mediaFields.fields.length === 0
    });
  }

  async function uploadVideoFileInChunks(file: File, targetIndex?: number) {
    if (file.size > maxVideoUploadBytes) {
      setUploadNotice({
        tone: "error",
        message: `Video yükleme sınırı ${formatBytes(maxVideoUploadBytes)}.`
      });
      return;
    }

    const assetId = crypto.randomUUID();
    const totalChunks = Math.ceil(file.size / videoChunkBytes);
    let completedResponse: MediaUploadResponse | null = null;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
      const start = chunkIndex * videoChunkBytes;
      const chunk = file.slice(start, Math.min(start + videoChunkBytes, file.size), file.type);
      const formData = new FormData();
      formData.append("assetId", assetId);
      formData.append("fileName", file.name);
      formData.append("mimeType", file.type || "video/mp4");
      formData.append("totalSize", String(file.size));
      formData.append("chunkIndex", String(chunkIndex));
      formData.append("totalChunks", String(totalChunks));
      formData.append(
        "chunk",
        new File([chunk], `${file.name}.part-${chunkIndex}`, {
          type: file.type || "application/octet-stream"
        })
      );

      setUploadNotice({
        tone: "info",
        message: "Video yükleniyor.",
        detail: `${chunkIndex + 1}/${totalChunks} parça aktarıldı.`
      });

      const response = await fetch("/api/admin/media/upload/chunk", {
        method: "POST",
        body: formData
      });
      const data = await parseJsonResponse<MediaUploadResponse>(
        response,
        "Video yükleme yanıtı okunamadı."
      );

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Video yüklenemedi.");
      }

      if (data.done) {
        completedResponse = data;
      }
    }

    if (!completedResponse?.url) {
      throw new Error("Video tamamlandı bilgisi alınamadı.");
    }

    applyUploadedMedia(completedResponse, targetIndex);
    setUploadNotice({
      tone: "success",
      message: "Video yüklendi.",
      detail: `${totalChunks} parça başarıyla birleştirildi.`
    });
  }

  async function uploadMediaFile(file: File, targetIndex?: number) {
    setUploadNotice(null);
    setIsUploading(true);

    try {
      if (file.type.startsWith("video/")) {
        await uploadVideoFileInChunks(file, targetIndex);
        return;
      }

      if (file.size > maxImageUploadBytes) {
        setUploadNotice({
          tone: "error",
          message: `Görsel yükleme sınırı ${formatBytes(maxImageUploadBytes)}.`
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData
      });
      const data = await parseJsonResponse<MediaUploadResponse>(
        response,
        "Sunucu yanıtı okunamadı."
      );

      if (!response.ok || !data.ok || !data.url) {
        setUploadNotice({
          tone: "error",
          message: data.message ?? "Medya yüklenemedi.",
          detail:
            data.missingEnvironment?.length
              ? `Eksik ortam değişkenleri: ${data.missingEnvironment.join(", ")}. ${data.setupAction ?? ""}`
              : data.setupAction
        });
        return;
      }

      applyUploadedMedia(data, targetIndex);
      setUploadNotice({
        tone: "success",
        message: "Görsel yüklendi.",
        detail: data.storageBucket ? `Bucket: ${data.storageBucket}` : undefined
      });
    } catch (error) {
      setUploadNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Medya yüklenirken sunucuya ulaşılamadı."
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadMediaFiles(files: FileList | null, targetIndex?: number) {
    if (!files?.length) {
      return;
    }

    if (typeof targetIndex === "number") {
      await uploadMediaFile(files[0], targetIndex);
      return;
    }

    for (const file of Array.from(files)) {
      await uploadMediaFile(file);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const structuredIssues = validateStructuredProductDetails(
      (values.detailContent ?? detailContentDefaults) as ProductDetailFormValues
    );

    if (structuredIssues.length > 0) {
      setErrorMessage(structuredIssues.slice(0, 4).join(" "));
      return;
    }

    const endpoint =
      mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const variants = (values.variants ?? []).filter((variant) => variant.sku && variant.title);
    const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0];
    const payload = normalizeAdminProductPayload(withStoredKurusPrices({
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
      specs: flattenTechnicalGroupsToSpecs(
        (values.detailContent ?? detailContentDefaults).technicalGroups,
        values.specs
      ),
      variants: variants.map((variant, index) => ({
        ...variant,
        isDefault: defaultVariant ? variant === defaultVariant : index === 0
      })),
      searchKeywords: (values.searchKeywords ?? []).filter(Boolean)
    }));

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await parseJsonResponse<ProductMutationResponse>(
        response,
        "Sunucu yanıtı okunamadı."
      );

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
      <div className="sticky top-4 z-20 rounded-lg border border-emerald-100 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-4 xl:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.8fr)_auto] xl:items-center">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
              <PackageCheck className="h-4 w-4 text-emerald-700" aria-hidden />
              Ürün çalışma masası
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {hasValidationErrors
                ? "Eksik alanlar var; bölümlerden hızlıca kontrol edin."
                : `${publishReadyCount}/${publicationChecklist.length} yayın kontrolü hazır · ${displayPrice} · ${stockState}`}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 xl:flex-wrap xl:overflow-visible xl:pb-0">
            {productFormSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex shrink-0 items-center rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-[#063326]"
              >
                {section.label}
              </a>
            ))}
          </div>
          <button
            type="submit"
            disabled={!isHydrated || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
          >
            <Save className="h-4 w-4" aria-hidden />
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
      <fieldset
        disabled={!isHydrated || isSubmitting}
        className="space-y-8 disabled:cursor-wait disabled:opacity-75"
      >
      <section className="surface-card border border-emerald-100 bg-white/95 p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-normal text-emerald-700">
                  Yayın hazırlığı
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Ürünü satışa açmadan önce kritik e-ticaret sinyallerini tamamlayın.
                </h2>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-bold text-[#063326]">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {publishReadyCount}/{publicationChecklist.length} hazır
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {publicationChecklist.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className={`rounded-lg border p-4 ${
                      item.ok
                        ? "border-emerald-200 bg-emerald-50/70"
                        : "border-amber-200 bg-amber-50/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`rounded-lg p-2 ${item.ok ? "bg-white text-emerald-800" : "bg-white text-amber-800"}`}>
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {item.ok ? "Tamam" : "Eksik"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-950">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-950">Mağaza kartı önizlemesi</p>
            <div className="mt-4 overflow-hidden rounded-lg border border-white bg-white shadow-sm">
              <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-emerald-50 to-slate-100">
                {primaryMedia?.url ? (
                  primaryMedia.mediaType === "video" ? (
                    <video src={primaryMedia.url} className="h-full w-full object-contain" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={primaryMedia.url} alt={primaryMedia.altText || currentName || "Ürün görseli"} className="h-full w-full object-contain p-2" />
                  )
                ) : (
                  <div className="grid place-items-center gap-2 text-center text-slate-500">
                    <ImagePlus className="mx-auto h-8 w-8" aria-hidden />
                    <span className="text-xs font-semibold">Ana görsel bekleniyor</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="line-clamp-2 text-base font-bold text-slate-950">
                  {cleanText(currentName) || "Ürün adı"}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                  {cleanText(shortDescriptionValue) || "Kısa açıklama mağaza kartında burada görünür."}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-lg font-bold text-[#063326]">{displayPrice}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {stockState}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="surface-card scroll-mt-28 border border-emerald-100 bg-white/95 p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] xl:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
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
            <div className="mt-5 rounded-lg bg-[#063326] p-5 text-white">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-white/76">
                    İçerik hazırlık skoru
                  </p>
                  <p className="mt-2 text-4xl font-bold tracking-normal">
                    %{featureReadinessPercent}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#063326]">
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
                className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Özelliklerden metin oluştur
              </button>
              <button
                type="button"
                onClick={appendCoreSpecsFromFields}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                Eksik teknik özellikleri ekle
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {featureAuditItems.map((item) => (
              <div
                key={item.label}
                className={`rounded-lg border p-4 ${
                  item.ok
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-amber-200 bg-amber-50/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
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
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              {...register("name")}
            />
            <ExampleHint>Örnek: HomeCharge Pro 11kW</ExampleHint>
            {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
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
            <select className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" {...register("status")}>
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
            <select className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" {...register("brandId")}>
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
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
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
            <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" {...register("sku")} />
            <ExampleHint>Örnek: HCP-11KW-5M</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Varyant başlığı</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              {...register("variantTitle")}
            />
            <ExampleHint>Örnek: 5 Metre Kablo</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Satış fiyatı (TL)</label>
            <input
              type="number"
              min={0}
              step={1}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              {...register("priceKurus", { valueAsNumber: true })}
            />
            <ExampleHint>Örnek: 12.490 TL için 12490 yazın; ekranda ve önizlemede TL olarak görünür.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Karşılaştırma fiyatı (TL)</label>
            <input
              type="number"
              min={0}
              step={1}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              {...register("compareAtKurus", { valueAsNumber: true })}
            />
            <ExampleHint>Örnek: Eski fiyat 13.990 TL ise 13990 yazın.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Kampanyalı fiyat (TL)</label>
            <input
              type="number"
              min={0}
              step={1}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              {...register("discountedPriceKurus", {
                setValueAs: (value) => (value === "" ? null : Number(value))
              })}
            />
            <ExampleHint>Örnek: Kampanya fiyatı 11.990 TL ise 11990 yazın.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Kampanya bitişi</label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              {...register("discountEndsAt")}
            />
            <ExampleHint>Örnek: Kampanya yoksa boş bırakın.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Stok</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              {...register("stockQuantity", { valueAsNumber: true })}
            />
            <ExampleHint>Örnek: 24</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Min stok eşiği</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              {...register("minimumStockThreshold", { valueAsNumber: true })}
            />
            <ExampleHint>Örnek: 3; stok bu seviyeye inince takip kolaylaşır.</ExampleHint>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <input type="checkbox" className="h-4 w-4" {...register("inventoryTrackingEnabled")} />
            <span className="text-sm font-medium text-slate-700">Stok takibi açık</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
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
            <div key={field.fieldId} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 xl:grid-cols-6">
              <input
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                placeholder="SKU"
                {...register(`variants.${index}.sku`)}
              />
              <input
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm xl:col-span-2"
                placeholder="Başlık"
                {...register(`variants.${index}.title`)}
              />
              <input
                type="number"
                min={0}
                step={1}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                placeholder="Fiyat (TL)"
                {...register(`variants.${index}.priceKurus`, { valueAsNumber: true })}
              />
              <input
                type="number"
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
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
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                placeholder="Power label"
                {...register(`variants.${index}.powerLabel`)}
              />
              <input
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                placeholder="Kablo"
                {...register(`variants.${index}.cableLength`)}
              />
              <input
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                placeholder="Konnektör"
                {...register(`variants.${index}.connectorType`)}
              />
              <input
                type="number"
                min={0}
                step={1}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
                placeholder="Karşılaştırma (TL)"
                {...register(`variants.${index}.compareAtKurus`, { valueAsNumber: true })}
              />
            </div>
          ))}
          {variantFields.fields.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
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
                <label key={option.slug} className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
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
                <label key={option.value} className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
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

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-[#063326]">
                <Car className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">Araç uyumluluğu</p>
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
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm"
                placeholder="Örn. Mercedes-Benz, Volvo, Kia"
              />
              <button
                type="button"
                onClick={addVehicleBrand}
                disabled={!normalizeVehicleBrand(vehicleBrandInput)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#063326] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b4b39] disabled:cursor-not-allowed disabled:opacity-45"
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
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#063326]"
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
              <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                Henüz uyumlu araç eklenmedi.
              </p>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {vehicleOptions.map((brand) => {
                const checked = hasVehicleBrand(selectedVehicles, brand);

                return (
                  <label
                    key={brand}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
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
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Teknik alanlar</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Ürün kartı, ürün detay sayfası, karşılaştırma ve schema verisi bu temel teknik alanlardan beslenir.
            </p>
            <ExampleHint>Örnek: Güç 11, konnektör Type 2, IP sınıfı IP54, kablo uzunluğu 5 Metre.</ExampleHint>
          </div>
          <button
            type="button"
            onClick={appendCoreSpecsFromFields}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Alanlardan özellik üret
          </button>
        </div>

        <TechnicalFieldExamples />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Güç değeri</label>
            <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="11, 22 veya 60" {...register("powerKw")} />
            <ExampleHint>Sadece sayı veya kısa değer yazın; kW etiketi sistemde tamamlanır.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Şarj tipi</label>
            <select className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" {...register("chargeType")}>
              <option value="ac">AC</option>
              <option value="dc">DC</option>
            </select>
            <ExampleHint>Wallbox ve kablolar için AC, hızlı şarj cihazları için DC seçin.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Konnektör tipi</label>
            <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Type 2, CCS2" {...register("connectorType")} />
            <ExampleHint>Ürün detayındaki araç uyumu ve filtreleme için kullanılır.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Faz yapısı</label>
            <select className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" {...register("phaseType")}>
              <option value="single_phase">Monofaz</option>
              <option value="three_phase">Trifaz</option>
            </select>
            <ExampleHint>Ev altyapısı ve kurulum uygunluğu metinlerine yansır.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Koruma sınıfı</label>
            <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="IP54, IP65" {...register("ipClass")} />
            <ExampleHint>Dış ortam veya otopark kullanımı için kritik bilgidir.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Kart güç etiketi</label>
            <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="11 kW AC" {...register("powerLabel")} />
            <ExampleHint>Mağaza kartında kısa teknik etiket olarak görünür.</ExampleHint>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Kablo uzunluğu</label>
            <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="5 Metre, Soketli" {...register("cableLength")} />
            <ExampleHint>Varyant başlığı ve ürün açıklaması için kullanılır.</ExampleHint>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="mb-3 text-sm font-semibold text-slate-800">Akıllı özellikler</p>
            <div className="grid gap-2">
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
            <ExampleHint>Seçimler teknik özellik ve satış metni üretiminde kullanılır.</ExampleHint>
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
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100">
              <UploadCloud className="h-4 w-4" aria-hidden />
              {isUploading ? "Yükleniyor..." : "Dosya yükle"}
              <input
                type="file"
                multiple
                accept="image/*,video/mp4,video/webm,video/ogg"
                className="sr-only"
                disabled={isUploading}
                onChange={(event) => {
                  const files = event.target.files;
                  if (files?.length) {
                    void uploadMediaFiles(files);
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
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <LinkIcon className="h-4 w-4" aria-hidden />
              URL ekle
            </button>
          </div>
        </div>
        {uploadNotice ? (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              uploadNotice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : uploadNotice.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <div className="flex items-start gap-2">
              {uploadNotice.tone === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              )}
              <div>
                <p className="font-bold">{uploadNotice.message}</p>
                {uploadNotice.detail ? (
                  <p className="mt-1 text-xs leading-5 opacity-85">{uploadNotice.detail}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
        <div className="space-y-4">
          {mediaFields.fields.map((field, index) => {
            const mediaItem = mediaValues[index];
            const mediaUrl = cleanText(mediaItem?.url);
            const mediaType = mediaItem?.mediaType ?? field.mediaType;

            return (
            <div key={field.fieldId} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[112px_150px_minmax(0,1fr)_220px_auto]">
              <div className="grid aspect-square place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-400">
                {mediaUrl ? (
                  mediaType === "video" ? (
                    <video src={mediaUrl} className="h-full w-full object-contain" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl} alt={mediaItem?.altText || "Ürün medyası"} className="h-full w-full object-contain p-2" />
                  )
                ) : (
                  <ImagePlus className="h-6 w-6" aria-hidden />
                )}
              </div>
              <select
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
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
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
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
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
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
            );
          })}
        </div>
      </section>

      <section id="özellikler" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Akıllı ve teknik özellikler</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Ürün detayında görünen akıllı özellik kartlarını ve teknik özellik gruplarını buradan yönetin.
            </p>
            <ExampleHint>Boş grup veya boş satırlar kaydedilmez. Aktif olmayan alanlar kullanıcı tarafında gösterilmez.</ExampleHint>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => smartFeatureFields.append(createSmartFeature(smartFeatureValues.length + 1))}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Yeni Akıllı Özellik Ekle
            </button>
            <button
              type="button"
              onClick={() => technicalGroupFields.append(createTechnicalGroup(technicalGroupValues.length + 1))}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Teknik Grup Ekle
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-bold text-[#063326]">Akıllı özellik kartları</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Kullanıcı tarafında sadece aktif ve eksiksiz kartlar gösterilir.
              </p>
            </div>
            <p className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-800">
              {smartFeatureValues.filter((item) => item.isActive !== false && cleanText(item.title)).length} aktif kart
            </p>
          </div>

          <div className="mt-5 grid gap-4">
            {smartFeatureFields.fields.map((field, index) => (
              <div key={field.fieldId} className="grid gap-4 rounded-lg border border-emerald-100 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_150px_110px_auto] lg:items-end">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">Özellik başlığı</label>
                  <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Dinamik yük yönetimi" {...register(`detailContent.smartFeatures.${index}.title` as const)} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">Açıklama</label>
                  <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Pano kapasitesini koruyarak şarjı dengeler." {...register(`detailContent.smartFeatures.${index}.description` as const)} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">İkon adı</label>
                  <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="wifi, shield, zap" {...register(`detailContent.smartFeatures.${index}.iconName` as const)} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">Sıra</label>
                  <input type="number" min={0} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" {...register(`detailContent.smartFeatures.${index}.sortOrder` as const, { valueAsNumber: true })} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                    <input type="checkbox" {...register(`detailContent.smartFeatures.${index}.isActive` as const)} />
                    Aktif
                  </label>
                  <button type="button" onClick={() => index > 0 && smartFeatureFields.swap(index, index - 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600">Yukarı</button>
                  <button type="button" onClick={() => index < smartFeatureFields.fields.length - 1 && smartFeatureFields.swap(index, index + 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600">Aşağı</button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Bu akıllı özellik silinsin mi?")) {
                        smartFeatureFields.remove(index);
                      }
                    }}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
            {smartFeatureFields.fields.length === 0 ? (
              <div className="rounded-lg border border-dashed border-emerald-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-600">
                Henüz akıllı özellik yok. Ürün sayfasında bu bölüm gizli kalır.
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-950">Gruplu teknik özellikler</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Grup başlıkları ürün detayında accordion/kart düzeninde gösterilir.
              </p>
            </div>
            <p className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
              {technicalGroupValues.length} grup / {flattenedTechnicalSpecValues.length} özellik
            </p>
          </div>

          <TechnicalSpecExamples />

          <div className="mt-5 space-y-5">
            {technicalGroupFields.fields.map((field, groupIndex) => {
              const groupValue = technicalGroupValues[groupIndex] ?? createTechnicalGroup(groupIndex + 1);
              const items = groupValue.items ?? [];

              return (
                <div key={field.fieldId} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_110px_auto] lg:items-end">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">Grup başlığı</label>
                      <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Elektriksel Özellikler" {...register(`detailContent.technicalGroups.${groupIndex}.title` as const)} />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">Grup açıklaması</label>
                      <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Güç, faz, bağlantı ve çalışma aralığı." {...register(`detailContent.technicalGroups.${groupIndex}.description` as const)} />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">Sıra</label>
                      <input type="number" min={0} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" {...register(`detailContent.technicalGroups.${groupIndex}.sortOrder` as const, { valueAsNumber: true })} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                        <input type="checkbox" {...register(`detailContent.technicalGroups.${groupIndex}.isActive` as const)} />
                        Aktif
                      </label>
                      <button type="button" onClick={() => groupIndex > 0 && technicalGroupFields.swap(groupIndex, groupIndex - 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600">Yukarı</button>
                      <button type="button" onClick={() => groupIndex < technicalGroupFields.fields.length - 1 && technicalGroupFields.swap(groupIndex, groupIndex + 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600">Aşağı</button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Bu teknik özellik grubu silinsin mi?")) {
                            technicalGroupFields.remove(groupIndex);
                          }
                        }}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
                      >
                        Grubu sil
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {items.map((item, itemIndex) => (
                      <div key={`${field.fieldId}-item-${itemIndex}`} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_110px_minmax(0,1fr)_90px_auto] lg:items-end">
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">Özellik adı</label>
                          <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" placeholder="Maksimum güç" {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.name` as const)} />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">Değer</label>
                          <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" placeholder="22" {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.value` as const)} />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">Birim</label>
                          <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" placeholder="kW" {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.unit` as const)} />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">Açıklama</label>
                          <input className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" placeholder="Opsiyonel teknik not" {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.description` as const)} />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">Sıra</label>
                          <input type="number" min={0} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.sortOrder` as const, { valueAsNumber: true })} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                            <input type="checkbox" {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.isActive` as const)} />
                            Aktif
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (!window.confirm("Bu teknik özellik silinsin mi?")) {
                                return;
                              }

                              const nextGroups = [...technicalGroupValues];
                              nextGroups[groupIndex] = {
                                ...groupValue,
                                items: items.filter((_, currentIndex) => currentIndex !== itemIndex)
                              };
                              setValue("detailContent.technicalGroups", nextGroups, {
                                shouldDirty: true,
                                shouldValidate: true
                              });
                            }}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const nextGroups = [...technicalGroupValues];
                        nextGroups[groupIndex] = {
                          ...groupValue,
                          items: [...items, createTechnicalSpecItem(items.length + 1)]
                        };
                        setValue("detailContent.technicalGroups", nextGroups, {
                          shouldDirty: true,
                          shouldValidate: true
                        });
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      Bu gruba özellik ekle
                    </button>
                  </div>
                </div>
              );
            })}
            {technicalGroupFields.fields.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-600">
                Henüz teknik özellik grubu yok. Üstteki teknik alanları doldurup “Alanlardan özellik üret” aksiyonunu kullanabilirsiniz.
              </div>
            ) : null}
          </div>
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
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[240px_1fr_auto]"
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
      </section>

      <section id="seo" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">SEO + AIEO</h2>
          <ExampleHint>Örnek meta başlık: HomeCharge Pro 11kW EV Şarj Cihazı. AI özeti tek cümle, satış odaklı olmalı.</ExampleHint>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Meta başlık" {...register("seoTitle")} />
            <p className={`mt-2 text-xs font-semibold ${seoTitleLength >= 35 && seoTitleLength <= 70 ? "text-emerald-700" : "text-amber-700"}`}>
              {seoTitleLength}/60 karakter hedefi
            </p>
          </div>
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Kanonik URL" {...register("canonicalUrl")} />
          <div className="md:col-span-2">
            <textarea rows={3} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="Meta açıklama" {...register("seoDescription")} />
            <p className={`mt-2 text-xs font-semibold ${seoDescriptionLength >= 110 && seoDescriptionLength <= 170 ? "text-emerald-700" : "text-amber-700"}`}>
              {seoDescriptionLength}/160 karakter hedefi
            </p>
          </div>
          <input className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2" placeholder="Open Graph görsel URL" {...register("ogImageUrl")} />
          <div className="md:col-span-2">
            <textarea rows={3} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" placeholder="AI özeti" {...register("aiSummary")} />
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {cleanText(aiSummaryValue).length}/180 karakter · tek cümle ürün cevabı önerilir
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Arama kelimeleri</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
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
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
              Arama sonucu önizlemesi
            </p>
            <p className="mt-3 text-lg font-semibold text-[#1a0dab]">
              {cleanText(seoTitleValue) || cleanText(currentName) || "Meta başlık"}
            </p>
            <p className="mt-1 text-sm text-[#006621]">
              parkchargeev.com/urun/{cleanText(currentSlug) || slugify(currentName || "urun")}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              {cleanText(seoDescriptionValue) || "Meta açıklama arama sonucunda burada görünür."}
            </p>
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
                  className="h-48 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
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
                  className="h-48 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
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
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
          placeholder="Admin notları"
          {...register("adminNotes")}
        />
      </section>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {hasValidationErrors ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Formda eksik veya hatalı alanlar var. Ürün adı, açıklama, SKU, fiyat,
          stok, kategori ve SEO alanlarını kontrol edin.
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
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
