const fs = require('fs');
const path = require('path');

const OLD_REQ_DIR = 'C:/Projects/PaySurity/OLD REQUIREMENTS';
const MASTER_LEDGER_PATH = 'C:/Projects/PaySurity/Requirements/MASTER_LEDGER.json';

// Read Master Ledger
const ledgerContent = fs.readFileSync(MASTER_LEDGER_PATH, 'utf-8').toUpperCase();

// Regex to extract tags
// Looking for tags like REQ-001, ADV-005, OP-01, etc.
const tagRegex = /[A-Z]{2,4}-\d{2,3}/g;

// List of critical acronyms / keywords to ensure haven't been lost
const keywords = [
    'CRDT', 'EMV', 'AML', 'KYB', 'PCI', 'BOPIS', 'SNAP', 'EBT', 'B2B',
    'SAR', 'UBO', 'HSM', 'FINCEN', 'CCPA', 'SS-4', 'W-9', '1099-K', 
    'FNS', 'ADA', 'WCAG', 'JWT', 'PAN', 'EDI'
];

let extractedTags = new Set();
let files = [];

// Recursive read directory
function readDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            readDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(fullPath);
        }
    }
}

readDir(OLD_REQ_DIR);

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
        extractedTags.add(match[0]);
    }
});

let missing = [];

// Check tags
extractedTags.forEach(tag => {
    if (!ledgerContent.includes(tag.toUpperCase())) {
        missing.push(tag);
    }
});

// Check keywords
keywords.forEach(kw => {
    // Search the old requirements for the keyword
    let kwExistsInOld = false;
    for (let file of files) {
        const content = fs.readFileSync(file, 'utf-8').toUpperCase();
        if (content.includes(kw.toUpperCase())) {
            kwExistsInOld = true;
            break;
        }
    }

    // If it existed in the old requirements, but not in the ledger
    if (kwExistsInOld && !ledgerContent.includes(kw.toUpperCase())) {
        missing.push(kw);
    }
});

// Output
console.log("=== Deterministic Lexical Scan Results ===");
console.log(`Scanned ${files.length} legacy files for technical IDs and ${keywords.length} critical acronyms.`);
console.log(`Found ${extractedTags.size} unique ID tags across legacy documents.`);

if (missing.length > 0) {
    console.log("\n🔴 CRITICAL LEAK DETECTED");
    console.log("The following IDs/Acronyms were found in legacy requirements but are entirely absent from MASTER_LEDGER.json (v4.0.0):");
    missing.forEach(m => console.log(` - ${m}`));
} else {
    console.log("\n✅ SCAN COMPLETE: ZERO LEAKS DETECTED.");
    console.log("All legacy technical IDs and critical acronyms have been successfully traced into MASTER_LEDGER.json (v4.0.0).");
}
