import type { Metadata } from "next";

import { StationMapClient } from "@/components/site/station-map-client";
import { listPublicChargingStations } from "@/server/site/stations";

export const metadata: Metadata = {
  title: "Şarj İstasyonları Haritası",
  description:
    "ParkChargeEV şarj istasyonlarını harita üzerinde görüntüleyin, müsait soketleri filtreleyin ve yol tarifi alın."
};

export default async function MapPage() {
  const stations = await listPublicChargingStations();

  return <StationMapClient stations={stations} />;
}
