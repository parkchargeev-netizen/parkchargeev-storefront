"use client";

import { useMemo, useState } from "react";

type AdminProductReview = {
  id: string;
  productName: string;
  authorName: string;
  authorEmail?: string | null;
  title?: string | null;
  body: string;
  status: string;
  createdAt: string;
};

type ProductReviewsAdminPanelProps = {
  initialReviews: AdminProductReview[];
};

const statusLabels: Record<string, string> = {
  pending: "Onay bekliyor",
  approved: "Yayında",
  rejected: "Reddedildi"
};

const statusClassNames: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  rejected: "bg-red-50 text-red-800 border-red-200"
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function ProductReviewsAdminPanel({ initialReviews }: ProductReviewsAdminPanelProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredReviews = useMemo(
    () => (filter === "all" ? reviews : reviews.filter((review) => review.status === filter)),
    [filter, reviews]
  );

  async function updateReview(review: AdminProductReview, nextStatus?: string) {
    setBusyId(review.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          title: review.title,
          body: review.body,
          status: nextStatus ?? review.status
        })
      });
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        review?: AdminProductReview;
      };

      if (!response.ok || !data.ok || !data.review) {
        throw new Error(data.message ?? "Yorum güncellenemedi.");
      }

      setReviews((current) =>
        current.map((item) => (item.id === review.id ? data.review as AdminProductReview : item))
      );
      setMessage(data.message ?? "Yorum güncellendi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Yorum güncellenemedi.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteReview(review: AdminProductReview) {
    if (!window.confirm("Bu yorum kalıcı olarak silinsin mi?")) {
      return;
    }

    setBusyId(review.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" }
      });
      const data = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Yorum silinemedi.");
      }

      setReviews((current) => current.filter((item) => item.id !== review.id));
      setMessage(data.message ?? "Yorum silindi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Yorum silinemedi.");
    } finally {
      setBusyId(null);
    }
  }

  function patchLocalReview(id: string, patch: Partial<AdminProductReview>) {
    setReviews((current) =>
      current.map((review) => (review.id === id ? { ...review, ...patch } : review))
    );
  }

  return (
    <section className="surface-card border border-slate-200 bg-white/95 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Ürün yorumları</h2>
          <p className="mt-1 text-sm text-slate-600">
            Onaylanmamış yorumlar kullanıcı tarafında görünmez.
          </p>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          <option value="all">Tüm yorumlar</option>
          <option value="pending">Onay bekleyen</option>
          <option value="approved">Yayında</option>
          <option value="rejected">Reddedilen</option>
        </select>
      </div>

      {message ? (
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700" aria-live="polite">
          {message}
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-950">{review.productName}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {review.authorName}
                    {review.authorEmail ? ` / ${review.authorEmail}` : ""}
                    {formatDate(review.createdAt) ? ` / ${formatDate(review.createdAt)}` : ""}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${
                    statusClassNames[review.status] ?? "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {statusLabels[review.status] ?? review.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <input
                  value={review.title ?? ""}
                  onChange={(event) => patchLocalReview(review.id, { title: event.target.value })}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Başlık"
                />
                <textarea
                  value={review.body}
                  onChange={(event) => patchLocalReview(review.id, { body: event.target.value })}
                  rows={4}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Yorum metni"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === review.id}
                  onClick={() => updateReview(review, "approved")}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  Onayla
                </button>
                <button
                  type="button"
                  disabled={busyId === review.id}
                  onClick={() => updateReview(review, "rejected")}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800 disabled:opacity-60"
                >
                  Reddet
                </button>
                <button
                  type="button"
                  disabled={busyId === review.id}
                  onClick={() => updateReview(review)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-60"
                >
                  Düzenlemeyi kaydet
                </button>
                <button
                  type="button"
                  disabled={busyId === review.id}
                  onClick={() => deleteReview(review)}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-60"
                >
                  Sil
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Bu filtrede yorum bulunmuyor.
          </p>
        )}
      </div>
    </section>
  );
}
