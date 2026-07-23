# Phase 5 — Radiology

> **Status:** 📐 Designed, not yet built.
> **Act:** I — "Routine". **Difficulty context:** first hazard with a wide, room-spanning
> sweep that must be read from a distance rather than reacted to at the last second.

## Premise
The equipment still has power — someone kept it running.
([LORE.md](../LORE.md#7-introoutro-scripts))

## Flow
Control Room (spawn) → corridor → Scanner Hall (the sweeping scanner arm) → Film Archive
(side room, optional) → corridor → exit.

## Reference layout
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Control Room | 6 → -8 | 14×14 | spawn (0,1.4,6); observation windows into the Scanner Hall |
| Corridor | -8 → -18 | width 4 | |
| Scanner Hall | -18 → -70 | 22×52 | long room; the rotating scanner arm sweeps its full length |
| Film Archive (side room) | branch at x=11, z=-40 | 10×12 | optional detour; a lore note (see [LORE.md §6](../LORE.md#6-collectible-lore-items)) |
| Corridor | -70 → -82 | width 4 | |
| Exit room | -82 → -96 | 12×14 | exit door at z=-94 |

**Total span:** ~100 m · **Target clear time:** 2:30–3:00.

## Hazards & puzzle
- **Rotating scanner arm** — a long `sweepingHazard` spanning most of the Scanner Hall's width,
  sweeping end-to-end on a slow, readable period (~6s) so the *rule* (watch it, time your run)
  is learnable at a distance, unlike Pharmacy's close-range tripwires.
- Portable screens/equipment racks (`crate`) scattered as brief cover from the arm's sweep and
  from enemy line-of-sight simultaneously — the first wing where one prop serves both purposes.
- No lock/key puzzle here — pure timing, a breather between Pharmacy's puzzle and Morgue's
  footing challenge.

## Enemy behavior
Patrols the Scanner Hall's length, timed to *not* always match the arm's sweep — sometimes the
safe moment to dash past the arm is exactly when the enemy is closest, forcing a real choice.

## Checkpoints & exit
- Checkpoint lines: corridor entry (z≈-8), Scanner Hall midpoint (z≈-44), exit corridor
  (z≈-72).
- Exit: unlocked.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): a maintenance log shows
scheduled equipment upkeep continuing years past the hospital's official closure date.
