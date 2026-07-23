# Phase 1 — Reception Wing

> **Status:** ✅ Built — `src/world/levels/level01.ts` (see [BETTERMENT.md §3.3](../../BETTERMENT.md#33-levels-are-far-too-small) for the sizing caveat below).
> **Act:** I — "Routine" ([LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings)). **Difficulty context:** the tutorial wing — teaches movement, the checkpoint system, and first contact with the Presence.

## Premise
You wake up with no memory of arriving. The doors are sealed behind you. Somewhere in this
building, the lights still work. ([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow (as built)
Lobby (spawn, z=6) → corridor → Waiting Room → corridor → Exit Foyer (unlocked exit door).

## Reference layout (as built)
| Room/corridor | Center z | Size | Notes |
|---|---|---|---|
| Lobby | z=3 | 16×14 | spawn (0,1.4,6); reception desk (climb-over); wheelchair prop |
| Corridor 1 | z=-4..-14 | width 4 | links lobby → waiting room |
| Waiting Room | z=-20 | 14×12 | 4 climb-over seat rows; flickering light |
| Corridor 2 | z=-26..-35 | width 4 | spill hazard tile at x=1 (pass left) |
| Exit Foyer | z=-40 | 12×10 | unlocked exit door at z=-44.7 |

> **Known gap (BETTERMENT §3.3):** this wing is ~55 m, clearable in ~25 s — well under the
> 2:30–4:00 target the rest of this document uses for Wings 4–15. Widening it (bigger Waiting
> Room, a second loop route around the corridor) is a good first candidate when revisiting
> built content, but is **out of scope for this doc pass** (design-only for 4–15).

## Hazards & puzzle
- Climb-over furniture: reception desk (lobby), 4 seat blocks (waiting room).
- **Sweeping spark pole** — `sweepingHazard` crossing the waiting room, period 3.2s, x: -5↔5.
- **Spill tile** — `hazardTile` at (1, -30), 2×3 — skirt to the left (x<0).

## Enemy behavior
Spawns at (0, 1.4, -20) — inside the Waiting Room, so the Lobby start is always safe. Patrols
a 4-point loop around the room: (0,-20)→(-4,-22)→(0,-30)→(4,-22). Standard patrol/chase config
(no wing-specific modifier).

## Checkpoints & exit
- Checkpoint lines (crossing, any x/height): z=-6, z=-18, z=-35.
- Exit: unlocked door at z=-44.7 — no gate condition.

## Narrative tie-in
[LORE.md Act I](../LORE.md#5-three-act-structure-across-the-15-wings): the visitor sign-in
sheet's last entry, dated the night of the Incident, never continues — the first hint that
this is not a normal abandoned building.
