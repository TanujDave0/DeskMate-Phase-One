const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
const CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`

/**
 * Request body:  { text: string, sassLevel: number }
 * Response body: { text: string }
 */
export async function sendMessage({ text, sassLevel, history = [] }) {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, sassLevel, history }),
  })

  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`)
  }

  const data = await response.json()
  if (!data || typeof data.text !== 'string') {
    throw new Error('Invalid chat response format')
  }

  return data.text
}
