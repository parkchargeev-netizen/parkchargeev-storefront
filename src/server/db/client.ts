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
    prepare: false,
    max: 3,
    connect_timeout: 10,
    idle_timeout: 20
  });

  database = drizzle(client, { schema });
  return database;
}
