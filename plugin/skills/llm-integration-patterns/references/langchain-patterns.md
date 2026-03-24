# LangChain Integration Patterns

## Framework Identification

### Package Indicators
- `package.json`: `"langchain"`, `"@langchain/core"`, `"@langchain/openai"`, `"@langchain/anthropic"`, `"@langchain/community"`
- `requirements.txt` / `pyproject.toml`: `langchain`, `langchain-core`, `langchain-openai`, `langchain-anthropic`, `langchain-community`
- Look for both the monolithic `langchain` package and the modular `langchain-*` packages

### Import Patterns
```python
# Python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.tools import tool
from langchain.chains import RetrievalQA
```

```typescript
// TypeScript
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
```

## System Prompt Locations

LangChain uses prompt templates with placeholder variables:

```python
# ChatPromptTemplate pattern
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Context: {context}"),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])
```

```python
# Direct system message
from langchain_core.messages import SystemMessage, HumanMessage
messages = [
    SystemMessage(content="You are a security expert."),
    HumanMessage(content=user_input)
]
```

**Where to look for system prompts:**
- `ChatPromptTemplate.from_messages()` calls
- `SystemMessage()` or `SystemMessagePromptTemplate` instances
- Prompt hub pulls: `hub.pull("hwchase17/openai-tools-agent")`
- YAML/JSON prompt files loaded via `load_prompt()`
- `PromptTemplate` and `FewShotPromptTemplate` definitions

## Tool/Function Registration

```python
# Decorator-based tools
from langchain_core.tools import tool

@tool
def search_database(query: str) -> str:
    """Search the internal database for information."""
    return db.search(query)

# StructuredTool for complex inputs
from langchain_core.tools import StructuredTool
from pydantic import BaseModel

class SearchInput(BaseModel):
    query: str
    max_results: int = 10

search_tool = StructuredTool.from_function(
    func=search_database,
    name="search",
    description="Search the database",
    args_schema=SearchInput
)

# Agent with tools
agent = create_tool_calling_agent(llm, [search_tool, other_tool], prompt)
executor = AgentExecutor(agent=agent, tools=[search_tool, other_tool])
```

## Common Guardrail Patterns

- **Output parsers**: `StrOutputParser`, `JsonOutputParser`, `PydanticOutputParser` to enforce output structure
- **RunnablePassthrough / RunnableLambda**: Custom validation steps in LCEL chains
- **Callbacks**: `CallbackHandler` for monitoring and intercepting chain execution
- **Max iterations**: `AgentExecutor(max_iterations=10)` to prevent infinite loops
- **Return intermediate steps**: `AgentExecutor(return_intermediate_steps=True)` for audit logging
- **Handle parsing errors**: `AgentExecutor(handle_parsing_errors=True)` for graceful failure

## Typical File Locations

```
src/chains/                # Chain definitions
src/agents/                # Agent configurations
src/tools/                 # Tool definitions
src/prompts/               # Prompt templates
src/retrievers/            # RAG retriever configurations
src/callbacks/             # Custom callback handlers
app/langchain/             # LangChain service layer
app/chains/                # Chain implementations
```

## Security-Critical Patterns to Audit

1. **Prompt template injection**: Check whether user input is interpolated into template variables that are not properly isolated (e.g., `{input}` appearing in the system message section).
2. **RAG injection surface**: In `RetrievalQA` and similar chains, retrieved documents enter the prompt. Check whether retrieved content is tagged as untrusted.
3. **Agent tool permissions**: Audit `AgentExecutor` tool lists for excessive capabilities. Check if `max_iterations` is set.
4. **Callback data exposure**: Custom callbacks may log sensitive data. Verify callback handlers do not leak PII or secrets.
5. **Deprecated patterns**: LangChain's API changes frequently. Watch for deprecated patterns that may have known security issues (e.g., old `LLMChain` vs. new LCEL patterns).
6. **Community tools**: `langchain-community` tools may have less security review. Audit any community-contributed tool integrations.
7. **SQL chain injection**: `SQLDatabaseChain` and `create_sql_agent` patterns can be vulnerable if the LLM generates unconstrained SQL. Check for read-only database connections and query allowlists.
