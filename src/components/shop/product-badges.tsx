import type {
  ProductBadgePlacement,
  ProductDetailBadge
} from "@/lib/product-detail-content";

type ProductBadgeTone = NonNullable<ProductDetailBadge["tone"]>;

const toneClassNames: Record<ProductBadgeTone, string> = {
  danger: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-slate-200 bg-white text-slate-700",
  primary: "border-primary/20 bg-primary/8 text-primary",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700"
};

export function getBadgesByPlacement(
  badges: ProductDetailBadge[] | undefined,
  placement: ProductBadgePlacement
) {
  return (badges ?? []).filter(
    (badge) => badge.isActive !== false && badge.label?.trim() && badge.position === placement
  );
}

export function ProductBadgePill({
  badge,
  className = ""
}: {
  badge: ProductDetailBadge;
  className?: string;
}) {
  const normalizedLabel = badge.label.toLocaleLowerCase("tr-TR");
  const motionClassName = normalizedLabel.includes("kargo bedava")
    ? "product-badge-pill--free-shipping"
    : normalizedLabel.includes("yarın kargoda") || normalizedLabel.includes("yarin kargoda")
      ? "product-badge-pill--ships-tomorrow"
      : "";

  return (
    <span
      className={`product-badge-pill inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase leading-none tracking-normal shadow-[0_10px_24px_rgba(15,23,42,0.08)] ${toneClassNames[badge.tone ?? "neutral"]} ${motionClassName} ${className}`}
      title={badge.label}
    >
      <span className="truncate">{badge.label}</span>
    </span>
  );
}

export function ProductBadgeStrip({
  badges,
  className = ""
}: {
  badges: ProductDetailBadge[];
  className?: string;
}) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {badges.map((badge) => (
        <ProductBadgePill
          key={`${badge.position}-${badge.label}-${badge.sortOrder ?? 0}`}
          badge={badge}
        />
      ))}
    </div>
  );
}

export function ProductPlacementBadges({
  badges,
  placement,
  className = ""
}: {
  badges: ProductDetailBadge[] | undefined;
  placement: ProductBadgePlacement;
  className?: string;
}) {
  return (
    <ProductBadgeStrip
      badges={getBadgesByPlacement(badges, placement)}
      className={className}
    />
  );
}
