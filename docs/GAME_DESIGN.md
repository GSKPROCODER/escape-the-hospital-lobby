# Game Design Document (GDD) — Escape the Hospital Lobby

> **Status:** Draft v1
> **Purpose:** Defines *how the game feels and plays* — theme, core loop, movement, camera, feedback, and the final reward. Pairs with [PRD.md](./PRD.md) (what/why) and [LEVELS.md](./LEVELS.md) (per-level detail).

---

## 1. Theme & Tone

An **abandoned, haunted hospital** at night. Flickering fluorescent lights, peeling paint, rusted gurneys, broken elevators, a morgue, a boiler room, ventilation shafts. **Horror-lite**: eerie atmosphere, jump-tension, chase moments — **not** gore or graphic violence (keeps it broadly accessible).

- **Emotional arc:** confusion → dread → mounting urgency → triumphant escape.
- **Pacing:** alternate tense/quiet levels so scares land; ramp urgency toward level 15.

## 2. Art Direction

- **Style:** low-poly / stylized realism (readable silhouettes, performance-friendly).
- **Palette:** desaturated teals, sickly greens, cold whites; **hazard accent = warning orange/red** (paired with a shape cue for colorblind safety).
- **Lighting:** baked ambient + a few dynamic lights; flickering fluorescents as mood + gameplay signal.
- **Readability first:** platforms, hazards, and goals must be instantly distinguishable from décor.

## 3. Audio Direction

- **Ambience:** hospital hum, distant drips, wind, occasional distant scream/whisper.
- **Stingers:** short musical/SFX hits on death, checkpoint, level clear, and scare beats.
- **Diegetic cues:** hazards announce themselves audibly (fan whir, laser hum, floor creak) — always paired with a **visual** cue and **caption** for accessibility.
- **Music:** low, tense drones during play; a rising, hopeful cue on the final escape.

## 4. Core Loop

```
Spawn at checkpoint → read the level's objective → navigate obstacles/solve puzzle
   → (fall/hit hazard → respawn at last checkpoint) → reach level exit
   → level-clear feedback → next level unlocks → repeat → escape + reward
```

## 5. Movement Model

- **Actions:** move (WASD/arrows or joystick), look (mouse/drag), **jump** (space/button), interact (E/button) for puzzles/levers/keys.
- **Feel:** responsive, slightly forgiving — coyote time on ledges, small jump buffer, clear jump arc. Obbies live or die on jump feel; tune generously.
- **Physics:** grounded character controller with gravity, capsule collision; some levels add surface modifiers (slippery morgue floor, sticky mud, conveyor gurneys).
- **Death/fall:** falling out of bounds or touching a lethal hazard → brief fade → respawn at last checkpoint. No lives; unlimited retries (reduce frustration, keep flow).

## 6. Camera

- **Default:** third-person follow camera (over-the-shoulder), collision-aware so it doesn't clip walls.
- **Optional:** first-person toggle (setting) for immersion in tight/horror levels.
- **Mobile:** camera orbit via right-side drag; auto-assist framing on landing.

## 7. Difficulty Curve

- Levels **1–3**: teach movement, jumping, checkpoints (low threat).
- Levels **4–9**: introduce one new hazard/mechanic each; combine earlier ones.
- Levels **10–13**: multi-mechanic challenges, light puzzles, first chase.
- Levels **14–15**: mastery test + climactic escape gauntlet.
- Each new mechanic is **introduced in a safe pocket** before it becomes lethal. See [LEVELS.md](./LEVELS.md).

## 8. Hazard Taxonomy

| Type | Examples | Fail result |
|---|---|---|
| Gaps / falls | corridor holes, missing floor | respawn |
| Moving platforms | gurneys, elevators, conveyors | fall → respawn |
| Timing hazards | flickering-light "safe when lit", rotating fans, pistons | contact → respawn |
| Surface modifiers | slippery, sticky, breakable/collapsing floor | slide/fall → respawn |
| Trigger hazards | lasers, tripwires, pressure plates | contact → respawn |
| Environmental | flood/rising water, steam, darkness | drown/blind → respawn |
| Chase | "presence" that pursues in a scripted segment | caught → respawn segment |

## 9. Puzzles

Kept **light and physical** (fits an lobby): find & use a key/keycard, hit levers in sequence, restore power at a generator, redirect/avoid a beam, weight a pressure plate. Puzzle solutions must be discoverable from in-world cues, never obscure.

## 10. UI / HUD

- **In-game HUD:** minimal — level number/name, current timer, checkpoint pulse, interact prompt, (mobile) on-screen controls.
- **Menus:** Title (Play/Continue/Settings), Level Select (grid of 15, locked/unlocked/best time), Pause (Resume/Restart level/Settings/Quit to menu), Settings (audio, sensitivity, quality, controls, reduced-motion, first/third person).
- **Feedback:** checkpoint flash + sound; death fade + stinger; level-clear banner + door-opening cue.

## 11. Reward {#reward}

> **Proposed — open to change.** Flagged for user review.

On clearing **level 15**, the hospital's main doors open:

1. **Escape cutscene:** short scripted sequence — player runs through the opening doors into dawn light; music swells; the hospital fades behind.
2. **Reward screen:** a **"Certificate of Escape"** displaying total time, deaths, and (if implemented) collectibles found; plus a **cosmetic unlock** (e.g., a golden flashlight / survivor skin) usable in replays.
3. **Shareable result:** a "Share your escape" card (image/text) summarizing the run — no account needed.
4. **Endless/NG+ hook (later):** option to replay for best time (speedrun mode).

## 12. Save & Progression

- Persist: highest unlocked level, per-level best time, per-level completion, collectibles, current checkpoint of in-progress level, settings.
- Storage: browser `localStorage` (see [TECH_STACK.md](./TECH_STACK.md)). "Continue" resumes the furthest sensible point.

## 13. Accessibility Design

- Hazards use **color + shape/animation** (never color alone).
- Remappable keys, adjustable look/joystick sensitivity, first-person option.
- Captions for key audio cues; **reduced-motion** disables screen shake/heavy flicker.
- Generous jump assists (coyote time, jump buffer) reduce execution barriers.
