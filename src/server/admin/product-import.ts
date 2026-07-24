import { randomUUID } from "node:crypto";
import { inflateRawSync } from "node:zlib";

import { desc, eq, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import type {
  ProductImportConfirmResponse,
  ProductImportField,
  ProductImportHistoryItem,
  ProductImportPreviewResponse,
  ProductImportPreviewRow,
  ProductImportPreviewSummary
} from "@/lib/admin-product-import-contract";
import { productImportFieldValues } from "@/lib/admin-product-import-contract";
import { hasDatabaseConfig, RuntimeConfigError } from "@/lib/runtime-config";
import { recordAuditLog } from "@/server/admin/audit";
import type { AdminSessionPayload } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import {
  adminUsers,
  auditLogs,
  inventoryMovements,
  productVariants,
  products
} from "@/server/db/schema";

type RequestMeta = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

type RawImportRow = {
  rowNumber: number;
  values: Record<string, string>;
};

type ProductTarget = {
  productId: string;
  variantId: string | null;
  matchedBy: "product_id" | "sku" | "slug";
  sku: string | null;
  slug: string;
  name: string;
  priceKurus: number | null;
  salePriceKurus: number | null;
  stockQuantity: number | null;
  isDefaultVariant: boolean;
};

type ProductImportConfirmInput = {
  fileName: string;
  selectedFields: ProductImportField[];
  rows: ProductImportPreviewRow[];
  actor: AdminSessionPayload;
  requestMeta: RequestMeta;
};

type ProductImportPreviewInput = {
  fileName: string;
  mimeType?: string;
  buffer: Buffer;
  selectedFields: ProductImportField[];
};

type ZipEntry = {
  name: string;
  compression: number;
  compressedSize: number;
  localHeaderOffset: number;
};

const maxImportBytes = 2 * 1024 * 1024;
const maxImportRows = 1000;

const headerAliases: Record<string, string[]> = {
  product_id: ["product_id", "id", "urun_id", "ürün_id"],
  sku: ["sku", "urun_kodu", "ürün_kodu", "product_code", "kod"],
  slug: ["slug", "url", "urun_slug", "ürün_slug"],
  name: ["name", "urun", "ürün", "urun_adi", "ürün_adı", "product_name"],
  price: ["price", "fiyat", "liste_fiyati", "liste_fiyatı"],
  sale_price: ["sale_price", "indirimli_fiyat", "kampanya_fiyati", "kampanya_fiyatı", "compare_at", "compare_at_price"],
  stock: ["stock", "stok", "stock_quantity", "stok_adedi"],
  status: ["status", "durum"]
};

export class ProductImportError extends Error {
  readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = "ProductImportError";
    this.details = details;
  }
}

function ensureDatabaseConfig() {
  if (hasDatabaseConfig()) {
    return;
  }

  throw new RuntimeConfigError({
    area: "database",
    missingKeys: ["DATABASE_URL"],
    message: "Toplu urun importu icin DATABASE_URL tanimli olmalidir."
  });
}

export function normalizeImportFields(input: unknown): ProductImportField[] {
  const rawValues = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];
  const seen = new Set<ProductImportField>();

  for (const value of rawValues) {
    const normalized = String(value).trim();

    if (productImportFieldValues.includes(normalized as ProductImportField)) {
      seen.add(normalized as ProductImportField);
    }
  }

  return [...seen];
}

function validateSelectedFields(fields: ProductImportField[]) {
  if (fields.length === 0) {
    throw new ProductImportError("En az bir guncellenecek alan secin.");
  }
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function canonicalHeader(value: string) {
  const normalized = normalizeHeader(value);

  for (const [canonical, aliases] of Object.entries(headerAliases)) {
    if (aliases.map(normalizeHeader).includes(normalized)) {
      return canonical;
    }
  }

  return normalized;
}

function getStringValue(row: RawImportRow, key: string) {
  return row.values[key]?.trim() ?? "";
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value);
  rows.push(row);

  return rows.filter((item) => item.some((cell) => cell.trim().length > 0));
}

