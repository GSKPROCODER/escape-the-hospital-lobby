# Phase 13 — Quiet Ward

> **Status:** 📐 Designed, not yet built.
> **Act:** III — "It Remembers". **Difficulty context:** the purest stealth wing — no puzzle,
> no timing hazard, just line-of-sight management against the most aggressive enemy
> configuration in the game (barring Phase 15).

## Premise
The building's numbering skips a room. No one will say why.
([LORE.md](../LORE.md) — see the room-numbering beat below.)

## Flow
Ward Threshold (spawn) → the Pillar Hall (a single large dim room, no sub-rooms) → Ward Exit.
Deliberately the simplest *flow* in the game — all the challenge is in traversal, not layout.

## Reference layout
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Ward Threshold | 6 → -6 | 10×10 | spawn (0,1.4,6); dim lighting begins immediately |
| Pillar Hall | -6 → -80 | 24×74 | one continuous room; a dense grid of floor-to-ceiling pillars (`crate`, tall) breaking sightlines everywhere |
| Ward Exit alcove | -80 → -90 | 10×10 | exit door |

**Total span:** ~96 m, almost entirely one room · **Target clear time:** 2:30–3:00 (shorter than
its neighbors — tension from density, not length).

## Hazards & puzzle
- **None** — no timed hazards, no lock puzzle. The pillar grid itself is the entire challenge:
  a maze of sightline breaks the player must navigate purely by sound and brief glimpses.
- Deliberately long silences in the ambience (per
  [docs/SOUND_DESIGN.md §7](../SOUND_DESIGN.md#wing-13--quiet-ward)) broken by single
  non-enemy sounds (a cart rolling, a distant cough) — trains paranoia by design, not cheaply.

## Enemy behavior
The most aggressive standard-encounter config in the game: per [LORE.md
§4](../LORE.md#4-the-presence), difficulty here should push sight range and hearing radius
toward their upper bounds (Nightmare-tier numbers even on Normal difficulty, as a wing-specific
override) — the entire pillar layout exists to give the player a fighting chance against that
aggression through cover, not raw speed.

## Checkpoints & exit
- Checkpoint lines: Pillar Hall entry (z≈-6), room thirds (z≈-30, z≈-58).
- Exit: unlocked.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): the room-numbering directory
has one number simply absent — no explanation given for the gap. It's this wing.
