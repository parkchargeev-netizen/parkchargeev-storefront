import { verifyPaytrCallbackHash } from "@/lib/paytr";

export async function POST(request: Request) {
  const formData = await request.formData();

  const payload = {
    merchant_oid: String(formData.get("merchant_oid") ?? ""),
    status: String(formData.get("status") ?? "") as "success" | "failed",
    total_amount: String(formData.get("total_amount") ?? ""),
    hash: String(formData.get("hash") ?? ""),
    payment_type: String(formData.get("payment_type") ?? ""),
    currency: String(formData.get("currency") ?? ""),
    payment_amount: String(formData.get("payment_amount") ?? ""),
    failed_reason_code: String(formData.get("failed_reason_code") ?? ""),
    failed_reason_msg: String(formData.get("failed_reason_msg") ?? "")
  };

  if (!verifyPaytrCallbackHash(payload)) {
    return new Response("PAYTR notification failed: bad hash", { status: 400 });
  }

  /*
    TODO:
    1. merchant_oid ile siparişi bul
    2. callback idempotent mi kontrol et
    3. status success ise siparişi paid yap
    4. status failed ise failed/cancelled akışını işlet
    5. ham callback verisini paytr_transactions tablosuna yaz
  */

  return new Response("OK");
}
