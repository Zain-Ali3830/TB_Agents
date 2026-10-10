// Usage: node scripts/tc-export.js <feature>
// Validates data/outputs/1-test-cases/<feature>/test-cases.json and renders test-cases.xlsx.
const { loadTestCases, fail, rel } = require('./lib/common');
const { exportTestCases } = require('./lib/xlsx');

async function main() {
  const feature = process.argv[2];
  if (!feature) fail('usage: node scripts/tc-export.js <feature>');
  const doc = loadTestCases(feature);
  const { file, uncovered } = await exportTestCases(doc);

  const by = (key) => doc.testCases.reduce((acc, tc) => ({ ...acc, [tc[key]]: (acc[tc[key]] || 0) + 1 }), {});
  const fmt = (o) => Object.entries(o).map(([k, v]) => `${k}=${v}`).join(' ');
  console.log(`OK ${rel(file)} (version ${doc.version})`);
  console.log(`Test cases: ${doc.testCases.length} | ${fmt(by('priority'))}`);
  console.log(`Review: ${fmt(by('reviewStatus'))}`);
  console.log(`Requirements: ${doc.requirements.length} | uncovered: ${uncovered.length ? uncovered.join(', ') : 'none'}`);
  console.log(`Open questions: ${doc.openQuestions.length} (unanswered: ${doc.openQuestions.filter((q) => !q.answer).length})`);
}

main().catch((e) => fail(e.stack || e.message));
