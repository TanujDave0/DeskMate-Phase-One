import ollama
from ollama import ResponseError as OllamaResponseError
from config import OLLAMA_MODEL, OLLAMA_HOST
from llm.errors import LLMError

_client = ollama.Client(host=OLLAMA_HOST)

TIMEOUT_SECONDS = 120


def generate(system: str, messages: list[dict]) -> str:
    try:
        response = _client.chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "system", "content": system}, *messages],
            options={"timeout": TIMEOUT_SECONDS},
        )
        return response.message.content
    except OllamaResponseError as e:
        raise LLMError(f"Ollama error: {e}") from e
    except Exception as e:
        raise LLMError(f"Ollama unexpected error: {e}") from e
