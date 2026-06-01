import { NextResponse } from "next/server";

import { csvResponse } from "@/server/admin/csv";
import { isValidationError, validationErrorResponse } from "@/server/admin/http";
import { listAdminBlogPosts, upsertAdminBlogPost } from "@/server/admin/repository";
import { adminBlogPostSchema, adminListQuerySchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

function parseListQuery(request: Request) {
  const { searchParams } = new URL(request.url);

  return adminListQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    format: searchParams.get("format") ?? undefined,
    limit: searchParams.get("limit") ?? undefined
  });
}

export async function GET(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "editor"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  let query: ReturnType<typeof parseListQuery>;

  try {
    query = parseListQuery(request);
  } catch (error) {
    if (isValidationError(error)) {
      return validationErrorResponse(error);
    }

    throw error;
  }

  const result = await listAdminBlogPosts(query);

  if (query.format === "csv") {
    return csvResponse("blog-posts.csv", result.items, [
      { header: "Baslik", value: (item) => item.title },
      { header: "Slug", value: (item) => item.slug },
      { header: "Yayin", value: (item) => item.publishedAt },
      { header: "Guncelleme", value: (item) => item.updatedAt }
    ]);
  }

  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "editor"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  try {
    const payload = adminBlogPostSchema.parse(await request.json());
    const requestMeta = await getRequestMeta();
    const post = await upsertAdminBlogPost(payload, authenticatedAdmin.session, requestMeta);

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (error) {
    if (isValidationError(error)) {
      return validationErrorResponse(error);
    }

    throw error;
  }
}
