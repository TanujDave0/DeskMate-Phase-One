import json
from tools.web_search import web_search

TOOLS = {
    "web_search": {
        "schema": {
            "type": "function",
            "function": {
                "name": "web_search",
                "description": "Search the web for current information on a topic.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query.",
                        }
                    },
                    "required": ["query"],
                },
            },
        },
        "fn": web_search,
    }
}

TOOL_SCHEMAS = [t["schema"] for t in TOOLS.values()]


def execute(tool_call) -> str:
    name = tool_call.function.name
    if name not in TOOLS:
        return f"Tool error: unknown tool '{name}'"
    try:
        args = json.loads(tool_call.function.arguments)
    except json.JSONDecodeError as e:
        return f"Tool error: could not parse arguments for '{name}': {e}"
    try:
        return TOOLS[name]["fn"](**args)
    except Exception as e:
        return f"Tool error: '{name}' failed: {e}"
