---
name: session-init
description: Initialize PromptArmor session — detect config, show previous scan state
event: SessionStart
---

# PromptArmor Session Initialization

When a session starts in a project with PromptArmor:

## Check for Configuration
Look for `promptarmor.yaml` in the current directory. If found, note the target URL and enabled suites.

## Check for Previous State
Look for `.prompt-armor/` directory. If it exists:
- Find the most recent scan in `.prompt-armor/scans/`
- Show a brief summary: date, total/passed/failed, top severity findings
- Mention that `/prompt-armor:diff` can compare with new scans

## Show Available Commands
If this appears to be an LLM application (detected by imports of openai, anthropic, langchain, etc.):

> PromptArmor detected. Available commands:
> - `/prompt-armor:scan` — Full red team pipeline
> - `/prompt-armor:analyze` — Code-only analysis
> - `/prompt-armor:attack <category>` — Targeted testing
