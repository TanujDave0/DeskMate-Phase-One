from tavily import TavilyClient
from config import TAVILY_API_KEY, MAX_WEB_SEARCH_RESULTS

_client = TavilyClient(api_key=TAVILY_API_KEY)


def web_search(query: str) -> str:
    response = _client.search(query=query, max_results=MAX_WEB_SEARCH_RESULTS)
    results = response.get("results", [])
    if not results:
        return "No results found."
    parts = []
    for r in results:
        parts.append(f"**{r['title']}**\n{r['url']}\n{r['content']}")
    return "\n\n".join(parts)
