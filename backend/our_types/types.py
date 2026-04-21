from dataclasses import dataclass
from typing import Callable


GenerateAdapter = Callable[[str, list[dict]], str]
GenerateToolAdapter = Callable[[str, list[dict], list[dict]], "AgentStep"]


@dataclass
class AgentStep:
    text: str | None
    tool_calls: list | None
    raw_message: dict


@dataclass(frozen=True)
class LLMTarget:
    backend: str
    model: str
    adapter: GenerateAdapter
    adapter_with_tools: GenerateToolAdapter
