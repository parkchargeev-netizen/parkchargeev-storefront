"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { formatPriceTRY } from "@/lib/format";
import { AdminDataTable } from "@/components/admin/table/admin-data-table";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";

type OrderRow = {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  customerEmail?: string | null;
  totalKurus: number;
  status: string;
  paymentStatus: string;
  updatedAt: string | Date;
  items: Array<{
    productName: string;
  }>;
};

type OrdersTableProps = {
  items: OrderRow[];
  footer?: React.ReactNode;
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function getOrderTone(status: string) {
  if (["confirmed", "shipped", "delivered", "fulfilled", "paid"].includes(status)) {
    return "success";
  }

  if (["pending_payment", "payment_processing", "pending_confirmation"].includes(status)) {
    return "warning";
  }

  if (["cancelled", "failed", "refunded"].includes(status)) {
    return "danger";
  }

  return "neutral";
}

function getPaymentTone(status: string) {
  if (["paid", "completed", "confirmed"].includes(status)) {
    return "success";
  }

  if (["pending", "processing"].includes(status)) {
    return "warning";
  }

  if (["failed", "cancelled", "refunded"].includes(status)) {
    return "danger";
  }

  return "neutral";
}

const columns: Array<ColumnDef<OrderRow>> = [
  {
    accessorKey: "orderNumber",
    header: "Siparis",
    cell: ({ row }) => (
      <div className="min-w-[240px]">
        <Link
          href={`/admin/siparisler/${row.original.id}`}
          className="text-sm font-semibold text-slate-950 transition hover:text-blue-700"
        >
          {row.original.orderNumber}
        </Link>
        <p className="mt-1 text-sm text-slate-600">
          {row.original.customerName || "Misafir musteri"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {row.original.customerEmail || "E-posta yok"}
        </p>
      </div>
    )
  },
  {
    id: "items",
    header: "Urunler",
    accessorFn: (row) => row.items.length,
    cell: ({ row }) => (
      <div className="max-w-[280px] text-sm text-slate-600">
        {row.original.items.map((item) => item.productName).join(", ") || "Urun bulunamadi"}
      </div>
    )
  },
  {
    accessorKey: "totalKurus",
    header: "Toplam",
    cell: ({ row }) => formatPriceTRY(row.original.totalKurus)
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => (
      <AdminStatusBadge label={row.original.status} tone={getOrderTone(row.original.status)} />
    )
  },
  {
    accessorKey: "paymentStatus",
    header: "Odeme",
    cell: ({ row }) => (
      <AdminStatusBadge
        label={row.original.paymentStatus}
        tone={getPaymentTone(row.original.paymentStatus)}
      />
    )
  },
  {
    accessorKey: "updatedAt",
    header: "Son Hareket",
    cell: ({ row }) => formatDate(row.original.updatedAt)
  },
  {
    id: "actions",
    header: "Aksiyon",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`/admin/siparisler/${row.original.id}`}
        className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        Detay
      </Link>
    )
  }
];

export function OrdersTable({ items, footer }: OrdersTableProps) {
  return (
    <AdminDataTable
      columns={columns}
      data={items}
      emptyTitle="Siparis bulunamadi"
      emptyDescription="Arama veya durum filtrelerini degistirerek sonucu genisletebilirsiniz."
      footer={footer}
    />
  );
}
