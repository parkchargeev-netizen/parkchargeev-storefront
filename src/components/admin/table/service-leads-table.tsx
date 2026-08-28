"use client";

import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";
import { AdminDataTable } from "@/components/admin/table/admin-data-table";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";
import { leadStatusOptions } from "@/server/admin/constants";

type ServiceLeadRow = {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  leadType: string;
  projectType?: string | null;
  city?: string | null;
  district?: string | null;
  status: string;
  createdAt: string | Date;
};

type ServiceLeadsTableProps = {
  items: ServiceLeadRow[];
  footer?: ReactNode;
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function getLeadTone(status: string) {
  if (status === "won") {
    return "success";
  }

  if (status === "lost") {
    return "danger";
  }

  if (status === "contacted" || status === "qualified") {
    return "warning";
  }

  return "info";
}

function formatLeadStatus(status: string) {
  return leadStatusOptions.find((option) => option.value === status)?.label ?? status;
}

const columns: Array<ColumnDef<ServiceLeadRow>> = [
  {
    accessorKey: "fullName",
    header: "Talep",
    cell: ({ row }) => (
      <div className="min-w-[240px]">
        <AdminPrefetchLink
          href={`/admin/teklifler/${row.original.id}?view=saha`}
          className="text-sm font-semibold text-slate-950 transition hover:text-[#063326]"
        >
          {row.original.fullName}
        </AdminPrefetchLink>
        <p className="mt-1 text-sm text-slate-600">
          {row.original.leadType} / {row.original.projectType ?? "Genel"}
        </p>
        <p className="mt-1 text-xs text-slate-500">{row.original.phone}</p>
      </div>
    )
  },
  {
    id: "contact",
    header: "İletişim",
    cell: ({ row }) => (
      <div className="min-w-[190px] text-sm text-slate-700">
        <p className="font-medium">{row.original.phone}</p>
        <p className="mt-1 text-xs text-slate-500">{row.original.email ?? "E-posta yok"}</p>
      </div>
    )
  },
  {
    id: "location",
    header: "Lokasyon",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-slate-700">
        {[row.original.city, row.original.district].filter(Boolean).join(" / ") || "-"}
      </span>
    )
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => (
      <AdminStatusBadge label={formatLeadStatus(row.original.status)} tone={getLeadTone(row.original.status)} />
    )
  },
  {
    accessorKey: "createdAt",
    header: "Tarih",
    cell: ({ row }) => formatDate(row.original.createdAt)
  },
  {
    id: "actions",
    header: "Aksiyon",
    enableSorting: false,
    cell: ({ row }) => (
      <AdminPrefetchLink
        href={`/admin/teklifler/${row.original.id}?view=saha`}
        className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#063326]"
      >
        Detay
      </AdminPrefetchLink>
    )
  }
];

export function ServiceLeadsTable({ items, footer }: ServiceLeadsTableProps) {
  return (
    <AdminDataTable
      columns={columns}
      data={items}
      caption="Saha ve kurulum talepleri admin listesi"
      emptyTitle="Saha talebi bulunamadı"
      emptyDescription="Filtreleri düzenleyerek veya yeni keşif talepleri geldikçe bu alan dolacak."
      footer={footer}
    />
  );
}