# Quality gate: Reel #1 "The Placebo Button" (PLACEBO FILES #01)

Reviewed 2026-10-04 against `reel_assets/brand/reel_formula.json`.

**Inputs:**
- All 40 review frames, `review/t_00.1.png` to `t_39.1.png` (360×640, one frame per second at t = n + 0.1s)
- `reel_video/src/data/script.json`
- `reel_video/src/data/timing.json` (total 39.92s, 13 beats)

Pixel positions are quoted at 360×640 and scaled ×3 to 1080×1920 where it matters.

**Verdict: SHIP AFTER FIXES 1–2 (and ideally 3–4).** There are no blocker failures. Three checks are partial or failed (subtitle safe zone, loop seam, cover). One fact item needs a wording fix (the "one person" overclaim).

---

## Check results

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | **3-second rule** | **PASS** | t=0.1: the button and yellow disc are already on screen, a finger is moving in from the bottom-right, the headline "THIS BUTTON IS LYING" is mid-kinetic-entrance and the subtitle "This button is" is showing. t=1.1: the finger is on the button, the triangles have flipped to red (the "fake" glitch), radiating tick marks appear and LYING is highlighted yellow. The claim is complete at 1.29s (timing.json beat 1 speech). The open loop "And only one person can make it work" ends at 3.31s, about 0.3s over the ideal 3.0s but within the 3.5s gate. |
| 2 | **Pattern interrupt at least every ~3s** | **PASS** | Beat cuts fall at 1.44, 3.46, 6.69, 10.65, 14.87, 18.70, 21.56, 25.97, 28.55, 31.04, 33.52 and 37.26. Inside the long beats there are extra interrupts. Beat 2: the stopwatch pops in at about 5.1 and stress sparkles at 6.1. Beat 3: rewind glitch with REW tag at 8.1, Capitol photo slides in at 9.1, yellow circle on 1990 at 10.1. Beat 4: the title writes on at 11.1, signature at 13.1, wax seal at 14.1. Beat 5: a 1-2-3 counter ticks every second. Beat 7: panel cuts to the circuit diagram at about 22.5 and wires draw on at 24.1. Beat 11: firefighter, then keyswitch at about 35, key turn at 36, split with "CLOSED." stamp at 37. The longest gap without a visible change is about 1.5s. |
| 3a | **Headline readability** | **PASS (minor)** | The headlines have 4 words or fewer, one yellow highlight each, heavy condensed type and strong contrast, and they sit at y≈85–190 (255–570 at 1080p), inside the top safe zone. Two transient glitches: at t=15.1 "SECONDS" overshoots the right frame edge during its entrance (clipped "SECOND**S**"), and at t=0.1 "IS" is small and raised mid-entrance. Both last under 0.3s. |
| 3b | **Subtitle safe zone** | **FAIL (major)** | The subtitle baseline sits at y≈495/640, which is about 1485 at 1080p. That is at or below the 1480 limit, where Instagram's caption and username overlay begins. Two-line chunks (t=13.1 and t=14.1, "Americans with Disabilities / Act.") reach y≈525, about 1575, and span x≈25–335, about 75–1005. That pushes into the right-hand action-button column (over 960). At t=2.1 the chunk "person can make" is a low-opacity ghost, white on cream with no stroke, and almost unreadable. |
| 4 | **Subtitle sync** (spot-checks against timing.json) | **PASS** | t=1.1 "lying to you." (beat 1, speech 0–1.29) ✓. t=4.1 "You jab it." (beat 2 starts 3.46) ✓. t=7.1 "To understand why," (beat 3 starts 6.69) ✓. t=12.1 "U.S. passes the" (38% into beat 4) ✓. t=17.1 "doors must stay" (66% into beat 5, words 5–7 of 9) ✓. t=23.1 "American elevators, the" (39% into beat 7) ✓. t=29.1 "It's what's known" (27% into beat 9) ✓. t=36.1 "it works again." (87% into beat 11) ✓. t=39.1 "button, remember." (72% into beat 12) is the chunk shown slightly early, which is fine. No chunk is visibly late. Word-level timing at ±120ms can't be confirmed from 1fps samples. |
| 5 | **Payoff placement** | **PASS** | The firefighter and key reveal starts at 33.52s, which is **84%** of runtime (target 78–92%). The open loop is re-raised at 31.04 ("EXCEPT FOR ONE PERSON", with the firefighter helmet silhouette peeking in at t=33.1, a nice touch). The payoff is shown as an action: the key turns to ON at t=36.1, the button glows, the doors show "CLOSED." at t=37.1. |
| 6 | **Loop seamlessness** (first vs last frame) | **PARTIAL** | The spoken loop works: "...remember. / This button is lying to you." t=39.1 shows the same button and the hand from the bottom. **Mismatches with t=0.1:** (a) the button is pushed in by about 10%, so the large yellow disc that dominates frame 0 shrinks to a thin ring; (b) frame 0's thin grey outer ring and halftone spot are missing; (c) the hand enters from bottom-centre at t=39.1 but from bottom-right at t=0.1; (d) the headline jumps from "REMEMBER THIS:" to "THIS BUTTON IS LYING". (d) is acceptable because the headline change reads as the start of the sentence. (a)–(c) make a visible "pop" on loop. |
| 7 | **Cover frame** | **PARTIAL** | There is no dedicated cover render. Using t≈1.1 as cover gives a strong image (red triangles, LYING in yellow), but the top headline line starts at y≈255 at 1080p, just inside the 3:4 grid crop (y 240–1680). The planned cover text "THIS ELEVATOR BUTTON IS FAKE" is not baked into any frame. **Fix:** render a still from beat 1 with the cover text centred inside y 400–1500. |
| 8 | **Pacing** | **PASS (with a sag)** | About 110 words in 39.92s gives about 165 wpm overall and about 188 wpm during speech (35.0s of speech). That is fast but normal for the genre. The sag: **6.7–18.7s (beats 3–5, 12s)** is pure context with no new question. It is the likeliest place for a drop on the retention curve. The counter and rewind devices help, but the script itself should be tighter (fix 3). |
| 9 | **Share trigger** | **PASS** | The topic is universal ("send to the friend who spams it"), there is a clear villain object, and the facts are surprising. The share prompt is in the caption and the pinned comment, not in the VO. Adding it to the VO would break the loop line, so it stays out. |
| 10 | **Fact accuracy and hedging** | **PARTIAL (needs one wording fix)** | ✓ The ADA was signed in **July** 1990, and the calendar shows JUL 1990 at t=9–10. ✓ ADA Standards §407.3.6: doors stay fully open for at least 3s in response to a call, and §407.3.4 says door-close activation can't shorten that. ✓ "In **many** American elevators" is hedged. ✓ Fire-service Phase II operation does make the car's door-close button functional (the doors close under constant pressure). ✗ **"Only one person can make it work" / "one person it still works for" overclaims.** Firefighters are a group, and inspectors and technicians (independent or inspection service) can also enable it. In many elevators the button also *does* work once the minimum dwell has passed. ~ "It might light up. Nothing happens." is acceptable because it follows "in many", but "Often, nothing happens" is safer. ~ Strictly, the 3-second rule comes from the ADA accessibility standards issued under the Act (ADAAG, 1991), not the Act's text. "One rule" is acceptable shorthand. |

