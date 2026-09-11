const fs = require('fs');
const path = 'c:/Projects/PaySurity/Requirements/MASTER_LEDGER.json';

const ledger = JSON.parse(fs.readFileSync(path, 'utf-8'));

const newReqs = [
    // Gaps from User Journeys
    { id: "REQ-ECO-005", title: "BOPIS Configuration & Routing" },
    { id: "REQ-POS-013", title: "Override Wait Prevention & Customer Comms" },
    { id: "REQ-AGG-005", title: "Mobile Driver Confirmation Code (Chain of Custody)" },
    { id: "REQ-AFR-011", title: "Affiliate Onboarding & W-9 Collection" },
    { id: "REQ-AFR-012", title: "Reseller White-Label Dashboard Config" },
    { id: "REQ-AFR-013", title: "Sub-Merchant Custom Rate Configuration" },
    { id: "REQ-AFR-014", title: "Sub-Merchant White-Label Portal" },
    { id: "REQ-DEV-003", title: "Remote Terminal Diagnostics & Reboot" },
    { id: "REQ-DEV-004", title: "Over-The-Air (OTA) Patch Deployment" },
    { id: "REQ-MER-003", title: "Automated & Manual Underwriting Queue" },
    { id: "REQ-MER-014", title: "Underwriter Fast-Track Manual Approval" },
    { id: "REQ-COM-003", title: "AML Monitoring & Velocity Detection" },
    { id: "REQ-COM-015", title: "Compliance AML Case Queue" },
    { id: "REQ-ORC-017", title: "Ledger Reconciliation Variance Sign-Off" },
    { id: "REQ-ORC-018", title: "Automated Settlement Suspension (Fraud Lockout)" },
    { id: "REQ-COM-016", title: "Automated SAR Pre-Filing Generation" },
    
    // Leaks from Leak Report
    { id: "ADV-005", title: "Speed-Onboarding (< 120s to Provisional Access)" },
    { id: "ADV-ONB-06", title: "CTA 2026 BOI Compliance (Automated UBO Mapping)" },
    { id: "ADV-ONB-07", title: "Lifecycle Escalation Sentry (Auto-Drain Resolution)" },
    { id: "ADV-ONB-08", title: "Small Merchant Waiver ($1k Vol Exemption)" },
    { id: "ADV-002", title: "Zero-Button Flow (≤ 3 Taps to Receipt)" },
    { id: "ADV-CRM-01", title: "Zero-Knowledge Personas (Ingestion-time Hashing)" },
    { id: "ADV-PRODUCE-AI", title: "Produce AI Keypad-Replacement (Computer Vision)" },
    { id: "OP-OFFLINE-01", title: "Vector Clock / CRDT Merge for Offline Sync" },
    { id: "OP-OFFLINE-02", title: "72-Hour Local-Enclave Crypto-Cache Auth" },
    { id: "OP-OFFLINE-03", title: "Physical Truth Priority in Inventory Collisions" },
    { id: "OP-OFFLINE-04", title: "Cryptographic Intent-Spooling (HSM local settle)" },
    { id: "OP-RETAIL-02", title: "Hardware Dead-Lock Spooler for Offline KDS" },
    { id: "REQ-05", title: "Valor EMV L3: Tip Adjustment post-auth" },
    { id: "REQ-06", title: "Valor EMV L3: Split Check reconciliation tracking" },
    { id: "REQ-07", title: "Valor EMV L3: EBT Eligibility marking on payload" },
    { id: "REQ-08", title: "Valor EMV L3: Dual-Tender (EBT/SNAP fallback)" },
    { id: "REQ-09", title: "Valor EMV L3: Scale/Weight barcode sync" }
];

const newCategory = {
    vertical_id: "99",
    name: "Recovered Advantage & Gap Fills",
    requirement_count: newReqs.length,
    status: "ACTIVE",
    requirements: newReqs.map(req => ({
        id: req.id,
        title: req.title,
        priority: "Must",
        trace: {
            status: "NEW_FROM_V4_SPRINT",
            path: null
        },
        source_file: "00_shared\\RECOVERED_GAPS.md"
    }))
};

ledger.ledger.push(newCategory);

// Analyze orphans (read from user_journeys_v2.md)
const markdownPath = 'C:/Users/ullah/.gemini/antigravity/brain/155a48dc-56e0-4b24-9679-2ead2204f7bd/user_journeys_v2.md';
const markdown = fs.readFileSync(markdownPath, 'utf-8');

const usedTags = new Set();
const tagRegex = /\[(.*?)\]/g;
let match;
while ((match = tagRegex.exec(markdown)) !== null) {
    const inner = match[1];
    if (inner === 'NONE') continue;
    inner.split(',').map(t => t.trim()).forEach(t => usedTags.add(t));
}

let totalReqs = 0;
let linkedCount = 0;

ledger.ledger.forEach(category => {
    category.requirements.forEach(req => {
        totalReqs++;
        
        // Skip actors for orphan processing
        if (req.id.startsWith('ACT-')) {
            return;
        }

        if (!usedTags.has(req.id) && req.trace.status !== 'NEW_FROM_V4_SPRINT') {
            // It's an orphan
            if (req.id.startsWith('DEF-') || req.title.toLowerCase().includes('deprecated')) {
                req.title = `[FLAGGED FOR DELETION] ${req.title}`;
                req.status = 'OBSOLETE';
            } else {
                req.title = `[SYSTEM-CORE] ${req.title}`;
            }
        }
        
        if (usedTags.has(req.id)) {
            linkedCount++;
            req.trace.status = 'LINKED_TO_JOURNEY';
        }
    });
});

ledger.version = "4.0.0";
ledger.last_audit = new Date().toISOString();
ledger.platform_health.total_requirements = totalReqs;
ledger.platform_health.linked_count = linkedCount;
ledger.platform_health.implementation_fidelity = ((linkedCount / totalReqs) * 100).toFixed(2) + "%";

fs.writeFileSync(path, JSON.stringify(ledger, null, 2));

console.log(`Updated MASTER_LEDGER.json to v4.0.0.`);
console.log(`New Total Requirements: ${totalReqs}`);
console.log(`Added ${newReqs.length} missing features/gaps.`);
