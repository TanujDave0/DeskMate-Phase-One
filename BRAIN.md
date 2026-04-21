# FUNBOT - Project Brain (Seed for New Repo)

---

## North Star

TARS-inspired voice assistant with an adjustable personality dial (1-4, BUTLER to SPICY). Must be genuinely helpful first -- personality wraps around utility, never replaces it. The bot completes tasks AND has character.

Long-term arc: Voice Assistant -> Vision/Camera -> Physical Robot. Current focus: voice assistant only.

---

## Decisions Made

| Decision                                           | Why                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MVP-first, iterate                                 | Solo dev, limited time. Working prototype beats months of planning.                                                                                                                                                                                                                                           |
| Personality uses 4 discrete anchors (1/2/3/4)      | TARS-like UX with practical implementation (defined profiles).                                                                                                                                                                                                                                                |
| Sass anchor definitions live in `SASS_LEVELS.md`   | Keeps personality behavior centralized for prompt design, testing, and future tuning.                                                                                                                                                                                                                         |
| Send full chat history to LLM                      | Enables multi-turn conversation context; frontend passes prior messages, backend converts (`bot`→`assistant`, `text`→`content`) and prepends before LLM call.                                                                                                                                                 |
| LLM tool calling over router-based dispatch        | LLM decides which tools to invoke. More flexible than intent routing, handles compound requests naturally. First tool: web search via Tavily (`tools/web_search.py`).                                                                                                                                         |
| Agentic flow behind `USE_AGENT` env var toggle     | `agent/runner.py` runs a loop (max `MAX_AGENT_ITERATIONS=X`) and returns the final text response. On the last iteration a `system` message is injected telling the LLM to produce a final answer without calling more tools. Default remains simple handler (`chat/simple_handler.py`) until agent is stable. |
| LLM target resolution lives in `llm/resolver.py`   | Backend/model routing is centralized. Chat handlers receive a resolved target with backend name, model name, and adapter callable, then only make the adapter call.                                                                                                                                           |
| Backend emits one summary log per `/api/chat` call | Logs request id, timestamp, route/method, status, HTTP status, duration, handler mode, LLM backend/model, sass level, history count, agent iterations, and error metadata. No raw user text or model output is logged.                                                                                        |

---

## Open Questions

| Question | Why it matters |
| -------- | -------------- |

---

## Reference

- `SASS_LEVELS.md` -- source of truth for the 1/2/3/4 sass anchor definitions and owner notes.
