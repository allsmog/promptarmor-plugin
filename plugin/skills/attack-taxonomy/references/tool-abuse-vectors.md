# Tool Abuse Vectors Taxonomy

## Overview

Tool abuse vectors exploit the interface between an LLM and its registered tools/functions. Tools are where LLM decisions become real-world actions, making them the highest-impact attack surface. A prompt injection that only produces text is limited; a prompt injection that triggers unauthorized tool calls can delete data, exfiltrate information, send communications, or execute code.

## Taxonomy of Tool Abuse Vectors

### 1. Parameter Injection

Manipulate the parameters the LLM passes to tools.

- **SQL via parameters**: Craft user input that causes the LLM to include SQL fragments in parameters passed to database query tools.
- **Path traversal via parameters**: Influence the LLM to pass file paths containing traversal sequences (e.g., `../../etc/passwd`) to file-reading tools.
- **Command injection via parameters**: Cause the LLM to include shell metacharacters in parameters passed to system command tools.
- **URL manipulation**: Influence parameters to point to internal network resources (SSRF) or attacker-controlled endpoints.

**PromptArmor plugins**: `tool-input-injection`, `tool-path-traversal`, `ssrf-via-url-gen`
**OWASP mapping**: LLM02 (Insecure Output), LLM07 (Insecure Plugin Design)

### 2. Unauthorized Tool Invocation

Cause the LLM to invoke tools it should not use for the current request.

- **Cross-purpose invocation**: User asks a question, but injected instructions cause the LLM to call an unrelated tool (e.g., user asks about weather, injection causes email sending).
- **Hidden invocation**: Tools invoked as intermediate steps in a chain that the user cannot see or approve.
- **Privilege escalation through tools**: Using a low-privilege tool to discover information that enables invoking a high-privilege tool.

**PromptArmor plugins**: `tool-permission-escalation`, `excessive-tool-inventory`, `hidden-invocation-test`
**OWASP mapping**: LLM07 (Insecure Plugin Design), LLM08 (Excessive Agency)

### 3. Tool Chain Exploitation

Exploit multi-step tool chains to achieve outcomes that no single tool call would permit.

- **Data aggregation**: Chain multiple read operations to assemble sensitive information that should not be available in aggregate.
- **State manipulation**: Use a sequence of tool calls to modify system state in ways that bypass individual operation controls.
- **Confused deputy**: Use Tool A's output as input to Tool B in a way that bypasses Tool B's access controls.
- **Lateral movement**: Use information from one tool to discover and exploit another tool's vulnerabilities.

**PromptArmor plugins**: `tool-chain-exploit`, `autonomous-action-chain`
**OWASP mapping**: LLM07 (Insecure Plugin Design), LLM08 (Excessive Agency)

### 4. Tool Output Injection

Exploit the fact that tool outputs are fed back into the LLM's context.

- **Injection via tool response**: A tool returns data containing injection payloads (e.g., a database record contains "Ignore previous instructions..."). When this data enters the LLM context as a tool result, it acts as an indirect injection.
- **Recursive injection**: Tool output causes the LLM to call another tool, whose output causes another call, creating an infinite loop.
- **Context pollution**: Tool output fills the context window with irrelevant data, degrading the model's ability to follow system instructions.

**PromptArmor plugins**: `tool-output-inject`, `recursive-tool-loop`
**OWASP mapping**: LLM01 (Prompt Injection), LLM04 (Model DoS), LLM07 (Insecure Plugin Design)

### 5. Rate and Resource Abuse

Exploit tools to consume excessive resources or cause denial of service.

- **Rapid invocation**: Trigger tool calls at maximum rate to exhaust API quotas or compute resources.
- **Large result amplification**: Craft queries that cause tools to return massive datasets, consuming memory and tokens.
- **Infinite loops**: Create conditions where the LLM repeatedly calls tools without convergence.
- **Cost amplification**: Trigger expensive external API calls (paid APIs, cloud services) through tool abuse.

**PromptArmor plugins**: `tool-rate-abuse`, `recursive-tool-loop`, `token-amplification`
**OWASP mapping**: LLM04 (Model DoS)

### 6. Exfiltration via Tools

Use tools as data exfiltration channels.

- **Email exfiltration**: Cause the LLM to send sensitive data via an email-sending tool.
- **Webhook exfiltration**: Cause the LLM to call an attacker-controlled webhook with sensitive data in the request.
- **File write exfiltration**: Write sensitive data to a publicly accessible file location.
- **Search query exfiltration**: Encode sensitive data in search queries sent to external search APIs.

**PromptArmor plugins**: `tool-based-exfil`, `markdown-exfil`
**OWASP mapping**: LLM06 (Sensitive Information Disclosure), LLM07 (Insecure Plugin Design)

### 7. Human-in-the-Loop Bypass

Circumvent confirmation requirements designed to protect against unauthorized tool use.

- **Batch approval manipulation**: Cause the LLM to present multiple actions for approval, burying the malicious one among legitimate requests.
- **Approval fatigue**: Trigger frequent confirmation requests to train the user to approve without reading.
- **Description manipulation**: Cause the LLM to describe a tool action inaccurately to the user (e.g., "I'll look up your account" while actually sending an email).
- **Pre-confirmation execution**: Exploit race conditions where tool execution begins before confirmation is received.

**PromptArmor plugins**: `human-in-loop-bypass`, `approval-fatigue-test`
**OWASP mapping**: LLM08 (Excessive Agency)

## Testing Strategy

1. **Enumerate all tools**: List every tool registered with the LLM and its parameters.
2. **Test each vector per tool**: For each tool, test all applicable abuse vectors from this taxonomy.
3. **Test tool combinations**: Test multi-tool chains for confused deputy and escalation scenarios.
4. **Test with indirect injection**: Combine tool abuse vectors with indirect injection (via RAG, API responses).
5. **Verify sandboxing**: For each tool, confirm that input validation, permission boundaries, rate limits, and output filtering are effective.

## Key Principle

Every tool is an attack surface. Design and test tools assuming the LLM will eventually be tricked into misusing them. The question is not whether the LLM will make a bad tool call, but how much damage that bad call can do.