function rowsToRecords(rows: string[][]): RawImportRow[] {
  const headerRow = rows.find((row) => row.some((cell) => cell.trim().length > 0));

  if (!headerRow) {
    throw new ProductImportError("Dosyada baslik satiri bulunamadi.");
  }

  const headerIndex = rows.indexOf(headerRow);
  const headers = headerRow.map((cell) => canonicalHeader(cell));
  const duplicateHeaders = headers.filter((header, index) => header && headers.indexOf(header) !== index);

  if (duplicateHeaders.length > 0) {
    throw new ProductImportError("Tekrarlanan kolon basligi bulundu.", [...new Set(duplicateHeaders)]);
  }

  return rows
    .slice(headerIndex + 1)
    .map((row, index) => ({
      rowNumber: headerIndex + index + 2,
      values: headers.reduce<Record<string, string>>((current, header, headerPosition) => {
        if (!header) {
          return current;
        }

        return {
          ...current,
          [header]: row[headerPosition]?.trim() ?? ""
        };
      }, {})
    }))
    .filter((row) => Object.values(row.values).some((value) => value.trim().length > 0));
}

function xmlDecode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
}

function getXmlAttribute(tag: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = tag.match(new RegExp(`${escaped}="([^"]*)"`));
  return match ? xmlDecode(match[1]) : null;
}

function readZipEntries(buffer: Buffer) {
  let endOfCentralDirectory = -1;
  const minimumOffset = Math.max(0, buffer.length - 65557);

  for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      endOfCentralDirectory = offset;
      break;
    }
  }

  if (endOfCentralDirectory < 0) {
    throw new ProductImportError("XLSX dosyasi okunamadi. Gecerli bir Excel dosyasi yukleyin.");
  }

  const totalEntries = buffer.readUInt16LE(endOfCentralDirectory + 10);
  let centralDirectoryOffset = buffer.readUInt32LE(endOfCentralDirectory + 16);
  const files = new Map<string, Buffer>();

  for (let index = 0; index < totalEntries; index += 1) {
    if (buffer.readUInt32LE(centralDirectoryOffset) !== 0x02014b50) {
      throw new ProductImportError("XLSX merkezi dizini okunamadi.");
    }

    const entry: ZipEntry = {
      compression: buffer.readUInt16LE(centralDirectoryOffset + 10),
      compressedSize: buffer.readUInt32LE(centralDirectoryOffset + 20),
      name: "",
      localHeaderOffset: buffer.readUInt32LE(centralDirectoryOffset + 42)
    };
    const nameLength = buffer.readUInt16LE(centralDirectoryOffset + 28);
    const extraLength = buffer.readUInt16LE(centralDirectoryOffset + 30);
    const commentLength = buffer.readUInt16LE(centralDirectoryOffset + 32);
    entry.name = buffer
      .subarray(centralDirectoryOffset + 46, centralDirectoryOffset + 46 + nameLength)
      .toString("utf8");

    const localOffset = entry.localHeaderOffset;

    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) {
      throw new ProductImportError("XLSX yerel dosya basligi okunamadi.");
    }

    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + entry.compressedSize);
    const content = entry.compression === 8 ? inflateRawSync(compressed) : compressed;
    files.set(entry.name.replace(/^\//, ""), content);

    centralDirectoryOffset += 46 + nameLength + extraLength + commentLength;
  }

  return files;
}

