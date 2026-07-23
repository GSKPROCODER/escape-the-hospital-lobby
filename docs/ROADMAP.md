# Build Roadmap — Escape the Hospital Lobby

> **Status:** Draft v1
> **Purpose:** The phased engineering plan for **when code work begins**. Turns the docs into an ordered task list an AI agent or developer can execute. Maps to the milestones in [PRD.md](./PRD.md#9-milestones-product-level).

---

## How to use this
Work top-to-bottom. Each phase has a **Definition of Done (DoD)**. Do not start a later phase until the earlier DoD is met. Reference [TECH_STACK.md](./TECH_STACK.md) for architecture and [LEVELS.md](./LEVELS.md) for level content.

---

## Phase 0 — Project scaffold
- Init Vite + TypeScript project, ESLint/Prettier, Vitest.
- Add Three.js, Rapier (`@dimforge/rapier3d-compat`), Howler.
- Set up `src/` structure per [TECH_STACK.md](./TECH_STACK.md#4-architecture); blank canvas renders.
- **DoD:** `npm run dev` shows a Three.js scene; `npm run build` outputs `dist/`.

## Phase 1 — Playable core (→ PRD M1)
- Main loop (fixed-step physics + interpolated render).
- Renderer + camera rig (third-person follow, collision-aware).
- Rapier world + **character controller**: move, gravity, jump (coyote time + jump buffer), capsule collision.
- Desktop input (WASD + pointer-lock look + space).
- **Greybox Level 1** (Reception Wing) with start/exit + fall-respawn.
- **DoD:** you can run, jump, fall, respawn, and reach an exit in a greybox level on desktop.

## Phase 2 — Level framework & UX (→ PRD M2)
- `LevelManager` + data-driven `Level` interface; checkpoints; exit trigger → next level.
- `Save` system (localStorage): unlocked level, checkpoint, best time, settings.
- **Touch controls**: virtual joystick + jump/interact; auto-detect device.
- Menus (HTML overlay): Title (Play/Continue), Level Select, Pause, Settings (audio/sensitivity/quality/a11y).
- HUD: level name, timer, interact prompt.
- **DoD:** full menu→level→checkpoint→save→resume flow works on **desktop and mobile**; one level polished.

## Phase 3 — Hazard library
- Implement reusable hazards: gap, moving platform, timing-light, laser, rotating fan, breakable floor, rising water, chase controller, surface modifiers (slippery), interact/key.
- Each hazard: visual + audio + accessible (shape/caption) cue; deterministic respawn.
- **DoD:** each hazard demonstrable in a test scene and configurable by data.

## Phase 4 — Content complete (→ PRD M3)
- Build **all 15 levels** from [LEVELS.md](./LEVELS.md) as greybox using the hazard library.
- Tune each level to its target time & difficulty; verify **touch-completable**.
- Art pass: apply low-poly hospital assets, lighting, ambience per [GAME_DESIGN.md](./GAME_DESIGN.md).
- **DoD:** all 15 levels playable start→finish; progression unlocks correctly.

## Phase 5 — Reward & polish (→ PRD M4)
- Level 15 escape **cutscene** + **reward screen** (Certificate of Escape, cosmetic unlock, shareable card).
- Audio pass (music, stingers, captions), feedback polish (checkpoint/death/clear).
- Settings completeness (remap keys, reduced-motion, first/third person).
- **DoD:** finishing level 15 triggers escape + reward; game feels cohesive.

## Phase 6 — Cross-platform QA & launch (→ PRD M5)
- Test matrix: Chrome/Edge/Firefox/Safari × desktop/mobile/tablet.
- Performance tuning: quality presets, DPR caps, asset budgets; hit fps targets.
- Fix funnel/difficulty spikes from playtests.
- Deploy static build to **Vercel**.
- **DoD:** meets [PRD.md](./PRD.md#6-non-functional-requirements) non-functional targets; live URL.

## Later (post-v1)
- Collectibles tier, gamepad support, leaderboards, PWA/offline, speedrun/NG+ mode, more level packs.

---

## Suggested first task for an AI agent
> Start at **Phase 0**, then **Phase 1**. Produce a running desktop greybox of Level 1 with a working jump controller before touching content. Confirm stack choices in [TECH_STACK.md §9](./TECH_STACK.md#9-decisions-left-open) with the user if unset.
