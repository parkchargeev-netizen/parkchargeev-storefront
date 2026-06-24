import type { ReactNode } from "react";
import clsx from "clsx";

import { Text } from "@/components/ui/typography";

type PageHeaderProps = {
  actions?: ReactNode;
  align?: "left" | "center";
  body?: ReactNode;
  className?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
};

export function PageHeader({
  actions,
  align = "left",
  body,
  className,
  eyebrow,
  title
}: PageHeaderProps) {
  return (
    <header
      className={clsx(
        "ds-page-header",
        align === "center" && "ds-page-header--center",
        className
      )}
      data-motion="reveal"
    >
      <div className="ds-page-header__copy">
        {eyebrow ? <p className="ds-eyebrow">{eyebrow}</p> : null}
        <h1 className="ds-page-title">{title}</h1>
        {body ? (
          <Text className="ds-page-header__body" tone="muted">
            {body}
          </Text>
        ) : null}
      </div>
      {actions ? <div className="ds-page-header__actions">{actions}</div> : null}
    </header>
  );
}

