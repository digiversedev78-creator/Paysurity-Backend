const fs = require('fs');
const ledger = JSON.parse(fs.readFileSync('c:/Projects/PaySurity/Requirements/MASTER_LEDGER.json', 'utf-8'));

let out = '';
ledger.ledger.forEach(vertical => {
    out += `\n=== ${vertical.name} ===\n`;
    vertical.requirements.forEach(req => {
        out += `${req.id}: ${req.title}\n`;
    });
});

fs.writeFileSync('c:/Projects/PaySurity/scratch/reqs_list.txt', out);
console.log(`Wrote requirements to scratch/reqs_list.txt`);
