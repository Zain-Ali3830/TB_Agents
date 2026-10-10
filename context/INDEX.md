# Context Index

All agents read this file first.

## Framework files

| File | Purpose | Written by |
|------|---------|-----------|
| [project-overview.md](project-overview.md) | App, users, environments, automation repo path | `/qa-setup` or you |
| [roles.md](roles.md) | Roles, permissions, credential **variable names** | `/qa-setup` or you |
| [test-standards.md](test-standards.md) | Priorities, naming, scope, automation eligibility | defaults, adjust as needed |
| [automation-guide.md](automation-guide.md) | Automation conventions and locator strategy | `framework-analyzer` (DRAFT) → confirmed by you |

## Module files: `modules/*.md`

One file per feature area, created by you (any name, e.g. `bookings.md`). Agents discover them with a glob; nothing needs registering. See [modules/README.md](modules/README.md).

## Related

- Data formats agents read and write: `templates/data-formats.md`
- Input naming: `templates/input-template.md`

## Status

| File | Status |
|------|--------|
| project-overview.md | NEEDS SETUP |
| roles.md | NEEDS SETUP |
| test-standards.md | DEFAULTS |
| automation-guide.md | NOT YET GENERATED |
| modules/ | ADD YOUR MODULE FILES |
