import { ClipboardCheck, MessageCircle, Search, UserRound } from "lucide-react";
import Link from "next/link";

import { SiteCartLink } from "@/components/layout/site-cart-link";
import { conversionDataAttributes } from "@/lib/conversion-events";
import { siteConfig } from "@/lib/site";

type SiteHeaderActionsProps = {
  className?: string;
};

export function SiteHeaderActions({ className = "" }: SiteHeaderActionsProps) {
  const whatsappHref = `https://wa.me/${siteConfig.whatsappPhone}?text=${encodeURIComponent(
    "Merhaba, ParkChargeEV şarj çözümü için bilgi almak istiyorum."
  )}`;
  const surveyHref = `/iletisim?reason=${encodeURIComponent("Ücretsiz keşif talebi")}`;

  return (
    <div className={className || "flex items-center gap-2"}>
      <Link
        href="/arama"
        aria-label="Arama"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-outline-variant/40 bg-white/86 text-on-surface transition hover:border-primary/30 hover:text-primary"
      >
        <Search className="h-5 w-5" aria-hidden />
      </Link>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp destek"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-secondary/25 bg-secondary/10 text-secondary transition hover:border-secondary/45 hover:bg-secondary/15"
        {...conversionDataAttributes("whatsapp_click", {
          placement: "header",
          href: whatsappHref
        })}
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
      </a>
      <SiteCartLink />
      <Link
        href={surveyHref}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-black text-white shadow-[0_14px_34px_rgba(6,51,38,0.2)] transition hover:-translate-y-0.5 hover:bg-secondary hover:shadow-[0_18px_44px_rgba(6,51,38,0.25)]"
        {...conversionDataAttributes("installation_quote_click", {
          placement: "header",
          href: surveyHref
        })}
      >
        <ClipboardCheck className="h-4 w-4" aria-hidden />
        Keşif Al
      </Link>
      <Link
        href="/giris"
        aria-label="Giriş Yap"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white shadow-[0_12px_32px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:bg-primary"
      >
        <UserRound className="h-5 w-5" aria-hidden />
      </Link>
    </div>
  );
}
