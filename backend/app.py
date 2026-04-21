import json
import logging
import time
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from config import CORS_ORIGINS, USE_AGENT
from chat.simple_handler import chat as simple_chat
from agent.runner import run as agent_run
from logging_config import setup_logging

setup_logging()

app = FastAPI()
summary_log = logging.getLogger("backend.summary")
summary_log.setLevel(logging.INFO)
if not summary_log.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(levelname)s:%(name)s:%(message)s"))
    summary_log.addHandler(handler)
summary_log.propagate = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class HistoryMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    text: str
    sassLevel: int = Field(ge=1, le=4)
    history: list[HistoryMessage] = []


class ChatResponse(BaseModel):
    text: str


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    started = time.perf_counter()
    request_id = uuid4().hex
    handler_mode = "agent" if USE_AGENT else "simple"
    llm_backend = None
    model = None
    status = "success"
    http_status = 200
    error_type = None
    error_code = None
    agent_iterations_used = None

    try:
        history = [m.model_dump() for m in req.history]
        if USE_AGENT:
            text, agent_iterations_used, llm_backend, model = agent_run(req.text, req.sassLevel, history, request_id)
        else:
            text, agent_iterations_used, llm_backend, model = simple_chat(req.text, req.sassLevel, history)
    except Exception as e:
        status = "error"
        http_status = 502
        error_type = type(e).__name__
        error_code = "UNHANDLED_EXCEPTION"
        raise HTTPException(status_code=502, detail=str(e))
    finally:
        duration_ms = int((time.perf_counter() - started) * 1000)
        summary = {
            "request_id": request_id,
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "route": "/api/chat",
            "method": "POST",
            "status": status,
            "http_status": http_status,
            "duration_ms": duration_ms,
            "handler_mode": handler_mode,
            "llm_backend": llm_backend,
            "model": model,
            "sass_level": req.sassLevel,
            "history_count": len(req.history),
            "agent_iterations_used": agent_iterations_used,
            "error_type": error_type,
            "error_code": error_code,
        }
        summary_log.info("chat_summary %s", json.dumps(summary, separators=(",", ":")))

    return ChatResponse(text=text)
