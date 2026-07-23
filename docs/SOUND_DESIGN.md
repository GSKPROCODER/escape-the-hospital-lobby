# Sound Design — Escape the Hospital Lobby

> **Status:** Design doc, not yet implemented (tracked as [BETTERMENT.md](../BETTERMENT.md) §7).
> **Purpose:** A complete, production-grade horror sound bible — pillars, mix architecture,
> global systems, a master SFX list, and a per-wing soundscape for all 15 wings — with real,
> license-checked sources so this can be executed without further research.
>
> **Current state:** [src/core/Audio.ts](../src/core/Audio.ts) is 100% procedural Web Audio
> (oscillators + filtered noise) — a drone, UI blips, a growl, and a heartbeat. No footsteps,
> no samples, no spatialization, no music layers. This doc is the plan to fix that.

---

## 1. Audio pillars

Five rules everything else follows:

1. **Silence is the loudest tool.** The default state of a wing is near-silence (hum + faint
   drips). Every sound that breaks it must mean something.
2. **The Presence is heard before it's seen.** Footsteps, a growl, a distant door — all must
   be audible *before* line-of-sight (`Enemy.canSeePlayer` in
   [Enemy.ts](../src/ai/Enemy.ts)) confirms the visual.
3. **Direction and distance are gameplay information**, not just atmosphere — panned/attenuated
   audio should let a player *locate* the enemy without looking at it.
4. **Every mechanic gets a sound rule.** If a hazard, door, or pickup is silent, it's a bug
   (see BETTERMENT §7.3, §12.2).
5. **Diegetic first, score second.** Ambience and mechanical sound carry 80% of the dread;
   music is a rising undercurrent, never the primary scare delivery.

## 2. Mix architecture

### Buses (extends the existing `AudioEngine` in [Audio.ts](../src/core/Audio.ts))

| Bus | Exists? | Feeds | Notes |
|---|---|---|---|
| `master` | ✅ | destination | user Master Volume slider |
| `music` | ✅ | master | currently the single ambient drone; becomes 3-layer intensity system (§4.2) |
| `sfx` | ✅ | master | UI blips, growl, heartbeat |
| `ambience` *(new)* | — | master | room tone, drips, distant creaks — separate from music so it never ducks |
| `enemy` *(new)* | — | sfx | footsteps/growls/breathing — routed through a `PannerNode` for spatial position |
| `ui` *(new)* | — | master, **not** paused by tab-hide | menu clicks/hover; currently shares `sfx` |

### Ducking rules
- Enemy `growl()` → duck `music` bus to 40% for 800 ms (Web Audio `gain.linearRampToValueAtTime`).
- Entering `chase` state (from `EnemyBrain.state`, [EnemyAI.ts](../src/ai/EnemyAI.ts)) → crossfade
  music layer up (§4.2) over 400 ms, not an instant cut.
- Pause menu / `visibilitychange` → suspend the whole `AudioContext` (fixes BETTERMENT §12.3 —
  today the drone keeps playing on the pause screen and in hidden tabs).

### Reverb (occlusion & space)
- One shared `ConvolverNode` per room-size class (small/medium/large), impulse response
  **generated procedurally** (filtered white-noise burst + exponential decay — no IR sample
  needed, same technique already used for the drone/heartbeat).
- **Occlusion**: when `Enemy.canSeePlayer` returns false because a wall blocked the raycast,
  low-pass filter the enemy's audio bus (cutoff ~800 Hz) — sound "through a wall," LOS-driven,
  reusing a check that already exists per-frame.

## 3. Spatial audio

- **Howler.js is already an installed dependency and currently unused** — either wire its
  stereo/positional API, or use raw Web Audio `PannerNode` (HRTF panning model) fed by the
  enemy's world position relative to the camera each frame (`Enemy.getPosition()` vs.
  `CameraRig` position — both already computed per frame).
- Minimum viable: stereo pan (`StereoPannerNode`, cheap) by relative X; volume by distance
  (inverse-square, capped). HRTF `PannerNode` is a stretch upgrade.

## 4. Global systems

### 4.1 Footsteps (player + enemy)
- Driven by existing gait phase: `CharacterModel.update()` phase for the player,
  `EnemyModel.update()` phase for the enemy — trigger a step sound each time phase crosses a
  half-cycle, no new timing logic needed.
