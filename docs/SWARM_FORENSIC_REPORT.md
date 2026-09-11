# SWARM FORENSIC REPORT

## 1. SWARM INVENTORY (THE REGISTRY)

### A. The Mega-Leads (Active)
1. **CoreFinance_MegaLead**
   * **PURPOSE:** Enforce ledger schemas, intercept unapproved scope creep (BNPL/Crypto).
   * **TRIGGER:** Invoked dynamically by Orchestrator during Semantic Reconciliation Audits.
   * **POST-COLLABORATION:** Transmits high-priority send_message callbacks to the Orchestrator with audit findings. Pauses in [PLANNING_MODE] until authorized.

2. **Merchant_MegaLead**
   * **PURPOSE:** Monitor Zero-Knowledge Personas, underwriting SLA logic, and PII scrubbing.
   * **TRIGGER:** Invoked dynamically by Orchestrator.
   * **POST-COLLABORATION:** Transmits report; stands by for remediative action.

3. **POS_MegaLead**
   * **PURPOSE:** Oversee Multi-Tenant-Context patterns, KDS architectures, and floor layout definitions.
   * **TRIGGER:** Invoked dynamically by Orchestrator.
   * **POST-COLLABORATION:** Transmits report; stands by for remediative action.

4. **Platform_MegaLead**
   * **PURPOSE:** Dictate Zero-Trust, MFA backings, tenant isolation boundaries, and webhook architecture.
   * **TRIGGER:** Invoked dynamically by Orchestrator.
   * **POST-COLLABORATION:** Transmits report; stands by for remediative action.

5. **Specialized_MegaLead**
   * **PURPOSE:** Govern specialized verticals (Domains 13, 14, 15) such as Catering and Paan order logic.
   * **TRIGGER:** Invoked dynamically by Orchestrator.
   * **POST-COLLABORATION:** Transmits report; stands by for remediative action.

### B. Phase 2 Remediation Swarms (Ephemeral)
1. **Security Swarm**
   * **PURPOSE:** Generate Zero-Trust modules, enforce Row-Level Security, implement Identity frameworks.
   * **TRIGGER:** Executive architectural intervention mandate.
   * **POST-COLLABORATION:** Directly manipulates Git Index objects to apply patches. Terminates upon commit.

2. **Privacy/Compliance Swarm**
   * **PURPOSE:** Obliterate plaintext PII, inject Vault-Reference architecture.
   * **TRIGGER:** Executive architectural intervention mandate.
   * **POST-COLLABORATION:** Git Index modification and commit. Terminates upon commit.

### C. Recovered Python Agents (Dormant)
1. **Chief_Architect, Backend, Frontend, QA** (via swarm_orchestrator.py)
   * **PURPOSE:** Legacy task distribution mapping.
   * **TRIGGER:** [TRIGGER_UNDEFINED: REQUIRES INTERVENTION]
   * **POST-COLLABORATION:** [TRIGGER_UNDEFINED: REQUIRES INTERVENTION]

---

## 2. CONTROL & GUARDRAIL MAPPING

### Global Active Guardrails
*   **The Local Path Ban:** Agents cannot read/write directly to local Windows filesystem paths; all file manipulation must be piped through native git commands.
*   **HITL Purge Approval:** Any command that forces deletion or alters >5 files simultaneously must trigger an [ACTION_REQUIRED: PURGE_APPROVAL] event with a dry-run output.
*   **Zero-Knowledge Persona (ADV-CRM-01):** Raw PII cannot exist in schemas; must use Vault-Reference pointers.
*   **Architectural Invariants:** All financial columns must strictly utilize integer mappings (minor units). Decimals/floats are fatal errors.

### Missing Guardrails / Vulnerabilities
*   **Python Dormant Swarm:** The agents within swarm_orchestrator.py lack any trigger definitions, safety boundaries, or error boundaries.

---

## 3. GAP & SHORTCOMING ANALYSIS

*   **Audit for Redundancy:** The 4 recovered Python agents (Chief_Architect, Backend, Frontend, QA) present severe redundancy. They completely overlap the dynamically initialized Mega-Lead architecture but lack the advanced contextual parameters Mega-Leads use.
*   **Audit for Bottlenecks:** 
    *   *Communication Hand-offs:* Mega-Leads currently report back to the Orchestrator via generic messaging. There is no automated "Pull Request" or "Draft Patch" generation standard, forcing the Orchestrator to parse natural language to construct Drizzle/Postgres remediation scripts.
    *   *Schema Compilation:* Fixing Phase 2 discrepancies required writing Python text-parsing scripts to bypass the Local Path Ban, creating massive cognitive overhead and risking partial logic failures during regex substitutions.
*   **Audit for "Dead-End" Agents:** The swarm_orchestrator.py framework is entirely a "Dead-End." It initializes an array of strings but lacks any logic to attach LLM instructions, models, or actual execution pathways.
