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
