# Tool Sandboxing for LLM Applications

## Technique Overview

Tool sandboxing is the practice of isolating LLM tool/function execution environments to limit the blast radius when tools are invoked with malicious, hallucinated, or erroneous parameters. Since tools are where LLM decisions translate into real-world actions, sandboxing is the last line of defense against prompt injection achieving material impact.

## When to Use

- Every LLM application with tool-calling capabilities should implement sandboxing.
- Critical for tools that interact with databases, file systems, external APIs, email systems, or code execution environments.
- Essential when the LLM has autonomous agency (multi-step tool chains without human oversight).

## Sandboxing Dimensions

1. **Input sandboxing**: Constrain what parameters tools accept.
2. **Permission sandboxing**: Limit what actions tools can perform.
3. **Resource sandboxing**: Limit compute, memory, network, and time resources.
4. **Output sandboxing**: Filter what data tools return to the LLM context.
5. **Execution sandboxing**: Run tools in isolated processes/containers.

## Implementation Patterns

### Node.js / TypeScript

```typescript
// Input sandboxing: Schema validation + semantic validation
import { z } from "zod";

const fileReadSchema = z.object({
    path: z.string()
        .max(255)
        .refine(
            (p) => !p.includes("..") && !p.startsWith("/"),
            "Path traversal not allowed"
        )
        .refine(
            (p) => p.startsWith("documents/"),
            "Access restricted to documents/ directory"
        ),
});

// Permission sandboxing: Read-only database wrapper
class SandboxedDatabase {
    private pool: Pool;

    constructor(connectionString: string) {
        // Use a read-only database user
        this.pool = new Pool({
            connectionString,
            // Connection-level read-only enforcement
            options: "-c default_transaction_read_only=on",
        });
    }

    async query(sql: string, params: unknown[]): Promise<QueryResult> {
        // Allowlist of permitted query patterns
        const allowed = /^SELECT\s/i;
        if (!allowed.test(sql.trim())) {
            throw new Error("Only SELECT queries are permitted");
        }

        // Row limit enforcement
        const limitedSql = sql.includes("LIMIT")
            ? sql
            : `${sql} LIMIT 100`;

        return this.pool.query(limitedSql, params);
    }
}

// Resource sandboxing: Timeout and size limits
async function sandboxedToolExecution<T>(
    fn: () => Promise<T>,
    options: { timeoutMs: number; maxOutputSize: number }
): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(
        () => controller.abort(),
        options.timeoutMs
    );

    try {
        const result = await fn();
        const serialized = JSON.stringify(result);
        if (serialized.length > options.maxOutputSize) {
            throw new Error(`Tool output exceeds ${options.maxOutputSize} bytes`);
        }
        return result;
    } finally {
        clearTimeout(timeout);
    }
}
```

### Python

