# Phase 6 — The Morgue

> **Status:** 📐 Designed, not yet built.
> **Act:** I → II transition — [LORE.md](../LORE.md) marks this as the first Act II wing where
> the building "admits it never really closed." **Difficulty context:** first surface-modifier
> hazard (traction, not timing or lock-and-key).

## Premise
It's colder down here than the rest of the building. That isn't only the refrigeration.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow
Prep Room (spawn) → corridor → Cold Storage Hall (slippery floor, sliding drawers as cover) →
Freezer Antechamber → exit.

## Reference layout
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Prep Room | 6 → -6 | 14×12 | spawn (0,1.4,6); normal-traction floor |
| Corridor | -6 → -16 | width 4 | transition point — floor traction begins to drop here |
| Cold Storage Hall | -16 → -60 | 20×44 | **slippery floor throughout**; rows of sliding drawer units as moving cover |
| Freezer Antechamber | -60 → -76 | 14×16 | traction returns to normal; brief respite before the exit |
| Exit corridor | -76 → -86 | width 4 | exit door at z=-84 |

**Total span:** ~90 m · **Target clear time:** 2:30–3:00.

## Hazards & puzzle
- **Slippery floor** across the entire Cold Storage Hall — reduced friction changes jump/turn
  feel; players must commit to momentum rather than fine-adjust mid-slide.
- **Sliding drawer units** — large `crate`s on subtle back-and-forth `sweepingHazard`-style
  motion (non-lethal, purely as moving cover/obstacles to break sightlines on the slick floor).
- No lock/timing puzzle — the challenge is entirely in movement feel, a deliberate contrast to
  Phases 4–5.

## Enemy behavior
**Slower here** (per [LORE.md §4](../LORE.md#4-the-presence): "whatever it lost in the
Incident, it kept its senses" but the cold affects it too) — reduced patrol/chase speed
multiplier specific to this wing, balancing the fact that the *player* is also harder to
control on the ice. Patrols the Cold Storage Hall's central aisle.

## Checkpoints & exit
- Checkpoint lines: corridor entry (z≈-6), Cold Storage Hall midpoint (z≈-38), Freezer
  Antechamber (z≈-62).
- Exit: unlocked.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): an intake log has one entry
never signed off — a drawer left open, tag still attached, no body.
