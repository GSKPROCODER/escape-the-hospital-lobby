# Phase 8 — Ventilation

> **Status:** 📐 Designed, not yet built.
> **Act:** II — "Something Kept". **Difficulty context:** first low-visibility navigation
> challenge — a genuine maze, not just a corridor with turns.

## Premise
The building's systems were rerouted to keep something specific alive/contained.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow
Duct Access Room (spawn) → crawl-maze (branching low corridors) → Fan Junction (hub room) →
crawl-maze continuation → Grate Exit.

## Reference layout
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Duct Access Room | 6 → -4 | 12×10 | spawn (0,1.4,6); normal ceiling height |
| Crawl Maze A | -4 → -40 | branching, width 3, low ceiling (h≈2.2) | 2–3 dead-end branches; one correct path |
| Fan Junction | -40 → -54 | 16×16 | hub room, normal height; wall fans as touch-respawn hazards |
| Crawl Maze B | -54 → -90 | branching, width 3, low ceiling | mirrors Maze A's structure but re-randomized layout (design-time fixed, not runtime-random) |
| Grate Exit room | -90 → -100 | 10×10 | exit door |

**Total span:** ~106 m · **Target clear time:** 3:00–3:30 (deliberately the slowest-paced wing —
low visibility rewards caution over speed).

## Hazards & puzzle
- **Wall fans** (`hazardTile`-style, touch → respawn) positioned at Fan Junction's four
  entrances — time your pass between blade rotations.
- **Low ceilings** in both crawl mazes reduce the effective camera framing (first-person
  strongly recommended here, third-person camera pulls in tight) — a soft difficulty knob via
  visibility rather than a new mechanic.
- **Dead-end branches** in both mazes cost time but pose no hazard — pure navigation challenge.

## Enemy behavior
Deliberately **short sightlines** — the maze's low ceilings and branching walls mean the
enemy's FOV/LOS raycast rarely has a long, clean shot, so most encounters are close-range,
sudden corner-arounds rather than long chases. Patrols the Fan Junction hub and one maze branch
at a time.

## Checkpoints & exit
- Checkpoint lines: Duct Access exit (z≈-4), Fan Junction entry (z≈-42), Maze B midpoint
  (z≈-72).
- Exit: unlocked, at the Grate.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): a hand-drawn duct diagram is
taped inside, circling one sealed vent with "DO NOT—" and no rest of the sentence.
