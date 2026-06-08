import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ParkChargeEV",
    short_name: "ParkChargeEV",
    description:
      "Elektrikli araç şarj cihazı ürünleri, kurulum hizmetleri ve teknik destek süreçlerini tek platformda buluşturan premium EV commerce deneyimi.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8ff",
    theme_color: "#063326",
    lang: "tr-TR"
  };
}