function parseSharedStrings(xml: string | undefined) {
  if (!xml) {
    return [];
  }

  const strings: string[] = [];
  const sharedStringMatches = xml.matchAll(/<si\b[\s\S]*?<\/si>/g);

  for (const match of sharedStringMatches) {
    const textParts = [...match[0].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((part) => xmlDecode(part[1]));
    strings.push(textParts.join(""));
  }

  return strings;
}

function getColumnIndex(reference: string | null) {
  if (!reference) {
    return null;
  }

  const letters = reference.replace(/[^A-Z]/gi, "").toUpperCase();

  if (!letters) {
    return null;
  }

  return letters.split("").reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function getFirstWorksheetPath(files: Map<string, Buffer>) {
  const workbookXml = files.get("xl/workbook.xml")?.toString("utf8");
  const relsXml = files.get("xl/_rels/workbook.xml.rels")?.toString("utf8");
  const firstSheetTag = workbookXml?.match(/<sheet\b[^>]*>/)?.[0];
  const relationId = firstSheetTag ? getXmlAttribute(firstSheetTag, "r:id") : null;

  if (relationId && relsXml) {
    const relationship = [...relsXml.matchAll(/<Relationship\b[^>]*>/g)]
      .map((match) => match[0])
      .find((tag) => getXmlAttribute(tag, "Id") === relationId);
    const target = relationship ? getXmlAttribute(relationship, "Target") : null;

    if (target) {
      const normalized = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
      const normalizedPath = normalized.replace(/\/\.\//g, "/").replace(/\/[^/]+\/\.\.\//g, "/");

      if (files.has(normalizedPath)) {
        return normalizedPath;
      }
    }
  }

  return [...files.keys()].find((path) => path.startsWith("xl/worksheets/") && path.endsWith(".xml")) ?? null;
}

function parseWorksheetRows(xml: string, sharedStrings: string[]) {
  const rows: string[][] = [];
  const rowMatches = xml.matchAll(/<row\b[^>]*>[\s\S]*?<\/row>/g);

  for (const rowMatch of rowMatches) {
    const cells: string[] = [];
    const cellMatches = rowMatch[0].matchAll(/<c\b[^>]*>[\s\S]*?<\/c>/g);

    for (const cellMatch of cellMatches) {
      const cellXml = cellMatch[0];
      const cellTag = cellXml.match(/<c\b[^>]*>/)?.[0] ?? "";
      const columnIndex = getColumnIndex(getXmlAttribute(cellTag, "r"));
      const type = getXmlAttribute(cellTag, "t");
      const rawValue = cellXml.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "";
      const inlineText = [...cellXml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
        .map((match) => xmlDecode(match[1]))
        .join("");
      const value =
        type === "s"
          ? sharedStrings[Number(rawValue)] ?? ""
          : type === "inlineStr"
            ? inlineText
            : xmlDecode(rawValue);

      if (columnIndex === null) {
        cells.push(value);
      } else {
        cells[columnIndex] = value;
      }
    }

    rows.push(cells.map((cell) => cell ?? ""));
  }

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
}

function parseXlsxRows(buffer: Buffer) {
  const files = readZipEntries(buffer);
  const worksheetPath = getFirstWorksheetPath(files);

  if (!worksheetPath) {
    throw new ProductImportError("XLSX icinde calisma sayfasi bulunamadi.");
  }

  const sharedStrings = parseSharedStrings(files.get("xl/sharedStrings.xml")?.toString("utf8"));
  return parseWorksheetRows(files.get(worksheetPath)?.toString("utf8") ?? "", sharedStrings);
}

function parseImportRows(input: ProductImportPreviewInput) {
  if (input.buffer.length === 0) {
    throw new ProductImportError("Bos dosya yuklenemez.");
  }

  if (input.buffer.length > maxImportBytes) {
    throw new ProductImportError("Dosya boyutu 2 MB sinirini asiyor.");
  }

  const lowerFileName = input.fileName.toLowerCase();
  const rows = lowerFileName.endsWith(".xlsx")
    ? parseXlsxRows(input.buffer)
    : lowerFileName.endsWith(".csv") || input.mimeType?.includes("csv")
      ? parseCsvRows(input.buffer.toString("utf8").replace(/^\uFEFF/, ""))
      : null;

  if (!rows) {
    throw new ProductImportError("Sadece .csv veya .xlsx dosyalari desteklenir.");
  }

  const records = rowsToRecords(rows);

  if (records.length > maxImportRows) {
    throw new ProductImportError(`Tek seferde en fazla ${maxImportRows} satir ice aktarilabilir.`);
  }

  return records;
}

function validateRequiredColumns(rows: RawImportRow[], selectedFields: ProductImportField[]) {
  const headers = new Set(Object.keys(rows[0]?.values ?? {}));
  const hasIdentifier = ["product_id", "sku", "slug"].some((key) => headers.has(key));
  const missingFields = selectedFields.filter((field) => !headers.has(field));

  if (!hasIdentifier) {
    throw new ProductImportError("Eslestirme icin product_id, sku veya slug kolonlarindan en az biri olmalidir.");
  }

  if (missingFields.length > 0) {
    throw new ProductImportError("Secilen alanlar icin dosyada kolon eksik.", missingFields);
  }
}

function parsePriceToKurus(rawValue: string, fieldLabel: string) {
  const value = rawValue.trim();

  if (!value) {
    return null;
  }

  const withoutCurrency = value
    .replace(/TRY|TL|₺/gi, "")
    .replace(/\s+/g, "")
    .trim();
  const sanitized = withoutCurrency.replace(/[^0-9,.-]/g, "");

  if (!sanitized || sanitized === "-" || sanitized === "," || sanitized === ".") {
    throw new ProductImportError(`${fieldLabel} sayisal olmalidir.`);
  }

  const lastComma = sanitized.lastIndexOf(",");
  const lastDot = sanitized.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : lastDot > lastComma ? "." : null;
  let normalized = sanitized;

  if (decimalSeparator) {
    const decimalPart = sanitized.slice(sanitized.lastIndexOf(decimalSeparator) + 1);
    const shouldTreatAsDecimal = decimalPart.length > 0 && decimalPart.length <= 2;

    if (shouldTreatAsDecimal) {
      const thousandsSeparator = decimalSeparator === "," ? "." : ",";
      normalized = sanitized.replaceAll(thousandsSeparator, "").replace(decimalSeparator, ".");
    } else {
      normalized = sanitized.replace(/[,.]/g, "");
    }
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new ProductImportError(`${fieldLabel} gecersiz.`);
  }

  return Math.round(amount * 100);
}

function parseStock(rawValue: string) {
  const value = rawValue.trim();

  if (!value) {
    return null;
  }

  const normalized = value.replace(/\s+/g, "").replace(/,/g, ".");
  const stock = Number(normalized);

  if (!Number.isInteger(stock) || stock < 0) {
    throw new ProductImportError("Stok sifir veya pozitif tam sayi olmalidir.");
  }

  return stock;
}

async function loadProductTargets() {
  ensureDatabaseConfig();
  const db = getDb();
  const [productRows, variantRows] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        status: products.status,
        defaultPriceKurus: products.defaultPriceKurus,
        discountedPriceKurus: products.discountedPriceKurus
      })
      .from(products),
    db
      .select({
        id: productVariants.id,
        productId: productVariants.productId,
        sku: productVariants.sku,
        stockQuantity: productVariants.stockQuantity,
        priceKurus: productVariants.priceKurus,
        compareAtKurus: productVariants.compareAtKurus,
        isDefault: productVariants.isDefault
      })
      .from(productVariants)
  ]);
  const variantsByProductId = new Map<string, typeof variantRows>();

  for (const variant of variantRows) {
    variantsByProductId.set(variant.productId, [
      ...(variantsByProductId.get(variant.productId) ?? []),
      variant
    ]);
  }

  const byProductId = new Map<string, ProductTarget>();
  const bySku = new Map<string, ProductTarget>();
  const bySlug = new Map<string, ProductTarget>();

  for (const product of productRows) {
    const variants = variantsByProductId.get(product.id) ?? [];
    const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0];
    const baseTarget: ProductTarget = {
      productId: product.id,
      variantId: defaultVariant?.id ?? null,
      matchedBy: "product_id",
      sku: defaultVariant?.sku ?? null,
      slug: product.slug,
      name: product.name,
      priceKurus: defaultVariant?.priceKurus ?? product.defaultPriceKurus,
      salePriceKurus: defaultVariant?.compareAtKurus ?? product.discountedPriceKurus,
      stockQuantity: defaultVariant?.stockQuantity ?? null,
      isDefaultVariant: defaultVariant?.isDefault ?? true
    };

    byProductId.set(product.id, baseTarget);
    bySlug.set(product.slug, { ...baseTarget, matchedBy: "slug" });

    for (const variant of variants) {
      bySku.set(variant.sku, {
        productId: product.id,
        variantId: variant.id,
        matchedBy: "sku",
        sku: variant.sku,
        slug: product.slug,
        name: product.name,
        priceKurus: variant.priceKurus,
        salePriceKurus: variant.compareAtKurus,
        stockQuantity: variant.stockQuantity,
        isDefaultVariant: variant.isDefault
      });
    }
  }

  return { byProductId, bySku, bySlug };
}

