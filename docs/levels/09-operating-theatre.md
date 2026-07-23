# Phase 9 — Operating Theatre

> **Status:** 📐 Designed, not yet built.
> **Act:** II — "Something Kept". **Difficulty context:** the quietest wing in the game by
> design — a showcase for the enemy's breathing-loop audio cue (see
> [docs/SOUND_DESIGN.md §7](../SOUND_DESIGN.md#wing-9--operating-theatre)).

## Premise
The last procedure this room ran wasn't a scheduled surgery.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow
Scrub Room (spawn) → corridor → Theatre (moving equipment carts, overhead lamp sweep) →
Recovery Ward (side loop back to the corridor) → exit.

## Reference layout
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Scrub Room | 6 → -6 | 12×10 | spawn (0,1.4,6) |
| Corridor | -6 → -16 | width 4 | |
| Theatre | -16 → -56 | 20×40 | central operating table (crate); 2 moving equipment carts; overhead lamp sweep (light-only hazard cue, pairs with a visual cone) |
| Recovery Ward (loop room) | branch at x=10, z=-40 → rejoins corridor at z=-60 | 12×14 | a second route around the Theatre's back half — the wing's loop |
| Exit corridor | -56 → -68 | width 4 | exit door at z=-66 |

**Total span:** ~72 m main path (+ loop) · **Target clear time:** 2:30–3:00.

## Hazards & puzzle
- **Moving equipment carts** — `sweepingHazard`-style carts on tracks across the Theatre floor,
  slower and more predictable than Pharmacy's lasers, but wide enough to block a full lane.
- **Overhead lamp sweep** — a rotating cone of light (visual only, no damage) that **reveals the
  player to the enemy at range** if caught in it — the first hazard that empowers the enemy
  rather than harming the player directly.
- **Recovery Ward loop** — bypasses the Theatre's back half entirely; slower but avoids both
  the carts and the lamp sweep, a legitimate stealth alternative.

## Enemy behavior
Patrols the Theatre. Because the wing's ambience is the quietest in the game (near-silence by
design), its breathing loop and footsteps carry much further *effectively* than the raw
hearing-radius number suggests — this wing is the intended showcase for that audio system.

## Checkpoints & exit
- Checkpoint lines: corridor entry (z≈-6), Theatre midpoint (z≈-36), post-loop rejoin (z≈-58).
- Exit: unlocked.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): an OR log shows a redacted
patient name and a time of night far outside normal scheduling.
