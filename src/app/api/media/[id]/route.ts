import { getMediaAssetById } from "@/server/media-assets";

export const runtime = "nodejs";

type MediaAssetRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: MediaAssetRouteProps) {
  const { id } = await params;

  if (!uuidPattern.test(id)) {
    return new Response("Media not found", { status: 404 });
  }

  const asset = await getMediaAssetById(id);

  if (!asset) {
    return new Response("Media not found", { status: 404 });
  }

  const body = asset.data instanceof Buffer ? asset.data : Buffer.from(asset.data);
  const mediaBody = new Blob([new Uint8Array(body)], { type: asset.mimeType });

  return new Response(mediaBody, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${asset.fileName.replace(/"/g, "")}"`,
      "Content-Length": String(asset.byteSize),
      "Content-Type": asset.mimeType
    }
  });
}
