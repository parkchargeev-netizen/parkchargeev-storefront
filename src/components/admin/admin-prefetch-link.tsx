"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, FocusEvent, MouseEvent } from "react";

type AdminPrefetchLinkProps = ComponentProps<typeof Link> & {
  prewarm?: boolean;
};

const prewarmedAdminRoutes = new Set<string>();

function isAdminHref(href: AdminPrefetchLinkProps["href"]): href is string {
  return typeof href === "string" && href.startsWith("/admin");
}

function routeHref(href: AdminPrefetchLinkProps["href"]) {
  if (!isAdminHref(href)) {
    return null;
  }

  return href.split("#")[0] || "/admin";
}

export function AdminPrefetchLink({
  href,
  prefetch,
  prewarm = true,
  onFocus,
  onMouseEnter,
  ...props
}: AdminPrefetchLinkProps) {
  const router = useRouter();
  const adminHref = isAdminHref(href);
  const warmHref = routeHref(href);

  function prewarmRoute() {
    if (!prewarm || !warmHref || prewarmedAdminRoutes.has(warmHref)) {
      return;
    }

    prewarmedAdminRoutes.add(warmHref);

    const requestIdleCallback =
      typeof window !== "undefined" ? window.requestIdleCallback : undefined;

    if (requestIdleCallback) {
      requestIdleCallback(() => router.prefetch(warmHref), { timeout: 900 });
      return;
    }

    globalThis.setTimeout(() => router.prefetch(warmHref), 0);
  }

  return (
    <Link
      href={href}
      prefetch={adminHref ? (prefetch ?? false) : false}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        prewarmRoute();
        onFocus?.(event);
      }}
      onMouseEnter={(event: MouseEvent<HTMLAnchorElement>) => {
        prewarmRoute();
        onMouseEnter?.(event);
      }}
      {...props}
    />
  );
}
