# BETTERMENT.md — Critical Evaluation & Improvement Spec

> **What this is:** an honest game-critic review of *Escape the Hospital Lobby* as it plays
> today, followed by a complete, prioritized improvement spec. Every entry is written as
> **What's wrong → Why it matters → How to fix it** with file/function references, so any
> developer or AI agent can execute it without re-deriving context.
>
> **Evaluated build:** commit `f80f6b1` · live at <https://escape-the-hospital-lobby.vercel.app>
> · evaluated 2026-07-23 (played on desktop Chrome, headless smoke runs, full code audit).
> **Priorities:** P0 = fix before anything else · P1 = next pass · P2 = polish · P3 = later.
> **Effort:** S ≈ under an hour · M ≈ a session · L ≈ multiple sessions.

---

## 1. Verdict

The bones are genuinely good: a tuned kinematic controller (coyote time, jump buffering,
auto-step), a real enemy brain (FSM with sight/sound perception and line-of-sight raycasts),
three difficulty tiers that actually change the hunt, persistent progression, and a
cross-platform input layer — all shipping with zero console errors. But the moment you play
it, it announces itself as a **prototype**: rooms are tiny grey boxes you clear in seconds,
checkpoints silently fail unless you stand on them, a death can respawn you *on top of* the
enemy, there are no footsteps in a horror game, and the enemy can never catch a player who
simply walks away. The systems are production-grade; the *game built on them* isn't yet.

### Scorecard

| Area | Score | One-liner |
|---|---|---|
| Core feel (move/jump/camera) | 7/10 | Genuinely good controller; camera solid after tuning |
| Systems & code architecture | 8/10 | Clean, data-driven, disposed properly, zero errors |
| Game design (verbs, stakes) | 4/10 | Walk, jump, one keycard — nothing else to *do* |
| Level design | 3/10 | Too small, boxy, no landmarks; beaten in seconds |
| Enemy & challenge | 4/10 | Smart brain, but mathematically unable to win a chase |
| Environment / art | 3/10 | Readable greybox; nothing says "abandoned hospital" yet |
| Sound design | 2/10 | Procedural blips only; no footsteps, no music layers |
| UI / UX | 6/10 | Complete flow, decent styling; missing remap/captions |
| Content | 2/10 | 3 of 15 wings; no reward at the end of the slice |

---

## 2. What already works (don't break these)

- **Controller feel** — [Player.ts](src/engine/Player.ts): coyote time + jump buffer + auto-step
  + snap-to-ground; jump force user-tuned to 6.5.
- **Enemy brain** — [EnemyAI.ts](src/ai/EnemyAI.ts) (pure, testable FSM: patrol → investigate →
  chase → search) + [Enemy.ts](src/ai/Enemy.ts) (FOV + LOS raycasts, hearing, obstacle *and*
  ledge avoidance — it never falls).
- **Difficulty tiers** — [Difficulty.ts](src/core/Difficulty.ts) scale sight/speed/persistence/
  hearing/lives and are honestly labeled in the UI.
- **Progression & save** — versioned localStorage ([Save.ts](src/core/Save.ts)), sequential
  unlock, best times, level select with locked/soon states.
- **Cross-platform input** — unified `InputState`; keyboard+mouse free-look, virtual joystick,
  full `preventDefault` (no more browser find-bar).
- **Ops** — `tsc` clean, self-contained build, GitHub → Vercel auto-deploy, zero-error smoke runs.

---

## 3. P0 — Critical flaws (fix before adding anything)

