"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

export function HomeHeroMotionLayer() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <m.span
        className="enterprise-hero__motion-aura enterprise-hero__motion-aura--one"
        aria-hidden
        initial={false}
        animate={
          shouldReduceMotion
            ? undefined
            : { opacity: [0.18, 0.42, 0.22], scale: [0.96, 1.04, 1] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <m.span
        className="enterprise-hero__motion-aura enterprise-hero__motion-aura--two"
        aria-hidden
        initial={false}
        animate={
          shouldReduceMotion
            ? undefined
            : { opacity: [0.12, 0.34, 0.16], scale: [1, 1.08, 0.98] }
        }
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
      />
    </LazyMotion>
  );
}
