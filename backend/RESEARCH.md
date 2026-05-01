# DESKMATE — Similar Projects Research

Research survey of open-source projects relevant to DESKMATE's architecture.
Historical context in this file often references the early 0-100 / 5-anchor
sass framing. Current implementation uses sass levels 1-4
(`BUTLER`, `FRIENDLY`, `NORMAL`, `SPICY`) as defined in `../SASS_LEVELS.md`.

Goal of this doc: inform backend architecture decisions (sass routing,
prompt shape, model choice, tool-calling vs router, Ollama plumbing, content
policy). Not exhaustive — curated to the patterns worth stealing and the
traps worth avoiding.

---

## 1. Personality-adjustable chatbots / assistants

### 1.1 Ollamarama — h1ddenpr0cess20
- Link: https://github.com/h1ddenpr0cess20/ollamarama
- Summary: Terminal chatbot with "infinite personalities" backed by local
  Ollama. Also ships IRC and Matrix variants from the same author.
- Stack: Python, Ollama HTTP API, JSON config.
- Architecturally useful for DESKMATE: The system prompt is built as
  `prefix + persona_string + suffix`, configured in `config.json`. Runtime
  commands `/persona`, `/stock`, `/reset`, `/custom` swap personalities
  without restart. This is almost exactly the shape DESKMATE needs — we'd
  swap "persona string" for "sass-level anchor prompt" and keep the
  prefix/suffix template fixed. Temperature / top_p / repeat_penalty are
  also adjustable per persona, which is a subtle cue: tone is driven by
  *sampling params* as much as prompt text.
- Pitfall/gotcha: No persona routing logic, no mixing/interpolation between
  personas. Freeform strings drift — you get "character breaks" unless the
  suffix aggressively re-anchors ("never break character, keep responses
  brief"). DESKMATE's fixed 5 anchors avoids the drift, but we still need
  that anchoring suffix.

### 1.2 Ollamas_Unplugged_Personality — periczeljkosmederevo
- Link: https://github.com/periczeljkosmederevo/Ollamas_Unplugged_Personality
- Summary: C# desktop app that lets users tune AI traits (tone, politeness,
  expertise) and chat with the resulting persona.
- Stack: C#, Ollama.
- Architecturally useful for DESKMATE: Demonstrates a *multi-axis* tone
  system (tone × politeness × expertise) rather than a single dial.
  DESKMATE's single sass dial is simpler and better — but this project is
  proof that multi-slider designs are usually over-engineered for solo
  personal use and end up with combinatorial prompt bloat.
- Pitfall/gotcha: Trait combinations can produce incoherent personas
  ("extremely sarcastic + extremely polite"). DESKMATE's 5 fixed named
  anchors side-step this by being hand-authored rather than composed.

### 1.3 SillyTavern
- Link: https://github.com/SillyTavern/SillyTavern
- Summary: Mature LLM frontend for roleplay/character chat. 300+
  contributors, works with Ollama, KoboldCPP, OpenAI, Claude, etc.
- Stack: Node/JS frontend, backend-agnostic (OpenAI-compatible APIs).
- Architecturally useful for DESKMATE: The **Character Card** format
  (name, description, scenario, example dialogues, advanced prompt) is the
  most battle-tested structure for defining a persona. Specifically the
  "example dialogues" field — few-shot examples in the system prompt — is
  what keeps character voice consistent across a long session. Worth
  copying: each sass anchor in `SASS_LEVELS.md` should include 2-3 example
  user/assistant exchanges, not just abstract tone descriptions.
- Pitfall/gotcha: Massive scope creep territory. SillyTavern has world
  info, lore books, author's notes, group chats, expression packs, STscript
  macros. For DESKMATE personal use, pick the 20% that matters
  (system prompt + few-shot) and ignore the rest.

### 1.4 persona-api — craigtrim
- Link: https://github.com/craigtrim/persona-api
- Summary: FastAPI service that generates persona prompts from Big Five
  (BFI-2) personality scores.
- Stack: Python, FastAPI.
- Architecturally useful for DESKMATE: Not the Big Five approach (wrong
  model for comedy), but the *shape*: a small FastAPI service whose only
  job is to turn a structured request (here: personality vector; for
  DESKMATE: `sassLevel`) into a system prompt string. If DESKMATE ever
  refactors, isolating "sass level -> system prompt" as its own pure
  function behind one module makes it trivially testable.
