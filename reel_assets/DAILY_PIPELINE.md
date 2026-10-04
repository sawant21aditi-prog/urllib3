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
- `speed` (1.15 on the 2 hook beats)

## 3. Voiceover + timing
```bash
cp reel_assets/daily/<date>/reel-<n>/script.json reel_video/src/data/script.json
cd reel_video && python3 scripts/gen_vo.py      # writes public/audio/vo.wav + timing.json
```
Copy `vo.wav` and `timing.json` into the reel folder.

## 4. Image prompts for ZAPI Flow (Vox photo-collage)
Write `reel-<n>/shotlist.json` and `reel-<n>/zapi_flow_prompts.txt`:
- one prompt per line, in playback order, last beat excluded (it reuses `01.png`)
- copy the photo-collage `style_suffix` from `reel_assets/real/shotlist.json`
- rotate a different background colour per shot
- no text in images
- no identifiable real people

## 5. Hand off to the user (images are generated manually)
Send both `zapi_flow_prompts.txt` files with SendUserFile, each with a one-line note. The note says:
- the Reel title
- the run order
- that images should be uploaded in download order, without renaming
- **9:16, best-quality model**

Then **wait for the uploads**. Don't render placeholders as final.

## 6. Review images, then render
- Review every uploaded image for realism, the collage look, framing, empty space at the top, and stray text or artefacts. Give a re-roll prompt for any that fail.
- Map the uploads to `shot` filenames in download order and copy them into `reel_video/public/shots/`. Then:
```bash
python3 scripts/sync_shots.py && npx tsc -p .
npx remotion render src/index.ts RealReel out/reel.mp4 --codec h264 --crf 17 --concurrency 4 --overwrite --browser-executable=...
ffmpeg -i out/reel.mp4 -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart reel_assets/daily/<date>/reel-<n>/reel_ig.mp4
```
- Extract one frame per second into `reel-<n>/review/` and check a contact sheet yourself.

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
- Send both `reel_ig.mp4` files and both `publish.md` files to the user.
- Append both topics to `reel_assets/topics_used.json`.
- Commit and push everything except large intermediates (`reel_video/out/` is ignored).
- Final message: both titles, QA scores, posting times, and anything that needs the user.

## Ground rules
- Never invent facts. If a claim can't be sourced, drop the topic.
- Never promise virality in captions or reports. We control hooks, retention, shareability and consistency.
- 9:16 at 1080×1920 always; no watermarks or logos.
