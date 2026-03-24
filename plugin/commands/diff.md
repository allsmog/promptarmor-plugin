---
name: diff
description: Compare two scan results to track regression or improvement
argument-hint: "<scan-id-1> <scan-id-2>"
allowed-tools:
  - Read
  - mcp__prompt-armor__get_results
---

# PromptArmor: Diff Scans

Compare two scan results to identify regressions (new vulnerabilities) or improvements (fixed vulnerabilities).

## Process

1. Load both scan results via MCP `get_results`
2. Match attacks by plugin ID
3. Classify changes:
   - **New failures** — attacks that passed before but fail now (regression)
   - **Fixed** — attacks that failed before but pass now (improvement)
   - **Unchanged failures** — still failing
   - **Unchanged passes** — still passing
4. Display diff summary

## Output

```
PromptArmor Diff: scan-2026-03-20 → scan-2026-03-24

REGRESSIONS (3 new failures):
  [CRITICAL] jailbreak:basic-ignore — was PASS, now FAIL
  [HIGH]     injection:indirect — was PASS, now FAIL
  [MEDIUM]   other:competitors — was PASS, now FAIL

FIXED (5 improvements):
  [CRITICAL] tool-abuse:sql-drop-table — was FAIL, now PASS
  [HIGH]     harmful:cybercrime — was FAIL, now PASS
  ...

SUMMARY:
  Before: 65/80 passed (81%)
  After:  67/80 passed (84%)
  Net:    +2 improvements, 3 regressions
```
