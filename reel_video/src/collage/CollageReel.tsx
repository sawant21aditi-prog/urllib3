// "Living collage" Reel, modelled on the user's two reference videos:
//  - full-screen textured photo background per scene (changes every beat)
//  - real-photo cutout props (public/elements/*.png, transparent) each animated on its own
//  - everything stepped at ~12fps (stop-motion feel); hand-made 2D FX (sunburst, marker circle, sparks)
//  - element-driven transitions (torn-paper wipe, slide-up, zoom-through) instead of plain cuts
//  - quiet subtitles: one line on a small white rounded tag near the bottom, key word bold
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import script from "../data/script.json";
import timingDefault from "../data/timing.json";
import available from "../data/elements_available.json";
import { theme } from "../theme";
import { clamp } from "../components/lib";
import "../fonts";

/** Stop-motion clock: hold each pose for 2.5 frames at 30fps → 12 poses per second. */
const step = (f: number) => Math.floor(f / 2.5) * 2.5;
const has = (name: string) => (available as string[]).includes(`${name}.png`);
const ease = theme.ease;

type Anim =
  | "static" | "slideL" | "slideR" | "drop" | "rise" | "press" | "jab" | "sink" | "tilt"
  | "turn" | "yank" | "crawl" | "rollIn" | "stamp" | "silhouette";
type Prop = {
  el: string; x: number; y: number; w: number;
  anim?: Anim; at?: number; rot?: number; flip?: boolean; z?: number;
  target?: [number, number]; // press/jab: fingertip target (px)
  bw?: boolean; // force black & white
  noEnter?: boolean;
  noPop?: boolean; // already on screen at frame 0 (hook / loop frames) // press/jab hand already in frame (used on beat 1 so the loop from the last beat is seamless)
};
type Fx =
  | { type: "sunburst"; x: number; y: number; r: number; color?: string; at?: number }
  | { type: "circle"; x: number; y: number; r: number; at: number; color?: string }
  | { type: "sparks"; x: number; y: number; at: number }
  | { type: "question"; x: number; y: number; at: number }
  | { type: "doors"; x: number; y: number; w: number; open: [number, number]; at?: number; until?: number }
  | { type: "spotlight"; x: number; y: number; r: number }
  | { type: "flicker" }
  | { type: "cross"; x: number; y: number; r: number; at: number }
  | { type: "birds"; y: number; count?: number; at?: number }
  | { type: "plane"; x: number; y: number; at: number } // code-drawn paper-plane "send" icon flying off (CTA beats)
  | { type: "strip"; y: number; h: number; color?: string; img?: string; rot?: number }
  | { type: "counter"; x: number; y: number; from: number; to: number; at: number; until: number; label: string; decimals?: number }
  | { type: "write"; text: string; x: number; y: number; size: number; at: number; color?: string; rot?: number };
type Scene = {
  bg: string; props: Prop[]; fx?: Fx[]; transition?: "cut" | "torn" | "slideUp" | "zoom"; bold?: string; punch?: boolean;
  word?: { text: string; y?: number; color?: string; at?: number }; // giant serif word layered BEHIND the props
  tint?: string; // optional colour field laid over the background texture (multiply)
};
type CBeat = { id: number; narration: string; scene?: Scene };

