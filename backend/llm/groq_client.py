from groq import Groq
from groq import APIError as GroqAPIError
from config import GROQ_API_KEY, GROQ_MODEL
from llm.errors import LLMError
from our_types.types import AgentStep

_client = Groq(api_key=GROQ_API_KEY)


def generate(system: str, messages: list[dict]) -> str:
    try:
        response = _client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "system", "content": system}, *messages],
            timeout=30,
        )
        return response.choices[0].message.content
    except GroqAPIError as e:
        raise LLMError(f"Groq error: {e}") from e
    except Exception as e:
        raise LLMError(f"Groq unexpected error: {e}") from e


def generate_with_tools(system: str, messages: list[dict], tools: list[dict]) -> AgentStep:
    try:
        response = _client.chat.completions.create(
            model=GROQ_MODEL,
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
    except GroqAPIError as e:
        raise LLMError(f"Groq error: {e}") from e
    except Exception as e:
        raise LLMError(f"Groq unexpected error: {e}") from e
