import os

rbac_matrix = """

## Multi-Tenant RBAC Data-Mapping Matrix (2026-08-07 Addendum)
| Entity/Data Domain | Tenant-Admin (Global View) | Branch-Manager (Local View) |
| :--- | :--- | :--- |
| **Transactions** | Read/Write all branches | Read/Write assigned branch only |
| **Users/Staff** | Manage all staff | Manage branch staff only |
| **Reporting** | Aggregate across all branches | Branch-specific metrics only |
| **Configuration** | Global settings & overrides | Branch-specific settings only |
| **Customers** | View all customer data | View branch customer data |

*Note: This data-mapping ensures strict row-level security per the PAAGF Constitution and Multi-Tenant SSOT mandates.*

## AI Data Sandboxing & Intra-Tenant Privilege Escalation (2026-08-07 Addendum)
**CRITICAL FLAW RESOLVED:** AI agents are explicitly PROHIBITED from operating with tenant-wide scope.
All AI agents MUST inherit and be cryptographically bound to the strict RBAC permissions and identity of the **invoking user**, preventing intra-tenant privilege escalation. A cashier cannot use prompt injection to extract owner-level data.
"""

files_to_update = [
    r"C:\Projects\PaySurity\Requirements\Canonical\SEC_SECURITY_PRIVACY.md",
    r"C:\Projects\PaySurity\Requirements\PAYSURITY_RTM.md"
]

for f in files_to_update:
    if os.path.exists(f):
        with open(f, 'a', encoding='utf-8') as file:
            file.write(rbac_matrix)
        print(f"Injected RBAC/AI Sandboxing matrices into {f}")
