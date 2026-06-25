import { POST as handlePaytrCallback } from "@/app/api/paytr/callback/route";

export async function POST(request: Request) {
  return handlePaytrCallback(request);
}