function matchRow(row: RawImportRow, targets: Awaited<ReturnType<typeof loadProductTargets>>) {
  const productId = getStringValue(row, "product_id");
  const sku = getStringValue(row, "sku");
  const slug = getStringValue(row, "slug");

  if (productId) {
    return targets.byProductId.get(productId) ?? null;
  }

  if (sku) {
    return targets.bySku.get(sku) ?? null;
  }

  if (slug) {
    return targets.bySlug.get(slug) ?? null;
  }

  return null;
}

function getRowIdentifierError(row: RawImportRow) {
  return getStringValue(row, "product_id") || getStringValue(row, "sku") || getStringValue(row, "slug")
    ? null
    : "Satirda product_id, sku veya slug yok.";
}

function buildPreviewRow(row: RawImportRow, target: ProductTarget | null, selectedFields: ProductImportField[]) {
  const messages: string[] = [];
  const changedFields: ProductImportField[] = [];
  let newPriceKurus: number | null = null;
  let newSalePriceKurus: number | null = null;
  let newStock: number | null = null;
  const identifierError = getRowIdentifierError(row);

  if (identifierError) {
    messages.push(identifierError);
  }

  try {
    if (selectedFields.includes("price")) {
      newPriceKurus = parsePriceToKurus(getStringValue(row, "price"), "Fiyat");

      if (newPriceKurus !== null && newPriceKurus <= 0) {
        messages.push("Fiyat sifirdan buyuk olmalidir.");
      }

      if (target && newPriceKurus !== null && newPriceKurus !== target.priceKurus) {
        changedFields.push("price");
      }
    }

    if (selectedFields.includes("sale_price")) {
      newSalePriceKurus = parsePriceToKurus(getStringValue(row, "sale_price"), "Indirimli fiyat");

      if (target && newSalePriceKurus !== null && newSalePriceKurus !== (target.salePriceKurus ?? 0)) {
        changedFields.push("sale_price");
      }
    }

    if (selectedFields.includes("stock")) {
      newStock = parseStock(getStringValue(row, "stock"));

      if (target && newStock !== null && target.variantId === null) {
        messages.push("Stok guncellemesi icin varyant bulunamadi.");
      }

      if (target && newStock !== null && newStock !== target.stockQuantity) {
        changedFields.push("stock");
      }
    }
  } catch (error) {
    messages.push(error instanceof Error ? error.message : "Satir degeri okunamadi.");
  }

  const status: ProductImportPreviewRow["status"] = messages.length > 0
    ? "error"
    : !target
      ? "unmatched"
      : changedFields.length > 0
        ? "ready"
        : "unchanged";

  return {
    rowNumber: row.rowNumber,
    productId: target?.productId ?? null,
    variantId: target?.variantId ?? null,
    matchedBy: target?.matchedBy ?? null,
    sku: target?.sku ?? (getStringValue(row, "sku") || null),
    slug: target?.slug ?? (getStringValue(row, "slug") || null),
    name: target?.name ?? (getStringValue(row, "name") || "Eslestirilemedi"),
    status,
    messages: status === "unmatched" ? ["Urun bulunamadi."] : messages,
    changedFields,
    oldPriceKurus: target?.priceKurus ?? null,
    newPriceKurus,
    oldSalePriceKurus: target?.salePriceKurus ?? null,
    newSalePriceKurus,
    oldStock: target?.stockQuantity ?? null,
    newStock
  } satisfies ProductImportPreviewRow;
}

