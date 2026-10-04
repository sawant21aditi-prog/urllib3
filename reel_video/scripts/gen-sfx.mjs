// Synthesizes the SFX kit + music bed as 16-bit WAVs into public/sfx — no downloads.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sfx");
mkdirSync(OUT, { recursive: true });

// Deterministic noise so re-renders sound identical.
let seed = 1234567;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

function wav(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buf;
}
const secs = (s) => Math.round(s * SR);
const save = (name, out) => writeFileSync(join(OUT, name), wav(out));

// whoosh — swept, lowpassed noise
{
  const N = secs(0.4), out = new Float32Array(N);
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const env = Math.sin(Math.PI * Math.pow(t, 0.7)) ** 2;
    lp += (0.05 + 0.25 * Math.sin(Math.PI * t)) * (rand() - lp);
    out[i] = lp * env * 0.9;
  }
  save("whoosh.wav", out);
}

// pop — pitch-dropping sine
{
  const N = secs(0.14), out = new Float32Array(N);
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    ph += (2 * Math.PI * (700 - 380 * t)) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 9) * 0.8;
  }
  save("pop.wav", out);
}

// click — the elevator button press (short filtered transient)
{
  const N = secs(0.06), out = new Float32Array(N);
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    ph += (2 * Math.PI * 2400) / SR;
    out[i] = (Math.sin(ph) * 0.5 + rand() * 0.5) * Math.exp(-t * 22) * 0.8;
  }
  save("click.wav", out);
}

// tick — tiny high blip
{
  const N = secs(0.05), out = new Float32Array(N);
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    ph += (2 * Math.PI * 1900) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 14) * 0.5;
  }
  save("tick.wav", out);
}

// bass — low sine thump for big hits
{
  const N = secs(0.5), out = new Float32Array(N);
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    ph += (2 * Math.PI * (85 - 30 * t)) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 6) * 0.95;
  }
  save("bass.wav", out);
}

// ding — the elevator chime (two-tone bell)
{
  const N = secs(1.2), out = new Float32Array(N);
  for (const [f, start] of [[1318.5, 0], [1046.5, 0.32]]) {
    const s0 = secs(start);
    for (let i = s0; i < N; i++) {
      const t = (i - s0) / SR;
      const env = Math.exp(-t * 3.2);
      out[i] += (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 6)) * env * 0.32;
    }
  }
  save("ding.wav", out);
}

// glitch — bit-crushed noise stutter
{
  const N = secs(0.3), out = new Float32Array(N);
  let hold = 0;
  for (let i = 0; i < N; i++) {
    if (i % 220 === 0) hold = rand();
    const gate = Math.floor(i / 1400) % 2 === 0 ? 1 : 0.25;
    out[i] = Math.round(hold * 4) / 4 * gate * 0.5 * (1 - i / N);
  }
  save("glitch.wav", out);
}

// riser — rising filtered noise + sine sweep
{
  const N = secs(0.9), out = new Float32Array(N);
  let lp = 0, ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    lp += (0.02 + 0.4 * t * t) * (rand() - lp);
    ph += (2 * Math.PI * (200 + 1400 * t * t)) / SR;
    out[i] = (lp * 0.7 + Math.sin(ph) * 0.15) * t * t * 0.9;
  }
  save("riser.wav", out);
}

// music bed — curious pizzicato-ish pulse over a soft pad, 112 BPM, ~36s
{
  const DUR = 36, BPM = 112, N = secs(DUR), out = new Float32Array(N);
  const beat = 60 / BPM;
  // pad: D minor-ish (D3 F3 A3 C4)
  const pad = [146.83, 174.61, 220, 261.63];
  for (const f of pad) for (const d of [f / 1.002, f * 1.002]) {
    let ph = rand() * 6.28;
    for (let i = 0; i < N; i++) { ph += (2 * Math.PI * d) / SR; out[i] += Math.sin(ph) * 0.028; }
  }
  // plucked arpeggio, 8th notes
  const arp = [293.66, 349.23, 440, 523.25, 440, 349.23, 293.66, 261.63];
  const step = beat / 2;
  for (let k = 0; k * step < DUR; k++) {
    const f = arp[k % arp.length] * (Math.floor(k / 16) % 2 ? 1 : 1);
    const s0 = secs(k * step), len = secs(0.35);
    for (let i = 0; i < len && s0 + i < N; i++) {
      const t = i / SR;
      out[s0 + i] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 11) * 0.16;
    }
  }
  // soft kick on beats, shaker on offbeats
  for (let k = 0; k * beat < DUR; k++) {
    const s0 = secs(k * beat);
    let ph = 0;
    for (let i = 0; i < secs(0.25) && s0 + i < N; i++) {
      const t = i / SR;
      ph += (2 * Math.PI * (110 - 60 * (t / 0.25))) / SR;
      out[s0 + i] += Math.sin(ph) * Math.exp(-t * 18) * 0.35;
    }
    const s1 = secs(k * beat + beat / 2);
    for (let i = 0; i < secs(0.05) && s1 + i < N; i++) out[s1 + i] += rand() * Math.exp(-(i / SR) * 70) * 0.06;
  }
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    out[i] *= Math.min(1, t / 0.8) * Math.min(1, (DUR - t) / 2);
  }
  save("music.wav", out);
}

console.log("SFX written to", OUT);
