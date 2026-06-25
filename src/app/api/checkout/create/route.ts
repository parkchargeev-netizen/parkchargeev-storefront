import { POST as createPaytrCheckout } from "@/app/api/paytr/token/route";

export async function POST(request: Request) {
  return createPaytrCheckout(request);
}
