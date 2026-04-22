export async function GET() {
  return Response.json({
    ok: true,
    service: "parkchargeev-storefront",
    timestamp: new Date().toISOString()
  });
}
