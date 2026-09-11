/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-006 -- Delivery Driver Assignment (expanded to full driver management)
 * FILE TYPE:    SERVICE
 * MODULE:       delivery
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSR_POS_RESTAURANT.md
 * WORKER:       CODER-052
 * GENERATED:    2026-03-17T13:07:28.256Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */

// We define a minimal type for NodePgDatabase based on the strict rule
// to use `(this.db as any).execute(sql, params)`. In a full Drizzle setup,
// this would involve more complex types for typed query building.
type NodePgDatabase<TSchema extends Record<string, unknown>> = {
  execute: (sql: string, params?: any[]) => Promise<any[]>;
};
