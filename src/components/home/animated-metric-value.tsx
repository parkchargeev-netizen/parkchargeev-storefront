"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function parseMetric(value: string) {
  if (value.includes("/")) {
    return null;
  }

  const match = value.match(/^([^0-9]*)([0-9.]+(?:,[0-9]+)?)(.*)$/);

  if (!match) {
    return null;
  }

  const [, prefix, numeric, suffix] = match;
  const decimals = numeric.includes(",") ? numeric.split(",")[1]?.length ?? 0 : 0;
  const normalized = Number(numeric.replace(/\./g, "").replace(",", "."));

  if (!Number.isFinite(normalized)) {
    return null;
  }

  return {
    prefix,
    value: normalized,
    suffix,
    decimals
  };
}

export function AnimatedMetricValue({ value }: { value: string }) {
  const parsed = useMemo(() => parseMetric(value), [value]);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(parsed ? "0" : value);

  useEffect(() => {
    if (!parsed || !elementRef.current) {
      return;
    }

    const metric = parsed;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }

    const element = elementRef.current;
    let frame = 0;
    let started = false;
    const formatter = new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: metric.decimals,
      maximumFractionDigits: metric.decimals
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started) {
          return;
        }

        started = true;
        const start = performance.now();
        const duration = 1200;

        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const next = metric.value * eased;

          setDisplayValue(`${metric.prefix}${formatter.format(next)}${metric.suffix}`);

          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          } else {
            setDisplayValue(value);
          }
        }

        frame = requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [parsed, value]);

  return <span ref={elementRef}>{displayValue}</span>;
}
