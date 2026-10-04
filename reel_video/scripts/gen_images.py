#!/usr/bin/env python3
"""Generate photoreal 9:16 shots for a Reel with the Gemini API (Imagen or Gemini image models).

Usage:
  GEMINI_API_KEY=... python3 scripts/gen_images.py [shotlist.json] [--force] [--only 1,13]

Reads the shot list (default: ../reel_assets/real/shotlist.json), writes public/shots/NN.png at 1080x1920.
Model: $GEMINI_IMAGE_MODEL if set, else the best image model the key can see (Imagen 4 preferred).
"""
import base64, json, os, subprocess, sys, urllib.request, urllib.error

API = "https://generativelanguage.googleapis.com/v1beta"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "shots")


def call(method, path, body=None):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("GEMINI_API_KEY is not set — add it in the environment settings and start a new session.")
    req = urllib.request.Request(
        f"{API}/{path}",
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{e.code} {path}: {e.read().decode()[:600]}") from None


def pick_model():
    if os.environ.get("GEMINI_IMAGE_MODEL"):
        return os.environ["GEMINI_IMAGE_MODEL"]
    names, token = [], ""
    while True:
        page = call("GET", "models?pageSize=200" + (f"&pageToken={token}" if token else ""))
        names += [m["name"].split("/", 1)[1] for m in page.get("models", [])]
        token = page.get("nextPageToken")
        if not token:
            break
    ranked = (
        [n for n in names if n.startswith("imagen-4") and "ultra" not in n and "fast" not in n]
        + [n for n in names if n.startswith("imagen-4")]
        + [n for n in names if n.startswith("imagen")]
        + [n for n in names if n.startswith("gemini") and "image" in n]
    )
    if not ranked:
        sys.exit(f"No image model visible to this key. Models seen: {names}")
    return ranked[0]


def generate(model, prompt):
    if model.startswith("imagen"):
        res = call("POST", f"models/{model}:predict", {
            "instances": [{"prompt": prompt}],
            "parameters": {"sampleCount": 1, "aspectRatio": "9:16", "personGeneration": "allow_adult"},
        })
        return base64.b64decode(res["predictions"][0]["bytesBase64Encoded"])
    res = call("POST", f"models/{model}:generateContent", {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "9:16"}},
    })
    for part in res["candidates"][0]["content"]["parts"]:
        if "inlineData" in part:
            return base64.b64decode(part["inlineData"]["data"])
    raise RuntimeError(f"No image in response: {json.dumps(res)[:400]}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    only = None
    if "--only" in sys.argv:
        only = {int(x) for x in sys.argv[sys.argv.index("--only") + 1].split(",")}
        args = [a for a in args if a != sys.argv[sys.argv.index("--only") + 1]]
    shotlist = args[0] if args else os.path.join(ROOT, "..", "reel_assets", "real", "shotlist.json")
    spec = json.load(open(shotlist))
    os.makedirs(OUT, exist_ok=True)
    model = pick_model()
    print("model:", model)
    log = open(os.path.join(OUT, "prompts.log"), "a")
    for shot in spec["shots"]:
        if shot["prompt"].startswith("REUSE") or (only and shot["beat"] not in only):
            continue
        dst = os.path.join(OUT, shot["file"])
        if os.path.exists(dst) and not force:
            print("skip", shot["file"])
            continue
        prompt = f'{shot["prompt"]}, {spec["style_suffix"]}'
        raw = dst + ".raw"
        open(raw, "wb").write(generate(model, prompt))
        # normalize to exactly 1080x1920 (cover-crop) for the composition
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-vf",
                        "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920", dst], check=True)
        os.remove(raw)
        log.write(json.dumps({"file": shot["file"], "model": model, "prompt": prompt}) + "\n")
        print("ok", shot["file"])


if __name__ == "__main__":
    main()
