"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

type CatalogFormProps = {
  type: "brand" | "category";
  item?: {
    id?: string;
    name?: string;
    slug?: string;
    websiteUrl?: string | null;
    description?: string | null;
    parentId?: string | null;
  };
  categories?: Array<{
    id: string;
    name: string;
  }>;
};

export function CatalogForm({ type, item, categories = [] }: CatalogFormProps) {
  const router = useRouter();
  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(item?.websiteUrl ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [parentId, setParentId] = useState(item?.parentId ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const endpoint =
      type === "brand" ? "/api/admin/catalog/brands" : "/api/admin/catalog/categories";
    const method = item?.id ? "PATCH" : "POST";
    const payload =
      type === "brand"
        ? { id: item?.id, name, slug: slug || name, websiteUrl, description }
        : { id: item?.id, name, slug: slug || name, parentId: parentId || null, description };

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { ok: boolean; message?: string };

    setFeedback(data.ok ? "Katalog kaydı kaydedildi." : data.message ?? "İşlem başarısız.");
    setIsSubmitting(false);

    if (data.ok) {
      if (!item?.id) {
        setName("");
        setSlug("");
        setWebsiteUrl("");
        setDescription("");
        setParentId("");
      }
      router.refresh();
    }
  }

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
          placeholder="Ad"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
          placeholder="Slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
      </div>
      {type === "brand" ? (
        <input
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
          placeholder="Web sitesi"
          value={websiteUrl}
          onChange={(event) => setWebsiteUrl(event.target.value)}
        />
      ) : (
        <select
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
          value={parentId}
          onChange={(event) => setParentId(event.target.value)}
        >
          <option value="">Üst kategori yok</option>
          {categories
            .filter((category) => category.id !== item?.id)
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      )}
      <textarea
        rows={3}
        className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
        placeholder="Açıklama"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      {feedback ? <p className="text-sm text-slate-600">{feedback}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isSubmitting ? "Kaydediliyor..." : item?.id ? "Güncelle" : "Ekle"}
      </button>
    </form>
  );
}
