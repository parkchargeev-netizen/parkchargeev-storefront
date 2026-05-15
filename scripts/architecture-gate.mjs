import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs", "technical-architecture");

const requiredDocs = [
  "README.md",
  "01-Master-Technical-Audit-Prompt.md",
  "02-Codebase-Architecture-Review-Prompt.md",
  "03-Backend-Service-And-API-Audit-Prompt.md",
  "04-Frontend-Architecture-And-State-Audit-Prompt.md",
  "05-Database-Schema-And-Data-Flow-Audit-Prompt.md",
  "06-Integration-Queue-And-Worker-Audit-Prompt.md",
  "07-Security-Auth-And-Runtime-Audit-Prompt.md",
  "08-Performance-Scalability-And-Observability-Prompt.md",
  "09-Test-Quality-And-Release-Readiness-Prompt.md",
  "10-Master-Technical-QA-Checklist.md"
];

const requiredFiles = [
  "next.config.ts",
  "tsconfig.json",
  "eslint.config.mjs",
  "drizzle.config.ts",
  "src/middleware.ts",
  "src/app/layout.tsx",
  "src/app/api/health/route.ts",
  "src/server/db/schema.ts",
  "src/server/db/client.ts",
  "src/server/auth/guards.ts",
  "src/server/auth/session.ts",
  "src/server/auth/authorization.ts",
  "src/server/admin/repository.ts",
  "src/server/admin/order-repository.ts",
  "src/server/admin/validators.ts",
  "src/server/admin/audit.ts",
  "src/server/site/repository.ts",
  "src/lib/runtime-config.ts",
  "src/lib/paytr.ts",
  "src/lib/server-logger.ts",
  "playwright.config.ts",
  "scripts/runtime-smoke.mjs",
  "scripts/admin-smoke.mjs",
  "scripts/ui-ux-gate.mjs",
  "tests/e2e/store-checkout.spec.ts",
  "tests/e2e/admin.spec.ts"
];

const requiredScripts = [
  "typecheck",
  "lint",
  "build",
  "verify:runtime",
  "verify:architecture",
  "verify:uiux",
  "verify:admin",
  "verify:e2e",
  "verify:a11y",
  "verify:visual",
  "verify:app",
  "verify:release"
];

const secretPatterns = [
  { name: "GitHub token", regex: /\bghp_[A-Za-z0-9_]{20,}\b/g },
  { name: "GitHub fine-grained token", regex: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g },
  { name: "Vercel token", regex: /\bvcp_[A-Za-z0-9_]{20,}\b/g },
  { name: "Supabase JWT", regex: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g }
];

const sourceRoots = ["src", "scripts", "docs"];
const findings = [];
let hasFailure = false;

checkDocs();
checkCoreFiles();
checkPackageScripts();
checkApiRoutes();
scanForSecrets();
scanLargeFiles();
printSummary();

process.exitCode = hasFailure ? 1 : 0;

