from openai import OpenAI
from openai import APIError as OpenAIAPIError
from config import OPENROUTER_API_KEY, OPENROUTER_MODEL
from llm.errors import LLMError
from our_types.types import AgentStep

_client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
)


def generate(system: str, messages: list[dict]) -> str:
    try:
        response = _client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[{"role": "system", "content": system}, *messages],
            timeout=30,
        )
        return response.choices[0].message.content
    except OpenAIAPIError as e:
        raise LLMError(f"OpenRouter error: {e}") from e
    except Exception as e:
        raise LLMError(f"OpenRouter unexpected error: {e}") from e


def generate_with_tools(system: str, messages: list[dict], tools: list[dict]) -> AgentStep:
    try:
        response = _client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[{"role": "system", "content": system}, *messages],
            tools=tools,
            tool_choice="auto",
            timeout=30,
        )
        choice = response.choices[0]
        msg = choice.message
        if choice.finish_reason == "tool_calls" and msg.tool_calls:
            raw_message = {
                "role": "assistant",
                "content": msg.content,
                "tool_calls": [tc.model_dump() for tc in msg.tool_calls],
            }
            return AgentStep(text=None, tool_calls=msg.tool_calls, raw_message=raw_message)
        raw_message = {"role": "assistant", "content": msg.content}
        return AgentStep(text=msg.content, tool_calls=None, raw_message=raw_message)
    except OpenAIAPIError as e:
        raise LLMError(f"OpenRouter error: {e}") from e
    except Exception as e:
        raise LLMError(f"OpenRouter unexpected error: {e}") from e
