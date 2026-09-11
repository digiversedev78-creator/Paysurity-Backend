# Agent Runbook (requirements → as-is → plan → build → test → deploy)

## Stage 0: Read contracts
Read:
- Requirements/CANONICAL.json
- Requirements/PROJECT_PROFILE.json
- Requirements/STATUS_TAXONOMY.json
- Requirements/REQUIREMENTS_AUTHORING_GUIDE.md

Write:
- AgentOutput/stage0_contract_read.json

## Stage 1: Research + requirements completion
Write:
- AgentOutput/research_summary.md
- Update CANONICAL.json + COVERAGE_MATRIX.csv

Rule: no silent drops. If uncertain, add a requirement as "todo" with explicit assumptions.

## Stage 2: As-is evaluation
Write:
- AgentOutput/as_is_report.md
- Update CANONICAL.status based on evidence
- Add NEW requirements if implemented but undocumented

## Stage 3: Plan
Write:
- AgentOutput/plan.md
- AgentOutput/slices.json (ordered)
- AgentOutput/budget_estimate.json (best-effort)

## Stage 4: Build
Hard rules:
- Implementing a MUST flow implies adding/updating its E2E test immediately.
- Do not set `done` until tests pass and evidence is recorded.

## Stage 5: Test
- unit/integration tests
- E2E tests
- accessibility checks

## Stage 6: Deploy
- deploy to staging
- run smoke tests
- promote to production only if staging is green

## Stage 7: Verify + rollback readiness
- health checks
- monitoring check (if enabled)
- rollback workflow ready
