import type { Metadata } from "next";

import { StationMapClient } from "@/components/site/station-map-client";
import { stations } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Şarj İstasyonları Haritası",
  description:
    "ParkChargeEV şarj istasyonlarını harita üzerinde görüntüleyin, müsait soketleri filtreleyin ve yol tarifi alın."
};

export default function MapPage() {
  return <StationMapClient stations={stations} />;
}
