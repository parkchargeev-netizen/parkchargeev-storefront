import { NextResponse } from "next/server";

import { absoluteUrl } from "@/lib/site";
import { inferProductMediaType } from "@/lib/product-media";
import { requireAdminRole } from "@/server/auth/guards";
import {
  countMediaAssetChunks,
  startChunkedMediaAsset,
  storeMediaAssetChunk
} from "@/server/media-assets";

export const runtime = "nodejs";

const maxVideoUploadBytes = 80 * 1024 * 1024;
const maxChunkUploadBytes = 2 * 1024 * 1024;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() ?? "bin";
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "media"}.${extension}`;
}

function formatBytes(bytes: number) {
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;
}

function getString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function getInteger(formData: FormData, field: string) {
  const value = Number(getString(formData, field));

  return Number.isInteger(value) ? value : null;
}

function getPublicDatabaseMediaUrl(pathname: string, request: Request) {
  if (process.env.NODE_ENV !== "production") {
    return new URL(pathname, request.url).toString();
  }

  return absoluteUrl(pathname);
}

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "admin", "product_manager"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const assetId = getString(formData, "assetId");
    const fileName = sanitizeFileName(getString(formData, "fileName") || "video.mp4");
    const mimeType = getString(formData, "mimeType") || "video/mp4";
    const chunkIndex = getInteger(formData, "chunkIndex");
    const totalChunks = getInteger(formData, "totalChunks");
    const totalSize = getInteger(formData, "totalSize");
    const chunk = formData.get("chunk");

    if (!uuidPattern.test(assetId)) {
      return NextResponse.json({ ok: false, message: "Geçersiz medya oturumu." }, { status: 400 });
    }

    if (!(chunk instanceof File)) {
      return NextResponse.json({ ok: false, message: "Video parçası bulunamadı." }, { status: 400 });
    }

    if (!mimeType.startsWith("video/")) {
      return NextResponse.json({ ok: false, message: "Bu uç nokta sadece video yükleme içindir." }, { status: 400 });
    }

    if (
      chunkIndex === null ||
      totalChunks === null ||
      totalSize === null ||
      chunkIndex < 0 ||
      totalChunks < 1 ||
      chunkIndex >= totalChunks
    ) {
      return NextResponse.json({ ok: false, message: "Video parça bilgisi geçersiz." }, { status: 400 });
    }

    if (totalSize > maxVideoUploadBytes) {
      return NextResponse.json(
        { ok: false, message: `Video yükleme sınırı ${formatBytes(maxVideoUploadBytes)}.` },
        { status: 413 }
      );
    }

    if (chunk.size > maxChunkUploadBytes) {
      return NextResponse.json(
        { ok: false, message: `Video parçası çok büyük. Parça sınırı ${formatBytes(maxChunkUploadBytes)}.` },
        { status: 413 }
      );
    }

    const bytes = Buffer.from(await chunk.arrayBuffer());

    await startChunkedMediaAsset({
      id: assetId,
      fileName,
      mimeType,
      byteSize: totalSize
    });
    await storeMediaAssetChunk({
      mediaAssetId: assetId,
      chunkIndex,
      byteSize: bytes.byteLength,
      data: bytes
    });

    const receivedChunks = await countMediaAssetChunks(assetId);
    const done = receivedChunks >= totalChunks;
    const mediaPath = `/api/media/${assetId}`;

    return NextResponse.json({
      ok: true,
      done,
      receivedChunks,
      totalChunks,
      url: done ? getPublicDatabaseMediaUrl(mediaPath, request) : undefined,
      path: done ? mediaPath : undefined,
      bucket: "database-media-chunked",
      mediaType: inferProductMediaType(fileName, mimeType)
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Video yükleme tamamlanamadı."
      },
      { status: 500 }
    );
  }
}
