import logging
import time
from llm.errors import LLMError
from llm.resolver import resolve_llm_target
from chat.sass_profiles import get_prompt
from config import MAX_AGENT_ITERATIONS
from tools.registry import TOOL_SCHEMAS, execute

log = logging.getLogger(__name__)


class _ReqAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        return f"[req={self.extra['req']}] {msg}", kwargs


def run(
    text: str, sass_level: int, history: list[dict] | None = None, request_id: str | None = None
) -> tuple[str, int, str, str]:
    rlog = _ReqAdapter(log, {"req": request_id or "-"})

    system = get_prompt(sass_level)
    target = resolve_llm_target(sass_level)
    messages = [
        {"role": "assistant" if m["role"] == "bot" else "user", "content": m["text"]}
        for m in (history or [])
    ]
    messages.append({"role": "user", "content": text})

    t_run = time.perf_counter()
    tool_calls_total = 0

    rlog.info(
        "agent run started: backend=%s model=%s sass_level=%d history=%d",
        target.backend, target.model, sass_level, len(history or []),
    )

    for iteration in range(1, MAX_AGENT_ITERATIONS + 1):
        rlog.info("iteration %d/%d: calling LLM", iteration, MAX_AGENT_ITERATIONS)
        t_iter = time.perf_counter()

        if iteration == MAX_AGENT_ITERATIONS:
            messages.append({
                "role": "system",
                "content": "This is your final iteration. You must now produce a complete answer without calling any more tools.",
            })

        try:
            step = target.adapter_with_tools(system=system, messages=messages, tools=TOOL_SCHEMAS)
        except LLMError as e:
            llm_ms = int((time.perf_counter() - t_iter) * 1000)
            rlog.error("iteration %d/%d: LLM call failed in %dms: %s", iteration, MAX_AGENT_ITERATIONS, llm_ms, e)
            rlog.info(
                "agent run ended: status=error iterations=%d tool_calls=%d total_ms=%d",
                iteration, tool_calls_total, int((time.perf_counter() - t_run) * 1000),
            )
            return "I'm having trouble connecting right now. Please try again.", iteration, target.backend, target.model

        llm_ms = int((time.perf_counter() - t_iter) * 1000)

        if step.text is not None:
            rlog.info(
                "iteration %d/%d: final response received in %dms, length=%d chars",
                iteration, MAX_AGENT_ITERATIONS, llm_ms, len(step.text),
            )
            rlog.info(
                "agent run ended: status=success iterations=%d tool_calls=%d total_ms=%d",
                iteration, tool_calls_total, int((time.perf_counter() - t_run) * 1000),
            )
            return step.text, iteration, target.backend, target.model

        if step.tool_calls:
            rlog.info(
                "iteration %d/%d: LLM responded in %dms with %d tool call(s)",
                iteration, MAX_AGENT_ITERATIONS, llm_ms, len(step.tool_calls),
            )
            messages.append(step.raw_message)
            for tool_call in step.tool_calls:
                name = tool_call.function.name
                args = tool_call.function.arguments
                rlog.info("tool '%s' invoked: args=%s", name, args)
                t0 = time.perf_counter()
                try:
                    result = execute(tool_call)
                    tool_ms = int((time.perf_counter() - t0) * 1000)
                    tool_calls_total += 1
                    rlog.info("tool '%s' succeeded in %dms, result=%d chars", name, tool_ms, len(result))
                except Exception as e:
                    tool_ms = int((time.perf_counter() - t0) * 1000)
                    result = f"Tool error: unexpected failure in '{name}': {e}"
                    rlog.error("tool '%s' failed in %dms: %s", name, tool_ms, e)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result,
                })
            continue

        rlog.warning("iteration %d/%d: empty step (no text, no tool calls), treating as done", iteration, MAX_AGENT_ITERATIONS)
        rlog.info(
            "agent run ended: status=empty_step iterations=%d tool_calls=%d total_ms=%d",
            iteration, tool_calls_total, int((time.perf_counter() - t_run) * 1000),
        )
        return "", iteration, target.backend, target.model

    rlog.error(
        "agent run ended: status=max_iterations_exceeded iterations=%d tool_calls=%d total_ms=%d",
        MAX_AGENT_ITERATIONS, tool_calls_total, int((time.perf_counter() - t_run) * 1000),
    )
    return "I ran into a loop and had to stop. Please try again.", MAX_AGENT_ITERATIONS, target.backend, target.model
