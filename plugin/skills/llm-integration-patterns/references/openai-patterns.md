# OpenAI Integration Patterns

## Framework Identification

### Package Indicators
- `package.json`: `"openai"` dependency
- `requirements.txt` / `pyproject.toml`: `openai` package
- `go.mod`: `github.com/sashabaranov/go-openai`
- Environment variables: `OPENAI_API_KEY`, `OPENAI_ORG_ID`, `OPENAI_BASE_URL`

### Import Patterns
```python
# Python
from openai import OpenAI, AsyncOpenAI
import openai
```

```typescript
// Node.js / TypeScript
import OpenAI from "openai";
const { OpenAI } = require("openai");
```

```go
// Go
import openai "github.com/sashabaranov/go-openai"
```

## System Prompt Locations

System prompts are defined in the `messages` array with `role: "system"`:

```python
# Direct API call
client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant..."},
        {"role": "user", "content": user_input}
    ]
)
```

```typescript
// Node.js
const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
    ]
});
```

**Where to look for system prompts:**
- String constants or template literals in API call files
- Separate prompt files: `prompts/`, `templates/`, `system-prompt.txt`
- Environment variables or config files: `.env`, `config.yaml`
- Database-driven prompts: Check for prompts loaded from DB at runtime

## Tool/Function Registration

Tools are registered via the `tools` parameter:

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)
```

**Tool execution pattern** (the security-critical part):
```python
# The LLM returns tool_calls in the response
for tool_call in response.choices[0].message.tool_calls:
    function_name = tool_call.function.name
    arguments = json.loads(tool_call.function.arguments)
    # THIS IS WHERE INPUT VALIDATION MUST HAPPEN
    result = available_functions[function_name](**arguments)
```

## Common Guardrail Patterns

- **Moderation API**: Pre-screening inputs/outputs via `client.moderations.create()`
- **Structured outputs**: Using `response_format={"type": "json_schema", ...}` to constrain output
- **Max tokens**: `max_tokens` parameter to limit output length
- **Temperature**: Low temperature (0-0.3) for deterministic, security-sensitive outputs
- **Stop sequences**: `stop` parameter to prevent generation beyond intended boundaries

## Typical File Locations

```
src/lib/openai.ts          # Client initialization
src/api/chat.ts            # Chat completion endpoints
src/services/ai.ts         # AI service abstraction layer
src/prompts/system.ts      # System prompt definitions
src/tools/                 # Tool/function definitions
src/middleware/moderation.ts # Content moderation middleware
lib/openai_client.py       # Python client setup
app/services/llm.py        # LLM service layer
app/prompts/               # Prompt templates
```

## Security-Critical Patterns to Audit

1. **User input concatenation**: Search for string interpolation or concatenation that mixes user input into system prompts.
2. **Tool dispatch without validation**: Look for tool execution that passes LLM-generated arguments directly to functions without schema validation.
3. **Missing moderation**: Check if the Moderation API is called on user inputs before they reach the chat completion.
4. **API key exposure**: Check for hardcoded API keys or keys in client-side code.
5. **Streaming without filtering**: When using streaming responses, check if output filtering is applied to the full response or only individual chunks.
