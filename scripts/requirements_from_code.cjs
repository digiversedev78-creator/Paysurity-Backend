const fs = require("fs");
const path = require("path");

// Inputs
const root = process.cwd();
const INDEX = 'C:\\Projects\\PaySurity\\scripts\\repo_index.json';
const INFRA = path.join(root, "infra_truth_report.json");
const DOC_AUDIT = path.join(root, "_DOC_AUDIT.json");

// Outputs
const OUT_MD = path.join(root, "_REQUIREMENTS_AS_IS_V1.md");
const OUT_JSON = path.join(root, "_REQUIREMENTS_AS_IS_V1.json");

// Helpers
function readJsonLoose(s) {
  let txt = fs.readFileSync(s, "utf8");
  if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
  const iObj = txt.indexOf("{"), iArr = txt.indexOf("[");
  const starts = [iObj, iArr].filter(i => i >= 0);
  if (!starts.length) throw new Error("No JSON start in " + s);
  txt = txt.slice(Math.min(...starts));
  const lastObj = txt.lastIndexOf("}"), lastArr = txt.lastIndexOf("]");
  const ends = [lastObj, lastArr].filter(i => i >= 0);
  if (ends.length) txt = txt.slice(0, Math.max(...ends) + 1);
  return JSON.parse(txt);
}

