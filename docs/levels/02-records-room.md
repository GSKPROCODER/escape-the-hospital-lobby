# Phase 2 — Records Room

> **Status:** ✅ Built — `src/world/levels/level02.ts`.
> **Act:** I — "Routine". **Difficulty context:** first keycard/locked-exit puzzle; teaches
> that the exit isn't always just "walk to it."

## Premise
Whoever kept these records left in a hurry. See if they left anything about you.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow (as built)
Entry Foyer (spawn, z=6) → short corridor → Records Room (filing-cabinet aisles) → locked
archive exit (requires keycard).

## Reference layout (as built)
| Room/corridor | Center z | Size | Notes |
|---|---|---|---|
| Entry Foyer | z=4 | 10×8 | spawn (0,1.4,6) |
| Corridor | z=-2..0 | width 4 | |
| Records Room | z=-12 | 20×20 | 3 rows × 4 filing-cabinet aisles (x=-6,-2,2,6; z=-7,-12,-17) |
| Shelf + keycard | (8.2, 2.4, -16) | — | climb the shelf crate to reach the keycard |
| Archive exit | z=-21.8 | — | **locked** until keycard collected |

> Same scale caveat as Phase 1 (BETTERMENT §3.3) — a good candidate to widen the aisle maze
> into a real weave (more rows, a dead-end or two) when revisiting built content.

## Hazards & puzzle
- **Keycard puzzle:** the archive exit is locked (`canExit()` gated) until the glowing keycard
  on the east shelf is collected — objective text updates once picked up.
- **Spill tile** — `hazardTile` at (-1.5, -19), 3×2, near the exit approach.
- Filing-cabinet aisles double as enemy cover/stalking lines.

## Enemy behavior
Spawns at (-6, 1.4, -17), patrols all four aisle rows: (-6,-10)→(6,-12)→(-6,-17)→(6,-17).
Cabinets give it (and the player) genuine line-of-sight breaks — the first wing where hiding
behind geometry is a real tactic, not just decoration.

## Checkpoints & exit
- Checkpoint lines: z=-3, z=-12.
- Exit: **locked** — gated on `canExit()` (keycard collected).

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): a query terminal confirms you
are not in any patient or staff file — only a near-match flagged in a sealed, redacted archive.
