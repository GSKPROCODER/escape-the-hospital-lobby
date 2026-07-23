# Level Specification — Escape the Hospital Lobby

> **Status:** Draft v2 — redesigned around **enemy-safe rooms + corridors** (no bottomless pits).
> **Purpose:** Per-level design so an implementer (human or AI) can build each wing. Read
> [GAME_DESIGN.md](./GAME_DESIGN.md) first for shared mechanics.

---

## Design language (every level follows this)

- **Win condition:** *Survive and reach the exit.* The "Presence" hunts you; a run-timer counts up.
- **Floors are continuous** across all enemy-reachable space (rooms joined by corridors/doorways),
  so the ground-navigating enemy never meets a pit. The enemy also has **ledge-avoidance**.
- **Challenge without bottomless pits:** climb-over furniture, **timed auto-doors**, **sweeping
  hazards**, **hazard tiles** (spill/laser/steam — touch → respawn) on solid floor, slippery/sticky
  floor, and **key/lever** puzzles. Missing a jump means landing on the floor, not dying.
- **Death:** checkpoint respawn (unlimited on Easy). On Normal/Nightmare an enemy catch costs a
  life; falls/hazards just respawn. Difficulty scales enemy sight/speed/persistence + lives.
- **Enemy:** patrols the main floor path, hunts on sight (walls block line-of-sight) and sound
  (sprinting/landing), loses you around corners. Spawns **away** from the player for a fair start.

Built with a small kit (`src/world/kit.ts`): `room`, `corridorZ`, `crate`, `hazardTile`,
`sweepingHazard`, `autoDoor`, `keycardAt`, `exitDoor`, `light`.

**Build status:** ✅ Levels **1–3 built**. Levels 4–15 are designed below and follow the same
template (Level Select shows them as "Soon" until built).

---

## Overview

| # | Wing | Flow (rooms → exit) | Signature hazard / puzzle | Enemy | Status |
|---|------|---------------------|---------------------------|-------|--------|
| 1 | **Reception Wing** | Lobby → corridor → Waiting Room → corridor → Exit Foyer | climb-over desk & seats; **sweeping spark pole**; spill tile | patrols waiting room | ✅ built |
| 2 | **Records Room** | Foyer → filing-cabinet aisles → archive exit | **find the keycard** on a shelf to unlock the exit | stalks the aisles | ✅ built |
| 3 | **Ward A** | Nurse station → bed-bay 1 → bed-bay 2 → ward exit | **timed sliding auto-doors**; spilled-chem tiles | hunts across bays | ✅ built |
| 4 | Pharmacy | corridor → dispensary → store exit | **laser tripwires** (duck/jump); grab meds key | patrols | design |
| 5 | Radiology | control room → scanner hall → exit | rotating **scanner arm** (timing); screens as cover | patrols hall | design |
| 6 | The Morgue | prep → cold storage → freezer exit | **slippery floor**; sliding drawers as moving cover | slower (cold) | design |
| 7 | Stairwell | switchback landings up 3 floors → door | climb floored **landings**; ledge-safe rails | follows up ramps | design |
| 8 | Ventilation | duct room → crawl maze → grate exit | **wall fans** (touch→respawn); low crawl gaps | short sightlines | design |
| 9 | Operating Theatre | scrub room → theatre → recovery exit | moving **equipment carts** (timing); lamp sweep | patrols theatre | design |
| 10 | Flooded Basement | stairs → flooded hall → pump-room exit | shallow water slows; **timed sluice gate** | wades slowly | design |
| 11 | Boiler Room | pipe corridor → boiler hall → exit | **steam-jet** bursts (timing); climb-over pipes | patrols hall | design |
| 12 | Security Wing | lobby → camera grid → control exit | **laser grid** + hit 3 breakers to open the door | actively hunts | design |
| 13 | Quiet Ward | dim ward of pillars → exit | **stealth**: break line-of-sight; faster enemy | aggressive | design |
| 14 | Generator Room | 3 hazard bays → restore power → exit | multi-lever **power puzzle** gated by hazards | patrols bays | design |
| 15 | Main Exit Gauntlet | connected wings → front doors → **escape** | synthesis of all hazards; final chase | relentless | design |

Clearing **Level 15** triggers the escape + reward (framework now; full reward later).

---

## Built levels (as implemented)

### Level 1 — Reception Wing  `src/world/levels/level01.ts`
- **Flow:** Lobby (spawn) → corridor → Waiting Room → corridor → Exit Foyer (exit door).
- **Hazards:** reception desk & waiting-room seats to climb over; a **spark pole** sweeping across
  the waiting room (time your crossing); a **spill tile** in the second corridor (pass on the left).
- **Enemy:** spawns in/near the waiting room and patrols it — the lobby start is safe.
- **Checkpoints:** corridor entrance, waiting room, foyer entrance. **Exit:** unlocked door.

### Level 2 — Records Room  `src/world/levels/level02.ts`
- **Flow:** entry foyer → records room of filing-cabinet aisles → locked archive exit.
- **Puzzle:** the exit is **locked** — find the glowing **keycard** on the east shelf (climb the
  shelf crate) to unlock it. Objective text updates once collected.
- **Enemy:** patrols the aisles, using cabinets to break/gain line-of-sight.
- **Hazards:** a spill tile near the exit approach.

### Level 3 — Ward A  `src/world/levels/level03.ts`
- **Flow:** nurse station → bed-bay 1 → bed-bay 2 → ward exit, through **two timed auto-doors**.
- **Hazards:** sliding auto-doors (cross while open, offset timing between them); spilled-chemical
  hazard tiles to weave around; beds to climb.
- **Enemy:** starts deep in bay 2 and hunts forward across the bays.

---

## Open questions (for the designer)
- Confirm the difficulty tuning (Easy/Normal/Nightmare enemy + lives) feels right per wing.
- Any wings to reorder, retheme, or add before the remaining 4–15 are built?
- Final **reward** at Level 15 (see [GAME_DESIGN.md](./GAME_DESIGN.md#reward)).
