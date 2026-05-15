"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SitePageDeleteButtonProps = {
  id: string;
  title: string;
  returnHref: string;
};

type DeleteResponse = {
  ok: boolean;
  message?: string;
};

export function SitePageDeleteButton({ id, title, returnHref }: SitePageDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `"${title}" sayfasını silmek istiyor musunuz? Bu işlem geri alınamaz.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/site/pages?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const data = (await response.json().catch(() => ({ ok: false }))) as DeleteResponse;

      if (!response.ok || !data.ok) {
        setMessage(data.message ?? "Sayfa silinemedi.");
        return;
      }

      router.push(returnHref);
      router.refresh();
    } catch {
      setMessage("Sayfa silinirken bağlantı hatası oluştu.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {isDeleting ? "Siliniyor" : "Sil"}
      </button>
      {message ? <span className="max-w-48 text-xs font-medium text-red-700">{message}</span> : null}
    </span>
  );
}
