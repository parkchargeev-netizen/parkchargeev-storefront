import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ParkChargeEV",
    short_name: "ParkChargeEV",
    description:
      "Ev, site, işletme ve ticari lokasyonlar için elektrikli araç şarj cihazı, keşif, kurulum ve teknik destek çözümleri.",
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#faf8ff",
    theme_color: "#063326",
    lang: "tr-TR",
    categories: ["shopping", "business", "utilities"],
    icons: [
      {
        src: "/images/parkchargeev-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ],
    shortcuts: [
      {
        name: "Şarj Cihazları",
        short_name: "Mağaza",
        description: "Elektrikli araç şarj cihazlarını ve fiyatlarını inceleyin.",
        url: "/magaza",
        icons: [
          {
            src: "/images/parkchargeev-logo.svg",
            sizes: "any",
            type: "image/svg+xml"
          }
        ]
      },
      {
        name: "Ürün Seçici",
        short_name: "Seçici",
        description: "Aracınız ve altyapınız için uygun şarj cihazını bulun.",
        url: "/urun-secici",
        icons: [
          {
            src: "/images/parkchargeev-logo.svg",
            sizes: "any",
            type: "image/svg+xml"
          }
        ]
      }
    ]
  };
}