### 3.1 Checkpoints require standing on a spot — must become automatic crossing lines
> ✅ **Fixed.** `LevelManager.updateCheckpoints` now activates on `playerPos.z <= trigger.z`
> (furthest line crossed per frame, any x/height). `radius` dropped from `Level.ts`.
> `kit.checkpointPad` (small ring) replaced with `kit.checkpointStrip(z, width, xCenter)` — a
> full-width floor strip that brightens once crossed. Verified via headless test: a checkpoint
> fired while 5–6 units off-center in the waiting room (well beyond the old 3-unit sphere).
- **What's wrong:** [LevelManager.ts](src/world/LevelManager.ts) `updateCheckpoints()` activates
  a checkpoint only when `playerPos.distanceTo(trigger) <= radius` with `radius: 3` — a small
  sphere in the middle of the corridor. Hug a wall, weave between the seats, or jump through
  the doorway and the checkpoint **silently never fires**; your next death sends you back to
  the start of the wing.
- **Why it matters:** invisible progress loss is the single most rage-inducing failure in a
  checkpoint game. The player did the work; the game just didn't notice.
- **How to fix (S):** all built levels progress toward **−z**, so make checkpoints
  **crossing lines**: checkpoint *i* activates when `playerPos.z <= checkpoints[i].trigger.z`
  — any x, any height, even mid-air. Activate the *furthest* line crossed each frame so none
  can be skipped. Drop the `radius` field from [Level.ts](src/world/Level.ts) (or keep it
  unused for compat). Replace the small `checkpointPad` rings in [kit.ts](src/world/kit.ts)
  with **full-width glowing floor strips** at the trigger z, with an `activate()` state
  (brighter, color-shift) so crossing is visibly confirmed.

### 3.2 Respawns can place you on top of the enemy
> ✅ **Fixed.** `Enemy.resetAwayFrom(respawnPos)` resets to the patrol waypoint furthest from
> the respawn (replaces the blind `reset(enemySpawn)`). `Player.respawn(pos, faceYaw)` now
> faces −z; `CameraRig.snapBehind(heading)` instantly re-seats the camera. Grace bumped to
> 2.0 s after a *caught* death (`RESPAWN_GRACE_CAUGHT`) vs 1.6 s for fall/hazard.
>
> **Bonus finding while verifying this:** `Game.startRun()` never set the camera's initial yaw,
> so a fresh run inherited whatever arbitrary angle the menu's orbiting camera left behind —
> confirmed via a debug position readout, a player could press Play and immediately walk
> *backward* into the spawn wall. Fixed by calling `cameraRig.snapBehind(RESPAWN_FACE_YAW)` in
> `startRun()` too, not just on mid-run respawn.
>
> **Second bonus finding:** the third-person auto-trail (`CameraRig.update`) chased the
> player's world-space facing every frame, which itself depends on the *current* camera yaw
> for any input with a lateral component — a one-frame-delayed feedback loop with no stable
> fixed point except pure-forward movement. Holding any diagonal or pure-strafe input caused
> the camera (and effective move direction) to **spin continuously** for as long as the key was
> held (confirmed empirically: a 900ms strafe-only burst rotated the effective heading enough
> to move the player *backward* instead of sideways). Fixed by gating the auto-trail on the raw
> local input (`Math.abs(input.move.x) < 0.5`, camera-independent) so it only engages on
> mostly-forward/back movement — strafing now holds the camera still, matching standard
> third-person convention, instead of spinning.
- **What's wrong:** in [level01.ts](src/world/levels/level01.ts), checkpoint 2's respawn `pos`
  is `(0, 1.4, −20)` and `enemySpawn` is `(0, 1.4, −20)` — **identical coordinates**.
  `Game.respawn()` resets the enemy to `enemySpawn` at the same moment it respawns the player,
  so dying mid-wing can put the Presence *in your face* the instant grace expires. The camera
  also keeps its stale angle and the character its stale facing.
