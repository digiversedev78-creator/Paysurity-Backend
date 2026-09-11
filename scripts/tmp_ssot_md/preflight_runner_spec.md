# Preflight Runner Specification (Machine Readable Gate)

This spec defines deterministic checks an agent MUST execute before building.

## 1) File integrity checks (BLOCKER)
- Parse `00_INDEX.md` and verify all listed requirement files exist.
- Verify sha256 table matches computed sha256 for each file.
- If any mismatch, output `preflight_fail.json` and stop.

## 2) Requirement block validation (BLOCKER)
For each requirement block (`- **Ref:** ...`):
- Must include: Domain/Module, Phase, Priority, Type, Acceptance Criteria (GWT) where applicable, Evidence fields where applicable.
- Normalize into JSON and validate against `preflight.schema.json`.

Stop on:
- Duplicate Ref
- Missing Phase/Priority/Type
- Missing Acceptance Criteria for Phase 1 Must
- Invalid Ref format

## 3) Phase 1 enforcement (BLOCKER)
- Extract Phase 1 Must list.
- Ensure none require deferred modules (20_DEFERRED_VERTICALS.md).
- Enforce decision gates in docs (no PayFac, no cash-load, marketing claim gates).
- Enforce Go-live definition (`merchant.go_live_at`) where referenced.

## 4) Glossary semantic lock (BLOCKER)
- Build `term_registry.json` from 99_GLOSSARY.md.
- Scan requirements for undefined terms/abbreviations.
- Stop if undefined terms exist.

## 5) Provider reuse enforcement (BLOCKER)
- Verify `PSR-EXT-FLUIDPAY-REUSE-20260210-001` exists.
- Verify app/service integrations call ORC only (no direct provider calls).

## 6) POS override enforcement (BLOCKER)
- Verify `PSR-EXT-POS-OVERRIDE-20260210-001` exists.
- Verify Go-live trigger is defined and referenced for post-go-live gating.

## 7) Outputs
PASS:
- preflight_pass.json
- preflight_summary.md
- requirements_inventory.json
- phase1_must_list.json
- term_registry.json

FAIL:
- preflight_fail.json
- blocking_issues.md