function checkDocs() {
  for (const file of requiredDocs) {
    const filePath = path.join(docsDir, file);

    if (!fs.existsSync(filePath)) {
      fail("docs", `${file} eksik.`);
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");

    if (!content.includes("ParkChargeEV")) {
      fail("docs", `${file} ParkChargeEV'e uyarlanmis gorunmuyor.`);
    } else {
      pass("docs", `${file} mevcut ve projeye ozellestirilmis.`);
    }
  }
}

function checkCoreFiles() {
  for (const file of requiredFiles) {
    if (fs.existsSync(path.join(root, file))) {
      pass("core", `${file} mevcut.`);
    } else {
      fail("core", `${file} eksik; mimari gate kritik katmani dogrulayamiyor.`);
    }
  }
}

function checkPackageScripts() {
  const packageJsonPath = path.join(root, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    fail("scripts", "package.json eksik.");
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const scripts = packageJson.scripts ?? {};

  for (const script of requiredScripts) {
    if (typeof scripts[script] === "string" && scripts[script].trim().length > 0) {
      pass("scripts", `${script} tanimli.`);
    } else {
      fail("scripts", `${script} script'i tanimli degil.`);
    }
  }

  if (scripts["verify:release"]?.includes("verify:architecture")) {
    pass("scripts", "verify:release mimari gate'i calistiriyor.");
  } else {
    fail("scripts", "verify:release icinde verify:architecture yok.");
  }

  for (const releaseStep of ["verify:admin", "verify:e2e", "verify:a11y", "verify:visual"]) {
    if (scripts["verify:release"]?.includes(releaseStep)) {
      pass("scripts", `verify:release ${releaseStep} adimini calistiriyor.`);
    } else {
      fail("scripts", `verify:release icinde ${releaseStep} yok.`);
    }
  }
}

function checkApiRoutes() {
  const apiDir = path.join(root, "src", "app", "api");
  const routeFiles = walk(apiDir).filter((file) => file.endsWith("route.ts"));

  if (routeFiles.length < 10) {
    fail("api", `API route sayisi beklenenden dusuk: ${routeFiles.length}.`);
    return;
  }

  pass("api", `${routeFiles.length} API route handler bulundu.`);

  for (const file of routeFiles) {
    const content = fs.readFileSync(file, "utf8");
    const relativePath = relative(file);

    if (/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/.test(content)) {
      pass("api", `${relativePath} HTTP method export ediyor.`);
    } else {
      fail("api", `${relativePath} HTTP method export etmiyor.`);
    }
  }
}

function scanForSecrets() {
  const files = sourceRoots
    .flatMap((sourceRoot) => walk(path.join(root, sourceRoot)))
    .filter((file) => /\.(ts|tsx|js|jsx|mjs|md|json)$/.test(file));

  let secretFindingCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");

    for (const pattern of secretPatterns) {
      pattern.regex.lastIndex = 0;

      for (const match of content.matchAll(pattern.regex)) {
        secretFindingCount += 1;
        fail(
          "secrets",
          `${relative(file)}:${lineNumber(content, match.index ?? 0)} ${pattern.name} kalibi bulundu. Secret commitlenmemeli.`
        );
      }
    }
  }

  if (secretFindingCount === 0) {
    pass("secrets", "Kaynak ve dokumanlarda bilinen token kalibi bulunmadi.");
  }
}

function scanLargeFiles() {
  const files = ["src/app", "src/components", "src/server"]
    .flatMap((sourceRoot) => walk(path.join(root, sourceRoot)))
    .filter((file) => /\.(ts|tsx)$/.test(file));

  const largeFiles = files
    .map((file) => ({
      file,
      lines: fs.readFileSync(file, "utf8").split(/\r?\n/).length
    }))
    .filter((item) => item.lines > 450)
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 8);

  if (largeFiles.length === 0) {
    pass("size", "450 satir ustu mimari risk dosyasi bulunmadi.");
    return;
  }

  for (const item of largeFiles) {
    warn("size", `${relative(item.file)} ${item.lines} satir; refactor adayi olarak izlenmeli.`);
  }
}

function walk(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
      return [];
    }

    if (entry.isDirectory()) {
      return walk(entryPath);
    }

    return entry.isFile() ? [entryPath] : [];
  });
}

function lineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function relative(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function pass(group, detail) {
  findings.push({ level: "pass", group, detail });
}

function warn(group, detail) {
  findings.push({ level: "warn", group, detail });
}

function fail(group, detail) {
  hasFailure = true;
  findings.push({ level: "fail", group, detail });
}

function printSummary() {
  console.log("ParkChargeEV technical architecture gate");
  console.log("");

  for (const finding of findings) {
    console.log(`${levelBadge(finding.level)} ${finding.group}: ${finding.detail}`);
  }

  console.log("");
  console.log(
    hasFailure
      ? "Sonuc: teknik mimari release gate bloklandi."
      : "Sonuc: teknik mimari release gate temiz."
  );
}

function levelBadge(level) {
  switch (level) {
    case "pass":
      return "[PASS]";
    case "warn":
      return "[WARN]";
    default:
      return "[FAIL]";
  }
}