- Pitfall/gotcha: BFI-2 traits (openness, conscientiousness, etc.) don't
  map cleanly to comedic tone. Don't go down that rabbit hole — the 5
  named anchors are a better abstraction for a humor-first assistant.

---

## 2. TARS-inspired / fictional-character voice assistants

### 2.1 TARS-AI — TARS-AI-Community
- Link: https://github.com/TARS-AI-Community/TARS-AI
- Summary: Community-driven full TARS recreation — 3D-printable hardware,
  motorized and static builds, server component, wake-word training.
- Stack: Python (66%), JS/HTML/CSS for the server UI, multiple LLM
  backends.
- Architecturally useful for DESKMATE: **Configurable persistent humor and
  honesty levels** — the closest prior art to DESKMATE's sass dial in the
  TARS corner of the ecosystem. The project splits "server" (brain) from
  the physical robot shell, which is exactly the voice -> robot migration
  path DESKMATE needs later. Building now against a clean HTTP contract
  (`POST /api/chat`) means the robot shell can just call the same backend.
- Pitfall/gotcha: Large project with a lot of hardware scope. For a
  voice-only MVP it's easy to get sucked into servo code. Take the
  server/shell split, leave the hardware for later.

### 2.2 GemiTARS (AspireOne/GemiTARS)
- Link: https://github.com/AspireOne/GemiTARS
- Summary: TARS running on a Raspberry Pi Zero 2W "head" that streams
  audio to a "brain" server using Google Gemini Live API and ElevenLabs
  streaming TTS.
- Stack: Python, Gemini Live, ElevenLabs, OpenWakeWord with a custom TARS
  wake-word model.
- Architecturally useful for DESKMATE: **Layered config**
  (`defaults -> .env -> config_override.json -> personas.json`) and
  *dynamic persona switching via tool calls* — the LLM itself can request a
  persona change mid-conversation. For DESKMATE, the dial is owner-driven,
  not model-driven, so we skip the tool-call swap. But the layered config
  pattern is worth adopting: defaults in code, secrets in `.env`, sass
  anchors in a dedicated file (`SASS_LEVELS.md` / a JSON sibling).
- Pitfall/gotcha: Gemini Live + ElevenLabs = recurring cloud costs and
  content-policy exposure (will refuse at sass=100). DESKMATE's Ollama-first
  stance avoids both problems. This project is a useful counter-example.

### 2.3 TARS-Offline-Multimodal (akshanthsaik)
- Link: https://github.com/akshanthsaik/TARS-Offline-Multimodal-AI-System
- Summary: Fully offline TARS — LangGraph orchestration, Phi-4-mini LLM,
  Vosk STT, BLIP vision.
- Stack: Python, LangGraph, Phi-4-mini, Vosk, BLIP.
- Architecturally useful for DESKMATE: Proof that an offline, laptop-class
  small LLM (Phi-4-mini ~ 3.8B) is viable for a TARS-style assistant
  without a GPU. Relevant given DESKMATE's laptop + integrated-graphics
  constraint. Also demonstrates LangGraph for orchestrating multi-step
  flows (STT -> intent -> tool -> LLM -> TTS).
- Pitfall/gotcha: LangGraph is heavy for a 5-anchor personality router.
  For MVP, don't reach for LangGraph — a plain function dispatch based on
  `sassLevel` is three lines of Python. Add orchestration only when there
  are actually multiple steps worth orchestrating.

### 2.4 primantah/tars
- Link: https://github.com/primantah/tars
- Summary: Small, simple voice-in / GPT / voice-out TARS chatbot using
  pyttsx3 for a deep robotic voice.
- Stack: Python, OpenAI GPT, `speech_recognition`, `pyttsx3`.
- Architecturally useful for DESKMATE: The anti-pattern writeup —
  personality here is *only* the voice (deep/slow pyttsx3 config), not the
  text. Responses are vanilla ChatGPT. This is what DESKMATE must *not* do:
  "TARS voice" ≠ "TARS character". Sass must live in the prompt/response,
  not just the audio.
- Pitfall/gotcha: README handwaves "you can add iconic lines for humor
  cues" but never implements it. Typical trap: deferring the hard part
  (character consistency) to "optional enhancement." DESKMATE has to do that
  work on day one or it's just a robotic-voice ChatGPT.

