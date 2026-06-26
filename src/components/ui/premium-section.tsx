import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

import type { MotionKind } from "@/lib/motion-system";

type PremiumSectionProps<T extends ElementType = "section"> = {
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

export function PremiumSection<T extends ElementType = "section">({
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
      data-premium-depth
    >
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
