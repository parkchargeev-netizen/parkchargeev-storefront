"use client";

import {
  Children,
  type ReactNode,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
  caption?: string;
  footer?: ReactNode;
  pageSize?: number;
};

export function AdminDataTable<TData>({
  columns,
  data,
  emptyTitle,
  emptyDescription,
  caption,
  footer,
  pageSize = 25
}: AdminDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize
  });

  useEffect(() => {
    setPagination({
      pageIndex: 0,
      pageSize
    });
  }, [data.length, pageSize]);

  const tableState = useMemo(
    () => ({
      sorting,
      pagination
    }),
    [pagination, sorting]
  );

  const table = useReactTable({
    data,
    columns,
    state: tableState,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  const columnCount = table.getVisibleLeafColumns().length;
  const footerItems = footer ? Children.toArray(footer) : [];
  const visibleRows = table.getRowModel().rows;
  const totalRows = table.getPrePaginationRowModel().rows.length;
  const shouldPaginate = totalRows > pagination.pageSize;

  return (
    <section
      className="surface-card overflow-hidden border border-slate-200 bg-white/95"
      data-performance-scope
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <caption className="sr-only">
            {caption ?? `${emptyTitle} için admin veri tablosu`}
          </caption>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={
                        sortDirection === "asc"
                          ? "ascending"
                          : sortDirection === "desc"
                            ? "descending"
                            : canSort
                              ? "none"
                              : undefined
                      }
                      className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 text-left text-xs font-semibold uppercase tracking-normal text-slate-500 first:pl-6 last:pr-6"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-2 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
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
            {visibleRows.length > 0 ? (
              visibleRows.map((row) => (
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

      {footerItems.length > 0 || shouldPaginate ? (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Bu görünümde {visibleRows.length} / {totalRows} kayıt listeleniyor.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {shouldPaginate ? (
              <>
                <button
                  type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Önceki
                </button>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                  {pagination.pageIndex + 1} / {table.getPageCount()}
                </span>
                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sonraki
                </button>
              </>
            ) : null}
            {footerItems}
          </div>
        </div>
      ) : null}
    </section>
  );
}
