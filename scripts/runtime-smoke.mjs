import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const rootDir = process.cwd();

loadEnvFile(".env");
loadEnvFile(".env.local");

const checks = [];
let hasFailure = false;

await run();

async function run() {
  const databaseUrl = readEnv("DATABASE_URL");
  const paytrMerchantId = readEnv("PAYTR_MERCHANT_ID");
  const paytrMerchantKey = readEnv("PAYTR_MERCHANT_KEY");
  const paytrMerchantSalt = readEnv("PAYTR_MERCHANT_SALT");
  const paytrTestMode = readEnv("PAYTR_TEST_MODE") === "1";
  const paytrTestUserIp = readEnv("PAYTR_TEST_USER_IP");
  const siteUrl = readEnv("NEXT_PUBLIC_SITE_URL");
  const isLocalSite =
    siteUrl.length === 0 ||
    siteUrl.includes("localhost") ||
    siteUrl.includes("127.0.0.1");

  addCheck(
    databaseUrl.length > 0 ? "pass" : "fail",
    "DATABASE_URL",
    databaseUrl.length > 0
      ? "Tanımlı, PostgreSQL bağlantısı test edilecek."
      : "Eksik. Lead, sipariş ve ödeme kayıtları çalışmaz."
  );

  const missingPaytr = [
    ["PAYTR_MERCHANT_ID", paytrMerchantId],
    ["PAYTR_MERCHANT_KEY", paytrMerchantKey],
    ["PAYTR_MERCHANT_SALT", paytrMerchantSalt]
  ].filter(([, value]) => value.length === 0);

  addCheck(
    missingPaytr.length === 0 ? "pass" : "fail",
    "PayTR secrets",
    missingPaytr.length === 0
      ? "Gerekli merchant anahtarları mevcut."
      : `Eksik değişkenler: ${missingPaytr.map(([key]) => key).join(", ")}`
  );

  addCheck(
    paytrTestMode ? "info" : "info",
    "PAYTR_TEST_MODE",
    paytrTestMode ? "Test modu aktif." : "Canlı mod veya kapalı."
  );

  if (paytrTestMode && isLocalSite && paytrTestUserIp.length === 0) {
    addCheck(
      "warn",
      "PAYTR_TEST_USER_IP",
      "Lokal testte önerilir. x-forwarded-for yoksa PayTR kullanıcı IP doğrulaması şaşabilir."
    );
  } else if (paytrTestUserIp.length > 0) {
    addCheck("pass", "PAYTR_TEST_USER_IP", `Tanımlı (${maskValue(paytrTestUserIp)}).`);
  }

  if (databaseUrl.length > 0) {
    const sql = postgres(databaseUrl, {
      connect_timeout: 5,
      max: 1,
      prepare: false
    });

    try {
      await sql`select 1 as ok`;
      addCheck("pass", "Database ping", "PostgreSQL erişimi doğrulandı.");
    } catch (error) {
      addCheck(
        "fail",
        "Database ping",
        error instanceof Error ? error.message : "Bağlantı doğrulanamadı."
      );
    } finally {
      await sql.end({ timeout: 5 });
    }
  }

  printSummary();
  process.exitCode = hasFailure ? 1 : 0;
}

function readEnv(key) {
  return (process.env[key] ?? "").trim();
}

function addCheck(level, label, detail) {
  checks.push({ level, label, detail });

  if (level === "fail") {
    hasFailure = true;
  }
}

function printSummary() {
  console.log("ParkChargeEV runtime smoke check");
  console.log("");

  for (const check of checks) {
    console.log(`${levelBadge(check.level)} ${check.label}: ${check.detail}`);
  }

  console.log("");
  console.log(
    hasFailure
      ? "Sonuç: kritik runtime eksikleri var."
      : "Sonuç: kritik runtime blokeri görünmüyor."
  );
}

function levelBadge(level) {
  switch (level) {
    case "pass":
      return "[PASS]";
    case "fail":
      return "[FAIL]";
    case "warn":
      return "[WARN]";
    default:
      return "[INFO]";
  }
}

function maskValue(value) {
  if (value.length <= 4) {
    return "*".repeat(value.length);
  }

  return `${"*".repeat(value.length - 4)}${value.slice(-4)}`;
}

function loadEnvFile(fileName) {
  const filePath = path.join(rootDir, fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex < 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}
