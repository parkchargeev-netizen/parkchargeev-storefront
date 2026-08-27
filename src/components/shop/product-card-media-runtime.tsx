"use client";

import { useEffect } from "react";

const finePointerQuery = "(hover: hover) and (pointer: fine)";
const secondaryImageSelector = "[data-product-secondary-src]";

function loadSecondaryImage(event: Event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const productCard = event.target.closest(".premium-product-card-link");
  const image = productCard?.querySelector<HTMLImageElement>(secondaryImageSelector);

  if (!image || image.dataset.secondaryLoaded === "true") {
    return;
  }

  const frame = image.closest(".product-card-media-frame");
  const markReady = () => frame?.classList.add("product-card-media-frame--secondary-ready");
  const src = image.dataset.productSecondarySrc;
  const srcSet = image.dataset.productSecondarySrcSet;
  const sizes = image.dataset.productSecondarySizes;

  if (!src) {
    return;
  }

  image.dataset.secondaryLoaded = "true";
  image.addEventListener("load", markReady, { once: true });

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
  useEffect(() => {
    const mediaQuery = window.matchMedia(finePointerQuery);
    if (!mediaQuery.matches) {
      return;
    }

    const contentRoot = document.getElementById("main-content");
    contentRoot?.addEventListener("pointerover", loadSecondaryImage, { passive: true });
    contentRoot?.addEventListener("focusin", loadSecondaryImage);

    return () => {
      contentRoot?.removeEventListener("pointerover", loadSecondaryImage);
      contentRoot?.removeEventListener("focusin", loadSecondaryImage);
    };
  }, []);

  return null;
}
