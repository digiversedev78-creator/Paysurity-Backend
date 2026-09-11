const fs = require("fs");
const path = require("path");

const exists = (p) => fs.existsSync(p);
const safeRead = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return ""; } };

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage", ".next", "out", ".turbo", "vendor", ".cache"]);

function walk(root, exts) {
  const out = [];
  function rec(d) {
    if (!exists(d)) return;
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const ent of entries) {
      const name = ent.name;
      const p = path.join(d, name);
      if (ent.isDirectory()) {
        if (SKIP_DIRS.has(name)) continue;
        rec(p);
      } else {
        if (p.toLowerCase().includes("node_modules")) continue;
        if (!exts || exts.some(e => p.toLowerCase().endsWith(e))) out.push(p);
      }
    }
  }
  rec(root);
  return out;
}

/** Existing apps/packages discovery (kept) */
function detectAppsAndServices(root) {
  const appsDir     = path.join(root, "apps");
  const packagesDir = path.join(root, "packages");

  const apps = exists(appsDir)
    ? fs.readdirSync(appsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => {
          const p       = path.join(appsDir, d.name);
          const pkgPath = path.join(p, "package.json");
          let framework;
          try {
            if (exists(pkgPath)) {
              const pkg = JSON.parse(safeRead(pkgPath));
              if (pkg?.dependencies?.next)         framework = "nextjs";
              else if (pkg?.dependencies?.fastify) framework = "api-fastify";
            }
          } catch {}
          const name   = d.name;
          const domain = name.includes("admin") ? "admin"
                       : name.includes("public") ? "public"
                       : name.includes("api")    ? "api"
                       : undefined;
          return { name, path: p.replace(/\\/g, "/"), framework, domain };
        })
    : [];

  const packages = exists(packagesDir)
    ? fs.readdirSync(packagesDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => {
          const p       = path.join(packagesDir, d.name);
          const pkgPath = path.join(p, "package.json");
          let version;
          try { if (exists(pkgPath)) version = JSON.parse(safeRead(pkgPath))?.version; } catch {}
          return { name: d.name, path: p.replace(/\\/g, "/"), version };
        })
    : [];

  return { apps, packages };
}

/** NEW: detect top-level services (folders with package.json at repo root) */
function detectTopLevelServices(root) {
  let entries = [];
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch {}
  const services = [];
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const name = ent.name;
    if (SKIP_DIRS.has(name)) continue;
    const p = path.join(root, name);
    const pkgPath = path.join(p, "package.json");
    if (!exists(pkgPath)) continue;
    let framework;
    try {
      const pkg = JSON.parse(safeRead(pkgPath));
      if (pkg?.dependencies?.next)         framework = "nextjs";
      else if (pkg?.dependencies?.fastify) framework = "api-fastify";
      else if (pkg?.dependencies?.express) framework = "api-express";
    } catch {}
    const domain = name.toLowerCase().includes("admin") ? "admin"
                 : name.toLowerCase().includes("portal") ? "public"
                 : name.toLowerCase().includes("api")    ? "api"
                 : undefined;
    services.push({ name, path: p.replace(/\\/g,"/"), framework, domain });
  }
  return services;
}

/** Existing detectors below */
function detectRoutes(serviceRoots) {
  const methods = ["get","post","put","patch","delete","options","head"];
  const out = [];
  for (const s of serviceRoots) {
    const files = [
      ...walk(path.join(s, "src", "routes"), [".ts",".js",".cjs",".mjs"]),
      ...walk(path.join(s, "routes"),       [".ts",".js",".cjs",".mjs"])
    ];
    for (const f of files) {
      const txt = safeRead(f);
      for (const m of methods) {
        const re = new RegExp("\\\\." + m + "\\s*\\(\\s*['\\\"`]([^'\\\"`)]+)", "g");
        let match;
        while ((match = re.exec(txt))) {
          const p = match[1].startsWith("/") ? match[1] : "/" + match[1];
          out.push({ service: path.basename(s), method: m.toUpperCase(), path: p, file: f.replace(/\\/g, "/") });
        }
      }
    }
  }
  const map = new Map(out.map(o => [`${o.service}|${o.method}|${o.path}|${o.file}`, o]));
  return [...map.values()];
}

function detectMigrations(serviceRoots) {
  const out = [];
  for (const s of serviceRoots) {
    for (const cand of [path.join(s, "db", "migrations"), path.join(s, "migrations")]) {
      if (exists(cand)) {
        const files = walk(cand).map(p => p.replace(/\\/g, "/"));
        if (files.length) out.push({ service: path.basename(s), dir: cand.replace(/\\/g, "/"), files });
      }
    }
  }
  return out;
}

function detectWebhooks(serviceRoots) {
  const out = [];
  const rx  = /\/webhooks\/[A-Za-z0-9_\/-]+/;
  for (const s of serviceRoots) {
    const files = walk(path.join(s, "src", "webhooks"), [".ts",".js",".cjs",".mjs"]);
    for (const f of files) {
      const txt = safeRead(f);
      const m   = txt.match(rx);
      if (m) out.push({ path: m[0], file: f.replace(/\\/g, "/") });
    }
  }
  return out;
}

