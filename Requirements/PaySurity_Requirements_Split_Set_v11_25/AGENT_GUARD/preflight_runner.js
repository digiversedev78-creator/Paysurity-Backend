/**
 * PaySurity Preflight Runner (Agent-Proof Gate)
 *
 * Usage:
 *   node AGENT_GUARD/preflight_runner.js .
 *
 * - Verifies 00_INDEX.md file list + sha256 table
 * - Validates requirement blocks have required fields
 * - Enforces Phase 1 rules + key decision gates exist
 * - Outputs preflight_pass.json/preflight_fail.json + summary markdown
 *
 * No external dependencies.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function readFile(p) { return fs.readFileSync(p, "utf8"); }
function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function sha256Text(s) { return crypto.createHash("sha256").update(s, "utf8").digest("hex"); }
function sha256File(p) { return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"); }

function die(outDir, report) {
  const fail = {
    status: "FAIL",
    timestamp: new Date().toISOString(),
    ...report
  };
  fs.writeFileSync(path.join(outDir, "preflight_fail.json"), JSON.stringify(fail, null, 2));
  fs.writeFileSync(path.join(outDir, "blocking_issues.md"), report.blocking_issues_md || "# Blocking issues\n(see preflight_fail.json)\n");
  process.exit(1);
}

function pass(outDir, report) {
  const ok = {
    status: "PASS",
    timestamp: new Date().toISOString(),
    ...report
  };
  fs.writeFileSync(path.join(outDir, "preflight_pass.json"), JSON.stringify(ok, null, 2));
  fs.writeFileSync(path.join(outDir, "preflight_summary.md"), report.summary_md || "# Preflight summary\nPASS\n");
}

function parseShaTable(indexMd) {
  // Find markdown table rows: | file | requirements | sha256 |
  const lines = indexMd.split(/\r?\n/);
  const rows = [];
  let inTable = false;
  for (const line of lines) {
    if (line.trim() === "| file | requirements | sha256 |") { inTable = true; continue; }
    if (!inTable) continue;
    if (line.startsWith("|:--|")) continue;
    if (!line.startsWith("|")) break;
    const cols = line.split("|").map(s => s.trim()).filter(Boolean);
    if (cols.length >= 3) rows.push({ file: cols[0], sha: cols[2] });
  }
  return rows;
}

function extractRequiredFiles(indexMd) {
  // Conservative: required files are the ones in the sha table.
  return parseShaTable(indexMd).map(r => r.file);
}

function parseRequirementBlocks(mdText) {
  const lines = mdText.split(/\r?\n/);
  const blocks = [];
  let cur = null;
  for (const line of lines) {
    if (line.startsWith("- **Ref:**")) {
      if (cur) blocks.push(cur);
      cur = { raw: [line] };
    } else if (cur) {
      // block continues until next Ref or EOF
      cur.raw.push(line);
    }
  }
  if (cur) blocks.push(cur);

  for (const b of blocks) {
    const raw = b.raw.join("\n");
    const ref = (raw.match(/- \*\*Ref:\*\*\s*([A-Z0-9\-]+)/) || [])[1] || null;
    const phase = (raw.match(/- \*\*Phase:\*\*\s*(.+)/) || [])[1] || null;
    const priority = (raw.match(/- \*\*Priority:\*\*\s*(.+)/) || [])[1] || null;
    const domain = (raw.match(/- \*\*Domain\/Module:\*\*\s*(.+)/) || [])[1] || null;
    const type = (raw.match(/- \*\*Type:\*\*\s*(.+)/) || [])[1] || null;
    const hasACHeader = raw.includes("Acceptance Criteria");
    const hasGiven = /\*\*Given\*\*/.test(raw);
    b.ref = ref;
    b.phase = phase;
    b.priority = priority;
    b.domain = domain;
    b.type = type;
    b.hasAC = hasACHeader && hasGiven;
  }
  return blocks.filter(b => b.ref);
}

