import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const sentryIngestOrigin = "https://o4511393003077632.ingest.de.sentry.io";

const googleMeasurementScriptSources = [
  "https://*.googletagmanager.com",
  "https://www.googleadservices.com",
  "https://www.google.com",
  "https://pagead2.googlesyndication.com",
  "https://googleads.g.doubleclick.net"
];

const googleMeasurementConnectSources = [
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://*.googletagmanager.com",
  "https://*.g.doubleclick.net",
  "https://*.google.com",
  "https://google.com",
  "https://*.google.com.tr",
  "https://google.com.tr",
  "https://pagead2.googlesyndication.com",
  "https://www.googleadservices.com",
  "https://ad.doubleclick.net"
];

const googleMeasurementImageSources = [
  "https://*.google-analytics.com",
  "https://*.googletagmanager.com",
  "https://*.g.doubleclick.net",
  "https://*.google.com",
  "https://google.com",
  "https://*.google.com.tr",
  "https://google.com.tr",
  "https://pagead2.googlesyndication.com",
  "https://www.googleadservices.com"
];

const googleMeasurementFrameSources = ["https://www.googletagmanager.com"];

const microsoftClarityScriptSources = [
  "https://www.clarity.ms",
  "https://scripts.clarity.ms",
  "https://*.clarity.ms"
];

const microsoftClarityConnectSources = ["https://*.clarity.ms"];
const microsoftClarityImageSources = ["https://*.clarity.ms"];
const paytrScriptSources = ["https://www.paytr.com"];
const paytrFrameSources = [
  "https://www.paytr.com",
  "https://*.paytr.com",
  "https://inbound.apigateway.vakifbank.com.tr",
  "https://*.apigateway.vakifbank.com.tr",
  "https://*.vakifbank.com.tr"
];
const paytrFormActionSources = [
  "https://www.paytr.com",
  "https://inbound.apigateway.vakifbank.com.tr",
  "https://*.apigateway.vakifbank.com.tr"
];
const cloudflareInsightsScriptSources = ["https://static.cloudflareinsights.com"];
const cloudflareInsightsConnectSources = ["https://cloudflareinsights.com"];
const sendnomiScriptSources = ["https://app.sendnomi.com"];
const sendnomiConnectSources = ["https://app.sendnomi.com"];
const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  ...googleMeasurementScriptSources,
  ...microsoftClarityScriptSources,
  ...paytrScriptSources,
  ...cloudflareInsightsScriptSources,
  ...sendnomiScriptSources,
  ...(isProduction ? [] : ["'unsafe-eval'"])
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  `form-action 'self' ${paytrFormActionSources.join(" ")}`,
  "frame-ancestors 'none'",
  `frame-src 'self' https: ${paytrFrameSources.join(" ")} https://www.google.com https://maps.google.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com ${googleMeasurementFrameSources.join(" ")}`,
  `child-src 'self' https: ${paytrFrameSources.join(" ")} https://www.google.com https://maps.google.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com ${googleMeasurementFrameSources.join(" ")}`,
  `connect-src 'self' https://www.paytr.com ${sentryIngestOrigin} ${googleMeasurementConnectSources.join(" ")} ${microsoftClarityConnectSources.join(" ")} ${cloudflareInsightsConnectSources.join(" ")} ${sendnomiConnectSources.join(" ")}${isProduction ? "" : " ws: http: https:"}`,
  `img-src 'self' data: blob: https: ${googleMeasurementImageSources.join(" ")} ${microsoftClarityImageSources.join(" ")}`,
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  `script-src ${scriptSources}`,
  `script-src-elem ${scriptSources}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' data: blob: https:",
  "object-src 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : [])
].join("; ");

const checkoutContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  `form-action 'self' ${paytrFormActionSources.join(" ")}`,
  "frame-ancestors 'self' https://www.paytr.com https://*.paytr.com",
  "frame-src 'self' https:",
  "child-src 'self' https:",
  `connect-src 'self' https://www.paytr.com ${sentryIngestOrigin} ${googleMeasurementConnectSources.join(" ")} ${microsoftClarityConnectSources.join(" ")} ${cloudflareInsightsConnectSources.join(" ")} ${sendnomiConnectSources.join(" ")}${isProduction ? "" : " ws: http: https:"}`,
  `img-src 'self' data: blob: https: ${googleMeasurementImageSources.join(" ")} ${microsoftClarityImageSources.join(" ")}`,
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  `script-src ${scriptSources}`,
  `script-src-elem ${scriptSources}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' data: blob: https:",
  "object-src 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : [])
].join("; ");

const discoveryLinkHeader = [
  '<https://parkchargeev.com/sitemap.xml>; rel="sitemap"; type="application/xml"',
  '<https://parkchargeev.com/image-sitemap.xml>; rel="sitemap"; type="application/xml"',
  '<https://parkchargeev.com/feed.xml>; rel="alternate"; type="application/rss+xml"; title="ParkChargeEV EV Charging Guides"',
  '<https://parkchargeev.com/llms.txt>; rel="alternate"; type="text/plain"',
  '<https://parkchargeev.com/llms-full.txt>; rel="alternate"; type="text/plain"',
  '<https://parkchargeev.com/.well-known/llms.txt>; rel="alternate"; type="text/plain"',
  '<https://parkchargeev.com/.well-known/api-catalog>; rel="api-catalog"',
  '<https://parkchargeev.com/.well-known/openapi.json>; rel="service-desc"; type="application/openapi+json"',
  '</docs/api>; rel="service-doc"'
].join(", ");

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  compiler: {
    removeConsole: isProduction
      ? {
          exclude: ["error", "warn"]
        }
      : false
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "parkchargeev.com"
      },
      {
        protocol: "https",
        hostname: "*.vercel.app"
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**"
      }
    ]
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tanstack/react-table",
      "react-hook-form"
    ]
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/cursors/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin"
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "off"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=(self)"
          },
          {
            key: "Link",
            value: discoveryLinkHeader
          }
        ]
      },
      {
        source: "/checkout",
        headers: [
          {
            key: "Content-Security-Policy",
            value: checkoutContentSecurityPolicy
          }
        ]
      },
      {
        source: "/odeme",
        headers: [
          {
            key: "Content-Security-Policy",
            value: checkoutContentSecurityPolicy
          }
        ]
      },
      {
        source: "/api/paytr/return",
        headers: [
          {
            key: "Content-Security-Policy",
            value: checkoutContentSecurityPolicy
          }
        ]
      }
    ];
  }
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "park-charge-ev",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Source maps are uploaded only by CI/deployment builds; local production checks stay offline.
  sourcemaps: {
    disable: process.env.CI ? false : true
  },
  widenClientFileUpload: false,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  }
});
