"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function CustomerLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/customer/auth/logout", {
      method: "POST"
    });
    router.push("/giris");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-outline-variant/45 bg-white px-5 py-4 text-sm font-semibold text-on-surface transition hover:border-primary/30 hover:text-primary"
    >
      <LogOut className="h-4 w-4" />
      Çıkış Yap
    </button>
  );
}
