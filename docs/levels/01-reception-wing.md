# Phase 1 — Reception Wing

> **Status:** ✅ Built — `src/world/levels/level01.ts`.
> **Act:** I — "Routine" ([LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings)). **Difficulty context:** the tutorial wing — teaches movement, the checkpoint system, and first contact with the Presence.

## Premise
You wake up with no memory of arriving. The doors are sealed behind you. Somewhere in this
building, the lights still work. ([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow (as built)
Lobby (spawn, z=6) → corridor → Waiting Room → corridor → Supply Room → corridor → Exit Foyer
(unlocked exit door).

## Reference layout (as built)
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Lobby | 10 → -4 | 16×14 | spawn (0,1.4,6); reception desk (climb-over); wheelchair prop |
| Corridor 1 | -4 → -21 | width 4 | |
| Waiting Room | -21 → -41 | 20×20 | 6 climb-over seat blocks; flickering light; sweeping spark pole |
| Corridor 2 | -41 → -57 | width 4 | spill hazard tile off-center at x=1.2 (walk left/center, not right) |
| Supply Room | -57 → -71 | 16×14 | crate "staircase" to climb; second spill hazard |
| Corridor 3 | -71 → -86 | width 4 | |
| Exit Foyer | -86 → -98 | 14×12 | unlocked exit door at z=-97.7 |

**Total span:** ~108 m · widened from the original ~55 m/25 s layout
([BETTERMENT.md §3.3](../../BETTERMENT.md#33-levels-are-far-too-small) — now ✅ fixed).

## Hazards & puzzle
- Climb-over furniture: reception desk (lobby), 6 seat blocks (waiting room), a 3-crate
  "staircase" (supply room).
- **Sweeping spark pole** — `sweepingHazard` crossing the Waiting Room, period 3.6s, x: -9↔9.
- **Spill tiles** — `hazardTile` in corridor 2 (off-center, avoidable by walking anywhere left
  of center) and in the Supply Room (centered, but inside an open room with room to go around).
  Both now show diagonal hazard-stripe warning texture and pulse automatically.

## Enemy behavior
Spawns at (0, 1.4, -31) — inside the Waiting Room, so the Lobby start is always safe. Patrols
a 5-point loop spanning the Waiting Room through Corridor 2 into the Supply Room, so tension
persists across the back half of the wing too, not just the first encounter. Standard
patrol/chase config (no wing-specific modifier).

## Checkpoints & exit
- Checkpoint lines (crossing, any x/height): z=-21, z=-41, z=-57, z=-86.
- Exit: unlocked door at z=-97.7 — no gate condition.

## Narrative tie-in
[LORE.md Act I](../LORE.md#5-three-act-structure-across-the-15-wings): the visitor sign-in
sheet's last entry, dated the night of the Incident, never continues — the first hint that
this is not a normal abandoned building.
