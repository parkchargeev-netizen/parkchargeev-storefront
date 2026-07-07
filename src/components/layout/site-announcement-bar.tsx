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

function createLoopMessages(messages: string[]) {
  if (messages.length >= 4) {
    return messages;
  }

  return Array.from({ length: Math.ceil(4 / messages.length) }, () => messages).flat();
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
  const loopMessages = createLoopMessages(messages);
  const content = (
    <div className="site-announcement-viewport">
      <div className="site-announcement-marquee">
        {[0, 1].map((groupIndex) => (
          <div
            key={groupIndex}
            className="site-announcement-track"
            aria-hidden={groupIndex === 1}
          >
            {loopMessages.map((message, index) => (
              <span key={`${groupIndex}-${message}-${index}`} className="site-announcement-item">
                <span className="site-announcement-dot" aria-hidden />
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
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
