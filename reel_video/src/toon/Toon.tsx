// Storytime cartoon (16:9): a deadpan first-person narrator over a chaotic, code-drawn cartoon.
// Each beat = one narration line + a scene (background preset, characters with expressions/poses, effects, camera).
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Bean, Expr, Pose } from "./Bean";
import { clamp } from "../components/lib";
import "../fonts";

const INK = "#1d1b20";
const FONT = "Montserrat";

type CastMember = { color: string; hat?: "cap" | "bow" | "tie" | "glasses" | "none" };
type Char = { who: string; x: number; y?: number; size?: number; expr: Expr; pose?: Pose; flip?: boolean; enter?: "slide" | "drop" | "pop"; talk?: boolean; exprAt?: [number, Expr][] };
type Fx =
  | { type: "speedlines"; at?: number; color?: string }
  | { type: "flash"; at: number }
  | { type: "shake"; at: number; power?: number }
  | { type: "sfx"; text: string; x: number; y: number; at: number; color?: string; size?: number; rot?: number }
  | { type: "vein" | "sweat" | "sparkles" | "soul" | "aura"; who: string; at?: number; color?: string }
  | { type: "freeze"; at: number; text: string }
  | { type: "bubble"; who: string; text: string; at: number; until?: number; shout?: boolean }
  | { type: "label"; who: string; text: string; at?: number }
  | { type: "rain"; at?: number }
  | { type: "spotlight"; who: string; at?: number };
type Scene = { bg: string; chars: Char[]; fx?: Fx[]; cam?: "push" | "punch" | "still" | "whip"; zoomOn?: string; zoomAt?: number; bold?: string };
type Beat = { id: number; narration: string; scene: Scene; sound?: { name: string; at?: number }[] };
export type ToonData = { title: string; cast: Record<string, CastMember>; beats: Beat[] };
type Timing = { total: number; beats: { start: number; speech: number; duration: number }[] };

