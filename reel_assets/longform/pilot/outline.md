# Long-form pilot outline: The Hidden Why on YouTube

Prepared 2026-10-08 by the Virality Agent.
- Facts are in `research.md` (F-numbers).
- The full narration is in `script.md`.
- **Evidence** means a cited platform statement or published source. **Estimate** means my judgement.

---

## 1. What works for single-topic "everyday object" documentaries on YouTube (brief)

### 1a. What YouTube itself says it rewards (evidence)

| Signal | What YouTube has said | Source |
|---|---|---|
| Satisfaction, not just clicks | The recommender learns from "clicks, watchtime, survey responses, sharing, likes, and dislikes". Clicks alone failed (2011), so watch time was added in 2012. "Valued watchtime" is measured with 1–5 star surveys, and only 4–5 star ratings count. | [YouTube Blog, Cristos Goodrow, "On YouTube's recommendation system" (2021)](https://blog.youtube/inside-youtube/on-youtubes-recommendation-system/) |
| Watch time, absolute and relative | Todd Beaupré (YouTube Growth & Discovery): "We look at both the absolute time you spend as well as the relative time", and surveys exist because a video that "didn't deliver at the end" shouldn't count as valuable time. | Quoted from a Sept 2026 Creator Insider interview by [OutlierKit](https://outlierkit.com/resources/youtube-viewer-satisfaction-algorithm-2026/) (search excerpt). Background: [Creator Insider, "The YouTube Algorithms in 2025"](https://www.youtube.com/watch?v=dhYIb72L1hU), chapter "Satisfaction over clicks" |
| Title and thumbnail tests are judged by watch time, not CTR | Test & Compare picks the winner by **watch time share**. "We optimize tests for overall watch time over other metrics, like click-through-rate." | [YouTube Help: A/B test titles & thumbnails](https://support.google.com/youtube/answer/16391400?hl=en) |
| The first 30 seconds | YouTube Studio's "Intro" key moment flags videos with **50%+ of viewers still watching at 0:30** as "above typical intros". | [YouTube Help: Content tab analytics tips](https://support.google.com/youtube/answer/12942217?hl=en-GB) |
| Chapters | The first timestamp must be 00:00, there must be at least 3 in ascending order, and each must be at least 10s long. | [YouTube Help: Video chapters](https://support.google.com/youtube/answer/9884579?hl=en) |

**Third-party claims, unverified by YouTube:** vidIQ says small channels with strong early CTR and retention get tested on broader audiences "within days instead of weeks", and suggests targets of 4%+ CTR and 50%+ AVD ([vidIQ](https://vidiq.com/blog/post/understanding-youtube-algorithm/)). Treat these as heuristics. Beaupré has argued against fixed CTR thresholds ("20% CTR and 10,000 views or a 5% CTR and 100,000 views?", [adoutreach summary](https://adoutreach.com/how-youtubes-algorithm-really-works-in-2025-straight-from-youtubes-director-of-growth/)). **Returning viewers:** I found no YouTube statement that weights returning viewers for new channels. Track the metric anyway, because it is the best proxy for whether a series is working (estimate).

### 1b. Craft patterns in the genre

- **First minute.** MrBeast's leaked production guide calls the first minute "the most important minute of each video" because that is where people click off most ([Tubefilter, Sept 2024](https://www.tubefilter.com/2024/09/17/mrbeast-internal-production-guide-leaked-key-points/)). I found **no source** for a fixed "re-hook every N seconds" rule. Re-hooking every 60–90s is an editing heuristic (estimate), and we apply it at every chapter boundary.
- **"Legit bait", not "click traps".** Veritasium's "Clickbait is Unreasonably Effective" (2021) argues that enticing but **accurate** packaging is necessary for educational videos, and shows how much iterated titles and thumbnails move performance ([Wikipedia: Derek Muller](https://en.wikipedia.org/wiki/Derek_Muller); [Digital Information World summary](https://www.digitalinformationworld.com/2021/09/why-is-clickbait-so-common-in-online.html); secondary summaries only).
- **Title patterns** in Vox, Half as Interesting, Wendover and Business Insider "why" videos (my observation from the genre, not a dataset):
  - "Why X [does surprising thing]"
  - "The [hidden/surprising] reason X..."
  - "How X changed Y"
  - "The X that [paradox]"
  - Question titles are usually answered in the video, not in the title.
- **Thumbnail patterns** (estimate): one hero object, large and cut out; a high-contrast background; 0–3 words that add to the title rather than repeat it; often a red circle or arrow on the detail.
- **Length** (estimate):
  - Half as Interesting tends to run about 4–7 minutes.
  - Vox explainers about 6–12.
  - Wendover and Veritasium deep-dives often 15–30.
  - **8–10 minutes** suits a first long-form test: it is long enough for real watch time and short enough that our collage pipeline can sustain the visual density.
- **Intro structure** (estimate, consistent with the guide above and the YouTube intro metric):
  - a cold open with the stakes plus 2–4 open loops in the first 30s;
  - a short title sting;
  - no "Hey guys, welcome back";
  - the thesis by about 0:35.
- **Retention devices** we use:
  - named chapters;
  - an open loop paid off late (the "can it fall?" question is asked at 0:00 and answered at about 7:25, about 82% of runtime);
  - a re-hook line ending every chapter;
  - a myth-bust midpoint ("All safe, gentlemen" is a legend);
  - a twist that reverses the Reel's own claim (the button often *does* work).

### 1c. Demand signal for this topic

- "How does an Elevator work?" (animated explainer) shows about **7.6M views** in a search excerpt ([YouTube](https://www.youtube.com/watch?v=rKp4pe92ljg)). The excerpt doesn't show the date or channel.
- The close-door myth is covered repeatedly by press: NYT 2016, ABC7 2018, Radiolab 2014, and blogs as recent as Nov 2025 (research F22–F24, F26). That is evidence of recurring curiosity.
- I found no long-form Vox, Half as Interesting or Wendover video on this exact story in my searches. That is not proof that none exists: the owner should search YouTube for "elevator close button" and "Elisha Otis" before publishing.

---

## 2. Topic candidates and scores

Scale 1–5. **Synergy** means how well our existing or planned Reels can act as trailers.

| Topic | Story depth | Visual potential | Fact-solidity | Search demand | Reel synergy | Total |
|---|---|---|---|---|---|---|
| **A. The Elevator:** Otis cuts his own rope (1854), the flipped top floor, the driverless-elevator panic (1945), the close button (ADA 1990), the firefighter key, the 75-storey fall | **5**: named people, exact dates, a strike, a death three months after the patent, a disputed placebo | **5**: cut rope, ratchet teeth, steam engine, 1850s Broadway, a red STOP button, braille arrows, a fire helmet icon, a fog bank, an indicator dial; PD Otis engravings exist | **4**: core facts High; three items Medium or excerpt-only (F23, F24, F30) and handled with hedges | **4**: evergreen "how elevators work" and "close button fake?" searches (7.6M-view explainer; repeated press) | **5**: Reel #1 *The Placebo Button* is a ready-made trailer, and the yellow brass button is our signature object | **23** |
| **B. The Smoke Alarm:** chirps at 3 a.m., ionization vs photoelectric, americium, the 10-year rule | **3**: strong science, but the invention story (an "accidental" discovery in the 1930s) is **not yet verified** in our files; fewer human stakes we can show safely | **4**: alarm, 9V battery, radioactive symbol, 3:00 clock | **4**: the NFPA and First Alert facts are strong (Reel 3 research), the origin needs work | **4**: high practical search ("why is my smoke alarm chirping") | **4**: Reel 3 | **19** |
| **C. Round airplane windows / the Comet:** 1954 crashes, metal fatigue, the hole in the window | **5**: a major real-world investigation | **3**: crash topics restrict imagery (no wreckage), so it relies on diagrams | **4**: well documented, but heavy engineering detail | **4** | **3**: the plane-window Reel is only planned | **19** |

**Recommendation: A, the Elevator.** It has the most human story, from the fear of falling to the fear of having nobody in charge to a button that only feels like control. It also has the strongest real-object visual inventory and the cleanest link to our signature object and Reel #1. Its one honesty risk, overselling the "placebo" button, becomes the twist in chapter 5, and the twist builds trust (it corrects our own Reel's oversimplification).

---

## 3. Title, alternatives, thumbnail

**Working title:** **Why Elevators Don't Fall (And the Button That Often Does Nothing)** (63 characters)

Alternatives, all honest and each paid off in the video:
1. **The Man Who Cut His Own Elevator Rope** (story or character pattern; paid off in ch.2)
2. **Is the Elevator Close Button Fake? It's Complicated** (question pattern; honest because the answer is "often, but not always")
3. **The Elevator Was Designed to Calm You Down** (hidden-reason pattern; paid off across ch.4–6)

Test the working title against alt 1 with YouTube Test & Compare (titles and thumbnails), which is judged on watch time share.

**Thumbnail concept** (one object, at most 3 words):
- **Hero:** our yellow brass close-door button with its two facing triangles, filling about 45% of the frame, cut out with a white sticker border on a sky-blue `#8FD3FE` collage background.
- **Second element:** a frayed, just-cut rope dangling above the button, with a halftone shadow.
- **Text:** **PLACEBO?** in charcoal heavy condensed type with a hot-pink `#FF5C8A` highlight bar. The question mark keeps it honest.
- **Variant B** for the test: the same rope and button with the text **HE CUT IT**.
- No faces.
- Keep the text out of the bottom-right 20%, where the timestamp sits.

---

## 4. Cold open (0:00–0:39): fear plus curiosity, true

Spoken (the first 15s is beats 1–4):

> "The rope holding your elevator could snap. / You almost certainly wouldn't fall, because in 1854 a man cut his own rope in front of a crowd. / And the button you jab the most? It often can't do a thing. / Not because it's broken. Because it's waiting for someone else."

Then the loops:

> "There's a key that makes that same button obey completely. / And one woman fell about seventy-five stories in an elevator, and lived."

The thesis:

> "This is the hidden why of the elevator: a machine that's always sold you two things: safety, and the feeling of control."

The hook is checked against `hook_playbook.md`:
- The stake comes from an object (the rope), in the first four words, with a modal ("could"). It is true per F31: ropes can break, but it is "highly unusual".
- The reassurance follows at once (rule 6).
- "Often" hedges the button (F20–F23).
- There are no banned words.
- There are four open loops (fall, button, key, 75 storeys). They are paid off in ch.2, ch.5, ch.6 and ch.7.
- Frame 0 shows the rope already fraying with the caption on screen.

---

## 5. Chapters (total about 9:05 of VO; final cut about 9:00–9:35)

The description block, ready to paste. The times come from `script.md` and need re-checking after the render.

```
0:00 The rope could snap
0:39 The rope
1:36 The man who cut his own rope
2:33 The top floor flip
3:40 The driverless elevator nobody trusted
4:54 The button that waits for someone else
6:23 The firefighter's key
7:25 Can it still fall?
8:34 The panel, decoded
```

### Ch.1 · 0:39 · The Rope (146 words)
- **Beats:**
  - Yonkers, 1852: a bedstead factory needs a hoist (F2).
  - Otis doesn't build a stronger rope; he makes failure the trigger.
  - Ratchet teeth on the rails, spring-loaded pads held back by rope tension (F3).
  - The safe state is the default (F4).
- **Re-hook:** "Brilliant on paper. But who would trust their life to a mechanic's spring?"
- **Visuals:**
  - a newsprint background with "YONKERS 1852" stamped on it;
  - a cutout factory with a wooden hoist frame;
  - a coil of rope;
  - an exploded diagram assembling piece by piece (teeth strip, pads, spring), with the rope tension shown as a taut yellow line;
  - when the rope "snaps", the spring pops and the pads lock (the hero animation, reusable in Shorts);
  - a public-domain Otis portrait (check the Commons licence).

### Ch.2 · 1:36 · The Man Who Cut His Own Rope (149 words)
- **Beats:**
  - 1854, New York Crystal Palace (F5).
  - He rides up 30–40 ft (son's recollection, F7) and cuts the rope; the brake catches.
  - The *Tribune* says he "occasionally cuts the rope", meaning again and again (F6).
  - Myth-bust: "All safe, gentlemen" is unrecorded legend (F8).
  - Demand rises.
- **Re-hook:** "But the strangest result of that stunt isn't the elevator. It's what happened to the top floor of every building."
- **Visuals:**
  - a glass-and-iron exhibition hall (a PD engraving of the NY Crystal Palace);
  - the PD 1854 demo engraving brought in layer by layer;
  - giant serif "CUT";
  - a pair of shears;
  - a *Tribune* masthead-style clipping drawn by us (no fake facsimile: label it "quoted from");
  - a "LEGEND" rubber stamp slamming over a speech bubble.

### Ch.3 · 2:33 · The Top Floor Flip (173 words)
- **Beats:**
  - 23 Mar 1857, 488 Broadway, the first passenger safety elevator, steam-driven, about 40 ft a minute (F9).
  - Patent January 1861 (F10); death three months later (F1).
  - 1870 Equitable Life Building, advised against elevators (F11).
  - The top floor goes from worst to best: the penthouse (F12).
- **Re-hook:** "But for decades, most rides came with one more person in the car... And when that person disappeared, riders panicked."
- **Visuals:**
  - a cast-iron façade cutout (Haughwout, PD photo);
  - a steam engine;
  - a snail versus a stopwatch (the speed gag);
  - a patent drawing sheet (US 31,128; patent drawings are PD);
  - a calendar flipping Jan to Apr 1861;
  - a building cross-section where coins and stars slide from the ground floor to the top floor;
  - a "PENTHOUSE" door plaque.

### Ch.4 · 3:40 · The Driverless Elevator Nobody Trusted (191 words)
- **Beats:**
  - Operators levelled cars by hand (F14).
  - The driverless elevator around 1900: people walked back out (F15).
  - Sept 1945: about 15,000 operators strike and about 1.5M office workers are stranded (F16).
  - The trust campaign: kids in ads, a recorded voice, a red STOP button, "the biggest calming device ever invented" (NPR) (F17).
  - It takes more than 50 years to normalise (F18).
- **Re-hook:** "Which brings us to the button you press more than any other."
- **Visuals:**
  - a uniformed operator silhouette with a lever controller;
  - a picket sign "ON STRIKE";
  - a skyline with lit windows going dark;
  - a crowd of tiny commuters on a staircase;
  - a vintage-ad pastiche in our own style (not a copy of a real ad);
  - a speaker grille with an animated waveform for the recorded voice;
  - a big red STOP button pulsing (the one dark charcoal scene of the video).

### Ch.5 · 4:54 · The Button That Waits for Someone Else (229 words)
This is the midpoint twist.
- **Beats:**
  - The two-arrow door-close symbol (F37).
  - ADA signed 26 Jul 1990 (F19).
  - Doors stay open at least 3s for a car call and at least 5s for a hall call, longer when farther from the button (F20–F21).
  - The NYT says it does nothing (F23, excerpt).
  - The "80% never wired" claim is unverified (F24).
  - **Twist:** the industry says it is not a placebo, and it works after the minimum (F22), and KONE says one press closes sooner (F25).
  - The honest answer: it depends.
- **Re-hook:** "And for one group of people, that same button does something no passenger can make it do."
- **Visuals:**
  - **our signature yellow brass button** (a cameo payoff);
  - a braille "CLOSE" cutout;
  - a wheelchair, walker and crutches as object cutouts (no people);
  - a 3-second and 5-second stopwatch race;
  - a newspaper column chip "NYT, 2016";
  - an "80%?" figure wobbling, then stamped "UNVERIFIED";
  - a scale balancing "PLACEBO" against "WORKS LATER".

### Ch.6 · 6:23 · The Firefighter's Key (160 words)
- **Beats:**
  - Phase I recall: cars return, doors open, the helmet icon lights (F27).
  - Phase II key: nothing automatic; door close must be held (F28–F29).
  - Firefighters stop at least two floors below the fire (F28).
  - The code dates from the 1970s (F30).
- **Re-hook:** "Which leaves the question we started with: if the rope snaps today, do you fall?"
- **Visuals:**
  - a fire-helmet icon glowing on a panel;
  - an elevator-lobby cutout with the doors open;
  - a generic key (not a real fire-service key profile);
  - a thumb holding the button with a "HOLD" counter;
  - a floor-indicator stopping two below a flame icon;
  - a "1973" stamp shown as "1970s".

### Ch.7 · 7:25 · Can It Still Fall? (178 words)
This pays off the cold-open loop at about 82% of runtime.
- **Beats:**
  - Several ropes, each able to hold the car, plus the overspeed governor (F31).
  - Otis's idea "still on duty" (F32).
  - 28 Jul 1945: a B-25 in fog hits the Empire State Building; 14 die; Betty Lou Oliver's car falls about 75 storeys after every cable is severed (Guinness); she survives, and accounts differ on why (F33–F34).
  - US data 1992–2003: about 30 elevator and escalator deaths a year, almost half of them workers (F35).
- **Re-hook / bridge to the outro:** "So the next time you step inside, look at the panel."
- **Visuals:**
  - a rope bundle fanning out into 6 strands;
  - a governor wheel spinning, then clamping (re-using the ch.1 pad animation, a deliberate callback);
  - a fog bank;
  - a calendar "JUL 28 1945";
  - the skyline silhouette (no plane, no fire);
  - an indicator needle sweeping 80 to B, then silence;
  - a certificate-style card "LONGEST ELEVATOR FALL SURVIVED, per Guinness".

### Outro · 8:34 · The Panel, Decoded (90 words)
- **Beats:** the panel recap callback (teeth, the red button, the two arrows).
- **CTA, specific (save):** "Save this for the next time someone in your elevator jabs that button and calls it fake. You'll know the hidden why."
- **End-screen line:** "If you want the forty-second version to send them, it's our Reel: Placebo Files number one." Then: "And subscribe for the next hidden why: the smoke alarm that only ever chirps at three a.m."
  - Swap the last line if the next upload is different.
  - The end-screen elements are a Subscribe button and the Placebo Button Short, or the next long-form video once one exists. Hold 20s.
- **Visuals:** the full elevator panel built from all the earlier cutouts, with the yellow button last. The colour returns to sky blue, matching frame 0, for the loop feel.

---

## 6. Packaging and launch notes (estimate)

- **Reels as trailers:** re-post a 30–40s cut of ch.2 ("He cut his own rope") and of ch.5's twist ("The close button isn't fake. It's waiting.") as Shorts and Reels. End each with "Full story on YouTube", in the caption only on Instagram.
- **Pinned comment:** sources (NPR 2015, Elevator World/Lee Gray, ADA §407.3, ABC7 2018, KONE, NFPA 2024, Guinness), plus the correction note: "Our Reel said the button 'probably doesn't do anything'. The fuller answer is in ch.5."
- **Watch in Studio:**
  - Intro retention at 0:30 (aim for "above typical", meaning 50%+);
  - the drop at the 0:39 chapter start;
  - the ch.3 to ch.4 transition, which is the riskiest stretch;
  - CTR and watch time share on the title and thumbnail test.
