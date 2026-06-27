import { siteConfig } from "@/lib/site";
import type { PublicSiteSettings } from "@/lib/site-settings";

type BrandLogoProps = {
  className?: string;
  settings?: PublicSiteSettings;
  tone?: "dark" | "light";
  showWordmark?: boolean;
};

export function BrandLogo({
  className = "",
  settings,
  tone = "dark",
  showWordmark = true
}: BrandLogoProps) {
  const logoToneClass = tone === "light" ? "brand-logo--light" : "brand-logo--dark";
  const brandName = settings?.brandName ?? siteConfig.name;
  const logoUrl = settings?.logoUrl ?? "";
  const logoAlt = settings?.logoAlt || brandName;

  return (
    <span
      className={`brand-logo ${logoToneClass} ${className}`}
      role="img"
      aria-label={brandName}
    >
      {logoUrl ? (
        <span className="brand-logo__custom">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt={logoAlt} className="brand-logo__custom-image" />
        </span>
      ) : (
        <span className="brand-logo__mark">
          <span className="brand-logo__mark-glow" />
          <svg
            viewBox="0 0 64 64"
            className="brand-logo__icon"
            role="img"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="32" cy="32" r="25.5" fill="none" stroke="#7eecc9" strokeWidth="4.6" />
            <circle cx="32" cy="32" r="16.5" fill="rgba(126,236,201,0.12)" stroke="rgba(126,236,201,0.34)" strokeWidth="1.6" />
            <path
              d="M18.8 37.1c1.35-7 6.45-10.55 12.4-10.55h7.4c5.15 0 7.55 3.05 9.28 7.2 1.08 2.58-.68 5.68-3.52 5.68h-2.64c-1.78 0-3.18-1.08-3.92-2.56H27.45c-.78 1.5-2.22 2.56-3.98 2.56h-1.76c-2.02 0-3.34-.96-2.91-2.33Z"
              fill="none"
              stroke="#7eecc9"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
            <path
              d="M35.35 16.9 26.8 32.5h6.35l-4 14.4 10.6-18.55h-6.12l1.72-11.45Z"
              fill="#7eecc9"
            />
          </svg>
        </span>
      )}

      {showWordmark && !logoUrl ? (
        <span className="brand-logo__wordmark brand-display" aria-hidden="true">
          <span>PARK</span>
          <span>CHARGE</span>
          <strong>EV</strong>
        </span>
      ) : null}
    </span>
  );
}
