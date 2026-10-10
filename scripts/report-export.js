// Usage: node scripts/report-export.js <run-dir>
// Validates <run-dir>/execution.json and renders execution-report.xlsx with links to evidence.
const path = require('path');
const { ROOT, readJson, writeJson, loadTestCases, validateExecution, rel, fail } = require('./lib/common');
const { exportExecution } = require('./lib/xlsx');

async function main() {
  const arg = process.argv[2];
  if (!arg) fail('usage: node scripts/report-export.js <run-dir>');
  const runDir = path.resolve(ROOT, arg);
  const execFile = path.join(runDir, 'execution.json');
  const doc = readJson(execFile);

  const errors = validateExecution(doc, runDir);
  if (errors.length) fail(`${rel(execFile)} is invalid:\n  - ${errors.join('\n  - ')}`);

  if (!doc.finishedAt) {
    doc.finishedAt = new Date().toISOString();
    writeJson(execFile, doc);
  }

  const tcs = loadTestCases(doc.feature);
  const byId = Object.fromEntries(tcs.testCases.map((tc) => [tc.id, tc]));
  const unknown = doc.results.filter((r) => !byId[r.id]).map((r) => r.id);
  if (unknown.length) fail(`results reference unknown test cases: ${unknown.join(', ')}`);

  const { file, counts, p0Fails } = await exportExecution(doc, runDir, byId);
  const executed = counts.pass + counts.fail;
  console.log(`OK ${rel(file)}`);
  console.log(`Total: ${doc.results.length} | PASS=${counts.pass} FAIL=${counts.fail} BLOCKED=${counts.blocked} | pass rate ${executed ? Math.round((counts.pass / executed) * 100) : 0}%`);
  console.log(`P0 failures: ${p0Fails.length ? p0Fails.join(', ') : 'none'}`);
}

main().catch((e) => fail(e.stack || e.message));
