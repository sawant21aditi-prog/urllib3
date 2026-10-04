#!/usr/bin/env python3
"""List element PNGs in public/elements so CollageReel shows placeholders for missing ones."""
import json, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = os.path.join(root, "public", "elements")
names = sorted(f for f in os.listdir(d) if f.endswith(".png")) if os.path.isdir(d) else []
json.dump(names, open(os.path.join(root, "src", "data", "elements_available.json"), "w"))
print(len(names), "elements")
