const fs = require('fs');
const path = require('path');

const OLD_DIR = 'C:/Projects/PaySurity/OLD REQUIREMENTS';
const NEW_DIR = 'C:/Projects/PaySurity/Requirements';

const categories = {
    "Infrastructure & Environments": ['docker', 'container', 'hosting', 'environment variable', 'env var', 'deployment', 'aws', 'gcp'],
    "Core Tech Stack": ['typescript', 'nestjs', 'next.js', 'nextjs', 'react', 'coding standard', 'strict mode', 'linting', 'tech stack'],
    "Database & Data Architecture": ['postgresql', 'postgres', 'drizzle', 'orm', 'rls', 'row-level security', 'tenant_id', 'isolation', 'schema'],
    "Global UI/UX & Graphics": ['ui/ux', 'tailwind', 'theme', 'design system', 'layout', 'color', 'typography', 'look and feel', 'aesthetic'],
    "Agentic/DevOps Tooling": ['antigravity', 'ag ', 'powershell', 'terminal', 'agent', 'devops', 'automation', 'auto-work', 'execution']
};

function extractLines(dir, resultsObj) {
    function readDir(d) {
        const entries = fs.readdirSync(d, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(d, entry.name);
            if (entry.isDirectory()) {
                readDir(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.md')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const lines = content.split('\n');
                
                let currentContext = [];
                lines.forEach((line, i) => {
                    const lowerLine = line.toLowerCase();
                    for (const [cat, keywords] of Object.entries(categories)) {
                        for (const kw of keywords) {
                            if (lowerLine.includes(kw)) {
                                // grab context (line -1 to +1)
                                const snippet = `[${entry.name}] ${lines.slice(Math.max(0, i-1), Math.min(lines.length, i+2)).join(' | ')}`;
                                resultsObj[cat].push(snippet);
                                break;
                            }
                        }
                    }
                });
            }
        }
    }
    readDir(dir);
}

const oldResults = {
    "Infrastructure & Environments": [],
    "Core Tech Stack": [],
    "Database & Data Architecture": [],
    "Global UI/UX & Graphics": [],
    "Agentic/DevOps Tooling": []
};

const newResults = {
    "Infrastructure & Environments": [],
    "Core Tech Stack": [],
    "Database & Data Architecture": [],
    "Global UI/UX & Graphics": [],
    "Agentic/DevOps Tooling": []
};

extractLines(OLD_DIR, oldResults);
extractLines(NEW_DIR, newResults);

let output = '';
for (const cat of Object.keys(categories)) {
    output += `\n========================================\n`;
    output += `CATEGORY: ${cat}\n`;
    output += `========================================\n\n`;
    
    output += `### OLD REQUIREMENTS (Count: ${oldResults[cat].length})\n`;
    const uniqueOld = [...new Set(oldResults[cat])].slice(0, 50); // limit to avoid massive files
    uniqueOld.forEach(s => output += s + '\n');
    
    output += `\n### NEW REQUIREMENTS (Count: ${newResults[cat].length})\n`;
    const uniqueNew = [...new Set(newResults[cat])].slice(0, 50);
    uniqueNew.forEach(s => output += s + '\n');
}

fs.writeFileSync('C:/Projects/PaySurity/scratch/layer_0_extracts.txt', output);
console.log('Extraction complete. Written to scratch/layer_0_extracts.txt');
