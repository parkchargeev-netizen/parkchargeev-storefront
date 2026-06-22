"use client";

import { useEffect } from "react";

const motionSelectors = [
  ".premium-section > .mx-auto",
  ".premium-route-card",
  ".premium-route-mini",
  ".premium-funnel-lane",
  ".premium-power-card",
  ".premium-metric-card",
  ".premium-install-card",
  ".premium-signal-card",
  ".premium-quote-card",
  ".premium-resource-link",
  ".surface-card",
  ".selector-config-panel",
  ".selector-option",
  ".selector-result-card",
  ".store-hero",
  ".store-results__header",
  ".store-segment-card",
  ".store-commerce-strip",
  ".store-category-chip",
  ".premium-product-card",
  ".product-gallery-premium",
  ".contact-info-card",
  ".contact-map-card",
  ".lead-form-card",
  ".cart-hero",
  ".cart-summary-card",
  ".product-detail-hero"
];

export function ScrollMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let frame = 0;

    frame = window.requestAnimationFrame(() => {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>(motionSelectors.join(","))
      ).filter((element) => !element.closest("[data-motion-skip]"));

      candidates.forEach((element, index) => {
        element.classList.add("motion-observe");
        element.style.setProperty("--motion-delay", `${Math.min(index % 4, 3) * 24}ms`);
      });

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const target = entry.target as HTMLElement;
            target.classList.add("motion-visible");
            window.setTimeout(() => target.classList.add("motion-complete"), 420);
            observer?.unobserve(target);
          });
        },
        {
          rootMargin: "0px 0px -8% 0px",
          threshold: 0.04
        }
      );

      candidates.forEach((element) => observer?.observe(element));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  return null;
}
