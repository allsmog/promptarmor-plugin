---
name: config
description: Create or validate a promptarmor.yaml configuration file
argument-hint: "[init|validate] [--target <url>] [--format openai|anthropic|rest-json]"
allowed-tools:
  - Read
  - Write
  - Glob
  - mcp__prompt-armor__validate_config
---

# PromptArmor: Configuration

Create or validate a `promptarmor.yaml` configuration file.

## Subcommands

### `init` (default)
Create a new `promptarmor.yaml` with sensible defaults. Asks the user for:
1. Target endpoint URL
2. Endpoint format (openai, anthropic, rest-json, custom)
3. Which attack suites to enable
4. Which mutation strategies to use
5. Judge provider preference

### `validate`
Validate an existing `promptarmor.yaml` using the MCP `validate_config` tool.

## Config Schema

```yaml
target:
  url: https://your-app.com/api/chat
  format: openai                    # openai | anthropic | rest-json | custom
  method: POST
  headers:
    Authorization: "Bearer ${API_KEY}"
  request:
    prompt_field: messages[-1].content
  response:
    response_field: choices[0].message.content

attacks:
  suites:                           # Attack categories to run
    - jailbreak
    - injection
    - tool-abuse
    - harmful
    - pii
  exclude: []                       # Specific plugin IDs to skip
  num_per_plugin: 5                 # Variants per plugin

mutations:
  strategies:
    - base64
    - multilingual
    - crescendo

judge:
  provider: anthropic               # anthropic | openai | gemini | pattern-only
  model: claude-haiku-4-5-20251001

analysis:
  enabled: true
  paths: [src/]
  exclude: [node_modules/, test/]

execution:
  concurrency: 5
  timeout: 30s

output:
  formats: [text, json, sarif]
  path: .prompt-armor/reports/

ci:
  fail_on: critical                 # critical | high | medium | low | any
```
