#!/usr/bin/env python3
"""Synthesise original, royalty-free sound effects for the ChatSkit composition (public/sfx/chat/*.wav)."""
import os
import numpy as np
import soundfile as sf

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "sfx", "chat")
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(x, a=0.005, r=0.2):
    n = len(x); e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return x * e


def save(name, x, gain=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    sf.write(os.path.join(OUT, f"{name}.wav"), np.stack([x, x], 1).astype(np.float32), SR)


def tone(f, d, shape="sine"):
    ph = 2 * np.pi * np.cumsum(np.full(int(SR * d), f) if np.isscalar(f) else f) / SR
    return np.sin(ph) if shape == "sine" else np.sign(np.sin(ph)) * 0.5


# message ping: two soft bell partials, rising
p1 = env(tone(880, 0.09) + 0.4 * tone(1760, 0.09), r=0.08)
p2 = env(tone(1320, 0.16) + 0.4 * tone(2640, 0.16), r=0.14)
save("ping", np.concatenate([p1, p2]), 0.5)
# own message "send" swoosh-pop
save("send", env(tone(np.linspace(500, 1200, int(SR * 0.08)), 0.08), r=0.06), 0.4)
# keyboard clicks (one burst of 6 taps)
taps = np.zeros(int(SR * 0.9))
for k in range(6):
    s = int(SR * (k * 0.14 + rng.uniform(0, 0.04)))
    n = env(rng.normal(0, 1, int(SR * 0.025)) * np.exp(-np.arange(int(SR * 0.025)) / 120), a=0.0005, r=0.01)
    taps[s:s + len(n)] += n
save("typing", taps, 0.35)
# cinematic boom (low sine drop + noise thump)
b = tone(np.linspace(120, 38, int(SR * 1.2)), 1.2) * np.exp(-t(1.2) * 3)
b[: int(SR * 0.05)] += rng.normal(0, 0.6, int(SR * 0.05)) * np.linspace(1, 0, int(SR * 0.05))
save("boom", np.tanh(b * 2.5), 0.95)
# "bruh"-style sad trombone-ish descending wah (no voice)
w = tone(np.linspace(240, 150, int(SR * 0.9)), 0.9, "square") * (0.6 + 0.4 * np.sin(2 * np.pi * 5 * t(0.9)))
save("bruh", env(w, r=0.3), 0.6)
# drumroll then hit
roll = rng.normal(0, 1, int(SR * 1.4)) * (0.5 + 0.5 * (np.sin(2 * np.pi * 28 * t(1.4)) > 0)) * np.linspace(0.3, 1, int(SR * 1.4))
hit = rng.normal(0, 1, int(SR * 0.5)) * np.exp(-t(0.5) * 9) + tone(70, 0.5) * np.exp(-t(0.5) * 6)
save("drumroll", np.concatenate([roll * 0.5, hit]), 0.8)
# record scratch
sc = rng.normal(0, 1, int(SR * 0.5)) * np.abs(np.sin(2 * np.pi * np.linspace(3, 9, int(SR * 0.5)) * t(0.5)))
save("record", env(np.convolve(sc, np.ones(30) / 30, "same"), r=0.1), 0.7)
# crickets: chirp pulses at 4.3 kHz
cr = np.zeros(int(SR * 2.2))
for k in range(5):
    for j in range(3):
        s = int(SR * (k * 0.42 + j * 0.045))
        c = env(tone(4300, 0.03), a=0.002, r=0.01)
        cr[s:s + len(c)] += c
save("crickets", cr, 0.35)
# ding (correct / idea)
save("ding", env(tone(1568, 0.6) + 0.5 * tone(3136, 0.6) + 0.2 * tone(4704, 0.6), r=0.5) * np.exp(-t(0.6) * 4), 0.55)
# alarm: alternating beeps
al = np.concatenate([np.concatenate([env(tone(988, 0.12, "square"), r=0.02), np.zeros(int(SR * 0.08))]) for _ in range(4)])
save("alarm", al, 0.45)
# join / leave chimes
save("join", np.concatenate([env(tone(f, 0.1), r=0.08) for f in (660, 880, 1100)]), 0.45)
save("leave", np.concatenate([env(tone(f, 0.1), r=0.08) for f in (1100, 880, 660)]), 0.45)
# pop for reactions
save("pop", env(tone(np.linspace(900, 300, int(SR * 0.06)), 0.06), r=0.04), 0.5)
# whoosh for scene cards
wn = np.convolve(rng.normal(0, 1, int(SR * 0.7)), np.ones(60) / 60, "same") * np.sin(np.pi * t(0.7) / 0.7) ** 2
save("whoosh", wn, 0.6)
# light background loop: plucky 4-chord ukulele-ish pattern, 8 s, loopable
bpm, bar = 112, 60 / 112 * 4
chords = [(261.6, 329.6, 392.0), (220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (196.0, 246.9, 293.7)]
loop = np.zeros(int(SR * bar * 4))
for c, ch in enumerate(chords):
    for s8 in range(8):
        st = int(SR * (c * bar + s8 * bar / 8))
        f = ch[s8 % 3] * (2 if s8 in (3, 7) else 1)
        n = (tone(f, 0.35) + 0.3 * tone(2 * f, 0.35)) * np.exp(-t(0.35) * 9)
        n = n[: len(loop) - st]
        loop[st:st + len(n)] += n * (0.8 if s8 % 2 == 0 else 0.55)
    bass = tone(ch[0] / 2, bar * 0.9) * np.exp(-t(bar * 0.9) * 1.5)
    st = int(SR * c * bar); loop[st:st + len(bass)] += bass * 0.6
save("music_loop", loop, 0.6)
print(sorted(os.listdir(OUT)))
