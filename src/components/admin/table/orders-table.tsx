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

function formatOrderStatus(status: string) {
  const labels: Record<string, string> = {
    pending_payment: "Ödeme Bekliyor",
    pending_confirmation: "Ödeme Alındı",
    confirmed: "Onaylandı",
    shipped: "Kargoya Verildi",
    delivered: "Teslim Edildi",
    cancelled: "İptal",
    refunded: "İade",
    failed: "Başarısız",
    paid: "Ödendi",
    fulfilled: "Tamamlandı",
    payment_processing: "Ödeme İşleniyor",
    draft: "Taslak"
  };

  return labels[status] ?? status;
}

function formatPaymentStatus(status: string) {
  const labels: Record<string, string> = {
    paid: "Ödendi",
    completed: "Tamamlandı",
    confirmed: "Onaylandı",
    pending: "Beklemede",
    processing: "İşleniyor",
    failed: "Başarısız",
    cancelled: "İptal",
    refunded: "İade"
  };

  return labels[status] ?? status;
}

const columns: Array<ColumnDef<OrderRow>> = [
  {
    accessorKey: "orderNumber",
    header: "Sipariş",
    cell: ({ row }) => (
      <div className="min-w-[240px]">
        <Link
          href={`/admin/siparisler/${row.original.id}`}
          className="text-sm font-semibold text-slate-950 transition hover:text-[#063326]"
        >
          {row.original.orderNumber}
        </Link>
        <p className="mt-1 text-sm text-slate-600">
          {row.original.customerName || "Misafir müşteri"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {row.original.customerEmail || "E-posta yok"}
        </p>
      </div>
    )
  },
  {
    id: "items",
    header: "Ürünler",
    accessorFn: (row) => row.items.length,
    cell: ({ row }) => (
      <div className="max-w-[280px] text-sm text-slate-600">
        {row.original.items.map((item) => item.productName).join(", ") || "Ürün bulunamadı"}
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
      <AdminStatusBadge label={formatOrderStatus(row.original.status)} tone={getOrderTone(row.original.status)} />
    )
  },
  {
    accessorKey: "paymentStatus",
    header: "Ödeme",
    cell: ({ row }) => (
      <AdminStatusBadge
        label={formatPaymentStatus(row.original.paymentStatus)}
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
        className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#063326]"
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
      caption="Siparişler admin listesi"
      emptyTitle="Sipariş bulunamadı"
      emptyDescription="Arama veya durum filtrelerini değiştirerek sonucu genişletebilirsiniz."
      footer={footer}
    />
  );
}
