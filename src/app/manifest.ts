import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ParkChargeEV",
    short_name: "ParkChargeEV",
    description:
      "Elektrikli araç şarj istasyonu ürünleri, kurulum hizmetleri ve teknik destek süreçlerini tek platformda buluşturan premium EV commerce deneyimi.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8ff",
    theme_color: "#0044d3",
    lang: "tr-TR"
  };
}
