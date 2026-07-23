# Phase 10 — Flooded Basement

> **Status:** 📐 Designed, not yet built.
> **Act:** II — "Something Kept" (closing chapter). **Difficulty context:** first
> environmental-hazard-as-ally wing — rising/standing water slows the enemy *more* than the
> player in places, the first hazard the player can use tactically rather than only avoid.

## Premise
The flooding isn't accidental — a pipe was deliberately left open.
([LORE.md intro card](../LORE.md#7-introoutro-scripts))

## Flow
Basement Stairs (spawn, descending) → Flooded Hall (shallow water throughout) → Pump Room
(the timed sluice gate puzzle) → Dry Exit Stairwell.

## Reference layout
| Room/corridor | z-range | Size | Notes |
|---|---|---|---|
| Basement Stairs | 6 → -10 (descending ~3m in y) | 10×10 landing | spawn; dry, normal traction |
| Flooded Hall | -10 → -60 | 20×50 | shallow water (ankle-deep, visual + slowed movement) across the whole hall |
| Pump Room | -60 → -76 | 14×16 | **timed sluice gate** (`autoDoor`-style, longer period ~6s) — the only dry crossing point over a deeper channel |
| Exit Stairwell | -76 → -88 | 10×10, ascending | dry; exit door at top |

**Total span:** ~94 m · **Target clear time:** 3:00–3:30.

## Hazards & puzzle
- **Shallow water** across the Flooded Hall — reduces player (and enemy) movement speed
  uniformly; doesn't gate progress, just changes pacing and stamina-feel.
- **Timed sluice gate** in the Pump Room — the one required crossing over a deeper channel;
  read its cycle and commit, similar in spirit to Ward A's auto-doors but on a slower, more
  deliberate period befitting the wing's heavier atmosphere.

## Enemy behavior
**Wades slowly** — a wing-specific speed penalty in the water that's proportionally *larger*
for the enemy than the player (per [LORE.md §4](../LORE.md#4-the-presence), it "kept its
senses" but the flooding still hampers it more), making this one of the few wings where
sprinting past it in open water is a viable, intended strategy rather than a last resort.

## Checkpoints & exit
- Checkpoint lines: Flooded Hall entry (z≈-10), hall midpoint (z≈-38), Pump Room entry
  (z≈-62).
- Exit: unlocked, gated only by successfully timing the sluice gate.

## Narrative tie-in
[LORE.md](../LORE.md#5-three-act-structure-across-the-15-wings): a hand tool is left wedged in
a valve — someone flooded this level on purpose, once, and never came back for the tool.
