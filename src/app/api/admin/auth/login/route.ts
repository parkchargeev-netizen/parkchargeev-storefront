import { NextResponse } from "next/server";

import {
  getAdminAuthConfig,
  getRuntimeConfigErrorPayload,
  hasDatabaseConfig,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import {
  authenticateBootstrapAdmin,
  createAdminSessionRecord,
  ensureBootstrapAdmin,
  findAdminByEmail
} from "@/server/admin/auth-service";
import { adminLoginSchema } from "@/server/admin/validators";
import { verifyPassword } from "@/server/auth/password";
import { getRequestMeta } from "@/server/auth/guards";
import { signAdminSessionToken } from "@/server/auth/session";

export async function POST(request: Request) {
  try {
    const payload = adminLoginSchema.parse(await request.json());

    if (!hasDatabaseConfig()) {
      const bootstrapAdmin = authenticateBootstrapAdmin(payload.email, payload.password);

      if (!bootstrapAdmin) {
        return NextResponse.json(
          {
            ok: false,
            message: "E-posta veya sifre hatali."
          },
          { status: 401 }
        );
      }

      const { sessionTtlSeconds, cookieName } = getAdminAuthConfig();
      const expiresAt = new Date(Date.now() + sessionTtlSeconds * 1000);
      const token = await signAdminSessionToken({
        sub: bootstrapAdmin.id,
        sid: "bootstrap-session",
        email: bootstrapAdmin.email,
        name: bootstrapAdmin.fullName,
        role: bootstrapAdmin.role
      });

      const response = NextResponse.json({
        ok: true,
        admin: {
          id: bootstrapAdmin.id,
          email: bootstrapAdmin.email,
          fullName: bootstrapAdmin.fullName,
          role: bootstrapAdmin.role
        }
      });

      response.cookies.set(cookieName, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: expiresAt
      });

      return response;
    }

    await ensureBootstrapAdmin();
    const admin = await findAdminByEmail(payload.email);

    if (!admin || admin.status !== "active" || !verifyPassword(payload.password, admin.passwordHash)) {
      return NextResponse.json(
        {
          ok: false,
          message: "E-posta veya sifre hatali."
        },
        { status: 401 }
      );
    }

    const { sessionTtlSeconds, cookieName } = getAdminAuthConfig();
    const expiresAt = new Date(Date.now() + sessionTtlSeconds * 1000);
    const requestMeta = await getRequestMeta();
    const tokenId = await createAdminSessionRecord({
      adminUserId: admin.id,
      expiresAt,
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent
    });

    const token = await signAdminSessionToken({
      sub: admin.id,
      sid: tokenId,
      email: admin.email,
      name: admin.fullName,
      role: admin.role
    });

    const response = NextResponse.json({
      ok: true,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role
      }
    });

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt
    });

    return response;
  } catch (error) {
    if (isRuntimeConfigError(error)) {
      return NextResponse.json(getRuntimeConfigErrorPayload(error), {
        status: 503
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Giris sirasinda beklenmeyen bir hata olustu."
      },
      { status: 500 }
    );
  }
}
