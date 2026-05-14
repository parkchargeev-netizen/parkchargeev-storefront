import { NextResponse } from "next/server";

import {
  getAdminAuthConfig,
  getRuntimeConfigErrorPayload,
  hasDatabaseConfig,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { logError, logInfo, logWarn } from "@/lib/server-logger";
import {
  authenticateBootstrapAdmin,
  createAdminSessionRecord,
  ensureBootstrapAdmin,
  findAdminByEmail,
  getBootstrapAdmin
} from "@/server/admin/auth-service";
import { adminLoginSchema } from "@/server/admin/validators";
import { verifyPassword } from "@/server/auth/password";
import { getRequestMeta } from "@/server/auth/guards";
import { signAdminSessionToken } from "@/server/auth/session";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const loginWindowMs = 10 * 60 * 1000;
const maxLoginAttempts = 8;

function getRateLimitKey(email: string, ipAddress?: string | null) {
  return `${ipAddress ?? "unknown"}:${email.toLowerCase()}`;
}

function isLoginRateLimited(email: string, ipAddress?: string | null) {
  const key = getRateLimitKey(email, ipAddress);
  const now = Date.now();
  const current = loginAttempts.get(key);

  if (!current || current.resetAt <= now) {
    return false;
  }

  return current.count >= maxLoginAttempts;
}

function recordLoginFailure(email: string, ipAddress?: string | null) {
  const key = getRateLimitKey(email, ipAddress);
  const now = Date.now();
  const current = loginAttempts.get(key);

  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, {
      count: 1,
      resetAt: now + loginWindowMs
    });
    return;
  }

  loginAttempts.set(key, {
    count: current.count + 1,
    resetAt: current.resetAt
  });
}

function clearLoginFailures(email: string, ipAddress?: string | null) {
  loginAttempts.delete(getRateLimitKey(email, ipAddress));
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const payload = adminLoginSchema.parse(await request.json());
    const loginPassword = payload.password.trim();
    const requestMeta = await getRequestMeta();

    if (isLoginRateLimited(payload.email, requestMeta.ipAddress)) {
      logWarn("admin.login.rate_limited", {
        ipAddress: requestMeta.ipAddress,
        userAgent: requestMeta.userAgent
      });

      return NextResponse.json(
        {
          ok: false,
          message: "Çok fazla başarısız giriş denemesi yapıldı. Lütfen birkaç dakika sonra tekrar deneyin."
        },
        { status: 429 }
      );
    }

    if (!hasDatabaseConfig()) {
      const bootstrapAdmin = authenticateBootstrapAdmin(payload.email, loginPassword);

      if (!bootstrapAdmin) {
        recordLoginFailure(payload.email, requestMeta.ipAddress);
        logWarn("admin.login.failed", {
          mode: "bootstrap",
          ipAddress: requestMeta.ipAddress,
          userAgent: requestMeta.userAgent,
          durationMs: Date.now() - startedAt
        });
        return NextResponse.json(
          {
            ok: false,
            message: "E-posta veya şifre hatalı."
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

      clearLoginFailures(payload.email, requestMeta.ipAddress);
      logInfo("admin.login.succeeded", {
        mode: "bootstrap",
        role: bootstrapAdmin.role,
        ipAddress: requestMeta.ipAddress,
        durationMs: Date.now() - startedAt
      });
      return response;
    }

    const normalizedEmail = payload.email.toLowerCase();
    const bootstrapConfig = getBootstrapAdmin();
    const isBootstrapLogin =
      bootstrapConfig?.email === normalizedEmail && bootstrapConfig.password === loginPassword;
    let admin = await findAdminByEmail(payload.email);

    if (!admin && isBootstrapLogin) {
      admin = await ensureBootstrapAdmin({ forceRefresh: true });
    }

    let passwordVerified = admin ? verifyPassword(loginPassword, admin.passwordHash) : false;

    if (admin && isBootstrapLogin && !passwordVerified) {
      admin = await ensureBootstrapAdmin({ forceRefresh: true });
      passwordVerified = admin ? verifyPassword(loginPassword, admin.passwordHash) : false;
    }

    if (!admin || admin.status !== "active" || !passwordVerified) {
      recordLoginFailure(payload.email, requestMeta.ipAddress);
      logWarn("admin.login.failed", {
        mode: "database",
        ipAddress: requestMeta.ipAddress,
        userAgent: requestMeta.userAgent,
        durationMs: Date.now() - startedAt
      });
      return NextResponse.json(
        {
          ok: false,
          message: "E-posta veya şifre hatalı."
        },
        { status: 401 }
      );
    }

    const { sessionTtlSeconds, cookieName } = getAdminAuthConfig();
    const expiresAt = new Date(Date.now() + sessionTtlSeconds * 1000);
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

    clearLoginFailures(payload.email, requestMeta.ipAddress);
    logInfo("admin.login.succeeded", {
      mode: "database",
      role: admin.role,
      ipAddress: requestMeta.ipAddress,
      durationMs: Date.now() - startedAt
    });
    return response;
  } catch (error) {
    if (isRuntimeConfigError(error)) {
      logWarn("admin.login.runtime_config_error", {
        area: error.area,
        missingKeys: error.missingKeys
      });

      return NextResponse.json(getRuntimeConfigErrorPayload(error), {
        status: 503
      });
    }

    logError("admin.login.failed_unexpected", error);

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Giriş sırasında beklenmeyen bir hata oluştu."
      },
      { status: 500 }
    );
  }
}
