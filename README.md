# 🏥 Escape the Hospital Lobby

A horror-themed **3D escape lobby** for the web. You wake up trapped in an abandoned, haunted hospital and must clear **15 unique levels** — each a distinct obstacle, hazard, or puzzle — to reach the exit, **escape**, and claim a **special reward**. Plays in any modern browser, on **desktop and mobile**, with no install and no login.

> **Status:** 📄 **Documentation phase.** This repo currently contains the full design/spec docs only — **no game code yet**. The docs below are written to be picked up by an AI coding agent (Claude Code, Google Antigravity, Cursor, …) or a developer to build the game.

<!-- screenshot / gif placeholder -->
`[ screenshot coming once the game is built ]`

## 🤖 For AI agents
**Start with [AGENTS.md](./AGENTS.md)** — it defines the mission, reading order, hard constraints, and Definition of Done. (`CLAUDE.md` points there too.)

## 📚 Documentation

| Doc | What it covers |
|---|---|
| [AGENTS.md](./AGENTS.md) | AI-agent entry point: mission, rules, workflow. |
| [docs/PRD.md](./docs/PRD.md) | Product Requirements — what/why, scope, requirements, metrics. |
| [docs/GAME_DESIGN.md](./docs/GAME_DESIGN.md) | Game Design — theme, core loop, movement, camera, reward. |
| [docs/LEVELS.md](./docs/LEVELS.md) | Full spec for all **15 levels**. |
| [docs/TECH_STACK.md](./docs/TECH_STACK.md) | Stack, architecture, project layout, deploy. |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Phased build plan (start of engineering work). |
| [docs/SOUND_DESIGN.md](./docs/SOUND_DESIGN.md) | Full horror sound bible — pillars, mix, per-wing soundscapes, sourcing. |
| [docs/LORE.md](./docs/LORE.md) | Story bible — the Incident, the Presence, per-wing beats, collectible notes. |
| [BETTERMENT.md](./BETTERMENT.md) | Critic evaluation of the current build + prioritized improvement spec. |

## 🕹️ At a glance
- **Genre:** 3D escape / obstacle course (lobby), horror-lite.
- **Levels:** 15, escalating difficulty, ending in an escape + reward.
- **Platforms:** desktop & mobile browsers (WebGL2). No account required.
- **Planned stack:** TypeScript · Three.js · Vite · Rapier (physics) · Howler (audio).
- **Hosting:** static build → Vercel (or any static host).

## 🎯 Core experience
Trapped → clear 15 levels (checkpoints keep it fair) → escape the hospital → **special reward**.

---
*Design proposals (exact level arc and the reward specifics) are flagged as “proposed” in the docs and open to change — see [docs/LEVELS.md](./docs/LEVELS.md#open-design-questions-for-user).*
