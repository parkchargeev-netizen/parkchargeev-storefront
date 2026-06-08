import { siteConfig } from "@/lib/site";

type BrandLogoProps = {
  className?: string;
  tone?: "dark" | "light";
  showWordmark?: boolean;
};

export function BrandLogo({
  className = "",
  tone = "dark",
  showWordmark = true
}: BrandLogoProps) {
  const textClass = tone === "light" ? "text-[#7eecc9]" : "text-[#063326]";
  const mutedTextClass = tone === "light" ? "text-white/84" : "text-[#0f8f6f]";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label={siteConfig.name}>
      <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[1.15rem] bg-[#063326] shadow-[0_16px_36px_rgba(6,51,38,0.22)]">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_32%_20%,rgba(126,236,201,0.26),transparent_48%)]" />
        <svg
          viewBox="0 0 64 64"
          className="relative h-9 w-9"
          role="img"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="32" cy="32" r="27" fill="none" stroke="#7eecc9" strokeWidth="5" />
          <path
            d="M18.5 36.8c1.4-7.2 6.6-10.8 12.7-10.8h7.2c5.3 0 7.7 3.1 9.5 7.4 1.1 2.6-.7 5.8-3.6 5.8h-2.6c-1.9 0-3.3-1.2-4-2.7H27.5c-.8 1.6-2.3 2.7-4.1 2.7h-1.8c-2 0-3.5-1-3.1-2.4Z"
            fill="none"
            stroke="#7eecc9"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4.2"
          />
          <path
            d="M35.1 17.8 26.8 33h6.4l-4.1 13.2 10.4-17.4h-6.1l1.7-11Z"
            fill="#7eecc9"
          />
        </svg>
      </span>

      {showWordmark ? (
        <span className="brand-display grid leading-[0.82]" aria-hidden="true">
          <span className={`text-[0.92rem] font-black uppercase tracking-[0.08em] ${textClass}`}>
            Park
          </span>
          <span className={`text-[0.92rem] font-black uppercase tracking-[0.08em] ${textClass}`}>
            Charge
          </span>
          <span className={`text-[0.92rem] font-black uppercase tracking-[0.08em] ${mutedTextClass}`}>
            EV
          </span>
        </span>
      ) : null}
    </span>
  );
}
