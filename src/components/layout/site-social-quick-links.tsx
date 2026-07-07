import type { PublicSiteSettings } from "@/lib/site-settings";

type SiteSocialQuickLinksProps = {
  settings?: PublicSiteSettings;
};

function normalizeExternalHref(value?: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "";
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function SiteSocialQuickLinks({ settings }: SiteSocialQuickLinksProps) {
  const brandName = settings?.brandName ?? "ParkChargeEV";
  const socialLinks = [
    {
      key: "instagram",
      label: "Instagram",
      shortLabel: "IG",
      href: normalizeExternalHref(settings?.socials.instagram)
    },
    {
      key: "facebook",
      label: "Facebook",
      shortLabel: "FB",
      href: normalizeExternalHref(settings?.socials.facebook)
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      shortLabel: "IN",
      href: normalizeExternalHref(settings?.socials.linkedin)
    },
    {
      key: "youtube",
      label: "YouTube",
      shortLabel: "YT",
      href: normalizeExternalHref(settings?.socials.youtube)
    }
  ].filter((item) => item.href);

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <aside className="site-social-quick-links" aria-label="Sosyal medya hızlı bağlantıları">
      <div className="site-social-quick-links__list">
        {socialLinks.map((item) => (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`${brandName} ${item.label}`}
            aria-label={`${brandName} ${item.label} hesabını aç`}
            className="site-social-quick-links__item"
          >
            <span aria-hidden>{item.shortLabel}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}