- **Why it matters:** deaths must feel fair or players quit. Spawn-camping by design is a bug.
- **How to fix (S/M):**
  1. [Enemy.ts](src/ai/Enemy.ts): add `resetAwayFrom(respawnPos)` — reset to the **patrol
     waypoint furthest from the player's respawn** (enforce ≥ 10 units when possible).
  2. [Player.ts](src/engine/Player.ts): `respawn(pos, faceYaw = π)` — face the objective (−z).
  3. [CameraRig.ts](src/engine/CameraRig.ts): add `snapBehind(playerPos, yaw)`; call from
     `Game.respawn()` so the camera re-seats behind the player looking down-level.
  4. [Game.ts](src/game/Game.ts): bump `RESPAWN_GRACE` to 2.0 s after a *caught* death.

### 3.3 Levels are far too small
> ✅ **Fixed.** All three built wings widened to their target scale: Level 1 ~55m→**~108m**
> (added a 4th room, Supply Room), Level 2 ~30m→**~96m** (5×4 aisle maze, keycard moved deep in,
> exit is now its own room), Level 3 ~38m→**~105m** (added a 3rd bed bay + 3rd auto-door for
> escalation). See the updated [docs/levels/01–03](docs/levels/) for exact new layouts.
>
> **Bug found while widening (real, not cosmetic):** hazard/fall respawns had **no grace period**
> at all — only the enemy-catch check was gated on `graceTimer`. When Level 1's new checkpoint-2
> position landed a few units from a `hazardTile`, dying there re-triggered the same hazard the
> very next frame, forever, with zero way to recover (confirmed via an instrumented death log
> during verification). Fixed by gating **all three** death checks (fall/hazard/caught) behind
> `graceTimer <= 0` in `Game.updatePlay()`, not just the catch — this protects every future
> level from the same class of bug, not just Level 1's specific coordinates. Also repositioned
> the specific hazard tile that triggered it off the walking centerline (it previously covered
> x=0 even with player-capsule padding, making "walk straight" never actually safe).
- **What's wrong:** Level 1 spans ~55 m (z +10 → −45) with 16×14 / 14×12 rooms and is
  walkable start-to-exit in **~25 seconds**; L2 ends at z=−22, L3 at z=−30 — even shorter.
  Our own [docs/LEVELS.md](docs/LEVELS.md) targets 1:00–2:00 for these wings.
- **Why it matters:** scale *is* the prototype feel. A horror hunt needs room to stalk, hide,
  lose the enemy, and get lost yourself. In rooms this small the enemy is either on you or
  irrelevant, and every wing feels like a corridor sprint.
- **How to fix (L):** target **2.5–3×** current footprint per wing and 2:30–4:00 first-clear
  time: 4–6 distinct rooms per wing (not 2–3), side rooms and dead-ends worth peeking into
  (lore/collectibles — §5), at least one loop (two routes between key rooms) so the enemy can
  be *evaded* rather than outrun, and corridor lengths that create real sightlines (15–25 m).
  The kit already supports this — it's authoring work in `levels/level0*.ts`, no engine change.

### 3.4 The enemy can never win a footrace
> ✅ **Fixed.** Chase speeds raised to 4.5 / 5.5 / 6.5 (Easy/Normal/Nightmare) — between walk
> (5.0) and sprint (8.5), so sprint is now the real escape verb. Added the suggested lunge
> (×1.4 speed, 0.8 s, 4 s cooldown) while actively chasing in sight, in `Enemy.update()`.
- **What's wrong:** chase speeds in [Difficulty.ts](src/core/Difficulty.ts) are 2.6 / 3.4 / 4.4
  — all **below** the player's *walking* speed of 5.0 ([Player.ts](src/engine/Player.ts)
  `walkSpeed`), let alone sprint (8.5). On every difficulty, calmly walking backward is a
  complete counter to the entire threat system.
- **Why it matters:** the hunt is the game's core tension, and it's theatrical, not real.
- **How to fix (S):** make chase speed sit **between walk and sprint** (e.g. Easy 4.5 /
  Normal 5.5 / Nightmare 6.5) so **sprint becomes the escape verb** — and sprint already
  generates noise the enemy hears (`Game.updatePlay` → `noise`), creating a real risk/reward
  loop. Add a short lunge (×1.4 speed for 0.8 s, 4 s cooldown) in `chase` state for spice.

