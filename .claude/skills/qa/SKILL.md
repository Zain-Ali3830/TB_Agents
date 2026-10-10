---
name: qa
description: Run the QA pipeline for one spec file - generate test cases, review them with the user, execute them in the browser, and automate the passing ones. Use when the user says /qa, asks to test a spec in data/inputs/, or wants to continue a pipeline stage for a feature.
argument-hint: <spec file in data/inputs/> [--from generate|review|execute|automate]
---

# /qa: pipeline orchestrator

You run in the main session, so you are the only part of the pipeline that talks to the user. Subagents run unattended: give them everything they need in the prompt and relay their results. Keep the user informed in one or two lines per stage.

Never read `.env.secrets` (it holds credentials). Check whether a key is filled with `grep -c '^KEY=.\+' .env.secrets`, which prints a count, never the value.

## 0. Preflight

1. Resolve the spec: the argument, or if none, list `data/inputs/` and ask which one. Fail if it doesn't exist.
2. Derive `feature`: the filename without the `spec-` prefix and extension, lowercased, non-alphanumerics replaced by `-` (`spec-Booking Flow.md` becomes `booking-flow`).
3. Check, and stop with a clear fix for each failure:
   - `node_modules/` exists, otherwise run `npm install`
   - `.env` has a non-empty `APP_URL`
   - `.env.secrets` exists
   - `context/project-overview.md` and `context/roles.md` contain real content, not just the placeholder comments; otherwise tell the user to run `/qa-setup`
4. Pick the start stage: `--from` if given. Otherwise, if `data/outputs/1-test-cases/<feature>/test-cases.json` exists, ask the user whether to continue from review, continue from execution, or regenerate from scratch. Otherwise start at **generate**.

## 1. Generate

Call the `test-case-generator` agent:
> mode: create · spec: `<spec>` · feature: `<feature>`

Show the user its summary (counts, uncovered requirements) and the path to `test-cases.xlsx`.

If it reports open questions, list them and ask the user to answer any they can now (they may skip). If they answer, call `test-case-generator` in **revise** mode with the answers before moving on.

## 2. Review loop (at most 3 rounds)

1. Call the `test-case-reviewer` agent:
   > feature: `<feature>` · spec: `<spec>`
2. Take the JSON verdict block from the end of its report and apply it:
   ```bash
   node scripts/tc-review.js <feature> <<'EOF'
   <verdict JSON>
   EOF
   ```
3. Show the user the review report (everything except the JSON block) as written.
4. If there are NEEDS-REVISION or REJECTED cases, coverage gaps or open-question risks, ask:
   **"Should the test-case-generator update the test cases with these findings?"**
   - **Yes:** call `test-case-generator` in revise mode with the full review report and any extra instructions or answers the user gave, then go back to step 1 of this loop.
   - **No, continue with the approved cases:** go to Execute.
   - **Stop here:** finish with the summary below.
   If everything is APPROVED, say so and go to Execute.
5. After 3 rounds, stop looping. Tell the user what is still unresolved and ask whether to continue with the approved cases.

## 3. Execute

1. Make sure the Playwright MCP server is connected (its `mcp__playwright__*` tools are available). If not, tell the user to approve or restart the `playwright` server from `.mcp.json` (`/mcp`), and stop.
2. Ask the user: **"Do you have a Figma link to compare the UI against? Paste it, or say skip."** Wait for the reply. If they give one, check `grep -c '^FIGMA_API_KEY=.\+' .env.secrets` and that the `figma` MCP server is connected. If either is missing, explain and offer to continue without Figma.
3. `node scripts/run-init.js <feature> [figma-url]` and read `RUN_DIR` from its output.
4. Call the `manual-tester` agent:
   > feature: `<feature>` · runDir: `<RUN_DIR>` · figma: `<url or none>`
5. Show the user the results: counts, every FAIL and BLOCKED line, the design summary, and the path to `<RUN_DIR>/execution-report.xlsx`. Call out any P0 failures.

## 4. Automate

1. If nothing passed, stop here.
2. Ask: **"Automate the N passed test cases?"** If no, finish.
3. Check `context/automation-guide.md`:
   - Still the placeholder ("NOT YET GENERATED"): call the `framework-analyzer` agent.
   - First line says `DRAFT` (fresh or from an earlier run): show the user its "Needs confirmation" list and ask them to confirm or correct it. Apply their corrections to the guide yourself, then change the first line to `Status: CONFIRMED <date>`.
4. Call the `automation-engineer` agent:
   > runDir: `<RUN_DIR>`
5. Show its results table, the files written, and any `fixme` tests or app changes it found.

## Finish

End with a short summary of the stages run, with paths to `test-cases.xlsx`, `execution-report.xlsx` and the spec files, plus anything left open (unanswered questions, failures, fixme tests).
