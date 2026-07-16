import type { ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";

import { GlobalAmbientLayer } from "@/components/layout/global-ambient-layer";
import { ScrollMotion } from "@/components/layout/scroll-motion";
import { getConversionEventListenerScript } from "@/lib/conversion-listener-script";
import { getEvSeoKeywords } from "@/lib/seo";
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
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "Elektrikli araç şarj cihazları",
  keywords: getEvSeoKeywords(["PayTR güvenli ödeme"]),
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
      "x-default": "/"
    }
  },
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
      ? { yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION }
      : {})
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
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true
  },
  other: {
    "content-language": "tr-TR",
    "ai-site-purpose":
      "EV charging equipment ecommerce, installation discovery, technical support and local EV charging consultation in Turkey"
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
        <Script id="parkchargeev-device-performance" strategy="beforeInteractive">
          {`
            (function(){
              var root = document.documentElement;
              var nav = window.navigator || {};
              var ua = String(nav.userAgent || "");
              var platform = String((nav.userAgentData && nav.userAgentData.platform) || nav.platform || "");
              var isAndroid = /Android/i.test(ua) || /Android/i.test(platform);
              var connection = nav.connection || nav.mozConnection || nav.webkitConnection;
              var saveData = Boolean(connection && connection.saveData);
              var lowCoreCount = Boolean(nav.hardwareConcurrency && nav.hardwareConcurrency <= 4);
              var lowMemory = Boolean(nav.deviceMemory && nav.deviceMemory <= 4);
              var coarsePointer = false;

              try {
                coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
              } catch (error) {
                coarsePointer = false;
              }

              if (isAndroid) {
                root.dataset.deviceOs = "android";
              }

              if (isAndroid || saveData || lowCoreCount || lowMemory || coarsePointer) {
                root.dataset.motionPerformance = "lite";
              }
            })();
          `}
        </Script>
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            (function(w,d,id){
              if (w.__parkchargeevGoogleTagQueued) return;
              w.__parkchargeevGoogleTagQueued = true;
              w.dataLayer = w.dataLayer || [];
              w.gtag = w.gtag || function(){w.dataLayer.push(arguments);};
              w.gtag('js', new Date());
              w.gtag('config', id);

              var loaded = false;
              var events = ["pointerdown", "keydown", "touchstart", "wheel"];
              var load = function(){
                if (loaded) return;
                loaded = true;
                events.forEach(function(eventName) {
                  w.removeEventListener(eventName, load, { passive: true });
                });
                var script = d.createElement("script");
                script.async = true;
                script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
                d.head.appendChild(script);
              };
              var schedule = function(){
                w.setTimeout(function(){
                  if ("requestIdleCallback" in w) {
                    w.requestIdleCallback(load, { timeout: 3000 });
                    return;
                  }
                  load();
                }, 12000);
              };
              events.forEach(function(eventName) {
                w.addEventListener(eventName, load, { once: true, passive: true });
              });
              if (d.readyState === "complete") {
                schedule();
              } else {
                w.addEventListener("load", schedule, { once: true });
              }
            })(window, document, "${googleTagId}");
          `}
        </Script>
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(w,d,id){
              if (w.__parkchargeevClarityQueued) return;
              w.__parkchargeevClarityQueued = true;
              var start = function(){
                if (w.clarity) return;
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(w,d,"clarity","script",id);
              };
              var schedule = function(){
                w.setTimeout(function(){
                  if ("requestIdleCallback" in w) {
                    w.requestIdleCallback(start, { timeout: 3000 });
                    return;
                  }
                  start();
                }, 14000);
              };
              if (d.readyState === "complete") {
                schedule();
              } else {
                w.addEventListener("load", schedule, { once: true });
              }
            })(window, document, "${clarityProjectId}");
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
