import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";

import {
  type PublicSiteSettings,
  normalizePublicSiteSettings
} from "@/lib/site-settings";
import { hasDatabaseConfig } from "@/lib/runtime-config";
import { logWarn } from "@/lib/server-logger";
import { getDb } from "@/server/db/client";
import { siteSettings } from "@/server/db/schema";

const SITE_SETTINGS_KEY = "main";

function rowToPublicSiteSettings(
  row: typeof siteSettings.$inferSelect | null | undefined
): PublicSiteSettings {
  if (!row) {
    return normalizePublicSiteSettings(null);
  }

  return normalizePublicSiteSettings({
    id: row.id,
    brandName: row.brandName,
    description: row.description,
    logoUrl: row.logoUrl ?? "",
    logoAlt: row.logoAlt ?? row.brandName,
    phone: row.phone,
    email: row.email,
    whatsappPhone: row.whatsappPhone,
    supportHours: row.supportHours,
    address: {
      streetAddress: row.streetAddress,
      addressLocality: row.addressLocality,
      addressRegion: row.addressRegion,
      postalCode: row.postalCode,
      addressCountry: row.addressCountry
    },
    mapEmbedUrl: row.mapEmbedUrl ?? "",
    serviceAreas: row.serviceAreas,
    socials: row.socials,
    updatedAt: row.updatedAt
  });
}

async function loadPublicSiteSettings() {
  if (!hasDatabaseConfig()) {
    return normalizePublicSiteSettings(null);
  }

  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.singletonKey, SITE_SETTINGS_KEY))
      .limit(1);

    return rowToPublicSiteSettings(row);
  } catch (error) {
    logWarn("public.site_settings.load_failed", {
      message: error instanceof Error ? error.message : "unknown"
    });
    return normalizePublicSiteSettings(null);
  }
}

export const getPublicSiteSettings = unstable_cache(
  loadPublicSiteSettings,
  ["public-site-settings"],
  {
    revalidate: 300,
    tags: ["site-settings"]
  }
);

export { SITE_SETTINGS_KEY, rowToPublicSiteSettings };
