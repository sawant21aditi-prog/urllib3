#!/usr/bin/env python3
"""List the shot images present in public/shots so RealReel can show placeholders for missing ones."""
import json, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
shots = sorted(f for f in os.listdir(os.path.join(root, "public", "shots")) if f.endswith(".png")) if os.path.isdir(os.path.join(root, "public", "shots")) else []
json.dump(shots, open(os.path.join(root, "src", "data", "shots_available.json"), "w"))
print(len(shots), "shots:", shots)