/* ---------------- props ---------------- */
const PropLayer: React.FC<{ p: Prop; speech: number; dur: number; index: number }> = ({ p, speech, dur, index }) => {
  const { width: W, height: H } = useVideoConfig();
  const f = step(useCurrentFrame());
  const seed = index * 1.7 + p.x / 100;
  const at = Math.round((p.at ?? 0) * speech);
  const t = f - at;
  const inP = interpolate(t, [0, 9], [0, 1], { ...clamp, easing: ease.out });
  // hand-made "boil": every pose gets a tiny random wobble
  const boil = (random(`b${p.el}${Math.floor(f / 5)}`) - 0.5) * 1.2;
  let x = p.x, y = p.y, rot = (p.rot ?? 0) + boil, sc = 1, op = 1, filter = p.bw ? "grayscale(1) contrast(1.15)" : "";
  switch (p.anim) {
    case "slideL": x = p.x + (1 - inP) * -900; break;
    case "slideR": x = p.x + (1 - inP) * 900; break;
    case "drop": {
      const d = interpolate(t, [0, 6, 9, 12], [-1400, 30, -14, 0], clamp);
      y = p.y + d; rot += interpolate(t, [0, 12], [-20, 0], clamp); break;
    }
    case "rise": y = p.y + (1 - inP) * 1300; break;
    case "sink": y = p.y + interpolate(t, [0, 30], [0, 1200], { ...clamp, easing: ease.in }); break;
    case "tilt": rot += interpolate(t, [0, 14], [0, -14], { ...clamp, easing: ease.out }); break;
    case "stamp": sc = t < 0 ? 0 : t < 3 ? 1.6 : t < 6 ? 0.92 : 1; break;
    case "silhouette": y = p.y + (1 - inP) * 700; filter = "brightness(0.08) contrast(1.2)"; op = 0.95; break;
    case "crawl": x = p.x + interpolate(f, [0, dur], [0, 260], clamp); break;
    case "rollIn": { x = p.x + (1 - inP) * -1000; rot += (1 - inP) * -8; break; }
    case "turn": rot += interpolate(t, [0, 8], [0, 90], { ...clamp, easing: ease.out }); break;
    case "yank": {
      y = p.y + interpolate(t, [0, 3, 6, 10], [0, 180, 150, 165], clamp);
      rot += interpolate(t, [0, 3, 6, 10, 14], [0, 12, -8, 4, 0], clamp); break;
    }
    case "press":
    case "jab": {
      // hand enters from the side, then presses toward the target repeatedly
      const enter = p.noEnter ? 0 : interpolate(f, [0, 8], [1, 0], { ...clamp, easing: ease.out });
      x = p.x + enter * 700;
      const period = p.anim === "jab" ? 5 : 12;
      const ph = f >= at ? ((f - at) % period) / period : 1;
      const push = p.anim === "jab" ? Math.sin(ph * Math.PI) : ph < 0.35 ? Math.sin((ph / 0.35) * Math.PI) : 0;
      const [tx, ty] = p.target ?? [p.x, p.y];
      x += (tx - p.x) * 0.08 * push - 40 * push;
      y += (ty - p.y) * 0.08 * push - 30 * push;
      break;
    }
  }
  if (["slideL", "slideR", "drop", "rise", "rollIn", "silhouette"].includes(p.anim ?? "") && t < 0) op = 0;
  // props without an entrance animation still pop in, staggered, so nothing is ever just "there"
  if ((!p.anim || p.anim === "static") && !p.noPop) {
    const pt = f - index * 3;
    sc *= pt < 0 ? 0 : interpolate(pt, [0, 3, 5, 8], [0.3, 1.14, 0.95, 1], clamp);
  }
  // idle life: every prop bobs and sways (stepped), never frozen
  if (p.anim !== "crawl" && p.anim !== "press" && p.anim !== "jab") {
    y += Math.sin(f / 9 + seed) * 7;
    rot += Math.sin(f / 13 + seed) * 1.6;
  }
  // speed lines while sliding in
  const sliding = ["slideL", "slideR", "rollIn"].includes(p.anim ?? "") && inP > 0.02 && inP < 0.92;
  const fromLeft = p.anim === "slideL" || p.anim === "rollIn";
  // dust puff when a dropped prop lands
  const dustT = p.anim === "drop" ? t - 6 : -1;
  // impact star at the fingertip on every press
  let impact = 0;
  if ((p.anim === "press" || p.anim === "jab") && f >= at) {
    const period = p.anim === "jab" ? 5 : 12;
    const ph = ((f - at) % period) / period;
    impact = p.anim === "jab" ? (ph > 0.35 && ph < 0.65 ? 1 : 0) : ph > 0.12 && ph < 0.3 ? 1 : 0;
  }
  const [ix, iy] = p.target ?? [p.x, p.y];
  return (
    <>
    {sliding && (
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, zIndex: (p.z ?? 1) - 0.5 }}>
        {[-0.25, 0, 0.22].map((k, i) => (
          <line key={i} x1={x + (fromLeft ? -1 : 1) * (p.w * 0.45)} y1={y + k * p.w} x2={x + (fromLeft ? -1 : 1) * (p.w * 0.45 + 260 + i * 60)} y2={y + k * p.w}
            stroke="rgba(255,255,255,0.85)" strokeWidth={10} strokeLinecap="round" />
        ))}
      </svg>
    )}
    {dustT >= 0 && dustT < 10 && (
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, zIndex: (p.z ?? 1) + 0.5 }}>
        {[-1, -0.5, 0.5, 1].map((k, i) => (
          <circle key={i} cx={p.x + k * (p.w * 0.35 + dustT * 14)} cy={p.y + p.w * 0.55 - dustT * 3} r={22 + dustT * 4} fill="rgba(240,232,215,0.75)" opacity={1 - dustT / 10} />
        ))}
      </svg>
    )}
    {impact > 0 && (
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, zIndex: 6 }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={ix + Math.cos(a) * 70} y1={iy + Math.sin(a) * 70} x2={ix + Math.cos(a) * 130} y2={iy + Math.sin(a) * 130} stroke="#FFD84A" strokeWidth={12} strokeLinecap="round" />;
        })}
      </svg>
    )}
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: p.w,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${sc}) ${p.flip ? "scaleX(-1)" : ""}`,
        opacity: op,
        filter: `${filter} drop-shadow(0 18px 18px rgba(0,0,0,0.35))`,
        zIndex: p.z ?? 1,
      }}
    >
      {has(p.el) ? (
        <Img src={staticFile(`elements/${p.el}.png`)} style={{ width: "100%", display: "block" }} />
      ) : (
        <div style={{ width: "100%", aspectRatio: "1", border: "6px dashed rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.fonts.display, fontSize: 48, color: "rgba(0,0,0,0.55)", background: "rgba(255,255,255,0.35)" }}>
          {p.el}
        </div>
      )}
    </div>
    </>
  );
};

/* ---------------- hand-made 2D FX ---------------- */
const Sunburst: React.FC<{ x: number; y: number; r: number; color: string; at: number }> = ({ x, y, r, color, at }) => {
  const f = step(useCurrentFrame());
  if (f < at) return null;
  const s = interpolate(f - at, [0, 5, 8], [0.2, 1.08, 1], clamp);
  const jit = Math.floor(f / 5) % 2 ? 4 : -4; // boiling rotation like the reference starburst
  const n = 16;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.62 : r * (0.95 + random(`sb${i}`) * 0.12);
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={r * 2.4} height={r * 2.4} viewBox={`${-r * 1.2} ${-r * 1.2} ${r * 2.4} ${r * 2.4}`}
      style={{ position: "absolute", left: x - r * 1.2, top: y - r * 1.2, transform: `rotate(${jit}deg) scale(${s})`, zIndex: 0 }}>
      <polygon points={pts} fill={color} />
    </svg>
  );
};

const MarkerCircle: React.FC<{ x: number; y: number; r: number; at: number; color: string }> = ({ x, y, r, at, color }) => {
  const { width: W, height: H } = useVideoConfig();
  const f = step(useCurrentFrame());
  const p = interpolate(f, [at, at + 8], [0, 1], clamp);
  if (p <= 0) return null;
  const pts: string[] = [];
  for (let i = 0; i <= 54; i++) {
    const a = (i / 48) * Math.PI * 2 - 2.4;
    const w = 1 + (random(`mc${x}${Math.floor(i / 6)}`) - 0.5) * 0.08 + (i / 48) * 0.07;
    pts.push(`${(x + Math.cos(a) * r * 1.1 * w).toFixed(1)},${(y + Math.sin(a) * r * 0.9 * w).toFixed(1)}`);
  }
  const len = 2 * Math.PI * r * 1.2;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, zIndex: 5, overflow: "visible" }}>
      <path d={`M${pts.join(" L")}`} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </svg>
  );
};

/** Red marker X scrawled over something ("doesn't do anything"). */
const Cross: React.FC<{ x: number; y: number; r: number; at: number }> = ({ x, y, r, at }) => {
  const { width: W, height: H } = useVideoConfig();
  const f = step(useCurrentFrame());
  const p1 = interpolate(f, [at, at + 4], [0, 1], clamp);
  const p2 = interpolate(f, [at + 4, at + 8], [0, 1], clamp);
  if (p1 <= 0) return null;
  const L = r * 2.9;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, zIndex: 7 }}>
      <path d={`M${x - r} ${y - r * 1.05} L${x + r * 1.05} ${y + r}`} stroke="#E5352B" strokeWidth={26} strokeLinecap="round" fill="none" strokeDasharray={L} strokeDashoffset={L * (1 - p1)} />
      <path d={`M${x + r} ${y - r} L${x - r * 1.02} ${y + r * 1.05}`} stroke="#E5352B" strokeWidth={26} strokeLinecap="round" fill="none" strokeDasharray={L} strokeDashoffset={L * (1 - p2)} />
    </svg>
  );
};

const Sparks: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const { width: W, height: H } = useVideoConfig();
  const f = step(useCurrentFrame());
  const t = f - at;
  if (t < 0 || t > 14) return null;
  const p = t / 14;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, zIndex: 6 }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + random(`sp${i}`);
        const r0 = 30 + p * 120, r1 = r0 + 60 * (1 - p);
        return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1}
          stroke={i % 2 ? "#FFD84A" : "#FFFFFF"} strokeWidth={10} strokeLinecap="round" />;
      })}
    </svg>
  );
};

const Question: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const f = step(useCurrentFrame());
  const p = interpolate(f, [at, at + 10], [0, 1], clamp);
  if (p <= 0) return null;
  const d = "M -60 -90 C -60 -170 70 -170 70 -95 C 70 -40 0 -40 0 20 L 0 40";
  return (
    <svg width={400} height={500} viewBox="-200 -250 400 500" style={{ position: "absolute", left: x - 200, top: y - 250, zIndex: 6 }}>
      <path d={d} fill="none" stroke="#FFD84A" strokeWidth={34} strokeLinecap="round" strokeDasharray={420} strokeDashoffset={420 * (1 - p)} />
      {p > 0.95 && <circle cx={0} cy={110} r={22} fill="#FFD84A" />}
    </svg>
  );
};

/** Elevator doors: the steel frame stays fixed; only the two panels slide apart inside the opening. */
const DOOR_ASPECT = 1660 / 900;
const OPEN = { l: 0.135, r: 0.135, t: 0.085, b: 0.02 }; // opening inside the frame, as fractions of the image
const Doors: React.FC<{ x: number; y: number; w: number; open: [number, number]; at: number; until: number }> = ({ x, y, w, open, at, until }) => {
  const f = step(useCurrentFrame());
  const o = interpolate(f, [at, until], open, { ...clamp, easing: ease.inOut });
  const h = w * DOOR_ASPECT;
  const ow = w * (1 - OPEN.l - OPEN.r);
  const img = (style: React.CSSProperties) =>
    has("doors") ? <Img src={staticFile("elements/doors.png")} style={{ position: "absolute", width: w, height: h, ...style }} /> : null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, zIndex: 1, filter: "drop-shadow(0 18px 18px rgba(0,0,0,0.35))" }}>
      {img({ left: 0, top: 0 })}
      <div style={{ position: "absolute", left: w * OPEN.l, top: h * OPEN.t, width: ow, height: h * (1 - OPEN.t - OPEN.b), overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#fff3cf, #e2cf98)" }} />
        {(["L", "R"] as const).map((side) => (
          <div key={side} style={{ position: "absolute", inset: 0, clipPath: side === "L" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)", transform: `translateX(${(side === "L" ? -1 : 1) * o * ow * 0.5}px)` }}>
            {img({ left: -w * OPEN.l, top: -h * OPEN.t })}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Hand-written marker text (e.g. "1990" on the calendar), wiped on in stop-motion steps. */
const Write: React.FC<{ text: string; x: number; y: number; size: number; at: number; color: string; rot: number }> = ({ text, x, y, size, at, color, rot }) => {
  const f = step(useCurrentFrame());
  const p = interpolate(f, [at, at + 8], [0, 1], clamp);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg)`, zIndex: 5,
      fontFamily: theme.fonts.display, fontSize: size, color, letterSpacing: "0.02em", clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
      {text}
    </div>
  );
};

