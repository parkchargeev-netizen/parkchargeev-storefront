import type { Metadata } from "next";

import { getHomePageData } from "@/features/home/application/get-home-page-data";
import { parkChargeHomeDataSource } from "@/features/home/infrastructure/parkcharge-home-data-source";
import { HomePageView } from "@/features/home/ui/home-page-view";

export const metadata: Metadata = {
  title: "Elektrikli Araç Şarj Cihazı, Wallbox ve Kurulum",
  description:
    "Elektrikli araç şarj cihazlarını ve fiyatlarını karşılaştırın. Ev tipi 7.4 kW, 11 kW ve 22 kW wallbox, Type 2 ürünler, keşif ve kurulum desteği.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Elektrikli Araç Şarj Cihazları | ParkChargeEV",
    description:
      "Ev, site ve işletmeler için elektrikli araç şarj cihazı seçimi, ürün satışı, keşif ve kurulum çözümleri.",
    url: "/",
    type: "website"
  }
};

export default async function HomePage() {
  const viewModel = await getHomePageData(parkChargeHomeDataSource);

  return <HomePageView {...viewModel} />;
}
