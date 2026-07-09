import type { Metadata } from "next";

import { getHomePageData } from "@/features/home/application/get-home-page-data";
import { parkChargeHomeDataSource } from "@/features/home/infrastructure/parkcharge-home-data-source";
import { HomePageView } from "@/features/home/ui/home-page-view";
import { getEvSeoKeywords } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Elektrikli Araç Şarj Cihazı, Wallbox ve Kurulum",
  description:
    "Elektrikli araç şarj cihazlarını ve fiyatlarını karşılaştırın. Ev tipi 7.4 kW, 11 kW ve 22 kW wallbox, Type 2 ürünler, keşif ve kurulum desteği.",
  keywords: getEvSeoKeywords([
    "elektrikli araç şarj cihazı satın al",
    "wallbox kurulumu",
    "Sakarya şarj cihazı kurulumu"
  ]),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Elektrikli Araç Şarj Cihazları | ParkChargeEV",
    description:
    "Ev, site ve işletmeler için elektrikli araç şarj cihazı seçimi, ürün satışı, keşif ve kurulum çözümleri.",
    url: "/",
    type: "website",
    images: [
      {
        url: absoluteUrl("/images/hero-realistic-ev-charging-desktop.webp"),
        width: 1536,
        height: 864,
        alt: "ParkChargeEV elektrikli araç şarj cihazı ve kurulum çözümleri"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Elektrikli Araç Şarj Cihazları | ParkChargeEV",
    description:
      "Ev, site ve işletmeler için elektrikli araç şarj cihazı seçimi, ürün satışı, keşif ve kurulum çözümleri.",
    images: [absoluteUrl("/images/hero-realistic-ev-charging-desktop.webp")]
  }
};

export default async function HomePage() {
  const viewModel = await getHomePageData(parkChargeHomeDataSource);

  return <HomePageView {...viewModel} />;
}