/* ---------------- backgrounds (flat, colourful, code-drawn) ---------------- */
const BG: React.FC<{ name: string; f: number }> = ({ name, f }) => {
  const P: Record<string, [string, string]> = {
    store: ["#FFE7A8", "#F2B66D"], street: ["#9ED8FF", "#7C7F8A"], bedroom: ["#C9B6FF", "#8C6FD6"], office: ["#BFEFE3", "#7AB8A6"],
    kitchen: ["#FFD1C2", "#E8907A"], red: ["#FF4B4B", "#9E1B1B"], void: ["#2B2350", "#120E26"], gold: ["#FFD84A", "#FF9F1C"], blue: ["#5EC8FF", "#2A6FDB"],
  };
  const [wall, floor] = P[name] ?? P.void;
  const intense = ["red", "void", "gold", "blue"].includes(name);
  return (
    <AbsoluteFill style={{ background: intense ? `radial-gradient(circle at 50% 55%, ${wall}, ${floor})` : wall }}>
      {intense && (
        <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.22 }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2 + f / 120;
            return <path key={i} d={`M960 600 L${960 + Math.cos(a) * 2200} ${600 + Math.sin(a) * 2200} L${960 + Math.cos(a + 0.12) * 2200} ${600 + Math.sin(a + 0.12) * 2200} Z`} fill="#fff" />;
          })}
        </svg>
      )}
      {!intense && <div style={{ position: "absolute", left: 0, right: 0, top: 760, bottom: 0, background: floor, borderTop: `8px solid ${INK}` }} />}
      {name === "store" && <>
        {[0, 1, 2].map((r) => <div key={r} style={{ position: "absolute", left: 120, width: 520, top: 200 + r * 150, height: 18, background: "#C9822E", border: `5px solid ${INK}` }} />)}
        {[0, 1, 2].map((r) => Array.from({ length: 6 }).map((_, k) => <div key={`${r}${k}`} style={{ position: "absolute", left: 140 + k * 82, top: 130 + r * 150, width: 60, height: 70, borderRadius: 8, background: ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D"][(r + k) % 4], border: `5px solid ${INK}` }} />))}
        <div style={{ position: "absolute", left: 1180, top: 600, width: 620, height: 200, background: "#F7F2E8", border: `7px solid ${INK}`, borderRadius: 12 }} />
        <div style={{ position: "absolute", left: 1300, top: 560, width: 120, height: 60, background: "#4a4a55", border: `6px solid ${INK}`, borderRadius: 8 }} />
      </>}
      {name === "street" && <>
        {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{ position: "absolute", left: k * 400 - 40, top: 220 + (k % 2) * 90, width: 330, height: 560, background: ["#F4A261", "#E76F51", "#2A9D8F", "#E9C46A", "#8AB17D"][k], border: `7px solid ${INK}` }} />)}
      </>}
      {name === "bedroom" && <>
        <div style={{ position: "absolute", left: 140, top: 160, width: 300, height: 260, background: "#1E2A55", border: `8px solid ${INK}` }}><div style={{ position: "absolute", left: 190, top: 40, width: 60, height: 60, borderRadius: 30, background: "#FFF3B0" }} /></div>
        <div style={{ position: "absolute", left: 1250, top: 600, width: 560, height: 190, background: "#FF8FAB", border: `7px solid ${INK}`, borderRadius: 20 }} />
      </>}
      {name === "office" && <>
        <div style={{ position: "absolute", left: 1100, top: 590, width: 700, height: 40, background: "#B07B4F", border: `6px solid ${INK}` }} />
        <div style={{ position: "absolute", left: 1350, top: 400, width: 260, height: 180, background: "#2b2b33", border: `7px solid ${INK}`, borderRadius: 10 }} />
      </>}
      {name === "kitchen" && <>
        {Array.from({ length: 8 }).map((_, k) => <div key={k} style={{ position: "absolute", left: k * 250, top: 120, width: 220, height: 200, background: "#FFF6EE", border: `6px solid ${INK}`, borderRadius: 10 }} />)}
      </>}
    </AbsoluteFill>
  );
};

/* ---------------- effects ---------------- */
const SpeedLines: React.FC<{ f: number; color: string }> = ({ f, color }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, zIndex: 1 }}>
    {Array.from({ length: 60 }).map((_, i) => {
      const a = random(`sl${i}${Math.floor(f / 2)}`) * Math.PI * 2;
      const r0 = 380 + random(`sr${i}${Math.floor(f / 2)}`) * 260;
      return <path key={i} d={`M${960 + Math.cos(a) * r0} ${540 + Math.sin(a) * r0} L${960 + Math.cos(a - 0.02) * 1400} ${540 + Math.sin(a - 0.02) * 1400} L${960 + Math.cos(a + 0.02) * 1400} ${540 + Math.sin(a + 0.02) * 1400} Z`} fill={color} />;
    })}
  </svg>
);

const SfxText: React.FC<{ text: string; x: number; y: number; t: number; color: string; size: number; rot: number }> = ({ text, x, y, t, color, size, rot }) => {
  if (t < 0) return null;
  const s = interpolate(t, [0, 3, 6], [2.4, 0.9, 1], clamp) * (1 + Math.sin(t / 3) * 0.03);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, zIndex: 30,
      fontFamily: "Anton", fontSize: size, color, letterSpacing: "0.02em", WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke fill", textShadow: `10px 10px 0 ${INK}` }}>
      {text}
    </div>
  );
};

