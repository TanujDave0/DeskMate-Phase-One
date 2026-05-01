# DESKMATE Backend

FastAPI service that turns `{text, sassLevel, history}` into a DESKMATE reply. All intelligence lives in the backend: LLM calls, prompt construction, sass-level routing, agent flow, and request summary logging. The frontend calls this as a black box.

See `../BRAIN.md` and `../AGENTS.md` for product context and work rules. See `../SASS_LEVELS.md` for sass anchor definitions. See `RESEARCH.md` for the prior-art survey that informed these choices.

---

## Stack

- **Python 3.11+** - runtime
- **FastAPI** - web framework
- **Uvicorn** - ASGI server
- **Groq** - default cloud LLM backend, official Python client
- **OpenRouter** - cloud LLM backend used when `LLM_BACKEND=openrouter` or `sassLevel=4`
- **Ollama** - local LLM client remains present, but is not currently selected by the resolver
- **Tavily** - web search API used by the agent's `web_search` tool
- **python-dotenv** - env loading

---

## Architecture

```
backend/
  app.py                  # FastAPI app, CORS, POST /api/chat, summary logging
  config.py               # env: LLM_BACKEND, USE_AGENT, MAX_AGENT_ITERATIONS, GROQ_*, OPENROUTER_*, OLLAMA_*, TAVILY_API_KEY, MAX_WEB_SEARCH_RESULTS, LOG_*, PORT, CORS_ORIGINS
  logging_config.py       # setup_logging(): configures console + rotating file handler from config
  logs/
    deskmate.log            # active log file (gitignored); rotates at LOG_MAX_BYTES, keeps LOG_BACKUP_COUNT
  our_types/
    __init__.py
    types.py              # shared types: AgentStep, LLMTarget, GenerateAdapter, GenerateToolAdapter
  chat/
    __init__.py
    simple_handler.py     # single-shot: prompt -> resolved LLM adapter -> text
    sass_profiles.py      # pure fn: sassLevel (int) -> system prompt (str)
  agent/
    __init__.py
    runner.py             # agentic loop: calls tool_adapter, executes all tool calls, iterates up to MAX_AGENT_ITERATIONS; injects final-iteration system message on last pass
  tools/
    __init__.py
    registry.py           # TOOLS dict (schema + callable) + execute() dispatcher with error handling
    web_search.py         # Tavily web search wrapper
  llm/
    __init__.py
    resolver.py           # sassLevel/config -> LLMTarget (backend, model, adapter, adapter_with_tools)
    errors.py             # shared LLMError type
    groq_client.py        # generate() and generate_with_tools() over Groq Python client
    openrouter_client.py  # generate() and generate_with_tools() over OpenRouter via OpenAI client
    ollama_client.py      # thin wrapper over Ollama Python client (not currently selected by resolver)
  .env.example
  requirements.txt
  test_levels.py          # manual test: fires all 4 sass levels, prints responses
  README.md               # this file
  RESEARCH.md             # prior-art survey
```

Request flow:

```
POST /api/chat
  -> app.py routes to simple_handler or agent runner (USE_AGENT env var)
  |
  +-- simple_handler.chat(text, sassLevel, history)
  |     -> sass_profiles.get_prompt(sassLevel)      # system prompt string
  |     -> resolver.resolve_llm_target(sassLevel)   # backend/model/adapter
  |     -> target.adapter(system, messages)         # single LLM call
  |
  +-- agent.runner.run(text, sassLevel, history)
        -> sass_profiles.get_prompt(sassLevel)         # system prompt string
        -> resolver.resolve_llm_target(sassLevel)      # backend/model/adapter
        -> loop (max MAX_AGENT_ITERATIONS):
             if last iteration: inject system message "produce final answer now"
             target.adapter_with_tools(system, messages, TOOL_SCHEMAS)
             step.text?       -> return text
             step.tool_calls? -> execute all, append results, continue
  -> app.py emits one `chat_summary` log line
  -> { text }
```

---

## Tools

Tools are registered in `tools/registry.py`. Each entry holds a JSON schema (passed to the LLM) and a callable (executed when the LLM invokes it). The agent runner executes all tool calls per iteration and feeds results back before the next LLM call.

To add a tool: create `tools/<name>.py`, implement a function, add an entry to `TOOLS` in `registry.py`.

### `web_search`

Searches the web and returns the top results as formatted text.

