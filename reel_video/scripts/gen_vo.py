#!/usr/bin/env python3
"""Generate the voiceover + per-beat timing for a Reel with Kokoro (free, offline neural TTS).

Usage:
  python3 scripts/gen_vo.py [script.json] [--voice am_michael] [--speed 1.0]

Reads beats from script.json (default: src/data/script.json). Writes public/audio/vo.wav and
public/timing.json + src/data/timing.json. Per-beat "speed" in script.json overrides --speed
(hook beats run a touch faster so the hook lands inside 3 seconds).

One-time setup in a fresh container (models come from GitHub releases, ~350 MB):
  pip install kokoro-onnx soundfile
  mkdir -p ~/.cache/kokoro && cd ~/.cache/kokoro && for f in kokoro-v1.0.onnx voices-v1.0.bin; do
    curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f; done
"""
import json, os, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.path.expanduser("~/.cache/kokoro")
HOOK_IDS_GAP = 0.18  # hook lines follow each other quickly but stay distinct
BODY_GAP = 0.32  # a natural breath between lines (target pace ~155-165 wpm, no dead air)
LAST_GAP = 0.08  # last beat cuts straight into the loop
MAX_PAUSE = 0.45  # longest pause allowed INSIDE a line (per-beat override: "max_pause")


def arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]))


def tighten_pauses(path, max_pause=MAX_PAUSE, thresh_db=-40.0):
    """Shorten every silence inside a line to at most max_pause seconds (cuts the excess from the middle)."""
    import numpy as np
    import soundfile as sf
    audio, sr = sf.read(path)
    mono = audio if audio.ndim == 1 else audio.mean(axis=1)
    win = int(sr * 0.02)
    rms = np.array([np.sqrt(np.mean(mono[i:i + win] ** 2)) + 1e-9 for i in range(0, len(mono), win)])
    quiet = 20 * np.log10(rms) < thresh_db
    keep, i, n = [], 0, len(quiet)
    while i < n:
        j = i
        while j < n and quiet[j] == quiet[i]:
            j += 1
        a, b = i * win, min(j * win, len(mono))
        if quiet[i] and 0 < i and j < n and (b - a) / sr > max_pause:  # interior silence only
            half = int(max_pause * sr / 2)
            keep += [audio[a:a + half], audio[b - half:b]]
        else:
            keep.append(audio[a:b])
        i = j
    sf.write(path, np.concatenate(keep), sr)


def spoken(text):
    # TTS reads words more reliably than digits/abbreviations
    return text.replace("U.S.", "U S").replace("1990", "nineteen ninety")


def main():
    import soundfile as sf
    from kokoro_onnx import Kokoro

    pos = [a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith("--") and not sys.argv[i - 1].startswith("--")]
    script_path = pos[0] if pos else os.path.join(ROOT, "src", "data", "script.json")
    voice, speed = arg("--voice", "am_michael"), float(arg("--speed", "1.0"))
    prefix = arg("--prefix", "")  # e.g. "toon" -> public/audio/toon_vo.wav + src/data/toon/timing.json
    beats = json.load(open(script_path))["beats"]
    k = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))
    tmp = tempfile.mkdtemp()
    parts, timing, t = [], [], 0.0
    for n, b in enumerate(beats):
        i, last, hook = b["id"], n == len(beats) - 1, n < 2
        s, sr = k.create(spoken(b["narration"]), voice=voice, speed=b.get("speed", speed), lang="en-us")
        raw, trim, pad = (os.path.join(tmp, f"{n:02d}{x}.wav") for x in ("", "_t", "_p"))
        sf.write(raw, s, sr)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse", trim], check=True)
        tighten_pauses(trim, b.get("max_pause", MAX_PAUSE))
        d = dur(trim)
        gap = LAST_GAP if last else (HOOK_IDS_GAP if hook else BODY_GAP)
        scene = round(max(1.2 if hook else 1.6, d + gap), 2)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", trim, "-af", f"apad=whole_dur={scene}",
                        "-ar", "48000", "-ac", "2", pad], check=True)
        parts.append(pad)
        timing.append({"id": i, "start": round(t, 2), "speech": round(d, 2), "duration": scene})
        t += scene
    lst = os.path.join(tmp, "list.txt")
    open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-af",
                    "loudnorm=I=-14:TP=-1.5:LRA=7", "-ar", "48000", os.path.join(ROOT, "public", "audio", (prefix + "_" if prefix else "") + "vo.wav")], check=True)
    out = {"total": round(t, 2), "beats": timing}
    outs = [os.path.join(ROOT, "src", "data", prefix, "timing.json")] if prefix else [os.path.join(ROOT, "public", "timing.json"), os.path.join(ROOT, "src", "data", "timing.json")]
    for p in outs:
        json.dump(out, open(p, "w"), indent=1)
    shutil.rmtree(tmp)
    print(f"{voice}: {round(t, 2)}s", [b["duration"] for b in timing])


if __name__ == "__main__":
    main()
