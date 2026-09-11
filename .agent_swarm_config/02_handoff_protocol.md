# Swarm Handoff Protocol

This document defines the strict, human-free handoff mechanisms between specialized agents in the PaySurity Swarm.

## 1. Backend to Frontend Handoff
When the Backend Agent completes an API sprint, it must pass the contract to the Frontend Agent without verbal ambiguity.

**The Protocol:**
1. **API Contract Generation:** The Backend Agent automatically generates a strictly typed OpenAPI (Swagger) JSON specification and outputs standard Zod schemas into `packages/shared-types`.
2. **Event Trigger:** The Backend Agent writes a semantic `READY_FOR_UI` flag into the `MASTER_LEDGER.json` under the specific Sprint/Vertical.
3. **Frontend Ingestion:** The Chief Architect detects the flag and dispatches the Frontend Agent.
4. **Execution:** The Frontend Agent is instructed to ONLY read the generated OpenAPI spec and shared Zod types to construct the UI hooks (e.g., React Query). It is not allowed to guess API structures.

## 2. QA Agent 7-Gate Approval Protocol
The QA Agent serves as the final barrier before code is merged into `main`.

**The Protocol:**
1. **Trigger:** A Swarm PR is opened, triggering the QA Agent.
2. **Gate 1-3 (Schema/Backend Verification):** The QA Agent automatically runs `pnpm db:generate` to check for drift and `pnpm run test:backend`. It verifies PII hashing logic exists via static AST analysis.
3. **Gate 4-5 (UI & Aesthetic):** The QA Agent runs Playwright E2E tests to verify DOM rendering and checks Tailwind class configurations for hardcoded unapproved colors.
4. **Gate 6 (Compilation):** The QA Agent triggers a full `pnpm build`. It strictly evaluates the exit code. If `Exit Code != 0`, the PR is hard-rejected.
5. **Gate 7 (Security):** The QA Agent executes an automated dependency audit (`pnpm audit`) and searches for exposed secrets.
6. **Resolution:** If all 7 Gates pass, the QA Agent auto-merges the PR. If any fail, it assigns a detailed `REJECTION_REPORT.md` back to the responsible agent (Backend or Frontend) and resets the Swarm state.
