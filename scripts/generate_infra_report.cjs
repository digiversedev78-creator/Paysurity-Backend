const fs   = require("fs");
const path = require("path");
const det  = require("./detectors.cjs");

const root = process.cwd();
const { apps, packages } = det.detectAppsAndServices(root);
const topLevel = det.detectTopLevelServices(root);
const allServices = [...apps, ...topLevel];

const apiServices = allServices.filter(a => a && (a.domain === "api" || a.framework?.startsWith("api")));
const serviceRoots = apiServices.map(a => a.path);

const routes      = det.detectRoutes(serviceRoots);
const migrations  = det.detectMigrations(serviceRoots);
const webhooks    = det.detectWebhooks(serviceRoots);
const { queues, schedules } = det.detectQueuesAndJobs(serviceRoots);
const roles       = det.detectIdentityRoles(root);
const processors  = det.detectProcessors(root);
const openapi     = det.findOpenApiFiles(root);
const envKeys     = det.listEnvKeyNames(root);

// Per-service tests/evidence scan + heuristic coverage
const serviceEvidence = {};
for (const svc of allServices) {
  const tests = det.listTestFiles(svc.path);
  const evDirs = det.listEvidenceDirs(svc.path);
  const svcRoutes = routes.filter(r => path.basename(svc.path) === r.service);
  // Simple heuristic: mark a route as covered if any test file mentions the route path string
  let covered = 0;
  for (const r of svcRoutes) {
    const hit = tests.find(t => {
      try { return fs.readFileSync(t, "utf8").includes(r.path); } catch { return false; }
    });
    if (hit) covered++;
  }
  serviceEvidence[svc.name] = {
    service_path: svc.path,
    tests_count: tests.length,
    evidence_dirs: evDirs,
    routes_total: svcRoutes.length,
    routes_covered_by_mention: covered,
    routes_uncovered_estimate: Math.max(0, svcRoutes.length - covered)
  };
}

// Repo-level evidence presence
const evidenceDirs = ["_evidence","evidence","Tests","validation"].filter(d => fs.existsSync(path.join(root,d)));
const missingEvidence = {
  has_any_evidence_dir: evidenceDirs.length > 0,
  notes: evidenceDirs.length ? "Evidence dirs exist but mapping to features not yet verified." : "No evidence directories found."
};

// Build a human checklist (top uncovered)
const checklist = [];
for (const [name, ev] of Object.entries(serviceEvidence)) {
  if (ev.routes_uncovered_estimate > 0 || (ev.tests_count === 0 && ev.routes_total > 0)) {
    checklist.push({
      severity: ev.routes_uncovered_estimate > 0 ? "HIGH" : "MEDIUM",
      service: name,
      action: ev.tests_count === 0 ? "Add baseline API tests" : "Increase API test coverage",
      detail: `Routes=${ev.routes_total}, Covered˜${ev.routes_covered_by_mention}, Uncovered˜${ev.routes_uncovered_estimate}`,
      suggest: "Create e2e tests referencing each route path; store artifacts under _evidence/<service>/."
    });
  }
}
// Sort by severity then by uncovered desc
const sevRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
checklist.sort((a,b) => (sevRank[a.severity]-sevRank[b.severity]) || (parseInt(b.detail.match(/Uncovered˜(\d+)/)?.[1]||"0") - parseInt(a.detail.match(/Uncovered˜(\d+)/)?.[1]||"0")));

const report = {
  meta: { generated_at: new Date().toISOString(), monorepo_root: root.replace(/\\/g, "/") },
  repos: [{ name: path.basename(root) }],
  apps: allServices,
  packages,
  identity: { roles, enforcement: [], tenancy: { model: "multi-tenant (TBD)", notes: "" } },
  contracts: { openapi_files: openapi, sdks: [], uncontracted_routes: routes },
  environment: { key_names: envKeys },
  datastores: migrations.map(m => ({ service: m.service, db: "postgres", schemas: ["public"], migrations: m.files })),
  queues,
  payments: {
    processor: processors.current,
    adapters: processors.available,
    webhooks,
    settlement_jobs: schedules,
    statement_generator: undefined
  },
  evidence: { witness_tests: [], audit: serviceEvidence, missing: missingEvidence },
  observability: { health: [], metrics: [], logs: [] },
  security: { validation: [], rate_limits: [], secret_scan: { enabled: false }, sast: { enabled:false }, admin_ip_allowlist: [] },
  ci_cd: { pipelines: [], previews: [], artifacts: ["coverage","evidence_zip","sbom"] },
  i18n_a11y: { languages: [], coverage_pct: 0, a11y_checks: [] },
  perf_costs: { p95: [], bundle_sizes_kb: [], cost_notes: undefined },
  ai_agents: [],
  contracts_routes: routes,
  unresolved_references: [],
  super_admin_checklist: checklist.slice(0, 15)  // top 15 actions
};

process.stdout.write(JSON.stringify(report, null, 2));
