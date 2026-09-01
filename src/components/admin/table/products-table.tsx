"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";

import { formatPriceTRY } from "@/lib/format";
import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";
import { AdminDataTable } from "@/components/admin/table/admin-data-table";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  status: "draft" | "active" | "archived";
  sortOrder?: number;
  categories: string[];
  defaultVariant?: {
    priceKurus: number;
    stockQuantity: number;
  } | null;
};

type ProductsTableProps = {
  items: ProductRow[];
  footer?: ReactNode;
};

type BulkAction = "archive" | "activate" | "draft";
type SortOrderUpdate = { id: string; sortOrder: number };

function getProductTone(status: ProductRow["status"]) {
  switch (status) {
    case "active":
      return "success";
    case "draft":
      return "warning";
    default:
      return "neutral";
  }
}

function formatProductStatus(status: ProductRow["status"]) {
  const labels: Record<ProductRow["status"], string> = {
    active: "Aktif",
    draft: "Taslak",
    archived: "Pasif"
  };

  return labels[status];
}

function parseSortOrder(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(0, Math.min(9999, parsed));
}

export function ProductsTable({ items, footer }: ProductsTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMutating, setIsMutating] = useState(false);
  const [sortOrderDrafts, setSortOrderDrafts] = useState<Record<string, string>>({});
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allCurrentSelected =
    items.length > 0 && items.every((item) => selectedSet.has(item.id));
  const sortOrderUpdates = useMemo<SortOrderUpdate[]>(
    () =>
      items.flatMap((item) => {
        const draft = sortOrderDrafts[item.id];

        if (draft === undefined) {
          return [];
        }

        const nextValue = parseSortOrder(draft);
        const currentValue = item.sortOrder ?? 0;

        return nextValue !== null && nextValue !== currentValue
          ? [{ id: item.id, sortOrder: nextValue }]
          : [];
      }),
    [items, sortOrderDrafts]
  );
  const hasSortOrderChanges = sortOrderUpdates.length > 0;

  const toggleSelected = useCallback((id: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)
    );
  }, []);

  const toggleAll = useCallback((checked: boolean) => {
    setSelectedIds(checked ? items.map((item) => item.id) : []);
  }, [items]);

  const updateSortOrderDraft = useCallback((id: string, value: string) => {
    setSortOrderDrafts((current) => ({
      ...current,
      [id]: value
    }));
  }, []);

  const resetSortOrderDrafts = useCallback(() => {
    setSortOrderDrafts({});
  }, []);

  const saveSortOrder = useCallback(async () => {
    if (!hasSortOrderChanges || isMutating) {
      return;
    }

    setIsMutating(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "reorder",
          items: sortOrderUpdates
        })
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? payload?.error ?? "Sıralama kaydedilemedi.");
      }

      setSortOrderDrafts({});
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Sıralama kaydedilemedi.");
    } finally {
      setIsMutating(false);
    }
  }, [hasSortOrderChanges, isMutating, router, sortOrderUpdates]);

  const runStatusAction = useCallback(async (ids: string[], action: BulkAction, confirmation: string) => {
    if (ids.length === 0 || isMutating) {
      return;
    }

    if (!window.confirm(confirmation)) {
      return;
    }

    setIsMutating(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ids, action })
      });
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? payload?.error ?? "Ürün işlemi tamamlanamadı.");
      }

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Ürün işlemi tamamlanamadı.");
    } finally {
      setIsMutating(false);
    }
  }, [isMutating, router]);

  const runDeleteAction = useCallback(async (ids: string[], confirmation: string) => {
    if (ids.length === 0 || isMutating) {
      return;
    }

    if (!window.confirm(confirmation)) {
      return;
    }

    setIsMutating(true);

    try {
      const params = new URLSearchParams({ mode: "delete" });

      for (const id of ids) {
        params.append("id", id);
      }

      const response = await fetch(`/api/admin/products?${params.toString()}`, {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        blocked?: Array<{ name?: string; reason?: string }>;
      } | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? "Ürün silinemedi.");
      }

      setSelectedIds([]);

      if (payload.message || payload.blocked?.length) {
        window.alert(
          [
            payload.message,
            ...(payload.blocked ?? []).map((item) => `${item.name ?? "Ürün"}: ${item.reason ?? "Silinemedi."}`)
          ]
            .filter(Boolean)
            .join("\n")
        );
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Ürün silinemedi.");
    } finally {
      setIsMutating(false);
    }
  }, [isMutating, router]);

  const columns = useMemo<Array<ColumnDef<ProductRow>>>(
    () => [
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            aria-label="Bu sayfadaki tüm ürünleri seç"
            checked={allCurrentSelected}
            onChange={(event) => toggleAll(event.currentTarget.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-700"
          />
        ),
        enableSorting: false,
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`${row.original.name} urununu sec`}
            checked={selectedSet.has(row.original.id)}
            onChange={(event) => toggleSelected(row.original.id, event.currentTarget.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-700"
          />
        )
      },
      {
        accessorKey: "name",
        header: "Ürün",
        cell: ({ row }) => (
          <div className="min-w-[260px]">
            <AdminPrefetchLink
              href={`/admin/urunler/${row.original.id}`}
              className="text-sm font-semibold text-slate-950 transition hover:text-[#063326]"
            >
              {row.original.name}
            </AdminPrefetchLink>
            <p className="mt-1 text-xs uppercase tracking-normal text-slate-500">
              {row.original.slug}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {row.original.shortDescription}
            </p>
          </div>
        )
      },
      {
        accessorKey: "status",
        header: "Durum",
        cell: ({ row }) => (
          <AdminStatusBadge
            label={formatProductStatus(row.original.status)}
            tone={getProductTone(row.original.status)}
          />
        )
      },
      {
        accessorKey: "sortOrder",
        header: "Sıra",
        cell: ({ row }) => (
          <input
            type="number"
            min={0}
            max={9999}
            value={sortOrderDrafts[row.original.id] ?? String(row.original.sortOrder ?? 0)}
            onChange={(event) => updateSortOrderDraft(row.original.id, event.currentTarget.value)}
            aria-label={`${row.original.name} sıralama değeri`}
            className="h-9 w-20 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-inner outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        )
      },
      {
        id: "price",
        header: "Varsayılan fiyat",
        accessorFn: (row) => row.defaultVariant?.priceKurus ?? 0,
        cell: ({ row }) =>
          row.original.defaultVariant
            ? formatPriceTRY(row.original.defaultVariant.priceKurus)
            : "-"
      },
      {
        id: "stock",
        header: "Stok",
        accessorFn: (row) => row.defaultVariant?.stockQuantity ?? 0,
        cell: ({ row }) => row.original.defaultVariant?.stockQuantity ?? 0
      },
      {
        accessorKey: "categories",
        header: "Kategoriler",
        cell: ({ row }) => (
          <div className="max-w-[220px] text-sm text-slate-600">
            {row.original.categories.join(", ") || "-"}
          </div>
        )
      },
      {
        id: "actions",
        header: "Aksiyon",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <AdminPrefetchLink
              href={`/admin/urunler/${row.original.id}`}
              className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
            >
              Düzenle
            </AdminPrefetchLink>
            {row.original.status === "active" ? (
              <Link
                href={`/urun/${row.original.slug}`}
                prefetch={false}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                Sitede gör
              </Link>
            ) : null}
            {row.original.status !== "archived" ? (
              <button
                type="button"
                disabled={isMutating}
                onClick={() =>
                  runStatusAction([row.original.id], "archive", "Bu ürün arşivlensin mi?")
                }
                className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Arşivle
              </button>
            ) : (
              <button
                type="button"
                disabled={isMutating}
                onClick={() =>
                  runStatusAction([row.original.id], "activate", "Bu ürün tekrar aktif olsun mu?")
                }
                className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Aktif et
              </button>
            )}
            <button
              type="button"
              disabled={isMutating}
              onClick={() =>
                runDeleteAction(
                  [row.original.id],
                  "Bu ürün kalıcı olarak silinsin mi? Sipariş geçmişindeki metin ve tutar bilgileri korunur; canlı ürün bağlantısı kaldırılır."
                )
              }
              className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sil
            </button>
          </div>
        )
      }
    ],
    [
      allCurrentSelected,
      isMutating,
      runDeleteAction,
      runStatusAction,
      selectedSet,
      sortOrderDrafts,
      toggleAll,
      toggleSelected,
      updateSortOrderDraft
    ]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/90 px-4 py-3">
        <p className="text-sm font-medium text-slate-600">
          {selectedIds.length > 0
            ? `${selectedIds.length} ürün seçildi`
            : hasSortOrderChanges
              ? `${sortOrderUpdates.length} sıralama değişikliği kaydedilmeyi bekliyor`
              : "Toplu işlem için ürün seçin"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!hasSortOrderChanges || isMutating}
            onClick={saveSortOrder}
            className="rounded-full bg-[#063326] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(6,51,38,0.18)] transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sıralama kaydet
          </button>
          <button
            type="button"
            disabled={!hasSortOrderChanges || isMutating}
            onClick={resetSortOrderDrafts}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || isMutating}
            onClick={() =>
              runStatusAction(selectedIds, "activate", "Seçili ürünler aktif edilsin mi?")
            }
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aktif et
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || isMutating}
            onClick={() =>
              runStatusAction(selectedIds, "draft", "Seçili ürünler taslağa alınsın mı?")
            }
            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Taslak yap
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || isMutating}
            onClick={() =>
              runStatusAction(selectedIds, "archive", "Seçili ürünler arşivlensin mi?")
            }
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Arşivle
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || isMutating}
            onClick={() =>
              runDeleteAction(
                selectedIds,
                "Seçili ürünler kalıcı olarak silinsin mi? Sipariş geçmişindeki metin ve tutar bilgileri korunur; canlı ürün bağlantıları kaldırılır."
              )
            }
            className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sil
          </button>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        data={items}
        caption="Ürünler admin listesi"
        emptyTitle="Ürün bulunamadı"
        emptyDescription="Filtreleri değiştirerek veya yeni ürün oluşturarak devam edebilirsiniz."
        footer={footer}
      />
    </div>
  );
}