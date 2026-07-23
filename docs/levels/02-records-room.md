# Phase 2 — Records Room

> **Status:** ✅ Built — `src/world/levels/level02.ts`.
> **Act:** I — "Routine". **Difficulty context:** first keycard/locked-exit puzzle; teaches
> that the exit isn't always just "walk to it."

## Premise
Whoever kept these records left in a hurry. See if they left anything about you.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow (as built)
Entry Foyer (spawn, z=6) → corridor → Records Room (filing-cabinet maze) → corridor → Archive
Exit room (locked, requires keycard).

## Reference layout (as built)
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Entry Foyer | 9 → -1 | 12×10 | spawn (0,1.4,6) |
| Corridor 1 | -1 → -17 | width 4 | |
| Records Room | -17 → -51 | 26×34 | 5 rows × 4 filing-cabinet aisles (x=±4,±9; z=-22,-27,-32,-37,-42) |
| Shelf + keycard | (11.2, 2.4, -37) | — | climb the shelf crate to reach the keycard, deep in the maze |
| Corridor 2 | -51 → -66 | width 4 | |
| Archive Exit room | -66 → -78 | 14×12 | exit door at z=-77.7, **locked** until keycard collected |

**Total span:** ~96 m · widened from the original ~30 m layout
([BETTERMENT.md §3.3](../../BETTERMENT.md#33-levels-are-far-too-small) — now ✅ fixed). The
exit is now its own room rather than sitting inside the maze itself.

## Hazards & puzzle
- **Keycard puzzle:** the archive exit is locked (`canExit()` gated) until the glowing keycard,
  now placed deep in the maze's east side, is collected — objective text updates once picked up.
- **Spill tile** — `hazardTile` near the Records Room's own exit, now with the automatic
  hazard-stripe warning texture.
- 20 filing-cabinet aisles (up from 12) give real maze weight and enemy cover/stalking lines.

## Enemy behavior
Spawns at (-8, 1.4, -27), patrols a 5-point zigzag through all five aisle rows. Cabinets give
it (and the player) genuine line-of-sight breaks — the first wing where hiding behind geometry
is a real tactic, not just decoration.

## Checkpoints & exit
- Checkpoint lines: z=-17, z=-34, z=-51, z=-66.
- Exit: **locked** — gated on `canExit()` (keycard collected).

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): a query terminal confirms you
are not in any patient or staff file — only a near-match flagged in a sealed, redacted archive.
