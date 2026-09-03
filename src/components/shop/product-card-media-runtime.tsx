"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const finePointerQuery = "(hover: hover) and (pointer: fine)";
const productCardLinkSelector = ".premium-product-card-link";
const secondaryImageSelector = "[data-product-secondary-src]";
const warmedProductRoutes = new Set<string>();

type ProductCardRouter = {
  prefetch?: (href: string) => void;
};

function getProductCardLink(event: Event) {
  if (!(event.target instanceof Element)) {
    return null;
  }

  return event.target.closest<HTMLAnchorElement>(productCardLinkSelector);
}

function getSameOriginRouteHref(link: HTMLAnchorElement) {
  if (!link.href || link.target || link.hasAttribute("download")) {
    return null;
  }

  try {
    const url = new URL(link.href);

    if (url.origin !== window.location.origin) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function warmProductRoute(link: HTMLAnchorElement, router?: ProductCardRouter) {
  const routeHref = getSameOriginRouteHref(link);

  if (!routeHref || warmedProductRoutes.has(link.href)) {
    return;
  }

  warmedProductRoutes.add(link.href);
  router?.prefetch?.(routeHref);

  const prefetchLink = document.createElement("link");
  prefetchLink.rel = "prefetch";
  prefetchLink.as = "document";
  prefetchLink.href = link.href;
  prefetchLink.dataset.productCardPrefetch = "true";
  document.head.appendChild(prefetchLink);
}

function warmProductRouteFromEvent(event: Event, router: ProductCardRouter) {
  const link = getProductCardLink(event);
  if (link) {
    warmProductRoute(link, router);
  }
}

function loadSecondaryImage(event: Event) {
  const productCard = getProductCardLink(event);
  const image = productCard?.querySelector<HTMLImageElement>(secondaryImageSelector);

  if (!image || image.dataset.secondaryLoaded === "true") {
    return;
  }

  const frame = image.closest(".product-card-media-frame");
  const markReady = () => {
    if (image.naturalWidth <= 1) {
      return;
    }

    frame?.classList.remove("product-card-media-frame--secondary-error");
    frame?.classList.add("product-card-media-frame--secondary-ready");
  };
  const markError = () => {
    image.dataset.secondaryLoaded = "error";
    image.removeAttribute("src");
    image.removeAttribute("srcset");
    frame?.classList.remove("product-card-media-frame--secondary-ready");
    frame?.classList.add("product-card-media-frame--secondary-error");
  };
  const src = image.dataset.productSecondarySrc;
  const srcSet = image.dataset.productSecondarySrcSet;
  const sizes = image.dataset.productSecondarySizes;

  if (!src) {
    return;
  }

  image.dataset.secondaryLoaded = "true";
  image.addEventListener("load", markReady, { once: true });
  image.addEventListener("error", markError, { once: true });

  if (sizes) {
    image.sizes = sizes;
  }
  if (srcSet) {
    image.srcset = srcSet;
  }
  image.src = src;

  if (image.complete && image.naturalWidth > 1) {
    markReady();
  }
}

export function ProductCardMediaRuntime() {
  const router = useRouter();

  useEffect(() => {
    const contentRoot = document.getElementById("main-content");
    if (!contentRoot) {
      return;
    }

    const mediaQuery = window.matchMedia(finePointerQuery);
    const intentOptions = { capture: true, passive: true } as const;
    const warmRoute = (event: Event) => warmProductRouteFromEvent(event, router);

    contentRoot.addEventListener("pointerdown", warmRoute, intentOptions);
    contentRoot.addEventListener("focusin", warmRoute, true);

    if (mediaQuery.matches) {
      contentRoot.addEventListener("pointerover", loadSecondaryImage, { passive: true });
      contentRoot.addEventListener("focusin", loadSecondaryImage);
    }

    return () => {
      contentRoot.removeEventListener("pointerdown", warmRoute, intentOptions);
      contentRoot.removeEventListener("focusin", warmRoute, true);
      contentRoot.removeEventListener("pointerover", loadSecondaryImage);
      contentRoot.removeEventListener("focusin", loadSecondaryImage);
    };
  }, [router]);

  return null;
}
