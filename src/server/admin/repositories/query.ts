import type { z } from "zod";

import type { adminListQuerySchema } from "@/server/admin/validators";

export type ListQueryInput = z.infer<typeof adminListQuerySchema>;

type CursorPayload = {
  updatedAt: string;
  id: string;
};

export function encodeCursor(payload: CursorPayload) {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

export function decodeCursor(cursor?: string) {
  if (!cursor) return null;

  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as CursorPayload;
  } catch {
    return null;
  }
}

export function parseFilterDate(value?: string, endOfDay = false) {
  if (!value) return null;
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay && !value.includes("T")) date.setDate(date.getDate() + 1);

  return date;
}