function markDuplicateRows(rows: ProductImportPreviewRow[]) {
  const targetCounts = rows.reduce<Map<string, number>>((current, row) => {
    if (row.status !== "ready" && row.status !== "unchanged") {
      return current;
    }

    const key = row.variantId ?? row.productId;

    if (!key) {
      return current;
    }

    current.set(key, (current.get(key) ?? 0) + 1);
    return current;
  }, new Map());

  return rows.map((row) => {
    const key = row.variantId ?? row.productId;

    if (!key || (targetCounts.get(key) ?? 0) <= 1 || (row.status !== "ready" && row.status !== "unchanged")) {
      return row;
    }

    return {
      ...row,
      status: "duplicate" as const,
      messages: [...row.messages, "Ayni urun/varyant dosyada birden fazla kez yer aliyor."]
    };
  });
}

function summarizeRows(rows: ProductImportPreviewRow[], selectedFields: ProductImportField[]): ProductImportPreviewSummary {
  return {
    totalRows: rows.length,
    readyRows: rows.filter((row) => row.status === "ready").length,
    unmatchedRows: rows.filter((row) => row.status === "unmatched").length,
    errorRows: rows.filter((row) => row.status === "error").length,
    duplicateRows: rows.filter((row) => row.status === "duplicate").length,
    unchangedRows: rows.filter((row) => row.status === "unchanged").length,
    selectedFields
  };
}

