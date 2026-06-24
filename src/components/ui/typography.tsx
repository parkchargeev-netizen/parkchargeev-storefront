import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

type TextTone = "default" | "muted" | "primary" | "inverse";
type TextSize = "body" | "supporting" | "meta";

type TextProps<T extends ElementType = "p"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  size?: TextSize;
  tone?: TextTone;
};

const sizeClasses: Record<TextSize, string> = {
  body: "ds-text-body",
  supporting: "ds-text-supporting",
  meta: "ds-text-meta"
};

const toneClasses: Record<TextTone, string> = {
  default: "text-on-surface",
  muted: "text-on-surface-variant",
  primary: "text-primary",
  inverse: "text-white"
};

export function Text<T extends ElementType = "p">({
  as,
  children,
  className,
  size = "body",
  tone = "default"
}: TextProps<T>) {
  const Component = as ?? "p";

  return (
    <Component className={clsx(sizeClasses[size], toneClasses[tone], className)}>
      {children}
    </Component>
  );
}

