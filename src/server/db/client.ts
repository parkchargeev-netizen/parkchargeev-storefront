import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { assertDatabaseConfig } from "@/lib/runtime-config";
import * as schema from "@/server/db/schema";

let database: PostgresJsDatabase<typeof schema> | undefined;

export function getDb() {
  if (database) {
    return database;
  }

  assertDatabaseConfig();
  const connectionString = process.env.DATABASE_URL as string;

  const client = postgres(connectionString, {
    prepare: false
  });

  database = drizzle(client, { schema });
  return database;
}
