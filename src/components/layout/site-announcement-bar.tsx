import Link from "next/link";

import type { PublicSiteSettings, SiteAnnouncementTone } from "@/lib/site-settings";

type SiteAnnouncementBarProps = {
  settings?: PublicSiteSettings;
};

const toneClassNames: Record<SiteAnnouncementTone, string> = {
  emerald: "site-announcement-bar--emerald",
  amber: "site-announcement-bar--amber",
  slate: "site-announcement-bar--slate"
};

function normalizeMessages(settings?: PublicSiteSettings) {
  return (settings?.shippingSettings.announcement?.messages ?? [])
    .map((message) => message.trim())
    .filter(Boolean);
}

export function SiteAnnouncementBar({ settings }: SiteAnnouncementBarProps) {
  const announcement = settings?.shippingSettings.announcement;
  const messages = normalizeMessages(settings);

  if (!announcement?.isActive || messages.length === 0) {
    return null;
  }

  const toneKey =
    announcement.tone && announcement.tone in toneClassNames ? announcement.tone : "emerald";
  const tone = toneClassNames[toneKey];
  const duplicatedMessages = [...messages, ...messages];
  const content = (
    <div className="site-announcement-track" aria-hidden={false}>
      {duplicatedMessages.map((message, index) => (
        <span key={`${message}-${index}`} className="site-announcement-item">
          <span className="site-announcement-dot" aria-hidden />
          {message}
        </span>
      ))}
    </div>
  );

  return (
    <div className={`site-announcement-bar ${tone}`} role="region" aria-label="Kampanya duyuruları">
      {announcement.href ? (
        <Link href={announcement.href} prefetch={false} className="site-announcement-link">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
