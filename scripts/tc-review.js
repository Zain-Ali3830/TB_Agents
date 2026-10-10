// Usage: node scripts/tc-review.js <feature> < verdicts.json
// stdin: [{ "id": "TC-LOGIN-001", "status": "APPROVED|NEEDS-REVISION|REJECTED", "notes": "..." }, ...]
// Writes reviewStatus/reviewNotes into test-cases.json and re-renders the XLSX.
const { loadTestCases, tcPath, writeJson, fail } = require('./lib/common');
const { exportTestCases } = require('./lib/xlsx');

const VERDICTS = ['APPROVED', 'NEEDS-REVISION', 'REJECTED'];

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => resolve(data));
  });
}

async function main() {
  const feature = process.argv[2];
  if (!feature) fail('usage: node scripts/tc-review.js <feature> < verdicts.json');
  const doc = loadTestCases(feature);

  let verdicts;
  try {
    verdicts = JSON.parse(await readStdin());
  } catch (e) {
    fail(`stdin is not valid JSON: ${e.message}`);
  }
  if (!Array.isArray(verdicts)) verdicts = verdicts.verdicts;
  if (!Array.isArray(verdicts) || !verdicts.length) fail('expected a non-empty JSON array of verdicts');

  const byId = new Map(doc.testCases.map((tc) => [tc.id, tc]));
  const errors = [];
  for (const v of verdicts) {
    if (!byId.has(v.id)) errors.push(`unknown test case ${v.id}`);
    if (!VERDICTS.includes(v.status)) errors.push(`${v.id}: status must be one of ${VERDICTS.join('/')}`);
    if (v.status !== 'APPROVED' && !(typeof v.notes === 'string' && v.notes.trim())) errors.push(`${v.id}: notes required for ${v.status}`);
  }
  if (errors.length) fail(`invalid verdicts:\n  - ${errors.join('\n  - ')}`);

  for (const v of verdicts) {
    const tc = byId.get(v.id);
    tc.reviewStatus = v.status;
    tc.reviewNotes = v.notes || '';
  }
  const missing = doc.testCases.filter((tc) => !verdicts.some((v) => v.id === tc.id)).map((tc) => tc.id);

  writeJson(tcPath(feature), doc);
  await exportTestCases(doc);
  const n = (s) => doc.testCases.filter((tc) => tc.reviewStatus === s).length;
  console.log(`Applied ${verdicts.length} verdicts. APPROVED=${n('APPROVED')} NEEDS-REVISION=${n('NEEDS-REVISION')} REJECTED=${n('REJECTED')} PENDING=${n('PENDING')}`);
  if (missing.length) console.log(`No verdict given for: ${missing.join(', ')} (left unchanged)`);
}

main().catch((e) => fail(e.stack || e.message));
