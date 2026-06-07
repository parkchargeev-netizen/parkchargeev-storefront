import { MessageCircle, Search, UserRound } from "lucide-react";
import Link from "next/link";

import { SiteCartLink } from "@/components/layout/site-cart-link";
import { siteConfig } from "@/lib/site";

type SiteHeaderActionsProps = {
  className?: string;
};

export function SiteHeaderActions({ className = "" }: SiteHeaderActionsProps) {
  const whatsappHref = `https://wa.me/${siteConfig.whatsappPhone}?text=${encodeURIComponent(
    "Merhaba, ParkChargeEV şarj çözümü için bilgi almak istiyorum."
  )}`;

  return (
    <div className={className || "flex items-center gap-2"}>
      <Link
        href="/arama"
        aria-label="Arama"
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant/40 bg-white text-on-surface transition hover:border-primary/30 hover:text-primary"
      >
        <Search className="h-5 w-5" aria-hidden />
      </Link>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp destek"
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-secondary/25 bg-secondary/10 text-secondary transition hover:border-secondary/45 hover:bg-secondary/15"
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
      </a>
      <SiteCartLink />
      <Link
        href="/iletisim"
        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-primary/20 bg-white px-4 py-2 text-sm font-black text-primary transition hover:border-primary/45"
      >
        Keşif Al
      </Link>
      <Link
        href="/giris"
        aria-label="Giriş Yap"
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_32px_rgba(0,68,211,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,68,211,0.28)]"
      >
        <UserRound className="h-5 w-5" aria-hidden />
      </Link>
    </div>
  );
}
