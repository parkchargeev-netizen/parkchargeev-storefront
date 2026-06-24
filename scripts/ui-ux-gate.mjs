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

const requiredDesignSystemFiles = [
  "src/components/ui/action.tsx",
  "src/components/ui/page-header.tsx",
  "src/components/ui/status-badge.tsx",
  "src/components/ui/surface.tsx",
  "src/components/ui/typography.tsx",
  "src/components/layout/scroll-motion.tsx"
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

const designSystemFailPatterns = [
  {
    id: "negative-tracking",
    regex: /tracking-\[-[^\]]+\]/g,
    message: "Negatif harf araligi yeni tipografi sisteminde yasak."
  },
  {
    id: "font-black",
    regex: /font-black/g,
    message: "Asiri kalin agirlik yerine font-bold veya tasarim tokeni kullan."
  },
  {
    id: "large-rounded",
    regex: /rounded-(?:xl|2xl|3xl)|rounded-\[(?:1[0-9]|[2-9][0-9]|[0-9.]+rem)[^\]]*\]/g,
    allow: (relativePath) => relativePath === "src/components/shop/product-device-preview.tsx",
    message: "Kart ve kontroller 8px radius standardini korumali."
  },
  {
    id: "tiny-text",
    regex: /text-\[(?:9|10|11)px\]/g,
    message: "Okunabilirlik icin 12px meta olceginin altina inilmemeli."
  }
];

let hasFailure = false;
const findings = [];

checkDocs();
checkRoutes();
checkDesignSystemFiles();
checkMotionContract();
checkProductCardContract();
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

function checkDesignSystemFiles() {
  for (const file of requiredDesignSystemFiles) {
    if (fs.existsSync(path.join(root, file))) {
      pass("design-system", `${file} mevcut.`);
    } else {
      fail("design-system", `${file} eksik; ortak UI primitive sozlesmesi korunamaz.`);
    }
  }
}

function checkMotionContract() {
  const scrollMotionPath = path.join(root, "src/components/layout/scroll-motion.tsx");
  const globalsPath = path.join(root, "src/app/globals.css");

  if (!fs.existsSync(scrollMotionPath) || !fs.existsSync(globalsPath)) {
    fail("motion", "Motion runtime veya global reduced-motion stilleri eksik.");
    return;
  }

  const runtime = fs.readFileSync(scrollMotionPath, "utf8");
  const styles = fs.readFileSync(globalsPath, "utf8");

  for (const token of ["[data-motion]", "[data-motion-scope]", "[data-motion-loop]"]) {
    if (runtime.includes(token)) {
      pass("motion", `${token} runtime tarafinda destekleniyor.`);
    } else {
      fail("motion", `${token} runtime sozlesmesi eksik.`);
    }
  }

  if (styles.includes("prefers-reduced-motion: reduce") && styles.includes("[data-motion]")) {
    pass("motion", "Reduced-motion data-motion stilleri mevcut.");
  } else {
    fail("motion", "Reduced-motion data-motion stilleri eksik.");
  }
}

function checkProductCardContract() {
  const productCardPath = path.join(root, "src/components/shop/product-card.tsx");

  if (!fs.existsSync(productCardPath)) {
    fail("product-card", "ProductCard dosyasi eksik.");
    return;
  }

  const content = fs.readFileSync(productCardPath, "utf8");

  if (content.includes("premium-product-card-link") && content.includes("aria-label")) {
    pass("product-card", "Urun karti tek erisilebilir link yuzeyi sunuyor.");
  } else {
    fail("product-card", "Urun karti tek link/aria-label sozlesmesini karsilamiyor.");
  }

  if (content.includes("premium-product-card__actions") || /href=\{?`?\/iletisim/.test(content)) {
    fail("product-card", "Urun kartinda tek hedef sozlesmesini bozan ikincil aksiyon kaldi.");
  } else {
    pass("product-card", "Urun kartinda ikincil Keşif/İncele link aksiyonu yok.");
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

    for (const pattern of designSystemFailPatterns) {
      pattern.regex.lastIndex = 0;

      for (const match of content.matchAll(pattern.regex)) {
        if (pattern.allow?.(relativePath)) {
          continue;
        }

        const line = lineNumber(content, match.index ?? 0);
        fail(pattern.id, `${relativePath}:${line} ${pattern.message}`);
      }
    }
  }

  if (!findings.some((finding) => failPatterns.some((pattern) => pattern.id === finding.group))) {
    pass("source-scan", "Bariz olu kontrol kalibi bulunmadi.");
  }

  if (!findings.some((finding) => designSystemFailPatterns.some((pattern) => pattern.id === finding.group))) {
    pass("design-source-scan", "Tipografi, radius ve okunabilirlik kaliplari standarda uygun.");
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
