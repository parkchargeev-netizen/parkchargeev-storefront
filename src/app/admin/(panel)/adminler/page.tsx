import Link from "next/link";

import { AdminUserForm } from "@/components/admin/admin-user-form";
import { AdminFilterBar } from "@/components/admin/table/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/table/admin-status-badge";
import { adminRoleLabels } from "@/server/admin/constants";
import { listAdminUserSessions, listAdminUsers } from "@/server/admin/repository";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    cursor?: string;
    from?: string;
    to?: string;
  }>;
};

function buildExportHref(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value);
    }
  }

  params.set("format", "csv");
  params.set("limit", "50");

  return `/api/admin/users?${params.toString()}`;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const query = (await searchParams) ?? {};
  const [users, sessions] = await Promise.all([
    listAdminUsers({ ...query, limit: 12 }),
    listAdminUserSessions({ limit: 8 })
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin Kullanici Yonetimi"
        title="Roller, erisim ve oturumlar"
        description="Admin kullanicilari ekleyin, rollerini degistirin, devre disi birakin ve son oturumlari takip edin."
        action={
          <a
            href={buildExportHref(query)}
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            CSV indir
          </a>
        }
        meta={
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {users.items.length} admin
          </span>
        }
      />

      <AdminFilterBar>
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_170px_170px_auto]">
          <input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Ad veya e-posta ara"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
          />
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tum durumlar</option>
            <option value="active">Aktif</option>
            <option value="invited">Davetli</option>
            <option value="disabled">Devre disi</option>
          </select>
          <input name="from" type="date" defaultValue={query.from ?? ""} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <input name="to" type="date" defaultValue={query.to ?? ""} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
          <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Filtrele
          </button>
        </form>
      </AdminFilterBar>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <h2 className="text-xl font-semibold text-slate-950">Yeni admin ekle</h2>
        <div className="mt-5">
          <AdminUserForm mode="create" />
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <h2 className="text-xl font-semibold text-slate-950">Adminler</h2>
        <div className="mt-5 space-y-4">
          {users.items.map((user) => (
            <div key={user.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-semibold text-slate-950">{user.fullName}</p>
                  <AdminStatusBadge label={user.status} tone={user.status === "active" ? "success" : user.status === "disabled" ? "danger" : "warning"} />
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {adminRoleLabels[user.role]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{user.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Son giris: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("tr-TR") : "Yok"}
                </p>
              </div>
              <AdminUserForm mode="edit" user={user} />
            </div>
          ))}
        </div>
        {users.nextCursor ? (
          <div className="mt-5">
            <Link href={`/admin/adminler?cursor=${encodeURIComponent(users.nextCursor)}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Sonraki sayfa
            </Link>
          </div>
        ) : null}
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <h2 className="text-xl font-semibold text-slate-950">Son oturumlar</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-3 py-3">Admin</th>
                <th className="px-3 py-3">IP</th>
                <th className="px-3 py-3">Son gorulme</th>
                <th className="px-3 py-3">Bitis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.items.map((session) => (
                <tr key={session.id}>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-slate-900">{session.adminName ?? "Bilinmiyor"}</p>
                    <p className="text-xs text-slate-500">{session.adminEmail ?? "-"}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{session.ipAddress ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-600">{new Date(session.lastSeenAt).toLocaleString("tr-TR")}</td>
                  <td className="px-3 py-3 text-slate-600">{new Date(session.expiresAt).toLocaleString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
