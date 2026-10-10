const path = require('path');
const ExcelJS = require('exceljs');
const { featureDir, rel, fail } = require('./common');

const FILLS = {
  header: 'FF1F3864',
  APPROVED: 'FFC6EFCE', PASS: 'FFC6EFCE', MATCH: 'FFC6EFCE',
  'NEEDS-REVISION': 'FFFFEB9C', PARTIAL: 'FFFFEB9C', BLOCKED: 'FFFFEB9C',
  REJECTED: 'FFFFC7CE', FAIL: 'FFFFC7CE', MISMATCH: 'FFFFC7CE', UNCOVERED: 'FFFFC7CE',
};

function fill(cell, argb) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function styleSheet(ws, statusKeys = []) {
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.eachCell((c) => fill(c, FILLS.header));
  ws.eachRow((row) => {
    row.alignment = { vertical: 'top', wrapText: true };
  });
  if (ws.rowCount > 1) {
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
  }
  for (const key of statusKeys) {
    ws.getColumn(key).eachCell((c, rowNo) => {
      if (rowNo > 1 && FILLS[c.value]) fill(c, FILLS[c.value]);
    });
  }
}

async function save(wb, file) {
  try {
    await wb.xlsx.writeFile(file);
  } catch (e) {
    if (e.code === 'EBUSY' || e.code === 'EPERM') fail(`${rel(file)} is open in another program (Excel?). Close it and re-run.`);
    throw e;
  }
}

async function exportTestCases(doc) {
  const wb = new ExcelJS.Workbook();

  const ws = wb.addWorksheet('Test Cases');
  ws.columns = [
    { header: 'TC ID', key: 'id', width: 18 },
    { header: 'Title', key: 'title', width: 40 },
    { header: 'Module', key: 'module', width: 14 },
    { header: 'Priority', key: 'priority', width: 9 },
    { header: 'Type', key: 'type', width: 13 },
    { header: 'Role', key: 'role', width: 16 },
    { header: 'Req Refs', key: 'reqRefs', width: 12 },
    { header: 'Preconditions', key: 'preconditions', width: 36 },
    { header: 'Steps', key: 'steps', width: 60 },
    { header: 'Expected Result', key: 'expectedResult', width: 48 },
    { header: 'Test Data', key: 'testData', width: 28 },
    { header: 'Assumptions', key: 'assumptions', width: 32 },
    { header: 'Review Status', key: 'reviewStatus', width: 16 },
    { header: 'Review Notes', key: 'reviewNotes', width: 40 },
  ];
  for (const tc of doc.testCases) {
    ws.addRow({
      ...tc,
      reqRefs: tc.reqRefs.join(', '),
      steps: tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      testData: tc.testData || '',
      assumptions: tc.assumptions || '',
      reviewNotes: tc.reviewNotes || '',
    });
  }
  styleSheet(ws, ['reviewStatus']);

  const coveredBy = {};
  for (const tc of doc.testCases) for (const r of tc.reqRefs) (coveredBy[r] ||= []).push(tc.id);
  const rs = wb.addWorksheet('Requirements');
  rs.columns = [
    { header: 'Req ID', key: 'id', width: 9 },
    { header: 'Requirement', key: 'text', width: 70 },
    { header: 'Covered By', key: 'coveredBy', width: 50 },
    { header: 'Coverage', key: 'coverage', width: 12 },
  ];
  for (const r of doc.requirements) {
    const ids = coveredBy[r.id] || [];
    rs.addRow({ id: r.id, text: r.text, coveredBy: ids.join(', '), coverage: ids.length ? ids.length : 'UNCOVERED' });
  }
  styleSheet(rs, ['coverage']);

  const qs = wb.addWorksheet('Open Questions');
  qs.columns = [
    { header: 'Q ID', key: 'id', width: 8 },
    { header: 'Question', key: 'question', width: 60 },
    { header: 'Related Reqs', key: 'relatedReqs', width: 14 },
    { header: 'Assumption Used', key: 'assumptionUsed', width: 45 },
    { header: 'Answer', key: 'answer', width: 45 },
  ];
  for (const q of doc.openQuestions) {
    qs.addRow({ ...q, relatedReqs: (q.relatedReqs || []).join(', '), assumptionUsed: q.assumptionUsed || '', answer: q.answer || '' });
  }
  styleSheet(qs);

  const file = path.join(featureDir(doc.feature), 'test-cases.xlsx');
  await save(wb, file);
  return { file, uncovered: doc.requirements.filter((r) => !coveredBy[r.id]).map((r) => r.id) };
}

