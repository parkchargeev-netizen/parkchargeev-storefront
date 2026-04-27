"use client";

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
  footer?: React.ReactNode;
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

const columns: Array<ColumnDef<ProductRow>> = [
  {
    accessorKey: "name",
    header: "Urun",
    cell: ({ row }) => (
      <div className="min-w-[260px]">
        <Link
          href={`/admin/urunler/${row.original.id}`}
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
        label={row.original.status}
        tone={getProductTone(row.original.status)}
      />
    )
  },
  {
    id: "price",
    header: "Varsayilan Fiyat",
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
      <Link
        href={`/admin/urunler/${row.original.id}`}
        className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        Incele
      </Link>
    )
  }
];

export function ProductsTable({ items, footer }: ProductsTableProps) {
  return (
    <AdminDataTable
      columns={columns}
      data={items}
      emptyTitle="Urun bulunamadi"
      emptyDescription="Filtreleri degistirerek veya yeni urun olusturarak devam edebilirsiniz."
      footer={footer}
    />
  );
}
