import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

type SurfaceTone = "default" | "soft" | "dark";
type SurfaceDensity = "comfortable" | "compact" | "none";

type SurfaceProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  density?: SurfaceDensity;
  motion?: "reveal" | "fade" | "slide" | "scale" | "none";
  tone?: SurfaceTone;
};

const toneClasses: Record<SurfaceTone, string> = {
  default: "ds-surface",
  soft: "ds-surface ds-surface--soft",
  dark: "ds-surface ds-surface--dark"
};

const densityClasses: Record<SurfaceDensity, string> = {
  comfortable: "ds-surface--comfortable",
  compact: "ds-surface--compact",
  none: ""
};

export function Surface<T extends ElementType = "div">({
  as,
  children,
  className,
  density = "comfortable",
  motion = "reveal",
  tone = "default"
}: SurfaceProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={clsx(toneClasses[tone], densityClasses[density], className)}
      data-motion={motion === "none" ? undefined : motion}
      data-surface
    >
      {children}
    </Component>
  );
}