export async function previewProductImport(input: ProductImportPreviewInput): Promise<ProductImportPreviewResponse> {
  validateSelectedFields(input.selectedFields);
  const records = parseImportRows(input);
  validateRequiredColumns(records, input.selectedFields);
  const targets = await loadProductTargets();
  const rows = markDuplicateRows(
    records.map((row) => buildPreviewRow(row, matchRow(row, targets), input.selectedFields))
  );

  return {
    ok: true,
    fileName: input.fileName,
    summary: summarizeRows(rows, input.selectedFields),
    rows
  };
}

function isValidKurus(value: number | null): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isValidPositiveKurus(value: number | null): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isValidStock(value: number | null): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

async function loadCurrentTargetsForConfirm(rows: ProductImportPreviewRow[]) {
  const db = getDb();
  const productIds = [...new Set(rows.map((row) => row.productId).filter(Boolean) as string[])];
  const variantIds = [...new Set(rows.map((row) => row.variantId).filter(Boolean) as string[])];
  const [productRows, variantRows] = await Promise.all([
    productIds.length > 0
      ? db
          .select({
            id: products.id,
            slug: products.slug,
            defaultPriceKurus: products.defaultPriceKurus,
            discountedPriceKurus: products.discountedPriceKurus
          })
          .from(products)
          .where(inArray(products.id, productIds))
      : Promise.resolve([]),
    variantIds.length > 0
      ? db
          .select({
            id: productVariants.id,
            productId: productVariants.productId,
            sku: productVariants.sku,
            stockQuantity: productVariants.stockQuantity,
            priceKurus: productVariants.priceKurus,
            compareAtKurus: productVariants.compareAtKurus,
            isDefault: productVariants.isDefault
          })
          .from(productVariants)
          .where(inArray(productVariants.id, variantIds))
      : Promise.resolve([])
  ]);

  return {
    productsById: new Map(productRows.map((row) => [row.id, row])),
    variantsById: new Map(variantRows.map((row) => [row.id, row]))
  };
}

