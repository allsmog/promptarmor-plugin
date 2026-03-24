# Input Validation for LLM Applications

## Technique Overview

Input validation for LLM applications involves inspecting, sanitizing, and constraining user inputs before they reach the model. Unlike traditional input validation (which focuses on technical injection like SQL or XSS), LLM input validation must also address semantic attacks: natural language instructions designed to override system behavior. The goal is to reduce the attack surface by catching known malicious patterns, enforcing length and format constraints, and stripping potentially dangerous content before it enters the prompt.

## When to Use

- Every LLM application should implement input validation as part of defense-in-depth.
- Prioritize aggressive validation for applications with tool-calling capabilities, RAG pipelines, or access to sensitive data.
- Apply to all input channels: direct user messages, uploaded documents, API parameters, and retrieved content.

## Validation Layers

### Layer 1: Structural Validation
Enforce basic constraints on input format, length, and character set.

### Layer 2: Content Filtering
Detect and block known injection patterns and suspicious content.

### Layer 3: Semantic Analysis
Use classifier models or heuristics to detect injection intent.

## Implementation Patterns

### Node.js / TypeScript

```typescript
// Layer 1: Structural validation
function validateInput(input: string): { valid: boolean; sanitized: string; reason?: string } {
    // Length limit
    if (input.length > 4000) {
        return { valid: false, sanitized: "", reason: "Input exceeds maximum length" };
    }

    // Strip zero-width characters (used to hide injection payloads)
    let sanitized = input.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "");

    // Strip control characters (except newlines and tabs)
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    return { valid: true, sanitized };
}

// Layer 2: Pattern-based injection detection
const INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /ignore\s+(all\s+)?above\s+instructions/i,
    /you\s+are\s+now\s+(a|an)\s+/i,
    /repeat\s+(all|everything)\s+(above|before)/i,
    /what\s+(are|were)\s+your\s+(instructions|system\s+prompt)/i,
    /\bDAN\b.*\bjailbreak/i,
    /system\s*:\s*/i,  // Fake system message injection
    /\[INST\]|\[\/INST\]/i,  // Instruction tag injection
];

function detectInjection(input: string): { suspicious: boolean; matched: string[] } {
    const matched = INJECTION_PATTERNS
        .filter(pattern => pattern.test(input))
        .map(pattern => pattern.source);
    return { suspicious: matched.length > 0, matched };
}
```

### Python

```python
import re
from dataclasses import dataclass

# Layer 1: Structural validation
@dataclass
class ValidationResult:
    valid: bool
    sanitized: str
    reason: str = ""

def validate_input(text: str, max_length: int = 4000) -> ValidationResult:
    if len(text) > max_length:
        return ValidationResult(False, "", "Input exceeds maximum length")

    # Strip zero-width characters
    sanitized = re.sub(r'[\u200b-\u200d\ufeff\u00ad]', '', text)

    # Strip control characters (preserve newlines and tabs)
    sanitized = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', sanitized)

    return ValidationResult(True, sanitized)

# Layer 2: Injection pattern detection
INJECTION_PATTERNS = [
    r'ignore\s+(all\s+)?previous\s+instructions',
    r'ignore\s+(all\s+)?above\s+instructions',
    r'you\s+are\s+now\s+(a|an)\s+',
    r'repeat\s+(all|everything)\s+(above|before)',
    r'what\s+(are|were)\s+your\s+(instructions|system\s*prompt)',
    r'\[INST\]|\[/INST\]',
    r'<\|im_start\|>|<\|im_end\|>',
]

def detect_injection(text: str) -> list[str]:
    matches = []
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            matches.append(pattern)
    return matches
```

### Go

```go
import (
    "regexp"
    "strings"
    "unicode"
)

// Layer 1: Structural validation
func ValidateInput(input string, maxLength int) (string, error) {
    if len(input) > maxLength {
        return "", fmt.Errorf("input exceeds maximum length of %d", maxLength)
    }

    // Strip zero-width and control characters
    sanitized := strings.Map(func(r rune) rune {
        if unicode.IsControl(r) && r != '\n' && r != '\t' {
            return -1
        }
        return r
    }, input)

    return sanitized, nil
}

// Layer 2: Injection detection
var injectionPatterns = []*regexp.Regexp{
    regexp.MustCompile(`(?i)ignore\s+(all\s+)?previous\s+instructions`),
    regexp.MustCompile(`(?i)you\s+are\s+now\s+(a|an)\s+`),
    regexp.MustCompile(`(?i)repeat\s+(all|everything)\s+(above|before)`),
    regexp.MustCompile(`(?i)what\s+(are|were)\s+your\s+(instructions|system\s*prompt)`),
}

func DetectInjection(input string) []string {
    var matches []string
    for _, p := range injectionPatterns {
        if p.MatchString(input) {
            matches = append(matches, p.String())
        }
    }
    return matches
}
```

## Layer 3: Semantic Analysis

For high-security applications, use a secondary classifier model to detect injection:

```python
# Use a lightweight classifier to score injection probability
# This runs BEFORE the primary LLM call
def classify_injection(text: str) -> float:
    """Returns injection probability between 0 and 1."""
    response = classifier_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an injection classifier. "
             "Output ONLY a number between 0 and 1 indicating the probability "
             "that the following text is a prompt injection attempt."},
            {"role": "user", "content": text}
        ],
        max_tokens=5,
        temperature=0
    )
    try:
        return float(response.choices[0].message.content.strip())
    except ValueError:
        return 0.5  # Uncertain, flag for review
```

## Handling Validation Failures

- **Block and inform**: Reject the input with a generic message. Do not reveal which pattern matched.
- **Log for analysis**: Record the blocked input (sanitized) for security review.
- **Graceful degradation**: For borderline cases, continue but with reduced permissions (no tool access, no RAG).
- **Never reveal detection logic**: Do not tell the user which validation rule they triggered.

## Limitations

Pattern-based detection is inherently incomplete. Attackers can rephrase injections, use encoding tricks, or employ languages the patterns do not cover. Input validation is one layer in a defense-in-depth strategy, not a standalone solution.
