"use client";

import { type FormEvent, useEffect, useState } from "react";

type ProductReview = {
  id: string;
  authorName: string;
  title?: string | null;
  body: string;
  createdAt: string;
};

type ProductReviewResponse = {
  ok: boolean;
  message?: string;
  reviews?: ProductReview[];
  summary?: {
    count: number;
    average: number;
  };
};

type ProductReviewsProps = {
  productName: string;
  productSlug: string;
};

function formatReviewDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

export function ProductReviews({ productName, productSlug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState({ count: 0, average: 0 });
  const [status, setStatus] = useState<"idle" | "loading" | "submitting">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(productSlug)}/reviews`, {
          headers: { Accept: "application/json" }
        });
        const data = (await response.json()) as ProductReviewResponse;

        if (!cancelled && response.ok && data.ok) {
          setReviews(data.reviews ?? []);
          setSummary(data.summary ?? { count: 0, average: 0 });
        }
      } catch {
        if (!cancelled) {
          setReviews([]);
        }
      } finally {
        if (!cancelled) {
          setStatus("idle");
        }
      }
    }

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("submitting");
    setMessage(null);

    try {
      const response = await fetch(`/api/products/${encodeURIComponent(productSlug)}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          authorName: formData.get("authorName"),
          authorEmail: formData.get("authorEmail"),
          rating: 5,
          title: formData.get("title"),
          body: formData.get("body")
        })
      });
      const data = (await response.json()) as ProductReviewResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Yorum kaydedilemedi.");
      }

      form.reset();
      setMessage(data.message ?? "Yorumunuz onaydan sonra yayınlanacak.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Yorum kaydedilemedi.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <section className="product-reviews-section mt-8">
      <div className="surface-card p-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">
              Ürün yorumları
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-on-surface">
              {productName} için kullanıcı deneyimleri
            </h2>
            <div className="mt-5 inline-flex items-center gap-3 rounded-lg border border-outline-variant/35 bg-white px-4 py-3">
              <strong className="text-lg text-on-surface">{summary.count}</strong>
              <span className="text-sm text-on-surface-variant">
                {summary.count > 0 ? "onaylı yorum" : "İlk yorumu siz yazın"}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="authorName"
                  required
                  minLength={2}
                  maxLength={120}
                  className="rounded-lg border border-outline-variant/60 bg-white px-4 py-3 text-sm"
                  placeholder="Ad soyad"
                />
                <input
                  name="authorEmail"
                  type="email"
                  maxLength={180}
                  className="rounded-lg border border-outline-variant/60 bg-white px-4 py-3 text-sm"
                  placeholder="E-posta (opsiyonel)"
                />
              </div>
              <input
                name="title"
                maxLength={160}
                className="rounded-lg border border-outline-variant/60 bg-white px-4 py-3 text-sm"
                placeholder="Kısa başlık"
              />
              <textarea
                name="body"
                required
                minLength={10}
                maxLength={1200}
                rows={4}
                className="rounded-lg border border-outline-variant/60 bg-white px-4 py-3 text-sm"
                placeholder="Ürün, teslimat veya kullanım deneyiminizi yazın."
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Gönderiliyor..." : "Yorum ekle"}
              </button>
              {message ? (
                <p className="rounded-lg bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface-variant" aria-live="polite">
                  {message}
                </p>
              ) : null}
            </form>
          </div>

          <div className="grid content-start gap-3">
            {status === "loading" ? (
              <div className="rounded-lg border border-dashed border-outline-variant/50 bg-surface-container-low p-6 text-sm text-on-surface-variant">
                Yorumlar yükleniyor.
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <article key={review.id} className="rounded-lg border border-outline-variant/35 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-on-surface">{review.title || review.authorName}</h3>
                      <p className="mt-1 text-xs font-semibold text-on-surface-variant">
                        {review.authorName} {formatReviewDate(review.createdAt) ? `- ${formatReviewDate(review.createdAt)}` : ""}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-on-surface-variant">{review.body}</p>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-outline-variant/50 bg-surface-container-low p-6 text-sm leading-7 text-on-surface-variant">
                Bu ürün için henüz onaylı yorum yok. Deneyiminizi paylaştığınızda admin onayından sonra yayınlanır.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
