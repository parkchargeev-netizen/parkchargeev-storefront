"use client";

import dynamic from "next/dynamic";

import type { ProductFormProps } from "@/components/admin/product-form";

function ProductFormSkeleton() {
  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="sticky top-4 z-20 rounded-lg border border-emerald-100 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-4 xl:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.8fr)_auto] xl:items-center">
          <div>
            <div className="h-4 w-44 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-3 h-3 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-slate-100" />
            ))}
          </div>
          <div className="flex gap-2 xl:justify-end">
            <div className="h-11 w-32 animate-pulse rounded-lg bg-emerald-50" />
            <div className="h-11 w-28 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="surface-card min-h-64 border border-slate-200 bg-white/95 p-6">
            <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((__, rowIndex) => (
                <div key={rowIndex} className="h-10 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const LazyProductForm = dynamic(
  () => import("@/components/admin/product-form").then((module) => module.ProductForm),
  {
    ssr: false,
    loading: () => <ProductFormSkeleton />
  }
);

export function ProductFormLoader(props: ProductFormProps) {
  return <LazyProductForm {...props} />;
}