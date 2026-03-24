# LLM04: Model Denial of Service

## Description

Model Denial of Service (DoS) occurs when an attacker crafts inputs that consume excessive computational resources, degrade model performance, or cause service outages. Because LLM inference is computationally expensive, even modest attack volumes can cause significant cost and availability impacts. This category also includes resource exhaustion attacks that exploit token limits, recursive tool calls, or unbounded generation loops.

Key attack vectors:
- **Token flooding**: Inputs designed to maximize output token generation, driving up compute costs.
- **Context window exhaustion**: Filling the context window with junk data to push out useful context.
- **Recursive tool loops**: Crafting inputs that cause the LLM to enter infinite tool-calling cycles.
- **Compute-intensive prompts**: Inputs requiring complex reasoning that consume disproportionate GPU time.
- **Concurrent request flooding**: Overwhelming the service with parallel requests.

## Real-World Examples

1. **Token amplification attacks**: Sending short prompts that cause the model to generate maximum-length responses (e.g., "Write a 10,000-word essay on every topic you know"), amplifying compute costs by 100x+ relative to input size.
2. **Recursive agent loops**: Crafting inputs for AI agents that cause them to repeatedly call tools in an infinite loop, consuming API credits and compute indefinitely.
3. **Context window stuffing**: Sending requests with maximum-length inputs filled with repetitive content, consuming context window space and degrading response quality for all users in shared deployments.
4. **Sponge examples**: Specially crafted adversarial inputs that maximize energy consumption during inference, causing 10-100x slowdown compared to normal inputs.
5. **Multi-model cascade attacks**: In systems with multiple LLMs, triggering expensive operations across all models simultaneously.

## Detection Methodology

### Static Analysis
- Check for token limits on both input and output.
- Verify rate limiting is configured per user, per session, and per IP.
- Look for unbounded tool-calling loops (no maximum iteration count).
- Check for timeout enforcement on LLM inference calls.
- Verify cost monitoring and alerting thresholds are configured.

### Dynamic Testing
- Send maximum-length inputs and measure response time and cost.
- Craft prompts that maximize output length and measure token amplification ratio.
- Test for recursive tool-calling by sending inputs that create circular dependencies.
- Send concurrent requests to test rate limiting and queuing behavior.
- Measure resource consumption under sustained load.

### Behavioral Signals
- Inference latency increases significantly for specific input patterns.
- Token usage spikes without corresponding increase in legitimate traffic.
- Tool-calling chains exceed expected depth or iteration count.
- Memory or GPU utilization spikes correlate with specific user sessions.
- Cost anomalies in LLM API billing.

## Attack Mapping (PromptArmor Plugins)

| Plugin | Technique |
|--------|-----------|
| `token-amplification` | Short input to maximum output generation |
| `context-flood` | Fill context window with junk to degrade quality |
| `recursive-tool-loop` | Trigger infinite tool-calling cycles |
| `compute-intensive-prompt` | Maximize reasoning complexity |
| `concurrent-flood` | Parallel request flooding |
| `context-window-flood` | Push system prompt out of attention |

## Remediation Checklist

- [ ] Set strict input token limits: Reject requests exceeding reasonable input lengths for the use case.
- [ ] Set output token limits: Configure `max_tokens` on all LLM API calls to prevent unbounded generation.
- [ ] Implement rate limiting: Per-user, per-session, and per-IP rate limits with exponential backoff.
- [ ] Set tool-calling depth limits: Cap the maximum number of tool invocations per request (e.g., 10).
- [ ] Implement request timeouts: Kill inference requests that exceed a time threshold.
- [ ] Deploy cost monitoring: Set billing alerts and automatic throttling when spend exceeds thresholds.
- [ ] Use request queuing with priority: Ensure high-priority requests are not blocked by potential DoS traffic.
- [ ] Implement circuit breakers: Automatically degrade service gracefully when resource thresholds are exceeded.
- [ ] Monitor token amplification ratios: Flag requests where output tokens greatly exceed input tokens.
- [ ] Use caching for common queries to reduce redundant compute.
- [ ] Implement input deduplication to detect and block repeated flooding attempts.
- [ ] Deploy WAF rules to detect and block known DoS input patterns.

## Key Insight

LLM DoS is particularly dangerous because the cost asymmetry heavily favors the attacker: a short, cheap input can trigger expensive, long-running computation. Defense requires multiple layers of resource governance at every stage of the request pipeline, from input validation through inference to output delivery.