### 2.5 dnhkng/GLaDOS
- Link: https://github.com/dnhkng/GLaDOS
- Summary: Serious engineering effort at a Portal-accurate GLaDOS
  "personality core." No wake word — it observes, thinks, and speaks
  proactively. Custom TTS trained on GLaDOS voice.
- Stack: Parakeet TDT STT, Kokoro / custom GLaDOS TTS, Silero VAD,
  OpenAI-compatible LLM (commonly Ollama), MCP tool integration, optional
  FastVLM vision.
- Architecturally useful for DESKMATE: Multi-component context-merging
  pattern — the system prompt is assembled each turn from
  `personality core + task slots (weather/news/vision) + emotional state
  (PAD model) + long-term memory`. Generalizes well: DESKMATE's per-turn
  system prompt can be `sass_anchor + ephemeral_context` assembled at
  request time. Also: **latency is the UX** — dnhkng explicitly
  calls out <600 ms as the threshold where conversation feels natural.
- Pitfall/gotcha: HEXACO + PAD emotional modelling is wildly overkill
  for DESKMATE's 5 fixed anchors. Steal the "context-merging" idea, not the
  personality-theory framework.

### 2.6 KokoDOS (kaminoer)
- Link: https://github.com/kaminoer/KokoDOS
- Summary: Traditional-assistant reframe of the GLaDOS project — wake
  word + push-to-talk, Kokoro-FastAPI TTS, optional vision.
- Stack: Distil-Whisper STT, Kokoro-FastAPI TTS, Ollama (defaults to
  minicpm-v for vision).
- Architecturally useful for DESKMATE: Shows how to wrap Kokoro behind a
  FastAPI wrapper for TTS — useful pattern if DESKMATE later replaces
  browser STT/TTS with a self-hosted one. Also the explicit target of 600
  ms latency through streaming.
- Pitfall/gotcha: Documents a real problem — **audio feedback loops**
  when the mic picks up the TTS output. Browser-native STT on DESKMATE
  currently sidesteps this, but any future self-hosted mic/speaker setup
  needs either headphones, push-to-talk, or VAD-based interruption.

---

## 3. Ollama-backed home assistants / chat apps (FastAPI patterns)

### 3.1 Ollama-FastAPI-Integration-Demo (darcyg32)
- Link: https://github.com/darcyg32/Ollama-FastAPI-Integration-Demo
- Summary: Minimal reference integration of FastAPI + Ollama with
  streaming, JSON-formatted, and complete-response endpoints.
- Stack: Python, FastAPI, Ollama.
- Architecturally useful for DESKMATE: **This is the closest reference
  repo to DESKMATE's backend shape.** Clean separation of streaming vs.
  non-streaming endpoints, Pydantic request models. Current DESKMATE
  contract (`POST /api/chat {text, sassLevel} -> {text}`) matches the
  "complete response" variant exactly; adding a streaming `/api/chat/stream`
  later is a drop-in addition following this pattern.
- Pitfall/gotcha: Doesn't cover concurrency. Ollama queues requests
  serially by default; use `OLLAMA_NUM_PARALLEL` / `--parallel` and an
  `asyncio.Semaphore` on the FastAPI side if more than one client will
  ever connect. For solo personal use this doesn't matter yet.

### 3.2 echoOLlama (theboringhumane)
- Link: https://github.com/theboringhumane/echoOLlama
- Summary: Real-time voice AI platform with WebSocket streaming,
  OpenAI API compatibility, Redis for sessions, PostgreSQL persistence.
- Stack: FastAPI, Ollama, Redis, PostgreSQL, WebSockets.
- Architecturally useful for DESKMATE: Illustrates where the complexity
  ceiling sits if you go "full platform." Redis+Postgres+WebSockets is
  overkill for a solo hobby assistant but the **WebSocket streaming**
  pattern is the right upgrade when browser-side STT graduates to
  streaming-duplex mode.
- Pitfall/gotcha: Scope inflation. Session storage, multi-user, OpenAI
  compat — none of this is on DESKMATE's roadmap. Watch out for dragging
  in infra that only pays off at 10+ concurrent users.

### 3.3 ollama-STT-TTS (sancliffe)
- Link: https://github.com/sancliffe/ollama-STT-TTS
- Summary: 100% local hands-free voice assistant — OpenWakeWord,
  WebRTC VAD, Whisper, Ollama.
