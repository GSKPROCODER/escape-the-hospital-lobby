# Phase 14 — Generator Room

> **Status:** 📐 Designed, not yet built.
> **Act:** III — "It Remembers" (ground zero — [LORE.md](../LORE.md) frames this as where the
> Incident actually began). **Difficulty context:** the second-to-last wing; a 3-bay power
> puzzle that synthesizes hazard types from every prior wing (steam, sparks, timing).

## Premise
Ground zero. The actual containment failure happened here.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow
Generator Antechamber (spawn) → Hazard Bay 1 (steam) → Hazard Bay 2 (sparks) → Hazard Bay 3
(timed gate) → central Power Core room (all 3 levers restore power) → Exit.

## Reference layout
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Generator Antechamber | 6 → -8 | 12×10 | spawn (0,1.4,6) |
| Hazard Bay 1 (steam) | branch at x=-14, z=-20 | 12×16 | steam-jet bursts (as Phase 11) + lever 1 |
| Hazard Bay 2 (sparks) | branch at x=14, z=-20 | 12×16 | sweeping spark hazard (as Phase 1) + lever 2 |
| Hazard Bay 3 (timed gate) | z=-40 → -56, on the main path | 14×16 | an `autoDoor` timing gate + lever 3 |
| Power Core | -56 → -76 | 16×18 | central room; all 3 bays feed back here; door unlocks once all levers are pulled |
| Exit corridor | -76 → -86 | width 4 | exit door |

**Total span:** ~92 m · **Target clear time:** 3:30–4:00.

## Hazards & puzzle
- **3 hazard bays, each with a distinct hazard type** pulled from earlier wings (steam / spark /
  timed gate) — a deliberate "greatest hits" structure that also **gates the final lever behind
  a hazard the player has already learned**, so nothing here is unfair, only combined.
- **Power restoration cascades visually and audibly** — per
  [docs/SOUND_DESIGN.md §7](../SOUND_DESIGN.md#wing-14--generator-room), each lever pulled
  should sync a light hum-up across the wing, culminating in the Power Core going fully lit
  once all 3 are done.

## Enemy behavior
Patrols between the Power Core and whichever bay the player hasn't yet cleared — biased to
intercept on the *last* remaining bay, so the final lever is always the tensest of the three.

## Checkpoints & exit
- Checkpoint lines: entry to the bay area (z≈-8), after any 2 of 3 levers are pulled (dynamic —
  not a fixed z, tracked by puzzle state), Power Core entry (z≈-58).
- Exit: **locked** — requires all 3 levers.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): a shift log's final entries
devolve from routine notes into single urgent words, then stop — the Incident, from the inside,
as it happened.
