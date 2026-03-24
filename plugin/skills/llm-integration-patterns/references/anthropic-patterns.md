# Anthropic Integration Patterns

## Framework Identification

### Package Indicators
- `package.json`: `"@anthropic-ai/sdk"` dependency
- `requirements.txt` / `pyproject.toml`: `anthropic` package
- Environment variables: `ANTHROPIC_API_KEY`

### Import Patterns
```python
# Python
from anthropic import Anthropic, AsyncAnthropic
import anthropic
```

```typescript
// Node.js / TypeScript
import Anthropic from "@anthropic-ai/sdk";
```

## System Prompt Locations

Anthropic uses a dedicated `system` parameter separate from the messages array:

```python
client = Anthropic()

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a helpful assistant...",  # System prompt is a top-level param
    messages=[
        {"role": "user", "content": user_input}
    ]
)
```

```typescript
const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: "You are a helpful assistant...",
    messages: [
        { role: "user", content: userMessage }
    ]
});
```

**Multi-block system prompts** (advanced pattern):
```python
system=[
    {"type": "text", "text": "Core instructions..."},
    {"type": "text", "text": "Additional context...", "cache_control": {"type": "ephemeral"}}
]
```

**Where to look for system prompts:**
- The `system` parameter in `messages.create()` calls
- Separate prompt files loaded and passed to the `system` param
- Multi-block system arrays for complex prompt architectures
- Prompt caching configurations (`cache_control` blocks)

## Tool/Function Registration

Tools are registered via the `tools` parameter:

```python
tools = [
    {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and state"
                }
            },
            "required": ["location"]
        }
    }
]

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=messages
)
```

**Tool execution pattern**:
```python
# Anthropic returns tool_use content blocks
for block in response.content:
    if block.type == "tool_use":
        tool_name = block.name
        tool_input = block.input  # Already parsed dict
        # VALIDATE tool_input HERE before execution
        result = execute_tool(tool_name, tool_input)
        # Return result as tool_result message
        messages.append({"role": "assistant", "content": response.content})
        messages.append({
            "role": "user",
            "content": [{"type": "tool_result", "tool_use_id": block.id, "content": str(result)}]
        })
```

## Common Guardrail Patterns

- **Max tokens**: `max_tokens` is required (not optional like OpenAI), providing built-in output length control
- **Stop sequences**: `stop_sequences` parameter to halt generation at specific strings
- **Temperature**: `temperature` parameter (0-1) for controlling output randomness
- **System prompt hierarchy**: Using multi-block system prompts with clear instruction layers
- **Tool choice control**: `tool_choice={"type": "auto"|"any"|"tool", "name": "..."}` to restrict which tools the model can call

## Typical File Locations

```
src/lib/anthropic.ts       # Client initialization
src/api/chat.ts            # Message creation endpoints
src/services/claude.ts     # Claude service abstraction
src/prompts/system.ts      # System prompt definitions
src/tools/                 # Tool definitions and handlers
lib/anthropic_client.py    # Python client setup
app/services/claude.py     # Claude service layer
app/prompts/               # Prompt templates
app/tools/                 # Tool implementations
```

## Security-Critical Patterns to Audit

1. **System prompt injection via user content**: Check whether user input is ever interpolated into the `system` parameter.
2. **Tool result injection**: Verify that tool results returned to the model are sanitized. The `tool_result` content re-enters the conversation and can contain injection payloads.
3. **Multi-turn context manipulation**: In multi-turn conversations, check whether previous assistant messages are validated before being sent back (an attacker could modify cached conversation history).
4. **Prompt caching security**: When using prompt caching (`cache_control`), verify that cached prompts are not shared across security boundaries.
5. **Tool input validation**: Check that `block.input` from tool_use responses is validated against the declared `input_schema` before execution.
6. **Extended thinking exposure**: If using extended thinking features, verify that internal reasoning content is not exposed to end users (it may contain sensitive intermediate results).