// async generator (fixes the await error)
async function* readJsonl(p) {
  const rl = require("readline").createInterface({
    input: fs.createReadStream(p, { encoding: "utf8" }),
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    const t = (line || "").trim();
    if (!t) continue;
    try { yield JSON.parse(t); } catch { /* skip malformed */ }
  }
}

// Very lightweight detectors
const rxRoute = /\b(app|router)\.(get|post|put|patch|delete)\s*\(\s*["'`](\/[^"'`)]*)/gi;
const rxRoleMention = /\b(SUPER_ADMIN|SUB_SUPER_ADMIN|MERCHANT_OWNER|STORE_MANAGER|AFFILIATE|RESELLER|EMPLOYEE)\b/g;
const rxTodo = /\bTODO\b|\bFIXME\b|\bTBD\b/g;

(async () => {
  if (!fs.existsSync(INDEX)) throw new Error("Run scripts/full_repo_index.cjs first.");

  let infra = {};
  try { infra = readJsonLoose(INFRA) || {}; } catch { infra = {}; }

  let docAudit = {};
  try {
    let s = fs.readFileSync(DOC_AUDIT, "utf8");
    if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
    docAudit = JSON.parse(s);
  } catch { docAudit = {}; }

  const req = {
    meta: {
      generated_at: new Date().toISOString(),
      repo_root: root.replace(/\\/g, "/"),
      source_index: path.basename(INDEX),
      used_infra_truth: !!infra && Object.keys(infra).length > 0,
      used_doc_audit: !!docAudit && Object.keys(docAudit).length > 0
    },
    inventory: {
      services: (infra.apps || []).map(a => ({ name: a.name, framework: a.framework, domain: a.domain || null, path: a.path })),
      roles: (infra.identity?.roles) || [],
      contracts: (infra.contracts?.openapi_files) || [],
    },
    derived: {
      routes: [],              // {file, method, path}
      role_mentions: {},       // role -> count
      todos: [],               // {file, count}
      features: {},            // service -> inferred features[]
    },
    suspected_obsolete_docs: docAudit.candidates_top50 || [],
  };

  const byService = new Map();
  for (const a of (infra.apps || [])) if (a.path) byService.set(a.path.replace(/\\/g, "/"), a.name);

  // Scan the full no-skip index (content fully read at index-time)
  const roleCounts = Object.create(null);
  for await (const rec of readJsonl(INDEX)) {
    if (!rec || !rec.is_text || !rec.content) continue;
    const p = rec.path;

    // Routes
    if (/\.(ts|js|tsx|jsx|cjs|mjs)$/.test(p)) {
      let m;
      rxRoute.lastIndex = 0;
      while ((m = rxRoute.exec(rec.content)) !== null) {
        const method = m[2].toUpperCase();
        const routePath = m[3];
        req.derived.routes.push({ file: p, method, path: routePath });
      }
    }

    // Roles
    rxRoleMention.lastIndex = 0;
    const roles = rec.content.match(rxRoleMention);
    if (roles) for (const r of roles) roleCounts[r] = (roleCounts[r] || 0) + 1;

    // TODOs
    rxTodo.lastIndex = 0;
    const todos = rec.content.match(rxTodo);
    if (todos?.length) req.derived.todos.push({ file: p, count: todos.length });

    // Feature signals by service
    let svc = null;
    for (const [svcPath, svcName] of byService) { if (p.startsWith(svcPath)) { svc = svcName; break; } }
    if (svc) {
      const f = req.derived.features[svc] || (req.derived.features[svc] = new Set());
      if (/swagger|openapi/i.test(rec.content)) f.add("api_contracts");
      if (/queue|bull|sqs|worker|job/i.test(rec.content)) f.add("background_jobs");
      if (/jwt|passport|auth/i.test(rec.content)) f.add("auth");
      if (/postgres|prisma|typeorm|drizzle/i.test(rec.content)) f.add("database");
      if (/kafka|rabbit|pubsub/i.test(rec.content)) f.add("messaging");
      if (/redis/i.test(rec.content)) f.add("redis_cache");
      if (/vitest|jest|playwright|cypress/i.test(rec.content)) f.add("tests_present");
    }
  }
  req.derived.role_mentions = roleCounts;
  for (const k of Object.keys(req.derived.features)) req.derived.features[k] = Array.from(req.derived.features[k]).sort();

  // Build markdown
  let md = `# PaySurity — Requirements (As-Is, Derived From Code)\nGenerated: ${req.meta.generated_at}\n\n`;
  md += `> Source: ${req.meta.source_index} (full file contents were indexed without skipping)\n\n`;

  md += `## Inventory\n`;
  md += `### Services\n`;
  for (const s of req.inventory.services) {
    md += `- **${s.name}** — framework: ${s.framework || "-"} — domain: ${s.domain || "-"} — path: ${s.path}\n`;
  }
  md += `\n### Roles\n- ${req.inventory.roles.join(", ")}\n\n`;
  md += `### API Contracts\n`;
  if (req.inventory.contracts.length) {
    md += `- ${req.inventory.contracts.map(c => path.basename(c)).join("\n- ")}\n\n`;
  } else {
    md += `(none detected)\n\n`;
  }

  md += `## Derived From Source\n`;
  md += `### Routes (sample up to 200)\n`;
  for (const r of req.derived.routes.slice(0, 200)) {
    md += `- \`${r.method}\` ${r.path}  — ${r.file}\n`;
  }

  md += `\n### Role Mentions\n`;
  const roleKeys = Object.keys(req.derived.role_mentions).sort();
  for (const k of roleKeys) md += `- ${k}: ${req.derived.role_mentions[k]}\n`;

  md += `\n### TODO/FIXME/TBD (top 50 by count)\n`;
  req.derived.todos.sort((a, b) => b.count - a.count);
  for (const t of req.derived.todos.slice(0, 50)) md += `- ${t.file} — ${t.count}\n`;

  md += `\n### Feature Signals by Service\n`;
  for (const [svc, feats] of Object.entries(req.derived.features)) {
    md += `- **${svc}**: ${feats.length ? feats.join(", ") : "(none detected)"}\n`;
  }

  md += `\n## Suspected Obsolete / Duplicated Docs (from _DOC_AUDIT)\n`;
  for (const c of (req.suspected_obsolete_docs || [])) {
    md += `- ${c.path} — score=${c.score} reasons=${(c.reasons || []).join(",")}\n`;
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(req, null, 2), "utf8");
  fs.writeFileSync(OUT_MD, md, "utf8");
  console.log("Wrote:", path.basename(OUT_MD), "and", path.basename(OUT_JSON));
})();
