# Tech Stack & Architecture — Escape the Hospital Lobby

> **Status:** Draft v1
> **Purpose:** The engineering blueprint — chosen technologies, project structure, systems, and cross-platform strategy. Read after [PRD.md](./PRD.md) and [GAME_DESIGN.md](./GAME_DESIGN.md).

---

## 1. Stack at a glance

| Concern | Choice | Rationale |
|---|---|---|
| Language | **TypeScript** | Type safety across a growing codebase; great tooling. |
| Rendering | **Three.js** | Mature WebGL2 3D engine, huge ecosystem, cross-platform. |
| Physics / controller | **Rapier** (`@dimforge/rapier3d-compat`, WASM) | Fast, deterministic 3D physics + kinematic character controller. *Alt: `cannon-es` (lighter, pure JS) if WASM/size is a concern.* |
| Bundler / dev server | **Vite** | Instant HMR, simple static build output. |
| Audio | **Howler.js** (or raw Web Audio) | Cross-browser sprites, spatial-ish audio, easy volume control. |
| UI / menus | **HTML/CSS overlay** (optional lightweight lib) | DOM UI over the canvas is simpler & more accessible than in-canvas UI. |
| Persistence | **`localStorage`** (wrapped) | No backend; saves progress/settings. |
| Hosting | **Static build → Vercel** | Zero-config static deploy; also works on any static host. |
| Package manager | npm (or pnpm) | Standard. |

> **Constraint:** the shipped build must be **self-contained** — bundle all JS/WASM/assets; **no runtime CDN dependencies**. This keeps offline play and CSP-friendliness intact.

## 2. Rendering & assets

- **Assets:** low-poly models in **glTF/GLB**; textures compressed (KTX2/Basis where practical). Keep per-level asset sets small; lazy-load per level.
- **Lighting:** mostly baked/ambient with a few dynamic lights (flashlight, flickering fluorescents). Avoid many real-time shadow casters on mobile.
- **Optimization:** `InstancedMesh` for repeated props (gurneys, tiles), frustum culling (default), merged static geometry, texture atlases, LODs where useful.

## 3. Cross-platform input

Abstract input behind a single `InputState` (move vector, look delta, jump, interact) so gameplay code is device-agnostic.

- **Desktop:** WASD/arrows, mouse look via **Pointer Lock**, Space = jump, E = interact, Esc = pause. Remappable.
- **Touch (mobile/tablet):** on-screen **virtual joystick** (left) + **jump/interact buttons** (right); look via right-thumb drag. Detect touch and swap HUD automatically.
- **Gamepad (later):** Gamepad API mapped to the same `InputState`.
- **Responsive canvas:** resize to viewport, cap **devicePixelRatio** (e.g., ≤2) on mobile; letterbox-free full-viewport.

## 4. Architecture

A small, explicit game architecture — no heavy framework.

```
main.ts                → boot, canvas, resize, main loop (fixed-step physics + render)
core/
  GameStateMachine     → Boot → Menu → LevelSelect → Playing → Paused → Reward
  Loop                 → fixed timestep update + interpolated render
  Input                → InputState + desktop/touch/gamepad sources
  Save                 → localStorage wrapper (progress, best times, settings)
  Audio                → Howler wrapper (music, sfx, captions hook)
  Settings             → quality preset, volume, sensitivity, a11y toggles
engine/
  Renderer             → Three.js scene, camera, lights, post
  Physics              → Rapier world, step, character controller
  CameraRig            → 3rd/1st person follow + collision
  Player               → controller, jump (coyote time + buffer), respawn
world/
  LevelManager         → load/unload level by id, checkpoints, exit trigger
  Level (interface)    → build(scene, physics), spawn, checkpoints[], hazards[], onExit()
  hazards/             → gap, movingPlatform, timingLight, laser, fan, breakable, water, chase…
  levels/              → level01..level15 (data-driven configs + optional scripts)
ui/
  HUD, Menu, LevelSelect, Pause, Settings, RewardScreen  (HTML/CSS overlay)
```

### Level model
Prefer **data-driven levels**: each level is a config (platform layout, hazard params, checkpoints, exit) plus optional per-level script hooks for special beats (e.g., chase in level 13). This makes 15 levels tractable and editable without bespoke code each time. A shared hazard library (see `world/hazards/`) is reused across levels per [LEVELS.md](./LEVELS.md).

### Game loop
Fixed-timestep physics (e.g., 60 Hz) with render interpolation for smoothness across variable frame rates; decouples feel from device fps.

### Save system
`Save` persists: `unlockedLevel`, `bestTimes[]`, `completed[]`, `collectibles`, `currentCheckpoint`, `settings`. Wrap `localStorage` with a versioned schema + safe migration/reset.

## 5. Performance strategy

- **Quality presets** (Low/Med/High): toggle shadow resolution, dynamic light count, DPR, post-processing, draw distance.
- **Auto-detect** tier on first run (rough heuristic) with manual override in Settings.
- Lazy-load level assets; dispose Three.js/Rapier resources on level unload to avoid leaks.
- Target 60 fps desktop, ≥30 fps mid mobile (see [PRD.md](./PRD.md#6-non-functional-requirements)).

## 6. Proposed project layout

```
/ (repo root)
  README.md
  AGENTS.md            → AI-agent entry point
  CLAUDE.md            → points to AGENTS.md
  /docs                → PRD, GAME_DESIGN, LEVELS, TECH_STACK, ROADMAP
  /public              → static assets served as-is (favicon, manifest)
  /src                 → TypeScript source (core/engine/world/ui as above)
  /assets              → glTF models, textures, audio (bundled)
  index.html
  package.json         → (created when code work begins)
  tsconfig.json
  vite.config.ts
  vercel.json / vercel.ts (optional)
```

## 7. Build & deploy

- `npm run dev` → Vite dev server (HMR).
- `npm run build` → static bundle in `dist/`.
- **Deploy:** push to Vercel (framework preset: **Other / static**, output `dist`), or any static host / GitHub Pages. No server runtime required.

## 8. Testing & QA

- **Unit:** pure logic (save schema, input mapping, jump/coyote math) with Vitest.
- **Manual matrix:** Chrome/Edge/Firefox/Safari × desktop/mobile; low-end phone perf pass.
- **Playtest:** each level completable on touch; difficulty spikes vs. [LEVELS.md](./LEVELS.md) targets.

## 9. Decisions left open
- **Physics engine:** Rapier (recommended) vs. cannon-es (lighter). Confirm before scaffolding.
- **UI approach:** plain HTML/CSS overlay (recommended) vs. a small UI lib.
- **PWA/offline** packaging: v1 nice-to-have, defer unless requested.
