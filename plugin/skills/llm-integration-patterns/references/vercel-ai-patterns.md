# Vercel AI SDK Integration Patterns

## Framework Identification

### Package Indicators
- `package.json`: `"ai"`, `"@ai-sdk/openai"`, `"@ai-sdk/anthropic"`, `"@ai-sdk/google"`, `"@ai-sdk/mistral"`
- Often paired with Next.js (`next`), SvelteKit, or Nuxt
- Environment variables: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`

### Import Patterns
```typescript
// Core SDK
import { generateText, streamText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

// React hooks (client-side)
import { useChat, useCompletion, useObject } from "ai/react";

// RSC (React Server Components)
import { createStreamableValue } from "ai/rsc";
```

## System Prompt Locations

The Vercel AI SDK uses a `system` parameter:

```typescript
// Server-side: generateText / streamText
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant...",
    messages: conversationMessages,
});
```

```typescript
// API route pattern (Next.js App Router)
// app/api/chat/route.ts
import { streamText } from "ai";

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: openai("gpt-4o"),
        system: "You are a customer support agent...",
        messages,
    });

    return result.toDataStreamResponse();
}
```

```typescript
// Client-side: useChat hook
import { useChat } from "ai/react";

const { messages, input, handleSubmit } = useChat({
    api: "/api/chat",
    body: { customParam: "value" },
});
```

**Where to look for system prompts:**
- `system` parameter in `generateText()`, `streamText()`, `generateObject()` calls
- API route files: `app/api/chat/route.ts`, `pages/api/chat.ts`
- Server action files containing AI SDK calls
- Separate prompt files imported into route handlers
- Middleware that injects system prompts

## Tool/Function Registration

```typescript
import { streamText, tool } from "ai";
import { z } from "zod";

const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant with tools.",
    messages,
    tools: {
        getWeather: tool({
            description: "Get current weather for a location",
            parameters: z.object({
                location: z.string().describe("City and state"),
            }),
            execute: async ({ location }) => {
                // THIS FUNCTION RUNS SERVER-SIDE
                const weather = await fetchWeather(location);
                return weather;
            },
        }),
        searchDatabase: tool({
            description: "Search the internal database",
            parameters: z.object({
                query: z.string(),
                limit: z.number().optional().default(10),
            }),
            execute: async ({ query, limit }) => {
                return await db.search(query, limit);
            },
        }),
    },
    maxSteps: 5, // Limit tool-calling iterations
});
```

## Common Guardrail Patterns

- **Zod schema validation**: Tool parameters are validated via Zod schemas before execution
- **maxSteps**: Limits the number of tool-calling round trips (prevents infinite loops)
- **maxTokens**: Output token limit on generation calls
- **temperature**: Controls output randomness
- **Middleware**: Custom middleware for input/output filtering
- **generateObject with schema**: Forces structured output conforming to a Zod schema
- **Rate limiting**: Applied at the API route level via Next.js middleware

```typescript
// Structured output (constrained generation)
import { generateObject } from "ai";
import { z } from "zod";

const result = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({
        sentiment: z.enum(["positive", "negative", "neutral"]),
        confidence: z.number().min(0).max(1),
    }),
    prompt: userInput,
});
```

## Typical File Locations

```
app/api/chat/route.ts       # Chat API endpoint (App Router)
app/api/completion/route.ts  # Completion endpoint
pages/api/chat.ts            # Chat API (Pages Router)
src/lib/ai.ts                # AI client configuration
src/tools/                   # Tool definitions
src/prompts/                 # System prompt definitions
app/actions.ts               # Server actions with AI calls
middleware.ts                # Rate limiting, auth middleware
components/Chat.tsx          # Client-side chat UI (useChat)
```

## Security-Critical Patterns to Audit

1. **Client-to-server message injection**: The `useChat` hook sends the full message history from the client. An attacker can modify client-side JavaScript to inject or alter messages, including adding fake assistant messages. Always validate and sanitize the `messages` array server-side.
2. **Tool execution runs server-side**: Tool `execute` functions run on the server with full server-side permissions. A prompt injection that triggers tool calls can execute server-side code with those permissions. Validate all tool inputs despite Zod schemas (Zod validates types, not security semantics).
3. **API route authentication**: Check that `/api/chat` routes require authentication. Unauthenticated AI endpoints are a common finding in Next.js applications.
4. **maxSteps configuration**: Verify `maxSteps` is set on all `streamText` and `generateText` calls that have tools. Without it, the model can loop indefinitely.
5. **Body parameter injection**: The `body` parameter in `useChat` sends additional data to the server. Check that the API route validates and sanitizes these custom parameters.
6. **Streaming response manipulation**: When using `toDataStreamResponse()`, verify that the client-side parsing handles malformed stream chunks gracefully.
7. **Server actions exposure**: AI-related server actions may be callable directly from the client. Verify they have proper authentication and rate limiting.
