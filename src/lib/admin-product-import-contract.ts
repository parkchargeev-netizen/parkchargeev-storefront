export const productImportFieldValues = ["price", "sale_price", "stock"] as const;

export type ProductImportField = (typeof productImportFieldValues)[number];

export const productImportFieldLabels: Record<ProductImportField, string> = {
  price: "Fiyat",
  sale_price: "Indirimli fiyat",
  stock: "Stok"
};

export type ProductImportRowStatus =
  | "ready"
  | "unchanged"
  | "unmatched"
  | "duplicate"
  | "error";

export type ProductImportPreviewRow = {
  rowNumber: number;
  productId: string | null;
  variantId: string | null;
  matchedBy: "product_id" | "sku" | "slug" | null;
  sku: string | null;
  slug: string | null;
  name: string;
  status: ProductImportRowStatus;
  messages: string[];
  changedFields: ProductImportField[];
  oldPriceKurus: number | null;
  newPriceKurus: number | null;
  oldSalePriceKurus: number | null;
  newSalePriceKurus: number | null;
  oldStock: number | null;
  newStock: number | null;
};

export type ProductImportPreviewSummary = {
  totalRows: number;
  readyRows: number;
  unmatchedRows: number;
  errorRows: number;
  duplicateRows: number;
  unchangedRows: number;
  selectedFields: ProductImportField[];
};

export type ProductImportPreviewResponse = {
  ok: true;
  fileName: string;
  summary: ProductImportPreviewSummary;
  rows: ProductImportPreviewRow[];
};

export type ProductImportConfirmResponse = {
  ok: true;
  summary: ProductImportPreviewSummary & {
    updatedRows: number;
    skippedRows: number;
    updatedAt: string;
    actorName: string;
  };
  rows: ProductImportPreviewRow[];
};

export type ProductImportHistoryItem = {
  id: string;
  actorName: string | null;
  fileName: string | null;
  selectedFields: ProductImportField[];
  totalRows: number;
  updatedRows: number;
  skippedRows: number;
  createdAt: string;
};

export type ProductImportErrorResponse = {
  ok: false;
  message: string;
  details?: string[];
};