- Stack: Python, OpenWakeWord, WebRTC VAD, Whisper, Ollama.
- Architecturally useful for DESKMATE: Canonical reference for the "no
  cloud, no subscription" voice-assistant loop on a CPU. Relevant when
  DESKMATE eventually replaces browser-STT with a self-hosted alternative.
- Pitfall/gotcha: CPU-only Whisper is slow on integrated graphics —
  plan for `faster-whisper` (CTranslate2) or Whisper.cpp, not base
  openai-whisper.

### 3.4 tara-orpheus-livekit (dwain-barnes)
- Link: https://github.com/dwain-barnes/tara-orpheus-livekit
- Summary: Fully-local voice assistant with emotional TTS (laughs,
  sighs, gasps via Orpheus TTS), orchestrated with LiveKit.
- Stack: Faster-Whisper STT, Ollama (Llama 3.2), Orpheus TTS, LiveKit.
- Architecturally useful for DESKMATE: Expression tags — responses
  include inline `<giggle>`, `<sigh>`, `<laugh>` etc. that the TTS
  interprets. If DESKMATE ever wants sass-level-dependent vocal delivery
  (sass=100 should audibly cackle), this pattern is the cleanest way:
  the LLM emits tags, TTS renders them. Keeps the text contract clean.
- Pitfall/gotcha: LiveKit is a heavy dependency for a one-user setup.
  Steal the tag idea, skip the real-time media framework until there's
  a real multi-client need.

---

## 4. Hobby robot companions with LLM brains (long-term arc)

### 4.1 Reachy Mini — pollen-robotics
- Link: https://github.com/pollen-robotics/reachy_mini
- Summary: $299 open-source 28 cm desktop companion robot from Pollen
  Robotics + Hugging Face. Python SDK. Moves head, has a camera, mics,
  speakers, expressive antennae.
- Stack: Python SDK, OpenWakeWord, optional HF Spaces for behaviors,
  LLM-agnostic (conversation app example uses HF models).
- Architecturally useful for DESKMATE: This is *the* reference for the
  voice -> physical-robot arc. The SDK intentionally separates
  "behaviors" (head poses, antenna animations, greetings) from the
  brain. A `POST /api/chat` backend like DESKMATE's plugs in directly —
  the robot shell just calls the endpoint and animates around the
  response. Also ships an `AGENTS.md` for AI-assisted dev (same pattern
  DESKMATE already uses — good signal).
- Pitfall/gotcha: $299 + shipping eats most of the $100 budget; this is
  inspiration for year-2, not an MVP target. But the *contract shape*
  should inform today's backend design — keep `/api/chat` a clean black
  box so a robot shell can consume it later.

### 4.2 eric-rolph/pi5-local-voice-assistant
- Link: https://github.com/eric-rolph/pi5-local-voice-assistant
- Summary: Privacy-first Pi 5 voice assistant — fully on-device STT,
  LLM, TTS; RGB LED feedback; 3.5-7.5 s end-to-end on Pi 5 8 GB.
- Stack: INT8-quantized Parakeet-TDT STT, Ollama (Gemma 2 2B / Gemma 3),
  Piper or KittenTTS, Adafruit Voice Bonnet hardware.
- Architecturally useful for DESKMATE: Direct evidence that small Ollama
  models (Gemma 2 2B) + quantized STT fit on constrained hardware.
  Validates DESKMATE's integrated-graphics laptop path using similar sized
  models (llama3.2:3b, qwen2.5:3b, phi3:mini).
- Pitfall/gotcha: 3.5-7.5 s end-to-end is *noticeable lag*. Below
  GLaDOS's 600 ms target by an order of magnitude. For DESKMATE, this is
  the realistic latency ceiling on a laptop — plan UX around it
  (thinking indicator, optimistic speaking cues). Don't promise
  real-time.

### 4.3 latishab/tars (Raspberry Pi 5 TARS)
- Link: https://github.com/latishab/tars
- Summary: TARS companion-robot hardware stack — servo control, camera,
  audio, animated eyes, WebRTC (aiortc) A/V server — running on Pi 5.
- Stack: Python, aiortc, Pi 5 hardware, servo driver, OLED eyes.
- Architecturally useful for DESKMATE: Physical TARS hardware reference
  for when the voice-to-robot migration happens. The aiortc server runs
  independently of the LLM brain — clean separation. A DESKMATE robot
  shell can follow the same split: `/api/chat` stays the brain,
  aiortc/servo code is a separate shell process.
