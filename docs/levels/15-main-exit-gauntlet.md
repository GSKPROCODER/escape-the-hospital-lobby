# Phase 15 — Main Exit Gauntlet

> **Status:** 📐 Designed, not yet built.
> **Act:** III — "It Remembers" (closing chapter — the escape).
> **Difficulty context:** the finale — a synthesis of every mechanic in the game, ending in the
> escape + reward sequence already specified in
> [docs/GAME_DESIGN.md §11](../GAME_DESIGN.md#11-reward-reward).

## Premise
The front doors are close. For the first time in eleven years, they might actually open.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow
Connector Corridor (spawn, callback set-dressing from earlier wings) → Gauntlet Hall (every
hazard type in sequence) → Final Corridor (scripted chase) → Front Doors (win zone + escape
cutscene).

## Reference layout
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Connector Corridor | 6 → -10 | width 5 | brief motifs/props from Wings 1–14 visible in passing (per [docs/SOUND_DESIGN.md §7](../SOUND_DESIGN.md#wing-15--main-exit-gauntlet)'s audio-callback note) |
| Gauntlet Hall | -10 → -70 | 22×60 | in sequence: a gap-and-climb section, a sweeping hazard, a laser cluster, a timed auto-door — synthesis of Phases 1–12, not new content |
| Final Corridor | -70 → -95 | width 5 | scripted chase beat — the enemy is explicitly aggroed and pursuing for this stretch, no stealth option |
| Front Doors | -95 → -105 | 14×14 | the same doors seen sealed in Phase 1's Lobby, now the win zone |

**Total span:** ~111 m · **Target clear time:** 3:30–4:00 (the climax should feel long enough to
earn the ending, not rushed).

## Hazards & puzzle
- **Every hazard type reprised** across the Gauntlet Hall — no new mechanic introduced, pure
  mastery test of everything taught in Wings 1–14.
- **Final Corridor is a guaranteed chase** — unlike every prior wing, stealth is not an option
  here; the enemy is scripted into active pursuit for the last stretch, matching
  [LORE.md's escalation](../LORE.md#4-the-presence) (Act III's Presence "actively hunts").

## Enemy behavior
Relentless — the Nightmare-tier config applies as the *floor*, not the ceiling, regardless of
the player's chosen difficulty for the run, reflecting that this is the climax regardless of
skill level chosen.

## Checkpoints & exit
- Checkpoint lines: Gauntlet Hall entry (z≈-10), hall midpoint (z≈-40), Final Corridor entry
  (z≈-72) — generously placed, since a death this late in a 15-wing run should not be
  devastating.
- Exit / win condition: reaching the Front Doors triggers the **escape cutscene + reward**
  already specified in [docs/GAME_DESIGN.md §11](../GAME_DESIGN.md#11-reward-reward) and the
  main/secret endings in [docs/LORE.md §7](../LORE.md#7-introoutro-scripts).

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): the front doors — sealed since
Phase 1 — finally register as unlocked on the same old panel seen at the very start. Full
circle. If the player collected enough lore notes across the run, the secret ending
(LORE.md §7) plays instead of the default one.
