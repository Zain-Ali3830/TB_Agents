const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const TC_DIR = path.join(ROOT, 'data', 'outputs', '1-test-cases');
const RUNS_DIR = path.join(ROOT, 'data', 'outputs', '3-execution-reports');

const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const TYPES = ['Functional', 'UI', 'API', 'Security', 'Accessibility', 'Performance'];
const REVIEW_STATUSES = ['PENDING', 'APPROVED', 'NEEDS-REVISION', 'REJECTED'];
const RESULT_STATUSES = ['PASS', 'FAIL', 'BLOCKED'];
const DESIGN_MATCHES = ['MATCH', 'MISMATCH', 'PARTIAL', 'N/A'];

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function readJson(file) {
  if (!fs.existsSync(file)) fail(`${rel(file)} not found`);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    fail(`${rel(file)} is not valid JSON: ${e.message}`);
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function featureDir(feature) {
  return path.join(TC_DIR, feature);
}

function tcPath(feature) {
  return path.join(featureDir(feature), 'test-cases.json');
}

const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const isOptText = (v) => v === undefined || v === null || typeof v === 'string';

function validateTestCases(doc) {
  const errors = [];
  const check = (cond, msg) => { if (!cond) errors.push(msg); };

  check(isText(doc.feature), 'feature: required string');
  check(isText(doc.source), 'source: required string (path of the input spec)');
  check(Number.isInteger(doc.version) && doc.version >= 1, 'version: integer >= 1');
  check(Array.isArray(doc.requirements) && doc.requirements.length > 0, 'requirements: non-empty array');
  check(Array.isArray(doc.openQuestions), 'openQuestions: array (may be empty)');
  check(Array.isArray(doc.testCases) && doc.testCases.length > 0, 'testCases: non-empty array');
  if (errors.length) return errors;

  const reqIds = new Set();
  doc.requirements.forEach((r, i) => {
    check(/^R\d+$/.test(r.id || ''), `requirements[${i}].id must look like R1`);
    check(!reqIds.has(r.id), `requirements[${i}]: duplicate id ${r.id}`);
    check(isText(r.text), `requirements[${i}].text required`);
    reqIds.add(r.id);
  });

  doc.openQuestions.forEach((q, i) => {
    check(/^Q\d+$/.test(q.id || ''), `openQuestions[${i}].id must look like Q1`);
    check(isText(q.question), `openQuestions[${i}].question required`);
    check(isOptText(q.assumptionUsed), `openQuestions[${i}].assumptionUsed must be a string`);
    check(isOptText(q.answer), `openQuestions[${i}].answer must be a string`);
    (q.relatedReqs || []).forEach((r) => check(reqIds.has(r), `openQuestions[${i}].relatedReqs: unknown requirement ${r}`));
  });

  const tcIds = new Set();
  doc.testCases.forEach((tc, i) => {
    const at = `testCases[${i}] (${tc.id || 'no id'})`;
    check(/^TC-[A-Z0-9]+(-[A-Z0-9]+)*-\d{3}$/.test(tc.id || ''), `${at}.id must look like TC-LOGIN-001`);
    check(!tcIds.has(tc.id), `${at}: duplicate id`);
    tcIds.add(tc.id);
    for (const f of ['title', 'module', 'role', 'preconditions', 'expectedResult']) {
      check(isText(tc[f]), `${at}.${f} required`);
    }
    check(PRIORITIES.includes(tc.priority), `${at}.priority must be one of ${PRIORITIES.join('/')}`);
    check(TYPES.includes(tc.type), `${at}.type must be one of ${TYPES.join('/')}`);
    check(Array.isArray(tc.steps) && tc.steps.length > 0 && tc.steps.every(isText), `${at}.steps: non-empty array of strings`);
    check(Array.isArray(tc.reqRefs) && tc.reqRefs.length > 0, `${at}.reqRefs: at least one requirement id`);
    (tc.reqRefs || []).forEach((r) => check(reqIds.has(r), `${at}.reqRefs: unknown requirement ${r}`));
    check(isOptText(tc.testData), `${at}.testData must be a string`);
    check(isOptText(tc.assumptions), `${at}.assumptions must be a string`);
    check(REVIEW_STATUSES.includes(tc.reviewStatus), `${at}.reviewStatus must be one of ${REVIEW_STATUSES.join('/')}`);
    check(isOptText(tc.reviewNotes), `${at}.reviewNotes must be a string`);
  });

  return errors;
}

function loadTestCases(feature) {
  const doc = readJson(tcPath(feature));
  const errors = validateTestCases(doc);
  if (errors.length) fail(`${rel(tcPath(feature))} is invalid:\n  - ${errors.join('\n  - ')}`);
  return doc;
}

function validateExecution(doc, runDir) {
  const errors = [];
  const check = (cond, msg) => { if (!cond) errors.push(msg); };
  const fileExists = (p) => fs.existsSync(path.join(runDir, p));

  check(isText(doc.feature), 'feature: required string');
  check(isText(doc.runId), 'runId: required string');
  check(Array.isArray(doc.results) && doc.results.length > 0, 'results: non-empty array');
  if (errors.length) return errors;

  doc.results.forEach((r, i) => {
    const at = `results[${i}] (${r.id || 'no id'})`;
    check(isText(r.id), `${at}.id required`);
    check(RESULT_STATUSES.includes(r.status), `${at}.status must be one of ${RESULT_STATUSES.join('/')}`);
    check(isText(r.actualResult), `${at}.actualResult required`);
    check(DESIGN_MATCHES.includes(r.designMatch), `${at}.designMatch must be one of ${DESIGN_MATCHES.join('/')}`);
    if (r.status !== 'BLOCKED') check(isText(r.screenshot), `${at}.screenshot required unless BLOCKED`);
    if (r.status === 'FAIL') {
      check(Number.isInteger(r.failedStep), `${at}.failedStep (step number) required for FAIL`);
      check(isText(r.failureScreenshot), `${at}.failureScreenshot required for FAIL`);
    }
    for (const f of ['screenshot', 'failureScreenshot', 'consoleLog', 'networkLog']) {
      if (isText(r[f])) check(fileExists(r[f]), `${at}.${f}: file ${r[f]} not found in run folder`);
    }
  });
  return errors;
}

module.exports = {
  ROOT, TC_DIR, RUNS_DIR,
  PRIORITIES, TYPES, REVIEW_STATUSES, RESULT_STATUSES, DESIGN_MATCHES,
  fail, rel, stamp, readJson, writeJson, featureDir, tcPath,
  validateTestCases, loadTestCases, validateExecution,
};
