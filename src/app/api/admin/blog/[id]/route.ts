import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminBlogPostById, upsertAdminBlogPost } from "@/server/admin/repository";
import { isValidationError, validationErrorResponse } from "@/server/admin/http";
import { adminBlogPostSchema } from "@/server/admin/validators";
import { getRequestMeta, requireAdminRole } from "@/server/auth/guards";

type BlogPostRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const blogPostIdSchema = z.string().uuid();

export async function GET(_request: Request, { params }: BlogPostRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "editor"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  let id: string;

  try {
    id = blogPostIdSchema.parse((await params).id);
  } catch (error) {
    if (isValidationError(error)) {
      return validationErrorResponse(error, "Geçersiz içerik kimliği.");
    }

    throw error;
  }

  const post = await getAdminBlogPostById(id);

  if (!post) {
    return NextResponse.json({ ok: false, message: "Icerik bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, post });
}

export async function PATCH(request: Request, { params }: BlogPostRouteProps) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "editor"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  try {
    const id = blogPostIdSchema.parse((await params).id);
    const payload = adminBlogPostSchema.parse({
      ...(await request.json()),
      id
    });
    const requestMeta = await getRequestMeta();
    const post = await upsertAdminBlogPost(payload, authenticatedAdmin.session, requestMeta);

    if (!post) {
      return NextResponse.json({ ok: false, message: "Icerik bulunamadi." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    if (isValidationError(error)) {
      return validationErrorResponse(error);
    }

    throw error;
  }
}
