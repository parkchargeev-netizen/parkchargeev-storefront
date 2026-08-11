export const leadCityOptions = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şanlıurfa",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak"
] as const;

export const freeSurveyCities = leadCityOptions;
export const installationCities = leadCityOptions;

export const serviceCoverageSummary = {
  shipping: "Ürün kargosu: 81 il",
  freeSurvey: "Ücretsiz keşif: Sakarya",
  installation: "Kurulum: Sakarya ve Kocaeli",
  note:
    "Türkiye'nin 81 ilinden ürün, keşif ve kurulum talebi oluşturabilirsiniz. Saha uygunluğu ve takvim ekip tarafından teyit edilir."
} as const;

const legacyCharacterMap: Record<string, string> = {
  "Ä±": "i",
  "Ä°": "i",
  "ÄŸ": "g",
  "Äž": "g",
  "Ã¼": "u",
  "Ãœ": "u",
  "ÅŸ": "s",
  "Åž": "s",
  "Ã¶": "o",
  "Ã–": "o",
  "Ã§": "c",
  "Ã‡": "c"
};

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
}

function normalizeSearchText(value: string) {
  return normalizeText(value)
    .replace(/[Ä±Ä°ÄŸÄžÃ¼ÃœÅŸÅžÃ¶Ã–Ã§Ã‡]/g, (character) => legacyCharacterMap[character] ?? character)
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isFreeSurveyCity(value: string) {
  const normalizedCity = normalizeText(value);
  return freeSurveyCities.some((city) => normalizeText(city) === normalizedCity);
}

export function isInstallationCity(value: string) {
  const normalizedCity = normalizeText(value);
  return installationCities.some((city) => normalizeText(city) === normalizedCity);
}

export function isFreeSurveyReason(reason: string) {
  const normalized = normalizeSearchText(reason);
  return normalized.includes("ucretsiz") && normalized.includes("kesif");
}

export function isInstallationReason(reason: string) {
  const normalized = normalizeSearchText(reason);
  return normalized.includes("kurulum") || normalized.includes("montaj");
}

export function validateLeadServiceCoverage(_reason: string, city: string) {
  if (!city.trim()) {
    return {
      ok: false,
      message: "Lütfen talebinizin değerlendirileceği ili belirtin."
    };
  }

  return { ok: true, message: "" };
}

export function getLeadCoverageHelp(reason: string) {
  if (isFreeSurveyReason(reason)) {
    return "Keşif talebinizi Türkiye'nin 81 ilinden iletebilirsiniz.";
  }

  if (isInstallationReason(reason)) {
    return "Kurulum talebinizi Türkiye'nin 81 ilinden iletebilirsiniz.";
  }

  return "Talebinizi iletin, ekip uygun ürün ve hizmet kapsamını netleştirsin.";
}
