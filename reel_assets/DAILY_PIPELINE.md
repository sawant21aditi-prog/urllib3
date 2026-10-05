# Daily Reel Pipeline: 2 Reels per day

Each scheduled session follows this file top to bottom. The goal is **2 viral-quality Reels a day** in the
"hidden truth about everyday things" niche (Vox photo-collage style, 9:16), with fresh research every day.

Repo: `sawant21aditi-prog/urllib3`, branch `claude/keen-goodall-9fhjpl`. Commit and push after every step.

---

## 0. Setup (fresh container)
```bash
cd reel_video && npm install
pip install kokoro-onnx soundfile
mkdir -p ~/.cache/kokoro && (cd ~/.cache/kokoro && for f in kokoro-v1.0.onnx voices-v1.0.bin; do \
  curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f; done)
```
Chromium for rendering: `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.

## 1. Virality Agent: daily research (thorough)
Spawn the **Virality Agent** (a general-purpose subagent). Give it these files:
- `reel_assets/brand/page_strategy.md`
- `reel_assets/brand/reel_formula.json`
- `reel_assets/topics_used.json`
- the previous days' `review.md` files and any performance notes in `reel_assets/daily/*/performance.md`

Its job today:
1. **Research what is going viral right now** in the niche (WebSearch). Cover explainer and "how it works" accounts on IG, Shorts and TikTok, plus trending everyday-object, design-secret, science and history topics, news hooks, and seasonal angles. Cite sources.
2. **Pick 2 NEW topics.** They must not appear in `topics_used.json`. Each must score at least 20/25 on the formula's topic checklist (relatability, surprise, shareability, visual potential, fact-solidity). Prefer continuing a winning series (e.g. "Placebo Files #N"). Fact-check each core claim against two or more reliable sources and hedge where needed ("often", "many").
3. Write `reel_assets/daily/<YYYY-MM-DD>/research.md` with:
   - trends found
   - both chosen topics with sources
   - why each will get sent in DMs
   - the hook line for each

## 2. Script each Reel (formula-driven)
For each topic, create `reel_assets/daily/<date>/reel-<n>/script.json` in the same schema as
`reel_video/src/data/script.json`.

Beats:
- 11–13 beats, 30–42s total.
- Beat 1 is the claim, done within about 1.5s. Beat 2 is an open loop, done by about 3s.
- Then context, escalation, a twist, the payoff, and a last line that loops back into beat 1.

Fields per beat:
- `id`, `narration`
- `caption` (max 4 words, UPPERCASE) and `highlight`
- `visual`
- `shot` (`01.png` … in playback order; the last beat reuses `01.png`), `cam`, `sfx`
- `design_s` (= duration)
- `annot` (Vox callout): `{x, y, r, at, arrow?}`. Position and radius are fractions of the poster, and `at` is the fraction of the line's speech. Use it on beats where the narrator names a specific thing in the image. Find x/y after the images arrive, using a gridded contact sheet.
- `big` (giant number/date stamp): `{text, at, x?, y?, rot?}`. Use it for 1–2 beats with a key number or date.
- `speed` (1.15 on the 2 hook beats)

## 3. Voiceover + timing (expressive Gemini voice, verified word for word)
Write a `direction` (acting note) for every beat in script.json. Examples:
- hook: urgent and punchy
- open loop: hushed and mysterious
- middle: wry and curious
- payoff: energetic
- last line: friendly

```bash
pip install sherpa-onnx   # offline Whisper for verification; model setup in reel_video/scripts/asr.py
cp reel_assets/daily/<date>/reel-<n>/script.json reel_video/src/data/script.json
cd reel_video && GEMINI_API_KEY=$GEMINI_API_KEY python3 scripts/gen_vo_gemini.py --voice Puck --model gemini-3.1-flash-tts-preview
```
- It uses ONE Gemini request per Reel; the free tier allows about 10 requests a day per model.
- Every line is transcribed with offline Whisper and compared with the script. **If any beat scores below 0.8, the take is rejected**, because some TTS models improvise lines. Regenerate, or re-align a saved take for free with `--reuse public/audio/vo_raw_<model>_<voice>.wav`.
- Never use `gemini-3.8-*-tts`: those models read the instructions aloud and invent lines.
- Fallback if `GEMINI_API_KEY` is missing or the quota is used up: `python3 scripts/gen_vo.py` (Kokoro, offline, flatter voice). Tell the user which one you used.

**Pace rules** (the user found 190+ wpm too fast and 1-second gaps too slow):
- The overall target is **155–165 wpm**. The script prints the wpm, so check it.
- Use the voice's natural speed. Hook lines run at 1.0×, and body lines default to `--tempo 0.93`.
- Never speed the voice up.
- Line gaps are a 0.32s breath. Pauses inside a line are capped at 0.45s (`max_pause` per beat, up to 0.6s for a deliberate deadpan beat).

**Ending rule: end with a share or save trigger, never on a fact** (user decision, running experiment):
- The LAST beat is an explicit call to action, spoken and on screen.
- For the next Reels, follow the `cta_type` column in `reel_assets/experiments/cta_test.csv`, in order (send / save alternating). Fill in the row's `topic` and `cta_line` when you script it.
  - **Send:** "Send this to someone who <specific behaviour tied to the topic>."
  - **Save:** "Save this for <specific future moment>." For example: "Save this for your next elevator argument."
- Make it specific to the topic and to a real person or moment. Never a generic "share this".
- Set `"cta": "send" | "save"` on that beat.
- The visual for the last beat should show the action: a pointing hand or phone with a code-drawn paper-plane send icon or bookmark icon (no Instagram logo), plus the caption in yellow.
- The loop still works: the CTA line hands straight back to the hook.
- After the experiment ends (Reel #6), read `reel_assets/experiments/README.md` and keep the winning style.

**Hook rules** (the user asked for strong hooks):
- Open with a direct command or a shocking claim about an everyday object, e.g. "Stop pressing this button."
- Hedge it so it stays true ("probably", "often").
- The second line opens a loop that is only paid off near the end.
- The opening scene sets `"punch": true`: it starts on an extreme close-up mid-action and punches out.
- The last line must lead straight back into the first.

**Animation rules** (the user asked for more animation):
- The engine already adds a constant camera push, shakes on every hit, pop-ins, idle bobbing, speed lines, dust on landings and impact stars.
- Direct 2–4 animated props per scene, plus at least one effect.
- Give at least one prop an entrance at `at > 0.3`, so something new lands mid-line.
- Props shown on the first frame use `noPop`.

## 4. Element prompts for ZAPI Flow ("living collage" style, the approved look)
The style follows the user's two reference videos:
- one full-screen textured background per scene
- separate real-photo cutout props, each animated on its own
- 12fps stop-motion steps
- hand-made effects: sunburst, marker circle, sparks, hand-written marker text
- element-driven transitions: torn paper, slide-up, zoom
- quiet white subtitle tags

For each Reel, write `reel-<n>/elements.json` in the same schema as `reel_assets/collage/elements.json`:
- **Props:** 15–20 single objects, each "isolated on a plain pure white background".
- **Backgrounds:** 4–6, named `bg_*`, each a "full-frame background texture".
- Reuse that file's style suffixes word for word.
- Mix colour and black-and-white photos.
- Keep shapes and symbols correct, and spell out directions explicitly (e.g. ▶|◀ = door CLOSE, triangles pointing inward).

Then write `reel-<n>/zapi_flow_elements.txt` (one prompt per line, same order).

## 5. Hand off to the user (images are generated manually)
Send both `zapi_flow_elements.txt` files with SendUserFile, each with a one-line note. The note says:
- the Reel title
- **9:16, best-quality model**
- that the images should be uploaded as a ZIP in download order

Then **wait for the uploads**.

## 6. Cut out, direct the scenes, render (CollageReel)
```bash
pip install rembg   # model: ~/.u2net/u2net.onnx from https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx
cd reel_video
python3 scripts/process_elements.py <zip-or-folder> ../reel_assets/daily/<date>/reel-<n>/elements.json
python3 scripts/sync_elements.py
```
- Check a cutout contact sheet on a bright pink backdrop. Flat, light objects such as doors or paper sometimes come out see-through. Re-cut those with an edge flood-fill; see the git history for the doors and document fix.
- Write a `scene` for every beat in `script.json`. Follow `reel_video/src/data/script.json` from Reel #1 as the reference:
  - `bg`, `transition`, `bold`
  - `props`: x, y, w in px on 1080×1920, plus `anim`, `at`, `flip`, `z`
  - `fx`: sunburst, circle, sparks, question, doors, spotlight, write
- **Style rules from the user's reference Reel ("Vox"-style AI animation):**
  - Every scene has a `word`: one giant high-contrast serif word (Playfair 900, cream) that sums up the beat. Place it at about y 330–470, so the main prop overlaps the bottom of the letters (the depth sandwich).
  - Use bold colour fields. `tint` adds a multiply colour over B&W textures, for example blue `#4f8fe6` on marble. Mix black grunge, saturated blue, a sun-yellow sunburst, and teal or mint.
  - Add ambient life in at least 3 scenes: `birds`, a torn-paper `strip` (sky, newsprint, colour) as a middle layer, smoke, turning parts.
  - Use a yellow marker `circle` for focus.
  - Add one data overlay where it fits: a ticking `counter` (e.g. "3.0 SEC DOORS OPEN", a price, a count).
  - Captions are kinetic: 1–3 words, uppercase, white with a soft shadow, at y 1250, with the key word in yellow (from `bold`). No caption boxes.
- Set each prop's width from its real aspect ratio (`w × h/w`), so nothing runs off-frame.
- Keep heroes inside y 250–1400. Subtitles sit at about y 1420.
- The last beat must end on the first beat's exact layout, so the loop is seamless.
- Render one still per scene, review them, fix, then:
```bash
npx tsc -p . && npx remotion render src/index.ts CollageReel out/reel.mp4 --codec h264 --crf 17 --concurrency 4 --overwrite --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
ffmpeg -i out/reel.mp4 -c:v libx264 -preset slow -b:v 5000k -maxrate 6000k -bufsize 10000k -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart reel_assets/daily/<date>/reel-<n>/reel_ig.mp4
```
- Copy each Reel's `public/elements` into its reel folder so it can be rebuilt later. Elements are overwritten per Reel.

## 7. Virality Agent: QA gate + publishing pack
The agent reviews the frames against `reel_formula.json` → `qa_checklist`. It writes `reel-<n>/review.md` with PASS/FAIL per check, a score out of 100 and its fixes. **Fix anything that FAILs and re-render before delivering.**

It also writes `reel-<n>/publish.md`:
- **Cover text** (max 6 words, accurate, centred for the 3:4 grid crop).
- **IG caption**: the first line is the search-keyword question, then 1–2 lines of payoff, one send-prompt line, and sources.
- **Hashtags: exactly 3–5** (Instagram's cap). Mix 1 broad, 2 niche, 1 topic and 1 series tag. No competitor handles.
- **Pinned comment** (a yes/no question or a debate, plus sources).
- **Posting slot**: Reel 1 at **12:00–13:00 US Eastern**, Reel 2 at **19:00 US Eastern**.
- **Cross-post captions** for YouTube Shorts and TikTok.

## 8. Deliver + log
**Standing rule from the user:** every Reel is delivered together with its caption and hashtags, pasted inline in the chat message as copy-ready code blocks. Don't only attach `publish.md`. For each Reel, give:
- **Caption (search-optimised):**
  - Line 1 is the exact phrase people search for.
  - 2–3 short sentences that use the key terms naturally (Instagram indexes captions and transcribes the voiceover).
  - A series line ("Placebo Files #N · Follow for #N+1").
  - One send-prompt line ("Send this to the friend who…"), because DM shares are the strongest signal for non-follower reach.
  - Short sources.
- **Hashtags:** exactly 3–5 (Instagram's cap): 1 broad, 2 discovery, 1–2 niche or series. No competitor handles, no banned or spammy tags.
- **Pinned comment:** a yes/no question or a debate, plus sources.
- **Alt text** (Instagram uses it for search), the **cover text**, and the **posting slot**.

- Send both `reel_ig.mp4` files and both `publish.md` files to the user.
- Append both topics to `reel_assets/topics_used.json`.
- Commit and push everything except large intermediates (`reel_video/out/` is ignored).
- Final message: both titles, QA scores, posting times, and anything that needs the user.

## Ground rules
- Never invent facts. If a claim can't be sourced, drop the topic.
- Never promise virality in captions or reports. We control hooks, retention, shareability and consistency.
- 9:16 at 1080×1920 always; no watermarks or logos.
