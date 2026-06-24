"use client";

import { lazy, Suspense } from "react";

type NavigationFormItem = {
  id?: string;
  area?: "primary" | "footer" | "legal";
  label?: string;
  href?: string;
  sortOrder?: number;
  isActive?: boolean;
  opensInNewTab?: boolean;
  rel?: string;
};

type SitePageFormItem = {
  id?: string;
  slug?: string;
  title?: string;
  eyebrow?: string;
  excerpt?: string;
  body?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  status?: "draft" | "published" | "archived";
  showInSitemap?: boolean;
  noIndex?: boolean;
  sitemapPriority?: number;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
};

type SiteManagementFormSlotProps =
  | {
      kind: "navigation";
      mode: "create" | "edit";
      item?: NavigationFormItem;
    }
  | {
      kind: "page";
      mode: "create" | "edit";
      page?: SitePageFormItem;
    };

const NavigationItemForm = lazy(() =>
  import("@/components/admin/navigation-item-form").then((module) => ({
    default: module.NavigationItemForm
  }))
);

const SitePageForm = lazy(() =>
  import("@/components/admin/site-page-form").then((module) => ({
    default: module.SitePageForm
  }))
);

function FormSkeleton({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-medium text-slate-500">
      {label}
    </div>
  );
}

export function SiteManagementFormSlot(props: SiteManagementFormSlotProps) {
  if (props.kind === "navigation") {
    return (
      <Suspense fallback={<FormSkeleton label="Menü formu yükleniyor..." />}>
        <NavigationItemForm mode={props.mode} item={props.item} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<FormSkeleton label="Sayfa formu yükleniyor..." />}>
      <SitePageForm mode={props.mode} page={props.page} />
    </Suspense>
  );
}
