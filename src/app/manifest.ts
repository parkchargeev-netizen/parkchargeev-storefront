import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ParkChargeEV",
    short_name: "ParkChargeEV",
    description:
      "Ev, site, işletme ve ticari lokasyonlar için elektrikli araç şarj cihazı, keşif, kurulum ve teknik destek çözümleri.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8ff",
    theme_color: "#063326",
    lang: "tr-TR"
  };
}
