import type { ReactNode } from "react";
import clsx from "clsx";

type StatusBadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

type StatusBadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: StatusBadgeTone;
};

const toneClasses: Record<StatusBadgeTone, string> = {
  neutral: "ds-status-badge--neutral",
  success: "ds-status-badge--success",
  warning: "ds-status-badge--warning",
  danger: "ds-status-badge--danger",
  primary: "ds-status-badge--primary"
};

export function StatusBadge({
  children,
  className,
  tone = "neutral"
}: StatusBadgeProps) {
  return (
    <span className={clsx("ds-status-badge", toneClasses[tone], className)}>
      {children}
    </span>
  );
}