- **Procedural baseline** (ships first, zero assets): short filtered-noise burst, pitch/tone
  varies by a `surface` tag per room (tile = higher/sharper, carpet = dull, metal = ringing,
  water = splash — matches Level 6/10's slippery-floor/flooded-basement surfaces).
- **Sample upgrade** (P2): 3–4 variations per surface from Kenney's *Impact Sounds* pack
  (§6) round-robined to avoid machine-gun repetition.
- Enemy footsteps use the **same system**, routed through the `enemy` bus (spatial + louder
  when `EnemyBrain.state === 'chase'`) — this is the single highest-value addition per
  BETTERMENT §7.1: free dread radar.

### 4.2 Music intensity system (3 layers, crossfaded)
Driven directly by `EnemyBrain.state` (patrol/investigate/chase/search) and `Game.isDanger()`:

| Layer | Plays when | Character | Source |
|---|---|---|---|
| **Calm** | `patrol`, player far | Existing detuned-drone + filtered-noise hum ([Audio.ts](../src/core/Audio.ts) `startAmbient()`) | already built |
| **Tension** | `investigate`/`search`, or enemy within hearing radius | Add a slow pulse (sine LFO gain on a low drone, ~1 pulse/2s) | procedural, small addition |
| **Chase** | `chase` state / `isDanger()` true | Percussive layer — filtered noise "hits" on a rhythmic gain envelope, tempo scales with `Difficulty.chaseSpeed` | procedural now; Sonniss/Kenney percussion one-shots later (§6) |
| **Sting** | catch / win / lose | Two short (~2s) procedural stingers: rising major-ish triad (win) vs. detuned falling cluster (catch) | procedural, ships first (BETTERMENT §7.4) |

All three layers can run simultaneously at different gains and crossfade (avoids the seams of
hard track-switching) — three `GainNode`s on the `music` bus, ramped by state.

### 4.3 Enemy vocalizations
- **Growl** — exists (`AudioEngine.growl()`), fires on first-detected sight; keep.
- **Breathing loop** — new, low volume, present only within ~8m and gets louder/faster as
  `EnemyBrain.state` escalates toward `chase`.
- **Distant wail** (patrol-state ambience sting, rare/random) — a "something is out there evening
  when you can't see it" cue, decoupled from actual enemy position (pure atmosphere, doesn't
  leak real info).

### 4.4 Mechanical / world sound
Every interactive kit primitive in [kit.ts](../src/world/kit.ts) gets a sound (BETTERMENT §7.3):

| Kit primitive | Sound needed | Trigger |
|---|---|---|
| `autoDoor()` | slide whoosh + clunk at travel extremes | on `LevelKit.update()` phase crossing 0/1 |
| `sweepingHazard()` | electrical crackle/spark loop, pans with position | continuous while active |
| `hazardTile()` | ambient hum (spill/electric) when player is near; sharp zap on `hazardHit()` | proximity + hit event |
| `keycardAt()` | distinct rising chime (**not** the generic `select()`) | `consumePickup()` |
| Checkpoint crossing | soft affirming tone, layered under the existing toast | `LevelManager.updateCheckpoints` |
| Exit beacon / door | low drone that grows as player approaches; unlock stinger when `canExit()` flips true | per-frame distance check |

## 5. Master SFX / music asset list

~50 entries. **Trigger** references the exact code hook. **Src** = `Proc` (build procedurally
now, zero asset cost) or a licensed library from §6 (P2 upgrade path). Sizes are estimates for
the eventual `.ogg` versions.

