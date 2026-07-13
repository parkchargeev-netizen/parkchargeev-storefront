"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type MerchandisingSection = {
  slotKey: string;
  title: string;
  description: string;
  maxItems: number;
};

type ProductOption = {
  id: string;
  name: string;
  slug: string;
  category: string;
  powerLabel: string;
  stockLabel: string;
  imageUrl: string | null;
};

type MerchandisingSlot = {
  id?: string;
  slotKey: string;
  productId: string | null;
  sortOrder: number;
  isActive: boolean;
};

type DraftSlot = {
  clientId: string;
  productId: string;
  sortOrder: number;
  isActive: boolean;
};

type ProductMerchandisingFormProps = {
  sections: readonly MerchandisingSection[];
  products: ProductOption[];
  slots: MerchandisingSlot[];
};

function createClientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createInitialRows(sections: readonly MerchandisingSection[], slots: MerchandisingSlot[]) {
  return Object.fromEntries(
    sections.map((section) => [
      section.slotKey,
      slots
        .filter((slot) => slot.slotKey === section.slotKey && slot.productId)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((slot) => ({
          clientId: slot.id ?? createClientId(),
          productId: slot.productId ?? "",
          sortOrder: slot.sortOrder,
          isActive: slot.isActive
        }))
    ])
  ) as Record<string, DraftSlot[]>;
}

