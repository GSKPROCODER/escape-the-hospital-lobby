# 🏥 Escape the Hospital Lobby

A horror-themed **3D escape lobby** for the web. You wake up trapped in an abandoned, haunted hospital and must clear **15 unique levels** — each a distinct obstacle, hazard, or puzzle — to reach the exit, **escape**, and claim a **special reward**. Plays in any modern browser, on **desktop and mobile**, with no install and no login.

> **Status:** 🎮 **Playable vertical slice, live at [escape-the-hospital-lobby.vercel.app](https://escape-the-hospital-lobby.vercel.app).**
> Phases 1–3 are built and playable (menus, settings, difficulty, an AI hunter, save/progression).
> Phases 4–15 have complete design docs in [`docs/levels/`](./docs/levels/) ready to build from.
> See [BETTERMENT.md](./BETTERMENT.md) for an honest critic pass on the current build and the
> prioritized roadmap of what's next.

## 🤖 For AI agents
**Start with [AGENTS.md](./AGENTS.md)** — it defines the mission, reading order, hard constraints, and Definition of Done. (`CLAUDE.md` points there too.)

## 📚 Documentation

| Doc | What it covers |
|---|---|
| [AGENTS.md](./AGENTS.md) | AI-agent entry point: mission, rules, workflow. |
| [docs/PRD.md](./docs/PRD.md) | Product Requirements — what/why, scope, requirements, metrics. |
| [docs/GAME_DESIGN.md](./docs/GAME_DESIGN.md) | Game Design — theme, core loop, movement, camera, reward. |
| [docs/LEVELS.md](./docs/LEVELS.md) | Index + shared design language for all **15 levels** — see [docs/levels/](./docs/levels/) for each phase's full doc. |
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
*Open design questions (reward specifics, difficulty tuning, wing ordering) are tracked at the
end of [docs/LEVELS.md](./docs/LEVELS.md#open-questions-for-the-designer).*
