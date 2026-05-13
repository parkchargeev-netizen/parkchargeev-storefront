import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";

import { formatPriceTRY } from "@/lib/format";
import { getProductBySlug } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site";

type ProductOgRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const runtime = "edge";

export async function GET(_request: Request, { params }: ProductOgRouteProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ ok: false, message: "Product not found." }, { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          padding: "54px",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: "34px",
            border: "1px solid #dbe4f0",
            background: "white",
            padding: "44px"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", fontSize: "28px", fontWeight: 800, color: "#0044d3" }}>
              {siteConfig.name}
            </div>
            <div style={{ display: "flex", fontSize: "64px", fontWeight: 900, lineHeight: 1.02 }}>
              {product.name}
            </div>
            <div style={{ display: "flex", fontSize: "30px", lineHeight: 1.25, color: "#475569" }}>
              {product.summary}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                borderRadius: "999px",
                background: "#e0f2fe",
                color: "#075985",
                padding: "14px 22px",
                fontSize: "24px",
                fontWeight: 800
              }}
            >
              {product.powerLabel}
            </div>
            <div
              style={{
                display: "flex",
                borderRadius: "999px",
                background: "#dcfce7",
                color: "#166534",
                padding: "14px 22px",
                fontSize: "24px",
                fontWeight: 800
              }}
            >
              {formatPriceTRY(product.priceKurus)}
            </div>
          </div>
        </div>
        <div
          style={{
            width: "385px",
            marginLeft: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "34px",
            background: "linear-gradient(160deg, #0044d3 0%, #006e2f 100%)"
          }}
        >
          <div
            style={{
              width: "190px",
              height: "330px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "34px",
              background: "#f8fafc",
              padding: "28px",
              boxShadow: "0 28px 70px rgba(15, 23, 42, 0.28)"
            }}
          >
            <div
              style={{
                width: "96px",
                height: "96px",
                display: "flex",
                borderRadius: "999px",
                border: "16px solid #0044d3",
                background: "#dbeafe"
              }}
            />
            <div style={{ display: "flex", width: "110px", height: "16px", borderRadius: "999px", background: "#cbd5e1" }} />
            <div style={{ display: "flex", width: "92px", height: "16px", borderRadius: "999px", background: "#cbd5e1" }} />
            <div
              style={{
                display: "flex",
                borderRadius: "999px",
                background: "#0f172a",
                color: "white",
                padding: "12px 18px",
                fontSize: "22px",
                fontWeight: 800
              }}
            >
              EV
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
