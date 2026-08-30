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
import {
  defaultProductDetailContent,
  productBadgePlacementGroups
} from "@/lib/product-detail-content";
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

const ProductFormDetailSection = dynamic(
  () =>
    import("@/components/admin/product-form-detail-section").then(
      (module) => module.ProductFormDetailSection
    ),
  {
    ssr: false,
    loading: () => (
      <section id="detay" className="surface-card min-h-[520px] scroll-mt-28 border border-slate-200 bg-white/95 p-6">
        <p className="text-sm font-medium text-slate-600">Urun detay alanlari yukleniyor...</p>
      </section>
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

export type ProductFormProps = {
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
  hasBluetooth: false,
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
  { id: "fiyat-stok", label: "Satış" },
  { id: "teknik", label: "Teknik" },
  { id: "görseller", label: "Görsel" },
  { id: "özellikler", label: "Özellik" },
  { id: "katalog", label: "Gelişmiş" },
  { id: "seo", label: "SEO" }
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

function phaseLabel(value: string) {
  if (value === "single_and_three_phase") {
    return "monofaz + trifaz";
  }

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

const singleTechnicalGroupTitle = "Teknik özellikler";

function createTechnicalGroup(sortOrder: number, title = singleTechnicalGroupTitle) {
  return {
    title,
    description: "",
    isActive: true,
    sortOrder,
    items: [createTechnicalSpecItem(1)]
  };
}

function createTechnicalGroupTemplate() {
  return [
    {
      ...createTechnicalGroup(1),
      description: "Ürün detayında tek tabloda görünen teknik özellikler.",
      items: [
        { ...createTechnicalSpecItem(1), name: "Ürün tipi", value: "AC duvar tipi şarj cihazı" },
        { ...createTechnicalSpecItem(2), name: "Kullanım alanı", value: "Ev, site ve işletme" },
        { ...createTechnicalSpecItem(3), name: "Maksimum güç", value: "22", unit: "kW" },
        { ...createTechnicalSpecItem(4), name: "Faz yapısı", value: "Trifaz" },
        { ...createTechnicalSpecItem(5), name: "Konnektör", value: "Type 2" },
        { ...createTechnicalSpecItem(6), name: "Wi-Fi", value: "Desteklenir" },
        { ...createTechnicalSpecItem(7), name: "RFID", value: "Opsiyonel" },
        { ...createTechnicalSpecItem(8), name: "OCPP", value: "Uyumlu" },
        { ...createTechnicalSpecItem(9), name: "Koruma sınıfı", value: "IP54 / IP65" },
        { ...createTechnicalSpecItem(10), name: "Kaçak akım koruması", value: "Desteklenir" }
      ]
    }
  ];
}

function mergeTechnicalGroupsToSingleGroup(
  groups?: ProductDetailFormValues["technicalGroups"],
  fallbackSpecs: ProductFormValues["specs"] = []
) {
  const sourceGroups = groups?.length ? groups : buildTechnicalGroupsFromSpecs(fallbackSpecs);
  const items = (sourceGroups ?? [])
    .flatMap((group) => group.items ?? [])
    .filter((item) => cleanText(item.name) || cleanText(item.value))
    .map((item, index) => ({
      ...item,
      sortOrder: index + 1
    }));

  if (items.length === 0) {
    return [createTechnicalGroup(1)];
  }

  return [
    {
      ...createTechnicalGroup(1),
      description: "Ürün detayında tek tabloda görünen teknik özellikler.",
      items
    }
  ];
}

function buildTechnicalGroupsFromSpecs(specs: ProductFormValues["specs"]) {
  const items = (specs ?? []).reduce<ReturnType<typeof createTechnicalSpecItem>[]>((nextItems, spec, index) => {
    const label = cleanText(spec.label);
    const value = cleanText(spec.value);

    if (!label || !value) {
      return nextItems;
    }

    nextItems.push({
      name: label,
      value,
      unit: "",
      description: "",
      isActive: true,
      sortOrder: index + 1
    });

    return nextItems;
  }, []);

  return [
    {
      ...createTechnicalGroup(1),
      description: "Ürün detayında tek tabloda görünen teknik özellikler.",
      items: items.length ? items : [createTechnicalSpecItem(1)]
    }
  ];
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
        infoCards:
          initialValues?.detailContent?.infoCards?.length
            ? initialValues.detailContent.infoCards
            : detailContentDefaults.infoCards,
        badges:
          initialValues?.detailContent?.badges?.length
            ? initialValues.detailContent.badges
            : detailContentDefaults.badges,
        purchaseBenefits:
          initialValues?.detailContent?.purchaseBenefits?.length
            ? initialValues.detailContent.purchaseBenefits
            : detailContentDefaults.purchaseBenefits,
        seoIntents:
          initialValues?.detailContent?.seoIntents?.length
            ? initialValues.detailContent.seoIntents
            : detailContentDefaults.seoIntents,
        useCases:
          initialValues?.detailContent?.useCases?.length
            ? initialValues.detailContent.useCases
            : detailContentDefaults.useCases,
        highlights:
          initialValues?.detailContent?.highlights?.length
            ? initialValues.detailContent.highlights
            : detailContentDefaults.highlights,
        smartFeatures:
          initialValues?.detailContent?.smartFeatures?.length
            ? initialValues.detailContent.smartFeatures
            : buildSmartFeaturesFromSpecs(initialValues?.specs),
        technicalGroups: mergeTechnicalGroupsToSingleGroup(
          initialValues?.detailContent?.technicalGroups,
          initialValues?.specs
        ),
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
        trustBlocks:
          initialValues?.detailContent?.trustBlocks?.length
            ? initialValues.detailContent.trustBlocks
            : detailContentDefaults.trustBlocks,
        policyDetails:
          initialValues?.detailContent?.policyDetails ??
          detailContentDefaults.policyDetails,
        faqs:
          initialValues?.detailContent?.faqs ??
          detailContentDefaults.faqs,
        actionLabels: {
          ...detailContentDefaults.actionLabels,
          ...initialValues?.detailContent?.actionLabels
        },
        reviews: {
          ...detailContentDefaults.reviews,
          ...initialValues?.detailContent?.reviews
        }
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

  const badgeFields = useFieldArray({
    control,
    name: "detailContent.badges",
    keyName: "fieldId"
  });

  const infoCardFields = useFieldArray({
    control,
    name: "detailContent.infoCards",
    keyName: "fieldId"
  });

  const variantFields = useFieldArray({
    control,
    name: "variants",
    keyName: "fieldId"
  });

  const technicalGroupFields = useFieldArray({
    control,
    name: "detailContent.technicalGroups",
    keyName: "fieldId"
  });

  const trustBlockFields = useFieldArray({
    control,
    name: "detailContent.trustBlocks",
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
  const hasBluetoothValue = Boolean(watch("hasBluetooth"));
  const hasRfidValue = Boolean(watch("hasRfid"));
  const has4gValue = Boolean(watch("has4g"));
  const installRequiredValue = Boolean(watch("installRequired"));
  const mediaValues = watch("media") ?? [];
  const specValues = watch("specs") ?? [];
  const variantValues = watch("variants") ?? [];
  const seoTitleValue = watch("seoTitle") ?? "";
  const seoDescriptionValue = watch("seoDescription") ?? "";
  const detailContent = (watch("detailContent") ?? detailContentDefaults) as ProductDetailFormValues;
  const smartFeatureValues = detailContent.smartFeatures ?? [];
  const technicalGroupValues = detailContent.technicalGroups ?? [];
  const flattenedTechnicalSpecValues = flattenTechnicalGroupsToSpecs(technicalGroupValues, specValues);
  const smartFeatureLabels = uniqueList([
    hasWifiValue ? "Wi-Fi" : "",
    hasBluetoothValue ? "Bluetooth" : "",
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
      label: "Görsel",
      ok: mediaValues.some((item) => cleanText(item.url)),
      detail: "En az bir görsel URL gerekli; alt text opsiyonel SEO desteği sağlar."
    },
    {
      label: "SEO kalitesi",
      ok: Boolean(cleanText(seoTitleValue) && cleanText(seoDescriptionValue)),
      detail: "Meta başlık ve meta açıklama tamamlanmalı."
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
      ok: hasPrimaryMedia,
      icon: ImagePlus
    },
    {
      label: "Teknik veri",
      detail: `${flattenedTechnicalSpecValues.length} özellik / ${variantValues.length || 1} varyant`,
      ok: flattenedTechnicalSpecValues.length >= 4 && Boolean(powerText || connectorText),
      icon: Sparkles
    },
    {
      label: "SEO ve içerik",
      detail: `${seoTitleLength}/60 başlık, ${seoDescriptionLength}/160 açıklama, ${plainDescriptionLength} içerik`,
      ok:
        seoTitleLength >= 35 &&
        seoTitleLength <= 70 &&
        seoDescriptionLength >= 110 &&
        seoDescriptionLength <= 170,
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
      sortOrder: mediaValues.length + 1,
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

  function reorderMediaItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= mediaValues.length) {
      return;
    }

    const nextMedia = [...mediaValues];
    const [movedItem] = nextMedia.splice(index, 1);
    nextMedia.splice(nextIndex, 0, movedItem);

    setValue(
      "media",
      nextMedia.map((item, itemIndex) => ({
        ...item,
        sortOrder: itemIndex + 1
      })),
      {
        shouldDirty: true,
        shouldValidate: true
      }
    );
  }

  function sortMediaByManualOrder() {
    setValue(
      "media",
      [...mediaValues]
        .sort((left, right) => Number(left.sortOrder ?? 0) - Number(right.sortOrder ?? 0))
        .map((item, index) => ({
          ...item,
          sortOrder: index + 1
        })),
      {
        shouldDirty: true,
        shouldValidate: true
      }
    );
  }

  function moveTechnicalSpecItem(groupIndex: number, itemIndex: number, direction: -1 | 1) {
    const groupValue = technicalGroupValues[groupIndex] ?? createTechnicalGroup(groupIndex + 1);
    const items = [...(groupValue.items ?? [])];
    const nextIndex = itemIndex + direction;

    if (nextIndex < 0 || nextIndex >= items.length) {
      return;
    }

    const [movedItem] = items.splice(itemIndex, 1);
    items.splice(nextIndex, 0, movedItem);

    const nextGroups = [...technicalGroupValues];
    nextGroups[groupIndex] = {
      ...groupValue,
      items: items.map((item, index) => ({
        ...item,
        sortOrder: index + 1
      }))
    };

    setValue("detailContent.technicalGroups", nextGroups, {
      shouldDirty: true,
      shouldValidate: true
    });
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
    const singleTechnicalGroups = mergeTechnicalGroupsToSingleGroup(
      (values.detailContent ?? detailContentDefaults).technicalGroups,
      values.specs
    );
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
      detailContent: {
        ...(values.detailContent ?? detailContentDefaults),
        technicalGroups: singleTechnicalGroups
      },
      specs: flattenTechnicalGroupsToSpecs(
        singleTechnicalGroups,
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
          <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
            {cleanText(currentSlug) ? (
              <a
                href={`/urun/${cleanText(currentSlug)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                <LinkIcon className="h-4 w-4" aria-hidden />
                Sitede önizle
              </a>
            ) : null}
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
      </div>
      <fieldset
        disabled={!isHydrated || isSubmitting}
        className="space-y-8 disabled:cursor-wait disabled:opacity-75"
      >
      <section className="rounded-xl border border-emerald-100 bg-white/95 p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-emerald-700">
              Hızlı ürün girişi
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Önce temel satış bilgilerini doldurun, gelişmiş alanları gerektiğinde açın.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Ürün adı, fiyat, stok, teknik değer ve ana görsel kaydı yayına hazırlamak için yeterlidir. Varyant, SEO, rozet ve detay sayfası içerikleri altta kapalı panellerde durur.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <span className="rounded-full bg-[#063326] px-4 py-2 text-xs font-bold text-white">
              {publishReadyCount}/{publicationChecklist.length} temel kontrol
            </span>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-[#063326]">
              %{featureReadinessPercent} içerik skoru
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">
              {displayPrice} · {stockState}
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-5">
          {publicationChecklist.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  item.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
                <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5">
                  {item.ok ? "Tamam" : "Eksik"}
                </span>
              </div>
            );
          })}
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
            <label className="mb-2 block text-sm font-medium text-slate-700">Ürün sırası</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              {...register("detailContent.adminSortOrder", { valueAsNumber: true })}
            />
            <ExampleHint>Düşük sıra değeri mağaza ve admin listelerinde ürünü daha öne alır.</ExampleHint>
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">Fiyat ve stok</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Satış fiyatı, kampanya, stok ve KDV ayarları mağaza kartı, ürün detayı ve ödeme tutarı için temel kaynaktır.</p>
        </div>

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

      <section id="varyantlar" className="surface-card scroll-mt-28 overflow-hidden border border-slate-200 bg-white/95 p-0">
        <details className="group">
          <summary className="flex cursor-pointer list-none flex-col gap-2 px-6 py-5 transition hover:bg-emerald-50/55 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="block text-xs font-bold uppercase tracking-normal text-emerald-700">Gelişmiş ayar</span>
              <span className="mt-1 block text-lg font-semibold text-slate-950">Varyantlar</span>
              <span className="mt-1 block max-w-3xl text-sm leading-6 text-slate-600">Birden fazla kablo, güç, stok veya fiyat seçeneğiniz yoksa bu bölümü kapalı bırakabilirsiniz.</span>
            </span>
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 group-open:bg-[#063326] group-open:text-white">
              Aç / kapat
            </span>
          </summary>
          <div className="border-t border-slate-100 p-6">
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
          </div>
        </details>
      </section>

      <section id="katalog" className="surface-card scroll-mt-28 overflow-hidden border border-slate-200 bg-white/95 p-0">
        <details className="group">
          <summary className="flex cursor-pointer list-none flex-col gap-2 px-6 py-5 transition hover:bg-emerald-50/55 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="block text-xs font-bold uppercase tracking-normal text-emerald-700">Gelişmiş ayar</span>
              <span className="mt-1 block text-lg font-semibold text-slate-950">Katalog, etiket ve araç uyumluluğu</span>
              <span className="mt-1 block max-w-3xl text-sm leading-6 text-slate-600">Kategori, vitrin etiketi ve uyumlu araç listesi gibi yayın sonrası zenginleştirme alanları.</span>
            </span>
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 group-open:bg-[#063326] group-open:text-white">
              Aç / kapat
            </span>
          </summary>
          <div className="border-t border-slate-100 p-6">
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
            <p className="mb-3 text-sm font-semibold text-slate-800">Vitrin etiketleri</p>
            <ExampleHint>Örnek: Çok Satan, Yeni, Kurumsal veya İndirimli etiketlerini ürün kartı ve detay görünümünde kullanın.</ExampleHint>
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
          </div>
        </details>
      </section>

      <section id="teknik" className="surface-card scroll-mt-28 border border-slate-200 bg-white/95 p-6">
        <div className="mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Teknik alanlar</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Ürün kartı, ürün detay sayfası, karşılaştırma ve schema verisi bu temel teknik alanlardan beslenir.
            </p>
            <ExampleHint>Örnek: Güç 11, konnektör Type 2, IP sınıfı IP54, kablo uzunluğu 5 Metre.</ExampleHint>
          </div>
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
              <option value="single_and_three_phase">Monofaz + Trifaz</option>
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
                <input type="checkbox" {...register("hasBluetooth")} />
                Bluetooth
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
            <ExampleHint>Bu seçimler ürün kartı, teknik tablo ve ürün detayındaki otomatik özellik vurgularını besler.</ExampleHint>
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
                  sortOrder: mediaValues.length + 1,
                  isPrimary: mediaFields.fields.length === 0
                })
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <LinkIcon className="h-4 w-4" aria-hidden />
              URL ekle
            </button>
            <button
              type="button"
              onClick={sortMediaByManualOrder}
              disabled={mediaValues.length < 2}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sıraya göre diz
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
            <div key={field.fieldId} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[96px_130px_90px_minmax(0,1fr)_200px_auto]">
              <div className="grid aspect-square place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-400">
                {mediaUrl ? (
                  mediaType === "video" ? (
                    <video src={mediaUrl} className="h-full w-full object-contain" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl}
                      alt={mediaItem?.altText || "Ürün medyası"}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain p-2"
                    />
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
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-normal text-slate-500">
                  Sıra
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
                  {...register(`media.${index}.sortOrder`, { valueAsNumber: true })}
                />
              </div>
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
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => reorderMediaItem(index, -1)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Yukarı
                </button>
                <button
                  type="button"
                  disabled={index === mediaFields.fields.length - 1}
                  onClick={() => reorderMediaItem(index, 1)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Aşağı
                </button>
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
            <h2 className="text-xl font-semibold text-slate-950">Teknik özellikler</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Ürün detayında görünen teknik özellikleri buradan yönetin.
            </p>
            <ExampleHint>Boş grup veya boş satırlar kaydedilmez. Aktif olmayan alanlar kullanıcı tarafında gösterilmez.</ExampleHint>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const nextGroups = mergeTechnicalGroupsToSingleGroup(technicalGroupValues, specValues);
                const groupValue = nextGroups[0] ?? createTechnicalGroup(1);

                technicalGroupFields.replace([
                  {
                    ...groupValue,
                    items: [...(groupValue.items ?? []), createTechnicalSpecItem((groupValue.items?.length ?? 0) + 1)]
                  }
                ]);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Teknik Özellik Ekle
            </button>

            <button
              type="button"
              onClick={() => {
                if (
                  technicalGroupValues.length > 0 &&
                  !window.confirm("Mevcut teknik gruplar hazır şablonla değiştirilsin mi?")
                ) {
                  return;
                }

                technicalGroupFields.replace(createTechnicalGroupTemplate());
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary/10"
            >
              Hazır Teknik Şablon Yükle
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-950">Teknik özellikler</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Tüm teknik değerler ürün detayında tek tabloda, ayrı grup parçalarına bölünmeden görünür.
              </p>
            </div>
            <p className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
              Tek tablo / {flattenedTechnicalSpecValues.length} özellik
            </p>
          </div>

          <TechnicalSpecExamples />

          <div className="mt-5 space-y-5">
            {technicalGroupFields.fields.slice(0, 1).map((field, groupIndex) => {
              const groupValue = technicalGroupValues[groupIndex] ?? createTechnicalGroup(groupIndex + 1);
              const items = groupValue.items ?? [];

              return (
                <div key={field.fieldId} className="rounded-lg border border-slate-200 bg-white p-4">
                  <input type="hidden" {...register(`detailContent.technicalGroups.${groupIndex}.title` as const)} />
                  <input type="hidden" {...register(`detailContent.technicalGroups.${groupIndex}.description` as const)} />
                  <input type="hidden" {...register(`detailContent.technicalGroups.${groupIndex}.sortOrder` as const, { valueAsNumber: true })} />

                  <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    Teknik özellikleri tek listede yönetin. Satırları yukarı/aşağı alarak ürün detayındaki sıralamayı değiştirebilirsiniz.
                  </div>

                  <div className="mt-4 space-y-3">
                    {items.map((item, itemIndex) => (
                      <div
                        key={`${field.fieldId}-item-${itemIndex}`}
                        className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_110px_minmax(0,1fr)_90px_auto] lg:items-end"
                      >
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">
                            Özellik adı
                          </label>
                          <input
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                            placeholder="Maksimum güç"
                            {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.name` as const)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">
                            Değer
                          </label>
                          <input
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                            placeholder="22"
                            {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.value` as const)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">
                            Birim
                          </label>
                          <input
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                            placeholder="kW"
                            {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.unit` as const)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">
                            Açıklama
                          </label>
                          <input
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                            placeholder="Opsiyonel teknik not"
                            {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.description` as const)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-slate-500">
                            Sıra
                          </label>
                          <input
                            type="number"
                            min={0}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                            {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.sortOrder` as const, {
                              valueAsNumber: true
                            })}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                            <input type="checkbox" {...register(`detailContent.technicalGroups.${groupIndex}.items.${itemIndex}.isActive` as const)} />
                            Aktif
                          </label>

                          <button
                            type="button"
                            disabled={itemIndex === 0}
                            onClick={() => moveTechnicalSpecItem(groupIndex, itemIndex, -1)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Yukarı
                          </button>

                          <button
                            type="button"
                            disabled={itemIndex === items.length - 1}
                            onClick={() => moveTechnicalSpecItem(groupIndex, itemIndex, 1)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Aşağı
                          </button>

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
                Henüz teknik özellik yok. “Teknik Özellik Ekle” veya “Hazır Teknik Şablon Yükle” aksiyonunu kullanabilirsiniz.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <ProductFormDetailSection
        detailContent={detailContent}
        register={register}
        setValue={setValue}
        badgeFields={badgeFields}
        infoCardFields={infoCardFields}
        trustBlockFields={trustBlockFields}
        policyFields={policyFields}
        faqFields={faqFields}
      />

      <section id="seo" className="surface-card scroll-mt-28 overflow-hidden border border-slate-200 bg-white/95 p-0">
        <details className="group">
          <summary className="flex cursor-pointer list-none flex-col gap-2 px-6 py-5 transition hover:bg-emerald-50/55 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="block text-xs font-bold uppercase tracking-normal text-emerald-700">Gelişmiş ayar</span>
              <span className="mt-1 block text-lg font-semibold text-slate-950">SEO ve arama görünümü</span>
              <span className="mt-1 block max-w-3xl text-sm leading-6 text-slate-600">Ürün yayına hazır olduktan sonra meta başlık, açıklama, canonical ve arama kelimelerini düzenleyin.</span>
            </span>
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 group-open:bg-[#063326] group-open:text-white">
              Aç / kapat
            </span>
          </summary>
          <div className="border-t border-slate-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">SEO</h2>
          <ExampleHint>Örnek meta başlık: HomeCharge Pro 11kW EV Şarj Cihazı. Meta açıklama kullanıcıya net satın alma sebebi vermeli.</ExampleHint>
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
          <input type="hidden" {...register("aiSummary")} />
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
          </div>
        </details>
      </section>

      <section id="iliskiler" className="surface-card scroll-mt-28 overflow-hidden border border-slate-200 bg-white/95 p-0">
        <details className="group">
          <summary className="flex cursor-pointer list-none flex-col gap-2 px-6 py-5 transition hover:bg-emerald-50/55 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="block text-xs font-bold uppercase tracking-normal text-emerald-700">Gelişmiş ayar</span>
              <span className="mt-1 block text-lg font-semibold text-slate-950">İlişkiler ve admin notları</span>
              <span className="mt-1 block max-w-3xl text-sm leading-6 text-slate-600">Benzer ürün, aksesuar önerisi ve yalnızca ekip içinde görünen operasyon notları.</span>
            </span>
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 group-open:bg-[#063326] group-open:text-white">
              Aç / kapat
            </span>
          </summary>
          <div className="border-t border-slate-100 p-6">
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
          </div>
        </details>
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
