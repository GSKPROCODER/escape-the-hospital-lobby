# Phase 12 — Security Wing

> **Status:** 📐 Designed, not yet built.
> **Act:** III — "It Remembers". **Difficulty context:** the game's most demanding lock-and-key
> puzzle (3 breakers) layered directly on top of a hazard grid and an actively-hunting enemy —
> the first wing that fully combines all three challenge types at once.

## Premise
Camera footage from the night of the Incident should exist here — it doesn't.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow
Security Lobby (spawn) → Camera Grid Hall (dense laser grid) → 3 Breaker Alcoves (branching off
the Hall, each needs a lever pulled) → Control Room (exit, unlocked once all 3 breakers are hit).

## Reference layout
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Security Lobby | 6 → -8 | 12×10 | spawn (0,1.4,6); bank of (non-functional) monitor props |
| Camera Grid Hall | -8 → -60 | 20×52 | dense laser grid — more beams than Pharmacy, different heights/angles |
| Breaker Alcove A | branch at x=-11, z=-20 | 6×8 | lever 1 |
| Breaker Alcove B | branch at x=11, z=-38 | 6×8 | lever 2 |
| Breaker Alcove C | branch at x=-11, z=-54 | 6×8 | lever 3 |
| Control Room | -60 → -76 | 14×16 | exit door — **locked until all 3 levers are pulled** |

**Total span:** ~82 m · **Target clear time:** 3:30–4:00 (the longest target yet, reflecting the
combined puzzle+hazard+hunt load).

## Hazards & puzzle
- **Laser grid** — denser and more varied (mixed heights, some diagonal) than Phase 4's
  tripwires; crossing the Camera Grid Hall three separate times (once per breaker detour) means
  the same beams must be re-solved under mounting pressure.
- **3-breaker puzzle** — pull all three levers (in any order) to unlock the Control Room exit;
  each alcove is a short, self-contained detour off the main hall, not a separate maze.
- Each lever pull should audibly change the room tone (per
  [docs/SOUND_DESIGN.md §7](../SOUND_DESIGN.md#wing-12--security-wing)) — the player *hears*
  progress toward the unlock.

## Enemy behavior
**Actively hunts** (per LORE.md's Act III framing) and, given the hall's straight sightlines,
gets some of its longest LOS opportunities in the game — the laser grid's forced weaving makes
staying unseen while also dodging beams a genuine dual-task challenge.

## Checkpoints & exit
- Checkpoint lines: Camera Grid Hall entry (z≈-8), after each breaker alcove is reached
  (z≈-22, z≈-40, z≈-56).
- Exit: **locked** — requires all 3 breakers.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): an evidence chain-of-custody
log notes the relevant tape "missing from archive," with three conflicting signatures.
