# LLM01: Prompt Injection

## Description

Prompt injection occurs when an attacker manipulates an LLM through crafted inputs that cause the model to override its system instructions, bypass safety guardrails, or execute unintended actions. This is the single most critical vulnerability class in LLM applications.

There are two primary variants:

- **Direct prompt injection**: The attacker provides input directly to the model that overrides system-level instructions (e.g., "Ignore all previous instructions and...").
- **Indirect prompt injection**: Malicious content is embedded in external data sources (documents, web pages, emails, database records) that the LLM retrieves and processes during its workflow. The model treats the injected content as trusted instructions.

## Real-World Examples

1. **Bing Chat data exfiltration (2023)**: Researchers injected hidden instructions into web pages that Bing Chat retrieved during search. The injected text caused the model to exfiltrate user conversation history via markdown image URLs.
2. **ChatGPT plugin abuse (2023)**: Indirect injection through retrieved documents caused ChatGPT to invoke plugins the user never intended, including sending emails and accessing files.
3. **GitHub Copilot poisoning (2023)**: Malicious comments embedded in public repositories influenced Copilot suggestions, introducing vulnerable code patterns into developer workflows.
4. **Google Bard markdown injection (2023)**: Crafted Google Docs content caused Bard to render attacker-controlled markdown that exfiltrated session data through image tags.
5. **RAG poisoning in enterprise search**: Attackers plant documents in shared drives containing hidden instructions that hijack internal LLM-powered search assistants.

## Detection Methodology

### Static Analysis
- Scan for missing or weak system prompt boundaries (no delimiter tokens, no instruction hierarchy).
- Identify user input concatenated directly into prompts without sanitization.
- Check for RAG pipelines that inject retrieved content without content-type separation.
- Look for tool-calling flows where tool output is re-injected into the prompt without escaping.

### Dynamic Testing
- Send direct override payloads: "Ignore previous instructions," "You are now DAN," role-switching attacks.
- Test delimiter escape sequences: Attempt to close system prompt delimiters and inject new instructions.
- Inject payloads into data sources the LLM retrieves (documents, APIs, databases).
- Test multi-turn injection: Build rapport over multiple turns before injecting override in later messages.
- Test encoding mutations: Base64, ROT13, Unicode homoglyphs, zero-width characters.

### Behavioral Signals
- Model produces output that contradicts its stated system instructions.
- Model invokes tools or functions not requested by the user.
- Model reveals system prompt content when challenged.
- Model changes persona, tone, or behavioral boundaries mid-conversation.

## Attack Mapping (PromptArmor Plugins)

| Plugin | Technique | Variant |
|--------|-----------|---------|
| `direct-override` | "Ignore previous instructions" and variants | Direct |
| `delimiter-escape` | Close/reopen instruction blocks | Direct |
| `role-switching` | Persona hijack ("You are now...") | Direct |
| `indirect-rag-inject` | Payloads embedded in retrieved documents | Indirect |
| `tool-output-inject` | Malicious content in tool/API responses | Indirect |
| `multi-turn-escalation` | Gradual boundary erosion across turns | Direct |
| `encoding-bypass` | Base64/ROT13/Unicode payload obfuscation | Both |
| `markdown-exfil` | Image/link-based data exfiltration | Indirect |
| `few-shot-override` | Injected examples that redefine behavior | Direct |
| `context-window-flood` | Push system prompt out of attention window | Direct |

## Remediation Checklist

- [ ] Implement strict input/output separation: Never concatenate user input directly into system prompts without delimiters and role markers.
- [ ] Use structured prompt formats with explicit instruction hierarchy (system > developer > user).
- [ ] Apply input validation: reject or sanitize known injection patterns before they reach the model.
- [ ] Implement privilege separation: The LLM should not have the same permissions as the user for tool execution. Require human-in-the-loop for destructive actions.
- [ ] Use content-type tagging for RAG: Mark retrieved content as "untrusted data" in the prompt, distinct from instructions.
- [ ] Deploy canary tokens in system prompts to detect extraction attempts.
- [ ] Monitor for behavioral anomalies: system prompt leakage, unexpected tool invocations, persona shifts.
- [ ] Limit tool exposure: Only register tools the current conversation flow requires.
- [ ] Apply output filtering to block data exfiltration patterns (encoded URLs, markdown images with dynamic src).
- [ ] Use ensemble detection: Run a secondary classifier on inputs to flag injection attempts before they reach the primary model.
- [ ] Rate-limit and log all tool invocations triggered by LLM decisions.
- [ ] Regularly red-team with updated injection payloads as new bypass techniques emerge.

## Key Insight

Prompt injection is not a bug that can be patched with a single fix. It is an inherent property of how LLMs process mixed instruction/data streams. Defense must be layered: input validation, architectural separation, behavioral monitoring, and output filtering all contribute to reducing risk, but no single measure eliminates it.
