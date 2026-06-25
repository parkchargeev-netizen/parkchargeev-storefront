import { eq, sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { mediaAssets } from "@/server/db/schema";

type StoreMediaAssetInput = {
  id: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  data: Buffer;
};

export async function ensureMediaAssetsTable() {
  const db = getDb();

  await db.execute(sql`
    create table if not exists media_assets (
      id uuid primary key,
      file_name varchar(180) not null,
      mime_type varchar(120) not null,
      byte_size integer not null,
      data bytea not null,
      created_at timestamptz not null default now()
    )
  `);
  await db.execute(sql`create index if not exists media_assets_created_at_idx on media_assets (created_at)`);

  return db;
}

export async function storeMediaAsset(input: StoreMediaAssetInput) {
  const db = await ensureMediaAssetsTable();

  await db.insert(mediaAssets).values(input);
}

export async function getMediaAssetById(id: string) {
  const db = await ensureMediaAssetsTable();
  const [asset] = await db
    .select({
      data: mediaAssets.data,
      fileName: mediaAssets.fileName,
      mimeType: mediaAssets.mimeType,
      byteSize: mediaAssets.byteSize
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);

  return asset ?? null;
}
