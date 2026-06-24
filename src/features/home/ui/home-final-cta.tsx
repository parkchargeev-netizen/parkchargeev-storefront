import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { conversionDataAttributes } from "@/lib/conversion-events";

type HomeFinalCtaProps = {
  whatsappHref: string;
};

export function HomeFinalCta({ whatsappHref }: HomeFinalCtaProps) {
  return (
    <section className="premium-section premium-final-cta">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <p className="premium-eyebrow text-emerald-300">Projenizi başlatın</p>
        <h2 className="mt-4 text-3xl font-black leading-tight text-white md:text-5xl">
          Ürün, altyapı ve kurulum kapsamını tek görüşmede netleştirin.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/76 md:text-base">
          Bireysel ürün seçiminden çok lokasyonlu kurumsal projelere kadar doğru
          uzmanlık akışına bağlanın.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/urun-secici"
            className="premium-btn premium-btn--primary"
            {...conversionDataAttributes("persona_route_click", {
              route: "final_selector",
              href: "/urun-secici"
            })}
          >
            Çözümünü Bul
          </Link>
          <Link
            href="/iletisim?reason=Kurumsal%20teklif"
            className="premium-btn premium-btn--glass"
            {...conversionDataAttributes("installation_quote_click", {
              placement: "final_cta",
              href: "/iletisim?reason=Kurumsal%20teklif"
            })}
          >
            Proje Teklifi Al
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="premium-btn premium-btn--ghost"
            {...conversionDataAttributes("whatsapp_click", {
              placement: "final_cta",
              href: whatsappHref
            })}
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