function detectQueuesAndJobs(serviceRoots) {
  const queues    = [];
  const schedules = [];
  for (const s of serviceRoots) {
    for (const d of [path.join(s, "src", "queues"), path.join(s, "src", "jobs"), path.join(s, "jobs")]) {
      for (const f of walk(d, [".ts",".js",".cjs",".mjs"])) {
        const txt = safeRead(f);
        const q   = /new\s+Queue\s*<.*?>?\(\s*['"`]([^'"`]+)['"`]/.exec(txt);
        if (q) queues.push({ name: q[1], file: f.replace(/\\/g, "/") });
        const c   = /cron\s*:\s*['"`]([^'"`]+)['"`]/.exec(txt) || /schedule\(\s*['"`]([^'"`]+)['"`]/.exec(txt);
        if (c) schedules.push({ schedule: c[1], file: f.replace(/\\/g, "/") });
      }
    }
  }
  return { queues, schedules };
}

function detectIdentityRoles(root) {
  const files = walk(root, [".ts",".js",".cjs",".mjs"]);
  const roles = new Set();
  const re    = /\b(SUPER_ADMIN|SUB_SUPER_ADMIN|MERCHANT_OWNER|STORE_MANAGER|EMPLOYEE|AFFILIATE|RESELLER)\b/g;
  for (const f of files) {
    const txt = safeRead(f);
    let m;
    while ((m = re.exec(txt))) roles.add(String(m[1]).toUpperCase());
  }
  return [...roles];
}

function detectProcessors(root) {
  const adaptersDir = path.join(root, "packages", "payments-core", "src", "adapters");
  let available = [];
  try {
    if (exists(adaptersDir)) {
      available = fs.readdirSync(adaptersDir)
        .filter(f => /\.(ts|js|cjs|mjs)$/.test(f))
        .map(f => f.replace(/\.(ts|js|cjs|mjs)$/, ""));
    }
  } catch {}
  const current = process.env.PAYMENT_PROCESSOR || "fluidpay";
  return { current, available };
}

/** NEW: OpenAPI discovery */
function findOpenApiFiles(root) {
  const cand = walk(root, [".yaml",".yml",".json",".ts",".js"]);
  const hits = [];
  for (const f of cand) {
    const low = f.toLowerCase();
    if (low.endsWith("openapi.yaml") || low.endsWith("openapi.yml") || low.endsWith("openapi.json") || low.includes("swagger")) {
      hits.push(f.replace(/\\/g,"/"));
      continue;
    }
    if (/\.(yaml|yml|json)$/.test(low)) {
      const txt = safeRead(f);
      if (/openapi:\s*3\./.test(txt) || /"openapi"\s*:\s*"3\./.test(txt)) hits.push(f.replace(/\\/g,"/"));
    }
  }
  return [...new Set(hits)];
}

/** NEW: .env keys (names only) */
function listEnvKeyNames(root) {
  let envFiles = [];
  try { envFiles = fs.readdirSync(root).filter(n => n.startsWith(".env")); } catch {}
  const keys = new Set();
  for (const name of envFiles) {
    const p = path.join(root, name);
    const txt = safeRead(p);
    for (const line of (txt.split(/\r?\n/) || [])) {
      const m = /^\s*([A-Z0-9_]+)\s*=/.exec(line);
      if (m) keys.add(m[1]);
    }
  }
  return [...keys].sort();
}

/** NEW: list test files for a service root */
function listTestFiles(serviceRoot) {
  const files = walk(serviceRoot, [".ts",".tsx",".js",".jsx",".cjs",".mjs"]);
  const isTest = (p) => /(^|[\/\\])(tests?|__tests__|spec|e2e|cypress|playwright)([\/\\]|$)/i.test(p)
                      || /\.test\.(ts|tsx|js|jsx|cjs|mjs)$/i.test(p)
                      || /\.spec\.(ts|tsx|js|jsx|cjs|mjs)$/i.test(p);
  return files.filter(isTest).map(p => p.replace(/\\/g,"/"));
}

/** NEW: evidence dirs for a service root */
function listEvidenceDirs(serviceRoot) {
  const candidates = ["_evidence","evidence","validation","Tests"].map(n => path.join(serviceRoot,n));
  return candidates.filter(d => exists(d)).map(d => d.replace(/\\/g,"/"));
}

module.exports = {
  walk,
  detectAppsAndServices,
  detectTopLevelServices,
  detectRoutes,
  detectMigrations,
  detectWebhooks,
  detectQueuesAndJobs,
  detectIdentityRoles,
  detectProcessors,
  findOpenApiFiles,
  listEnvKeyNames,
  listTestFiles,
  listEvidenceDirs
};
function listTestFiles(root){
  const pats = [".test.ts",".test.tsx",".test.js",".test.jsx",".test.cjs",".test.mjs",
                ".spec.ts",".spec.tsx",".spec.js",".spec.jsx",".spec.cjs",".spec.mjs"];
  const files = walk(root);
  return files
    .filter(p => pats.some(suf => p.toLowerCase().endsWith(suf)))
    .map(p => p.replace(/\\/g,"/"));
}
module.exports.listTestFiles = listTestFiles;
