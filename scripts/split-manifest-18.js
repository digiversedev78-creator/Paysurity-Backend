'use strict';
/**
 * split-manifest-18.js
 * Distributes ALL requirements across 9 coder + 9 reviewer workers.
 * Each coder gets ~18 reqs (164 / 9 ≈ 18). Each reviewer peer-reviews
 * the matching coder's output.
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC  = path.join(ROOT, 'REQUIREMENTS_MASTER_MANIFEST.json');
const DEST = path.join(ROOT, 'REQUIREMENTS_MASTER_MANIFEST_18.json');

const CODERS  = ['A','B','C','D','E','F','G','H','I'];
const REVIEWS = ['J','K','L','M','N','O','P','Q','R'];

const m = JSON.parse(fs.readFileSync(SRC, 'utf-8'));

// Pool ALL requirements from all workers
const ALL_REQS = [];
Object.values(m.workers).forEach(w => {
  (w.requirements || []).forEach(r => {
    ALL_REQS.push({
      id:             r.id,
      title:          r.title,
      file:           r.file,
      module:         r.module,
      entity:         r.entity,
      status:         'PENDING',
      test_scenarios: r.test_scenarios,
      priority:       r.priority,
    });
  });
});

// Distribute evenly across 9 coders
const NEW = {};
const chunkSize = Math.ceil(ALL_REQS.length / CODERS.length);
CODERS.forEach((coderId, i) => {
  const chunk = ALL_REQS.slice(i * chunkSize, (i + 1) * chunkSize);
  if (chunk.length === 0) return;
  NEW[coderId] = {
    name:          `Swarm Coder ${coderId} (${chunk[0].id}-${chunk[chunk.length-1].id})`,
    domains:       [...new Set(chunk.map(r => r.id.split('-')[0]))],
    peer_reviewer: REVIEWS[i],
    requirements:  chunk,
  };
});

const out = {
  ...m,
  version:            '3.0',
  workers:            NEW,
  total_requirements: ALL_REQS.length,
  generated_at:       new Date().toISOString(),
  swarm_config:       '18-workers (9 coders + 9 reviewers)',
};

fs.writeFileSync(DEST, JSON.stringify(out, null, 2));

console.log('18-worker manifest -> REQUIREMENTS_MASTER_MANIFEST_18.json');
Object.entries(NEW).forEach(([id, w]) => {
  console.log('  ' + id + '->' + w.peer_reviewer + ': ' + w.requirements.length + ' reqs');
});
console.log('TOTAL: ' + ALL_REQS.length + ' requirements across ' + Object.keys(NEW).length + ' workers');
