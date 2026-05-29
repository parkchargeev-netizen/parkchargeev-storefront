"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { formatPriceTRY } from "@/lib/format";
import { AdminDataTable } from "@/components/admin/table/admin-data-table";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  status: "draft" | "active" | "archived";
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

const columns: Array<ColumnDef<ProductRow>> = [
  {
    accessorKey: "name",
    header: "Ürün",
    cell: ({ row }) => (
      <div className="min-w-[260px]">
        <Link
          href={`/admin/urunler/${row.original.id}`}
          prefetch={false}
          className="text-sm font-semibold text-slate-950 transition hover:text-blue-700"
        >
          {row.original.name}
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
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
    id: "price",
    header: "Varsayılan Fiyat",
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
        <Link
          href={`/admin/urunler/${row.original.id}`}
          prefetch={false}
          className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
        >
          Düzenle
        </Link>
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
      </div>
    )
  }
];

export function ProductsTable({ items, footer }: ProductsTableProps) {
  return (
    <AdminDataTable
      columns={columns}
      data={items}
      caption="Ürünler admin listesi"
      emptyTitle="Ürün bulunamadı"
      emptyDescription="Filtreleri değiştirerek veya yeni ürün oluşturarak devam edebilirsiniz."
      footer={footer}
    />
  );
}
