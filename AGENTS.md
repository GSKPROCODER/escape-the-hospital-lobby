# AGENTS.md — AI Agent Guide for *Escape the Hospital Lobby*

> **Read this first.** This file is the canonical entry point for any AI coding agent — **Claude Code, Google Antigravity, Cursor, Copilot, Windsurf**, etc. It tells you what to build, in what order to read the specs, and the hard rules you must follow.
>
> (`CLAUDE.md` at the repo root points here. Same content applies to any agent.)

---

## Mission

Build **Escape the Hospital Lobby**: a horror-themed **3D escape lobby** for the browser. The player is trapped in an abandoned hospital and must clear **15 unique levels** to escape and earn a final reward. It must run **cross-platform on the web** (desktop keyboard/mouse **and** mobile touch), with **no install and no login**.

> **Current repo state:** documentation only. No game code exists yet. Your job (when asked to build) is to implement it from these docs.

## Read the docs in this order
1. **[docs/PRD.md](./docs/PRD.md)** — what we're building & why; requirements and scope.
2. **[docs/GAME_DESIGN.md](./docs/GAME_DESIGN.md)** — how it plays; theme, movement, camera, feedback, reward.
3. **[docs/LEVELS.md](./docs/LEVELS.md)** — exact spec for all 15 levels.
4. **[docs/TECH_STACK.md](./docs/TECH_STACK.md)** — stack, architecture, project layout.
5. **[docs/ROADMAP.md](./docs/ROADMAP.md)** — the phased build order. **Start here for tasks.**

## Hard constraints (do not violate)
- **Stack:** TypeScript + **Three.js** (WebGL2), **Vite** bundler, **Rapier** physics/controller, Howler/Web Audio. Confirm the open choices in [TECH_STACK.md §9](./docs/TECH_STACK.md#9-decisions-left-open) before scaffolding if the user hasn't.
- **Cross-platform:** every level must be completable on **both desktop and touch**. Never ship a desktop-only interaction.
- **Self-contained build:** bundle all JS/WASM/assets. **No runtime CDN dependencies** (offline & CSP friendly).
- **No backend, no accounts, no PII.** Progress lives in `localStorage`.
- **Accessibility is a requirement, not a nice-to-have:** hazards use color **+** shape/animation; captions for key audio; remappable keys; reduced-motion option.
- **Data-driven levels:** build a reusable hazard library and express the 15 levels as configs/scripts — don't hand-code each level from scratch.

## Definition of Done (v1)
- All 15 levels playable, sequential unlock, checkpoints, save/resume.
- Desktop + mobile controls, menus, settings, timers/best-times.
- Level 15 → escape cutscene + reward screen.
- Meets performance & accessibility targets in [docs/PRD.md](./docs/PRD.md#6-non-functional-requirements).
- Builds to a static `dist/` and deploys to Vercel.

## Coding conventions (when code work begins)
- TypeScript strict mode; clear module boundaries per [TECH_STACK.md](./docs/TECH_STACK.md#4-architecture).
- Keep gameplay device-agnostic via a single `InputState` abstraction.
- Fixed-timestep physics + interpolated render; dispose Three.js/Rapier resources on level unload.
- Small, focused modules; reuse the hazard library across levels.
- Unit-test pure logic (save schema, input mapping, jump math) with Vitest.

## Workflow expectation
- Follow [docs/ROADMAP.md](./docs/ROADMAP.md) phase order; respect each phase's Definition of Done before advancing.
- When a design detail is ambiguous, prefer the docs; if still unclear, ask the user rather than guessing on **level design** or the **reward** (these are opinion-driven and flagged as *proposed*).
