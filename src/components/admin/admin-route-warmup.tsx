"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

type AdminRouteWarmupProps = {
  hrefs: string[];
  delayMs?: number;
  limit?: number;
};

function normalizeAdminHref(href: string) {
  if (!href.startsWith("/admin")) {
    return null;
  }

  return href.split("#")[0] || "/admin";
}

function isRouteHref(href: string | null): href is string {
  return Boolean(href);
}

export function AdminRouteWarmup({
  hrefs,
  delayMs = 450,
  limit = 14
}: AdminRouteWarmupProps) {
  const router = useRouter();
  const signature = useMemo(() => {
    return Array.from(new Set(hrefs.map(normalizeAdminHref).filter(isRouteHref)))
      .slice(0, limit)
      .join("|");
  }, [hrefs, limit]);

  useEffect(() => {
    const routes = signature.split("|").filter(Boolean);

    if (routes.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      routes.forEach((href) => router.prefetch(href));
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, router, signature]);

  return null;
}
