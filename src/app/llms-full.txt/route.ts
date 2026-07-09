import { generateLlmsFullText } from "@/lib/ai-discovery";

export const revalidate = 3600;

export async function GET() {
  return new Response(await generateLlmsFullText(), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
