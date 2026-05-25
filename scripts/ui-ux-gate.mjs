import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs", "ui-ux");

const requiredDocs = [
  "README.md",
  "01-Master-UI-UX-QA-Checklist.md",
  "02-Heuristic-UX-Audit-Prompt.md",
  "03-Full-UI-Consistency-Audit-Prompt.md",
  "04-Broken-State-And-Dead-Control-Prompt.md",
  "05-Task-Based-Manual-QA-Runbook.md",
  "06-Design-System-Consistency-Prompt.md",
  "07-Regression-And-Release-Gate.md"
];

const requiredRoutes = [
  "src/app/(site)/page.tsx",
  "src/app/(site)/magaza/page.tsx",
  "src/app/(site)/urun/[slug]/page.tsx",
  "src/app/(site)/urun-secici/page.tsx",
  "src/app/(site)/karsilastir/page.tsx",
  "src/app/(site)/sepet/page.tsx",
  "src/app/(site)/odeme/page.tsx",
  "src/app/admin/(panel)/page.tsx",
  "src/app/admin/(panel)/site/page.tsx",
  "playwright.config.ts",
  "tests/e2e/store-checkout.spec.ts",
  "tests/e2e/admin.spec.ts"
];

const sourceRoots = ["src/app", "src/components"];
const failPatterns = [
  {
    id: "pure-hash-link",
    regex: /href\s*=\s*(?:["']#["']|\{["']#["']\})/g,
    message: "Saf # link false affordance uretir; gercek route veya button kullan."
  },
  {
    id: "javascript-href",
    regex: /href\s*=\s*(?:["']javascript:|\{["']javascript:)/gi,
    message: "javascript: href guvenlik ve erisilebilirlik riski tasir."
  },
  {
    id: "empty-click-handler",
    regex: /on(?:Click|Submit)\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/g,
    message: "Bos event handler gorunen ama calismayan kontrol riski tasir."
  }
];

let hasFailure = false;
const findings = [];

checkDocs();
checkRoutes();
scanSource();
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

function checkRoutes() {
  for (const route of requiredRoutes) {
    if (fs.existsSync(path.join(root, route))) {
      pass("routes", `${route} mevcut.`);
    } else {
      fail("routes", `${route} eksik; UI/UX runbook kritik akisi dogrulayamaz.`);
    }
  }
}

function scanSource() {
  const files = sourceRoots
    .flatMap((sourceRoot) => walk(path.join(root, sourceRoot)))
    .filter((file) => /\.(tsx|ts|jsx|js)$/.test(file));

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(root, file).replace(/\\/g, "/");

    for (const pattern of failPatterns) {
      pattern.regex.lastIndex = 0;

      for (const match of content.matchAll(pattern.regex)) {
        const line = lineNumber(content, match.index ?? 0);
        fail(pattern.id, `${relativePath}:${line} ${pattern.message}`);
      }
    }
  }

  if (!findings.some((finding) => failPatterns.some((pattern) => pattern.id === finding.group))) {
    pass("source-scan", "Bariz olu kontrol kalibi bulunmadi.");
  }
}

function walk(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(entryPath);
    }

    return entry.isFile() ? [entryPath] : [];
  });
}

function lineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function pass(group, detail) {
  findings.push({ level: "pass", group, detail });
}

function fail(group, detail) {
  hasFailure = true;
  findings.push({ level: "fail", group, detail });
}

function printSummary() {
  console.log("ParkChargeEV UI/UX gate");
  console.log("");

  for (const finding of findings) {
    console.log(`${finding.level === "pass" ? "[PASS]" : "[FAIL]"} ${finding.group}: ${finding.detail}`);
  }

  console.log("");
  console.log(hasFailure ? "Sonuc: UI/UX release gate bloklandi." : "Sonuc: UI/UX release gate temiz.");
}