| Config                   | Default | Description                                            |
| ------------------------ | ------- | ------------------------------------------------------ |
| `TAVILY_API_KEY`         | —       | Required. Get one at [tavily.com](https://tavily.com). |
| `MAX_WEB_SEARCH_RESULTS` | `3`     | Number of results returned to the LLM per search.      |

---

## API

### `POST /api/chat`

**Request**

```json
{
  "text": "what time is it",
  "sassLevel": 3,
  "history": [
    { "role": "user", "text": "remember I like short answers" },
    { "role": "bot", "text": "Got it. Short answers, less furniture." }
  ]
}
```

- `text` (string, required) - user utterance.
- `sassLevel` (int, required) - value from 1 to 4; backend routes to the matching sass profile.
- `history` (array, optional) - prior messages from the frontend. `bot` roles are converted to LLM `assistant` roles.

**Response**

```json
{ "text": "Half past whenever you last looked." }
```

**Errors** - `422` for invalid input, `502` for backend failure, both with JSON body.

---

## Logging

`setup_logging()` (called at boot) attaches a console handler and a rotating file handler to the root logger. Logs write to `logs/deskmate.log` by default.

| Config             | Default            | Description                                                      |
| ------------------ | ------------------ | ---------------------------------------------------------------- |
| `LOG_FILE`         | `logs/deskmate.log`  | Path to the log file. Directory is created automatically.        |
| `LOG_LEVEL`        | `INFO`             | Standard Python log level (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |
| `LOG_MAX_BYTES`    | `10485760` (10 MB) | File size at which rotation triggers.                            |
| `LOG_BACKUP_COUNT` | `5`                | Number of rotated files to keep alongside the active log.        |

**Summary log** — each `/api/chat` call emits one structured `INFO` line from `backend.summary` at the end of the request:

```text
2026-04-19T10:23:48 INFO     backend.summary   chat_summary {"request_id":"a3f1b9","timestamp_utc":"...","status":"success","duration_ms":1843,"handler_mode":"agent","llm_backend":"groq","sass_level":3,"agent_iterations_used":2,...}
```

**Agent run logs** — when `USE_AGENT=true`, `agent.runner` emits detailed per-iteration logs correlated by `[req=<request_id>]`:

```text
2026-04-19T10:23:45 INFO     agent.runner      [req=a3f1b9] agent run started: backend=groq model=... sass_level=3 history=2
2026-04-19T10:23:45 INFO     agent.runner      [req=a3f1b9] iteration 1/5: calling LLM
2026-04-19T10:23:46 INFO     agent.runner      [req=a3f1b9] iteration 1/5: LLM responded in 812ms with 1 tool call(s)
2026-04-19T10:23:46 INFO     agent.runner      [req=a3f1b9] tool 'web_search' invoked: args={"query": "..."}
2026-04-19T10:23:47 INFO     agent.runner      [req=a3f1b9] tool 'web_search' succeeded in 430ms, result=924 chars
2026-04-19T10:23:47 INFO     agent.runner      [req=a3f1b9] iteration 2/5: calling LLM
2026-04-19T10:23:48 INFO     agent.runner      [req=a3f1b9] iteration 2/5: final response received in 601ms, length=312 chars
2026-04-19T10:23:48 INFO     agent.runner      [req=a3f1b9] agent run ended: status=success iterations=2 tool_calls=1 total_ms=1843
```

Raw user text, system prompts, and model output are never logged.

---

## Setup (one-time)

Prereqs: Python 3.11+ and API keys for whichever cloud backend you use.

```bash
cd backend

# 1. create virtual env
python -m venv .venv

# 2. install deps
.venv\Scripts\pip install -r requirements.txt

# 3. create and configure .env
cp .env.example .env
#    set GROQ_API_KEY for default use
#    set OPENROUTER_API_KEY for sassLevel=4 or LLM_BACKEND=openrouter
#    set TAVILY_API_KEY for web search tool (required when USE_AGENT=true)
```

---

## Running

Start the backend server:

```powershell
cd backend
.\start.ps1
```

`start.ps1` kills any stale process on port 8000 before booting, so running it twice is safe. Server is ready when you see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

Start the frontend in a separate terminal:

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173` by default.

---

## Locked Decisions

| Decision         | Choice                                      | Notes                                                                                                                                          |
| ---------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Language         | Python + FastAPI                            | Async-friendly, best-in-class LLM tooling.                                                                                                     |
| LLM routing      | Centralized in `llm/resolver.py`            | Returns backend name, model name, and adapter callable for handlers.                                                                           |
| Default backend  | Groq unless `LLM_BACKEND=openrouter`        | `sassLevel=4` is forced to OpenRouter.                                                                                                         |
| Groq model       | `GROQ_MODEL` env var                        | Defaults to `openai/gpt-oss-120b`.                                                                                                             |
| OpenRouter model | `OPENROUTER_MODEL` env var                  | Defaults to `meta-llama/llama-3.3-70b-instruct:free`.                                                                                          |
| Prompt shape     | System prompt only                          | No few-shot yet. Each sass anchor maps to one system prompt string.                                                                            |
| Tasks / tools    | LLM tool calling via `tools/registry.py`    | First tool: web search via Tavily. Registry holds schemas + callables; agent runner executes all tool calls per iteration with error handling. |
| Routing for sass | Pure function `sassLevel -> str`            | Isolated in `chat/sass_profiles.py`. Testable boundary.                                                                                        |
| Summary logging  | One structured log at end of each chat call | Logs request and LLM target metadata without raw user/model text.                                                                              |

---

## Non-Goals (for now)

- No task execution beyond web search (timers, calendar, etc.).
- No sessions or persisted memory.
- No auth.
- No streaming responses.
- No TTS - frontend handles browser speech behavior.
