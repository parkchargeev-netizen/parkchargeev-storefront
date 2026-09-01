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
        throw new Error(payload?.message ?? payload?.error ?? "SÄ±ralama kaydedilemedi.");
      }

      setSortOrderDrafts({});
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "SÄ±ralama kaydedilemedi.");
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
        throw new Error(payload?.message ?? payload?.error ?? "ÃœrÃ¼n iÅŸlemi tamamlanamadÄ±.");
      }

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "ÃœrÃ¼n iÅŸlemi tamamlanamadÄ±.");
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
        throw new Error(payload?.message ?? "ÃœrÃ¼n silinemedi.");
      }

      setSelectedIds([]);

      if (payload.message || payload.blocked?.length) {
        window.alert(
          [
            payload.message,
            ...(payload.blocked ?? []).map((item) => `${item.name ?? "ÃœrÃ¼n"}: ${item.reason ?? "Silinemedi."}`)
          ]
            .filter(Boolean)
            .join("\n")
        );
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "ÃœrÃ¼n silinemedi.");
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
            aria-label="Bu sayfadaki tÃ¼m Ã¼rÃ¼nleri seÃ§"
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
        header: "ÃœrÃ¼n",
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
        header: "SÄ±ra",
        cell: ({ row }) => (
          <input
            type="number"
            min={0}
            max={9999}
            value={sortOrderDrafts[row.original.id] ?? String(row.original.sortOrder ?? 0)}
            onChange={(event) => updateSortOrderDraft(row.original.id, event.currentTarget.value)}
            onBlur={() => {
              void saveSortOrder();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
            aria-label={`${row.original.name} sÄ±ralama deÄŸeri`}
            className="h-9 w-20 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-inner outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        )
      },
      {
        id: "price",
        header: "VarsayÄ±lan fiyat",
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
              DÃ¼zenle
            </AdminPrefetchLink>
            {row.original.status === "active" ? (
              <Link
                href={`/urun/${row.original.slug}`}
                prefetch={false}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                Sitede gÃ¶r
              </Link>
            ) : null}
            {row.original.status !== "archived" ? (
              <button
                type="button"
                disabled={isMutating}
                onClick={() =>
                  runStatusAction([row.original.id], "archive", "Bu Ã¼rÃ¼n arÅŸivlensin mi?")
                }
                className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ArÅŸivle
              </button>
            ) : (
              <button
                type="button"
                disabled={isMutating}
                onClick={() =>
                  runStatusAction([row.original.id], "activate", "Bu Ã¼rÃ¼n tekrar aktif olsun mu?")
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
                  "Bu Ã¼rÃ¼n kalÄ±cÄ± olarak silinsin mi? SipariÅŸ geÃ§miÅŸindeki metin ve tutar bilgileri korunur; canlÄ± Ã¼rÃ¼n baÄŸlantÄ±sÄ± kaldÄ±rÄ±lÄ±r."
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
      saveSortOrder,
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
            ? `${selectedIds.length} Ã¼rÃ¼n seÃ§ildi`
            : hasSortOrderChanges
              ? `${sortOrderUpdates.length} sÄ±ralama deÄŸiÅŸikliÄŸi kaydedilmeyi bekliyor`
              : "Toplu iÅŸlem iÃ§in Ã¼rÃ¼n seÃ§in"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!hasSortOrderChanges || isMutating}
            onClick={saveSortOrder}
            className="rounded-full bg-[#063326] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(6,51,38,0.18)] transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            SÄ±ralama kaydet
          </button>
          <button
            type="button"
            disabled={!hasSortOrderChanges || isMutating}
            onClick={resetSortOrderDrafts}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            VazgeÃ§
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || isMutating}
            onClick={() =>
              runStatusAction(selectedIds, "activate", "SeÃ§ili Ã¼rÃ¼nler aktif edilsin mi?")
            }
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aktif et
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || isMutating}
            onClick={() =>
              runStatusAction(selectedIds, "draft", "SeÃ§ili Ã¼rÃ¼nler taslaÄŸa alÄ±nsÄ±n mÄ±?")
            }
            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Taslak yap
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || isMutating}
            onClick={() =>
              runStatusAction(selectedIds, "archive", "SeÃ§ili Ã¼rÃ¼nler arÅŸivlensin mi?")
            }
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ArÅŸivle
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || isMutating}
            onClick={() =>
              runDeleteAction(
                selectedIds,
                "SeÃ§ili Ã¼rÃ¼nler kalÄ±cÄ± olarak silinsin mi? SipariÅŸ geÃ§miÅŸindeki metin ve tutar bilgileri korunur; canlÄ± Ã¼rÃ¼n baÄŸlantÄ±larÄ± kaldÄ±rÄ±lÄ±r."
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
        caption="ÃœrÃ¼nler admin listesi"
        emptyTitle="ÃœrÃ¼n bulunamadÄ±"
        emptyDescription="Filtreleri deÄŸiÅŸtirerek veya yeni Ã¼rÃ¼n oluÅŸturarak devam edebilirsiniz."
        footer={footer}
      />
    </div>
  );
}

