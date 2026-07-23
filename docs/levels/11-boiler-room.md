# Phase 11 — Boiler Room

> **Status:** 📐 Designed, not yet built.
> **Act:** III — "It Remembers" (opening chapter — [LORE.md](../LORE.md) marks this as
> "ground zero," where the Incident is finally explained). **Difficulty context:** first wing
> where the enemy actively hunts from entry — no more free patrol-only opening.

## Premise
This is where it happened. You can still smell the burn.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow
Pipe Corridor (spawn, dense pipework as cover) → Boiler Hall (the main hazard space) → Charred
Records Alcove (side detour — the Incident's report) → Exit Stairwell.

## Reference layout
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Pipe Corridor | 6 → -14 | width 5 | dense pipe props as climb-over cover and sightline breaks |
| Boiler Hall | -14 → -60 | 22×46 | 3 steam-jet clusters (bursts on a telegraphed hiss); large boiler crates to climb over |
| Charred Records Alcove | branch at x=-11, z=-40 | 8×8 | the Incident's charred report ([LORE.md §6](../LORE.md#6-collectible-lore-items)) |
| Exit Stairwell | -60 → -72 | 10×10, ascending | exit door at top |

**Total span:** ~78 m · **Target clear time:** 3:00–3:30.

## Hazards & puzzle
- **Steam-jet bursts** — always preceded by a rising hiss telegraph (per
  [docs/SOUND_DESIGN.md §7](../SOUND_DESIGN.md#wing-11--boiler-room)) so they're startling but
  fair; 3 clusters across the Boiler Hall.
- **Climb-over pipework and boiler crates** throughout — the densest cover geometry yet, doubling
  as both hazard-dodging and enemy-evasion terrain.
- No lock/key puzzle — the Charred Records Alcove is a pure lore detour.

## Enemy behavior
Per [LORE.md's escalation model](../LORE.md#4-the-presence), Act III opens with the Presence
**actively hunting from the moment you enter** rather than starting in a passive patrol — the
mechanical difficulty escalation (BETTERMENT §4.5's proposed per-checkpoint ratchet) should be
at its highest baseline here of any wing so far.

## Checkpoints & exit
- Checkpoint lines: Boiler Hall entry (z≈-14), hall midpoint (z≈-38), post-alcove rejoin
  (z≈-58).
- Exit: unlocked.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): a charred incident-report
draft, mostly legible, finally describes "loss of containment, Ward — [redacted]" — the
Incident's real cause, spelled out for the first time.
