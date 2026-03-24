# LLM02: Insecure Output Handling

## Description

Insecure output handling occurs when an application consumes LLM-generated output without proper validation, sanitization, or encoding. Because LLMs generate free-form text, their output can contain executable code, injection payloads, or structured data that downstream systems interpret as commands. This vulnerability turns the LLM into an attack vector against the application's own backend, frontend, or integrated systems.

The core issue is trust: applications that treat LLM output as safe, sanitized, or predictable are vulnerable. LLM output should be treated with the same suspicion as untrusted user input.

## Real-World Examples

1. **XSS via LLM output**: A chatbot renders LLM responses as HTML. An attacker injects a prompt that causes the model to output script tags, achieving stored XSS in the chat interface.
2. **SQL injection through LLM-generated queries**: A natural-language-to-SQL application passes LLM-generated SQL directly to a database. Crafted user input causes the model to generate destructive SQL statements.
3. **Server-Side Request Forgery (SSRF)**: An LLM generates URLs for API calls. Attacker-influenced input causes the model to output internal network URLs, enabling SSRF.
4. **Command injection via code generation**: An LLM generates shell commands for a DevOps assistant. Malicious prompts cause it to generate commands with injected payloads.
5. **LDAP/NoSQL injection**: LLM output is used to construct LDAP queries or MongoDB filters without parameterization.

## Detection Methodology

### Static Analysis
- Trace LLM output to all downstream consumers (DOM rendering, database queries, API calls, shell execution, file writes).
- Check whether output is passed through sanitization or encoding functions before use.
- Identify any dynamic code evaluation, raw HTML rendering, or raw SQL construction using LLM output.
- Look for template engines rendering LLM output without auto-escaping.

### Dynamic Testing
- Instruct the LLM to produce output containing XSS payloads and verify whether the frontend renders them.
- Craft inputs that cause the model to generate SQL injection, command injection, or path traversal payloads.
- Test whether LLM-generated URLs are fetched without allowlist validation.
- Inject structured data (JSON, XML, YAML) through the LLM and check if downstream parsers process it unsafely.
- Test for SSTI by causing the LLM to output template syntax.

### Behavioral Signals
- LLM output contains HTML/JS/SQL that is not expected for the use case.
- Downstream systems throw unexpected errors after processing LLM output.
- LLM-generated content triggers WAF rules when rendered or processed.

## Attack Mapping (PromptArmor Plugins)

| Plugin | Technique |
|--------|-----------|
| `xss-via-output` | Cause LLM to emit script tags, event handlers |
| `sqli-via-nlq` | Exploit natural-language-to-SQL pipelines |
| `ssrf-via-url-gen` | Cause LLM to generate internal/malicious URLs |
| `command-inject-output` | Cause LLM to generate shell-injectable commands |
| `ssti-via-output` | Cause LLM to emit template injection syntax |
| `json-inject-output` | Cause LLM to produce malformed JSON that breaks parsers |
| `markdown-exfil` | Exfiltrate data via rendered markdown image tags |

## Remediation Checklist

- [ ] Treat all LLM output as untrusted input. Apply the same sanitization you would to user-supplied data.
- [ ] Use context-appropriate output encoding: HTML-encode for web rendering, parameterize for SQL, shell-escape for commands.
- [ ] Never use dynamic code evaluation functions or raw HTML insertion with LLM output.
- [ ] Implement allowlists for LLM-generated URLs, file paths, and command components.
- [ ] Use parameterized queries for any LLM-generated database operations. Never construct SQL by string concatenation.
- [ ] Sandbox code execution: If the LLM generates code that will be executed, run it in an isolated environment with no network access and limited filesystem permissions.
- [ ] Apply Content Security Policy (CSP) headers to prevent inline script execution from LLM output.
- [ ] Validate LLM output against expected schemas (JSON Schema, regex patterns) before passing to downstream systems.
- [ ] Log all LLM outputs that are passed to security-sensitive operations for audit and anomaly detection.
- [ ] Implement output length limits to prevent the LLM from generating unexpectedly large payloads.

## Key Insight

The LLM is a text generator, not a security boundary. Any system that consumes LLM output must enforce its own input validation. The attack surface is wherever LLM output crosses a trust boundary into a system that interprets text as code, commands, or structured data.
