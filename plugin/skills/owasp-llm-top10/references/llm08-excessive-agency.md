# LLM08: Excessive Agency

## Description

Excessive agency occurs when an LLM-based system is granted capabilities, permissions, or autonomy beyond what is necessary for its intended function. This creates an unnecessarily large blast radius when things go wrong, whether due to prompt injection, hallucination, or simple model error. Excessive agency is the difference between an LLM that can read emails and one that can read, send, delete, and forward emails when it only needs to summarize inbox contents.

Key dimensions of excessive agency:
- **Excessive functionality**: The LLM has access to tools/plugins it does not need for its purpose.
- **Excessive permissions**: Tools operate with broader access than required (admin vs. read-only).
- **Excessive autonomy**: The LLM makes decisions and takes actions without human oversight or confirmation.
- **Unrestricted scope**: No limits on the volume, frequency, or targets of actions the LLM can take.

## Real-World Examples

1. **Auto-GPT uncontrolled execution**: Autonomous agent frameworks that execute multi-step plans without human checkpoints, leading to unintended file deletions, purchases, or API calls.
2. **Customer service bot with admin access**: A support chatbot connected to the user management API with full CRUD permissions when it only needed to look up account status.
3. **Code assistant with production access**: An AI coding assistant with SSH keys to production servers when it only needed access to a development environment.
4. **Email assistant with send permissions**: An email summarization tool that was also granted the ability to compose and send emails, enabling exfiltration via indirect prompt injection.
5. **Database assistant without row limits**: A natural-language query tool that could execute queries returning millions of rows, causing downstream system failures.

## Detection Methodology

### Static Analysis
- Inventory all tools/plugins registered with the LLM and verify each is necessary for the stated use case.
- Check permission scoping: Compare actual permissions granted to tools vs. the minimum required.
- Look for missing human-in-the-loop requirements on destructive or high-impact operations.
- Verify that tool invocation limits are configured (max calls per request, per session).
- Check for unrestricted query scope (no row limits, no resource boundaries).

### Dynamic Testing
- Attempt to invoke tools that should not be necessary for the LLM's stated purpose.
- Test whether the LLM can perform destructive operations without human confirmation.
- Verify rate limits and scope limits on tool invocations.
- Test whether the LLM can chain multiple tool calls to achieve an unauthorized outcome.
- Attempt to escalate from read to write operations through prompt manipulation.

### Behavioral Signals
- LLM invokes tools that are unrelated to the user's request.
- LLM takes actions without being asked (proactive tool use).
- Tool invocations exceed expected frequency or scope.
- LLM performs write/delete/send operations when only read was requested.

## Attack Mapping (PromptArmor Plugins)

| Plugin | Technique |
|--------|-----------|
| `tool-permission-escalation` | Attempt to use tools beyond stated purpose |
| `excessive-tool-inventory` | Identify unnecessary tools registered with the LLM |
| `human-in-loop-bypass` | Test whether confirmations can be bypassed |
| `autonomous-action-chain` | Test for uncontrolled multi-step execution |
| `scope-boundary-test` | Verify resource access boundaries |
| `privilege-audit` | Map actual vs. required permissions for each tool |

## Remediation Checklist

- [ ] Apply principle of least privilege: Only register tools that the LLM needs for its specific use case.
- [ ] Scope permissions minimally: Use read-only database connections, scoped API tokens, and restricted file paths.
- [ ] Require human confirmation for all state-changing operations: Any write, delete, send, or execute action should present the planned action to the user for approval.
- [ ] Implement action budgets: Limit the number of tool invocations per request and per session.
- [ ] Use allowlists for tool targets: Restrict which resources (tables, files, APIs, recipients) each tool can access.
- [ ] Implement progressive trust: Start with minimal permissions and only escalate with explicit user authorization.
- [ ] Separate read and write tools: If the LLM needs to query data and occasionally modify it, implement these as separate tools with different permission requirements.
- [ ] Log all autonomous actions: Every tool invocation should be logged with full context for audit.
- [ ] Implement undo/rollback: Where possible, make LLM-initiated actions reversible.
- [ ] Conduct regular agency audits: Periodically review which tools are registered and whether they are still necessary.
- [ ] Set output scope limits: Cap query result sizes, file sizes, and response lengths.

## Key Insight

Excessive agency is a design problem, not a runtime vulnerability. It amplifies the impact of every other vulnerability class. If the LLM can only read data, a prompt injection can only cause data leakage. If the LLM can also write, delete, and send, the same prompt injection can cause data destruction, exfiltration, and impersonation. Reducing agency is the single most effective risk reduction strategy.
