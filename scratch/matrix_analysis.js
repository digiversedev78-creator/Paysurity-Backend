const fs = require('fs');

const ledger = JSON.parse(fs.readFileSync('c:/Projects/PaySurity/Requirements/MASTER_LEDGER.json', 'utf-8'));
const validReqs = new Map();
ledger.ledger.forEach(category => {
    category.requirements.forEach(req => {
        // Exclude actors from the "requirements" list for this analysis if they are ACT-
        if (!req.id.startsWith('ACT-')) {
            validReqs.set(req.id, req.title);
        }
    });
});

const markdownPath = 'C:/Users/ullah/.gemini/antigravity/brain/155a48dc-56e0-4b24-9679-2ead2204f7bd/user_journeys_v2.md';
let markdown = fs.readFileSync(markdownPath, 'utf-8');

// Find all tags used
const usedTags = new Set();
const tagRegex = /\[(.*?)\]/g;
let match;
while ((match = tagRegex.exec(markdown)) !== null) {
    const inner = match[1];
    if (inner === 'NONE') continue;
    const tags = inner.split(',').map(t => t.trim());
    tags.forEach(t => usedTags.add(t));
}

// Find Orphans
const orphans = [];
for (const [id, title] of validReqs.entries()) {
    if (!usedTags.has(id)) {
        orphans.push(`- **${id}**: ${title}`);
    }
}

// Find Scope Gaps (lines with [NONE])
const lines = markdown.split('\n');
const scopeGaps = [];
let currentJourney = '';
lines.forEach(line => {
    if (line.startsWith('### Journey')) {
        currentJourney = line.replace('### ', '').trim();
    }
    if (line.includes('[NONE]')) {
        scopeGaps.push(`- **${currentJourney}**: ${line.trim()}`);
    }
});

let report = `\n\n## Part 7: Requirement Matrix Analysis\n\n`;

report += `### Scope Gaps (Journeys missing supporting Requirements)\n`;
if (scopeGaps.length === 0) {
    report += `None identified.\n`;
} else {
    report += scopeGaps.join('\n') + '\n';
}

report += `\n### Orphan Requirements (Requirements not mapped to any Journey)\n`;
report += `*Out of ${validReqs.size} non-actor requirements, ${orphans.length} are currently orphaned and do not appear in any core journey.*  \n\n`;

// Only list the first 20 to avoid overwhelming the document, but note the count
const displayOrphans = orphans.slice(0, 30);
report += displayOrphans.join('\n') + '\n';
if (orphans.length > 30) {
    report += `\n*(...and ${orphans.length - 30} more. See MASTER_LEDGER.json for full list.)*\n`;
}

fs.appendFileSync(markdownPath, report);
console.log(`Analysis appended to markdown. Found ${orphans.length} orphans and ${scopeGaps.length} gaps.`);
