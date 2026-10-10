# Test Standards

> Fill in this file with your team's testing conventions.
> All agents follow these rules when generating, reviewing, and executing tests.

## Priority Scale

| Priority | Meaning | Release gate? |
|----------|---------|---------------|
| P0 | Blocks core user journey | Must pass — do not release if failing |
| P1 | Important feature | Should pass — release with approval only |
| P2 | Nice to have | Can ship with known issue |
| P3 | Edge case / cosmetic | Track but low urgency |

## Test Case Naming

Format: `TC-<MODULE>-<NNN> — <Short description>`

Examples:
- `TC-LOGIN-001 — Successful login with valid credentials`
- `TC-LOGIN-002 — Login fails with incorrect password`
- `TC-PAYMENTS-001 — User can complete checkout with credit card`

## Test Types

| Type | When to use |
|------|-------------|
| Functional | Feature behaves as specified |
| UI | Visual layout, labels, error messages |
| API | Backend endpoint validation |
| Security | Auth, permissions, injection |
| Performance | Load time, responsiveness (manual only) |

## Scope

**In scope:**
- All P0 and P1 functional flows
- Role-based access checks for each module
- Form validation and error states
- Navigation and routing

**Out of scope:**
- Performance / load testing (separate tooling)
- Accessibility audits (separate tooling)
- Third-party integrations (mock or skip)
- <!-- add any project-specific exclusions -->

## Automation Eligibility

Automate when:
- Test passed in manual execution
- Steps are deterministic (same input → same output every time)
- No manual observation required (e.g., not "check if email looks correct")

Do not automate:
- Exploratory tests
- Cases marked P3 with no history of failure
- Cases that require human judgment

## Evidence Requirements

- **PASS** — no screenshot required unless configured
- **FAIL** — screenshot + error message required
- **BLOCKED** — explain what prevented execution
