import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  getRuntimeConfigErrorPayload,
  getSupabaseServerConfig,
  isRuntimeConfigError
} from "@/lib/runtime-config";
import { requireAdminRole } from "@/server/auth/guards";

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

export async function POST(request: Request) {
  const authenticatedAdmin = await requireAdminRole(["superadmin", "sales", "editor"]);

  if (!authenticatedAdmin) {
    return NextResponse.json({ ok: false, message: "Yetkisiz erisim." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "Dosya bulunamadi." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, message: "Sadece gorsel dosyalari yuklenebilir." }, { status: 400 });
    }

    const config = getSupabaseServerConfig();
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

    const path = `admin/${new Date().toISOString().slice(0, 10)}/${sanitizeFileName(file.name)}`;
    const upload = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type,
      upsert: false
    });

    if (upload.error) {
      return NextResponse.json({ ok: false, message: upload.error.message }, { status: 500 });
    }

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      path,
      bucket
    });
  } catch (error) {
    if (isRuntimeConfigError(error)) {
      return NextResponse.json(getRuntimeConfigErrorPayload(error), { status: 503 });
    }

    return NextResponse.json(
      { ok: false, message: "Medya yukleme tamamlanamadi." },
      { status: 500 }
    );
  }
}
