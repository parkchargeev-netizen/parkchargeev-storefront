import Link from "next/link";

import { NotificationMarkButton } from "@/components/admin/operation-forms";
import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { listAdminNotifications } from "@/server/admin/operations";

type NotificationsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    cursor?: string;
  }>;
};

function buildHref(basePath: string, query: Record<string, string | undefined>, extra: Record<string, string>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value && key !== "cursor") params.set(key, value);
  }

  for (const [key, value] of Object.entries(extra)) {
    params.set(key, value);
  }

  return `${basePath}?${params.toString()}`;
}

export default async function AdminNotificationsPage({ searchParams }: NotificationsPageProps) {
  const query = (await searchParams) ?? {};
  const result = await listAdminNotifications({
    q: query.q,
    status: query.status,
    cursor: query.cursor,
    limit: 20
  });
  const currentIds = result.items.map((item) => item.id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Bildirim Merkezi"
        title="Operasyon aksiyon merkezi"
        description="Kritik stok, ödeme hatası, sipariş gecikmesi ve risk uyarıları okunmuş/okunmamış olarak yönetilir."
        meta={<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{result.unreadCount} okunmamış</span>}
        action={<NotificationMarkButton ids={currentIds} isRead />}
      />

      <AdminFilterBar>
        <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <input name="q" defaultValue={query.q ?? ""} placeholder="Bildirim ara" className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm" />
          <select name="status" defaultValue={query.status ?? ""} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm">
            <option value="">Tüm bildirimler</option>
            <option value="unread">Okunmamış</option>
            <option value="read">Okunmuş</option>
          </select>
          <button className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Filtrele</button>
        </form>
      </AdminFilterBar>

      <section className="grid gap-3">
        {result.items.length > 0 ? (
          result.items.map((item) => (
            <article key={item.id} className="surface-card border border-slate-200 bg-white/95 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                  <p className="mt-3 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("tr-TR")}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.isRead ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-800"}`}>
                  {item.isRead ? "Okundu" : "Yeni"}
                </span>
              </div>
              {item.href ? (
                <Link href={item.href} className="mt-4 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                  Aksiyona git
                </Link>
              ) : null}
            </article>
          ))
        ) : (
          <p className="surface-card border border-slate-200 bg-white/95 p-8 text-center text-sm text-slate-500">Bildirim bulunamadı.</p>
        )}
      </section>

      {result.nextCursor ? (
        <Link href={buildHref("/admin/bildirimler", query, { cursor: result.nextCursor })} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
          Sonraki sayfa
        </Link>
      ) : null}
    </div>
  );
}