function main() {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const outDir = root; // write outputs into root by default
  const indexPath = path.join(root, "00_INDEX.md");
  if (!exists(indexPath)) {
    die(outDir, { error: "Missing 00_INDEX.md", blocking_issues_md: "- Missing `00_INDEX.md` at repo root.\n" });
  }

  const idx = readFile(indexPath);
  const shaRows = parseShaTable(idx);
  if (!shaRows.length) {
    die(outDir, { error: "Missing sha table in 00_INDEX.md", blocking_issues_md: "- `00_INDEX.md` does not contain a parsable sha table.\n" });
  }

  // 1) File integrity + sha verification
  const missingFiles = [];
  const shaMismatches = [];
  for (const r of shaRows) {
    const fp = path.join(root, r.file);
    if (!exists(fp)) { missingFiles.push(r.file); continue; }
    if (r.file === "00_INDEX.md") continue; // index has n/a
    if (r.sha === "n/a" || !r.sha) continue;
    const computed = sha256File(fp);
    if (computed !== r.sha) shaMismatches.push({ file: r.file, expected: r.sha, got: computed });
  }
  if (missingFiles.length || shaMismatches.length) {
    const md = [
      "# Blocking issues",
      "",
      missingFiles.length ? "## Missing files" : null,
      missingFiles.length ? missingFiles.map(f => `- ${f}`).join("\n") : null,
      shaMismatches.length ? "## Sha mismatches" : null,
      shaMismatches.length ? shaMismatches.map(m => `- ${m.file}: expected ${m.expected}, got ${m.got}`).join("\n") : null,
      ""
    ].filter(Boolean).join("\n");
    die(outDir, { missing_files: missingFiles, sha_mismatches: shaMismatches, blocking_issues_md: md });
  }

  // 2) Requirement validation + duplicates + Phase 1 Must AC
  const reqFiles = extractRequiredFiles(idx).filter(f => f.endsWith(".md"));
  const allBlocks = [];
  for (const f of reqFiles) {
    const fp = path.join(root, f);
    if (!exists(fp)) continue;
    const text = readFile(fp);
    allBlocks.push(...parseRequirementBlocks(text).map(b => ({...b, file: f })));
  }

  const dupRefs = [];
  const seen = new Map();
  for (const b of allBlocks) {
    if (!b.ref) continue;
    if (seen.has(b.ref)) dupRefs.push({ ref: b.ref, files: [seen.get(b.ref), b.file] });
    else seen.set(b.ref, b.file);
  }

  const missingFields = allBlocks.filter(b => !b.domain || !b.phase || !b.priority || !b.type);
  const phase1MustMissingAC = allBlocks.filter(b => (b.phase || "").includes("Phase 1") && (b.priority || "").includes("Must") && !b.hasAC);

  // 3) Decision gate + key requirement presence checks
  const mustRefs = [
    "PSR-EXT-FLUIDPAY-REUSE-20260210-001",
    "PSR-EXT-POS-OVERRIDE-20260210-001",
    "PSR-EXT-PAYROLL-FILING-GATE-20260210-001"
  ];
  const missingMustRefs = mustRefs.filter(r => !seen.has(r));

  // Go-live semantic lock check (simple)
  const glossaryPath = path.join(root, "99_GLOSSARY.md");
  const glossaryOk = exists(glossaryPath) && readFile(glossaryPath).includes("Go-live") && readFile(glossaryPath).includes("merchant.go_live_at");

  // ORC contract check
  const orcPath = path.join(root, "08_PAYMENT_ORCHESTRATION_ORC.md");
  const orcOk = exists(orcPath) && readFile(orcPath).includes("## ORC adapter contract (minimum Phase 1)") && readFile(orcPath).includes("FluidPay endpoint mapping");

  if (dupRefs.length || missingFields.length || phase1MustMissingAC.length || missingMustRefs.length || !glossaryOk || !orcOk) {
    const md = [
      "# Blocking issues",
      "",
      dupRefs.length ? "## Duplicate Refs" : null,
      dupRefs.length ? dupRefs.map(d => `- ${d.ref}: ${d.files.join(" , ")}`).join("\n") : null,
      missingFields.length ? "## Missing required fields" : null,
      missingFields.length ? missingFields.slice(0,50).map(b => `- ${b.ref} (${b.file}) missing: ${[
        !b.domain ? "Domain/Module" : null,
        !b.phase ? "Phase" : null,
        !b.priority ? "Priority" : null,
        !b.type ? "Type" : null
      ].filter(Boolean).join(", ")}`).join("\n") : null,
      phase1MustMissingAC.length ? "## Phase 1 Must missing Acceptance Criteria (GWT)" : null,
      phase1MustMissingAC.length ? phase1MustMissingAC.slice(0,80).map(b => `- ${b.ref} (${b.file})`).join("\n") : null,
      missingMustRefs.length ? "## Missing critical PSR-EXT gates" : null,
      missingMustRefs.length ? missingMustRefs.map(r => `- ${r}`).join("\n") : null,
      !glossaryOk ? "## Glossary missing Go-live semantic lock" : null,
      !orcOk ? "## ORC contract or mapping missing" : null,
      ""
    ].filter(Boolean).join("\n");
    die(outDir, {
      duplicate_refs: dupRefs.length,
      missing_fields: missingFields.length,
      phase1_must_missing_acceptance_criteria: phase1MustMissingAC.length,
      missing_critical_refs: missingMustRefs,
      glossary_ok: glossaryOk,
      orc_ok: orcOk,
      blocking_issues_md: md
    });
  }

  // PASS output summary
  const summary = [
    "# Preflight summary",
    "",
    "- Status: PASS",
    `- Total requirement blocks: ${allBlocks.length}`,
    `- Phase 1 Must blocks: ${allBlocks.filter(b => (b.phase||"").includes("Phase 1") && (b.priority||"").includes("Must")).length}`,
    "- Duplicate refs: 0",
    "- Phase 1 Must missing AC: 0",
    `- Go-live semantic lock: ${glossaryOk ? "OK" : "FAIL"}`,
    `- ORC contract + mapping: ${orcOk ? "OK" : "FAIL"}`,
    ""
  ].join("\n");

  pass(outDir, {
    total_requirement_blocks: allBlocks.length,
    phase1_must_count: allBlocks.filter(b => (b.phase||"").includes("Phase 1") && (b.priority||"").includes("Must")).length,
    duplicate_refs: 0,
    phase1_must_missing_acceptance_criteria: 0,
    glossary_ok: glossaryOk,
    orc_ok: orcOk,
    summary_md: summary
  });
}

main();
