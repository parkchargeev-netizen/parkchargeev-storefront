"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Command, Search, X } from "lucide-react";

import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";

export type AdminCommandItem = {
  href: string;
  label: string;
  detail: string;
  group: string;
};

type AdminCommandMenuProps = {
  items: AdminCommandItem[];
  roleLabel: string;
  databaseEnabled: boolean;
};

export function AdminCommandMenu({
  items,
  roleLabel,
  databaseEnabled
}: AdminCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [liveItems, setLiveItems] = useState<AdminCommandItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      `${item.label} ${item.detail} ${item.group}`.toLowerCase().includes(normalizedQuery)
    );
  }, [items, query]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!isOpen || normalizedQuery.length < 2) {
      setLiveItems([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);

      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(normalizedQuery)}`, {
          signal: controller.signal
        });
        const data = (await response.json()) as {
          ok: boolean;
          items?: AdminCommandItem[];
        };

        setLiveItems(response.ok && data.ok ? data.items ?? [] : []);
      } catch {
        if (!controller.signal.aborted) {
          setLiveItems([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isOpen, query]);

  const groupedItems = useMemo(() => {
    const mergedItems = [
      ...liveItems.map((item) => ({
        ...item,
        group: `Canlı sonuçlar - ${item.group}`
      })),
      ...filteredItems
    ];

    return mergedItems.reduce<Record<string, AdminCommandItem[]>>((groups, item) => {
      groups[item.group] = [...(groups[item.group] ?? []), item];
      return groups;
    }, {});
  }, [filteredItems, liveItems]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 lg:w-[420px]"
      >
        <span className="flex min-w-0 items-center gap-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate text-sm font-medium text-slate-600">
            Admin alanında ara veya hızlı işlem aç
          </span>
        </span>
        <span className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500 sm:flex">
          <Command className="h-3.5 w-3.5" /> K
        </span>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/30 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Admin komut menüsü"
            className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)]"
          >
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Sipariş, müşteri, teklif, ürün, istasyon..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                  aria-label="Komut menüsünü kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                  {roleLabel}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  {databaseEnabled ? "Canlı veri" : "Yerel yedek veri"}
                </span>
                {isSearching ? (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                    Aranıyor
                  </span>
                ) : null}
              </div>
            </div>

            <div className="max-h-[62vh] overflow-y-auto p-3">
              {Object.entries(groupedItems).length > 0 ? (
                Object.entries(groupedItems).map(([group, groupItems]) => (
                  <div key={group} className="py-2">
                    <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {group}
                    </p>
                    <div className="mt-2 space-y-1">
                      {groupItems.map((item) => (
                        <AdminPrefetchLink
                          key={`${item.href}-${item.label}`}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition hover:bg-blue-50"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-950">
                              {item.label}
                            </span>
                            <span className="mt-1 block truncate text-xs text-slate-500">
                              {item.detail}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                        </AdminPrefetchLink>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-14 text-center">
                  <p className="text-sm font-semibold text-slate-900">Sonuç bulunamadı</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Başka bir modül, işlem ya da durum adı deneyin.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
