export const freeSurveyCities = ["Sakarya"] as const;
export const installationCities = ["Sakarya", "Kocaeli"] as const;
export const leadCityOptions = Array.from(
  new Set([...freeSurveyCities, ...installationCities])
);

export const serviceCoverageSummary = {
  shipping: "Ürün kargosu: 81 il",
  freeSurvey: "Ücretsiz keşif: Sakarya",
  installation: "Kurulum: Sakarya ve Kocaeli",
  note:
    "Ürün kargosu Türkiye'nin 81 iline yapılır; ücretsiz keşif yalnızca Sakarya, kurulum hizmeti Sakarya ve Kocaeli için planlanır."
} as const;

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
}

function normalizeSearchText(value: string) {
  return normalizeText(value)
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function matchesCity(value: string, cities: readonly string[]) {
  const normalizedCity = normalizeText(value);
  return cities.some((city) => normalizeText(city) === normalizedCity);
}

export function isFreeSurveyCity(value: string) {
  return matchesCity(value, freeSurveyCities);
}

export function isInstallationCity(value: string) {
  return matchesCity(value, installationCities);
}

export function isFreeSurveyReason(reason: string) {
  const normalized = normalizeSearchText(reason);
  return normalized.includes("ucretsiz") && normalized.includes("kesif");
}

export function isInstallationReason(reason: string) {
  const normalized = normalizeSearchText(reason);
  return normalized.includes("kurulum") || normalized.includes("montaj");
}

export function validateLeadServiceCoverage(reason: string, city: string) {
  if (isFreeSurveyReason(reason) && !isFreeSurveyCity(city)) {
    return {
      ok: false,
      message:
        "Ücretsiz keşif talebi şu an yalnızca Sakarya için alınabiliyor. Ürün kargosu 81 ile yapılır; kurulum talepleri Sakarya ve Kocaeli için değerlendiriliyor."
    };
  }

  if (isInstallationReason(reason) && !isInstallationCity(city)) {
    return {
      ok: false,
      message:
        "Kurulum hizmeti şu an Sakarya ve Kocaeli için planlanıyor. Ürün kargosu 81 ile yapılır; satın alma ve genel bilgi talepleriniz için bize yazabilirsiniz."
    };
  }

  return { ok: true, message: "" };
}

export function getLeadCoverageHelp(reason: string) {
  if (isFreeSurveyReason(reason)) {
    return "Ücretsiz keşif yalnızca Sakarya için planlanır.";
  }

  if (isInstallationReason(reason)) {
    return "Kurulum hizmeti Sakarya ve Kocaeli için planlanır.";
  }

  return serviceCoverageSummary.note;
}
