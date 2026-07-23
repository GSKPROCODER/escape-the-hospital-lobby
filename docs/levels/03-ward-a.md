# Phase 3 — Ward A

> **Status:** ✅ Built — `src/world/levels/level03.ts`.
> **Act:** I — "Routine". **Difficulty context:** first timed-mechanism gauntlet (two auto-doors
> in sequence); teaches reading a cycle and committing to a crossing.

## Premise
The beds are still made. Someone expected to come back.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow (as built)
Nurse Station (spawn, z=6) → corridor + auto-door 1 → Bed Bay 1 → corridor + auto-door 2
(offset timing) → Bed Bay 2 → ward exit.

## Reference layout (as built)
| Room/corridor | Center z | Size | Notes |
|---|---|---|---|
| Nurse Station | z=4 | 12×8 | spawn (0,1.4,6) |
| Corridor + door 1 | z=-1 | width 4 | `autoDoor` period 4.5s, phase 0 |
| Bed Bay 1 | z=-9 | 14×14 | 2 beds to climb; central spill hazard |
| Corridor + door 2 | z=-17 | width 4 | `autoDoor` period 4.5s, phase 0.5 (offset) |
| Bed Bay 2 | z=-24 | 14×12 | 2 beds; 2 spill hazards |
| Ward exit | z=-29.8 | — | unlocked |

## Hazards & puzzle
- **Two timed sliding auto-doors**, deliberately out of phase with each other — you can't just
  learn one rhythm and repeat it; the second door demands re-reading the cycle.
- 3 spill `hazardTile`s across both bays (weave, don't dash straight through).
- Beds double as climb-over cover.

## Enemy behavior
Spawns deep at (0, 1.4, -24) — in Bed Bay 2 — and hunts *forward* toward the player, meaning
it can be met mid-corridor between the two doors, right when the player is most exposed to
timing pressure. Patrol: (-4,-24)→(4,-22)→(0,-9).

## Checkpoints & exit
- Checkpoint lines: z=-4, z=-17.
- Exit: unlocked door at z=-29.8.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): one bed's restraint straps
are undone — from the inside.
