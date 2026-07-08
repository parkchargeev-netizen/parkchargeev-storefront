export type SocialBrandKey = "instagram" | "facebook" | "linkedin" | "youtube" | "whatsapp";

type SocialBrandIconProps = {
  platform: SocialBrandKey;
  className?: string;
};

export function SocialBrandIcon({ platform, className = "" }: SocialBrandIconProps) {
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="4.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="16.8" cy="7.2" r="1.15" fill="currentColor" />
      </svg>
    );
  }

  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M14.3 8.5V7.2c0-.8.3-1.2 1.3-1.2H18V2.2c-.5-.1-1.9-.2-3.4-.2-3.4 0-5.7 2-5.7 5.7v.8H5.5v4.2h3.4V22h4.5v-9.3h3.5l.6-4.2h-4.1Z"
        />
      </svg>
    );
  }

  if (platform === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M6.7 8.8H3V21h3.7V8.8ZM4.9 3C3.7 3 2.8 3.9 2.8 5s.9 2 2.1 2C6 7 7 6.1 7 5s-1-2-2.1-2Zm16.2 11.3c0-3.3-1.8-5.8-5-5.8-1.6 0-2.7.9-3.2 1.7h-.1V8.8H9.3V21H13v-6c0-1.6.3-3.2 2.3-3.2 1.9 0 2 1.8 2 3.3V21H21v-6.7Z"
        />
      </svg>
    );
  }

  if (platform === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12 2.2A9.7 9.7 0 0 0 3.7 17l-1 4.1 4.2-1A9.7 9.7 0 1 0 12 2.2Zm0 17.5a7.8 7.8 0 0 1-4-1.1l-.3-.2-2.5.6.7-2.4-.2-.3A7.8 7.8 0 1 1 12 19.7Zm4.4-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.5-1.8-.1-.2 0-.4.1-.5l.4-.4c.1-.2.2-.3.3-.5.1-.2.1-.3 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .2-1.1-.1-.1-.2-.2-.4-.3Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M21.6 7.1s-.2-1.5-.8-2.1c-.8-.8-1.6-.8-2-.9C16 3.9 12 3.9 12 3.9s-4 0-6.8.2c-.4.1-1.2.1-2 .9-.6.6-.8 2.1-.8 2.1S2.2 8.9 2.2 10.7v1.7c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.1c.8.8 1.8.8 2.3.9 1.7.2 6.5.2 6.5.2s4 0 6.8-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.6v-1.7c0-1.8-.2-3.6-.2-3.6ZM9.9 14.6V8.4l5.7 3.1-5.7 3.1Z"
      />
    </svg>
  );
}
