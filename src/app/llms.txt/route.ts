import { generateLlmsText } from "@/lib/ai-discovery";

export const revalidate = 3600;

export function GET() {
  return new Response(generateLlmsText(), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
