# Output Filtering for LLM Applications

## Technique Overview

Output filtering inspects LLM-generated responses before they reach the user or downstream systems, detecting and removing sensitive data, injection payloads, and policy-violating content. This is a critical post-generation defense layer that catches threats the model failed to block, including data exfiltration attempts, PII leakage, system prompt disclosure, and embedded code injection.

## When to Use

- Every production LLM application should implement output filtering.
- Mandatory for applications handling PII, PHI, credentials, or other regulated data.
- Critical when LLM output is rendered as HTML, used in database queries, or passed to code execution environments.
- Essential when the LLM has access to tools that return sensitive data.

## Filtering Categories

### 1. PII/Sensitive Data Redaction
Detect and redact personal information that should not appear in responses.

### 2. System Prompt Leakage Detection
Detect when the model is revealing its system instructions.

### 3. Injection Payload Detection
Detect embedded code, scripts, or injection payloads in output.

### 4. Data Exfiltration Prevention
Detect attempts to exfiltrate data via URLs, markdown images, or encoded content.

### 5. Policy Compliance
Enforce content policies (topic restrictions, tone requirements, format constraints).

## Implementation Patterns

### Node.js / TypeScript

```typescript
// PII detection and redaction
const PII_PATTERNS: Record<string, RegExp> = {
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    ip_address: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
};

function redactPII(output: string): { redacted: string; findings: string[] } {
    const findings: string[] = [];
    let redacted = output;

    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
        const matches = redacted.match(pattern);
        if (matches) {
            findings.push(`${type}: ${matches.length} instance(s)`);
            redacted = redacted.replace(pattern, `[REDACTED-${type.toUpperCase()}]`);
        }
    }
    return { redacted, findings };
}

// Data exfiltration detection
function detectExfiltration(output: string): { blocked: boolean; reason?: string } {
    // Markdown image with dynamic URL (data exfil via image tags)
    const mdImagePattern = /!\[.*?\]\(https?:\/\/[^\s)]*\?[^\s)]*\)/gi;
    if (mdImagePattern.test(output)) {
        return { blocked: true, reason: "Markdown image with query parameters detected" };
    }

    // Hidden URLs with encoded data
    const encodedUrlPattern = /https?:\/\/[^\s]*(?:base64|encode|data=)[^\s]*/gi;
    if (encodedUrlPattern.test(output)) {
        return { blocked: true, reason: "URL with encoded data detected" };
    }

    return { blocked: false };
}

// System prompt leakage detection
function detectPromptLeakage(
    output: string,
    canaryTokens: string[]
): { leaked: boolean; token?: string } {
    for (const token of canaryTokens) {
        if (output.includes(token)) {
            return { leaked: true, token };
        }
    }
    return { leaked: false };
}
```

### Python

```python
import re
from dataclasses import dataclass, field

@dataclass
class FilterResult:
    output: str
    blocked: bool = False
    redacted: bool = False
    findings: list[str] = field(default_factory=list)

# PII redaction
PII_PATTERNS = {
    "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
    "credit_card": r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",
    "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
    "phone": r"\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b",
}

def redact_pii(text: str) -> FilterResult:
    result = FilterResult(output=text)
    for pii_type, pattern in PII_PATTERNS.items():
        matches = re.findall(pattern, text)
        if matches:
            result.findings.append(f"{pii_type}: {len(matches)} instance(s)")
            result.output = re.sub(pattern, f"[REDACTED-{pii_type.upper()}]", result.output)
            result.redacted = True
    return result

# Exfiltration detection
def detect_exfiltration(text: str) -> FilterResult:
    result = FilterResult(output=text)

    # Markdown images with query params
    if re.search(r'!\[.*?\]\(https?://[^\s)]*\?[^\s)]*\)', text):
        result.blocked = True
        result.findings.append("Markdown image with query parameters")

    # HTML image tags
    if re.search(r'<img[^>]+src\s*=\s*["\']https?://', text, re.I):
        result.blocked = True
        result.findings.append("HTML image tag with external URL")

    return result

# Combined output filter pipeline
def filter_output(text: str, canary_tokens: list[str]) -> FilterResult:
    # Check canary tokens first (fast, definitive)
    for token in canary_tokens:
        if token in text:
            return FilterResult(
                output="I'm unable to help with that request.",
                blocked=True,
                findings=[f"Canary token detected: system prompt leakage"]
            )

    # Check exfiltration
    exfil_result = detect_exfiltration(text)
    if exfil_result.blocked:
        return FilterResult(
            output="I'm unable to help with that request.",
            blocked=True,
            findings=exfil_result.findings
        )

    # Redact PII
    pii_result = redact_pii(text)
    return pii_result
```

### Go

```go
import (
    "regexp"
    "strings"
)

type FilterResult struct {
    Output   string
    Blocked  bool
    Findings []string
}

var piiPatterns = map[string]*regexp.Regexp{
    "SSN":         regexp.MustCompile(`\b\d{3}-\d{2}-\d{4}\b`),
    "CREDIT_CARD": regexp.MustCompile(`\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b`),
    "EMAIL":       regexp.MustCompile(`\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b`),
}

func RedactPII(text string) FilterResult {
    result := FilterResult{Output: text}
    for piiType, pattern := range piiPatterns {
        matches := pattern.FindAllString(text, -1)
        if len(matches) > 0 {
            result.Findings = append(result.Findings,
                fmt.Sprintf("%s: %d instance(s)", piiType, len(matches)))
            result.Output = pattern.ReplaceAllString(result.Output,
                "[REDACTED-"+piiType+"]")
        }
    }
    return result
}
```

## Filtering Strategies for Streaming Responses

When using streaming, output filtering must handle partial content:

```typescript
// Buffer-based streaming filter
class StreamingFilter {
    private buffer = "";
    private readonly bufferSize = 200; // Characters to buffer for pattern matching

    processChunk(chunk: string): string | null {
        this.buffer += chunk;
        if (this.buffer.length < this.bufferSize) {
            return null; // Buffer more before releasing
        }
        const release = this.buffer.slice(0, -this.bufferSize);
        this.buffer = this.buffer.slice(-this.bufferSize);
        return this.applyFilters(release);
    }

    flush(): string {
        return this.applyFilters(this.buffer);
    }

    private applyFilters(text: string): string {
        // Apply PII redaction, exfil detection, etc.
        const { redacted } = redactPII(text);
        return redacted;
    }
}
```

## Limitations

Output filtering is pattern-based and can miss novel attack formats, multilingual content, or creatively obfuscated payloads. It is a necessary but insufficient defense layer. Always combine with system prompt hardening, input validation, and tool sandboxing.