### 3.5 The slice has no ending
- **What's wrong:** only 3 of 15 wings exist and clearing Ward A just returns you to Level
  Select ("Soon"). There's no reward moment anywhere ([docs/GAME_DESIGN.md](docs/GAME_DESIGN.md)
  promises an escape + reward).
- **Why it matters:** even a 3-wing slice needs a *finale* — right now the game just stops.
- **How to fix (M):** a "Slice Complete" sequence after Wing 3: doors open, light floods the
  corridor, camera pulls away, stats card (total time, deaths, difficulty) + "More wings
  coming" — 80% of the payoff for 5% of the full reward work.

---

## 4. Game design gaps (P1 unless noted)

| # | What's wrong | Why it matters | How to fix | Effort |
|---|---|---|---|---|
| 4.1 | **Only verbs are walk/jump.** `interactPressed` exists in [Input.ts](src/core/Input.ts) but nothing except the keycard consumes anything. | Nothing to *decide* moment to moment. | Add 2 cheap verbs: **hide** (lockers/under gurneys — enemy loses LOS, heartbeat spikes) and **doors you can close** behind you (delays enemy 2 s; it bangs them open — free scare). | M |
| 4.2 | **No risk/reward.** Nothing optional exists. | No reason to explore; nothing to weigh against the hunt. | 3 **collectible files** per wing in risky spots; shown on win screen (2/3); unlock a cosmetic at milestones. | M |
| 4.3 | **Sprint has no cost surfaced.** Noise exists in code but is never *communicated*. | Players can't learn a rule they can't perceive. | Noise-ring UI pulse at the player's feet while sprinting; enemy "?" toast/growl when it hears. | S |
| 4.4 | **No narrative framing.** You wake up… because. | Horror needs a *why*; costs almost nothing. | Full story bible now written — see **[docs/LORE.md](docs/LORE.md)** (hospital, the Incident, the Presence, per-wing beats, 8+ ready-to-drop-in notes for Wings 1–3). 4-line intro card per wing + collectible files carry the rest. | S |
| 4.5 | **Enemy never escalates mid-level.** One config for the whole wing. | Long wings (after §3.3) will sag in the middle. | After each checkpoint crossed, +5% enemy speed & sight (cap at +15%) — quiet ratchet. | S |
| 4.6 | **P2 — No stamina.** Infinite sprint trivializes chases once 3.4 makes sprint the escape verb. | Chases end when the player stops sprinting, not when the game decides. | 4 s sprint tank, 2 s regen delay; UI sliver under the lives row. | M |

---

## 5. Level design (beyond size)

| # | What's wrong | Why it matters | How to fix | Effort |
|---|---|---|---|---|
| 5.1 | **No landmarks.** Every wall is the same pale green; after one camera swing you don't know which way is forward. | Disorientation ≠ horror; it's friction. | One **silhouette landmark** per room (collapsed shelving, ambulance doors, glowing vending machine); color-zone each wing (Reception teal / Records amber / Ward green). | M |
| 5.2 | **No verticality.** Everything is one flat plane. | Flat spaces read small and play samey. | Balconies over lobbies, a half-floor mezzanine, stair landings — kit needs a `ramp()`/`stairs()` helper (enemy already handles autostep 0.35). | M |
| 5.3 | **No safe/unsafe rhythm.** Enemy zone is the whole wing. | Tension needs release to spike again. | Small "safe rooms" (bright, door closes, heartbeat fades) between hunt zones — also natural checkpoint spots. | S |
| 5.4 | **Hazards don't combine with the hunt.** Spark pole and spills exist in empty rooms; the enemy patrols elsewhere. | The two systems never multiply. | Place hazards on the *escape* routes so fleeing forces timing choices; auto-doors that the *enemy* can also be blocked by. | S |
| 5.5 | **Exit is visible from spawn** in small wings (beacon piercing fog). | Kills any sense of journey. | With bigger wings (§3.3), gate the beacon behind the first turn; reveal it as a *moment*. | S |

