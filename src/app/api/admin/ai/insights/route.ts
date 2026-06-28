import { NextResponse } from "next/server";

import { listAdminAiInsights, listAdminAiRuns } from "@/server/admin/ai-operations";
import { adminListQuerySchema } from "@/server/admin/validators";
import { requireAdminRole } from "@/server/auth/guards";

function parseListQuery(request: Request) {
  const url = new URL(request.url);
  return adminListQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
}

export async function GET(request: Request) {
  await requireAdminRole([
    "superadmin",
    "admin",
    "product_manager",
    "order_manager",
    "support_agent",
    "readonly"
  ]);

  const query = parseListQuery(request);
  const [insights, runs] = await Promise.all([listAdminAiInsights(query), listAdminAiRuns(query)]);

  return NextResponse.json({ ok: true, insights, runs });
}
