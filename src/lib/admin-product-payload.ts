import { inferProductMediaType } from "@/lib/product-media";

function getText(value: unknown, field: string) {
  if (!value || typeof value !== "object") {
    return "";
  }

  return String((value as Record<string, unknown>)[field] ?? "").trim();
}

function hasAnyText(value: unknown, fields: string[]) {
  return fields.some((field) => getText(value, field).length > 0);
}

function getNumber(value: unknown, field: string) {
  const raw = getText(value, field);
  const parsed = Number(raw || 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

function filterRows(value: unknown, shouldKeep: (row: unknown) => boolean) {
  return Array.isArray(value) ? value.filter(shouldKeep) : [];
}

function normalizeDetailContent(detailContent: unknown) {
  if (!detailContent || typeof detailContent !== "object") {
    return detailContent;
  }

  const detail = detailContent as Record<string, unknown>;

  return {
    ...detail,
    purchaseReadiness: filterRows(
      detail.purchaseReadiness,
      (row) => hasAnyText(row, ["label", "value"])
    ),
    policyDetails: filterRows(
      detail.policyDetails,
      (row) => hasAnyText(row, ["title", "body"])
    ),
    faqs: filterRows(
      detail.faqs,
      (row) => hasAnyText(row, ["question", "answer"])
    )
  };
}

function normalizeMediaRows(value: unknown) {
  return filterRows(
    value,
    (row) => hasAnyText(row, ["url", "altText"])
  ).map((row) => {
    if (!row || typeof row !== "object") {
      return row;
    }

    const media = row as Record<string, unknown>;
    const url = getText(media, "url");
    const mediaType = getText(media, "mediaType");

    return {
      ...media,
      mediaType: mediaType === "video" || mediaType === "image"
        ? mediaType
        : inferProductMediaType(url)
    };
  });
}

export function normalizeAdminProductPayload<T>(payload: T): T {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const product = payload as Record<string, unknown>;

  return {
    ...product,
    variants: filterRows(
      product.variants,
      (row) =>
        hasAnyText(row, ["sku", "title", "powerLabel", "cableLength", "connectorType"]) ||
        getNumber(row, "priceKurus") > 0 ||
        getNumber(row, "stockQuantity") > 0
    ),
    media: normalizeMediaRows(product.media),
    specs: filterRows(
      product.specs,
      (row) => hasAnyText(row, ["label", "value"])
    ),
    detailContent: normalizeDetailContent(product.detailContent)
  } as T;
}
