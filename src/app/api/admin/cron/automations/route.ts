import { NextResponse } from "next/server";

import { runScheduledAdminAutomations } from "@/server/admin/ai-operations";

function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.ADMIN_CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim();

  if (!secret) {
    return false;
  }

  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  const querySecret = new URL(request.url).searchParams.get("secret")?.trim();

  return bearer === secret || querySecret === secret;
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ ok: false, message: "Cron yetkisi geçersiz." }, { status: 401 });
  }

  const result = await runScheduledAdminAutomations();

  return NextResponse.json(result);
}
