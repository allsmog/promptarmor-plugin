# LLM07: Insecure Plugin Design

## Description

Insecure plugin design occurs when LLM plugins, tools, or extensions are built without adequate security controls. Plugins extend the LLM's capabilities by allowing it to interact with external systems (databases, APIs, file systems, code execution environments). When these plugins lack proper input validation, access controls, or sandboxing, they become the primary mechanism through which prompt injection achieves real-world impact.

Key vulnerability patterns:
- **Insufficient input validation**: Plugins accept LLM-generated input without validating format, range, or content.
- **Excessive permissions**: Plugins operate with broader permissions than needed (e.g., full database access when only read is required).
- **Missing authentication**: Plugins do not verify that the requesting user is authorized for the operation.
- **No rate limiting**: Plugins can be called unlimited times, enabling abuse through repeated invocations.
- **Blind trust in LLM decisions**: Plugins execute whatever the LLM requests without human confirmation for sensitive operations.

## Real-World Examples

1. **ChatGPT code interpreter escape (2023)**: Researchers escaped the sandbox of ChatGPT's code interpreter plugin to access the host filesystem and network.
2. **Slack bot data exfiltration**: An LLM-powered Slack bot with a "send message" plugin was manipulated via indirect prompt injection to forward confidential channel messages to an attacker-controlled channel.
3. **Database plugin SQL injection**: An LLM tool designed to run read-only database queries was exploited to execute write operations because the plugin did not enforce read-only permissions at the database level.
4. **File system plugin path traversal**: A document-reading plugin accepted LLM-generated file paths without validation, enabling access to files outside the intended directory.
5. **Email plugin abuse**: An LLM assistant's email-sending plugin was triggered by indirect injection in a retrieved document, causing it to send phishing emails on behalf of the user.

## Detection Methodology

### Static Analysis
- Audit every plugin/tool for input validation on all parameters.
- Check permission scoping: Does each plugin use least-privilege database connections, API keys, and file system access?
- Verify that destructive operations (write, delete, send) require human confirmation.
- Look for path traversal vulnerabilities in file-accessing plugins.
- Check for SQL injection in database-querying plugins.
- Verify rate limiting on plugin invocations.

### Dynamic Testing
- Attempt to invoke plugins with malformed, oversized, or injection-containing parameters.
- Test permission boundaries: Can read-only plugins be coerced into write operations?
- Test path traversal through file-accessing plugins.
- Attempt to invoke plugins at excessive rates.
- Test whether destructive operations proceed without human confirmation.
- Verify plugin authentication: Can unauthenticated requests trigger plugin execution?

### Behavioral Signals
- Plugins execute operations not requested by the user.
- Plugin invocations contain parameters that do not match the user's intent.
- Plugins access resources outside their intended scope.
- Unusual plugin invocation patterns (high frequency, sequential escalation).

## Attack Mapping (PromptArmor Plugins)

| Plugin | Technique |
|--------|-----------|
| `tool-input-injection` | Inject malicious parameters into tool calls |
| `tool-permission-escalation` | Escalate plugin permissions beyond intended scope |
| `tool-path-traversal` | Access files outside intended directory via plugins |
| `tool-rate-abuse` | Invoke plugins at excessive rates |
| `tool-chain-exploit` | Chain multiple plugin calls to achieve unauthorized outcomes |
| `tool-output-inject` | Inject payloads through plugin response data |
| `human-in-loop-bypass` | Attempt to bypass confirmation requirements |

## Remediation Checklist

- [ ] Validate all plugin inputs: Apply strict schema validation, type checking, and range limits on every parameter.
- [ ] Enforce least privilege: Each plugin should have the minimum permissions needed. Use read-only database connections, scoped API tokens, and restricted file system access.
- [ ] Require human confirmation for destructive operations: Write, delete, send, and execute actions should require explicit user approval.
- [ ] Implement rate limiting on plugin invocations: Cap the number of calls per request, per session, and per time window.
- [ ] Sandbox plugin execution: Run plugins in isolated environments with limited network, filesystem, and process access.
- [ ] Apply output sanitization: Filter plugin outputs before they re-enter the LLM context to prevent injection chains.
- [ ] Implement plugin authentication: Verify the requesting user's identity and authorization for each plugin call.
- [ ] Use allowlists for plugin parameters: Restrict file paths, URLs, and identifiers to known-safe patterns.
- [ ] Log all plugin invocations: Record the requesting user, parameters, and results for audit and anomaly detection.
- [ ] Implement plugin capability declarations: Each plugin should declare exactly what resources it accesses, enabling policy enforcement.
- [ ] Test plugins in adversarial conditions: Include plugin security testing in CI/CD pipelines.

## Key Insight

Plugins are where prompt injection becomes real-world impact. A prompt injection alone can only produce text; a prompt injection combined with an insecure plugin can delete data, send emails, exfiltrate information, or execute code. Securing plugins is the single most effective way to limit the blast radius of successful prompt injection attacks.