---

## 6. Environment & art

| # | What's wrong | Why it matters | How to fix | Effort |
|---|---|---|---|---|
| 6.1 | **Flat single-color materials** on every wall/floor read as greybox. | This is 70% of the "prototype look". | Extend the canvas-texture approach ([kit.ts](src/world/kit.ts) `makeTileTexture`) to walls: tiles + grout, grime gradient at floor level, occasional stain decal; a second dirtier variant per wing. | M |
| 6.2 | **No atmosphere particles.** Air is sterile. | Dust in a flashlight beam is the cheapest horror in the book. | One `THREE.Points` system (~200 sprites) drifting in light pools; respects Reduced Motion. | S |
| 6.3 | **No windows/exterior.** Sealed boxes, no world outside. | Windows + moonlight shafts = depth + free lighting drama. | Kit `window()` cutout: dark blue plane + volumetric-ish light cone + rain streaks canvas texture. | M |
| 6.4 | **Enemy isn't scary at a glance.** Boxy grey figure; red eyes only read up close. | The monster is the poster of a horror game. | Taller (2.4 m), longer arms, head-tilt twitch already exists — add a faint red **eye light** (PointLight) so its gaze projects, and a smoke-trail of dark particles when chasing. | M |
| 6.5 | **Player character is generic.** Fine for now; body seen only in third person. | Low priority. | Post-slice: swap `CharacterModel` for a rigged CC0 glTF (interface already isolates this). | L/P3 |

---

## 7. Sound design — the biggest gap

Everything below currently **does not exist**; audio is procedural blips + one drone
([Audio.ts](src/core/Audio.ts)). For a horror game this is the most impactful section
of this document.

> **Full sound bible now written** — see **[docs/SOUND_DESIGN.md](docs/SOUND_DESIGN.md)**:
> mix architecture, a ~50-entry SFX/music asset table with exact code-hook triggers, a
> per-wing soundscape for all 15 wings, and license-checked sourcing (Freesound, Kenney,
> Sonniss, OpenGameArt, Pixabay). The table below is the short version.

| # | Missing | Why it matters | How to fix | Effort |
|---|---|---|---|---|
| 7.1 | ✅ **Fixed** — footsteps (player *and* enemy) | The #1 presence cue in horror; enemy steps = free dread radar. | `CharacterModel`/`EnemyModel` detect a step each gait half-cycle (`consumeStepEvent()`); `AudioEngine.footstepPlayer()`/`footstepEnemy(distance)` play a filtered-noise burst, enemy volume falls off with distance. Stereo pan is still P2. | M |
| 7.2 | ✅ **Fixed** — chase music intensity system | Music should *know* you're hunted. | `AudioEngine.setIntensity('calm'\|'tension'\|'chase')` crossfades 3 gain buses (calm drone / tension pulse / chase percussion loop) under `musicGain`, driven every frame in `Game.updatePlay` by `EnemyBrain.state` (patrol→calm, investigate/search→tension, chase→chase). | M |
| 7.3 | ✅ **Fixed** — doors, hazards, keycard | Silent auto-doors and spark poles break believability. | `kit.ts` tracks door open/close transitions (`consumeDoorToggles()`) → `AudioEngine.doorSlide(opening)`; keycard/checkpoint/hazard-hit each got their own distinct sound (`keycard()`, `checkpoint()`, `hazardZap()`) instead of all sharing `select()`. Continuous spark-loop ambience on `sweepingHazard` itself is still P2. | S |
| 7.4 | ✅ **Fixed** — win/lose stingers | The biggest moments are silent. | `AudioEngine.winSting()`/`loseSting()`, called from `App.handleWin`/`handleFail`. | S |
| 7.5 | **Spatial audio** | Sound tells you *where* the threat is. | Howler is already a dependency but **unused** — either use its stereo API or Web Audio `PannerNode` for enemy/hazard sources. | M |
| 7.6 | ✅ **Fixed** — dead code / gaps | `Audio.jump()` existed but was never called; ambience kept playing on the pause screen/hidden tabs. | `Player.consumeJustJumped()` now wired to `AudioEngine.jump()` in `Game.updatePlay`; `AudioEngine.suspend()` called from `App.pause()` (covers both paths — `visibilitychange`/`blur` already route through `pause()`). | S |
| 7.7 | **Reverb** | Dry sound reads as "web demo". | One `ConvolverNode` with a generated impulse response (noise burst + decay), mixed subtly on the sfx bus. | S |

