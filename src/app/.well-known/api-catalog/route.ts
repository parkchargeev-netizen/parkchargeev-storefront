export async function GET() {
  return new Response(
    JSON.stringify({
      linkset: [
        {
          anchor: "https://parkchargeev.com/api",
          "service-desc": [
            {
              href: "https://parkchargeev.com/.well-known/openapi.json"
            }
          ],
          "service-doc": [
            {
              href: "https://parkchargeev.com/docs/api"
            }
          ],
          status: [
            {
              href: "https://parkchargeev.com/api/health"
            }
          ]
        }
      ]
    }),
    {
      headers: {
        "Content-Type": "application/linkset+json; charset=utf-8"
      }
    }
  );
}
