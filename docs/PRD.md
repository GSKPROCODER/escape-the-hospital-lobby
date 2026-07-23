# PRD — Escape the Hospital Lobby

> **Status:** Draft v1
> **Purpose:** Defines *what* we are building and *why*. The source of truth for scope and requirements. Read this first, then [GAME_DESIGN.md](./GAME_DESIGN.md) and [LEVELS.md](./LEVELS.md).

---

## 1. Vision

A browser-playable, horror-themed **3D escape lobby** (obstacle course). The player wakes up trapped inside an abandoned, haunted hospital and must clear **15 distinct levels** — each a self-contained challenge, obstacle, or puzzle — to reach the exit and earn a **special final reward**.

The experience should be **immediately playable in any modern browser** on desktop, tablet, and phone, with **no install and no login**. Tension, atmosphere, and a satisfying sense of progress are the emotional targets — "horror-lite": spooky and thrilling, not gory.

## 2. Goals & Non-Goals

### Goals
- 15 unique, escalating levels ending in an escape + reward.
- True cross-platform web play (desktop keyboard/mouse **and** mobile touch).
- Smooth performance on mid-range hardware.
- Persistent progress so players can resume where they left off.
- Self-contained static build (deployable to any static host / Vercel).

### Non-Goals (v1)
- Multiplayer / online leaderboards.
- User accounts, monetization, or in-app purchases.
- Level editor / user-generated content.
- Native mobile app packaging.

## 3. Target Audience & Platforms

| Audience | Notes |
|---|---|
| Casual & teen+ web gamers | Enjoy Roblox-style obbies and light horror. |
| Mobile browser players | Must be fully playable one-handed-ish with touch controls. |

**Platforms (v1):** Chrome, Edge, Firefox, Safari — desktop and mobile. Tablet supported. Requires WebGL2.

## 4. Core Player Journey

1. **Land** → title screen → Play (or Continue).
2. **Trapped** → short intro sets the scene inside the hospital.
3. **Progress** → clear levels 1–15, each unlocking the next; checkpoints reduce frustration.
4. **Escape** → clear level 15's exit gauntlet.
5. **Reward** → escape cutscene + special reward screen (see [GAME_DESIGN.md](./GAME_DESIGN.md#reward)).
6. **Replay** → level select to revisit any unlocked level / beat personal times.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| F1 | 15 playable levels, each with a distinct objective/obstacle/puzzle | Must |
| F2 | Sequential unlock: completing level N unlocks N+1 | Must |
| F3 | In-level checkpoints; falling/dying respawns at last checkpoint | Must |
| F4 | Save & resume progress (unlocked levels, checkpoints, best times) | Must |
| F5 | Main menu, level select, pause menu, settings | Must |
| F6 | Desktop controls: WASD/arrows + mouse look (pointer lock) + space to jump | Must |
| F7 | Mobile controls: on-screen virtual joystick + jump/action buttons | Must |
| F8 | Settings: audio volume, mouse/touch sensitivity, graphics quality preset | Must |
| F9 | Final escape cutscene + special reward screen with shareable result | Must |
| F10 | Timer per level + best-time tracking | Should |
| F11 | Collectibles (e.g., hidden hospital "keys"/notes) for extra reward tier | Could |
| F12 | Gamepad support | Could |

## 6. Non-Functional Requirements

- **Performance:** target 60 fps desktop, ≥30 fps mid-range mobile. Adaptive quality presets.
- **Load budget:** first meaningful interaction < 5s on broadband; assets streamed/lazy-loaded per level where feasible.
- **Offline:** playable after first load (cache assets; PWA optional).
- **Accessibility:** remappable desktop keys, adjustable sensitivity, colorblind-safe hazard cues (shape + color), captions/subtitles for important audio cues, reduced-motion option.
- **No login / no PII collected.** Progress stored locally in the browser.
- **Cross-platform parity:** every level must be completable on both desktop and touch.

## 7. Success Metrics

- **Level 1 → completion funnel** (drop-off per level identifies difficulty spikes).
- **% of players reaching the reward** (target: healthy tutorial completion, gradual tail).
- **Median session length** and **return/continue rate**.
- **Crash/error rate** and **average fps** by device tier (telemetry optional, privacy-safe).

## 8. Scope: v1 vs. Later

- **v1:** F1–F10, all non-functional requirements.
- **Later:** collectibles tier (F11), gamepad (F12), leaderboards, PWA/offline packaging, more levels/themes.

## 9. Milestones (product-level)

See [ROADMAP.md](./ROADMAP.md) for the engineering breakdown.

1. **M1 — Playable Core:** engine + character controller + one greybox level.
2. **M2 — Level Framework:** checkpoints, save/resume, menus, one polished level.
3. **M3 — Content Complete:** all 15 levels playable (greybox → art pass).
4. **M4 — Reward & Polish:** escape sequence, reward, audio, UX polish.
5. **M5 — Cross-platform QA & Launch:** device/browser testing, performance tuning, deploy.
