import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { deleteCustomerAddress } from "@/server/customer/account-repository";

const paramsSchema = z.object({
  id: z.string().uuid()
});

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = paramsSchema.parse(await context.params);
    const result = await deleteCustomerAddress(id);

    if (result === null) {
      return NextResponse.json(
        {
          ok: false,
          message: "Müşteri oturumu bulunamadı."
        },
        { status: 401 }
      );
    }

    if (!result) {
      return NextResponse.json(
        {
          ok: false,
          message: "Adres bulunamadı."
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Adres kimliği geçerli değil."
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Adres silinirken beklenmeyen bir hata oluştu."
      },
      { status: 500 }
    );
  }
}