/** Giant high-contrast serif word behind the subject (the reference's "Vox" wordmark layering). */
const BigWord: React.FC<{ text: string; y: number; color: string; at: number }> = ({ text, y, color, at }) => {
  const f = step(useCurrentFrame());
  const t = f - at;
  if (t < 0) return null;
  // Playfair 900 capitals are ~0.8em wide: fit the word inside ~89% of the frame width (camera push adds ~8%)
  const { width: W } = useVideoConfig();
  const size = Math.min(W > 1500 ? 380 : 400, (W * 0.89) / Math.max(2.4, text.length * 0.8));
  const reveal = interpolate(t, [0, 5], [0, 1], clamp);
  const drift = interpolate(f, [0, 300], [0, -18]);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.6, display: "flex", justifyContent: "center", zIndex: 0.5,
      transform: `translateX(${drift}px) scale(${interpolate(t, [0, 2.5, 5], [1.25, 0.97, 1], clamp)})`,
      clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)` }}>
      <span style={{ fontFamily: "Playfair", fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: "-0.03em", color,
        textShadow: "0 10px 30px rgba(0,0,0,0.35)" }}>{text}</span>
    </div>
  );
};

/** Little flapping birds drifting across (ambient life, like the reference). */
const Birds: React.FC<{ y: number; count: number; at: number }> = ({ y, count, at }) => {
  const { width: W, height: H } = useVideoConfig();
  const f = step(useCurrentFrame());
  if (f < at) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, zIndex: 4 }}>
      {Array.from({ length: count }).map((_, i) => {
        const sp = 7 + random(`bs${i}`) * 5;
        const x = -80 + ((f - at) * sp + random(`bx${i}`) * 900) % (W + 160);
        const yy = y + random(`by${i}`) * 260 + Math.sin((f + i * 7) / 6) * 10;
        const flap = Math.floor((f + i * 3) / 2.5) % 2 ? 10 : -6;
        const s = 0.7 + random(`bz${i}`) * 0.7;
        return <path key={i} d={`M ${x - 22 * s} ${yy + flap * s} Q ${x - 10 * s} ${yy - 6 * s} ${x} ${yy} Q ${x + 10 * s} ${yy - 6 * s} ${x + 22 * s} ${yy + flap * s}`}
          stroke="#1c1b19" strokeWidth={5 * s} fill="none" strokeLinecap="round" />;
      })}
    </svg>
  );
};

/** A torn-paper band (sky, newsprint, colour) laid across the scene as a middle layer. */
const Strip: React.FC<{ y: number; h: number; color?: string; img?: string; rot?: number }> = ({ y, h, color, img, rot }) => {
  const edge = (top: boolean) => Array.from({ length: 21 }, (_, i) => `${i * 5}% ${top ? (random(`st${y}${i}`) * 6) : 100 - random(`sb${y}${i}`) * 6}%`);
  const clip = `polygon(${[...edge(true), ...edge(false).reverse()].join(", ")})`;
  return (
    <div style={{ position: "absolute", left: -40, right: -40, top: y - h / 2, height: h, transform: `rotate(${rot ?? -3}deg)`, zIndex: 0.3,
      clipPath: clip, background: color ?? "#7fb8e8", filter: "drop-shadow(0 6px 0 rgba(255,255,255,0.8))" }}>
      {img && has(img) && <Img src={staticFile(`elements/${img}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }} />}
    </div>
  );
};

