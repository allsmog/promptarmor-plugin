---
name: analyze
description: Code-only analysis — find LLM integration points, system prompts, tool schemas, and guardrails without testing endpoints
argument-hint: "[path] [--frameworks auto|openai,anthropic,langchain,...]"
allowed-tools:
  - Glob
  - Grep
  - Read
  - Write
  - Agent
---

# PromptArmor: Code Analysis

Analyze the codebase to discover LLM integration points without testing any live endpoints. Useful for pre-deployment security review.

## What It Finds

1. **System prompts** — Strings assigned to `role: "system"`, `systemPrompt`, `SYSTEM_PROMPT`, system message constructors
2. **Tool definitions** — OpenAI function calling schemas, MCP tool definitions, LangChain tool decorators
3. **Guardrails** — Content filters, input validation, output sanitization, moderation API calls
4. **Provider config** — Which LLM provider, model, temperature, max tokens, API key references
5. **Data flows** — How user input flows into prompt construction and then to LLM calls
6. **Injection surfaces** — Where untrusted input enters the prompt without sanitization

## Process

1. Launch the **recon-agent** to scan the codebase
2. Produce a structured report of all findings
3. Map findings to OWASP LLM Top 10 categories
4. Suggest which attack suites would be most relevant for endpoint testing
5. Save results to `.prompt-armor/recon/`

## Output

Structured JSON report at `.prompt-armor/recon/recon-{timestamp}.json` containing:
- `systemPrompts[]` — file, line, content, framework
- `toolSchemas[]` — file, line, name, parameters, permissions
- `guardrails[]` — file, line, type (input/output/moderation), coverage
- `providers[]` — file, line, provider, model, config
- `dataFlows[]` — source (user input point), sink (LLM call), sanitization (if any)
- `injectionSurfaces[]` — file, line, description, severity
- `recommendations[]` — priority, category, description
