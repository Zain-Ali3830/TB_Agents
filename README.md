# QA Agents Framework

A Claude Code pipeline that turns a spec (in any format) into reviewed test cases, browser-executed results with evidence, and passing Playwright tests.

```
spec-*.md ─▶ 1 generate ─▶ 2 review ⇄ you ─▶ 3 execute (browser + Figma) ─▶ 4 automate
             test-cases.xlsx           execution-report.xlsx           *.spec.ts (run & green)
```

## One-time setup

1. **Install:** Node.js 20+, then in this folder:
   ```bash
   npm install
   npx playwright install chromium
   ```
2. **Open Claude Code in this folder** and approve the `playwright` and `figma` MCP servers when prompted (or check with `/mcp`).
3. **Run `/qa-setup`.** It interviews you and fills in `context/`, sets `APP_URL` in `.env`, and adds your role variables to `.env.secrets`.
4. **Fill in `.env.secrets`** yourself: `ROLE_<ROLE>_EMAIL` / `ROLE_<ROLE>_PASSWORD` for each role, plus `FIGMA_API_KEY` if you want design comparison. Agents never read this file.
5. **Optional:** add module files to `context/modules/` (see its README).

## Testing a feature

1. Drop a spec into `data/inputs/`, named `spec-<feature>.md`. Any format works: bullets, a pasted ticket, rough notes.
2. Run `/qa spec-<feature>.md`.
3. The skill walks you through the four stages:
   - **Generate:** test cases traced to the requirements extracted from your spec, plus open questions for anything unclear. You can answer the questions straight away.
   - **Review:** a separate reviewer (a different model) reports findings, and you decide whether the generator should fix them. This loops until you're satisfied.
   - **Execute:** you're asked for a Figma link (optional). Approved cases run in a real browser, each with screenshots, and failures also get console and network logs.
   - **Automate:** passed cases become Playwright tests that are run until green and checked for flakiness.

To resume or repeat one stage: `/qa spec-<feature>.md --from review|execute|automate`.

## Where things go

```
data/inputs/spec-<feature>.md                    your spec (never modified)
data/outputs/1-test-cases/<feature>/
    test-cases.json                              source of truth
    test-cases.xlsx                              Test Cases · Requirements (coverage) · Open Questions
    history/                                     previous versions
data/outputs/3-execution-reports/<feature>-<run-id>/
    execution.json
    execution-report.xlsx                        Summary · Results with clickable evidence
    screenshots/  logs/  figma/
data/outputs/4-automation/
    <feature>.spec.ts  pages/  fixtures/
```

Run the generated tests yourself with `npx playwright test` (HTML report in `data/outputs/4-automation/.report`).

## Framework layout

| Path | What it is |
|---|---|
| `.claude/skills/qa/` | `/qa` pipeline orchestrator (talks to you) |
| `.claude/skills/qa-setup/` | `/qa-setup` onboarding interview |
| `.claude/agents/` | The five unattended agents (generic, not edited per project) |
| `scripts/` | Validation and XLSX export (`tc-export`, `tc-review`, `tc-archive`, `run-init`, `report-export`) |
| `templates/data-formats.md` | JSON formats agents read and write |
| `context/` | Project knowledge (per project) |
| `.mcp.json` | Playwright MCP (`--secrets .env.secrets`, headless) and Figma MCP |
| `playwright.config.ts` | Config for the generated tests |
| `CLAUDE.md` | Rules every session and agent follows |

## Notes

- **Not on Windows?** `.mcp.json` launches servers with `cmd /c npx …`. On macOS/Linux, change `"command": "cmd"` to `"npx"` and drop `"/c", "npx"` from the args.
- **Watch the browser:** remove `--headless` from the playwright server in `.mcp.json`.
- **Agents and models:** the generator uses Sonnet and the reviewer uses Opus, so the reviewer isn't checking work from the same model. Change `model:` in each agent's frontmatter if needed.