export async function confirmProductImport(input: ProductImportConfirmInput): Promise<ProductImportConfirmResponse> {
  ensureDatabaseConfig();
  validateSelectedFields(input.selectedFields);

  const readyRows = input.rows.filter((row) => row.status === "ready");

  if (readyRows.length === 0) {
    throw new ProductImportError("Guncellenecek hazir satir bulunamadi.");
  }

  const db = getDb();
  const currentTargets = await loadCurrentTargetsForConfirm(readyRows);
  const importId = randomUUID();
  const updatedSlugs = new Set<string>();
  let updatedRows = 0;
  let skippedRows = 0;

  await db.transaction(async (tx) => {
    for (const row of readyRows) {
      if (!row.productId) {
        skippedRows += 1;
        continue;
      }

      const product = currentTargets.productsById.get(row.productId);
      const variant = row.variantId ? currentTargets.variantsById.get(row.variantId) : null;

      if (!product || (row.variantId && !variant)) {
        skippedRows += 1;
        continue;
      }

      const variantUpdate: {
        priceKurus?: number;
        compareAtKurus?: number | null;
        stockQuantity?: number;
      } = {};
      const productUpdate: {
        defaultPriceKurus?: number;
        discountedPriceKurus?: number | null;
        updatedAt: Date;
      } = {
        updatedAt: new Date()
      };
      const shouldSyncProductPrice = !variant || variant.isDefault || row.matchedBy === "product_id" || row.matchedBy === "slug";

      if (row.changedFields.includes("price")) {
        if (!isValidPositiveKurus(row.newPriceKurus)) {
          skippedRows += 1;
          continue;
        }

        if (variant && variant.priceKurus !== row.newPriceKurus) {
          variantUpdate.priceKurus = row.newPriceKurus;
        }

        if (shouldSyncProductPrice && product.defaultPriceKurus !== row.newPriceKurus) {
          productUpdate.defaultPriceKurus = row.newPriceKurus;
        }
      }

      if (row.changedFields.includes("sale_price")) {
        if (!isValidKurus(row.newSalePriceKurus)) {
          skippedRows += 1;
          continue;
        }

        const saleValue = row.newSalePriceKurus === 0 ? null : row.newSalePriceKurus;

        if (variant && (variant.compareAtKurus ?? null) !== saleValue) {
          variantUpdate.compareAtKurus = saleValue;
        }

        if (shouldSyncProductPrice && (product.discountedPriceKurus ?? null) !== saleValue) {
          productUpdate.discountedPriceKurus = saleValue;
        }
      }

      if (row.changedFields.includes("stock")) {
        const nextStock = row.newStock;

        if (!variant || !isValidStock(nextStock)) {
          skippedRows += 1;
          continue;
        }

        if (variant.stockQuantity !== nextStock) {
          variantUpdate.stockQuantity = nextStock;
          await tx.insert(inventoryMovements).values({
            idempotencyKey: `product-import:${importId}:${variant.id}:${row.rowNumber}:stock`,
            productId: row.productId,
            variantId: variant.id,
            sku: variant.sku,
            quantityBefore: variant.stockQuantity,
            quantityAfter: nextStock,
            quantityDelta: nextStock - variant.stockQuantity,
            reason: "bulk_import",
            note: `${input.fileName} dosyasi ile toplu stok guncellemesi.`,
            adminUserId: input.actor.sub
          });
        }
      }

      const variantUpdateKeys = Object.keys(variantUpdate);
      const productUpdateKeys = Object.keys(productUpdate).filter((key) => key !== "updatedAt");

      if (variant && variantUpdateKeys.length > 0) {
        await tx.update(productVariants).set(variantUpdate).where(eq(productVariants.id, variant.id));
      }

      if (productUpdateKeys.length > 0) {
        await tx.update(products).set(productUpdate).where(eq(products.id, row.productId));
      }

      if (variantUpdateKeys.length > 0 || productUpdateKeys.length > 0) {
        updatedRows += 1;
        updatedSlugs.add(product.slug);
      } else {
        skippedRows += 1;
      }
    }
  });

  const updatedAt = new Date().toISOString();
  const summary = {
    ...summarizeRows(input.rows, input.selectedFields),
    updatedRows,
    skippedRows,
    updatedAt,
    actorName: input.actor.name
  };

  await recordAuditLog({
    db,
    actor: input.actor,
    entityType: "product_import",
    entityId: importId,
    action: "confirm",
    summary: `${updatedRows} satir toplu urun importu ile guncellendi.`,
    afterPayload: {
      fileName: input.fileName,
      selectedFields: input.selectedFields,
      totalRows: input.rows.length,
      updatedRows,
      skippedRows
    },
    ipAddress: input.requestMeta.ipAddress ?? null,
    userAgent: input.requestMeta.userAgent ?? null
  });

  revalidatePath("/admin/urunler");
  revalidatePath("/magaza");
  revalidatePath("/");
  revalidateTag("public-products");
  revalidateTag("admin-product-lookup");

  for (const slug of updatedSlugs) {
    revalidatePath(`/urun/${slug}`);
  }

  return {
    ok: true,
    summary,
    rows: input.rows
  };
}

export async function listProductImportHistory(limit = 8): Promise<ProductImportHistoryItem[]> {
  if (!hasDatabaseConfig()) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({
      id: auditLogs.id,
      summary: auditLogs.summary,
      afterPayload: auditLogs.afterPayload,
      createdAt: auditLogs.createdAt,
      actorName: adminUsers.fullName
    })
    .from(auditLogs)
    .leftJoin(adminUsers, eq(adminUsers.id, auditLogs.actorAdminId))
    .where(eq(auditLogs.entityType, "product_import"))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return rows.map((row) => {
    const payload = (row.afterPayload ?? {}) as Partial<{
      fileName: string;
      selectedFields: ProductImportField[];
      totalRows: number;
      updatedRows: number;
      skippedRows: number;
    }>;

    return {
      id: row.id,
      actorName: row.actorName,
      fileName: payload.fileName ?? null,
      selectedFields: normalizeImportFields(payload.selectedFields),
      totalRows: payload.totalRows ?? 0,
      updatedRows: payload.updatedRows ?? 0,
      skippedRows: payload.skippedRows ?? 0,
      createdAt: row.createdAt.toISOString()
    };
  });
}

export function getProductImportTemplateCsv() {
  return [
    "product_id,sku,slug,name,price,sale_price,stock,status",
    "ornek-urun-id,ORNEK-SKU,ornek-urun,Ornek urun,12990,11990,12,active",
    ",ORNEK-SKU-2,,Sadece SKU ile eslestirme,21900,,5,active"
  ].join("\n");
}


