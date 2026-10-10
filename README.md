# QA Agents Framework

A multi-agent QA pipeline powered by Claude Code that takes requirements as input and produces reviewed test cases, manual execution reports, and automated Playwright tests as output.

## Quick Start

1. **Configure your project** — fill in `context/` files with your project details (or run the setup helper agent)
2. **Set credentials** — copy `.env.example` to `.env` and fill in your app URL and test credentials
3. **Drop requirements** — place requirement `.md` files in `data/inputs/`
4. **Run the pipeline** — invoke agents in order using Claude Code

## Pipeline

```
[Input: requirement .md]
        │
        ▼
  0-framework-analyzer     ← runs once per project, populates context/automation-guide.md
        │
        ▼
  1-test-case-generator    ← reads inputs/, writes to data/outputs/1-test-cases/
        │
        ▼
  2-test-case-reviewer     ← reads 1-test-cases/, writes to data/outputs/2-reviews/
        │
        ▼
  3-manual-tester          ← reads reviewed cases, executes via Playwright MCP, writes to data/outputs/3-execution-reports/
        │
        ▼
  4-automation-engineer    ← reads execution reports, writes Playwright scripts to data/outputs/4-automation/
```

## Invoking Agents

In Claude Code, use the `--agent` flag or the subagent name:

```bash
# Analyze the project framework (run once)
claude --agent 0-framework-analyzer

# Generate test cases from a requirement
claude --agent 1-test-case-generator "data/inputs/login-requirement.md"

# Review generated test cases
claude --agent 2-test-case-reviewer "data/outputs/1-test-cases/login-test-cases.md"

# Execute manual tests
claude --agent 3-manual-tester "data/outputs/2-reviews/login-test-cases-reviewed.md"

# Generate automation scripts
claude --agent 4-automation-engineer "data/outputs/3-execution-reports/login-execution-report.md"
```

## Directory Structure

```
qa-agents/
├── .claude/agents/          # Agent definitions (generic, never edit per project)
├── context/                 # Project knowledge (set up once per project)
│   └── modules/             # One file per feature area
├── templates/               # Shared formats
└── data/
    ├── inputs/              # Drop requirement files here
    └── outputs/
        ├── 1-test-cases/
        ├── 2-reviews/
        ├── 3-execution-reports/
        └── 4-automation/
```

## Prerequisites

- Claude Code CLI installed
- Node.js 18+ (for Playwright MCP)
- `.env` filled in with target app credentials

## Context Setup

Before running the pipeline on a new project, populate these files:

| File | What to put in it |
|------|-------------------|
| `context/project-overview.md` | App description, users, environments |
| `context/roles.md` | User roles, permissions, modules |
| `context/test-standards.md` | Priority rules, naming conventions |
| `context/modules/*.md` | Feature-by-feature domain knowledge |

The `setup-helper` agent can interview you and fill these in automatically.
