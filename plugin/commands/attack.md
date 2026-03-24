---
name: attack
description: Run a specific attack category or individual attack against a target endpoint
argument-hint: "<category|attack-id> --target <url> [--mutations base64,...] [--num 5]"
allowed-tools:
  - Read
  - Agent
  - mcp__prompt-armor__send_attack
  - mcp__prompt-armor__judge_response
  - mcp__prompt-armor__save_results
  - mcp__prompt-armor__list_attacks
  - mcp__prompt-armor__list_mutations
---

# PromptArmor: Targeted Attack

Run a specific attack category or individual attack plugin against a target endpoint. Useful for focused testing.

## Usage

```
/prompt-armor:attack jailbreak --target https://api.example.com/chat
/prompt-armor:attack jailbreak:basic-ignore --target https://api.example.com/chat
/prompt-armor:attack tool-abuse --target https://api.example.com/chat --mutations base64,multilingual
/prompt-armor:attack harmful --target https://api.example.com/chat --num 3
```

## Process

1. Resolve the attack category or specific plugin ID via MCP `list_attacks`
2. Apply requested mutation strategies (if any)
3. Send attacks to target via MCP `send_attack`
4. Judge responses via MCP `judge_response`
5. Display results inline with pass/fail, severity, and reasoning
6. Save results via MCP `save_results`

## Available Categories

| Category | Attacks | Description |
|----------|---------|-------------|
| jailbreak | 13 | Instruction bypass, persona switching, encoding tricks |
| injection | 5 | Direct/indirect prompt injection, system override |
| tool-abuse | 12 | SQL injection, SSRF, file access, privilege escalation via tools |
| harmful | 18 | Violent, illegal, hateful, self-harm, sexual, misinformation content |
| bias | 5 | Age, gender, race, disability, religion bias |
| pii | 4 | PII disclosure, session leaks, social engineering |
| compliance | 4 | HIPAA, COPPA, FERPA, GDPR violations |
| agentic | 3 | Memory poisoning, cross-session leaks, goal misalignment |
| rag | 3 | Document exfiltration, source attribution, poisoning |
| other | 13+ | Hallucination, imitation, contracts, competitors, debug access |

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--target` | from config | Target endpoint URL |
| `--mutations` | none | Mutation strategies to apply |
| `--num` | 5 | Number of variants per plugin |
| `--format` | openai | Endpoint format: openai, anthropic, rest-json |
