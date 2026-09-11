const fs = require("fs");
const path = require("path");

const root = process.cwd();
const runsDir = path.join(root, "_evidence", "runs");
const runs = fs.existsSync(runsDir) ? fs.readdirSync(runsDir).filter(n=>/^\d{4}-\d{2}-\d{2}T/.test(n)).sort() : [];
if(!runs.length){ console.log("No runs yet."); process.exit(0); }

const latest = runs[runs.length-1];
const sumPath = path.join(runsDir, latest, "summary.json");
const s = JSON.parse(fs.readFileSync(sumPath, "utf8"));

const total = (s.results||[]).length || 0;
const passed = (s.results||[]).filter(r=>r.status==="passed").length;
const failed = (s.results||[]).filter(r=>r.status==="failed").length;
const skipped = total - passed - failed;

let md = `

## Automated Test Run
- **When:** ${latest.replace(/T/, " ").replace(/Z$/, "")}
- **Env:** ${s.env} — **Scope:** ${s.scope} — **Framework:** ${s.framework}
- **Total:** ${total} | **Passed:** ${passed} | **Failed:** ${failed} | **Skipped:** ${skipped}
- **Artifacts:** \`_evidence/runs/${latest}/\`
`;
const dash = path.join(root, "_EXECUTIVE_DASHBOARD_V3.md");
fs.appendFileSync(dash, md, "utf8");
console.log("Dashboard updated:", dash);