function dedupeSlots(slots: Array<{ slotKey: string; productId: string; sortOrder: number; isActive: boolean }>) {
  const seen = new Set<string>();

  return slots.filter((slot) => {
    const key = `${slot.slotKey}:${slot.productId}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function ProductMerchandisingForm({
  sections,
  products,
  slots
}: ProductMerchandisingFormProps) {
  const router = useRouter();
  const [rowsBySection, setRowsBySection] = useState(() => createInitialRows(sections, slots));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  function updateRows(slotKey: string, updater: (rows: DraftSlot[]) => DraftSlot[]) {
    setRowsBySection((current) => ({
      ...current,
      [slotKey]: updater(current[slotKey] ?? [])
    }));
  }

  function addRow(section: MerchandisingSection) {
    updateRows(section.slotKey, (rows) => {
      const effectiveMaxItems = Math.min(section.maxItems, products.length);

      if (rows.length >= effectiveMaxItems) {
        return rows;
      }

      const selectedIds = new Set(rows.map((row) => row.productId));
      const firstAvailableProduct = products.find((product) => !selectedIds.has(product.id));

      if (!firstAvailableProduct) {
        return rows;
      }

      return [
        ...rows,
        {
          clientId: createClientId(),
          productId: firstAvailableProduct.id,
          sortOrder: rows.length,
          isActive: true
        }
      ];
    });
  }

  function moveRow(slotKey: string, clientId: string, direction: -1 | 1) {
    updateRows(slotKey, (rows) => {
      const index = rows.findIndex((row) => row.clientId === clientId);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= rows.length) {
        return rows;
      }

      const nextRows = [...rows];
      const [row] = nextRows.splice(index, 1);
      nextRows.splice(nextIndex, 0, row);
      return nextRows.map((item, sortOrder) => ({ ...item, sortOrder }));
    });
  }

  function removeRow(slotKey: string, clientId: string) {
    updateRows(slotKey, (rows) => rows.filter((row) => row.clientId !== clientId));
  }

  async function handleSubmit() {
    setFeedback(null);
    setError(null);

    const payloadSlots = dedupeSlots(
      sections.flatMap((section) =>
        (rowsBySection[section.slotKey] ?? [])
          .filter((row) => row.productId)
          .map((row, index) => ({
            slotKey: section.slotKey,
            productId: row.productId,
            sortOrder: Number.isFinite(row.sortOrder) ? row.sortOrder : index,
            isActive: row.isActive
          }))
      )
    );

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/site/merchandising", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: payloadSlots })
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        slots?: MerchandisingSlot[];
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Ürün vitrinleri kaydedilemedi.");
      }

      if (data.slots) {
        setRowsBySection(createInitialRows(sections, data.slots));
      }

      setFeedback("Ürün vitrinleri güncellendi. Anasayfa ve mağaza önbelleği yenilendi.");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Ürün vitrinleri kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            Ürün vitrinleri
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Mağaza ve anasayfa ürünlerini seçin.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Boş bırakılan alanlar mevcut ürün sıralamasını kullanır. Seçim yaptığınızda ürünler aynı sırayla canlıda gösterilir.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || products.length === 0}
          className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Kaydediliyor..." : "Vitrinleri kaydet"}
        </button>
      </div>

      {feedback ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" aria-live="polite">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" aria-live="assertive">
          {error}
        </p>
      ) : null}

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          Vitrinlere eklenebilecek aktif ürün bulunamadı. Önce ürünleri aktif hale getirin.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {sections.map((section) => {
          const rows = rowsBySection[section.slotKey] ?? [];

          return (
            <section key={section.slotKey} className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">{section.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{section.description}</p>
                  <p className="mt-2 text-xs font-semibold text-emerald-800">
                    En fazla {section.maxItems} ürün gösterilir. Aktif ürün sayısı: {products.length}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addRow(section)}
                  disabled={rows.length >= Math.min(section.maxItems, products.length) || products.length === 0}
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Ürün ekle
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {rows.map((row, index) => {
                  const selectedProduct = productById.get(row.productId);

                  return (
                    <div key={row.clientId} className="min-w-0 overflow-hidden rounded-lg border border-white bg-white p-3 shadow-sm">
                      <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_5.5rem]">
                        <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-600">
                          Ürün
                          <select
                            value={row.productId}
                            onChange={(event) =>
                              updateRows(section.slotKey, (currentRows) =>
                                currentRows.map((item) =>
                                  item.clientId === row.clientId
                                    ? { ...item, productId: event.target.value }
                                    : item
                                )
                              )
                            }
                            className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                          >
                            <option value="">Ürün seçin</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-600">
                          Sıra
                          <input
                            type="number"
                            min="0"
                            value={row.sortOrder}
                            onChange={(event) =>
                              updateRows(section.slotKey, (currentRows) =>
                                currentRows.map((item) =>
                                  item.clientId === row.clientId
                                    ? { ...item, sortOrder: Number(event.target.value) }
                                    : item
                                )
                              )
                            }
                            className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                          />
                        </label>
                        <label className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={row.isActive}
                            onChange={(event) =>
                              updateRows(section.slotKey, (currentRows) =>
                                currentRows.map((item) =>
                                  item.clientId === row.clientId
                                    ? { ...item, isActive: event.target.checked }
                                    : item
                                )
                              )
                            }
                          />
                          Aktif
                        </label>
                      </div>

                      <div className="mt-3 grid min-w-0 gap-3 text-xs text-slate-500 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <span className="block min-w-0 truncate">
                          {selectedProduct
                            ? `${selectedProduct.category} • ${selectedProduct.powerLabel || "Güç bilgisi yok"} • ${selectedProduct.stockLabel}`
                            : "Bu satır kaydedilmez."}
                        </span>
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => moveRow(section.slotKey, row.clientId, -1)}
                            disabled={index === 0}
                            className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 disabled:opacity-40"
                          >
                            Yukarı
                          </button>
                          <button
                            type="button"
                            onClick={() => moveRow(section.slotKey, row.clientId, 1)}
                            disabled={index === rows.length - 1}
                            className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 disabled:opacity-40"
                          >
                            Aşağı
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRow(section.slotKey, row.clientId)}
                            className="rounded-full border border-red-200 px-3 py-1 font-semibold text-red-700"
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {rows.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white/80 p-4 text-sm text-slate-600">
                    Bu vitrin şu anda otomatik ürün sırasını kullanıyor.
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

