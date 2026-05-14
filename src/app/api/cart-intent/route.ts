import { NextResponse } from "next/server";
import { z } from "zod";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { getDb } from "@/server/db/client";
import { cartRecoveryIntents } from "@/server/db/schema";

const cartIntentSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().max(180).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  totalKurus: z.coerce.number().int().min(0),
  items: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(220),
        quantity: z.coerce.number().int().min(1).max(99),
        unitPrice: z.string().trim().min(1).max(40)
      })
    )
    .min(1)
    .max(20)
});

export async function POST(request: Request) {
  try {
    const payload = cartIntentSchema.parse(await request.json());

    if (!hasDatabaseConfig()) {
      return NextResponse.json({ ok: true, captured: false });
    }

    const db = getDb();

    await db.insert(cartRecoveryIntents).values({
      email: payload.email,
      fullName: payload.fullName || null,
      phone: payload.phone || null,
      totalKurus: payload.totalKurus,
      itemCount: payload.items.reduce((total, item) => total + item.quantity, 0),
      items: payload.items,
      source: "checkout"
    });

    return NextResponse.json({ ok: true, captured: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Sepet hatırlatma kaydı oluşturulamadı."
      },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}
