import logging
from llm.errors import LLMError
from llm.resolver import resolve_llm_target
from chat.sass_profiles import get_prompt

log = logging.getLogger(__name__)


def chat(
    text: str, sass_level: int, history: list[dict] | None = None
) -> tuple[str, int | None, str, str]:
    system = get_prompt(sass_level)
    target = resolve_llm_target(sass_level)
    messages = [
        {"role": "assistant" if m["role"] == "bot" else "user", "content": m["text"]}
        for m in (history or [])
    ]
    messages.append({"role": "user", "content": text})
    try:
        response = target.adapter(system=system, messages=messages)
        return response, None, target.backend, target.model
    except LLMError as e:
        log.error("LLM call failed: %s", e)
        return "I'm having trouble connecting right now. Please try again.", None, target.backend, target.model