/** UI counter overlay that ticks (the reference's view counter) — used for "3.0 SEC". */
const Counter: React.FC<{ x: number; y: number; from: number; to: number; at: number; until: number; label: string; decimals: number }> = ({ x, y, from, to, at, until, label, decimals }) => {
  const f = step(useCurrentFrame());
  if (f < at) return null;
  const v = interpolate(f, [at, until], [from, to], clamp);
  const p = interpolate(f, [at, until], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x - 300, top: y, width: 600, zIndex: 8, background: "rgba(255,255,255,0.94)", borderRadius: 18, padding: "16px 24px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
      <div style={{ fontFamily: theme.fonts.body, fontWeight: 900, fontSize: 54, color: "#1E2A2C" }}>{v.toFixed(decimals)} <span style={{ fontWeight: 800, fontSize: 40, color: "#5d6b6e" }}>{label}</span></div>
      <div style={{ height: 12, borderRadius: 6, background: "#dfe5e6", marginTop: 8, overflow: "hidden" }}>
        <div style={{ width: `${p * 100}%`, height: "100%", background: "#2EC46F" }} />
      </div>
    </div>
  );
};

/** Paper-plane "send" icon (generic, not a platform logo) that pops in, then flies off with a dashed trail. */
const Plane: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const { width: W, height: H } = useVideoConfig();
  const f = step(useCurrentFrame());
  const t = f - at;
  if (t < 0) return null;
  const pop = interpolate(t, [0, 3, 5], [0.3, 1.15, 1], clamp);
  const fly = interpolate(t, [10, 22], [0, 1], { ...clamp, easing: ease.in });
  const px = x + fly * 520, py = y - fly * 620;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, zIndex: 9 }}>
      {fly > 0 && <path d={`M ${x} ${y} Q ${x + 160} ${y + 40} ${px} ${py}`} stroke="#FFFFFF" strokeWidth={9} strokeDasharray="22 18" fill="none" strokeLinecap="round" />}
      <g transform={`translate(${px} ${py}) rotate(-28) scale(${pop * 2.2})`}>
        <circle r={58} fill="#FFD21F" stroke="#1E1D1B" strokeWidth={5} />
        <path d="M -30 2 L 32 -26 L 14 30 L 4 10 Z" fill="#FFFFFF" stroke="#1E1D1B" strokeWidth={5} strokeLinejoin="round" />
        <path d="M 4 10 L 32 -26" stroke="#1E1D1B" strokeWidth={5} />
      </g>
    </svg>
  );
};

