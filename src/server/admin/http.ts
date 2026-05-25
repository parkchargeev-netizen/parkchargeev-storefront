import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ValidationIssue = {
  path: string;
  message: string;
};

export function isValidationError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

export function validationErrorResponse(
  error: ZodError,
  message = "Formda eksik veya hatalı alanlar var."
) {
  const issues: ValidationIssue[] = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));

  return NextResponse.json(
    {
      ok: false,
      message,
      issues
    },
    { status: 400 }
  );
}