async function exportExecution(doc, runDir, testCasesById) {
  const wb = new ExcelJS.Workbook();
  const count = (s) => doc.results.filter((r) => r.status === s).length;
  const executed = count('PASS') + count('FAIL');

  const sum = wb.addWorksheet('Summary');
  sum.columns = [{ header: 'Metric', key: 'k', width: 26 }, { header: 'Value', key: 'v', width: 70 }];
  const p0Fails = doc.results.filter((r) => r.status === 'FAIL' && testCasesById[r.id]?.priority === 'P0').map((r) => r.id);
  [
    ['Feature', doc.feature],
    ['Run ID', doc.runId],
    ['Environment', doc.environment || ''],
    ['Figma', doc.figma || 'N/A'],
    ['Started', doc.startedAt || ''],
    ['Finished', doc.finishedAt || ''],
    ['Total', doc.results.length],
    ['Passed', count('PASS')],
    ['Failed', count('FAIL')],
    ['Blocked', count('BLOCKED')],
    ['Pass rate (executed)', executed ? `${Math.round((count('PASS') / executed) * 100)}%` : 'N/A'],
    ['P0 failures', p0Fails.length ? p0Fails.join(', ') : 'None'],
  ].forEach(([k, v]) => sum.addRow({ k, v }));
  styleSheet(sum);

  const ws = wb.addWorksheet('Results');
  ws.columns = [
    { header: 'TC ID', key: 'id', width: 18 },
    { header: 'Title', key: 'title', width: 36 },
    { header: 'Priority', key: 'priority', width: 9 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Failed Step', key: 'failedStep', width: 11 },
    { header: 'Expected Result', key: 'expected', width: 42 },
    { header: 'Actual Result', key: 'actualResult', width: 42 },
    { header: 'Notes', key: 'notes', width: 36 },
    { header: 'Design Match', key: 'designMatch', width: 13 },
    { header: 'Design Notes', key: 'designNotes', width: 36 },
    { header: 'Evidence', key: 'screenshot', width: 30 },
    { header: 'Failure Screenshot', key: 'failureScreenshot', width: 30 },
    { header: 'Console Errors', key: 'consoleLog', width: 24 },
    { header: 'Network Log', key: 'networkLog', width: 24 },
  ];
  const linkKeys = ['screenshot', 'failureScreenshot', 'consoleLog', 'networkLog'];
  for (const r of doc.results) {
    const tc = testCasesById[r.id] || {};
    const row = ws.addRow({
      id: r.id,
      title: tc.title || r.title || '',
      priority: tc.priority || '',
      status: r.status,
      failedStep: r.failedStep ?? '',
      expected: tc.expectedResult || '',
      actualResult: r.actualResult,
      notes: r.notes || '',
      designMatch: r.designMatch,
      designNotes: r.designNotes || '',
    });
    for (const key of linkKeys) {
      if (r[key]) row.getCell(key).value = { text: r[key], hyperlink: r[key] };
    }
  }
  styleSheet(ws, ['status', 'designMatch']);
  for (const key of linkKeys) {
    ws.getColumn(key).eachCell((c, rowNo) => {
      if (rowNo > 1 && c.value && c.value.hyperlink) c.font = { color: { argb: 'FF0563C1' }, underline: true };
    });
  }

  const file = path.join(runDir, 'execution-report.xlsx');
  await save(wb, file);
  return { file, counts: { pass: count('PASS'), fail: count('FAIL'), blocked: count('BLOCKED') }, p0Fails };
}

module.exports = { exportTestCases, exportExecution };
