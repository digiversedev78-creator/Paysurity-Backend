import os

qa_matrix = """
## AI Process Flow & Data-Mapping Testability (2026-08-07 Addendum)
**CRITICAL FLAW RESOLVED:** All AI process flows and Multi-Tenant RBAC data-mappings MUST be mathematically testable.
- E2E tests MUST explicitly assert that an AI agent inherits the exact RBAC permissions of the invoking user.
- E2E tests MUST explicitly assert that data-mappings prevent cross-tenant and intra-tenant privilege escalation (e.g., verifying a Branch-Manager cannot prompt-inject to read Tenant-Admin data).
- NO AI feature can pass the PoW Gateway without Exit Code 0 proof of these negative security test assertions.
"""

files_to_update = [
    r"C:\Projects\PaySurity\Requirements\Canonical\SEC_SECURITY_PRIVACY.md",
    r"C:\Projects\PaySurity\Requirements\PAYSURITY_RTM.md"
]

for f in files_to_update:
    if os.path.exists(f):
        with open(f, 'a', encoding='utf-8') as file:
            file.write(qa_matrix)
        print(f"Injected QA Testability rules into {f}")