/* ---------------- background + transitions ---------------- */
const Background: React.FC<{ name: string }> = ({ name }) => {
  const f = step(useCurrentFrame());
  const drift = Math.sin(f / 40) * 6;
  return (
    <AbsoluteFill style={{ background: "#2b5f63" }}>
      {has(name) ? (
        <Img src={staticFile(`elements/${name}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(1.04) translateX(${drift}px)` }} />
      ) : (
        <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.18) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.18) 2px, transparent 2px)", backgroundSize: "90px 90px" }} />
      )}
    </AbsoluteFill>
  );
};

const tornEdge = (p: number) => {
  // a jagged paper edge sweeping up from the bottom
  const yEdge = (1 - p) * 110;
  const pts = ["0% 100%", "100% 100%"];
  for (let i = 10; i >= 0; i--) pts.push(`${i * 10}% ${Math.max(-5, yEdge + (random(`te${i}`) - 0.5) * 6)}%`);
  return `polygon(${pts.join(", ")})`;
};

const TransitionIn: React.FC<{ kind: Scene["transition"]; children: React.ReactNode }> = ({ kind, children }) => {
  const { height: H } = useVideoConfig();
  const f = step(useCurrentFrame());
  const p = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: ease.out });
  if (!kind || kind === "cut" || p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  if (kind === "torn") return <AbsoluteFill style={{ clipPath: tornEdge(p), filter: "drop-shadow(0 -10px 0 #f4eee0)" }}>{children}</AbsoluteFill>;
  if (kind === "slideUp") return <AbsoluteFill style={{ transform: `translateY(${(1 - p) * H}px)` }}>{children}</AbsoluteFill>;
  return <AbsoluteFill style={{ transform: `scale(${0.75 + 0.25 * p})`, opacity: p, filter: `blur(${(1 - p) * 12}px)` }}>{children}</AbsoluteFill>;
};