---

## Virality score: **77 / 100**

| Component | Weight | Score | Notes |
|---|---|---|---|
| Hook and first 3s | 20 | 17 | Motion, claim and accusation all land early, and the red-triangle glitch works. The open loop finishes at 3.3s, slightly late. |
| Retention structure and interrupts | 20 | 16 | Excellent device density. Loses points for the 12s context sag. |
| Visual clarity and brand distinctiveness | 15 | 12 | The look is recognisable. Beat 7's circuit diagram reads backwards: DOOR CLOSE is glowing yellow and looks *active*, while DOOR OPEN is dashed and looks *off*, at the exact moment the VO says "switched off". |
| Text, subtitles and safe zones | 10 | 6 | Subtitles are too low and too wide, and there is a ghosted chunk at t=2.1. |
| Payoff and loop | 15 | 11 | The payoff is placed and staged well. The loop pops (scale, disc, hand position). |
| Shareability | 10 | 8 | A strong universal object and a clear "send to" person. |
| Fact accuracy and trust | 10 | 7 | Hedged mostly well. "One person" is the line a commenter will correct. |

This score is my judgement against the formula, not a prediction of views. A 77 means the Reel is structurally competitive. Topic pull will decide the outcome.

---

## Top 5 fixes (ranked by expected impact)

