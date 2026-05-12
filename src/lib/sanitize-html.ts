const blockedTagPattern = /<\/?(script|iframe|object|embed|form|input|button|style|link|meta)[^>]*>/gi;
const eventHandlerPattern = /\s+on[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const javascriptUrlPattern = /\s+(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi;

export function sanitizeRichTextHtml(html: string) {
  return html
    .replace(blockedTagPattern, "")
    .replace(eventHandlerPattern, "")
    .replace(javascriptUrlPattern, "");
}
