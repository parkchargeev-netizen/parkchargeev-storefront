import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/server/db/schema";

let database: PostgresJsDatabase<typeof schema> | undefined;

export function getDb() {
  if (database) {
    return database;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL tanımlanmadığı için veritabanı bağlantısı kurulamadı.");
  }

  const client = postgres(connectionString, {
    prepare: false
  });

  database = drizzle(client, { schema });
  return database;
}
