import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const root = process.cwd();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...parts] = trimmed.split("=");
    const rawValue = parts.join("=").trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function assertFile(relativePath) {
  const absolutePath = path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Eksik admin dosyasi: ${relativePath}`);
  }
}

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const requiredFiles = [
  "src/app/admin/(panel)/adminler/page.tsx",
  "src/app/admin/(panel)/erisim/page.tsx",
  "src/app/admin/(panel)/saha/page.tsx",
  "src/app/admin/(panel)/blog/page.tsx",
  "src/app/admin/(panel)/katalog/page.tsx",
  "src/app/admin/(panel)/paytr/page.tsx",
  "src/app/admin/(panel)/audit/page.tsx",
  "src/app/admin/(panel)/site/page.tsx",
  "src/app/api/admin/users/route.ts",
  "src/app/api/admin/service-leads/route.ts",
  "src/app/api/admin/blog/route.ts",
  "src/app/api/admin/catalog/route.ts",
  "src/app/api/admin/paytr/route.ts",
  "src/app/api/admin/audit/route.ts",
  "src/app/api/admin/media/upload/route.ts",
  "src/app/api/admin/site/navigation/route.ts",
  "src/app/api/admin/site/pages/route.ts",
  "src/components/admin/navigation-item-form.tsx",
  "src/components/admin/site-page-form.tsx",
  "src/server/admin/access-map.ts"
];

for (const file of requiredFiles) {
  assertFile(file);
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tanimli degil; admin smoke test canli veritabani olmadan kosamaz.");
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  prepare: false
});

const requiredTables = [
  "admin_users",
  "admin_sessions",
  "audit_logs",
  "products",
  "product_variants",
  "orders",
  "quote_requests",
  "service_leads",
  "blog_posts",
  "brands",
  "categories",
  "navigation_items",
  "site_pages",
  "paytr_transactions"
];

try {
  const tableRows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name = any(${requiredTables})
  `;
  const existingTables = new Set(tableRows.map((row) => row.table_name));
  const missingTables = requiredTables.filter((table) => !existingTables.has(table));

  if (missingTables.length > 0) {
    throw new Error(`Eksik tablolar: ${missingTables.join(", ")}`);
  }

  const [adminCount] = await sql`select count(*)::int as total from admin_users`;
  const [superadminCount] = await sql`
    select count(*)::int as total
    from admin_users
    where role = 'superadmin'
      and status = 'active'
  `;

  if (!adminCount || Number(adminCount.total) < 1) {
    throw new Error("admin_users tablosunda aktif panel kullanicisi bulunamadi.");
  }

  if (!superadminCount || Number(superadminCount.total) < 1) {
    throw new Error("Tum admin alanlarina erisim icin aktif superadmin kullanicisi bulunamadi.");
  }

  console.log("Admin smoke test basarili.");
  console.log(`Dogrulanan tablo sayisi: ${requiredTables.length}`);
  console.log(`Admin kullanici sayisi: ${adminCount.total}`);
  console.log(`Aktif superadmin sayisi: ${superadminCount.total}`);
} finally {
  await sql.end();
}