---

## 8. UI / UX

| # | What's wrong | Why it matters | How to fix | Effort |
|---|---|---|---|---|
| 8.1 | **No key remapping** — promised in [docs/PRD.md](docs/PRD.md) (F8) and About. | Accessibility + trust: the docs advertise it. | Settings → Controls: click-to-rebind rows writing a `keymap` into `Save`; `Input.ts` reads the map instead of literal codes. | M |
| 8.2 | **No captions** for growl/heartbeat/steps — also promised (PRD a11y). | Deaf/HoH players lose the *only* threat telegraphs. | Caption line above the objective pill: "(low growl — it sees you)"; toggle in Settings. | S |
| 8.3 | ✅ **Fixed** — win screen hardcoded "Reception Wing" | Visible bug on every later wing. | `UI.showWin` now takes a `levelName` param, wired from `App.handleWin` via `Game.getLevelName()`. | S |
| 8.4 | **No best-time delta on win.** | "−2.3 s vs best" is the entire speedrun loop, for free. | Compare vs `Save.getBestTime(id)` *before* recording; show delta + "NEW BEST" state. | S |
| 8.5 | **Controls hint vanishes forever** after 7 s. | New players who missed it have no recourse in-game. | Keep it until first successful jump *and* look; re-show for 3 s after respawn. | S |
| 8.6 | **No save-reset** option. | Testers/streamers need a fresh start; today it means DevTools. | Settings → "Reset progress" with confirm step. | S |
| 8.7 | **P2 — No gamepad**, promised as "later" in docs. | Couch/Steam-Deck-browser players. | Map Gamepad API into `InputState` (stick = move/look, A = jump, X = interact). | M |

---

## 9. Game feel / polish

| # | What's missing | Why it matters | How to fix | Effort |
|---|---|---|---|---|
| 9.1 | Landing has no visual weight | Jumps end abruptly; feel flat. | 100 ms squash (scale y 0.9) on `consumeJustLanded` + dust puff sprite. | S |
| 9.2 | Sprint feels identical to walk | Speed change without sensation. | FOV 70 → 76 ease while sprinting; subtle camera bob tied to gait phase. | S |
| 9.3 | Catch has no impact | The scariest moment is a fade. | 150 ms screen shake + freeze-frame + louder sting (all gated by Reduced Motion). | S |
| 9.4 | Menu → game is a hard cut | `CameraRig.menuUpdate` orbit snaps to gameplay cam. | 0.8 s eased blend from orbit pose to follow pose on Play. | M |
| 9.5 | Doors/platforms move linearly | Cosine positions exist but velocity feel is constant. | Ease-in-out on `autoDoor`/`sweepingHazard` phases; slight anticipation pause at extremes. | S |

---

## 10. Performance

