import type { FormEvent } from "react";

export type ApiResponse = {
  ok: boolean;
  message?: string;
};

export type FormState = {
  type: "success" | "error";
  text: string;
} | null;

export type AccountFormEvent = FormEvent<HTMLFormElement>;

export function getJsonValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function parseApiResponse(response: Response) {
  const data = (await response.json().catch(() => ({
    ok: false,
    message: "İşlem tamamlanamadı."
  }))) as ApiResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? "İşlem tamamlanamadı.");
  }

  return data;
}

export function Feedback({ state }: { state: FormState }) {
  if (!state) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={`rounded-2xl border px-4 py-3 text-sm ${
        state.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {state.text}
    </div>
  );
}
