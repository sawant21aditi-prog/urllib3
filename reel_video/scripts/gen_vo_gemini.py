#!/usr/bin/env python3
"""Expressive voiceover with Gemini TTS: ONE call for the whole script (free tier ~10 req/day), per-line acting notes ("direction" in script.json), then split into beats on the pauses.

Usage: GEMINI_API_KEY=... python3 scripts/gen_vo_gemini.py [script.json] [--voice Puck] [--model gemini-2.5-flash-preview-tts]
Writes public/audio/vo.wav + public/timing.json + src/data/timing.json (same format as gen_vo.py).
"""
import base64, json, os, subprocess, sys, tempfile, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_images import call  # shared Gemini REST helper (reads GEMINI_API_KEY)
from gen_vo import ROOT, dur, HOOK_IDS_GAP, BODY_GAP, LAST_GAP, MAX_PAUSE, tighten_pauses

STYLE = ("You are the narrator of a viral, fast-paced educational explainer Reel. "
         "Sound like a real, charismatic human storyteller: varied pitch, natural rhythm, clear emphasis, energy that rises and falls. "
         "Never monotone, never robotic. Read ONLY the line in quotes.")


def arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def tts(model, voice, direction, line):
    body = {"contents": [{"parts": [{"text": f"{STYLE} Direction: {direction}\n\n\"{line}\""}]}],
            "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
    for attempt in range(6):
        try:
            r = call("POST", f"models/{model}:generateContent", body)
            return base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
        except RuntimeError as e:
            if "429" in str(e) and attempt < 5:
                time.sleep(20 * (attempt + 1))  # free-tier rate limit: back off and retry
                continue
            raise


def _norm(t):
    import re
    t = re.sub(r"[\(\[].*?[\)\]]", " ", t.lower())  # drop ASR noise tags like (buzzing)
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", t.replace("1990", "nineteen ninety").replace("u.s.", "us"))).strip()


def align_beats(wav, beats):
    """Split on every short pause, transcribe each phrase, then group consecutive phrases into beats by
    word similarity (dynamic programming). Returns [(start, end, heard_text, score)] per beat."""
    import difflib
    from asr import transcribe
    log = subprocess.run(["ffmpeg", "-i", wav, "-af", "silencedetect=noise=-38dB:d=0.18", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    st = [float(x.split("silence_start: ")[1].split()[0]) for x in log.splitlines() if "silence_start" in x]
    en = [float(x.split("silence_end: ")[1].split()[0]) for x in log.splitlines() if "silence_end" in x]
    total, cuts, prev = dur(wav), [], 0.0
    for a, b in zip(st, en):
        if a - prev > 0.15:
            cuts.append((prev, a))
        prev = b
    if total - prev > 0.15:
        cuts.append((prev, total))
    phrases = [(a, e, _norm(transcribe(wav, a, e))) for a, e in cuts]
    targets = [_norm(b["narration"]) for b in beats]
    n, m = len(phrases), len(targets)
    sim = lambda i, j, k: difflib.SequenceMatcher(None, " ".join(p[2] for p in phrases[j:k]), targets[i]).ratio()
    INF = float("inf")
    best = [[INF] * (n + 1) for _ in range(m + 1)]
    back = [[0] * (n + 1) for _ in range(m + 1)]
    best[0][0] = 0
    for i in range(1, m + 1):
        for k in range(1, n + 1):
            for j in range(i - 1, k):
                if best[i - 1][j] == INF:
                    continue
                c = best[i - 1][j] + (1 - sim(i - 1, j, k))
                if c < best[i][k]:
                    best[i][k], back[i][k] = c, j
    out, k = [], n
    for i in range(m, 0, -1):
        j = back[i][k]
        out.append((phrases[j][0], phrases[k - 1][1], " ".join(p[2] for p in phrases[j:k]), sim(i - 1, j, k)))
        k = j
    return list(reversed(out))


def fix_run_ons(wav, aligned, beats):
    """Two beats that form one spoken sentence often have no pause between them. If a failing neighbour pair
    matches as a whole, split it at the quietest moment near the word-proportional boundary."""
    import difflib
    import numpy as np
    from asr import load
    out = list(aligned)
    for i in range(len(out) - 1):
        (a0, e0, h0, s0), (a1, e1, h1, s1) = out[i], out[i + 1]
        if min(s0, s1) >= 0.8:
            continue
        t0, t1 = _norm(beats[i]["narration"]), _norm(beats[i + 1]["narration"])
        whole = difflib.SequenceMatcher(None, f"{h0} {h1}", f"{t0} {t1}").ratio()
        if whole < 0.85:
            continue
        target = a0 + (e1 - a0) * len(t0) / (len(t0) + len(t1))
        audio = load(wav, a0, e1)
        win = 800  # 50 ms windows at 16 kHz
        energy = [float(np.sqrt(np.mean(audio[k:k + win] ** 2))) for k in range(0, len(audio) - win, win // 2)]
        times = [a0 + k * (win // 2) / 16000 for k in range(len(energy))]
        near = [(en, t) for en, t in zip(energy, times) if abs(t - target) < 0.6]
        cut = min(near)[1] + 0.025 if near else target
        out[i], out[i + 1] = (a0, cut, h0 + " | split", 0.9), (cut, e1, h1 + " | split", 0.9)
        print(f"  split run-on beats {beats[i]['id']}/{beats[i+1]['id']} at {cut:.2f}s (pair match {whole:.2f})", flush=True)
    return out


def verify(aligned, beats):
    """QA gate: every beat must match its scripted line (offline Whisper). Rejects improvised or missing words."""
    bad = []
    for b, (_, _, heard, score) in zip(beats, aligned):
        print(f"  verify beat {b['id']}: {score:.2f} | {heard}", flush=True)
        if score < 0.8:
            bad.append(b["id"])
    if bad:
        raise RuntimeError(f"voiceover does not match the script on beats {bad}; regenerate (try another --model or --voice)")


def patch_take(model, voice, beats, old_raw, old_beats, ids, full, tmp):
    """--patch old_raw.wav --old-script old.json --ids 1,2: ONE request voices only the changed beats; every other
    beat keeps its span from the approved take. Writes a full-script raw take to `full`."""
    old = fix_run_ons(old_raw, align_beats(old_raw, old_beats), old_beats)
    new_beats = [b for b in beats if b["id"] in ids]
    prompt = (f"{STYLE} Read the transcript EXACTLY word for word. Do not add, remove or change any words. "
              "Pause for about one second between lines. Line notes: "
              + " ".join(f"Line {n + 1}: {b.get('direction', '')}" for n, b in enumerate(new_beats))
              + "\n\nTRANSCRIPT:\n" + "\n\n".join(b["narration"] for b in new_beats))
    body = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
    r = call("POST", f"models/{model}:generateContent", body)
    take = os.path.join(tmp, "patch.wav")
    pcm = base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", "-", take], input=pcm, check=True)
    subprocess.run(["cp", take, os.path.join(ROOT, "public", "audio", f"vo_patch_{model}_{voice}.wav")], check=True)
    fresh = iter(fix_run_ons(take, align_beats(take, new_beats), new_beats))
    gap = os.path.join(tmp, "gap.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", "1.0", gap], check=True)
    parts = []
    for n, b in enumerate(beats):
        src, (a, e, _, _) = (take, next(fresh)) if b["id"] in ids else (old_raw, old[n])
        seg = os.path.join(tmp, f"patch_{n:02d}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{e:.3f}", "-i", src, "-ar", "24000", "-ac", "1", seg], check=True)
        parts += [seg, gap]
    lst = os.path.join(tmp, "patch_list.txt")
    open(lst, "w").write("".join(f"file '{p}'\n" for p in parts[:-1]))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, full], check=True)


def main():
    pos = [a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith("--") and not sys.argv[i - 1].startswith("--")]
    script_path = pos[0] if pos else os.path.join(ROOT, "src", "data", "script.json")
    voice, model = arg("--voice", "Puck"), arg("--model", "gemini-3.1-flash-tts-preview")
    beats = json.load(open(script_path))["beats"]
    # ONE request per Reel (free tier ~10 requests/day). Long-form: --chunk N voices N beats per request
    # (chapter-sized blocks) and joins them. Every line is verified afterwards with offline Whisper.
    prefix = arg("--prefix", "")  # e.g. "doc" -> public/audio/doc_vo.wav + src/data/doc/timing.json
    chunk = int(arg("--chunk", "0")) or len(beats)
    groups = [beats[i:i + chunk] for i in range(0, len(beats), chunk)]
    tmp = tempfile.mkdtemp()
    spans = []  # (take, start, end) per beat
    for g, part in enumerate(groups):
        full = os.path.join(tmp, f"full{g}.wav")
        tag = (prefix + "_" if prefix else "") + f"{model}_{voice}" + (f"_{g}" if len(groups) > 1 else "")
        keep = os.path.join(ROOT, "public", "audio", f"vo_raw_{tag}.wav")
        if "--reuse" in sys.argv:  # re-align saved takes without spending requests
            subprocess.run(["cp", arg("--reuse", "") if len(groups) == 1 else keep, full], check=True)
        elif "--patch" in sys.argv:  # re-voice only the changed lines; keep the approved take for the rest
            patch_take(model, voice, part, arg("--patch", ""), json.load(open(arg("--old-script", "")))["beats"],
                       {int(i) for i in arg("--ids", "").split(",")}, full, tmp)
        else:
            prompt = (f"{STYLE} Hook lines punchy and urgent, the middle curious and wry, the payoff energetic, the last line friendly. "
                      "Read the transcript EXACTLY word for word. Do not add, remove or change any words. "
                      "Pause for about one second between lines.\n\nTRANSCRIPT:\n" + "\n\n".join(b["narration"] for b in part))
            body = {"contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
            r = call("POST", f"models/{model}:generateContent", body)
            pcm = base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", "-", full], input=pcm, check=True)
        if "--reuse" not in sys.argv:
            subprocess.run(["cp", full, keep], check=True)
        aligned = fix_run_ons(full, align_beats(full, part), part)
        verify(aligned, part)
        spans += [(full, a, e) for a, e, _, _ in aligned]
    parts, timing, t = [], [], 0.0
    for n, (b, (full, a, e)) in enumerate(zip(beats, spans)):
        last, hook = n == len(beats) - 1, n < 2
        seg = os.path.join(tmp, f"{n:02d}_s.wav")
        # pace control (atempo keeps pitch): 1.0 = the voice's natural pace; <1 slows. Target ~155-165 wpm overall.
        tempo = float(arg("--hook-tempo", "1.0")) if hook else float(arg("--tempo", "0.93"))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{e:.3f}", "-i", full, "-af",  # seek on input (before atempo)
                        f"afade=t=in:d=0.02,atempo={tempo}", seg], check=True)  # spans are already tight to speech (aligned on pauses)
        tighten_pauses(seg, b.get("max_pause", MAX_PAUSE))
        d = dur(seg)
        gap = LAST_GAP if last else (HOOK_IDS_GAP if hook else BODY_GAP)
        scene = round(max(1.2 if hook else 1.6, d + gap), 2)
        pad = os.path.join(tmp, f"{n:02d}_p.wav")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", seg, "-af", f"apad=whole_dur={scene}", "-ar", "48000", "-ac", "2", pad], check=True)
        parts.append(pad)
        timing.append({"id": b["id"], "start": round(t, 2), "speech": round(d, 2), "duration": scene})
        t += scene
        print(f"beat {b['id']}: {d:.2f}s", flush=True)
    lst = os.path.join(tmp, "list.txt")
    open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-af",
                    "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", os.path.join(ROOT, "public", "audio", (prefix + "_" if prefix else "") + "vo.wav")], check=True)
    out = {"total": round(t, 2), "beats": timing}
    outs = [os.path.join(ROOT, "src", "data", prefix, "timing.json")] if prefix else [os.path.join(ROOT, "public", "timing.json"), os.path.join(ROOT, "src", "data", "timing.json")]
    for p in outs:
        json.dump(out, open(p, "w"), indent=1)
    words = sum(len(b["narration"].split()) for b in beats)
    print(f"{voice} via {model}: {round(t, 2)}s, {round(words / t * 60)} wpm overall")


if __name__ == "__main__":
    main()
