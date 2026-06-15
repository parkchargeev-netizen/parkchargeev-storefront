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
