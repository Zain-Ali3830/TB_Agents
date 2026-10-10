# Requirement Input Template

> Use this format for files you place in `data/inputs/`.
> The test-case-generator agent reads files in this format.

---

# Requirement: <Feature Name>

**Date:** <!-- YYYY-MM-DD -->
**Author:** <!-- Your name -->
**Module:** <!-- Which module does this belong to? -->
**Priority:** <!-- P0 | P1 | P2 | P3 -->
**Ticket/Reference:** <!-- e.g. JIRA-123 or N/A -->

## Overview

<!-- 2–4 sentences describing what this feature/change does and why. -->

## User Story

As a **<!-- role, e.g. logged-in user -->**,
I want to **<!-- action, e.g. reset my password via email -->**,
So that **<!-- outcome, e.g. I can regain access to my account if I forget my password -->**.

## Acceptance Criteria

- [ ] <!-- AC1: specific, testable condition -->
- [ ] <!-- AC2: specific, testable condition -->
- [ ] <!-- AC3: edge case or error state -->
- [ ] <!-- add more as needed -->

## Flows to Cover

### Happy Path
<!-- Describe the primary success scenario step by step. -->
1.
2.
3.

### Error / Edge Cases
<!-- Describe what should happen in failure or edge-case scenarios. -->
- <!-- e.g. User enters an email that is not registered -->
- <!-- e.g. User tries to reset password within 1 minute of previous request -->

## Out of Scope

<!-- What should NOT be tested from this requirement? -->
- <!-- e.g. Email delivery/rendering (tested separately) -->

## Design Reference

<!-- Link to Figma frame or screenshot, or write N/A -->

## Notes

<!-- Any other context: dependencies, known issues, environment-specific behavior -->
