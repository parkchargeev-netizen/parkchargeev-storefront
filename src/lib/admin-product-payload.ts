import { inferProductMediaType } from "@/lib/product-media";
import { repairMojibakeText } from "@/lib/text-encoding";
import {
  normalizeProductBadgePlacement,
  productBadgePlacementValues
} from "@/lib/product-detail-content";

function getText(value: unknown, field: string) {
  if (!value || typeof value !== "object") {
    return "";
  }

  return repairMojibakeText(String((value as Record<string, unknown>)[field] ?? "")).trim();
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

function getBoolean(value: unknown, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasCompleteText(value: unknown, fields: string[]) {
  return fields.every((field) => getText(value, field).length > 0);
}

function normalizeBadges(value: unknown) {
  return filterRows(value, (row) => hasAnyText(row, ["label", "tone", "position"]))
    .filter((row) => hasCompleteText(row, ["label"]))
    .map((row, index) => {
      const badge = row as Record<string, unknown>;
      const tone = getText(badge, "tone");
      const position = getText(badge, "position");

      return {
        label: getText(badge, "label"),
        tone: ["success", "primary", "warning", "neutral", "danger"].includes(tone)
          ? tone
          : "neutral",
        position: (productBadgePlacementValues as readonly string[]).includes(position)
          ? position
          : normalizeProductBadgePlacement(position),
        isActive: getBoolean(badge.isActive),
        sortOrder: normalizeNumber(badge.sortOrder, index + 1)
      };
    });
}

function normalizeTechnicalGroups(value: unknown) {
  const groups = filterRows(value, (row) => hasAnyText(row, ["title", "description"]) || Array.isArray((row as Record<string, unknown> | null)?.items))
    .map((row, groupIndex) => {
      const group = (row ?? {}) as Record<string, unknown>;
      const items = filterRows(group.items, (item) => hasAnyText(item, ["name", "value", "unit", "description"]))
        .filter((item) => hasCompleteText(item, ["name", "value"]))
        .map((item, itemIndex) => {
          const spec = item as Record<string, unknown>;

          return {
            name: getText(spec, "name"),
            value: getText(spec, "value"),
            unit: getText(spec, "unit"),
            description: getText(spec, "description"),
            isActive: getBoolean(spec.isActive),
            sortOrder: normalizeNumber(spec.sortOrder, itemIndex + 1)
          };
        });

      return {
        title: getText(group, "title") || "Teknik özellikler",
        description: getText(group, "description"),
        isActive: getBoolean(group.isActive),
        sortOrder: normalizeNumber(group.sortOrder, groupIndex + 1),
        items
      };
    })
    .filter((group) => group.title && group.items.length > 0);

  const items = groups.flatMap((group) => group.items);

  return items.length
    ? [
        {
          title: "Teknik özellikler",
          description: "Ürün detayında tek tabloda görünen teknik özellikler.",
          isActive: true,
          sortOrder: 1,
          items: items.map((item, index) => ({
            ...item,
            sortOrder: index + 1
          }))
        }
      ]
    : [];
}

function flattenTechnicalGroupsToSpecs(groups: Array<Record<string, unknown>>) {
  return groups.flatMap((group) => {
    const groupName = getText(group, "title") || "Teknik";
    const groupActive = getBoolean(group.isActive);
    const items = Array.isArray(group.items) ? group.items : [];

    if (!groupActive) {
      return [];
    }

    return items
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .filter((item) => getBoolean(item.isActive) && hasCompleteText(item, ["name", "value"]))
      .map((item) => {
        const value = [getText(item, "value"), getText(item, "unit")].filter(Boolean).join(" ");

        return {
          groupName,
          label: getText(item, "name"),
          value
        };
      });
  });
}

function normalizeDetailContent(detailContent: unknown) {
  if (!detailContent || typeof detailContent !== "object") {
    return detailContent;
  }

  const detail = detailContent as Record<string, unknown>;
  const technicalGroups = normalizeTechnicalGroups(detail.technicalGroups);

  return {
    ...detail,
    technicalGroups,
    badges: normalizeBadges(detail.badges),
    faqs: filterRows(
      detail.faqs,
      (row) => hasAnyText(row, ["question", "answer"])
    )
  };
}

function normalizeMediaRows(value: unknown) {
  return filterRows(
    value,
    (row) => hasAnyText(row, ["url"])
  ).map((row, index) => {
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
        : inferProductMediaType(url),
      sortOrder: normalizeNumber(media.sortOrder, index + 1)
    };
  }).sort((left, right) => {
    const leftOrder = typeof left === "object" && left ? Number((left as Record<string, unknown>).sortOrder ?? 0) : 0;
    const rightOrder = typeof right === "object" && right ? Number((right as Record<string, unknown>).sortOrder ?? 0) : 0;

    return leftOrder - rightOrder;
  });
}

export function normalizeAdminProductPayload<T>(payload: T): T {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const product = payload as Record<string, unknown>;

  const detailContent = normalizeDetailContent(product.detailContent);
  const technicalGroups =
    detailContent && typeof detailContent === "object"
      ? ((detailContent as Record<string, unknown>).technicalGroups as Array<Record<string, unknown>> | undefined)
      : undefined;
  const groupedSpecs = technicalGroups?.length ? flattenTechnicalGroupsToSpecs(technicalGroups) : [];

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
    specs: groupedSpecs.length
      ? groupedSpecs
      : filterRows(
          product.specs,
          (row) => hasAnyText(row, ["label", "value"])
        ),
    detailContent
  } as T;
}

