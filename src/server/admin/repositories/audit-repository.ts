import { and, desc, eq, gte, ilike, lt, or } from "drizzle-orm";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { getDb } from "@/server/db/client";
import { adminUsers, auditLogs } from "@/server/db/schema";
import {
  decodeCursor,
  encodeCursor,
  parseFilterDate,
  type ListQueryInput
} from "@/server/admin/repositories/query";

export async function listAdminAuditLogs(input: ListQueryInput) {
  if (!hasDatabaseConfig()) return { items: [], nextCursor: null };

  const db = getDb();
  const cursor = decodeCursor(input.cursor);
  const conditions = [];

  if (input.q) {
    conditions.push(
      or(
        ilike(auditLogs.entityType, `%${input.q}%`),
        ilike(auditLogs.entityId, `%${input.q}%`),
        ilike(auditLogs.action, `%${input.q}%`),
        ilike(auditLogs.summary, `%${input.q}%`)
      )
    );
  }
  if (input.status) conditions.push(eq(auditLogs.entityType, input.status));

  const fromDate = parseFilterDate(input.from);
  const toDate = parseFilterDate(input.to, true);
  if (fromDate) conditions.push(gte(auditLogs.createdAt, fromDate));
  if (toDate) conditions.push(lt(auditLogs.createdAt, toDate));
  if (cursor) {
    conditions.push(
      or(
        lt(auditLogs.createdAt, new Date(cursor.updatedAt)),
        and(eq(auditLogs.createdAt, new Date(cursor.updatedAt)), lt(auditLogs.id, cursor.id))
      )
    );
  }

  const rows = await db
    .select({
      id: auditLogs.id,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      action: auditLogs.action,
      summary: auditLogs.summary,
      beforePayload: auditLogs.beforePayload,
      afterPayload: auditLogs.afterPayload,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      createdAt: auditLogs.createdAt,
      actorName: adminUsers.fullName,
      actorEmail: adminUsers.email
    })
    .from(auditLogs)
    .leftJoin(adminUsers, eq(adminUsers.id, auditLogs.actorAdminId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
    .limit(input.limit + 1);

  const hasMore = rows.length > input.limit;
  const items = hasMore ? rows.slice(0, input.limit) : rows;

  return {
    items,
    nextCursor: hasMore
      ? encodeCursor({
          updatedAt: items.at(-1)?.createdAt.toISOString() ?? new Date().toISOString(),
          id: items.at(-1)?.id ?? ""
        })
      : null
  };
}

