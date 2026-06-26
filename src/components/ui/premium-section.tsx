import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

import type { MotionKind } from "@/lib/motion-system";

type PremiumSectionProps<T extends ElementType = "section"> = {
  ambient?: boolean;
  as?: T;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  container?: boolean;
  motion?: MotionKind | "none";
  tone?: "default" | "dark" | "light";
};

const toneClasses = {
  dark: "premium-section--dark",
  default: "",
  light: "premium-section--light"
} as const;

const defaultContainerClassName = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

function PremiumSectionAtmosphere() {
  return (
    <span className="premium-section__atmosphere" aria-hidden>
      <span className="premium-section__rail premium-section__rail--one" />
      <span className="premium-section__rail premium-section__rail--two" />
      <span className="premium-section__rail premium-section__rail--three" />
      <span className="premium-section__spark premium-section__spark--one" />
      <span className="premium-section__spark premium-section__spark--two" />
      <span className="premium-section__spark premium-section__spark--three" />
      <span className="premium-section__flare premium-section__flare--one" />
      <span className="premium-section__flare premium-section__flare--two" />
    </span>
  );
}

export function PremiumSection<T extends ElementType = "section">({
  ambient = true,
  as,
  children,
  className,
  container = true,
  containerClassName,
  motion = "reveal",
  tone = "default"
}: PremiumSectionProps<T>) {
  const Component = as ?? "section";
  const content = container ? (
    <div className={clsx(defaultContainerClassName, containerClassName)}>
      {children}
    </div>
  ) : (
    children
  );

  return (
    <Component
      className={clsx("premium-section premium-section-composed", toneClasses[tone], className)}
      data-motion={motion === "none" ? undefined : motion}
      data-motion-loop={ambient ? "ambient" : undefined}
      data-premium-depth
    >
      <PremiumSectionAtmosphere />
      {content}
    </Component>
  );
}

type MotionGroupProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
};

export function MotionGroup<T extends ElementType = "div">({
  as,
  children,
  className
}: MotionGroupProps<T>) {
  const Component = as ?? "div";

  return (
    <Component className={className} data-motion-scope>
      {children}
    </Component>
  );
}
