import type { PublicSiteSettings } from "@/lib/site-settings";
import { SocialBrandIcon, type SocialBrandKey } from "@/components/layout/social-brand-icon";
import { siteConfig } from "@/lib/site";

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

function normalizeWhatsAppHref(value?: string) {
  const rawPhone = value?.trim() || siteConfig.whatsappPhone;
  const digits = rawPhone.replace(/\D/g, "");
  const phone = digits.startsWith("0") ? `90${digits.slice(1)}` : digits;

  if (!phone) {
    return "";
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(
    "Merhaba, ParkChargeEV ürünleri hakkında bilgi almak istiyorum."
  )}`;
}

export function SiteSocialQuickLinks({ settings }: SiteSocialQuickLinksProps) {
  const brandName = settings?.brandName ?? "ParkChargeEV";
  const socialLinks: Array<{
    key: SocialBrandKey;
    label: string;
    href: string;
  }> = [
    {
      key: "instagram" as const,
      label: "Instagram",
      href: normalizeExternalHref(settings?.socials.instagram)
    },
    {
      key: "facebook" as const,
      label: "Facebook",
      href: normalizeExternalHref(settings?.socials.facebook)
    },
    {
      key: "linkedin" as const,
      label: "LinkedIn",
      href: normalizeExternalHref(settings?.socials.linkedin)
    },
    {
      key: "youtube" as const,
      label: "YouTube",
      href: normalizeExternalHref(settings?.socials.youtube)
    },
    {
      key: "whatsapp" as const,
      label: "WhatsApp",
      href: normalizeWhatsAppHref(settings?.whatsappPhone)
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
            data-platform={item.key}
            className="site-social-quick-links__item"
          >
            <SocialBrandIcon platform={item.key} className="site-social-quick-links__icon" />
          </a>
        ))}
      </div>
    </aside>
  );
}
