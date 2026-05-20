import { getProductBySlug } from "@/lib/mock-data";
import { renderProductMarkdown } from "@/lib/markdown";

export const revalidate = 3600;

type ProductMarkdownRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: ProductMarkdownRouteProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return new Response("Product not found", { status: 404 });
  }

  return new Response(renderProductMarkdown(product), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
