# Lore & Narrative Bible — Escape the Hospital Lobby

> **Status:** Design doc, not yet implemented (tracked as [BETTERMENT.md](../BETTERMENT.md) §4.4).
> **Purpose:** The complete story bible — setting, characters, per-wing narrative beats, and
> actual collectible-note text — so writing/implementing the game's narrative layer needs no
> further invention, only execution against the existing kit (`world/kit.ts`) and UI (`ui/UI.ts`).
> **Pairs with:** [docs/GAME_DESIGN.md](./GAME_DESIGN.md) (tone/reward already specified),
> [docs/LEVELS.md](./LEVELS.md) (the 15-wing structure this lore is built on top of), and
> [docs/SOUND_DESIGN.md](./SOUND_DESIGN.md) (audio delivery of these beats).

---

## 1. Premise & tone

**One line:** *You wake up alone in a hospital that was evacuated years ago for a reason no
official record explains — and something that was never evacuated is still doing its rounds.*

**Tone boundary (horror-lite, per [GAME_DESIGN.md](./GAME_DESIGN.md#1-theme--tone)):** dread,
tension, and one real monster — never gore, never shock-for-shock's-sake. The horror is
*institutional*: fluorescent lights that shouldn't still flicker, patient charts for people who
were never discharged, a building that keeps its own time. Every lore beat should read as
**found**, not narrated — you are always piecing it together, never told it.

## 2. The hospital

**St. Verena Memorial Hospital** — a mid-sized regional hospital, 15 wings across several
connected floors, built in the optimistic expansion era of its region's healthcare system and
shut down abruptly. It has stood sealed ever since, officially "under structural review,"
unofficially avoided by everyone who worked there.

**Why it's still standing (not demolished):** the closure is legally contested — the hospital
trust and an insurer have spent years disputing liability for **the Incident**, and nothing can
be torn down mid-litigation. Bureaucracy, not the supernatural, is why the building still exists
— a mundane reason that makes the abnormal thing living inside it feel *wronger*.

### The Incident
Eleven years before the game's present, a **containment failure in the sub-basement generator
and isolation ward complex** (Wings 14 and the deep end of the planned expansion) caused a
building-wide lockdown protocol to trigger during a night shift. Doors sealed. Backup power
partially failed. By the time the lockdown released, one patient in long-term isolation — chart
name redacted in every surviving document — was gone. Not discharged. Not found. Gone.

The hospital's answer was to seal the affected wings, relocate every remaining patient, and let
the legal fight bury the story. The public record calls it an "electrical containment event."
No document in the game ever calls it anything else. **The player pieces together the truth
entirely through the collectible notes** (§6) — the game never states it outright.

**Why the doors seal at night (the game's core mechanic, justified diegetically):** the same
lockdown protocol from the Incident never fully deactivated. Wing by wing, the building still
runs its old emergency doors and barrier systems on a timer, sealing the perimeter each night
"for structural safety" — which is also, not coincidentally, exactly when the Presence patrols.
This is *why* the exits are locked doors, timed auto-doors, and keycard checkpoints instead of
just open hallways — the environmental design (BETTERMENT.md §5) and the lore explanation are
the same system.

## 3. The player

Deliberately ambiguous but coherent — never fully explained, because over-explaining "why me"
undercuts the dread. Canon facts (revealed gradually via notes, never stated in dialogue):

- You are found the next morning by a night-shift security contractor doing a routine perimeter
  check, unconscious just inside the main doors, with no memory of entering.
- You are **not staff and not a patient** on any current or historical roster (a lore note in
  Wing 2's Records Room confirms this directly — see §6).
- A single detail recurs across notes as the story deepens: **your name almost — but not
  quite — matches a redacted entry from the Incident's patient list.** The game never resolves
  whether this is coincidence, and deliberately never will inside the 15-wing slice. It's the
  hook for a sequel/DLC, not a plot hole.
- Player-facing framing stays practical: you woke up trapped, the doors are sealed, something
  is patrolling, and the only way out is forward. The identity mystery is optional-depth flavor
  for players who collect the notes, not load-bearing for anyone who just wants to escape.

## 4. The Presence

**What it's called in-universe:** never given a name in dialogue or UI — patients' families
who pursued the litigation call it, per one recovered legal filing, simply **"the missing
patient."** Staff slang (found scrawled inside a locker in Wing 3) calls it **"Nightwalker."**
The player-facing UI term stays **"the Presence"** (already used in [GAME_DESIGN.md](./GAME_DESIGN.md)
and the difficulty-select copy) — consistent with keeping the truth just out of reach.

**Its rules (why the AI behaves the way it does, restated as lore, not mechanics):**
- It **cannot leave** the building — the same failed containment that let it go missing also
  seems to hold it *inside* St. Verena's walls. This is why escaping through the front doors
  (the actual win condition) is meaningful in-story, not just a level-exit trigger.
- It **patrols on a routine**, because for eleven years its entire experience of existing has
  been the hospital's night-shift rounds — it is, in a sense, still doing the job of the person
  it once was. This softens "monster" into "tragedy," which is the horror-lite tone this game
  wants (dread and pity, not slasher villainy).
- It **hunts by sight and sound** because — per a Wing 6 morgue note — whatever it lost in the
  Incident, it kept its senses. It reacts to sprinting/noise exactly as a real person would.
- **Difficulty scaling is diegetic:** Easy/Normal/Nightmare ([Difficulty.ts](../src/core/Difficulty.ts))
  can be read in-fiction as *how many nights since the last person got this far* — the further
  into the hospital's dormancy, the more "awake" and practiced the Presence has become. This
  gives future difficulty-select copy a story hook instead of being pure gameplay tuning.

**Escalation across acts:** in Act I (Wings 1–5) it is a routine, avoidable patrol. In Act II
(Wings 6–10) player notes reveal it's aware something is different this time — patrol patterns
tighten, it starts "waiting" near choke points. In Act III (Wings 11–15) it actively hunts from
the moment you enter each wing — mirroring the existing difficulty/enemy-aggression system
(BETTERMENT.md §4.5's proposed mid-level escalation is the mechanical expression of this).

## 5. Three-act structure across the 15 wings

Maps directly onto [docs/LEVELS.md](./LEVELS.md#overview) — no new wings invented, only meaning
layered onto the existing 15.

### Act I — "Routine" (Wings 1–5): the hospital still looks like a hospital
The player doesn't yet know anything is deeply wrong beyond "abandoned and locked." Notes are
mundane — shift-change memos, an angry email about supply shortages — with only faint,
easy-to-miss wrongness (a chart for a patient with no admission date; a memo about "the sealed
wings" that trails off).

| Wing | Beat | Environmental storytelling cue |
|---|---|---|
| 1. Reception Wing | You wake up; the doors are sealed behind you. | Visitor sign-in sheet, last entry dated the night of the Incident, never continued. |
| 2. Records Room | You are not in any patient or staff file. | A cross-referenced search left mid-query on an old terminal print-out; your near-name flagged in a redaction log (§3). |
| 3. Ward A | Beds still made; charts still clipped to rails. | One bed's restraint straps are undone from the *inside*. |
| 4. Pharmacy | Supplies untouched for over a decade. | A hand-written inventory count that stops mid-list, pen still on the counter. |
| 5. Radiology | The equipment still has power — someone kept it running. | A maintenance log shows scheduled upkeep visits continuing *years* past the official closure date. |

### Act II — "Something Kept" (Wings 6–10): the building admits it never really closed
Notes get personal — staff diary fragments, a nurse's private log, informal texts printed and
left behind. The Incident is named indirectly for the first time. The player starts finding out
the Presence isn't random.

| Wing | Beat | Environmental storytelling cue |
|---|---|---|
| 6. The Morgue | Confirmation something was never processed through here. | An intake log with one entry never signed off, drawer left open with the tag still attached, no body. |
| 7. Stairwell | Someone else tried to leave, floor by floor, and left signs. | Chalk tally marks on landings, counting nights — the count is unnervingly high. |
| 8. Ventilation | The building's systems were rerouted to keep something specific alive/contained. | A hand-drawn duct diagram taped inside, circling one sealed vent with "DO NOT" and no rest of the sentence. |
| 9. Operating Theatre | The last procedure this room ran wasn't a scheduled surgery. | An OR log with a redacted patient name and a time of night far outside normal scheduling. |
| 10. Flooded Basement | The flooding isn't accidental — a pipe was deliberately left open. | A hand tool left wedged in a valve, as if someone flooded this level on purpose, once, and never came back for the tool. |

### Act III — "It Remembers" (Wings 11–15): the truth, and the escape
The Presence is now actively hunting from the moment you enter. Notes stop being found
documents and start being addressed to *whoever finds this* — the last people in the building
knew the story wasn't over.

| Wing | Beat | Environmental storytelling cue |
|---|---|---|
| 11. Boiler Room | The generator failure that caused the Incident, finally explained. | A charred incident-report draft, mostly legible, describing "loss of containment, Ward — [redacted]," never filed. |
| 12. Security Wing | Camera footage from the night of the Incident should exist here — it doesn't. | An evidence log noting the relevant tape "missing from archive" with three different signatures disputing responsibility. |
| 13. Quiet Ward | The wing built for containment, not care. | Room numbering skips a sequence; the "missing" room number is the one at the end of the hall, door welded shut from outside. |
| 14. Generator Room | Ground zero. The actual containment failure happened here. | A shift log's final entries devolve from routine notes into single urgent words, then stop. |
| 15. Main Exit Gauntlet | Escape — and the building, for the first time in eleven years, lets someone leave. | The front doors, sealed since Wing 1, finally register as "unlocked" on the same old panel you saw at the start — full circle. |

## 6. Collectible lore items

**Format:** short paper documents (charts, memos, logs) discovered as optional pickups in
side-rooms/dead-ends — pairs naturally with BETTERMENT.md §4.2's proposed collectible system
(3 per wing) and can literally reuse the same pickup pattern already built for the Wing 2
keycard (`LevelKit.keycardAt` / `consumePickup` in [kit.ts](../src/world/kit.ts) and
[Level.ts](../src/world/Level.ts)) — a `noteAt()` kit primitive that opens a read-only text
panel instead of unlocking an exit.

**Full written notes for Wings 1–3** (ready to drop directly into the game):

> #### Wing 1 — Reception Wing: Visitor Sign-In Sheet (torn page)
> *Date · Name · Visiting · Time In · Time Out*
> …
> — · Marchetti, D. · Rm 214 · 22:10 · 22:40
> — · Okafor, T. · Rm 108 · 22:15 · —
> — · [smudged] · Rm — · 23:02 · —
>
> *(the sheet ends here — no further entries, though the binder has forty blank pages left)*

> #### Wing 1 — Reception Wing: Maintenance Memo
> To all reception staff — front doors are being fitted with the new auto-lock system this
> week per Facilities. Night shift: DO NOT prop the doors after 10 PM for any reason, even for
> smoke breaks. I know it's a pain. Corporate's orders after the incident review, not mine.
> — R. Alvarez, Facilities

> #### Wing 2 — Records Room: Query Terminal Printout
> SEARCH: patient/staff cross-reference — NAME: [partial match, low confidence]
> RESULTS: 0 exact matches. 1 near-match found in SEALED ARCHIVE (access restricted).
> Near-match record redacted per Records Retention Policy §12.
> *[the terminal has been powered off and the printout left folded inside the query slot]*

> #### Wing 2 — Records Room: Sticky Note on a Cabinet
> Told IT the search tool keeps flagging sealed files that shouldn't even be indexed anymore.
> They said it's a "residual reference" and to ignore it. Third time this month. — M.

> #### Wing 3 — Ward A: Nurse's Private Log (single page, folded small)
> Bed 4 restraints were undone again this morning. Not cut — *undone*, buckles and all. Bed 4
> hasn't had a patient assigned since before I started here. I checked. Twice.

> #### Wing 3 — Ward A: Discharge Chart, Incomplete
> Patient: [name redacted, admin override]
> Admission: [date matches Incident week]
> Discharge: — *(field left blank — chart was never closed out)*
> Attending physician sign-off: — *(also blank)*

**Outlines for Wings 4–15** (beat only — full text authored when each wing is built, following
the voice/style rules in §8):

- **4. Pharmacy** — an inventory count abandoned mid-tally; a torn note about stock going
  missing "again" with no explanation offered.
- **5. Radiology** — a maintenance contractor's invoice for servicing equipment years after the
  official closure, paid by an account nobody in Records recognizes.
- **6. The Morgue** — an intake log with one line item never checked off; a evidence tag with
  no corresponding drawer.
- **7. Stairwell** — chalk tally marks; a torn page from someone's personal notebook counting
  floors climbed, ending mid-sentence.
- **8. Ventilation** — a hand-drawn duct schematic with one vent circled and captioned "DO NOT—".
- **9. Operating Theatre** — an OR scheduling log with an off-hours entry, no PACU record after.
- **10. Flooded Basement** — a work order for a valve repair, marked complete, dated *after*
  someone already flooded the level on purpose (contradiction is the point).
- **11. Boiler Room** — the charred incident-report draft (the Incident's real cause, finally
  spelled out in damaged, mostly-legible prose).
- **12. Security Wing** — an evidence chain-of-custody log with the relevant tape marked
  "missing," three conflicting signatures.
- **13. Quiet Ward** — a room-numbering directory with one room number simply absent, no
  explanation given for the gap.
- **14. Generator Room** — the shift log that devolves in real time from routine to single
  urgent words, then silence — the Incident, from the inside, as it happened.
- **15. Main Exit Gauntlet** — no new note; instead, the visitor sign-in sheet from Wing 1
  reappears, and — if the player collected enough notes across the run — a new final line has
  appeared at the bottom in the same handwriting as the redacted staff notes: your own name,
  filled in, time-out finally recorded. *(This is the secret-ending hook, see §7.)*

## 7. Intro/outro scripts

### Wing intro cards (4 lines, shown on level load — reuses the existing screen/panel pattern
in [UI.ts](../src/ui/UI.ts), styled like the current `.panel` component)

- **Wing 1:** *"You don't remember walking in. / The doors are sealed behind you. / Somewhere
  in this building, the lights still work. / Find a way out."*
- **Wing 2:** *"Whoever kept these records left in a hurry. / See if they left anything about
  you."*
- **Wing 3:** *"The beds are still made. / Someone expected to come back."*
- **Wing 6:** *"It's colder down here than the rest of the building. / That isn't only the
  refrigeration."*
- **Wing 11:** *"This is where it happened. / You can still smell the burn."*
- **Wing 15:** *"The front doors are close. / For the first time in eleven years, they might
  actually open."*
- *(Wings 4, 5, 7–10, 12–14 follow the same 2–4 line template once built — tone: short,
  present-tense, never explains, always implies.)*

### Final escape sequence (Wing 15 completion — extends the existing "escape cutscene +
reward" beat already specified in [GAME_DESIGN.md §11](./GAME_DESIGN.md#11-reward-reward))
1. The last door — the same front doors from Wing 1 — registers unlocked on its panel.
2. Camera pulls back as the player steps through into daylight (matches the existing reward
   design's "run into dawn light" beat).
3. **Main ending text:** *"St. Verena Memorial's front doors are recorded open at 6:04 AM. No
   one is present to see it happen."* — deliberately unresolved; the Presence's fate and the
   player's identity are never explained. This is the ending for anyone who reaches Wing 15
   with fewer than all collectible notes.
4. **Secret ending (all notes collected across the run):** the same final text plays, but is
   followed by a single additional card: the Wing 1 sign-in sheet, now showing a completed
   final line in handwriting matching the redacted staff notes — the player's name, filled in,
   with a time-out that matches the moment of escape. No further explanation. This is the hook
   BETTERMENT.md's collectible-file system (§4.2) pays off narratively.

## 8. Style guide

- **Voice:** clinical and procedural on the surface (memos, logs, charts) — the horror comes
  from what's *missing* or *contradicted*, never from a note "creepily narrating" at the
  player. No note should ever directly say "I am scared" or describe the monster.
- **Redaction convention:** `[redacted]` or `—` for names/dates the institution wouldn't have
  released even internally; never used for things the *player* should be able to infer — the
  player should always be one small logical step ahead of what's explicitly stated.
- **Dates:** never given in full (no real-world year) — "eleven years ago," "the night of the
  Incident," "before I started here" — keeps the setting timeless and avoids anchoring the
  fictional hospital to a specific real year.
- **Naming:** "the Incident" is always capitalized, always vague, always the same term across
  every document (consistency signals it's a known, feared shorthand in-universe). The
  Presence is never named directly by any document — only described by effect.
- **Length:** every note should be readable in under 15 seconds — this is an obstacle-course
  horror game, not a walking simulator; lore rewards curiosity without gating pacing.
- **UI implementation note:** notes render as a simple read-only panel (extend `UI.ts`'s
  existing `panel`/`screen` pattern) triggered by a new `noteAt()` kit primitive that mirrors
  `keycardAt()`'s pickup detection — no new engine systems required.
