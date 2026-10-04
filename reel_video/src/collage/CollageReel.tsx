// "Living collage" Reel, modelled on the user's two reference videos:
//  - full-screen textured photo background per scene (changes every beat)
//  - real-photo cutout props (public/elements/*.png, transparent) each animated on its own
//  - everything stepped at ~12fps (stop-motion feel); hand-made 2D FX (sunburst, marker circle, sparks)
//  - element-driven transitions (torn-paper wipe, slide-up, zoom-through) instead of plain cuts
//  - quiet subtitles: one line on a small white rounded tag near the bottom, key word bold
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import script from "../data/script.json";
import timing from "../data/timing.json";
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
  noEnter?: boolean; // press/jab hand already in frame (used on beat 1 so the loop from the last beat is seamless)
};
type Fx =
  | { type: "sunburst"; x: number; y: number; r: number; color?: string; at?: number }
  | { type: "circle"; x: number; y: number; r: number; at: number; color?: string }
  | { type: "sparks"; x: number; y: number; at: number }
  | { type: "question"; x: number; y: number; at: number }
  | { type: "doors"; x: number; y: number; w: number; open: [number, number]; at?: number; until?: number }
  | { type: "spotlight"; x: number; y: number; r: number }
  | { type: "flicker" };
type Scene = { bg: string; props: Prop[]; fx?: Fx[]; transition?: "cut" | "torn" | "slideUp" | "zoom"; bold?: string };
type CBeat = { id: number; narration: string; scene?: Scene };

/* ---------------- props ---------------- */
const PropLayer: React.FC<{ p: Prop; speech: number; dur: number }> = ({ p, speech, dur }) => {
  const f = step(useCurrentFrame());
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
  return (
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
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, zIndex: 5, overflow: "visible" }}>
      <path d={`M${pts.join(" L")}`} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </svg>
  );
};

const Sparks: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const f = step(useCurrentFrame());
  const t = f - at;
  if (t < 0 || t > 14) return null;
  const p = t / 14;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, zIndex: 6 }}>
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

/** Elevator doors element split into two halves that slide apart. */
const Doors: React.FC<{ x: number; y: number; w: number; open: [number, number]; at: number; until: number }> = ({ x, y, w, open, at, until }) => {
  const f = step(useCurrentFrame());
  const o = interpolate(f, [at, until], open, { ...clamp, easing: ease.inOut });
  const half = (side: "L" | "R") => (
    <div style={{ position: "absolute", inset: 0, clipPath: side === "L" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)", transform: `translateX(${(side === "L" ? -1 : 1) * o * w * 0.42}px)` }}>
      {has("doors") ? <Img src={staticFile("elements/doors.png")} style={{ width: "100%", display: "block" }} /> : <div style={{ width: "100%", height: w * 1.3, background: "#9aa", border: "4px solid #333" }} />}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.65, width: w, height: w * 1.3, zIndex: 1, filter: "drop-shadow(0 18px 18px rgba(0,0,0,0.35))" }}>
      <div style={{ position: "absolute", inset: "6% 8%", background: "linear-gradient(#fff6d8, #e8d9a8)" }} />
      {half("L")}
      {half("R")}
    </div>
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
  const f = step(useCurrentFrame());
  const p = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: ease.out });
  if (!kind || kind === "cut" || p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  if (kind === "torn") return <AbsoluteFill style={{ clipPath: tornEdge(p), filter: "drop-shadow(0 -10px 0 #f4eee0)" }}>{children}</AbsoluteFill>;
  if (kind === "slideUp") return <AbsoluteFill style={{ transform: `translateY(${(1 - p) * 1920}px)` }}>{children}</AbsoluteFill>;
  return <AbsoluteFill style={{ transform: `scale(${0.75 + 0.25 * p})`, opacity: p, filter: `blur(${(1 - p) * 12}px)` }}>{children}</AbsoluteFill>;
};

/* ---------------- quiet subtitles ---------------- */
const Subtitle: React.FC<{ text: string; bold?: string; speech: number }> = ({ text, bold, speech }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; ) {
    const n = words.length - i <= 5 ? words.length - i : 4;
    chunks.push(words.slice(i, i + n).join(" "));
    i += n;
  }
  let acc = 0;
  const spans = chunks.map((c) => { const s = (acc / text.length) * speech; acc += c.length + 1; return { c, s }; });
  const idx = spans.reduce((k, sp, i) => (f >= sp.s ? i : k), -1);
  if (idx < 0) return null;
  const norm = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const b = (bold ?? "").split(" ").map(norm);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1420, display: "flex", justifyContent: "center", zIndex: 20 }}>
      <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "10px 22px", boxShadow: "0 6px 16px rgba(0,0,0,0.25)", maxWidth: 900 }}>
        <span style={{ fontFamily: theme.fonts.body, fontSize: 44, fontWeight: 800, color: "#1E2A2C" }}>
          {spans[idx].c.split(" ").map((w, i) => (
            <span key={i} style={{ fontWeight: b.includes(norm(w)) ? 900 : 600, color: b.includes(norm(w)) ? "#0E6E73" : "#1E2A2C" }}>{w} </span>
          ))}
        </span>
      </div>
    </div>
  );
};

/* ---------------- composition ---------------- */
export const CollageReel: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const beats = script.beats as unknown as CBeat[];
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
              <Background name={sc.bg} />
              {(sc.fx ?? []).map((fx, k) => {
                const at = "at" in fx && fx.at !== undefined ? Math.round(fx.at * c.speech) : 0;
                if (fx.type === "sunburst") return <Sunburst key={k} x={fx.x} y={fx.y} r={fx.r} color={fx.color ?? "#F5C518"} at={at} />;
                if (fx.type === "spotlight")
                  return <AbsoluteFill key={k} style={{ background: `radial-gradient(circle at ${fx.x}px ${fx.y}px, rgba(255,240,200,0.35) 0, rgba(255,240,200,0.12) ${fx.r}px, rgba(0,0,0,0.6) ${fx.r * 1.6}px)`, zIndex: 0 }} />;
                if (fx.type === "doors") return <Doors key={k} x={fx.x} y={fx.y} w={fx.w} open={fx.open} at={at} until={fx.until !== undefined ? Math.round(fx.until * c.speech) : at + 20} />;
                return null;
              })}
              {sc.props.map((p, k) => <PropLayer key={k} p={p} speech={c.speech} dur={dur} />)}
              {(sc.fx ?? []).map((fx, k) => {
                const at = "at" in fx && fx.at !== undefined ? Math.round(fx.at * c.speech) : 0;
                if (fx.type === "circle") return <MarkerCircle key={k} x={fx.x} y={fx.y} r={fx.r} at={at} color={fx.color ?? "#E5352B"} />;
                if (fx.type === "sparks") return <Sparks key={k} x={fx.x} y={fx.y} at={at} />;
                if (fx.type === "question") return <Question key={k} x={fx.x} y={fx.y} at={at} />;
                return null;
              })}
            </TransitionIn>
            <Subtitle text={beat.narration} bold={sc.bold} speech={c.speech} />
          </Sequence>
        );
      })}
      {cuts.slice(1).map((c, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, c.from - 3)} durationInFrames={15}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.25} />
        </Sequence>
      ))}
      <Audio src={staticFile("audio/vo.wav")} volume={1} />
      <Audio src={staticFile("sfx/music.wav")} volume={0.1} />
      {/* cohesive grade + grain */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(14,110,115,0.10), rgba(255,200,120,0.06))", mixBlendMode: "soft-light", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
