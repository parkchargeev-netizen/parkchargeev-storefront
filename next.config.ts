import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https://www.paytr.com",
  "frame-ancestors 'self'",
  "frame-src 'self' https://www.paytr.com",
  `connect-src 'self' https://www.paytr.com${isProduction ? "" : " ws: http: https:"}`,
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  ...(isProduction ? ["upgrade-insecure-requests"] : [])
].join("; ");

const discoveryLinkHeader = [
  '<https://parkchargeev.com/sitemap.xml>; rel="sitemap"; type="application/xml"',
  '<https://parkchargeev.com/.well-known/api-catalog>; rel="api-catalog"',
  '</docs/api>; rel="service-doc"'
].join(", ");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"]
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

export default nextConfig;
