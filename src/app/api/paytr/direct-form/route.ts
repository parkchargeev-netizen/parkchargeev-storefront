import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message:
        "Direkt kart formu devre dışı. Ödeme yalnızca PayTR güvenli iFrame akışıyla başlatılır."
    },
    { status: 410 }
  );
}
