const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const testsIndex = JSON.parse(fs.readFileSync(path.join(root,"tests_index.json"),"utf8"));

// --- EDIT THESE URLS ---
const ENV_URL = {
  test:    "http://localhost:3000",
  staging: "https://staging.your-domain.example",
  prod:    "https://app.your-domain.example"
};

function arg(name, def=null){
  const a = process.argv.find(s => s.startsWith(`--${name}=`));
  return a ? a.split("=",2)[1] : def;
}
const env   = arg("env","test");
const scope = arg("scope","central"); // central | local:<ServiceName> | all
const filt  = (arg("filter","")||"").toLowerCase();

process.env.BASE_URL = ENV_URL[env] || ENV_URL.test;

function pickFiles(){
  let files = [];
  if(scope==="central" || scope==="all"){
    files = files.concat(testsIndex.central_tests || []);
  }
  if(scope.startsWith("local:") || scope==="all"){
    const svc = scope.startsWith("local:") ? scope.slice(6) : null;
    for(const [name, arr] of Object.entries(testsIndex.local_by_service || {})){
      if (svc && name !== svc) continue;
      files = files.concat(arr);
    }
  }
  if(filt) files = files.filter(f=>f.toLowerCase().includes(filt));
  return files;
}

function detectFramework(){
  const hasVitest = fs.existsSync(path.join(root,"vitest.config.ts")) || fs.existsSync(path.join(root,"vitest.config.js"));
  const hasJest   = fs.existsSync(path.join(root,"jest.config.ts"))   || fs.existsSync(path.join(root,"jest.config.js"));
  return hasVitest ? "vitest" : (hasJest ? "jest" : "none");
}

const files = pickFiles();
const framework = detectFramework();

const runId = new Date().toISOString().replace(/[:.]/g,"-");
const outDir = path.join(root,"_evidence","runs", runId);
fs.mkdirSync(outDir, { recursive: true });

const results = [];

function runNodeFile(f){
  // Only attempt to directly run CJS/MJS/JS; TS will be marked skipped.
  if (/\.ts$/.test(f)) return { file:f, status:"skipped", reason:"TypeScript test (needs framework)", exitCode:null, ms:0 };
  const start = Date.now();
  const res = spawnSync(process.execPath, [f], { env: process.env, stdio: "pipe" });
  const ms = Date.now()-start;
  return {
    file: f,
    status: res.status===0 ? "passed" : "failed",
    exitCode: res.status,
    ms,
    stdout: (res.stdout||"").toString(),
    stderr: (res.stderr||"").toString()
  };
}

function runFramework(framework, list){
  const cmd = framework==="vitest" ? "npx" : "npx";
  const args = framework==="vitest"
    ? ["vitest","run","--reporter","basic", ...list]
    : ["jest","--runInBand", ...list];
  const start = Date.now();
  const res = spawnSync(cmd, args, { env: process.env, stdio: "pipe", shell: true });
  const ms = Date.now()-start;
  return {
    file: `[${framework}] ${list.length} test(s)`,
    status: res.status===0 ? "passed" : "failed",
    exitCode: res.status,
    ms,
    stdout: (res.stdout||"").toString(),
    stderr: (res.stderr||"").toString()
  };
}

if(!files.length){
  console.log("No tests matched selection.");
  process.exit(0);
}

let summary;
if (framework !== "none") {
  summary = runFramework(framework, files);
  results.push(summary);
} else {
  for(const f of files){
    results.push(runNodeFile(f));
  }
}

// write artifacts
fs.writeFileSync(path.join(outDir,"summary.json"), JSON.stringify({
  when: new Date().toISOString(),
  env,
  base_url: process.env.BASE_URL,
  scope,
  filter: filt,
  framework,
  results
}, null, 2), "utf8");

const csv = [
  "file,status,exitCode,ms",
  ...results.map(r => `"${r.file.replace(/"/g,'""')}",${r.status},${r.exitCode??""},${r.ms??0}`)
].join("\n");
fs.writeFileSync(path.join(outDir,"summary.csv"), csv, "utf8");

console.log(`Run complete: ${results.length} item(s). Artifacts -> ${outDir}`);
