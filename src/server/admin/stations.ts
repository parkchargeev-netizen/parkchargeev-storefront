import { revalidateTag, unstable_cache } from "next/cache";
import { and, asc, eq, ilike, or } from "drizzle-orm";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { stations as fallbackStations, type StationModel } from "@/lib/mock-data";
import { recordAuditLog } from "@/server/admin/audit";
import type { adminStationSchema } from "@/server/admin/validators";
import type { AdminSessionPayload } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { chargingStations } from "@/server/db/schema";
import type { z } from "zod";

export type AdminStationInput = z.infer<typeof adminStationSchema>;

export type AdminStation = StationModel & {
  externalId: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
};

function fromFallbackStation(station: StationModel, index: number): AdminStation {
  return {
    ...station,
    externalId: station.id,
    isActive: true,
    sortOrder: index
  };
}

function toStationModel(row: typeof chargingStations.$inferSelect): AdminStation {
  return {
    id: row.id,
    externalId: row.externalId,
    name: row.name,
    distance: "",
    status: row.status,
    power: row.power,
    connectorTypes: row.connectorTypes ?? [],
    pricePerKwh: row.pricePerKwh,
    city: row.city,
    district: row.district,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    availableSockets: row.availableSockets,
    totalSockets: row.totalSockets,
    hours: row.hours,
    operator: row.operator,
    amenities: row.amenities ?? [],
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export async function listAdminStations(input: { q?: string } = {}) {
  if (!hasDatabaseConfig()) {
    return fallbackStations.map(fromFallbackStation);
  }

  try {
    const db = getDb();
    const query = input.q?.trim();
    const rows = await db
      .select()
      .from(chargingStations)
      .where(
        query
          ? or(
              ilike(chargingStations.name, `%${query}%`),
              ilike(chargingStations.city, `%${query}%`),
              ilike(chargingStations.district, `%${query}%`),
              ilike(chargingStations.address, `%${query}%`)
            )
          : undefined
      )
      .orderBy(asc(chargingStations.sortOrder), asc(chargingStations.city), asc(chargingStations.name));

    if (rows.length === 0 && !input.q) {
      return fallbackStations.map(fromFallbackStation);
    }

    return rows.map(toStationModel);
  } catch (error) {
    console.warn("Admin stations could not be loaded.", error);
    return fallbackStations.map(fromFallbackStation);
  }
}

export async function getAdminStationById(id: string) {
  if (!hasDatabaseConfig()) {
    return fallbackStations.map(fromFallbackStation).find((station) => station.id === id) ?? null;
  }

  try {
    const db = getDb();
    const [station] = await db
      .select()
      .from(chargingStations)
      .where(eq(chargingStations.id, id))
      .limit(1);

    return station ? toStationModel(station) : null;
  } catch (error) {
    console.warn("Admin station could not be loaded.", error);
    return null;
  }
}

export async function saveAdminStation(
  input: AdminStationInput,
  actor: AdminSessionPayload | null,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!hasDatabaseConfig()) {
    throw new Error("İstasyon yönetimi için canlı veritabanı bağlantısı gerekir.");
  }

  const db = getDb();
  const values = {
    externalId: input.externalId,
    name: input.name,
    status: input.status,
    power: input.power,
    connectorTypes: input.connectorTypes,
    pricePerKwh: input.pricePerKwh,
    city: input.city,
    district: input.district,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    availableSockets: input.availableSockets,
    totalSockets: input.totalSockets,
    hours: input.hours,
    operator: input.operator,
    amenities: input.amenities,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
    updatedAt: new Date()
  };

  if (input.id) {
    const [before] = await db
      .select()
      .from(chargingStations)
      .where(eq(chargingStations.id, input.id))
      .limit(1);

    await db.update(chargingStations).set(values).where(eq(chargingStations.id, input.id));

    const [after] = await db
      .select()
      .from(chargingStations)
      .where(eq(chargingStations.id, input.id))
      .limit(1);

    await recordAuditLog({
      db,
      actor,
      entityType: "charging_station",
      entityId: input.id,
      action: "update",
      summary: `${input.name} istasyonu güncellendi.`,
      beforePayload: before ?? null,
      afterPayload: after ?? null,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent
    });

    revalidateTag("charging-stations");
    return after ? toStationModel(after) : null;
  }

  const [created] = await db.insert(chargingStations).values(values).returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "charging_station",
    entityId: created.id,
    action: "create",
    summary: `${input.name} istasyonu oluşturuldu.`,
    afterPayload: created,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent
  });

  revalidateTag("charging-stations");
  return toStationModel(created);
}

export const listPublicChargingStations = unstable_cache(
  async (): Promise<StationModel[]> => {
    if (!hasDatabaseConfig()) {
      return fallbackStations;
    }

    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(chargingStations)
        .where(and(eq(chargingStations.isActive, true)))
        .orderBy(asc(chargingStations.sortOrder), asc(chargingStations.city), asc(chargingStations.name));

      if (rows.length === 0) {
        return fallbackStations;
      }

      return rows.map(toStationModel);
    } catch (error) {
      console.warn("Public charging stations could not be loaded.", error);
      return fallbackStations;
    }
  },
  ["public-charging-stations"],
  { revalidate: 120, tags: ["charging-stations"] }
);
