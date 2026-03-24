---
name: scan
description: Full LLM red team pipeline — analyze code, plan attacks, test endpoints, judge results, suggest remediation
argument-hint: "[--target <url>] [--suites jailbreak,injection,...] [--mutations base64,multilingual,...] [--config promptarmor.yaml]"
allowed-tools:
  - Bash
  - Glob
  - Grep
  - Read
  - Write
  - Agent
  - mcp__prompt-armor__run_attack_suite
  - mcp__prompt-armor__send_attack
  - mcp__prompt-armor__judge_response
  - mcp__prompt-armor__save_results
  - mcp__prompt-armor__generate_report
  - mcp__prompt-armor__validate_config
  - mcp__prompt-armor__list_attacks
  - mcp__prompt-armor__list_mutations
---

# PromptArmor: Full Red Team Scan

Run a complete LLM security red team assessment. This is the flagship command that orchestrates the full pipeline.

## Pipeline

### Phase 1: Configuration
1. Check for `promptarmor.yaml` in the current directory
2. If `--config` flag provided, use that config file
3. If no config exists, use CLI flags and sensible defaults
4. Validate config via MCP `validate_config` tool

### Phase 2: Code Reconnaissance
Launch the **recon-agent** to analyze the codebase:
- Find system prompts, tool definitions, guardrails, provider config
- Identify LLM integration patterns (OpenAI SDK, Anthropic SDK, LangChain, etc.)
- Map data flows from user input to LLM calls
- Save recon results to `.prompt-armor/recon/`

### Phase 3: Attack Planning
Launch the **attack-planner** agent with recon results:
- Prioritize attack categories based on discovered attack surface
- Select mutation strategies appropriate to the target
- Estimate coverage across OWASP LLM Top 10

### Phase 4: Attack Execution
Launch the **red-teamer** agent:
- Execute planned attacks via MCP `run_attack_suite` tool
- Apply mutation strategies to each attack
- Judge responses via MCP `judge_response` tool (LLM-as-judge + pattern matching)
- Save results incrementally via MCP `save_results` tool

### Phase 5: Verdict Review
Launch the **judge-agent** for borderline cases:
- Review results where pattern matching and LLM judge disagree
- Apply context-aware grading using recon results
- Update verdicts with higher confidence

### Phase 6: Remediation
Launch the **remediation-agent**:
- For each failed test, generate code-specific fix suggestions
- Reference actual file:line locations from recon phase
- Suggest system prompt hardening, input validation, output filtering

### Phase 7: Report
- Call MCP `generate_report` with requested formats
- Display summary in terminal: total/passed/failed, severity breakdown, top findings
- Save reports to `.prompt-armor/reports/`

## Output

Results are saved to `.prompt-armor/` in the project root:
```
.prompt-armor/
  scans/scan-{timestamp}.json       # Full scan results
  recon/recon-{timestamp}.json      # Code reconnaissance results
  reports/report-{timestamp}.md     # Markdown report
  reports/report-{timestamp}.json   # JSON report
  reports/report-{timestamp}.sarif  # SARIF for GitHub Security
```

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--target` | from config | Target endpoint URL |
| `--suites` | all | Attack suites: jailbreak, injection, tool-abuse, harmful, bias, pii, compliance, agentic, rag, other |
| `--mutations` | base64,multilingual,crescendo | Mutation strategies to apply |
| `--format` | text,json | Output formats: text, json, sarif |
| `--config` | promptarmor.yaml | Config file path |
| `--concurrency` | 5 | Parallel attack requests |
| `--skip-recon` | false | Skip code analysis phase |
| `--skip-remediation` | false | Skip remediation phase |
| `--fail-on` | critical | CI fail threshold: critical, high, medium, low, any |

## Exit Codes

- `0` — All tests passed (or no tests exceeded `--fail-on` threshold)
- `1` — Vulnerabilities found exceeding `--fail-on` threshold
