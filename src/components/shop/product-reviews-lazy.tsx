"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { ProductReviewContent } from "@/lib/product-detail-content";

type ProductReviewsLazyProps = {
  productName: string;
  productSlug: string;
  content: ProductReviewContent;
};

const ProductReviews = dynamic(
  () => import("@/components/shop/product-reviews").then((module) => module.ProductReviews),
  {
    ssr: false,
    loading: () => (
      <section className="product-reviews-section mt-8 min-h-72 rounded-lg border border-outline-variant/35 bg-white/70" />
    )
  }
);

export function ProductReviewsLazy(props: ProductReviewsLazyProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }

    const load = () => setShouldLoad(true);

    if (!("IntersectionObserver" in window)) {
      const timeout = globalThis.setTimeout(load, 1200);
      return () => globalThis.clearTimeout(timeout);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        load();
        observer.disconnect();
      },
      {
        rootMargin: "600px 0px"
      }
    );

    const node = rootRef.current;
    if (node) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={rootRef} className="product-reviews-lazy">
      {shouldLoad ? (
        <ProductReviews {...props} />
      ) : (
        <section
          className="product-reviews-section mt-8 min-h-72 rounded-lg border border-dashed border-outline-variant/40 bg-white/60"
          aria-hidden
        />
      )}
    </div>
  );
}