| ID | Description | Trigger (code hook) | Src (P1/now) | Src (P2 upgrade) | Est. size |
|---|---|---|---|---|---|
| ui_hover | menu hover blip | `UI.button` mouseenter → `AudioEngine.hover()` | Proc ✅ | Kenney UI Audio | — |
| ui_click | menu confirm | `AudioEngine.click()` | Proc ✅ | Kenney UI Audio | — |
| ui_back | menu back/cancel | new — Settings/Pause "Back" | Proc | Kenney UI Audio | 10 KB |
| sfx_jump | player leaves ground | `Player` jump branch → `AudioEngine.jump()` (defined, **never called** — BETTERMENT §12.2) | Proc ✅ (wire it) | — | — |
| sfx_land | player lands | `consumeJustLanded()` → `AudioEngine.land()` | Proc ✅ | Freesound "footstep_land" CC0 | 15 KB |
| sfx_step_tile | player footstep, tile floor | gait-phase half-cycle (§4.1) | Proc (new) | Kenney Impact Sounds | 8 KB ×4 |
| sfx_step_metal | footstep, metal grate/stairs | gait-phase, `surface:'metal'` | Proc (new) | Kenney Impact Sounds | 8 KB ×4 |
| sfx_step_water | footstep, flooded basement | gait-phase, `surface:'water'` | Proc (new) | Freesound "water splash step" CC0 | 10 KB ×3 |
| sfx_enemy_step | enemy footstep | `EnemyModel` gait phase | Proc (new, heavier/lower) | Kenney Impact Sounds | 8 KB ×4 |
| sfx_growl | enemy spots player | `AudioEngine.growl()` | Proc ✅ | — | — |
| sfx_breathing | enemy near-proximity loop | new, `Enemy` distance check | Proc (new) | Freesound "creature breathing" CC0 | 40 KB |
| sfx_heartbeat | seen-state pulse | `AudioEngine.heartbeat()` | Proc ✅ | — | — |
| sfx_wail_distant | rare atmosphere sting | new, random timer | Proc (new) | OpenGameArt Horror SFX Library | 60 KB |
| sfx_checkpoint | checkpoint crossed | `Game.onCheckpoint` → `AudioEngine.select()` (reused — should be distinct, §4.4) | Proc ✅ (differentiate) | — | — |
| sfx_keycard | keycard picked up | `Game.onPickup` (currently reuses `select()`) | Proc (new, distinct) | Kenney UI Audio "chime" | 12 KB |
| sfx_door_open | auto-door opens | `kit.autoDoor` phase 0→1 | Proc (new) | Freesound "metal door slide" CC0 | 30 KB |
| sfx_door_close | auto-door closes | `kit.autoDoor` phase 1→0 | Proc (new) | same source, reversed/pitched | 30 KB |
| sfx_spark_loop | sweeping hazard active | `kit.sweepingHazard` | Proc (new, sawtooth+crackle) | Freesound "electrical arc loop" CC0 | 80 KB |
| sfx_hazard_zap | hazard tile hit | `hazardHit()` respawn branch | Proc (new) | Freesound "electric shock" CC0 | 15 KB |
| sfx_slip | player enters slippery floor (Morgue) | new level flag | Proc (new, low friction whoosh) | — | — |
| sfx_splash | player enters water (Flooded Basement) | new level flag | Proc (new) | Freesound "wading water" CC0 | 40 KB |
| sfx_steam_burst | Boiler Room hazard | new (Wing 11) | Proc (new, noise burst + hiss) | Freesound "steam hiss" CC0 | 30 KB |
| sfx_lever | Generator/Security lever pulled | new (Wings 12/14) | Proc (new, mechanical clunk) | Kenney Impact Sounds | 10 KB |
| sfx_laser_hum | laser tripwire idle (Pharmacy/Security) | new (Wings 4/12) | Proc (new, thin sine hum) | — | — |
| sfx_laser_trip | laser tripped | hazard hit variant | Proc (new, sharp zap) | Freesound "laser alarm" CC0 | 15 KB |
| sfx_fan_whir | ventilation duct fan (Wing 8) | new | Proc (new, filtered noise loop) | Freesound "fan hum" CC0 | 30 KB |
| sfx_scanner_servo | Radiology scanner arm (Wing 5) | new | Proc (new, servo whine) | Freesound "servo motor" CC0 | 15 KB |
| sfx_cart_roll | Operating Theatre cart (Wing 9) | new | Proc (new, squeaky wheel) | Freesound "squeaky cart" CC0 | 20 KB |
| sfx_exit_hum | exit beacon proximity drone | new, distance-based | Proc (new) | — | — |
| sfx_exit_unlock | `canExit()` flips true | `LevelKit.update` unlock branch | Proc (new, rising chime) | — | — |
| sting_win | wing cleared | `App.handleWin` → `UI.showWin` | Proc (new, rising triad) | — | — |
| sting_caught | player runs out of lives | `App.handleFail` → `UI.showFail` | Proc (new, falling dissonant) | — | — |
| sting_checkpoint_final | last checkpoint before exit | new | Proc (new) | — | — |
| ui_pause_in | pause menu opens | `App.pause()` | Proc (new, soft low-pass sweep on world audio) | — | — |
| ui_pause_out | resume | `App.resume()` | Proc (new, reverse sweep) | — | — |
| music_calm | ambient bed | `AudioEngine.startAmbient()` | Proc ✅ | — | — |
| music_tension | pulse layer | new (§4.2) | Proc (new) | — | — |
| music_chase | percussive layer | new (§4.2) | Proc (new) | Sonniss GDC bundle percussion one-shots | 100 KB (loopable) |
| amb_wing01_reception | Reception Wing room tone | wing load | Proc (drone variant) | OpenGameArt "Office horror ambience" | 200 KB |
| amb_wing02_records | Records Room tone (paper rustle) | wing load | Proc (new) | Freesound "paper rustle loop" CC0 | 60 KB |
| amb_wing03_ward | Ward A tone (monitor beep, distant) | wing load | Proc (new) | Freesound "hospital monitor beep" CC0 | 10 KB |
| amb_wing06_morgue | Morgue tone (cold hum, drip) | wing load | Proc (new) | Freesound "cold room hum" CC0 | 60 KB |
| amb_wing10_flooded | Flooded Basement (water drip/flow) | wing load | Proc (new) | Freesound "water dripping loop" CC0 | 80 KB |
| amb_wing11_boiler | Boiler Room (mechanical rumble) | wing load | Proc (new) | Freesound "boiler room rumble" CC0 | 80 KB |
| vo_intro_wing | 4-line intro card VO *(optional, P3)* | wing start | — (text-only for now, see [LORE.md](./LORE.md)) | ElevenLabs/local TTS if voiced later | — |

