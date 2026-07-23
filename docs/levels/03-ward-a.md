# Phase 3 — Ward A

> **Status:** ✅ Built — `src/world/levels/level03.ts`.
> **Act:** I — "Routine". **Difficulty context:** first timed-mechanism gauntlet (three auto-doors
> in sequence, each offset in phase); teaches reading a cycle and committing to a crossing.

## Premise
The beds are still made. Someone expected to come back.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow (as built)
Nurse Station (spawn, z=6) → corridor + auto-door 1 → Bed Bay 1 → corridor + auto-door 2
(offset timing) → Bed Bay 2 → corridor + auto-door 3 (third offset) → Bed Bay 3 / Recovery
Ward → ward exit.

## Reference layout (as built)
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Nurse Station | 9 → -1 | 14×10 | spawn (0,1.4,6) |
| Corridor + door 1 | -1 → -17 | width 4 | `autoDoor` at z=-15, period 5s, phase 0 |
| Bed Bay 1 | -17 → -35 | 14×18 | 2 beds to climb; central spill hazard |
| Corridor + door 2 | -35 → -51 | width 4 | `autoDoor` at z=-49, period 5s, phase 0.5 |
| Bed Bay 2 | -51 → -67 | 14×16 | 2 beds; 2 spill hazards |
| Corridor + door 3 | -67 → -82 | width 4 | `autoDoor` at z=-80, period 5s, phase 0.25 |
| Bed Bay 3 / Recovery Ward | -82 → -96 | 14×14 | 2 beds; 1 spill hazard; ward exit |
| Ward exit | z=-95.7 | — | unlocked |

**Total span:** ~105 m · widened from the original ~38 m layout, adding a third bed bay and a
third timed door for escalation ([BETTERMENT.md §3.3](../../BETTERMENT.md#33-levels-are-far-too-small) — now ✅ fixed).

## Hazards & puzzle
- **Three timed sliding auto-doors**, each on a different phase offset — no single rhythm
  clears all three; the third door is the escalation beat that separates this wing from Phase 3's
  original two-door design.
- 4 spill `hazardTile`s across the three bays (weave, don't dash straight through) — now with
  the automatic hazard-stripe warning texture.
- Beds double as climb-over cover.

## Enemy behavior
Spawns at (0, 1.4, -59) — in Bed Bay 2 — and patrols a 5-point route spanning Bed Bay 2 through
Corridor 3 into Bed Bay 3, so the back third of the wing keeps real pressure rather than being
a quiet coda after the second door.

## Checkpoints & exit
- Checkpoint lines: z=-17, z=-35, z=-51, z=-67, z=-82.
- Exit: unlocked door at z=-95.7.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): one bed's restraint straps
are undone — from the inside.
