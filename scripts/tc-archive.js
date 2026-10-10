// Usage: node scripts/tc-archive.js <feature>
// Copies the current test-cases.json into history/ before a revision overwrites it.
const fs = require('fs');
const path = require('path');
const { tcPath, featureDir, readJson, stamp, rel, fail } = require('./lib/common');

const feature = process.argv[2];
if (!feature) fail('usage: node scripts/tc-archive.js <feature>');

const src = tcPath(feature);
if (!fs.existsSync(src)) {
  console.log(`Nothing to archive: ${rel(src)} does not exist yet.`);
  process.exit(0);
}
const { version = 0 } = readJson(src);
const dir = path.join(featureDir(feature), 'history');
fs.mkdirSync(dir, { recursive: true });
const dest = path.join(dir, `test-cases-v${version}-${stamp()}.json`);
fs.copyFileSync(src, dest);
console.log(`Archived v${version} -> ${rel(dest)}. Next version: ${version + 1}`);
