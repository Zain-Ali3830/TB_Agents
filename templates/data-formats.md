# Data Formats

Agents write JSON. Scripts validate it and render the XLSX files people read.
Never edit the XLSX files by hand to change data; edit the JSON and re-run the export script.

---

## 1. Test cases: `data/outputs/1-test-cases/<feature>/test-cases.json`

```json
{
  "feature": "login",
  "source": "data/inputs/spec-login.md",
  "version": 1,
  "generatedAt": "2026-10-11T10:00:00Z",
  "requirements": [
    { "id": "R1", "text": "User can sign in with a registered email and password" }
  ],
  "openQuestions": [
    {
      "id": "Q1",
      "question": "How many failed attempts lock the account?",
      "relatedReqs": ["R3"],
      "assumptionUsed": "Assumed 5 attempts",
      "answer": ""
    }
  ],
  "testCases": [
    {
      "id": "TC-LOGIN-001",
      "title": "Sign in with valid credentials",
      "module": "Login",
      "priority": "P0",
      "type": "Functional",
      "role": "Admin",
      "reqRefs": ["R1"],
      "preconditions": "User is signed out and on the sign-in page",
      "steps": [
        "Enter ROLE_ADMIN_EMAIL in the Email field",
        "Enter ROLE_ADMIN_PASSWORD in the Password field",
        "Click Sign in"
      ],
      "expectedResult": "Dashboard is displayed with the user's name in the header",
      "testData": "ROLE_ADMIN_EMAIL, ROLE_ADMIN_PASSWORD",
      "assumptions": "",
      "reviewStatus": "PENDING",
      "reviewNotes": ""
    }
  ]
}
```

| Field | Rule |
|---|---|
| `requirements[].id` | `R1`, `R2`, … atomic, testable statements extracted from the spec |
| `openQuestions[]` | Anything the spec leaves unclear. `assumptionUsed` = what the test cases assumed. `answer` = filled when the user answers |
| `testCases[].id` | `TC-<MODULE>-<NNN>`; IDs never change or get reused across versions |
| `priority` | `P0` `P1` `P2` `P3` (see `context/test-standards.md`) |
| `type` | `Functional` `UI` `API` `Security` `Accessibility` `Performance` |
| `reqRefs` | At least one requirement ID per test case |
| `steps` | One action per string, no numbering (the export numbers them) |
| credentials | Always the **variable name** (`ROLE_ADMIN_PASSWORD`), never a value |
| `assumptions` | Non-empty whenever the expected result depends on a guess |
| `reviewStatus` | `PENDING` from the generator; set to `APPROVED` / `NEEDS-REVISION` / `REJECTED` only by `scripts/tc-review.js` |

Scripts:
- `node scripts/tc-export.js <feature>`: validate and render `test-cases.xlsx` (sheets: Test Cases, Requirements with coverage, Open Questions)
- `node scripts/tc-archive.js <feature>`: copy the current version to `history/` before a revision
- `node scripts/tc-review.js <feature> < verdicts.json`: apply review verdicts

---

## 2. Review verdicts (input to `tc-review.js`)

```json
[
  { "id": "TC-LOGIN-001", "status": "APPROVED", "notes": "" },
  { "id": "TC-LOGIN-002", "status": "NEEDS-REVISION", "notes": "Step 3: specify which Save button" },
  { "id": "TC-LOGIN-003", "status": "REJECTED", "notes": "Duplicate of TC-LOGIN-001" }
]
```

`notes` is required for anything other than `APPROVED`.

---

## 3. Execution: `data/outputs/3-execution-reports/<feature>-<run-id>/execution.json`

Created by `node scripts/run-init.js <feature> [figma-url]`. The manual tester fills `results`.

```json
{
  "feature": "login",
  "runId": "20261011-143000",
  "testCasesVersion": 2,
  "environment": "https://staging.example.com",
  "figma": "https://www.figma.com/design/...",
  "startedAt": "...",
  "finishedAt": null,
  "results": [
    {
      "id": "TC-LOGIN-002",
      "status": "FAIL",
      "failedStep": 3,
      "actualResult": "Spinner shown for 30s, no error message",
      "notes": "POST /api/login returned 500",
      "designMatch": "PARTIAL",
      "designNotes": "Button label is 'Login' in app, 'Sign in' in Figma",
      "screenshot": "screenshots/TC-LOGIN-002-final.png",
      "failureScreenshot": "screenshots/TC-LOGIN-002-step3-fail.png",
      "consoleLog": "logs/TC-LOGIN-002-console.txt",
      "networkLog": "logs/TC-LOGIN-002-network.txt"
    }
  ]
}
```

| Field | Rule |
|---|---|
| `status` | `PASS` `FAIL` `BLOCKED` |
| `failedStep` | Step number (1-based), required for `FAIL` |
| `screenshot` | Required unless `BLOCKED`; path relative to the run folder |
| `failureScreenshot` | Required for `FAIL`; taken at the failing step |
| `consoleLog` / `networkLog` | Optional; saved when there are errors or failed requests |
| `designMatch` | `MATCH` `MISMATCH` `PARTIAL` `N/A`; advisory only |

Script: `node scripts/report-export.js <run-dir>`: validate (including that evidence files exist) and render `execution-report.xlsx` (Summary + Results with clickable evidence links).
