import type { ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";

import { GlobalAmbientLayer } from "@/components/layout/global-ambient-layer";
import { ScrollMotion } from "@/components/layout/scroll-motion";
import { getConversionEventListenerScript } from "@/lib/conversion-listener-script";
import { absoluteUrl, siteConfig } from "@/lib/site";

import "@/app/globals.css";
import "@/app/premium-motion-intensity.css";

const defaultTitle = `Elektrikli Araç Şarj Cihazı ve Kurulum | ${siteConfig.name}`;
const defaultOgImage = absoluteUrl("/api/og/product/homecharge-pro-11kw");
const googleTagId = "AW-17739531406";
const clarityProjectId = "xc0amcuu8z";

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
    "elektrikli araç şarj aleti",
    "elektrikli araç şarj cihazı fiyatları",
    "ev tipi elektrikli araç şarj cihazı",
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleTagId}');
          `}
        </Script>
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityProjectId}");
          `}
        </Script>
        <Script id="parkchargeev-conversion-listener" strategy="afterInteractive">
          {getConversionEventListenerScript()}
        </Script>
        <GlobalAmbientLayer />
        <div className="app-content-layer">{children}</div>
        <ScrollMotion />
      </body>
    </html>
  );
}
