const fs = require("fs");
const path = require("path");
const det = require("./detectors.cjs");
const { readJsonLoose } = require("./json_utils.cjs");

const root = process.cwd();
const report = readJsonLoose(path.join(root,"infra_truth_report.json"));

function walk(dir){
  const out=[]; const skip = new Set(["node_modules",".git","dist","build",".next","coverage"]);
  function rec(d){
    let ents; try { ents = fs.readdirSync(d,{withFileTypes:true}); } catch { return; }
    for(const e of ents){
      const p = path.join(d,e.name);
      if(e.isDirectory()){ if(!skip.has(e.name)) rec(p); }
      else out.push(p);
    }
  }
  if (fs.existsSync(dir)) rec(dir);
  return out;
}

const centralRoot = path.join(root,"Tests");
const central = walk(centralRoot)
  .filter(p=>/\.(test|spec)\.(ts|tsx|js|jsx|cjs|mjs)$/i.test(p))
  .map(p=>p.replace(/\\/g,"/"));

const services = (report.apps || []).map(a=>a.path).filter(Boolean);
const localTests = {};
for(const svc of services){
  const files = det.listTestFiles(svc);
  if(files.length) localTests[path.basename(svc)] = files;
}

const index = {
  generated_at: new Date().toISOString(),
  central_suite_root: fs.existsSync(centralRoot) ? centralRoot.replace(/\\/g,"/") : null,
  central_tests_count: central.length,
  central_tests: central,
  local_by_service: localTests
};

fs.writeFileSync(path.join(root,"tests_index.json"), JSON.stringify(index,null,2), "utf8");

// append a section to dashboard (non-destructive)
try{
  const mdPath = path.join(root,"_EXECUTIVE_DASHBOARD_V3.md");
  let md = fs.existsSync(mdPath) ? fs.readFileSync(mdPath,"utf8") : "# PaySurity  Dashboard\n\n";
  md += `

## Test Suite Index
- **Central suite root:** ${index.central_suite_root || "-"}
- **Central tests:** ${index.central_tests_count}

### Localized tests by service
` + Object.entries(index.local_by_service).map(([s,arr])=>`- **${s}** - ${arr.length} file(s)`).join("\n") + "\n";
  fs.writeFileSync(mdPath, md, "utf8");
} catch {}
console.log("Wrote tests_index.json + updated _EXECUTIVE_DASHBOARD_V3.md");
