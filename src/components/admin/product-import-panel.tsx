"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  ProductImportConfirmResponse,
  ProductImportField,
  ProductImportHistoryItem,
  ProductImportPreviewResponse,
  ProductImportPreviewRow
} from "@/lib/admin-product-import-contract";

type ProductImportPanelProps = {
  initialHistory?: ProductImportHistoryItem[];
};

type ApiErrorPayload = {
  ok?: false;
  message?: string;
  details?: string[];
};

const priceUpdateFields: ProductImportField[] = ["price"];

const statusLabels: Record<ProductImportPreviewRow["status"], string> = {
  ready: "Hazır",
  unchanged: "Değişmedi",
  unmatched: "Eşleşmedi",
  duplicate: "Tekrar",
  error: "Hata"
};

const statusClasses: Record<ProductImportPreviewRow["status"], string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  unchanged: "border-slate-200 bg-slate-50 text-slate-700",
  unmatched: "border-amber-200 bg-amber-50 text-amber-800",
  duplicate: "border-orange-200 bg-orange-50 text-orange-800",
  error: "border-rose-200 bg-rose-50 text-rose-700"
};

const matchedByLabels: Record<NonNullable<ProductImportPreviewRow["matchedBy"]>, string> = {
  product_id: "Product ID",
  sku: "Ürün kodu / SKU",
  slug: "Slug",
  name: "Tam ürün adı",
  hims_code: "Hims ürün kodu"
};

const sourceFormatLabels: Record<ProductImportPreviewResponse["sourceFormat"], string> = {
  standard: "Standart CSV/XLSX",
  hims_price_list: "Hims fiyat listesi"
};

function formatKurus(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(value / 100);
}

