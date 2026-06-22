const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#063326"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#78f2c5" stroke-width="5"/>
  <path d="M22 35c0-8 5-14 10-14s10 6 10 14" fill="none" stroke="#78f2c5" stroke-width="5" stroke-linecap="round"/>
  <path d="M34 20 25 35h7l-3 10 10-16h-7l2-9Z" fill="#78f2c5"/>
</svg>`;

export function GET() {
  return new Response(faviconSvg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