- Pitfall/gotcha: Hardware sourcing + 3D printing + servo tuning is
  weeks of work *before* you have a working robot. Don't couple this to
  the voice MVP timeline.

---

## 5. Chatbots intentionally handling "unfiltered" personalities

### 5.1 Dolphin-Mistral family (Cognitive Computations / Eric Hartford)
- Link: https://ollama.com/library/dolphin-mistral (model hub),
  author HF: https://huggingface.co/cognitivecomputations
- Summary: Fine-tuned, deliberately-uncensored Mistral/Llama derivatives.
  Design philosophy: "Dolphin is steerable. Alignment belongs to the
  system owner, not the model."
- Stack: Available as Ollama models: `dolphin-mistral`, `dolphin-llama3`,
  `dolphin-mixtral`, `dolphin3` etc. Runs in Ollama just like any other
  model — pull and go.
- Architecturally useful for DESKMATE: The canonical answer to
  "how do I get sass=100 without refusals from the base model?" The
  Dolphin line is specifically built so the *system prompt* is the
  source of tone/policy, not baked-in RLHF. DESKMATE's sass-100 "UNHINGED"
  anchor lands much more cleanly on `dolphin-llama3:8b` or
  `dolphin-mistral:7b` than on stock Llama 3 Instruct.
- Pitfall/gotcha: "Uncensored" doesn't mean "hate-speech machine" — it
  means the model will comply with the owner's system prompt. If the
  owner's anchor for sass=100 is "R-rated stand-up comedian," that's
  what they get. If the anchor is "Nazi propagandist," that's also what
  they get. **The system prompt is load-bearing.** Write the sass=100
  anchor carefully — constrain topic range even while removing tone
  filters ("foul language fine; slurs / protected-class attacks not").

### 5.2 Nous-Hermes series
- Link: https://ollama.com/library/nous-hermes2 (and `nous-hermes2-mixtral`)
- Summary: NousResearch's Hermes line — less actively "uncensored" than
  Dolphin but well-known for role-play coherence, long-form creative
  writing, and not refusing character prompts.
- Stack: Ollama models: `nous-hermes2`, `nous-hermes2-mixtral`.
- Architecturally useful for DESKMATE: Strong at *staying in character*
  over multi-turn dialogue. If sass=50 WITTY needs to hold for a 30-turn
  conversation without breaking, Hermes-style fine-tunes are the safer
  bet than Instruct models that regress to "As an AI assistant..."
- Pitfall/gotcha: Still more restrictive than Dolphin at the sass=100
  end. The owner may want two models in the config — a "safe" default
  (Hermes or stock Llama) for sass <= 75 and a Dolphin variant for 100.

### 5.3 SillyTavern (also Bucket 1)
- Link: https://github.com/SillyTavern/SillyTavern
- Relevance here: Because SillyTavern is the dominant open-source
  interface for "character chat without cloud refusals," its community
  docs are the single best source on **which local models play well with
  strong personas**. Cross-reference it when picking a base model.
- Pitfall/gotcha: The SillyTavern community leans heavily
  NSFW/role-play. DESKMATE's goal is comedy, not erotica — filter their
  model recommendations accordingly.

---

## Patterns worth stealing (backend architecture)

