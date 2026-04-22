export async function GET() {
  return Response.json({
    openapi: "3.1.0",
    info: {
      title: "ParkChargeEV API",
      version: "1.0.0",
      description: "Public-facing health and admin-aware discovery endpoints for ParkChargeEV."
    },
    servers: [
      {
        url: "https://parkchargeev.com"
      }
    ],
    paths: {
      "/api/health": {
        get: {
          summary: "Health check",
          responses: {
            "200": {
              description: "Service is healthy"
            }
          }
        }
      },
      "/api/admin/me": {
        get: {
          summary: "Authenticated admin profile",
          responses: {
            "200": {
              description: "Active admin session"
            },
            "401": {
              description: "Unauthorized"
            }
          }
        }
      }
    }
  });
}
