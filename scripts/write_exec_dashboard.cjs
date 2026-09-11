const fs = require("fs");
const path = require("path");
const { readJsonLoose } = require("./json_utils.cjs");

const reportPath = path.join(process.cwd(), "infra_truth_report.json");
if (!fs.existsSync(reportPath)) {
  console.error("infra_truth_report.json not found. Run the generator first.");
  process.exit(1);
}
const r = readJsonLoose(reportPath);

const sevRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const items = (r.super_admin_checklist || []).slice().sort((a,b) =>
  (sevRank[a.severity]-sevRank[b.severity]) ||
  (parseInt(b.detail?.match(/Uncovered˜(\d+)/)?.[1]||"0") - parseInt(a.detail?.match(/Uncovered˜(\d+)/)?.[1]||"0"))
);

const header = `# PaySurity  Super Admin Executive Checklist
Generated: ${new Date().toISOString()}

**Repo:** ${r?.repos?.[0]?.name || "N/A"}  
**Processor:** ${r?.payments?.processor || "N/A"}  
**OpenAPI files:** ${(r?.contracts?.openapi_files||[]).length}  
**Env keys (names only):** ${(r?.environment?.key_names||[]).length}  

---
`;

const lines = [header];
if (!items.length) {
  lines.push("All clear - no uncovered items detected by heuristics.\n");
} else {
  lines.push("| Severity | Service | Action | Detail | Suggestion |");
  lines.push("|---|---|---|---|---|");
  for (const it of items) {
    lines.push(`| ${it.severity} | ${it.service} | ${it.action} | ${it.detail} | ${it.suggest} |`);
  }
  lines.push("\n---\n");
}

lines.push("## Evidence Summary by Service\n");
const audit = r?.evidence?.audit || {};
for (const [svc, ev] of Object.entries(audit)) {
  lines.push(`- **${svc}** - routes: ${ev.routes_total}, covered˜${ev.routes_covered_by_mention}, uncovered˜${ev.routes_uncovered_estimate}, tests: ${ev.tests_count}, evidence dirs: ${ev.evidence_dirs?.join(", ")||"-"}`);
}

fs.writeFileSync(path.join(process.cwd(), "_EXECUTIVE_DASHBOARD_V3.md"), lines.join("\n"), "utf8");
console.log("Wrote _EXECUTIVE_DASHBOARD_V3.md");
