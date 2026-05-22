const turkishCharacterMap: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u"
};

export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüâîû]/g, (character) => turkishCharacterMap[character] ?? character)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getSearchTokens(query: string) {
  return normalizeSearchText(query)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

export function matchesSearchQuery(fields: Array<string | string[] | null | undefined>, query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return false;
  }

  const normalizedContent = normalizeSearchText(fields.flat().filter(Boolean).join(" "));

  if (normalizedContent.includes(normalizedQuery)) {
    return true;
  }

  const tokens = getSearchTokens(query);
  return tokens.length > 0 && tokens.every((token) => normalizedContent.includes(token));
}
