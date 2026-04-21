# FUNBOT

TARS-inspired voice assistant with an adjustable sass dial (1-4): useful first, funny second.

## Personal Project Note

FUNBOT is a solo, long-term project. I am building it as a path toward a desk companion that can eventually replace my Google Assistant.

Core reasons for building it:

- Build my own agent that can integrate tools to be genuinely helpful.
- Experiment with personality prompting and controllable tone.
- Work toward smart-home-assistant capabilities over time.
- Combine my hardware, full-stack, ML, and MLOps experience into one end-to-end system.

## Why I Built This

Most assistants are either useful but bland, or funny but unreliable.  
I wanted a system that can complete tasks while carrying a distinct voice, and evolve into a real product that lives on my desk.

## Current Features

- Voice input in the browser (Web Speech API).
- Adjustable sass/personality dial with 4 fixed anchors.
- Multi-turn chat with history passed to backend.
- Backend-controlled prompt routing by sass level.
- Optional agentic loop with tool calling.
- Web search tool integration (Tavily) for current-info queries.
- Structured request summary logging (without raw user/model text).

## Architecture

- `frontend/` is a thin client (React + Vite + Tailwind).
- `backend/` owns intelligence: prompt construction, LLM routing, sass behavior, tool calls, logging.
- Sass behavior definitions are centralized in `SASS_LEVELS.md`.
- High-level project decisions live in `BRAIN.md`.

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS
- Backend: Python 3.11+, FastAPI, Uvicorn
- LLM backends: Groq, OpenRouter, Ollama (resolver-driven)
- Tooling: Tavily web search

## Quick Start

Prereqs:

- Python 3.11+
- Node.js 18+
- API keys for chosen LLM provider(s)

Terminal 1 (backend):

```powershell
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
# create backend/.env and fill values from the table below
.\start.ps1
```

Terminal 2 (frontend):

```powershell
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`  
Backend default URL: `http://127.0.0.1:8000`

## Environment Variables (Backend)

| Variable               | Required                                  | Purpose                                               |
| ---------------------- | ----------------------------------------- | ----------------------------------------------------- |
| `GROQ_API_KEY`         | Yes (default backend)                     | Auth for Groq                                         |
| `OPENROUTER_API_KEY`   | Yes for sass level 4 or OpenRouter mode   | Auth for OpenRouter                                   |
| `TAVILY_API_KEY`       | Yes when `USE_AGENT=true` with web search | Auth for web search tool                              |
| `LLM_BACKEND`          | No                                        | Default backend selector (`groq`, `openrouter`, etc.) |
| `GROQ_MODEL`           | No                                        | Groq model override                                   |
| `OPENROUTER_MODEL`     | No                                        | OpenRouter model override                             |
| `USE_AGENT`            | No                                        | Enables agent loop (`true`/`false`)                   |
| `MAX_AGENT_ITERATIONS` | No                                        | Agent loop cap                                        |

For full backend config details, see `backend/README.md`.

## Roadmap

- Voice assistant polish and reliability.
- Add more tools, including smart-home-oriented tools over time.
- Continue experimentation across prompting, orchestration, and UX.
- Develop the robot counterpart in parallel.
- Add multi-agent collaboration (potentially via LangGraph), where one agent plans movement/personality behavior and another handles vision and distance/context feedback.
- Improve TTS to better match personality after further experimentation.

## Lessons Learned

- Personality controls are easiest to maintain when modeled as explicit anchors, not free-form tuning.
- Keeping intelligence in the backend simplifies frontend iteration and prevents logic drift.
- Tool-calling adds flexibility, but tight iteration limits and clear final-response rules are essential.
- Structured logs are critical for debugging multi-step agent behavior safely.

## Known Limitations

- No auth or user accounts.
- No persistent memory/session storage.
- No streaming responses yet.
- Tooling is intentionally minimal (web search first, more tasks later).

## Repo Layout

```text
backend/   FastAPI service, LLM routing, sass profiles, agent + tools
frontend/  React UI, voice input, sass picker, chat experience
```
