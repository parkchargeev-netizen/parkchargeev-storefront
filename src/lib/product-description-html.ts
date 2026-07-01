function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sanitizeProductDescriptionHtml(description: string) {
  return description
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*')/gi, "")
    .replace(/\sstyle=(?:"[^"]*"|'[^']*')/gi, "")
    .replace(/href=(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="/"');
}

export function formatProductDescriptionHtml(description: string, summary: string) {
  const normalizedDescription = description.trim();
  const normalizedSummary = summary.trim();
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(normalizedDescription);
  const descriptionHtml = hasHtml
    ? sanitizeProductDescriptionHtml(normalizedDescription)
    : normalizedDescription
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join("");

  if (!normalizedSummary) {
    return descriptionHtml;
  }

  const plainDescription = normalizedDescription.replace(/<[^>]+>/g, " ");
  const alreadyIncludesSummary = plainDescription
    .toLocaleLowerCase("tr-TR")
    .includes(normalizedSummary.toLocaleLowerCase("tr-TR"));

  return alreadyIncludesSummary
    ? descriptionHtml
    : `${descriptionHtml}<p>${escapeHtml(normalizedSummary)}</p>`;
}
