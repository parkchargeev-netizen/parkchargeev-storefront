import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

type ActionTone = "primary" | "secondary" | "quiet" | "inverse";
type ActionSize = "default" | "compact";

type SharedActionProps = {
  children: ReactNode;
  className?: string;
  size?: ActionSize;
  tone?: ActionTone;
};

const toneClasses: Record<ActionTone, string> = {
  primary: "ds-action--primary",
  secondary: "ds-action--secondary",
  quiet: "ds-action--quiet",
  inverse: "ds-action--inverse"
};

const sizeClasses: Record<ActionSize, string> = {
  default: "ds-action--default",
  compact: "ds-action--compact"
};

function getActionClassName({
  className,
  size = "default",
  tone = "primary"
}: Omit<SharedActionProps, "children">) {
  return clsx("ds-action", toneClasses[tone], sizeClasses[size], className);
}

type ActionLinkProps = SharedActionProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "children" | "className">;

export function ActionLink({
  children,
  className,
  size,
  tone,
  ...props
}: ActionLinkProps) {
  return (
    <Link className={getActionClassName({ className, size, tone })} {...props}>
      {children}
    </Link>
  );
}

type ActionButtonProps = SharedActionProps &
  Omit<ComponentPropsWithoutRef<"button">, "children" | "className">;

export function ActionButton({
  children,
  className,
  size,
  tone,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={getActionClassName({ className, size, tone })}
      {...props}
    >
      {children}
    </button>
  );
}

