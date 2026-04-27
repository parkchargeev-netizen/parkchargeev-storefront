import clsx from "clsx";

type AdminStatusTone = "neutral" | "info" | "success" | "warning" | "danger";

type AdminStatusBadgeProps = {
  label: string;
  tone?: AdminStatusTone;
};

const toneClassMap: Record<AdminStatusTone, string> = {
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700"
};

export function AdminStatusBadge({
  label,
  tone = "neutral"
}: AdminStatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClassMap[tone]
      )}
    >
      {label}
    </span>
  );
}
