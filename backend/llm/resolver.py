from config import GROQ_MODEL, LLM_BACKEND, OPENROUTER_MODEL
from llm.groq_client import generate as groq_generate, generate_with_tools as groq_generate_with_tools
from llm.openrouter_client import generate as openrouter_generate, generate_with_tools as openrouter_generate_with_tools
from our_types.types import LLMTarget


def resolve_llm_target(sass_level: int) -> LLMTarget:
    if sass_level == 4 or LLM_BACKEND == "openrouter":
        return LLMTarget(
            backend="openrouter",
            model=OPENROUTER_MODEL,
            adapter=openrouter_generate,
            adapter_with_tools=openrouter_generate_with_tools,
        )

    return LLMTarget(
        backend="groq",
        model=GROQ_MODEL,
        adapter=groq_generate,
        adapter_with_tools=groq_generate_with_tools,
    )
