import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { inferProductMediaType } from "@/lib/product-media";
import {
  getRuntimeConfigErrorPayload,
  getSupabaseServerConfig,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { requireAdminRole } from "@/server/auth/guards";

export const runtime = "nodejs";

const maxImageUploadBytes = 12 * 1024 * 1024;
const maxVideoUploadBytes = 80 * 1024 * 1024;

function formatBytes(bytes: number) {
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;
}

function sanitizeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() ?? "bin";
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "media"}-${crypto.randomUUID()}.${extension}`;
}

function isSupportedMedia(file: File) {
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

function getMediaValidationMessage(file: File) {
  if (!isSupportedMedia(file)) {
    return "Sadece gorsel veya video dosyalari yuklenebilir.";
  }

  const maxSize = file.type.startsWith("video/") ? maxVideoUploadBytes : maxImageUploadBytes;

  if (file.size > maxSize) {
    return `Dosya cok buyuk. ${file.type.startsWith("video/") ? "Video" : "Gorsel"} yukleme siniri ${formatBytes(maxSize)}.`;
  }

  return null;
}

function getSupabaseSetupPayload(error: unknown) {
  if (!isRuntimeConfigError(error)) {
    return null;
  }

  const payload = getRuntimeConfigErrorPayload(error);

  return {
    ...payload,
    message:
      "Supabase medya yukleme ayari eksik. Vercel Environment Variables icinde NEXT_PUBLIC_SUPABASE_URL (veya SUPABASE_URL) ve SUPABASE_SERVICE_ROLE_KEY tanimli olmalidir.",
    setupAction:
      "Production, Preview ve Development ortamlarina Supabase URL ile service_role key ekleyin; sonra yeniden deploy edin.",
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET?.trim() || "admin-media"
  };
}

async function uploadToLocalPublic(file: File, request: Request) {
  const fileName = sanitizeFileName(file.name);
  const dateFolder = new Date().toISOString().slice(0, 10);
  const publicPath = `/uploads/admin/${dateFolder}/${fileName}`;
  const diskPath = path.join(process.cwd(), "public", "uploads", "admin", dateFolder, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(path.dirname(diskPath), { recursive: true });
  await writeFile(diskPath, bytes);

  return {
    ok: true,
    url: publicPath,
    absoluteUrl: new URL(publicPath, request.url).toString(),
    path: publicPath,
    bucket: "local-public",
    mediaType: inferProductMediaType(publicPath, file.type)
  };
}

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales", "editor"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const validationMessage = file instanceof File ? getMediaValidationMessage(file) : null;

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "Dosya bulunamadı." }, { status: 400 });
    }

    if (validationMessage) {
      return NextResponse.json({ ok: false, message: validationMessage }, { status: 400 });
    }

    if (!isSupportedMedia(file)) {
      return NextResponse.json(
        { ok: false, message: "Sadece görsel veya video dosyaları yüklenebilir." },
        { status: 400 }
      );
    }

    let config: ReturnType<typeof getSupabaseServerConfig>;

    try {
      config = getSupabaseServerConfig();
    } catch (error) {
      if (isRuntimeConfigError(error) && process.env.VERCEL !== "1") {
        return NextResponse.json(await uploadToLocalPublic(file, request));
      }

      const supabaseSetupPayload = getSupabaseSetupPayload(error);

      if (supabaseSetupPayload) {
        return NextResponse.json(supabaseSetupPayload, { status: 503 });
      }

      throw error;
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "admin-media";
    const supabase = createClient(config.url, config.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const bucketCheck = await supabase.storage.getBucket(bucket);

    if (bucketCheck.error) {
      const createResult = await supabase.storage.createBucket(bucket, {
        public: true
      });

      if (createResult.error) {
        return NextResponse.json(
          { ok: false, message: createResult.error.message },
          { status: 500 }
        );
      }
    }

    const uploadPath = `admin/${new Date().toISOString().slice(0, 10)}/${sanitizeFileName(file.name)}`;
    const upload = await supabase.storage.from(bucket).upload(uploadPath, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false
    });

    if (upload.error) {
      return NextResponse.json({ ok: false, message: upload.error.message }, { status: 500 });
    }

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(uploadPath).data.publicUrl;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      path: uploadPath,
      bucket,
      mediaType: inferProductMediaType(publicUrl, file.type)
    });
  } catch (error) {
    const supabaseSetupPayload = getSupabaseSetupPayload(error);

    if (supabaseSetupPayload) {
      return NextResponse.json(supabaseSetupPayload, { status: 503 });
    }

    return NextResponse.json(
      { ok: false, message: "Medya yükleme tamamlanamadı." },
      { status: 500 }
    );
  }
}
