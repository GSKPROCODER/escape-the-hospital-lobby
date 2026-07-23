# Level Specification — Escape the Hospital Lobby

> **Status:** Draft v3 — all **15 phases now have a full, dedicated design doc** in
> [`docs/levels/`](./levels/). This file is the **index and shared design language**; each
> phase's own doc has its complete flow, reference layout, hazards, enemy behavior, checkpoints,
> and narrative tie-in.
> **Purpose:** Per-level design so an implementer (human or AI) can build each wing. Read
> [GAME_DESIGN.md](./GAME_DESIGN.md) first for shared mechanics, [LORE.md](./LORE.md) for the
> story each wing is built around, and [SOUND_DESIGN.md](./SOUND_DESIGN.md) for its soundscape.

---

## Design language (every phase follows this)

- **Win condition:** *Survive and reach the exit.* The "Presence" hunts you; a run-timer counts up.
- **Floors are continuous** across all enemy-reachable space (rooms joined by corridors/doorways),
  so the ground-navigating enemy never meets a pit. The enemy also has **ledge-avoidance**.
- **Challenge without bottomless pits:** climb-over furniture, **timed auto-doors**, **sweeping
  hazards**, **hazard tiles** (spill/laser/steam — touch → respawn) on solid floor, slippery/sticky
  floor, and **key/lever** puzzles. Missing a jump means landing on the floor, not dying.
- **Checkpoints are crossing lines**, not spots to stand on: `playerPos.z <= trigger.z` activates
  a checkpoint at any x/height — off-center or mid-air both count (see
  [BETTERMENT.md §3.1](../BETTERMENT.md#31-checkpoints-require-standing-on-a-spot--must-become-automatic-crossing-lines)).
- **Death:** checkpoint respawn (unlimited on Easy). On Normal/Nightmare an enemy catch costs a
  life; falls/hazards just respawn. Difficulty scales enemy sight/speed/persistence + lives
  (see [Difficulty.ts](../src/core/Difficulty.ts)); the enemy resets to the patrol point
  furthest from the player's respawn, never on top of them.
- **Enemy:** patrols the main floor path, hunts on sight (walls block line-of-sight) and sound
  (sprinting/landing), loses you around corners. Spawns **away** from the player for a fair
  start. Escalates across the three acts per [LORE.md §4](./LORE.md#4-the-presence).
- **Scale target** (per [BETTERMENT.md §3.3](../BETTERMENT.md#33-levels-are-far-too-small)):
  ~80–110 m per wing, 4–6 distinct rooms, at least one loop/alternate route, 2:30–4:00
  first-clear time. Wings 1–3 predate this correction and are documented as-built with the gap
  noted; Wings 4–15 are designed to this target from the start.

Built with a small kit (`src/world/kit.ts`): `room`, `corridorZ`, `crate`, `hazardTile`,
`sweepingHazard`, `autoDoor`, `keycardAt`, `exitDoor`, `checkpointStrip`, `sign`, `wheelchair`,
`light`. Phases 7 (vertical stairwell) and others introduce a few new primitives noted in their
own docs (e.g. a `ramp()`/`stairs()` helper — see [BETTERMENT.md §5.2](../BETTERMENT.md)).

---

## Overview

| # | Wing | Act | Signature hazard / puzzle | Enemy | Status | Doc |
|---|------|-----|---------------------------|-------|--------|-----|
| 1 | Reception Wing | I | climb-over desk & seats; sweeping spark pole; spill tile | patrols waiting room | ✅ built | [01-reception-wing.md](./levels/01-reception-wing.md) |
| 2 | Records Room | I | find the keycard to unlock the exit | stalks the aisles | ✅ built | [02-records-room.md](./levels/02-records-room.md) |
| 3 | Ward A | I | two timed sliding auto-doors | hunts across bays | ✅ built | [03-ward-a.md](./levels/03-ward-a.md) |
| 4 | Pharmacy | I | laser tripwires; meds key; risk/speed loop | patrols, biases the risky loop | 📐 designed | [04-pharmacy.md](./levels/04-pharmacy.md) |
| 5 | Radiology | I | rotating scanner arm (long, readable sweep) | patrols the hall | 📐 designed | [05-radiology.md](./levels/05-radiology.md) |
| 6 | The Morgue | I→II | slippery floor; sliding drawers as cover | slower (cold) | 📐 designed | [06-the-morgue.md](./levels/06-the-morgue.md) |
| 7 | Stairwell | II | vertical progression; switchback flights | follows up the flights | 📐 designed | [07-stairwell.md](./levels/07-stairwell.md) |
| 8 | Ventilation | II | branching crawl-maze; wall fans | short sightlines only | 📐 designed | [08-ventilation.md](./levels/08-ventilation.md) |
| 9 | Operating Theatre | II | moving carts; lamp sweep reveals you | near-silent ambience | 📐 designed | [09-operating-theatre.md](./levels/09-operating-theatre.md) |
| 10 | Flooded Basement | II | shallow water; timed sluice gate | wades slowly (favors player) | 📐 designed | [10-flooded-basement.md](./levels/10-flooded-basement.md) |
| 11 | Boiler Room | III | steam-jet bursts; the Incident explained | actively hunts from entry | 📐 designed | [11-boiler-room.md](./levels/11-boiler-room.md) |
| 12 | Security Wing | III | dense laser grid + 3 breakers | actively hunts | 📐 designed | [12-security-wing.md](./levels/12-security-wing.md) |
| 13 | Quiet Ward | III | pure stealth; pillar sightline maze | most aggressive standard config | 📐 designed | [13-quiet-ward.md](./levels/13-quiet-ward.md) |
| 14 | Generator Room | III | 3-bay power puzzle (steam/spark/gate) | intercepts the last bay | 📐 designed | [14-generator-room.md](./levels/14-generator-room.md) |
| 15 | Main Exit Gauntlet | III | synthesis of every hazard; scripted chase | relentless (Nightmare floor) | 📐 designed | [15-main-exit-gauntlet.md](./levels/15-main-exit-gauntlet.md) |

Clearing **Phase 15** triggers the escape + reward sequence
([GAME_DESIGN.md §11](./GAME_DESIGN.md#11-reward-reward), endings in
[LORE.md §7](./LORE.md#7-introoutro-scripts)).

---

## Open questions (for the designer)
- Confirm the difficulty tuning (Easy/Normal/Nightmare enemy + lives) feels right per wing,
  especially the wing-specific overrides (Morgue slower, Quiet Ward more aggressive, Phase 15's
  Nightmare-floor).
- Wings 1–3 are undersized relative to the corrected scale target — worth a revisit pass once
  4–15 are built, so the whole game reads consistently (BETTERMENT §3.3).
- Any wings to reorder, retheme, or add?
