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
  id?: string;
  motion?: MotionKind | "none";
  tone?: "default" | "dark" | "light";
};

const toneClasses = {
  dark: "premium-section--dark",
  default: "",
  light: "premium-section--light"
} as const;

const defaultContainerClassName = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

const premiumSectionAtmosphereParts = [
  "premium-section__rail premium-section__rail--one",
  "premium-section__rail premium-section__rail--two",
  "premium-section__rail premium-section__rail--three",
  "premium-section__spark premium-section__spark--one",
  "premium-section__spark premium-section__spark--two",
  "premium-section__spark premium-section__spark--three",
  "premium-section__flare premium-section__flare--one",
  "premium-section__flare premium-section__flare--two"
] as const;

function PremiumSectionAtmosphere() {
  return (
    <span className="premium-section__atmosphere" aria-hidden>
      {premiumSectionAtmosphereParts.map((className) => (
        <span key={className} className={className} />
      ))}
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
  id,
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
      id={id}
      className={clsx("premium-section premium-section-composed", toneClasses[tone], className)}
      data-motion={motion === "none" ? undefined : motion}
      data-motion-loop={ambient ? "ambient" : undefined}
      data-premium-depth
    >
      {ambient ? <PremiumSectionAtmosphere /> : null}
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
