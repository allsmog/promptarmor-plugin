# LlamaIndex Integration Patterns

## Framework Identification

### Package Indicators
- `package.json`: `"llamaindex"` dependency
- `requirements.txt` / `pyproject.toml`: `llama-index`, `llama-index-core`, `llama-index-llms-openai`, `llama-index-llms-anthropic`
- Look for both the monolithic `llama-index` and modular `llama-index-*` packages

### Import Patterns
```python
# Python (primary language for LlamaIndex)
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import FunctionTool, QueryEngineTool
from llama_index.llms.openai import OpenAI
from llama_index.llms.anthropic import Anthropic
```

```typescript
// TypeScript
import { VectorStoreIndex, SimpleDirectoryReader } from "llamaindex";
```

## System Prompt Locations

LlamaIndex uses system prompts in multiple locations depending on the abstraction:

```python
# Query engine with custom system prompt
from llama_index.core import PromptTemplate

qa_prompt = PromptTemplate(
    "You are a security expert. Context: {context_str}\n"
    "Question: {query_str}\n"
    "Answer: "
)
query_engine = index.as_query_engine(text_qa_template=qa_prompt)
```

```python
# Agent with system prompt
from llama_index.core.agent import ReActAgent

agent = ReActAgent.from_tools(
    tools,
    llm=llm,
    system_prompt="You are a helpful security assistant...",
    verbose=True
)
```

```python
# Chat engine with system prompt
chat_engine = index.as_chat_engine(
    system_prompt="You are a document analyst...",
    chat_mode="context"
)
```

**Where to look for system prompts:**
- `system_prompt` parameter in agent and chat engine constructors
- `PromptTemplate` definitions used in query engines
- `Settings.llm` global configuration with custom prompts
- Custom `PromptMixin` subclasses that override default prompts
- `prompts/` directory or inline prompt strings

## Tool/Function Registration

```python
# FunctionTool (wraps any Python function)
from llama_index.core.tools import FunctionTool

def search_database(query: str) -> str:
    """Search the internal database."""
    return db.search(query)

search_tool = FunctionTool.from_defaults(fn=search_database)

# QueryEngineTool (wraps a query engine as a tool)
from llama_index.core.tools import QueryEngineTool

query_tool = QueryEngineTool.from_defaults(
    query_engine=index.as_query_engine(),
    name="document_search",
    description="Search through internal documents"
)

# Agent with tools
agent = ReActAgent.from_tools(
    [search_tool, query_tool],
    llm=llm,
    max_iterations=10
)
```

## Common Guardrail Patterns

- **Max iterations**: `ReActAgent(max_iterations=10)` to prevent agent loops
- **Response synthesizers**: Control how retrieved content is combined and presented
- **Node postprocessors**: Filter and rerank retrieved nodes before they enter the prompt
- **Metadata filters**: Restrict retrieval based on document metadata (used for access control)
- **Callbacks**: `CallbackManager` for monitoring retrieval and generation steps
- **Streaming with token counting**: Built-in token usage tracking

## Typical File Locations

```
src/index/                 # Index creation and management
src/agents/                # Agent configurations
src/tools/                 # Tool definitions
src/prompts/               # Custom prompt templates
src/retrievers/            # Custom retriever implementations
data/                      # Source documents for indexing
storage/                   # Persisted index storage
app/llama_index/           # LlamaIndex service layer
```

## Security-Critical Patterns to Audit

1. **RAG injection through documents**: `SimpleDirectoryReader` and other loaders ingest documents that become retrievable context. Malicious content in source documents can inject instructions into the LLM prompt via RAG retrieval.
2. **Index persistence security**: Check `StorageContext` and persisted index locations. Vector stores may contain sensitive document embeddings accessible without authentication.
3. **Metadata filter bypass**: If metadata filters are used for access control (e.g., `user_id` filters), verify they cannot be bypassed through prompt manipulation or API parameter tampering.
4. **Tool execution scope**: Audit `FunctionTool` implementations for input validation. The function receives LLM-generated arguments directly.
5. **Query engine prompt injection**: In `RetrieverQueryEngine`, retrieved document content is inserted into the prompt template. Check whether the `context_str` variable is treated as untrusted data.
6. **Agent loop control**: Verify that `max_iterations` is set on all agents. Unrestricted agents can enter infinite tool-calling loops.
7. **Document loader vulnerabilities**: Some document loaders (PDF, HTML, DOCX) parse complex file formats that may have parsing vulnerabilities. Ensure loaders are up to date.
8. **Global settings exposure**: `Settings.llm` and `Settings.embed_model` are global. Check that API keys configured via global settings are not exposed through error messages or logs.
