# FUNBOT Frontend

React + Vite + Tailwind frontend for the FUNBOT chat UI.

## Stack

- Framework: React 19 + Vite
- Styling: Tailwind CSS
- Voice input (STT): Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)

## Current Features

- App shell with dark/light theme toggle (default: dark).
- Scrollable chat history with auto-scroll to the newest message.
- User and bot message bubbles with empty-state screen.
- Input bar with:
  - text input + send button,
  - mic button for speech-to-text capture,
  - sass picker with 4 fixed anchors in an arc popover.
- Sass anchors: `1 (BUTLER)`, `2 (FRIENDLY)`, `3 (NORMAL)`, `4 (SPICY)`.
- In-flight request UX:
  - controls are disabled while awaiting a reply,
  - input placeholder switches to a thinking state,
  - animated in-chat thinking bubble is shown until response arrives.
- Basic frontend error fallback message if chat request fails.

## API Contract

Frontend sends chat requests to:

- `POST /api/chat` (same-origin by default)

Request body:

```json
{
  "text": "string",
  "sassLevel": 3,
  "history": [
    { "id": 1, "role": "user", "text": "previous user message" },
    { "id": 2, "role": "bot", "text": "previous bot message" }
  ]
}
```

`history` is the current in-memory chat history sent with each request so the backend can preserve multi-turn context.

Expected success response:

```json
{ "text": "string" }
```

Environment override:

- Set `VITE_API_BASE_URL` to point to a different backend origin.
- Final endpoint used by frontend is `${VITE_API_BASE_URL}/api/chat` (or `/api/chat` when unset).

## Key Files

- `src/App.jsx`: top-level state, send flow, loading/error handling.
- `src/api.js`: backend fetch call and response validation.
- `src/components/ChatHistory.jsx`: chat list + loading bubble placement.
- `src/components/ThinkingBubble.jsx`: animated in-chat thinking indicator.
- `src/components/InputBar.jsx`: input, send, mic, sass picker wiring.
- `src/components/SassPicker.jsx`: sass anchor fan-out UI.
- `src/hooks/useSpeech.js`: Web Speech API wrapper.

## Scripts

- `npm run dev`: run local dev server.
- `npm run build`: production build.
- `npm run preview`: preview production build locally.
