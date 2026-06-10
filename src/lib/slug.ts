export function slugify(input: string) {
  return input
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ç|\u00c3\u00a7/g, "c")
    .replace(/ğ|\u00c4\u0178/g, "g")
    .replace(/ı|\u00c4\u00b1/g, "i")
    .replace(/ö|\u00c3\u00b6/g, "o")
    .replace(/ş|\u00c5\u0178/g, "s")
    .replace(/ü|\u00c3\u00bc/g, "u")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
