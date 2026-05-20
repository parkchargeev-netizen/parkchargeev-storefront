import { getArticleBySlug } from "@/lib/mock-data";
import { renderArticleMarkdown } from "@/lib/markdown";

export const revalidate = 3600;

type ArticleMarkdownRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: ArticleMarkdownRouteProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return new Response("Article not found", { status: 404 });
  }

  return new Response(renderArticleMarkdown(article), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