/** Scene camera: never static. Slow push, a shake on every impact, and a punch-out from a close-up on the hook. */
const SceneCamera: React.FC<{ dur: number; hits: number[]; punch?: boolean; children: React.ReactNode }> = ({ dur, hits, punch, children }) => {
  const f = step(useCurrentFrame());
  let scale = interpolate(f, [0, dur], [1, 1.08], clamp);
  if (punch) scale *= interpolate(f, [0, 2.5, 7.5], [1.7, 1.25, 1], { ...clamp, easing: ease.out });
  let sx = 0, sy = 0, r = 0;
  for (const h of hits) {
    const t = f - h;
    if (t >= 0 && t < 8) {
      const k = 1 - t / 8;
      sx += (random(`hx${h}${t}`) - 0.5) * 36 * k;
      sy += (random(`hy${h}${t}`) - 0.5) * 36 * k;
      r += (random(`hr${h}${t}`) - 0.5) * 2.4 * k;
    }
  }
  return <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) rotate(${r}deg) scale(${scale})` }}>{children}</AbsoluteFill>;
};

/* ---------------- kinetic captions (reference style: 1–3 words, uppercase, white, soft shadow) ---------------- */
const Subtitle: React.FC<{ text: string; bold?: string; speech: number; dur: number }> = ({ text, bold, speech, dur }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const wide = W > H;
  if (f >= dur) return null;
  const words = text.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; ) {
    const left = words.length - i;
    const n = left <= 3 ? left : words[i].length + (words[i + 1] ?? "").length > 11 ? 1 : 2;
    chunks.push(words.slice(i, i + n).join(" "));
    i += n;
  }
  let acc = 0;
  const spans = chunks.map((c) => { const s0 = (acc / text.length) * speech; acc += c.length + 1; return { c, s0 }; });
  const idx = spans.reduce((k, sp, i) => (f >= sp.s0 ? i : k), -1);
  if (idx < 0) return null;
  const norm = (w: string) => w.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const b = (bold ?? "").split(" ").map(norm);
  const pop = interpolate(f - spans[idx].s0, [0, 2, 4], [0.85, 1.06, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: wide ? H - 190 : 1250, display: "flex", justifyContent: "center", zIndex: 20 }}>
      <div style={{ transform: `scale(${pop})`, fontFamily: theme.fonts.body, fontWeight: 900, fontSize: wide ? 58 : 64, letterSpacing: "0.01em", textAlign: "center",
        color: "#FFFFFF", textShadow: "0 5px 0 rgba(0,0,0,0.45), 0 0 22px rgba(0,0,0,0.45)", textTransform: "uppercase",
        WebkitTextStroke: wide ? "10px #1E1D1B" : "12px #1E1D1B", paintOrder: "stroke fill" /* solid outline: readable on light paper and dark scenes alike */ }}>
        {spans[idx].c.split(" ").map((w, i) => (
          <span key={i} style={{ color: b.includes(norm(w)) ? "#FFD21F" : "#FFFFFF" }}>{w}{" "}</span>
        ))}
      </div>
    </div>
  );
};

/* ---------------- composition ---------------- */
type Timing = { total: number; beats: { start: number; speech: number; duration: number }[] };
/** Default data = the current Reel. The long-form composition (CollageDoc) passes its own script, timing and voice track. */
export const CollageReel: React.FC<{ beatsData?: { beats: unknown[] }; timingData?: Timing; vo?: string }> = ({ beatsData, timingData, vo }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const beats = (beatsData ?? script).beats as unknown as CBeat[];
  const timing = timingData ?? (timingDefault as Timing);
  const cuts = timing.beats.map((t) => ({ from: Math.round(t.start * fps), dur: Math.round(t.duration * fps), speech: Math.round(t.speech * fps) }));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {beats.map((beat, i) => {
        const c = cuts[i];
        const dur = i === beats.length - 1 ? durationInFrames - c.from : c.dur;
        const sc = beat.scene;
        if (!sc) return null;
        return (
          <Sequence key={beat.id} from={c.from} durationInFrames={dur + (i < beats.length - 1 ? 8 : 0)} name={`C${beat.id}`}>
            <TransitionIn kind={i === 0 ? "cut" : sc.transition}>
              <SceneCamera dur={dur} punch={sc.punch} hits={[
                ...sc.props.flatMap((p) => {
                  const at = Math.round((p.at ?? 0) * c.speech);
                  if (p.anim === "drop") return [at + 6];
                  if (p.anim === "stamp") return [at];
                  if (p.anim === "yank") return [at + 3];
                  if (p.anim === "slideL" || p.anim === "slideR" || p.anim === "rollIn") return [at + 8];
                  return [];
                }),
                ...(sc.fx ?? []).flatMap((fx) => ("at" in fx && fx.at !== undefined && (fx.type === "sparks" || fx.type === "cross" || fx.type === "circle") ? [Math.round(fx.at * c.speech)] : [])),
              ]}>
              <Background name={sc.bg} />
              {sc.tint && <AbsoluteFill style={{ background: sc.tint, mixBlendMode: "multiply", opacity: 0.85 }} />}
              {(sc.fx ?? []).map((fx, k) => fx.type === "strip" ? <Strip key={`s${k}`} y={fx.y} h={fx.h} color={fx.color} img={fx.img} rot={fx.rot} /> : null)}
              {sc.word && <BigWord text={sc.word.text} y={sc.word.y ?? 560} color={sc.word.color ?? "#F6EFE6"} at={Math.round((sc.word.at ?? 0) * c.speech)} />}
              {(sc.fx ?? []).map((fx, k) => {
                const at = "at" in fx && fx.at !== undefined ? Math.round(fx.at * c.speech) : 0;
                if (fx.type === "sunburst") return <Sunburst key={k} x={fx.x} y={fx.y} r={fx.r} color={fx.color ?? "#F5C518"} at={at} />;
                if (fx.type === "spotlight")
                  return <AbsoluteFill key={k} style={{ background: `radial-gradient(circle at ${fx.x}px ${fx.y}px, rgba(255,240,200,0.35) 0, rgba(255,240,200,0.12) ${fx.r}px, rgba(0,0,0,0.6) ${fx.r * 1.6}px)`, zIndex: 0 }} />;
                if (fx.type === "doors") return <Doors key={k} x={fx.x} y={fx.y} w={fx.w} open={fx.open} at={at} until={fx.until !== undefined ? Math.round(fx.until * c.speech) : at + 20} />;
                return null;
              })}
              {sc.props.map((p, k) => <PropLayer key={k} p={p} speech={c.speech} dur={dur} index={k} />)}
              {(sc.fx ?? []).map((fx, k) => {
                const at = "at" in fx && fx.at !== undefined ? Math.round(fx.at * c.speech) : 0;
                if (fx.type === "circle") return <MarkerCircle key={k} x={fx.x} y={fx.y} r={fx.r} at={at} color={fx.color ?? "#FFD21F"} />;
                if (fx.type === "sparks") return <Sparks key={k} x={fx.x} y={fx.y} at={at} />;
                if (fx.type === "cross") return <Cross key={k} x={fx.x} y={fx.y} r={fx.r} at={at} />;
                if (fx.type === "plane") return <Plane key={k} x={fx.x} y={fx.y} at={at} />;
                if (fx.type === "birds") return <Birds key={k} y={fx.y} count={fx.count ?? 5} at={at} />;
                if (fx.type === "counter") return <Counter key={k} x={fx.x} y={fx.y} from={fx.from} to={fx.to} at={at} until={Math.round(fx.until * c.speech)} label={fx.label} decimals={fx.decimals ?? 1} />;
                if (fx.type === "question") return <Question key={k} x={fx.x} y={fx.y} at={at} />;
                if (fx.type === "write") return <Write key={k} text={fx.text} x={fx.x} y={fx.y} size={fx.size} at={at} color={fx.color ?? "#E5352B"} rot={fx.rot ?? -6} />;
                return null;
              })}
              </SceneCamera>
            </TransitionIn>
            <Subtitle text={beat.narration} bold={sc.bold} speech={c.speech} dur={dur} />
          </Sequence>
        );
      })}
      {cuts.slice(1).map((c, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, c.from - 3)} durationInFrames={15}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.25} />
        </Sequence>
      ))}
      <Audio src={staticFile(vo ?? "audio/vo.wav")} volume={1} />
      <Audio src={staticFile("sfx/music.wav")} volume={0.1} loop />
      {/* cohesive grade + grain */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(14,110,115,0.10), rgba(255,200,120,0.06))", mixBlendMode: "soft-light", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
