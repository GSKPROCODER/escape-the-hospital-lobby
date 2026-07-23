# Phase 7 — Stairwell

> **Status:** 📐 Designed, not yet built.
> **Act:** II — "Something Kept". **Difficulty context:** first **vertical** wing — progression
> is by height (y), not depth (z); introduces the kit's planned `ramp()`/`stairs()` helper
> (see [BETTERMENT.md §5.2](../../BETTERMENT.md)).

## Premise
Someone else tried to leave, floor by floor, and left signs.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow
Ground Landing (spawn) → switchback flight 1 → Landing 2 (side room, optional) → switchback
flight 2 → Landing 3 → switchback flight 3 → Roof-Access Door (exit).

## Reference layout
| Landing/flight | y-range | Size | Notes |
|---|---|---|---|
| Ground Landing | y=0 | 10×10 | spawn (0,1.4,0,z=4) |
| Flight 1 (switchback ramp/stairs) | y=0→6 | width 4, two 8m runs + a turn landing | continuous floor, ledge-safe rails (solid low walls, not open drops) |
| Landing 2 | y=6 | 12×10 | side room off the landing: a short detour with a lore note |
| Flight 2 | y=6→12 | same as Flight 1 | chalk tally marks on the walls (visual only) |
| Landing 3 | y=12 | 10×10 | mid-rest point |
| Flight 3 | y=12→18 | same as Flight 1 | steepest flight — enemy patrol here is tightest |
| Roof-Access Landing | y=18 | 10×10 | exit door |

**Total rise:** 18 m over ~3 switchback flights · **Target clear time:** 2:30–3:00.

## Hazards & puzzle
- No timed hazards — the challenge is **verticality and pacing** against a following enemy;
  every flight and landing has continuous, ledge-safe solid floor (low rails instead of open
  drops) so a misstep never means falling to the bottom.
- Landing 2's side room is a pure detour (lore note, no shortcut) — rewards curiosity without
  gating the climb.

## Enemy behavior
Follows the player up the flights rather than patrolling a fixed loop — a rare case where the
enemy's "patrol" *is* the vertical path itself, always trailing 1–1.5 flights behind unless it
hears sprinting (echoes further in a stairwell — larger hearing radius here specifically).

## Checkpoints & exit
- Checkpoint lines: **y-based** (checkpoint activates at y ≥ threshold, mirroring the
  z-crossing logic but on the vertical axis) at y=6, y=12.
- Exit: unlocked, at the top landing (y=18).

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): chalk tally marks on the
landings count nights — the count is unnervingly high.
