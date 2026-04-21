import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  getLocalBusinessJsonLd,
  getOrganizationJsonLd,
  getWebsiteJsonLd
} from "@/lib/structured-data";
import { siteConfig } from "@/lib/site";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | EV Şarj İstasyonu ve Kurulum Çözümleri`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    title: `${siteConfig.name} | EV Şarj İstasyonu ve Kurulum Çözümleri`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "tr_TR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | EV Şarj İstasyonu ve Kurulum Çözümleri`,
    description: siteConfig.description
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const organizationJsonLd = getOrganizationJsonLd();
  const localBusinessJsonLd = getLocalBusinessJsonLd();
  const websiteJsonLd = getWebsiteJsonLd();

  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
