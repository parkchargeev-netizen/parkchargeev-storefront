"use client";

import { useEffect } from "react";

const motionSelectors = [
  ".premium-section > .mx-auto",
  ".premium-route-card",
  ".motion-story-card",
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

    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(motionSelectors.join(","))
    ).filter((element) => !element.closest("[data-motion-skip]"));

    candidates.forEach((element, index) => {
      element.classList.add("motion-observe");
      element.style.setProperty("--motion-delay", `${Math.min(index % 6, 5) * 54}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("motion-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.08
      }
    );

    candidates.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return null;
}
