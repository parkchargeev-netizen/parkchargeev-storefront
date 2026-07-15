import {
  BarChart3,
  Boxes,
  Globe2,
  Layers3,
  SearchCheck,
  ShieldCheck,
  Truck,
  Zap
} from "lucide-react";
import Link from "next/link";

import {
  commerceCapabilities,
  commerceSignals,
  type CommerceCapabilityTone
} from "@/lib/supreme-commerce-capabilities";

const toneClassNames: Record<CommerceCapabilityTone, string> = {
  amber: "enterprise-commerce-card--amber",
  blue: "enterprise-commerce-card--blue",
  emerald: "enterprise-commerce-card--emerald",
  violet: "enterprise-commerce-card--violet"
};

const capabilityIcons = [SearchCheck, Layers3, Globe2, Truck] as const;
const signalIcons = [Zap, ShieldCheck, BarChart3] as const;

type EnterpriseCommerceSectionProps = {
  compact?: boolean;
};

export function EnterpriseCommerceSection({ compact = false }: EnterpriseCommerceSectionProps) {
  return (
    <section
      className={compact ? "enterprise-commerce enterprise-commerce--compact" : "enterprise-commerce"}
      aria-labelledby={compact ? "store-commerce-platform-title" : "home-commerce-platform-title"}
    >
      <div className="enterprise-commerce__shell">
        <div className="enterprise-commerce__header">
          <div>
            <p className="premium-eyebrow">Kurumsal ticaret altyapisi</p>
            <h2 id={compact ? "store-commerce-platform-title" : "home-commerce-platform-title"}>
              Supreme seviye e-ticaret kabiliyetleri ParkChargeEV deneyimine uyarlandi.
            </h2>
          </div>
          <p>
            EV sarj cihazlari icin karar verme, urun kesfi, odeme, lojistik, SEO ve admin yonetimi tek bir hizli vitrin akisi gibi calisir.
          </p>
        </div>

        <div className="enterprise-commerce__signals" aria-label="Performans ve operasyon sinyalleri">
          {commerceSignals.map((signal, index) => {
            const Icon = signalIcons[index % signalIcons.length];

            return (
              <div key={signal.label} className="enterprise-commerce-signal">
                <span>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <strong>{signal.value}</strong>
                  <p>{signal.label}</p>
                  <small>{signal.detail}</small>
                </div>
              </div>
            );
          })}
        </div>

        <div className="enterprise-commerce__grid">
          {commerceCapabilities.map((capability, index) => {
            const Icon = capabilityIcons[index % capabilityIcons.length];

            return (
              <article
                key={capability.id}
                className={"enterprise-commerce-card " + toneClassNames[capability.tone]}
              >
                <div className="enterprise-commerce-card__top">
                  <span className="enterprise-commerce-card__icon">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>{capability.eyebrow}</span>
                </div>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
                <strong>{capability.proof}</strong>
                <ul>
                  {capability.bullets.map((bullet) => (
                    <li key={bullet}>
                      <Boxes className="h-3.5 w-3.5" aria-hidden />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="enterprise-commerce__footer">
          <span>Teknik SEO, urun karsilastirma, vitrin yonetimi ve odeme guveni ayni tasarim sistemiyle sunulur.</span>
          <Link href="/magaza" className="btn-secondary">
            Magazayi incele
          </Link>
        </div>
      </div>
    </section>
  );
}