```python
import os
import signal
from pathlib import Path
from functools import wraps

# Input sandboxing: Path validation
ALLOWED_BASE_DIR = Path("/app/data/documents")

def validate_file_path(path_str: str) -> Path:
    """Validate and resolve file path within allowed directory."""
    requested = Path(path_str)

    # Block absolute paths and traversal
    if requested.is_absolute():
        raise ValueError("Absolute paths not allowed")
    if ".." in requested.parts:
        raise ValueError("Path traversal not allowed")

    resolved = (ALLOWED_BASE_DIR / requested).resolve()

    # Verify resolved path is within allowed directory
    if not str(resolved).startswith(str(ALLOWED_BASE_DIR.resolve())):
        raise ValueError("Path escapes allowed directory")

    return resolved

# Permission sandboxing: Read-only database
import sqlalchemy

def create_readonly_engine(database_url: str):
    """Create a database engine restricted to read-only operations."""
    engine = sqlalchemy.create_engine(database_url)

    @sqlalchemy.event.listens_for(engine, "begin")
    def set_readonly(conn):
        conn.execute(sqlalchemy.text("SET TRANSACTION READ ONLY"))

    return engine

# Resource sandboxing: Execution timeout
def with_timeout(seconds: int):
    """Decorator that enforces a timeout on tool execution."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            def handler(signum, frame):
                raise TimeoutError(f"Tool execution exceeded {seconds}s")
            old_handler = signal.signal(signal.SIGALRM, handler)
            signal.alarm(seconds)
            try:
                return func(*args, **kwargs)
            finally:
                signal.alarm(0)
                signal.signal(signal.SIGALRM, old_handler)
        return wrapper
    return decorator

# Output sandboxing: Filter sensitive fields before returning to LLM
def sanitize_tool_output(output: dict, redact_fields: list[str]) -> dict:
    """Remove sensitive fields from tool output before returning to LLM."""
    sanitized = {}
    for key, value in output.items():
        if key in redact_fields:
            sanitized[key] = "[REDACTED]"
        elif isinstance(value, dict):
            sanitized[key] = sanitize_tool_output(value, redact_fields)
        else:
            sanitized[key] = value
    return sanitized

SENSITIVE_FIELDS = ["ssn", "password", "api_key", "secret", "token",
                     "credit_card", "bank_account"]

@with_timeout(10)
def sandboxed_user_lookup(email: str) -> dict:
    result = db.get_user_by_email(email)
    return sanitize_tool_output(result, SENSITIVE_FIELDS)
```

### Go

```go
import (
    "context"
    "fmt"
    "path/filepath"
    "strings"
    "time"
)

// Input sandboxing: Path validation
func ValidateFilePath(basedir, requested string) (string, error) {
    if filepath.IsAbs(requested) {
        return "", fmt.Errorf("absolute paths not allowed")
    }
    if strings.Contains(requested, "..") {
        return "", fmt.Errorf("path traversal not allowed")
    }

    resolved := filepath.Clean(filepath.Join(basedir, requested))
    if !strings.HasPrefix(resolved, filepath.Clean(basedir)) {
        return "", fmt.Errorf("path escapes allowed directory")
    }
    return resolved, nil
}

// Resource sandboxing: Context with timeout
func ExecuteToolWithTimeout(
    timeout time.Duration,
    fn func(ctx context.Context) (interface{}, error),
) (interface{}, error) {
    ctx, cancel := context.WithTimeout(context.Background(), timeout)
    defer cancel()

    resultCh := make(chan interface{}, 1)
    errCh := make(chan error, 1)

    go func() {
        result, err := fn(ctx)
        if err != nil {
            errCh <- err
            return
        }
        resultCh <- result
    }()

    select {
    case result := <-resultCh:
        return result, nil
    case err := <-errCh:
        return nil, err
    case <-ctx.Done():
        return nil, fmt.Errorf("tool execution timed out after %s", timeout)
    }
}
```

## Human-in-the-Loop Patterns

For high-impact operations, require explicit human approval:

```typescript
// Tool that requires confirmation for write operations
async function executeWithConfirmation(
    action: string,
    params: Record<string, unknown>,
    confirmFn: (description: string) => Promise<boolean>
): Promise<unknown> {
    const description = `Action: ${action}\nParameters: ${JSON.stringify(params, null, 2)}`;
    const confirmed = await confirmFn(description);
    if (!confirmed) {
        return { status: "cancelled", reason: "User declined the action" };
    }
    return executeAction(action, params);
}
```

## Monitoring and Alerting

- Log every tool invocation with: tool name, parameters, calling user, result status, execution time.
- Alert on: tool execution failures, timeout hits, permission denials, unusual invocation patterns.
- Track tool invocation rates per user/session for anomaly detection.
- Maintain an audit trail of all state-changing tool executions.

## Key Principle

Sandboxing is not about trusting the LLM to make good decisions. It is about ensuring that even when the LLM makes bad decisions (due to prompt injection, hallucination, or error), the real-world impact is bounded. Design every tool as if the LLM will eventually be tricked into misusing it.