| # | Issue | Evidence | How to fix | Effort |
|---|---|---|---|---|
| 10.1 | **2.82 MB JS (994 KB gz) single chunk** | Build output; Vite warns >500 KB. | Dynamic-`import()` Rapier in `Physics.init()` (it's already async); `build.rolldownOptions` `manualChunks`: `three`, `rapier`, app. Boot screen already covers the load. | M |
| 10.2 | Many point lights per wing | L1 has ~8 point lights + emissives; mobile forward lighting cost. | Cap active lights: only rooms within ~25 m of the player get their light enabled (kit tracks room centers). | M |
| 10.3 | Every prop casts shadows | `solid()` defaults `cast=true` even for walls/floors. | Cast shadows only for props/characters; walls receive-only (partially done — audit). | S |
| 10.4 | No real-device mobile pass | Touch controls exist but perf untested on phones. | One session on a mid Android: fps, DPR cap, joystick ergonomics. | S |

---

## 11. Accessibility (promised vs delivered)

[docs/PRD.md](docs/PRD.md) promises: remappable keys ✗ (8.1) · captions ✗ (8.2) ·
colorblind-safe hazard cues **✓ partial** (hazards are color + shape/animation) ·
reduced-motion **✓** (grain/flicker/pulses gated) · sensitivity/invert **✓**.
Close the two ✗ items before calling the a11y story done.

## 12. Bugs & nits (quick kills, all S)

1. ✅ `showWin()` subtitle hardcoded to "Reception Wing" — fixed, see §8.3.
2. ✅ `Audio.jump()` defined, never called — fixed, see §7.6.
3. ✅ Ambient drone kept playing on the pause screen / hidden tab — fixed, see §7.6.
4. Fixed smoke-test selector: pause detection looks for an `h2` "Paused" that moved into the
   kicker (test-only, but keeps reporting a false negative).
5. `.gitignore` has both `.vercel/` and a stray `.vercel` line (harmless duplication).
6. First-person mode: exit beacon/signage `fog:false` materials render at full brightness even
   very far away — slightly cheap-looking; scale opacity by distance.
7. ✅ **Found + fixed during verification:** a fresh run never set the camera's initial yaw, so
   pressing Play could send the player walking backward into the spawn wall (leftover angle
   from the menu's orbiting camera). See §3.2.
8. ✅ **Found + fixed during verification:** the third-person auto-trail chased a target that
   depended on its own current yaw for any non-forward input, causing the camera (and
   effective movement direction) to spin continuously while strafing/diagonal-moving. See §3.2.

---

## 13. Prioritized roadmap

| Priority | Items | Outcome |
|---|---|---|
| **P0** | ✅ done — 3.1 auto-checkpoints · 3.2 fair respawns (+ camera start-facing & auto-trail-spin fixes found while verifying) · 3.4 chase speeds/lunge · 8.3 win-screen name · 7.6 jump sound & audio suspend | The two rage-quits are gone; the hunt is real |
| **P0.5** | ✅ done — 3.3 bigger wings ×3 (~100m each) · universal death-grace-period bug (fall/hazard/caught all gated) · hazard tiles get automatic warning-stripe texture + pulse instead of a flat placeholder color | No more 40-second levels, no more infinite death loops, hazards read as hazards |
| **P1** | ✅ done — 7.1 footsteps · 7.2 music layers · 7.3 hazard/door/keycard/checkpoint sfx · 7.4 win/lose stingers | Sound no longer reads as "web demo" |
| **P1.5** (next) | 3.5 slice finale · 5.1 landmarks · 4.1 hide verb · 8.2 captions · 8.4 best-time delta | Stops feeling like a prototype |
| **P2** | 4.2 collectibles · 4.6 stamina · 6.1 wall textures · 6.2 dust · 6.4 scarier enemy · 8.1 remapping · 8.7 gamepad · 9.x feel pack · 10.1 code-split | Feels like a finished small game |
| **P3** | Wings 4–15 · full reward/escape sequence · rigged characters · leaderboards · PWA | The complete 15-wing vision |

---

*This document is the actionable follow-up to [docs/LEVELS.md](docs/LEVELS.md) and
[docs/GAME_DESIGN.md](docs/GAME_DESIGN.md). When an item ships, mark it ✅ here with the
commit hash rather than deleting it.*
