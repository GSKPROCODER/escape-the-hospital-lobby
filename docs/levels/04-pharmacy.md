# Phase 4 — Pharmacy

> **Status:** 📐 Designed, not yet built.
> **Act:** I — "Routine". **Difficulty context:** first hazard requiring precise timing
> (duck/jump past a beam) rather than just route-choice; first *optional loop* for evasion.

## Premise
Supplies untouched for over a decade. ([LORE.md](../LORE.md#7-introoutro-scripts))

## Flow
Entry Corridor (spawn) → Dispensary Hall (laser tripwires + locked cage) → **loop**: two
parallel side corridors to a Storage Nook (meds key) → back to the Hall's cage → Storefront →
exit.

## Reference layout
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Entry Corridor | 6 → -10 | width 4 | spawn (0,1.4,6) |
| Dispensary Hall | -10 → -50 | 20×40 | shelving cover; 3 laser tripwires; locked cage door at z=-50 |
| Loop A (short, hazardous) | branch at x=-9, z=-30 → -50 | width 3 | 1 extra tripwire |
| Loop B (long, clear) | branch at x=9, z=-25 → -50 | width 3, longer path | no hazards — the "safe but slow" option |
| Storage Nook | z=-50..-58, x=0 (where loops rejoin) | 10×10 | meds key on a shelf |
| Storefront | -50 → -70 (after cage unlocks) | 16×20 | counters as cover |
| Exit corridor | -70 → -80 | width 4 | exit door at z=-96 (Storefront Exit room -80..-96, 12×16) |

**Total span:** ~102 m · **Target clear time:** 2:30–3:00.

## Hazards & puzzle
- **3 laser tripwires** in the Dispensary Hall — thin `sweepingHazard` bars at ankle/knee/chest
  height, duck or jump each on its own cycle (stagger periods so no single rhythm clears all 3).
- **Locked cage door** (`autoDoor` permanently closed until keycard-equivalent "meds key" logic,
  reusing the `keycardAt`/`canExit` pattern) blocks the Hall's far end — forces the loop.
- **Loop choice:** Loop A is shorter but has one more tripwire; Loop B is longer but hazard-free
  — a real risk/speed tradeoff, and a genuine evasion route if the enemy is closing in on Loop A.

## Enemy behavior
Patrols the Dispensary Hall's main aisle, occasionally drifting into Loop A (the shorter,
hazard-laden route) — biasing the player toward Loop B when the enemy is nearby, and Loop A
when it's clear and speed matters more than safety.

## Checkpoints & exit
- Checkpoint lines: entry to Dispensary Hall (z≈-10), after the loop rejoins (z≈-52), Storefront
  entry (z≈-72).
- Exit: **locked** — gated on the meds key from the Storage Nook.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): a hand-written inventory count
stops mid-list, pen still on the counter.
