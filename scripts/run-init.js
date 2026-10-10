// Usage: node scripts/run-init.js <feature> [figma-url]
// Creates data/outputs/3-execution-reports/<feature>-<run-id>/ with an execution.json skeleton
// and prints the APPROVED test case IDs to execute.
const fs = require('fs');
const path = require('path');
const { loadTestCases, RUNS_DIR, ROOT, stamp, writeJson, rel, fail } = require('./lib/common');

const [feature, figma] = process.argv.slice(2);
if (!feature) fail('usage: node scripts/run-init.js <feature> [figma-url]');

const doc = loadTestCases(feature);
const approved = doc.testCases.filter((tc) => tc.reviewStatus === 'APPROVED');
if (!approved.length) fail(`no APPROVED test cases for "${feature}". Run the review stage first.`);

let appUrl = '';
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  const m = fs.readFileSync(envFile, 'utf8').match(/^APP_URL=(.*)$/m);
  appUrl = m ? m[1].trim() : '';
}

const runId = stamp();
const runDir = path.join(RUNS_DIR, `${feature}-${runId}`);
fs.mkdirSync(path.join(runDir, 'screenshots'), { recursive: true });
fs.mkdirSync(path.join(runDir, 'logs'), { recursive: true });
fs.mkdirSync(path.join(runDir, 'figma'), { recursive: true });

writeJson(path.join(runDir, 'execution.json'), {
  feature,
  runId,
  testCasesVersion: doc.version,
  environment: appUrl,
  figma: figma || null,
  startedAt: new Date().toISOString(),
  finishedAt: null,
  results: [],
});

console.log(`RUN_DIR=${rel(runDir)}`);
console.log(`APPROVED (${approved.length}): ${approved.map((tc) => tc.id).join(', ')}`);
const skipped = doc.testCases.length - approved.length;
if (skipped) console.log(`Skipped (not approved): ${skipped}`);