**~50 entries total.** Everything marked `Proc` ships with **zero new asset weight** using the
existing Web Audio techniques in [Audio.ts](../src/core/Audio.ts) (oscillators, filtered noise
buffers, envelopes) — this is the P1 rollout. The "Src (P2 upgrade)" column is optional later
polish once the loop is proven fun.

## 6. Sourcing & licensing (verified, real links)

All checked live during this doc's research pass. **Rule: only use assets whose license
permits redistribution in a shipped web build without per-asset attribution tracking** — so
CC0 / Pixabay-License content only for anything actually bundled. CC-BY sources are fine for
prototyping locally but require an attribution file if shipped.

| Source | License | Best for | Link |
|---|---|---|---|
| **Freesound.org** | Mixed — filter to **CC0** via the license sidebar filter or API param `license:"Creative Commons 0"` | One-off SFX (doors, sparks, steam, water, breathing) | [freesound.org](https://freesound.org/) · [licensing FAQ](https://freesound.org/help/faq/) |
| **Kenney.nl** | **CC0**, all packs | UI sounds, footsteps/impacts, sci-fi hums | [kenney.nl/assets/impact-sounds](https://kenney.nl/assets/impact-sounds) · [kenney.nl/assets/ui-audio](https://kenney.nl/assets/ui-audio) · [kenney.nl/assets/interface-sounds](https://kenney.nl/assets/interface-sounds) |
| **Sonniss GDC Bundle** | Royalty-free for media/game production (no AI/ML training use); no attribution required | Bulk percussion/ambience for the chase-music layer; huge (7+ GB), pick a handful | [gdc.sonniss.com](https://gdc.sonniss.com/) · [license terms](https://sonniss.com/gdc-bundle-license/) |
| **OpenGameArt.org** | Mixed (CC0/CC-BY/GPL per asset — check each page) | Ready-made horror ambience beds | [Horror Sound Effects Library](https://opengameart.org/content/horror-sound-effects-library) (69 SFX, CC0-listed) · [Dark Ambience Soundscapes](https://opengameart.org/content/dark-ambience-soundscapes) · [Office horror music and ambience](https://opengameart.org/content/office-horror-music-and-ambience) |
| **Pixabay Sound Effects** | Pixabay Content License — free incl. commercial use, no attribution, cannot resell raw files | Quick one-offs, monitor beeps, mechanical sounds | [pixabay.com/sound-effects](https://pixabay.com/sound-effects/) · [license summary](https://pixabay.com/service/license-summary/) |

**Budget target:** ≤ 1.5 MB total (`.ogg`, ~96 kbps mono for SFX, ~64 kbps for ambience loops)
once P2 samples are added — keeps the current self-contained, no-CDN build principle
([docs/TECH_STACK.md](./TECH_STACK.md)) intact; still smaller than the two bundled fonts.

**Pipeline:** download → trim/normalize (Audacity, free) → convert to `.ogg` → pack into
Howler sprite sheets (`Howler.js` is already a dependency — this is the first real use of it)
→ keep every procedural sound as a **zero-network fallback** so the game never blocks on
asset load and stays fully offline-capable per [docs/PRD.md](./PRD.md) non-functional reqs.

## 7. Per-wing soundscapes (all 15 wings)

Matches [docs/LEVELS.md](./LEVELS.md). Each entry: **ambience bed** · **spot sounds** ·
**hazard loop** · **music/scare note** · **signature moment**.

### Wing 1 — Reception Wing ✅ built
- **Ambience:** low building hum + distant wind through the broken doors; occasional far
  paper-rustle from the waiting room.
- **Spot:** desk drawer creak near the reception desk; wheelchair wheel squeak if brushed.
- **Hazard:** `sfx_spark_loop` on the sweeping spark pole, panning as it sweeps.
- **Music:** calm layer only until the waiting room; tension layer kicks in when the enemy's
  patrol first triggers hearing.
- **Signature moment:** the flickering waiting-room light ([level01.ts](../src/world/levels/level01.ts)
  `flickerLight: true`) gets a matched *buzz-and-snap* sound synced to each flicker frame.

### Wing 2 — Records Room ✅ built
- **Ambience:** dry paper/dust tone; ceiling fan hum.
- **Spot:** `sfx_keycard` rising chime on pickup (distinct from checkpoint tone); shelf creak
  when climbing the crate to reach it.
- **Hazard:** none native to this wing (spill tile only) — reuse `sfx_hazard_zap`.
- **Music:** tension layer biased higher here — the aisles are built for stalking cover.
- **Signature moment:** a filing cabinet door swings shut on its own somewhere off-screen when
  the enemy enters `investigate` state — pure atmosphere, no gameplay effect, maximum dread.

### Wing 3 — Ward A ✅ built
- **Ambience:** distant cardiac monitor beep (arrhythmic, unsettling — not a steady beep).
- **Spot:** bed frame creak when climbed near; curtain rustle.
- **Hazard:** `sfx_door_open`/`sfx_door_close` on both timed auto-doors, offset per their phase.
- **Music:** chase layer gets its first real workout — the two-door gauntlet is built for it.
- **Signature moment:** if caught between both closed doors, a beat of near-total silence
  before the chase sting — the game's first "no way out" feeling.

### Wing 4 — Pharmacy
- **Ambience:** faint pill-bottle rattle shelving hum.
- **Hazard:** `sfx_laser_hum` (idle) / `sfx_laser_trip` (tripped) on the tripwires.
- **Signature moment:** lasers strobe-lit in red should each have a *slightly* different pitch
  hum, so a blind player can differentiate two close-together beams by ear.

### Wing 5 — Radiology
- **Ambience:** electrical high-voltage hum from the scanner equipment.
- **Hazard:** `sfx_scanner_servo` on the rotating arm, Doppler-pitched as it sweeps past.
- **Signature moment:** the scanner's sweep sound should be loud/close enough that timing a
  crossing is audio-readable without watching it — an accessibility-friendly hazard.

### Wing 6 — The Morgue
- **Ambience:** refrigeration compressor hum, much colder/thinner than other wings; occasional
  metallic tick (a cooling drawer).
- **Spot:** `sfx_slip` whoosh on the icy floor; sliding drawer squeal when used as cover.
- **Music:** the calm layer itself gets a colder EQ here (down-shift the drone's low end).
- **Signature moment:** the enemy's own footsteps go slightly muffled/slower here too — it's
  cold for everyone.

### Wing 7 — Stairwell
- **Ambience:** echoing stairwell reverb (largest reverb bus preset — long tail).
- **Spot:** each landing gets a footstep reverb boost; a distant door slam echoes from above
  or below at random.
- **Signature moment:** the enemy's footsteps on a *different flight* of stairs should be
  audible-but-directionally-ambiguous — the vertical equivalent of "it's near, which way?"

### Wing 8 — Ventilation
- **Ambience:** `sfx_fan_whir` bank, several fans at slightly different pitches (beating tone).
- **Hazard:** fan blade whir rises sharply in volume/pitch right before the touch-respawn zone.
- **Signature moment:** crawl sections drastically narrow the stereo field (near-mono) so
  emerging back into the duct room is an audible "opening up" moment.

### Wing 9 — Operating Theatre
- **Ambience:** sterile silence — the quietest wing bed in the game, by design.
- **Hazard:** `sfx_cart_roll` squeaky wheel on the moving equipment carts; overhead lamp buzz
  during its sweep.
- **Signature moment:** because the ambience is near-silent, the enemy's breathing loop
  (§4.3) becomes the loudest thing in the wing — intentional showcase of that system.

### Wing 10 — Flooded Basement
- **Ambience:** water drip loop + distant flow/rush; every step is `sfx_splash`, not tile.
- **Hazard:** `sfx_splash`-heavy sluice gate mechanism, a heavy metallic groan on the timed gate.
- **Signature moment:** the enemy visibly (and audibly) wades slower here — its footstep sound
  swaps to a heavier splash, telegraphing that a chase here favors the player.

### Wing 11 — Boiler Room
- **Ambience:** `amb_wing11_boiler` mechanical rumble bed, the loudest/densest ambience in the
  game — deliberately makes the enemy harder to hear (a real threat-mix moment).
- **Hazard:** `sfx_steam_burst` on each jet, loud enough to be startling but always preceded by
  a rising hiss telegraph (fair warning).
- **Signature moment:** because ambience masks the enemy here, lean harder on the *visual*
  danger vignette (already exists, [style.css](../src/style.css) `#fx-danger`) to compensate.

### Wing 12 — Security Wing
- **Ambience:** faint electronic surveillance hum; camera servo clicks (non-gameplay, texture).
- **Hazard:** `sfx_laser_hum`/`trip` (denser grid than Pharmacy) + `sfx_lever` on the 3 breakers.
- **Signature moment:** each breaker thrown should audibly change the room tone (one less hum
  layer per lever) — the player *hears* progress toward unlocking the exit.

### Wing 13 — Quiet Ward
- **Ambience:** the tensest calm bed in the game — long silences broken by single distant
  sounds (a cart rolling, a cough) that are **not** the enemy, to train paranoia.
- **Music:** tension layer is present almost constantly; calm layer barely used.
- **Signature moment:** the enemy here should have a much longer breathing-loop audible range
  than elsewhere (§4.3) — the wing's whole identity is "you can hear it before you can see it
  through the pillars."

### Wing 14 — Generator Room
- **Ambience:** dense mechanical hum across 3 hazard bays, each bay's hazard loop mixed
  slightly differently so a player can tell bays apart with eyes closed.
- **Hazard:** `sfx_steam_burst`/spark loops per bay + `sfx_lever` on each restore-power step.
- **Signature moment:** power restoring should cascade audibly wing-wide — lights (existing
  flicker system) hum up to steady brightness in sync with a rising drone.

### Wing 15 — Main Exit Gauntlet
- **Ambience:** a layered callback — brief motifs from wings 1–14 audible in sequence as you
  pass through connected areas (cheap, huge payoff: the whole game's soundscape in miniature).
- **Music:** all three layers used at full intensity; the finale should be the loudest, most
  saturated mix in the game.
- **Signature moment:** the final door's `sfx_exit_unlock` swells into a **new** sustained
  chord that keeps ringing under the escape cutscene — the sound design's own "reward," distinct
  from every other unlock stinger in the game.

## 8. Phased rollout (maps to BETTERMENT.md priorities)

| Phase | Scope | BETTERMENT ref |
|---|---|---|
| **P0** | Wire the two dead calls: `AudioEngine.jump()` and AudioContext-suspend on pause/hidden-tab | §12.2, §12.3 |
| **P1** | Footsteps (player + enemy, procedural), 3-layer music intensity, distinct keycard/checkpoint/door/hazard sounds — all procedural, zero new asset weight | §7.1–§7.4 |
| **P2** | Spatial panning (`PannerNode`/Howler), generated-IR reverb + LOS occlusion, first real sample pack pull (Kenney + Freesound CC0 picks from §5/§6), per-wing ambience beds for wings 4–15 as they're built | §7.5–§7.7 |
| **P3** | Full 15-wing sample pass, optional wing-intro VO (ties to [LORE.md](./LORE.md) §7), mastering pass (loudness normalization across all buses) | — |
