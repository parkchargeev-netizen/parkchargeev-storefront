"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import clsx from "clsx";

type AdminDataTableProps<TData> = {
  columns: Array<ColumnDef<TData>>;
  data: TData[];
  emptyTitle: string;
  emptyDescription: string;
  footer?: ReactNode;
};

export function AdminDataTable<TData>({
  columns,
  data,
  emptyTitle,
  emptyDescription,
  footer
}: AdminDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  const columnCount = table.getVisibleLeafColumns().length;

  return (
    <section className="surface-card overflow-hidden border border-slate-200 bg-white/95">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 first:pl-6 last:pr-6"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-2 text-left"
                        >
                          <span>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {sortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : sortDirection === "desc" ? (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50/70">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={clsx(
                        "border-b border-slate-100 px-4 py-4 align-top text-sm text-slate-700 first:pl-6 last:pr-6",
                        cell.column.id === "actions" && "whitespace-nowrap"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={Math.max(columnCount, 1)}
                  className="px-6 py-16 text-center"
                >
                  <div className="mx-auto max-w-md">
                    <p className="text-base font-semibold text-slate-900">{emptyTitle}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {emptyDescription}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {footer ? (
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
          <p className="text-sm text-slate-500">
            Bu gorunumde {table.getRowModel().rows.length} kayit listeleniyor.
          </p>
          {footer}
        </div>
      ) : null}
    </section>
  );
}
