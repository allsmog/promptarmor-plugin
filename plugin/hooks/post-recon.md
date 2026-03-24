---
name: post-recon
description: Summarize reconnaissance findings and suggest attack strategy
event: SubagentStop
match_subagent: recon-agent
---

# Post-Reconnaissance Summary

When the recon-agent completes, analyze its findings and present a summary:

## Summary Template

```
Code Reconnaissance Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━

System Prompts Found:     {count}
Tool Definitions Found:   {count}
Guardrails Identified:    {count}
Injection Surfaces:       {count}

OWASP LLM Top 10 Exposure:
  LLM01 Prompt Injection:    {high|medium|low|none}
  LLM02 Insecure Output:     {high|medium|low|none}
  ...

Recommended Attack Priority:
  1. {category} — {reason based on recon}
  2. {category} — {reason based on recon}
  3. {category} — {reason based on recon}
```

## Next Steps
Suggest proceeding with attack planning, or ask if the user wants to review recon results first.