function escapeCsvValue(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: ProductImportPreviewRow[]) {
  const columns = [
    "rowNumber",
    "status",
    "matchedBy",
    "productId",
    "variantId",
    "sku",
    "slug",
    "name",
    "messages",
    "oldPrice",
    "newPrice"
  ];
  const csv = [
    columns.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      [
        row.rowNumber,
        row.status,
        row.matchedBy,
        row.productId,
        row.variantId,
        row.sku,
        row.slug,
        row.name,
        row.messages.join(" | "),
        row.oldPriceKurus,
        row.newPriceKurus
      ]
        .map(escapeCsvValue)
        .join(",")
    )
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getRowChangeSummary(row: ProductImportPreviewRow) {
  if (!row.changedFields.includes("price")) {
    return "Değişiklik yok";
  }

  return `Fiyat: ${formatKurus(row.oldPriceKurus)} -> ${formatKurus(row.newPriceKurus)}`;
}

export function ProductImportPanel({ initialHistory = [] }: ProductImportPanelProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ProductImportPreviewResponse | null>(null);
  const [result, setResult] = useState<ProductImportConfirmResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ProductImportHistoryItem[]>(initialHistory);
  const [isHistoryLoading, setIsHistoryLoading] = useState(initialHistory.length === 0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const problematicRows = useMemo(
    () => preview?.rows.filter((row) => ["error", "unmatched", "duplicate"].includes(row.status)) ?? [],
    [preview]
  );
  const previewRows = preview?.rows.slice(0, 80) ?? [];
  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);

    try {
      const response = await fetch("/api/admin/products/import?history=1", {
        cache: "no-store"
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        history?: ProductImportHistoryItem[];
      } | null;

      if (response.ok && payload?.ok && Array.isArray(payload.history)) {
        setHistory(payload.history);
      }
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialHistory.length === 0) {
      void loadHistory();
    }
  }, [initialHistory.length, loadHistory]);

  const resetPreview = () => {
    setPreview(null);
    setResult(null);
    setMessage(null);
  };

  const previewImport = async () => {
    if (!file || isPreviewing) {
      return;
    }

    setIsPreviewing(true);
    setMessage(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      for (const field of priceUpdateFields) {
        formData.append("fields", field);
      }

      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json().catch(() => null)) as ProductImportPreviewResponse | ApiErrorPayload | null;

      if (!response.ok || !payload || payload.ok !== true) {
        throw new Error((payload as ApiErrorPayload | null)?.message ?? "Fiyat önizlemesi oluşturulamadı.");
      }

      setPreview(payload);
    } catch (error) {
      setPreview(null);
      setMessage(error instanceof Error ? error.message : "Fiyat önizlemesi oluşturulamadı.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const confirmImport = async () => {
    if (!preview || preview.summary.readyRows === 0 || isConfirming) {
      return;
    }

    const confirmation = window.confirm(
      `${preview.summary.readyRows} satırda ana fiyat güncellenecek. Devam edilsin mi?`
    );

    if (!confirmation) {
      return;
    }

    setIsConfirming(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/products/import", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: preview.fileName,
          selectedFields: priceUpdateFields,
          rows: preview.rows
        })
      });
      const payload = (await response.json().catch(() => null)) as ProductImportConfirmResponse | ApiErrorPayload | null;

      if (!response.ok || !payload || payload.ok !== true) {
        throw new Error((payload as ApiErrorPayload | null)?.message ?? "Fiyat güncellemesi uygulanamadı.");
      }

      setResult(payload);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Fiyat güncellemesi uygulanamadı.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <section id="product-import" className="scroll-mt-28 rounded-lg border border-emerald-100 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Excel fiyat güncelle</p>
          <h2 className="text-xl font-bold tracking-normal text-slate-950 lg:text-2xl">
            Toplu fiyat güncelleme
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            CSV veya XLSX dosyanızı yükleyin; sistem product_id, ürün kodu/SKU, slug veya tam ürün adı ile eşleştirir. Hims fiyat listesinde e-ticaret sitesi fiyatı ana fiyat olarak okunur. Onay vermeden veritabanına yazılmaz.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/api/admin/products/import";
          }}
          className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
        >
          Örnek fiyat şablonu indir
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.5fr)]">
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-normal text-slate-500">Dosya</span>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => {
                  setFile(event.currentTarget.files?.[0] ?? null);
                  resetPreview();
                }}
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
              />
            </label>
            <button
              type="button"
              disabled={!file || isPreviewing}
              onClick={previewImport}
              className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPreviewing ? "Analiz ediliyor..." : "Önizle"}
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-emerald-200 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-normal text-emerald-700">Güncellenecek alan</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Sadece ana fiyat güncellenir. İndirimli fiyat ve stok bu import akışıyla değiştirilmez.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Eşleşme sırası: <strong>product_id</strong>, yoksa <strong>ürün kodu/SKU</strong>, yoksa <strong>slug</strong>, yoksa <strong>tam ürün adı</strong>. Aynı ad birden fazla ürüne denk gelirse satır yazılmaz.
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
              Hims fiyat listesi otomatik algılanır; <strong>e-ticaret sitesi fiyatı</strong> ana fiyat olarak okunur. XY renk/uzunluk kodları güvenli varyantlara önizlemede ayrılır.
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-bold text-slate-950">Son fiyat güncellemeleri</h3>
          <div className="mt-3 space-y-3">
            {isHistoryLoading ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                Geçmiş yükleniyor...
              </p>
            ) : history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="truncate text-xs font-bold text-slate-900">{item.fileName ?? "Dosya"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.updatedRows} güncel, {item.skippedRows} atlandı - {new Date(item.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                Henüz fiyat güncelleme geçmişi yok.
              </p>
            )}
          </div>
        </div>
      </div>

      {message ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {message}
        </div>
      ) : null}

      {preview ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
            Algılanan dosya tipi: {sourceFormatLabels[preview.sourceFormat]}. Önizleme onaylanmadan veritabanına hiçbir fiyat yazılmaz.
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {[
              ["Toplam", preview.summary.totalRows],
              ["Hazır", preview.summary.readyRows],
              ["Değişmedi", preview.summary.unchangedRows],
              ["Eşleşmedi", preview.summary.unmatchedRows],
              ["Tekrar", preview.summary.duplicateRows],
              ["Hata", preview.summary.errorRows]
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm font-semibold text-slate-600">
              {preview.fileName} dosyası analiz edildi. İlk {previewRows.length} satır gösteriliyor.
            </p>
            <div className="flex flex-wrap gap-2">
              {problematicRows.length > 0 ? (
                <button
                  type="button"
                  onClick={() => downloadCsv("product-price-import-errors.csv", problematicRows)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700"
                >
                  Hata raporu indir
                </button>
              ) : null}
              <button
                type="button"
                disabled={preview.summary.readyRows === 0 || isConfirming}
                onClick={confirmImport}
                className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConfirming ? "Uygulanıyor..." : "Fiyatları güncelle"}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="max-h-[460px] overflow-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Satır</th>
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3">Ürün</th>
                    <th className="px-4 py-3">Eşleşme</th>
                    <th className="px-4 py-3">Fiyat değişikliği</th>
                    <th className="px-4 py-3">Mesaj</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.map((row) => (
                    <tr key={`${row.rowNumber}-${row.productId ?? row.sku ?? row.slug}`}>
                      <td className="px-4 py-3 font-bold text-slate-700">{row.rowNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[row.status]}`}>
                          {statusLabels[row.status]}
                        </span>
                      </td>
                      <td className="min-w-[260px] px-4 py-3">
                        <p className="font-bold text-slate-950">{row.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{row.sku ?? row.slug ?? row.productId ?? "-"}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.matchedBy ? matchedByLabels[row.matchedBy] : "-"}</td>
                      <td className="min-w-[240px] px-4 py-3 text-slate-700">{getRowChangeSummary(row)}</td>
                      <td className="min-w-[260px] px-4 py-3 text-slate-600">{row.messages.join(" | ") || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
          Fiyat güncellemesi tamamlandı: {result.summary.updatedRows} satır güncellendi, {result.summary.skippedRows} satır atlandı.
        </div>
      ) : null}
    </section>
  );
}