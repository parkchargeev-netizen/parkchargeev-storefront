import {
  BatteryCharging,
  Building2,
  Cable,
  ClipboardCheck,
  Gauge,
  Home,
  MessageCircle,
  PlugZap,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  Truck,
  Users,
  Wrench,
  Zap,
  type LucideIcon
} from "lucide-react";

import type { HomeIconKey } from "@/features/home/domain/home-content";

const iconMap: Record<HomeIconKey, LucideIcon> = {
  battery: BatteryCharging,
  building: Building2,
  cable: Cable,
  clipboard: ClipboardCheck,
  gauge: Gauge,
  home: Home,
  message: MessageCircle,
  plug: PlugZap,
  shield: ShieldCheck,
  shopping: ShoppingBag,
  spark: Sparkles,
  timer: Timer,
  truck: Truck,
  users: Users,
  wrench: Wrench,
  zap: Zap
};

type HomeIconProps = {
  icon: HomeIconKey;
  className?: string;
  iconClassName?: string;
};

export function HomeIcon({
  icon,
  className = "",
  iconClassName = "h-5 w-5"
}: HomeIconProps) {
  const Icon = iconMap[icon];

  return (
    <span className={`inline-flex items-center justify-center rounded-lg ${className}`}>
      <Icon className={iconClassName} aria-hidden />
    </span>
  );
}

export function getHomeIcon(icon: HomeIconKey) {
  return iconMap[icon];
}
