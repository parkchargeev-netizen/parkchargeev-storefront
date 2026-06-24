import type { ReactNode } from "react";
import type { Metadata } from "next";

import { ConversionEventListener } from "@/components/analytics/conversion-event-listener";
import { absoluteUrl, siteConfig } from "@/lib/site";

import "@/app/globals.css";

const defaultTitle = `${siteConfig.name} | EV Şarj Cihazı ve Kurulum Çözümleri`;
const defaultOgImage = absoluteUrl("/api/og/product/homecharge-pro-11kw");

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: defaultTitle,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "elektrikli araç şarj cihazı",
    "EV şarj cihazı",
    "wallbox",
    "şarj cihazı kurulumu",
    "PayTR güvenli ödeme",
    "ParkChargeEV"
  ],
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    title: defaultTitle,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: defaultTitle
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteConfig.description,
    images: [defaultOgImage]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="font-sans">
        <ConversionEventListener />
        {children}
      </body>
    </html>
  );
}
