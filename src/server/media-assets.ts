import { eq, sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { mediaAssetChunks, mediaAssets } from "@/server/db/schema";

type StoreMediaAssetInput = {
  id: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  data: Buffer;
};

type StartChunkedMediaAssetInput = Omit<StoreMediaAssetInput, "data">;

type StoreMediaAssetChunkInput = {
  mediaAssetId: string;
  chunkIndex: number;
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
  await db.execute(sql`
    create table if not exists media_asset_chunks (
      media_asset_id uuid not null references media_assets(id) on delete cascade,
      chunk_index integer not null,
      byte_size integer not null,
      data bytea not null,
      created_at timestamptz not null default now(),
      primary key (media_asset_id, chunk_index)
    )
  `);
  await db.execute(sql`create index if not exists media_asset_chunks_asset_idx on media_asset_chunks (media_asset_id)`);

  return db;
}

export async function storeMediaAsset(input: StoreMediaAssetInput) {
  const db = await ensureMediaAssetsTable();

  await db.insert(mediaAssets).values(input);
}

export async function startChunkedMediaAsset(input: StartChunkedMediaAssetInput) {
  const db = await ensureMediaAssetsTable();

  await db
    .insert(mediaAssets)
    .values({
      ...input,
      data: Buffer.alloc(0)
    })
    .onConflictDoNothing();
}

export async function storeMediaAssetChunk(input: StoreMediaAssetChunkInput) {
  const db = await ensureMediaAssetsTable();

  await db
    .insert(mediaAssetChunks)
    .values(input)
    .onConflictDoUpdate({
      target: [mediaAssetChunks.mediaAssetId, mediaAssetChunks.chunkIndex],
      set: {
        byteSize: input.byteSize,
        data: input.data
      }
    });
}

export async function countMediaAssetChunks(mediaAssetId: string) {
  const db = await ensureMediaAssetsTable();
  const rows = await db.execute<{ count: string }>(sql`
    select count(*)::text as count
    from media_asset_chunks
    where media_asset_id = ${mediaAssetId}
  `);

  return Number(rows[0]?.count ?? 0);
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

export async function listMediaAssetChunks(mediaAssetId: string) {
  const db = await ensureMediaAssetsTable();

  return db
    .select({
      data: mediaAssetChunks.data,
      byteSize: mediaAssetChunks.byteSize,
      chunkIndex: mediaAssetChunks.chunkIndex
    })
    .from(mediaAssetChunks)
    .where(eq(mediaAssetChunks.mediaAssetId, mediaAssetId))
    .orderBy(mediaAssetChunks.chunkIndex);
}
