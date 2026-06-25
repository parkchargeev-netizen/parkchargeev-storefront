import { getMediaAssetById, listMediaAssetChunks } from "@/server/media-assets";

export const runtime = "nodejs";

type MediaAssetRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseRange(rangeHeader: string | null, byteLength: number) {
  if (!rangeHeader?.startsWith("bytes=") || byteLength <= 0) {
    return null;
  }

  const [startRaw, endRaw] = rangeHeader.slice(6).split("-");
  const suffixLength = !startRaw && endRaw ? Number(endRaw) : null;
  const start = suffixLength
    ? Math.max(byteLength - suffixLength, 0)
    : startRaw
      ? Number(startRaw)
      : 0;
  const end = suffixLength ? byteLength - 1 : endRaw ? Number(endRaw) : byteLength - 1;

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= byteLength
  ) {
    return null;
  }

  return {
    start,
    end: Math.min(end, byteLength - 1)
  };
}

export async function GET(request: Request, { params }: MediaAssetRouteProps) {
  const { id } = await params;

  if (!uuidPattern.test(id)) {
    return new Response("Media not found", { status: 404 });
  }

  const asset = await getMediaAssetById(id);

  if (!asset) {
    return new Response("Media not found", { status: 404 });
  }

  const chunks = await listMediaAssetChunks(id);
  const body = chunks.length
    ? Buffer.concat(
        chunks.map((chunk) =>
          chunk.data instanceof Buffer ? chunk.data : Buffer.from(chunk.data)
        ),
        asset.byteSize
      )
    : asset.data instanceof Buffer
      ? asset.data
      : Buffer.from(asset.data);
  const range = parseRange(request.headers.get("range"), body.byteLength);
  const responseBody = range ? body.subarray(range.start, range.end + 1) : body;
  const mediaBody = new Blob([new Uint8Array(responseBody)], { type: asset.mimeType });
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Disposition": `inline; filename="${asset.fileName.replace(/"/g, "")}"`,
    "Content-Length": String(responseBody.byteLength),
    "Content-Type": asset.mimeType
  });

  if (range) {
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${body.byteLength}`);
  }

  return new Response(mediaBody, {
    status: range ? 206 : 200,
    headers
  });
}
