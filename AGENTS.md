# AGENTS.md

DESKMATE: TARS-inspired voice assistant with an adjustable 1-4 sass/personality dial. Helpful first, funny second.

---

## Key Docs

- `BRAIN.md` -- source of truth for decisions, constraints, and open questions. Read before making architectural choices.
- `SASS_LEVELS.md` -- source of truth for 1/2/3/4 sass anchor definitions and owner tone notes.

---

## Commands

---

## Architecture Rules

- Personality is a behavior layer on top of utility. If the user asks for weather, they get weather. Sass wraps the delivery, never replaces the answer.
- Use `SASS_LEVELS.md` for sass-level behavior. Do not redefine the anchors elsewhere unless the owner explicitly asks.
- The backend owns all intelligence: LLM calls, prompt construction, sass-level routing, task execution. The frontend calls it as a black box.

---

## Work Rules

- Read `BRAIN.md` before starting work that involves architectural choices or technology selection.
- Read `SASS_LEVELS.md` before changing sass prompts, sass routing, tone behavior, or related tests.
- Work on one component at a time unless explicitly told to do cross-cutting work.
- If a decision is needed, stop and ask.
- Owner (user) makes product/architecture/tone decisions. The agent must not decide these.
- Before creating or editing specs/docs that define behavior (for example sass definitions, architecture contracts, ADR-style notes), ask for approval first.
- after making changes, make sure to think if the docs need updating
- Present options and tradeoffs, then wait for explicit selection before implementing.
- Do not add features, abstractions, or "future-proofing" beyond what was asked. Ship the smallest working thing.
- No dependencies without explicit approval.

---

## Code Style

- Prefer explicit over clever. A 3-line if/else beats a dense ternary chain.
- Tests for the code you change, when a test harness exists. Do not create test infrastructure speculatively.
