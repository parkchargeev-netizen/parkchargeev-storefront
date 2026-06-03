import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const sentryIngestOrigin = "https://o4511393003077632.ingest.de.sentry.io";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https://www.paytr.com",
  "frame-ancestors 'self'",
  "frame-src 'self' https://www.paytr.com https://www.google.com https://maps.google.com",
  `connect-src 'self' https://www.paytr.com ${sentryIngestOrigin}${isProduction ? "" : " ws: http: https:"}`,
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' data: blob: https:",
  "object-src 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : [])
].join("; ");

const discoveryLinkHeader = [
  '<https://parkchargeev.com/sitemap.xml>; rel="sitemap"; type="application/xml"',
  '<https://parkchargeev.com/llms.txt>; rel="alternate"; type="text/plain"',
  '<https://parkchargeev.com/.well-known/llms.txt>; rel="alternate"; type="text/plain"',
  '<https://parkchargeev.com/.well-known/api-catalog>; rel="api-catalog"',
  '</docs/api>; rel="service-doc"'
].join(", ");

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"]
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"]
  },
  async headers() {
    return [
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
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
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

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

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
