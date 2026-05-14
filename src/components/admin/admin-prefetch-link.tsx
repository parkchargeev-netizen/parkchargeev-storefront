"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, FocusEvent, MouseEvent } from "react";

type AdminPrefetchLinkProps = ComponentProps<typeof Link> & {
  prewarm?: boolean;
};

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
    if (prewarm && warmHref) {
      router.prefetch(warmHref);
    }
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
