export function slugify(input: string) {
  return input
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ç|Ã§/g, "c")
    .replace(/ğ|ÄŸ/g, "g")
    .replace(/ı|Ä±/g, "i")
    .replace(/ö|Ã¶/g, "o")
    .replace(/ş|ÅŸ/g, "s")
    .replace(/ü|Ã¼/g, "u")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