const Bubble: React.FC<{ x: number; y: number; text: string; t: number; shout?: boolean }> = ({ x, y, text, t, shout }) => {
  if (t < 0) return null;
  const s = interpolate(t, [0, 3, 5], [0.3, 1.1, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-100%) scale(${s})`, transformOrigin: "50% 100%", zIndex: 25,
      background: "#fff", border: `7px solid ${INK}`, borderRadius: shout ? 8 : 40, padding: "18px 30px", maxWidth: 620,
      fontFamily: FONT, fontWeight: 900, fontSize: shout ? 54 : 42, color: INK, textAlign: "center", lineHeight: 1.15, boxShadow: `8px 8px 0 ${INK}` }}>
      {text}
      <div style={{ position: "absolute", left: "50%", bottom: -34, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `34px solid ${INK}`, transform: "translateX(-50%)" }} />
    </div>
  );
};

/* ---------------- one beat ---------------- */
const BeatScene: React.FC<{ beat: Beat; cast: Record<string, CastMember>; speech: number; dur: number }> = ({ beat, cast, speech, dur }) => {
  const f = useCurrentFrame();
  const sc = beat.scene;
  const at = (v?: number) => Math.round((v ?? 0) * speech);
  const pos = Object.fromEntries(sc.chars.map((c) => [c.who, c]));
  const fx = sc.fx ?? [];

  // camera
  let scale = sc.cam === "still" ? 1 : interpolate(f, [0, dur], [1, 1.06], clamp);
  if (sc.cam === "punch") scale *= interpolate(f, [0, 3, 8], [1.5, 1.12, 1], clamp);
  let ox = 960, oy = 600;
  if (sc.zoomOn && pos[sc.zoomOn]) {
    const z = interpolate(f - at(sc.zoomAt), [0, 3], [0, 1], clamp);
    scale *= 1 + z * 0.3;
    ox = pos[sc.zoomOn].x; oy = (pos[sc.zoomOn].y ?? 640) - 120;
  }
  let sx = 0, sy = 0;
  for (const e of fx) if (e.type === "shake" || e.type === "flash") {
    const t = f - at(e.at);
    if (t >= 0 && t < 12) { const k = (1 - t / 12) * ((e.type === "shake" ? e.power : 1) ?? 1); sx += (random(`x${t}${e.at}`) - 0.5) * 60 * k; sy += (random(`y${t}${e.at}`) - 0.5) * 60 * k; }
  }
  const whip = sc.cam === "whip" ? interpolate(f, [0, 6], [-1920, 0], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }) : 0;
  const freeze = fx.find((e) => e.type === "freeze") as Extract<Fx, { type: "freeze" }> | undefined;
  const frozen = freeze && f >= at(freeze.at);
  const fz = frozen ? Math.min(f, at(freeze!.at)) : f;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${sx + whip}px, ${sy}px) scale(${scale})`, transformOrigin: `${ox}px ${oy}px`, filter: frozen ? "grayscale(1) contrast(1.2)" : "none" }}>
        <BG name={sc.bg} f={fz} />
        {fx.map((e, k) => e.type === "speedlines" && fz >= at(e.at) ? <SpeedLines key={k} f={fz} color={e.color ?? "rgba(255,255,255,0.9)"} /> : null)}
        {fx.map((e, k) => {
          if (e.type !== "aura" || fz < at(e.at) || !pos[e.who]) return null;
          const c = pos[e.who];
          return <div key={k} style={{ position: "absolute", left: c.x - 230, top: (c.y ?? 640) - 420, width: 460, height: 560, zIndex: 2, borderRadius: "50% 50% 40% 40%",
            background: `radial-gradient(ellipse at 50% 60%, ${e.color ?? "#FFD84A"}cc, ${e.color ?? "#FFD84A"}00 70%)`, transform: `scaleY(${1 + Math.sin(fz / 2) * 0.06})` }} />;
        })}
        {fx.map((e, k) => {
          if (e.type !== "spotlight" || fz < at(e.at) || !pos[e.who]) return null;
          return <AbsoluteFill key={k} style={{ zIndex: 3, background: `radial-gradient(circle at ${pos[e.who].x}px ${(pos[e.who].y ?? 640) - 120}px, rgba(0,0,0,0) 230px, rgba(0,0,0,0.8) 420px)` }} />;
        })}
        {sc.chars.map((c, k) => {
          const size = c.size ?? 300;
          const t = fz;
          let x = c.x, y = c.y ?? 640, sc2 = 1;
          if (c.enter === "slide") x += interpolate(t, [0, 7], [c.x < 960 ? -900 : 900, 0], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
          if (c.enter === "drop") y += interpolate(t, [0, 6, 9, 12], [-1100, 30, -12, 0], clamp);
          if (c.enter === "pop") sc2 = interpolate(t, [0, 3, 6], [0, 1.15, 1], clamp);
          const squash = 1 + Math.sin(t / 5 + k) * 0.015;
          let expr = c.expr;
          for (const [a, e] of c.exprAt ?? []) if (t >= at(a)) expr = e;
          const talking = c.talk && t < speech;
          return (
            <div key={k} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -100%) scale(${sc2 * (c.flip ? -1 : 1)}, ${sc2 * squash})`, transformOrigin: "50% 100%", zIndex: 5 }}>
              <Bean color={cast[c.who]?.color ?? "#ccc"} hat={cast[c.who]?.hat} expr={expr} pose={c.pose} size={size} frame={t + k * 17} talking={talking} />
            </div>
          );
        })}
        {fx.map((e, k) => {
          const t = fz - at("at" in e ? e.at : 0);
          if (t < 0) return null;
          const c = "who" in e ? pos[e.who] : undefined;
          const cx = c?.x ?? 960, top = (c?.y ?? 640) - (c?.size ?? 300) * 1.25;
          switch (e.type) {
            case "vein": return <svg key={k} width={120} height={120} viewBox="-60 -60 120 120" style={{ position: "absolute", left: cx + 40, top: top + 10, zIndex: 8, transform: `scale(${1 + Math.abs(Math.sin(t / 3)) * 0.3})` }}><path d="M-30 -8 Q-8 -8 -8 -30 M30 -8 Q8 -8 8 -30 M-30 8 Q-8 8 -8 30 M30 8 Q8 8 8 30" stroke="#E5352B" strokeWidth={12} fill="none" strokeLinecap="round" /></svg>;
            case "sweat": return <svg key={k} width={60} height={90} style={{ position: "absolute", left: cx + 95, top: top + 40 + (t % 20) * 2, zIndex: 8 }}><path d="M30 4 Q54 50 30 80 Q6 50 30 4 Z" fill="#7FD3FF" stroke={INK} strokeWidth={5} /></svg>;
            case "sparkles": return <svg key={k} width={600} height={500} viewBox="-300 -250 600 500" style={{ position: "absolute", left: cx - 300, top: top - 40, zIndex: 8 }}>{Array.from({ length: 7 }).map((_, i) => { const a = i * 0.9 + t / 10; const r = 200 + Math.sin(t / 4 + i) * 30; const s = 0.6 + Math.abs(Math.sin(t / 3 + i)) * 0.7; return <path key={i} transform={`translate(${Math.cos(a) * r} ${Math.sin(a) * r * 0.7}) scale(${s})`} d="M0 -30 L8 -8 L30 0 L8 8 L0 30 L-8 8 L-30 0 L-8 -8 Z" fill="#FFE45C" stroke={INK} strokeWidth={4} />; })}</svg>;
            case "soul": return <svg key={k} width={200} height={240} style={{ position: "absolute", left: cx - 100, top: top - t * 6, opacity: Math.max(0, 1 - t / 60), zIndex: 9 }}><path d="M100 20 C150 20 170 70 165 120 C160 170 140 200 120 220 Q110 200 100 220 Q90 200 80 220 C60 200 40 170 35 120 C30 70 50 20 100 20 Z" fill="rgba(255,255,255,0.85)" stroke={INK} strokeWidth={5} /><circle cx={80} cy={95} r={8} fill={INK} /><circle cx={120} cy={95} r={8} fill={INK} /></svg>;
            case "bubble": return e.until !== undefined && fz > at(e.until) ? null : <Bubble key={k} x={cx} y={top - 10} text={e.text} t={t} shout={e.shout} />;
            case "label": return <div key={k} style={{ position: "absolute", left: cx, top: top - 70, transform: "translateX(-50%)", zIndex: 12, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#fff", WebkitTextStroke: `8px ${INK}`, paintOrder: "stroke fill" }}>{e.text} ↓</div>;
            case "rain": return <svg key={k} width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, zIndex: 11 }}>{Array.from({ length: 90 }).map((_, i) => { const x0 = random(`rx${i}`) * 2000; const y0 = (random(`ry${i}`) * 1080 + t * 40) % 1180 - 100; return <line key={i} x1={x0} y1={y0} x2={x0 - 18} y2={y0 + 60} stroke="rgba(160,190,255,0.75)" strokeWidth={5} />; })}</svg>;
            default: return null;
          }
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${sx * 0.5}px, ${sy * 0.5}px)` }}>
        {fx.map((e, k) => e.type === "sfx" ? <SfxText key={k} text={e.text} x={e.x} y={Math.max(e.y, 200)} t={fz - at(e.at)} color={e.color ?? "#FFD84A"} size={e.size ?? 170} rot={e.rot ?? -8} /> : null)}
      </AbsoluteFill>
      {fx.map((e, k) => {
        if (e.type !== "flash") return null;
        const t = f - at(e.at);
        return t >= 0 && t < 5 ? <AbsoluteFill key={k} style={{ background: "#fff", opacity: 1 - t / 5, zIndex: 40 }} /> : null;
      })}
      {frozen && (
        <div style={{ position: "absolute", left: 80, top: 80, zIndex: 41, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#fff", background: INK, padding: "14px 30px", transform: "rotate(-2deg)" }}>
          {freeze!.text}
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- captions ---------------- */
const Caption: React.FC<{ text: string; bold?: string; speech: number; dur: number }> = ({ text, bold, speech, dur }) => {
  const f = useCurrentFrame();
  if (f >= dur || f > speech + 6) return null;
  const words = text.split(" ");
  const per = 6;
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += per) chunks.push(words.slice(i, i + per).join(" "));
  let acc = 0;
  const spans = chunks.map((c) => { const s0 = (acc / text.length) * speech; acc += c.length + 1; return { c, s0 }; });
  const idx = spans.reduce((k, sp, i) => (f >= sp.s0 ? i : k), 0);
  const norm = (w: string) => w.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const b = (bold ?? "").split(" ").map(norm).filter(Boolean);
  return (
    <div style={{ position: "absolute", left: 120, right: 120, bottom: 70, textAlign: "center", zIndex: 50, fontFamily: FONT, fontWeight: 900, fontSize: 52, color: "#fff", WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill" }}>
      {spans[idx].c.split(" ").map((w, i) => <span key={i} style={{ color: b.includes(norm(w)) ? "#FFD84A" : "#fff" }}>{w} </span>)}
    </div>
  );
};

/* ---------------- composition ---------------- */
export const Toon: React.FC<{ data: ToonData; timing: Timing; vo: string }> = ({ data, timing, vo }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {data.beats.map((beat, i) => {
        const t = timing.beats[i];
        if (!t) return null;
        const from = Math.round(t.start * fps), dur = Math.round(t.duration * fps), speech = Math.round(t.speech * fps);
        return (
          <Sequence key={beat.id} from={from} durationInFrames={dur} name={`T${beat.id}`}>
            <BeatScene beat={beat} cast={data.cast} speech={speech} dur={dur} />
            <Caption text={beat.narration} bold={beat.scene.bold} speech={speech} dur={dur} />
            {(beat.scene.fx ?? []).map((e, k) => {
              const snd = e.type === "flash" || e.type === "shake" ? "boom" : e.type === "sfx" ? "pop" : e.type === "speedlines" ? "whoosh" : e.type === "freeze" ? "record" : e.type === "bubble" ? "ping" : e.type === "sparkles" ? "ding" : null;
              if (!snd) return null;
              return <Sequence key={k} from={Math.round(((e as { at?: number }).at ?? 0) * speech)} durationInFrames={60}><Audio src={staticFile(`sfx/chat/${snd}.wav`)} volume={snd === "boom" ? 0.55 : 0.4} /></Sequence>;
            })}
            {(beat.sound ?? []).map((s, k) => (
              <Sequence key={`s${k}`} from={Math.round((s.at ?? 0) * speech)} durationInFrames={90}><Audio src={staticFile(`sfx/chat/${s.name}.wav`)} volume={0.6} /></Sequence>
            ))}
          </Sequence>
        );
      })}
      <Audio src={staticFile(vo)} volume={1} />
      <Audio src={staticFile("sfx/chat/music_loop.wav")} volume={0.07} loop />
    </AbsoluteFill>
  );
};
