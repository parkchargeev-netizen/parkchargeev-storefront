import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { decisionSteps } from "@/features/home/domain/home-content";
import { HomeIcon } from "@/features/home/ui/home-icon";
import { conversionDataAttributes } from "@/lib/conversion-events";

export function DecisionSystemSection() {
  return (
    <section className="premium-section premium-funnel-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="premium-funnel-shell">
          <div className="premium-funnel-shell__copy">
            <p className="premium-eyebrow">Tek proje sistemi</p>
            <h2>Ürün kararından devreye almaya kadar görünür ve ölçülebilir süreç.</h2>
            <p>
              Hazır ürün alıcısı hızlı ilerler; teknik belirsizliği olan kullanıcı
              doğrulama akışına, kurumsal ekip ise proje planına geçer.
            </p>
          </div>

          <div className="premium-funnel-lanes">
            {decisionSteps.map((step, index) => (
              <Link
                key={step.title}
                href={step.href}
                className="premium-funnel-lane group"
                {...conversionDataAttributes("persona_route_click", {
                  route: step.title,
                  href: step.href
                })}
              >
                <span className="premium-funnel-lane__step">0{index + 1}</span>
                <HomeIcon icon={step.icon} className="premium-funnel-lane__icon" />
                <strong>{step.title}</strong>
                <small>{step.body}</small>
                <span className="premium-funnel-lane__cta">
                  {step.cta}
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            ))}
          </div>

          <div className="premium-funnel-proof">
            {[
              "Şeffaf ürün ve hizmet kapsamı",
              "Teknik uygunluk kontrolü",
              "Satış sonrası servis planı"
            ].map((item) => (
              <span key={item}>
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