1. **`prefix + sass_anchor + suffix` system-prompt template**
   (Ollamarama pattern). The prefix establishes identity
   ("You are DESKMATE, a helpful assistant..."), the per-anchor body sets
   tone, and the suffix re-anchors behavior ("Never break character.
   Always give a real answer before the joke."). Author the suffix once;
   it guards all 5 sass levels from drifting.

2. **Few-shot examples inside each sass anchor**
   (SillyTavern Character Card pattern). Each anchor in `SASS_LEVELS.md`
   (or a sibling JSON) should include 2-3 concrete
   user-message / assistant-response pairs. Abstract descriptions
   ("Gen Z supervisor") drift; examples pin the voice. Keep them short;
   they cost tokens on every request.

3. **Sass routing as a pure function: `sassLevel -> system_prompt`**
   (persona-api shape). A single module
   `app/sass.py::build_system_prompt(sass_level: int) -> str` — unit-
   testable, easy to golden-file test, and the obvious seam for future
   refinements (per-anchor temperature, seasonal tone, etc.) without
   touching FastAPI glue.

4. **Keep `/api/chat` a black box; split "brain" from "shell"**
   (TARS-AI, Reachy Mini, latishab/tars pattern). Brain = FastAPI +
   Ollama + sass routing. Shell = browser frontend today, robot
   hardware tomorrow. As long as the contract stays
   `{text, sassLevel} -> {text}` (or a streaming variant), the shell
   can swap without touching the brain.

5. **Two models in config: safe default + uncensored for sass=100**
   (Dolphin philosophy). A single `model` setting is brittle — either
   you refuse on sass=100 or you over-sass on sass=0. Let the config
   route by level: e.g. `llama3.2:3b` for 0-75,
   `dolphin-llama3:8b` for 100. This is a config question, not a code
   question — owner decision required (see open recommendations).

6. **Plan for latency, not real-time**
   (pi5-local-voice, GLaDOS pitfalls). On integrated-graphics laptops,
   expect 1-4 s LLM latency on 3B-7B models. Build the UX around it
   (spinner, optimistic "thinking..." cue). Don't promise <600 ms; that
   requires a GPU or cloud API, both outside DESKMATE's constraints.

---

## Pitfalls to avoid

1. **Don't confuse voice with character.** primantah/tars is the
   cautionary example — a deep robotic pyttsx3 voice over vanilla
   ChatGPT responses is not TARS. Sass must live in the *text*. Voice
   tags are optional seasoning (tara-orpheus-livekit).

2. **Don't over-engineer personality modelling.** HEXACO/PAD
   (dnhkng/GLaDOS), Big Five (persona-api), and multi-axis
   trait composition (Ollamas_Unplugged) are all interesting — and all
   overkill for 5 hand-authored sass anchors. Hand-author the anchors,
   ship, iterate.

3. **Don't pull in LangGraph / LangChain / Redis / Postgres too early.**
   echoOLlama and TARS-Offline show what a "full" system looks like.
   DESKMATE's current contract (one endpoint, no history persistence, one
   user) does not need any of it. Add when (if) the problem shows up.

4. **Don't assume cloud LLMs will play at sass=100.** GemiTARS (Gemini
   Live) will refuse, soft-censor, or drift polite at the R-rated end.
   Ollama-first is correct, and within the Ollama space, Instruct models
   also refuse — Dolphin/Hermes fine-tunes are the specific answer, not
   just "local = fine."

5. **Don't ignore the audio feedback loop.** KokoDOS explicitly
   documents this. Browser STT hides the problem today (the browser
   stops listening when its speaker plays), but any future self-hosted
   mic/speaker setup needs push-to-talk, VAD-based interruption, or
   headphones. Decide the answer before building the hardware.

---

## Open recommendations for owner

1. **Model choice: single vs. per-level.** Default proposal — one
   "safe" model (`llama3.2:3b` or `qwen2.5:3b`) for sass 0-75, plus
   `dolphin-llama3:8b` for sass=100. Alternative — a single Dolphin
   variant for all levels (simpler config, slightly off-character at
   sass=0 BUTLER). Owner picks.

2. **Prompt shape: single system-prompt-per-sass vs. shared + few-shot
   per-sass.** Option A — each level is one self-contained system
   prompt string. Option B — a shared identity prefix + per-level
   few-shot pairs + shared suffix (SillyTavern/Ollamarama hybrid).
   Option B keeps the 5 anchors tighter and easier to diff but doubles
   the complexity of the sass module. Owner picks before
   `SASS_LEVELS.md` solidifies.

3. **Router vs. LLM tool-calling for tasks.** Current BRAIN.md lists
   this as open. Given the laptop-only constraint and small models
   (3B-8B), tool-calling reliability is weak. Recommend a hand-written
   intent router for the first 2-3 tasks (weather, time, maybe timer),
   escalate to LLM tool-calling only when task count grows past ~5.
   Owner picks.

4. **Content-policy boundary at sass=100.** "R-rated stand-up comedian"
   needs explicit written scope in `SASS_LEVELS.md`:
   what's in (profanity, crude humor, roasting the user), what's out
   (slurs, targeted harassment of protected classes, illegal-how-to
   content). Dolphin will follow whatever is in the system prompt —
   the owner must author the boundary. Pre-implementation sign-off
   required.
