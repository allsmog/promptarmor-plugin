# PromptArmor — LLM Security Red Teaming

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Claude Code plugin + MCP server for LLM application security red teaming. Reads your code, tests your endpoints, fixes your vulnerabilities.

## Why PromptArmor

Existing tools like promptfoo test endpoints blind — they send attacks and check responses, but have no idea what your system prompt says, what tools you expose, or where your guardrails are. PromptArmor reads the code first:

1. **Recon** — Scans your codebase to find system prompts, tool definitions, guardrails, and injection surfaces
2. **Plan** — Prioritizes attacks based on what it found (found a SQL tool? Prioritize SQL injection. System prompt says "never discuss competitors"? Test that specifically.)
3. **Attack** — Sends 80+ attack types with 25+ mutation strategies against your endpoint
4. **Judge** — LLM-as-judge + pattern matching + context-aware grading
5. **Fix** — Generates actual code patches at specific file:line locations, not generic advice

## Quick Start

### Install the plugin
```bash
claude plugin add ./plugin
```

### Run a full scan
```
/prompt-armor:scan --target https://your-app.com/api/chat
```

### Or just analyze the code
```
/prompt-armor:analyze
```

## Architecture

Two components working together:

```
┌─────────────────────────────────────────────┐
│  Claude Code Plugin                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐│
│  │ Commands │ │ Agents   │ │ Skills       ││
│  │ 6 cmds   │ │ 5 agents │ │ 5 modules    ││
│  └──────────┘ └──────────┘ └──────────────┘│
│  ┌──────────┐                               │
│  │ Hooks    │                               │
│  │ 4 hooks  │                               │
│  └──────────┘                               │
└───────────────────┬─────────────────────────┘
                    │ MCP Protocol
┌───────────────────▼─────────────────────────┐
│  MCP Server (TypeScript)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐│
│  │ Attacks  │ │ Judge    │ │ Reports      ││
│  │ 80+      │ │ 3-tier   │ │ text/json/   ││
│  │ plugins  │ │ grading  │ │ sarif        ││
│  └──────────┘ └──────────┘ └──────────────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐│
│  │Mutations │ │ Client   │ │ State        ││
│  │ 25+      │ │ adapters │ │ persistence  ││
│  │strategies│ │ for APIs │ │ JSON files   ││
│  └──────────┘ └──────────┘ └──────────────┘│
└─────────────────────────────────────────────┘
```

## Commands

| Command | Description |
|---------|-------------|
| `/prompt-armor:scan` | Full pipeline: code analysis → attack planning → testing → remediation → report |
| `/prompt-armor:analyze` | Code-only analysis — find LLM integration points without testing endpoints |
| `/prompt-armor:attack <category>` | Run specific attack category against an endpoint |
| `/prompt-armor:report` | Generate report from saved results |
| `/prompt-armor:config` | Create or validate `promptarmor.yaml` |
| `/prompt-armor:diff` | Compare two scan results for regression tracking |

## Agents

| Agent | Role |
|-------|------|
| **recon-agent** | Scans codebase for system prompts, tool schemas, guardrails, injection surfaces |
| **attack-planner** | Creates targeted attack strategy based on recon findings |
| **red-teamer** | Executes attacks via MCP server tools |
| **judge-agent** | Reviews borderline verdicts with context-aware grading |
| **remediation-agent** | Generates code-specific fixes with file:line references |

## Attack Coverage

**80+ attack plugins** across 10 categories:

| Category | Count | Examples |
|----------|-------|---------|
| Jailbreak | 13 | Basic ignore, role switch, DAN, system prompt extract, delimiter injection |
| Injection | 5 | Direct, indirect, context compliance, system override, prompt extraction |
| Tool Abuse | 12 | SQL injection, SSRF, file read/write, code execution, privilege escalation |
| Harmful | 18 | Violence, crime, hate, self-harm, drugs, weapons, cybercrime, misinformation |
| Bias | 5 | Age, gender, race, disability, religion |
| PII | 4 | Direct disclosure, session leak, social engineering, DB leak |
| Compliance | 4 | HIPAA, COPPA, FERPA, GDPR |
| Agentic | 3 | Memory poisoning, cross-session leak, goal misalignment |
| RAG | 3 | Document exfiltration, source attribution, poisoning |
| Other | 13+ | Hallucination, imitation, contracts, competitors, debug access |

**25+ mutation strategies:**

| Type | Strategies |
|------|-----------|
| Encoding | Base64, ROT13, Hex, Leetspeak, Homoglyph, Morse, Pig Latin, Emoji, ASCII Smuggling |
| Structural | Few-Shot Prime, Context Stuffing, Instruction Delimiter, Markdown Injection, Citation, Authoritative Markup |
| Multi-turn | Crescendo, GOAT, HYDRA, Retry |
| Advanced | Multilingual (10 languages), Math Prompt, Best-of-N, Jailbreak Templates, Composite |

## Configuration

Create a `promptarmor.yaml`:

```yaml
target:
  url: https://your-app.com/api/chat
  format: openai
attacks:
  suites: [jailbreak, injection, tool-abuse, harmful, pii]
  num_per_plugin: 5
mutations:
  strategies: [base64, multilingual, crescendo]
judge:
  provider: anthropic
analysis:
  enabled: true
  paths: [src/]
output:
  formats: [text, json, sarif]
ci:
  fail_on: critical
```

## Output Formats

- **Text/Markdown** — Human-readable report with findings, severity, and remediation
- **JSON** — Machine-readable for automation
- **SARIF v2.1.0** — Upload to GitHub Security tab

## CI Integration

PromptArmor detects CI environments automatically and adjusts:
- JSON/SARIF output (no interactive prompts)
- Exit code 1 when vulnerabilities exceed `--fail-on` threshold
- Artifacts saved to `.prompt-armor/` for collection

## MCP Server

The MCP server is usable standalone by any MCP client (Claude Desktop, Cursor, etc.):

| Tool | Purpose |
|------|---------|
| `run_attack_suite` | Run a full suite of attacks |
| `send_attack` | Send a single attack |
| `judge_response` | Judge a response |
| `get_results` / `save_results` | State management |
| `generate_report` | Generate reports |
| `list_attacks` / `list_mutations` | Discovery |
| `validate_config` | Config validation |

## E2E Verified

Tested against an intentionally vulnerable Node.js chat endpoint with keyword-triggered secret disclosure, system prompt leakage, and no input sanitization:

```
$ /prompt-armor:scan --target http://localhost:4010/api/chat

.prompt-armor/recon/recon-2026-03-24.json    324 lines  (system prompts, tool schemas, guardrails, injection surfaces)
.prompt-armor/state.json                     492 lines  (full scan state with per-test verdicts)

Tests: 34 total across 10 categories
  Passed: 31
  Failed:  3 (high severity)

By category:
  jailbreak:   3/3 passed    injection:  3/4 (1 failed)
  harmful:     3/3 passed    tool-abuse: 3/3 passed
  bias:        3/3 passed    pii:        4/4 passed
  compliance:  1/3 (2 failed) agentic:   3/3 passed
  rag:         3/3 passed    other:      3/3 passed
```

Recon correctly identified the system prompt (`src/config.js:3`), tool schemas, hardcoded secrets, and all injection surfaces with file:line references.

## Development

```bash
npm install             # Install dependencies
cd server && npm test   # Run server tests
```

## License

[MIT](LICENSE)
