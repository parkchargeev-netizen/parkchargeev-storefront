export type ProductMediaKind = "image" | "video";

const videoFilePattern = /\.(mp4|webm|ogg|ogv|mov|m4v)(?:[?#].*)?$/i;
const videoHostPattern = /(youtube\.com|youtu\.be|vimeo\.com)/i;

export function inferProductMediaType(
  url?: string | null,
  contentType?: string | null
): ProductMediaKind {
  const normalizedContentType = contentType?.toLocaleLowerCase("tr-TR") ?? "";

  if (normalizedContentType.startsWith("video/")) {
    return "video";
  }

  const normalizedUrl = url?.trim() ?? "";

  if (videoFilePattern.test(normalizedUrl) || videoHostPattern.test(normalizedUrl)) {
    return "video";
  }

  return "image";
}

export function getDisplayProductImageUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return undefined;
  }

  const normalizedUrl = imageUrl.toLocaleLowerCase("tr-TR");

  if (normalizedUrl.includes("placehold.co") || normalizedUrl.includes("/api/og/")) {
    return undefined;
  }

  return imageUrl;
}

const optimizableRemoteHostMatchers = [
  (hostname: string) => hostname === "parkchargeev.com",
  (hostname: string) => hostname.endsWith(".vercel.app"),
  (hostname: string) => hostname.endsWith(".supabase.co")
];

export function shouldBypassImageOptimization(imageUrl?: string | null) {
  if (!imageUrl) {
    return true;
  }

  const normalizedUrl = imageUrl.trim();

  if (!normalizedUrl || normalizedUrl.startsWith("data:") || normalizedUrl.startsWith("blob:")) {
    return true;
  }

  if (normalizedUrl.startsWith("/")) {
    return false;
  }

  try {
    const { hostname, protocol } = new URL(normalizedUrl);

    if (protocol !== "https:") {
      return true;
    }

    return !optimizableRemoteHostMatchers.some((matcher) => matcher(hostname));
  } catch {
    return true;
  }
}
