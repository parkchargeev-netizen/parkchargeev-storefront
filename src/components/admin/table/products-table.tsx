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

export function ProductsTable({ items, footer }: ProductsTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMutating, setIsMutating] = useState(false);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allCurrentSelected =
    items.length > 0 && items.every((item) => selectedSet.has(item.id));

  const toggleSelected = useCallback((id: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)
    );
  }, []);

  const toggleAll = useCallback((checked: boolean) => {
    setSelectedIds(checked ? items.map((item) => item.id) : []);
  }, [items]);

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

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Urun islemi tamamlanamadi.");
      }

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Urun islemi tamamlanamadi.");
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
        throw new Error(payload?.message ?? "Urun silinemedi.");
      }

      setSelectedIds([]);

      if (payload.message || payload.blocked?.length) {
        window.alert(
          [
            payload.message,
            ...(payload.blocked ?? []).map((item) => `${item.name ?? "Urun"}: ${item.reason ?? "Silinemedi."}`)
          ]
            .filter(Boolean)
            .join("\n")
        );
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Urun silinemedi.");
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
            aria-label="Bu sayfadaki tum urunleri sec"
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
        header: "Urun",
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
        cell: ({ row }) => row.original.sortOrder ?? 0
      },
      {
        id: "price",
        header: "Varsayilan fiyat",
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
              Duzenle
            </AdminPrefetchLink>
            {row.original.status === "active" ? (
              <Link
                href={`/urun/${row.original.slug}`}
                prefetch={false}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                Sitede gor
              </Link>
            ) : null}
            {row.original.status !== "archived" ? (
              <button
                type="button"
                disabled={isMutating}
                onClick={() =>
                  runStatusAction([row.original.id], "archive", "Bu urun arsivlensin mi?")
                }
                className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Arsivle
              </button>
            ) : (
              <button
                type="button"
                disabled={isMutating}
                onClick={() =>
                  runStatusAction([row.original.id], "activate", "Bu urun tekrar aktif olsun mu?")
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
    [allCurrentSelected, isMutating, runDeleteAction, runStatusAction, selectedSet, toggleAll, toggleSelected]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/90 px-4 py-3">
        <p className="text-sm font-medium text-slate-600">
          {selectedIds.length > 0
            ? `${selectedIds.length} urun secildi`
            : "Toplu islem icin urun secin"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={selectedIds.length === 0 || isMutating}
            onClick={() =>
              runStatusAction(selectedIds, "activate", "Secili urunler aktif edilsin mi?")
            }
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aktif et
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || isMutating}
            onClick={() =>
              runStatusAction(selectedIds, "draft", "Secili urunler taslaga alinsin mi?")
            }
            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Taslak yap
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || isMutating}
            onClick={() =>
              runStatusAction(selectedIds, "archive", "Secili urunler arsivlensin mi?")
            }
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Arsivle
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
        caption="Urunler admin listesi"
        emptyTitle="Urun bulunamadi"
        emptyDescription="Filtreleri degistirerek veya yeni urun olusturarak devam edebilirsiniz."
        footer={footer}
      />
    </div>
  );
}
