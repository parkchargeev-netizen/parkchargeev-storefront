"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";

import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";

type AdminNavLinkProps = {
  href: string;
  icon: ReactNode;
  label: string;
};

export function AdminNavLink({ href, icon, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));

  return (
    <AdminPrefetchLink
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={clsx(
        "group flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition",
        isActive
          ? "border-emerald-200 bg-emerald-50 text-[#063326]"
          : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={clsx(
            "rounded-lg p-2 transition",
            isActive
              ? "bg-white text-emerald-800 shadow-sm"
              : "bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-[#063326]"
          )}
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </span>
      <ArrowUpRight
        className={clsx(
          "h-4 w-4 transition",
          isActive ? "text-[#0f8f6f]" : "text-slate-500 group-hover:text-[#063326]"
        )}
      />
    </AdminPrefetchLink>
  );
}
