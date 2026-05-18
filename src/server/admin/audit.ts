import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { logWarn } from "@/lib/server-logger";
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

function getErrorCode(error: unknown) {
  return typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code)
    : null;
}

async function writeAuditLog(input: AuditInput, actorAdminId: string | null) {
  await input.db.insert(schema.auditLogs).values({
    actorAdminId,
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

export async function recordAuditLog(input: AuditInput) {
  const actorAdminId = input.actor?.sub ?? null;

  try {
    await writeAuditLog(input, actorAdminId);
  } catch (error) {
    if (actorAdminId && getErrorCode(error) === "23503") {
      logWarn("admin.audit.actor_reference_missing", {
        actorAdminId,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action
      });

      try {
        await writeAuditLog(input, null);
      } catch (retryError) {
        logWarn("admin.audit.write_failed", {
          entityType: input.entityType,
          entityId: input.entityId,
          action: input.action,
          message: retryError instanceof Error ? retryError.message : "unknown"
        });
      }

      return;
    }

    logWarn("admin.audit.write_failed", {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      message: error instanceof Error ? error.message : "unknown"
    });
  }
}
