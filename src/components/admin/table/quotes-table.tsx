"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { AdminDataTable } from "@/components/admin/table/admin-data-table";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";

type QuoteRow = {
  id: string;
  fullName: string;
  companyName?: string | null;
  phone: string;
  segment: string;
  status: string;
  assignedAdminName?: string | null;
  updatedAt: string | Date;
};

type QuotesTableProps = {
  items: QuoteRow[];
  footer?: React.ReactNode;
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function getQuoteTone(status: string) {
  if (["won"].includes(status)) {
    return "success";
  }

  if (["reviewing", "proposal_sent", "negotiation"].includes(status)) {
    return "warning";
  }

  if (["lost"].includes(status)) {
    return "danger";
  }

  return "info";
}

const columns: Array<ColumnDef<QuoteRow>> = [
  {
    accessorKey: "fullName",
    header: "Talep",
    cell: ({ row }) => (
      <div className="min-w-[240px]">
        <Link
          href={`/admin/teklifler/${row.original.id}`}
          className="text-sm font-semibold text-slate-950 transition hover:text-blue-700"
        >
          {row.original.fullName}
        </Link>
        <p className="mt-1 text-sm text-slate-600">
          {row.original.companyName || "Bireysel talep"}
        </p>
        <p className="mt-1 text-xs text-slate-500">{row.original.phone}</p>
      </div>
    )
  },
  {
    accessorKey: "segment",
    header: "Segment",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-slate-700">{row.original.segment}</span>
    )
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => (
      <AdminStatusBadge label={row.original.status} tone={getQuoteTone(row.original.status)} />
    )
  },
  {
    accessorKey: "assignedAdminName",
    header: "Temsilci",
    cell: ({ row }) => row.original.assignedAdminName || "Atanmamis"
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
        href={`/admin/teklifler/${row.original.id}`}
        className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        Detay
      </Link>
    )
  }
];

export function QuotesTable({ items, footer }: QuotesTableProps) {
  return (
    <AdminDataTable
      columns={columns}
      data={items}
      emptyTitle="Teklif bulunamadi"
      emptyDescription="Filtreleri duzenleyerek veya yeni talepler geldikce bu alan dolacak."
      footer={footer}
    />
  );
}
