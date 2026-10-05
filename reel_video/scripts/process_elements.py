#!/usr/bin/env python3
"""Turn ZAPI Flow downloads into CollageReel elements.

Usage:
  python3 scripts/process_elements.py <folder-or-zip> [elements.json]

- Images are matched to elements.json entries in download order (sorted filenames).
- Props: background removed with rembg (u2net), cropped tight to the object, saved as public/elements/<name>.png.
- Backgrounds (name starts with bg_): cover-cropped to 1080x1920.
One-time setup: pip install rembg ; model ~/.u2net/u2net.onnx from
https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx
"""
import json, os, sys, tempfile, zipfile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "elements")


def images_in(src):
    if src.endswith(".zip"):
        tmp = tempfile.mkdtemp()
        zipfile.ZipFile(src).extractall(tmp)
        src = tmp
    files = []
    for dp, _, fs in os.walk(src):
        files += [os.path.join(dp, f) for f in fs if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))]
    return sorted(files, key=lambda p: os.path.basename(p))


def cover(im, w=1080, h=1920):
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((l, t, l + w, t + h))


def flood_cut(im, thresh=38):
    """Fallback cutout for flat or pale objects (paper, doors, ink) that the model wrongly erases:
    flood-fill the near-white background from the image edges."""
    from PIL import ImageDraw
    w, h = im.size
    key = im.copy()
    for pt in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        if sum(key.getpixel(pt)) > 650:
            ImageDraw.floodfill(key, pt, (255, 0, 255), thresh=thresh)
    alpha = Image.new("L", (w, h), 255)
    kp, ap = key.load(), alpha.load()
    for y in range(h):
        for x in range(w):
            if kp[x, y] == (255, 0, 255):
                ap[x, y] = 0
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


def main():
    from rembg import new_session, remove

    args = [a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith("--") and sys.argv[i - 1] != "--flood"]
    src = args[0]
    spec_path = args[1] if len(args) > 1 else os.path.join(ROOT, "..", "reel_assets", "collage", "elements.json")
    elements = json.load(open(spec_path))["elements"]
    files = images_in(src)
    if len(files) != len(elements):
        print(f"warning: {len(files)} images for {len(elements)} elements, matching the first {min(len(files), len(elements))} in order")
    os.makedirs(OUT, exist_ok=True)
    session = new_session("u2net")
    for el, f in zip(elements, files):
        im = Image.open(f).convert("RGB")
        dst = os.path.join(OUT, f'{el["name"]}.png')
        if el["name"].startswith("bg_"):
            cover(im).save(dst)
        else:
            # --flood name1,name2: use the edge flood-fill for objects the model erases (check the pink contact sheet)
            flood = set(sys.argv[sys.argv.index("--flood") + 1].split(",")) if "--flood" in sys.argv else set()
            cut = flood_cut(im) if el["name"] in flood else remove(im, session=session)
            box = cut.getbbox()
            if box:
                pad = 12
                cut = cut.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(cut.width, box[2] + pad), min(cut.height, box[3] + pad)))
            # upscale small cutouts so they stay crisp at Reel size
            if cut.width < 900:
                s = 900 / cut.width
                cut = cut.resize((round(cut.width * s), round(cut.height * s)), Image.LANCZOS)
            cut.save(dst)
        print(f'{os.path.basename(f)} -> {el["name"]}.png')


if __name__ == "__main__":
    main()
