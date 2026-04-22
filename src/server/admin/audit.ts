import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type { AdminSessionPayload } from "@/server/auth/session";
import * as schema from "@/server/db/schema";

type AuditInput = {
  db: PostgresJsDatabase<typeof schema>;
  actor: AdminSessionPayload | null;
  entityType: string;
  entityId: string;
  action: string;
  summary?: string;
  beforePayload?: unknown;
  afterPayload?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function recordAuditLog(input: AuditInput) {
  await input.db.insert(schema.auditLogs).values({
    actorAdminId: input.actor?.sub ?? null,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    summary: input.summary ?? null,
    beforePayload: input.beforePayload ?? null,
    afterPayload: input.afterPayload ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null
  });
}
