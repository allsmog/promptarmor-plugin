---
name: report
description: Generate a report from saved scan results
argument-hint: "[--scan-id <id>] [--format text,json,sarif] [--output <path>]"
allowed-tools:
  - Read
  - Write
  - mcp__prompt-armor__get_results
  - mcp__prompt-armor__generate_report
---

# PromptArmor: Generate Report

Generate a formatted report from saved scan results.

## Process

1. Load scan results via MCP `get_results` (latest scan or specific `--scan-id`)
2. Generate report in requested formats via MCP `generate_report`
3. Save reports to `.prompt-armor/reports/` or specified `--output` path
4. Display summary in terminal

## Output Formats

### Text/Markdown
Human-readable report with:
- Executive summary (total/passed/failed, severity breakdown)
- Findings by severity (critical → low)
- Each finding: attack name, category, prompt used, response excerpt, verdict, reasoning
- OWASP LLM Top 10 coverage map
- Remediation recommendations

### JSON
Machine-readable format matching the `ScanResult` schema.

### SARIF v2.1.0
GitHub Security compatible format. Upload with:
```bash
gh api -X POST repos/OWNER/REPO/code-scanning/sarifs \
  -f commit_sha="$(git rev-parse HEAD)" \
  -f ref="refs/heads/$(git rev-parse --abbrev-ref HEAD)" \
  -f sarif="$(gzip -c report.sarif | base64 | tr -d '\n')"
```

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--scan-id` | latest | Specific scan ID to report on |
| `--format` | text | Output formats: text, json, sarif (comma-separated) |
| `--output` | .prompt-armor/reports/ | Output directory |
