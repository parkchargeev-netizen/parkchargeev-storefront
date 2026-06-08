export const contactReasons = [
  "Ücretsiz keşif talebi",
  "Ev tipi kurulum talebi",
  "İş yeri / ofis projesi",
  "Site / apartman çözümü",
  "Filo / otopark projesi",
  "Teknik servis ve bakım",
  "Bayilik / iş ortaklığı",
  "Genel bilgi talebi"
] as const;

export type ContactReason = (typeof contactReasons)[number];

function normalizeReason(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export function resolveContactReason(value?: string | null): ContactReason | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = normalizeReason(value);
  const directMatch = contactReasons.find((reason) => normalizeReason(reason) === normalized);

  if (directMatch) {
    return directMatch;
  }

  if (normalized.includes("ucretsiz") && normalized.includes("kesif")) {
    return "Ücretsiz keşif talebi";
  }

  if (normalized.includes("site") || normalized.includes("apartman")) {
    return "Site / apartman çözümü";
  }

  if (normalized.includes("is yeri") || normalized.includes("ofis") || normalized.includes("kurumsal")) {
    return "İş yeri / ofis projesi";
  }

  if (normalized.includes("filo") || normalized.includes("otopark")) {
    return "Filo / otopark projesi";
  }

  if (normalized.includes("servis") || normalized.includes("bakim") || normalized.includes("destek")) {
    return "Teknik servis ve bakım";
  }

  if (normalized.includes("kurulum") || normalized.includes("montaj")) {
    return "Ev tipi kurulum talebi";
  }

  return "Genel bilgi talebi";
}