1. **Beat 12 (and beat 1 frame 0): make the loop frame-exact.** End beat 12's push-in at the exact transform of beat 1 frame 0: the same button scale, the large yellow disc fully visible, the grey outer ring and halftone spot restored, and the hand entering from the **bottom-right** at the same angle so its fingertip touches the disc edge on the last frame. Remove any scale tween in the final 0.3s. *Why:* rewatches push average watch time past 100%. Watch time is a top-3 ranking signal, and a pop at the seam tells the viewer "it's over".

2. **All beats: move and constrain subtitles.**
   - Place the subtitle block's **bottom** at y≈1380 at 1080p, about 460 at the review scale.
   - Set the max width to 840px (x 120–960) and the max line length to 18 characters, so "Americans with Disabilities Act." breaks as "Americans with / Disabilities Act."
   - Add a 6px charcoal stroke.
   - Remove the opacity fade-in, so chunks hard-cut or pop in with scale only, never alpha below 1. That fixes the ghosted chunk at t=2.1.

   *Why:* most Reels are watched muted at the start. Right now captions collide with Instagram's caption and username overlay and the like/comment column, so muted viewers lose the story.

3. **Beats 3 and 4: cut the 12s context sag by about 2.5s.** Merge them into one beat.
   - Narration: "Blame a law from 1990: the Americans with Disabilities Act."
   - Caption: "BLAME 1990", highlight 1990.
   - Keep the rewind whip, then cut straight to the signed document with its seal.
   - Then beat 5 should start with a micro-question: "It made one rule:"

   *Why:* the retention curve usually dips on history pivots. Every second removed before the reveal at "switched off" raises the share of viewers who reach the payoff at 84%.

4. **Beats 13, 10 and 8: fix the overclaim without losing the open loop.**
   - Beat 13: "And only one key can make it work." Caption: "ONLY ONE KEY WORKS", highlight KEY.
   - Beat 10: "But one special key still brings it back." Caption: "EXCEPT ONE KEY", highlight KEY.
   - Beat 11: "The firefighter's key. Turn it, and it works again."
   - Beat 8: "It might light up. Often, nothing happens."

   *Why:* "one person" invites "well actually" pile-ons, such as "firefighters aren't one person" or "mine works fine". That hurts trust and invites negative-feedback signals. "One key" is accurate, and it is a tighter, more visual mystery that pays off on screen with the key turn.

5. **Beat 7: make "switched off" read at a glance.**
   - Draw DOOR CLOSE as the **dead** circuit: a grey dashed ring, an unplugged wire dangling with a spark cutout, and a red "OFF" tag.
   - Draw DOOR OPEN as the live one in yellow.
   - Land the planned 115% punch-zoom, the wire yank, the 2-frame white flash and the "OFF" shake exactly on the word "off" (about 25.4s).

   *Why:* this is the central reveal of the video. It currently shows the opposite of the VO, which costs comprehension and the "aha" moment that triggers sends.

**Also before posting (not ranked):**
- Render a dedicated cover with "THIS ELEVATOR BUTTON IS OFTEN FAKE", FAKE in yellow, centred in y 400–1500.
- Fix the transient "SECONDS" overflow at about 14.9–15.2s by clamping the headline width to 960px.
