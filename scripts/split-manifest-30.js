'use strict';
/**
 * split-manifest-30.js
 * 30-worker swarm: 15 coders (A-O) + 15 reviewers (P-#).
 * All 164 requirements distributed evenly: ~11 reqs per coder.
 * Reviewers use letters P Q R S T U V W X Y Z 1 2 3 4
 */
const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC  = path.join(ROOT, 'REQUIREMENTS_MASTER_MANIFEST.json');
const DEST = path.join(ROOT, 'REQUIREMENTS_MASTER_MANIFEST_30.json');

const CODERS  = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O'];
const REVIEWS = ['P','Q','R','S','T','U','V','W','X','Y','Z','1','2','3','4'];

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

const NEW = {};
const chunkSize = Math.ceil(ALL_REQS.length / CODERS.length);

CODERS.forEach((coderId, i) => {
  const chunk = ALL_REQS.slice(i * chunkSize, (i + 1) * chunkSize);
  if (!chunk.length) return;
  NEW[coderId] = {
    name:          `Coder-${coderId} [${chunk[0].id}..${chunk[chunk.length-1].id}]`,
    domains:       [...new Set(chunk.map(r => r.id.split('-')[0]))],
    peer_reviewer: REVIEWS[i],
    requirements:  chunk,
  };
});

const out = {
  ...m,
  version:            '4.0',
  workers:            NEW,
  total_requirements: ALL_REQS.length,
  generated_at:       new Date().toISOString(),
  swarm_config:       '30-workers (15 coders A-O + 15 reviewers P-4)',
};

fs.writeFileSync(DEST, JSON.stringify(out, null, 2));
console.log('30-worker manifest -> REQUIREMENTS_MASTER_MANIFEST_30.json');
Object.entries(NEW).forEach(([id, w]) =>
  console.log(`  ${id} -> ${w.peer_reviewer}: ${w.requirements.length} reqs`));
console.log('TOTAL:', ALL_REQS.length, 'across', Object.keys(NEW).length, 'workers');
