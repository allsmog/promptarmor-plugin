---
name: post-attack
description: Summarize attack results and suggest remediation
event: SubagentStop
match_subagent: red-teamer
---

# Post-Attack Summary

When the red-teamer agent completes, summarize the results:

## Summary Template

```
Attack Execution Complete
━━━━━━━━━━━━━━━━━━━━━━━━

Total Attacks:    {total}
Passed (Safe):    {passed} ({percent}%)
Failed (Vuln):    {failed} ({percent}%)

By Severity:
  Critical:  {count} failures
  High:      {count} failures
  Medium:    {count} failures
  Low:       {count} failures

Top Findings:
  1. [{severity}] {attack-name} — {brief reasoning}
  2. [{severity}] {attack-name} — {brief reasoning}
  3. [{severity}] {attack-name} — {brief reasoning}
```

## Suggest Next Steps

If critical/high failures exist:
> Found {n} critical/high severity vulnerabilities. Launching remediation agent to suggest fixes.

If only medium/low failures:
> No critical vulnerabilities found. {n} medium/low issues detected. Run `/prompt-armor:report` for details.

If all passed:
> All attacks passed. Your LLM application appears well-defended against the tested attack vectors.
