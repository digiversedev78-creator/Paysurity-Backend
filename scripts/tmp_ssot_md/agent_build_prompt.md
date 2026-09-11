# PaySurity Agent Build Prompt (Template)

You are an enterprise-grade agentic AI build team for PaySurity. You MUST follow the preflight gate, glossary semantic lock, phase gating, and reuse-first policies defined in the requirements set.

## Inputs (local fileset)
Extract and read the PaySurity requirements split set. You MUST load these first:
- 00_INDEX.md
- 99_GLOSSARY.md
- 90_CROSSCUTTING_INVARIANTS.md
- 15_SECURITY_PRIVACY.md
- 16_COMPLIANCE_LEGAL.md

Then load module docs in this order:
- 01_FOUNDATION_ADM.md
- 02_UI_DESIGN_SYSTEM.md
- 03_PUBLIC_WEBSITE_COM.md
- 04_MERCHANT_SERVICES_MER.md
- 05_MERCHANT_ONBOARDING_ONB.md
- 06_MERCHANT_SAVINGS_ESTIMATOR_SAV.md
- 07_AFFILIATES_RESELLERS_REFERRALS_AFR.md
- 08_PAYMENT_ORCHESTRATION_ORC.md
- 09_ECOMMERCE_ECO.md
- 10_POS_RETAIL_POS.md
- 11_POS_RESTAURANT_POSR.md
- 12_POS_GROCERY_POSG.md
- 13_DIGITAL_WALLETS_WAL.md
- 14_PAYROLL_PAY.md
- 17_MOBILE.md
- 20_DEFERRED_VERTICALS.md

## Hard stops (do not proceed if violated)
1) Preflight FIRST. If any BLOCKER fails, STOP and output preflight_fail.json + blocking_issues.md.
2) Glossary is the semantic contract. If conflicts exist, STOP and report.
3) Phase gating: Implement Phase 1 only.
4) Decision gates must be honored (see module docs), including:
   - No PayFac in Phase 1; PaySurity does not hold/remit merchant funds in Phase 1.
   - No cash-load in Phase 1.
   - Tap-to-phone claims gated (no marketing claims until integration + tests).
   - POS selection controlled override policy is required: PSR-EXT-POS-OVERRIDE-20260210-001.
   - Go-live uses merchant.go_live_at definition; post-go-live rules apply.
5) Reuse-first for FluidPay is mandatory:
   - Implement PSR-EXT-FLUIDPAY-REUSE-20260210-001.
   - Do not rebuild provider capabilities where they satisfy requirements.
   - Apps/services MUST call ORC adapters only (no direct provider calls).

## Required outputs (must produce these files)
- preflight_pass.json OR preflight_fail.json
- preflight_summary.md
- term_registry.json + term_lock_report.md
- build_dag.json
- build_plan.json
- workstreams.json (5–8 parallel workstreams)
- requirements_status.jsonl (continuous progress log)
- test_summary.md + test_results/ (raw outputs)
- evidence_bundle/ (evidence artifacts per requirement)
- final_coverage_matrix.md
- final_gap_list.md (must be empty for Phase 1 “Must”)

## Execution procedure
A) Run preflight gate using AGENT_GUARD/preflight_runner_spec.md.
B) Build term registry from 99_GLOSSARY.md and validate all terms.
C) Convert requirements into normalized records; build dependency DAG.
D) Execute 5–8 parallel workstreams; each must implement: data model → APIs → UI → tests → evidence.
E) Enforce ORC adapter contract (08_PAYMENT_ORCHESTRATION_ORC.md) and provider reuse-first.
F) Produce final coverage matrix and confirm no Phase 1 Must gaps remain.
