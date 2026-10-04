// Vox-style motion design over the photo-collage posters, built from the researched Vox grammar:
//  1. posters sit on a warm paper bed as physical cards (never full-bleed), drop shadow, slight tilt
//  2. graphics animate "on twos" (12fps feel) while the camera stays smooth
//  3. continuous camera: slow push inside a scene, push-through + blur peaking on every edit
//  4. yellow highlighter sweep on the key word; editorial labels = white type on dark torn paper tags
//  5. hand-drawn red callout circles/arrows draw on when the narrator names the thing
//  6. giant numbers/dates as stamped paper cards ("1990", "3 SEC")
//  7. subtle motion texture on the paper bed + lens softness at the frame edges
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import script from "../data/script.json";
import timing from "../data/timing.json";
import available from "../data/shots_available.json";
import { theme } from "../theme";
import { clamp } from "../components/lib";
import { Beat } from "../types";
import "../fonts";

const V = {
  bed: "#EFE6D2",
  ink: "#1C1B19",
  marker: "#FFD84A",
  red: "#E5352B",
  white: "#FFFFFF",
};

type VoxBeat = Beat & {
  shot?: string;
  sfx?: string;
  annot?: { x: number; y: number; r: number; at?: number; arrow?: boolean };
  big?: { text: string; at?: number; x?: number; y?: number; rot?: number };
};

/** Graphics clock "on twos": holds every other frame (Vox's 12fps stutter). */
const twos = (f: number) => Math.floor(f / 2) * 2;

// Poster card geometry on the 1080x1920 frame.
const CARD_W = 930;
const CARD_H = Math.round((CARD_W * 1920) / 1080);
const CARD_X = (1080 - CARD_W) / 2;
const CARD_Y = (1920 - CARD_H) / 2;
const toFrame = (fx: number, fy: number) => ({ x: CARD_X + fx * CARD_W, y: CARD_Y + fy * CARD_H });

/* ---------------- paper bed with motion texture ---------------- */
const PaperBed: React.FC = () => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 12); // texture swaps ~2.5x per second
  const fibres = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.015 0.11' numOctaves='3' seed='${step % 5}'/%3E%3C/filter%3E%3Crect width='600' height='600' filter='url(%23f)' opacity='0.55'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill style={{ background: V.bed }}>
      <AbsoluteFill style={{ backgroundImage: fibres, mixBlendMode: "multiply", opacity: 0.22, transform: `rotate(${(step % 3) * 90}deg) scale(1.6)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.45), transparent 65%)" }} />
    </AbsoluteFill>
  );
};

/* ---------------- the poster card + camera ---------------- */
const PosterCard: React.FC<{ file: string; dur: number; index: number; isFirst: boolean; isLast: boolean; children?: React.ReactNode }> = ({
  file,
  dur,
  index,
  isFirst,
  isLast,
  children,
}) => {
  const frame = useCurrentFrame();
  const T = 8; // transition half-length in frames
  // smooth in-scene push (camera is never stepped)
  const push = interpolate(frame, [0, dur], isLast ? [0.95, 1.0] : [1.0, 1.05], { ...clamp, easing: theme.ease.inOut });
  // push-through: incoming card rushes up from 0.88 with blur; outgoing rushes past 1.3 with blur, peaking at the edit
  const inP = isFirst ? 1 : interpolate(frame, [0, T], [0, 1], { ...clamp, easing: theme.ease.out });
  const outP = isLast ? 0 : interpolate(frame, [dur - T, dur], [0, 1], { ...clamp, easing: theme.ease.in });
  const scale = push * interpolate(inP, [0, 1], [0.88, 1]) * interpolate(outP, [0, 1], [1, 1.3]);
  const blur = (1 - inP) * 14 + outP * 18;
  const tilt = (index % 2 ? 1 : -1) * 1.2;
  const has = (available as string[]).includes(file);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      <div
        style={{
          position: "absolute",
          left: CARD_X,
          top: CARD_Y,
          width: CARD_W,
          height: CARD_H,
          transform: `rotate(${tilt}deg)`,
          boxShadow: "0 30px 60px -18px rgba(28,27,25,0.55), 0 6px 14px rgba(28,27,25,0.25)",
          background: "#ddd",
        }}
      >
        {has ? (
          <Img src={staticFile(`shots/${file}`)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "#bbb", fontFamily: theme.fonts.display, fontSize: 70 }}>
            {file}
          </AbsoluteFill>
        )}
      </div>
      {/* annotations ride with the card so they stay pinned to the photo */}
      <AbsoluteFill style={{ transform: `rotate(${tilt}deg)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- hand-drawn callout circle (+ optional arrow) ---------------- */
const Callout: React.FC<{ x: number; y: number; r: number; start: number; arrow?: boolean; seed: number }> = ({ x, y, r, start, arrow, seed }) => {
  const frame = twos(useCurrentFrame());
  const p = interpolate(frame, [start, start + 10], [0, 1], clamp);
  if (p <= 0) return null;
  const c = toFrame(x, y);
  const R = r * CARD_W;
  // imperfect ellipse that overshoots its start, like a marker loop
  const pts: string[] = [];
  const N = 48;
  for (let i = 0; i <= N * 1.12; i++) {
    const a = (i / N) * Math.PI * 2 - 2.2;
    const wob = 1 + (random(`w${seed}-${Math.floor(i / 6)}`) - 0.5) * 0.08 + (i / N) * 0.06;
    pts.push(`${(c.x + Math.cos(a) * R * 1.08 * wob).toFixed(1)},${(c.y + Math.sin(a) * R * 0.92 * wob).toFixed(1)}`);
  }
  const d = `M${pts.join(" L")}`;
  const len = 2 * Math.PI * R * 1.15;
  const ap = interpolate(frame, [start + 8, start + 16], [0, 1], clamp);
  const ax0 = c.x + R * 1.9, ay0 = c.y - R * 1.6, ax1 = c.x + R * 1.05, ay1 = c.y - R * 0.75;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={d} fill="none" stroke={V.red} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
      {arrow && ap > 0 && (
        <g stroke={V.red} strokeWidth={11} strokeLinecap="round" fill="none">
          <line x1={ax0} y1={ay0} x2={ax0 + (ax1 - ax0) * ap} y2={ay0 + (ay1 - ay0) * ap} />
          {ap > 0.95 && (
            <>
              <line x1={ax1} y1={ay1} x2={ax1 + 44} y2={ay1 - 6} />
              <line x1={ax1} y1={ay1} x2={ax1 + 4} y2={ay1 - 44} />
            </>
          )}
        </g>
      )}
    </svg>
  );
};

/* ---------------- torn dark paper tag with stepped "reverse-eaten" reveal ---------------- */
const tornClip = (seed: string, reveal: number) => {
  // jagged right edge that advances in steps
  const right = reveal * 106; // overshoot so the finished tag never clips its last letter
  const pts = ["0% 0%"];
  for (let i = 0; i <= 8; i++) pts.push(`${Math.max(0, right - random(`${seed}${i}`) * 4)}% ${(i / 8) * 100}%`);
  pts.push("0% 100%");
  return `polygon(${pts.join(", ")})`;
};

const PaperTag: React.FC<{
  text: string;
  highlight?: string;
  start: number;
  size: number;
  seed: string;
  align?: "left" | "center";
  style?: React.CSSProperties;
}> = ({ text, highlight, start, size, seed, align = "left", style }) => {
  const frame = twos(useCurrentFrame());
  const bg = interpolate(frame, [start, start + 8], [0, 1], clamp);
  const txt = interpolate(frame, [start + 4, start + 12], [0, 1], clamp);
  const words = text.split(" ");
  const norm = (s: string) => s.replace(/[^A-Z0-9+]/gi, "").toUpperCase();
  return (
    <div style={{ position: "absolute", display: "flex", justifyContent: align === "center" ? "center" : "flex-start", ...style }}>
      <div
        style={{
          position: "relative",
          background: V.ink,
          padding: `${size * 0.22}px ${size * 0.6}px ${size * 0.26}px ${size * 0.42}px`,
          clipPath: tornClip(seed, bg),
          boxShadow: "0 8px 0 rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ clipPath: tornClip(seed + "t", txt), display: "flex", flexWrap: "wrap", gap: `0 ${size * 0.28}px` }}>
          {words.map((w, i) => {
            const hi = highlight && norm(w) === norm(highlight);
            const sweep = hi ? interpolate(frame, [start + 12, start + 20], [0, 1], clamp) : 0;
            return (
              <span key={i} style={{ position: "relative", fontFamily: theme.fonts.display, fontSize: size, lineHeight: 1.1, color: hi && sweep > 0.5 ? V.ink : V.white, letterSpacing: "0.02em" }}>
                {hi && (
                  <span
                    style={{
                      position: "absolute",
                      left: -8,
                      right: -8,
                      top: "14%",
                      bottom: "6%",
                      background: V.marker,
                      transform: `scaleX(${sweep}) skewX(-8deg)`,
                      transformOrigin: "left center",
                      zIndex: -0,
                    }}
                  />
                )}
                <span style={{ position: "relative" }}>{w}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ---------------- giant stamped number / date ---------------- */
const BigStamp: React.FC<{ text: string; start: number; x: number; y: number; rot: number }> = ({ text, start, x, y, rot }) => {
  const frame = twos(useCurrentFrame());
  if (frame < start) return null;
  const t = frame - start;
  const s = t < 2 ? 1.5 : t < 4 ? 0.94 : 1; // stamp: oversize → overshoot → settle, on twos
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`,
        background: "#F7F1E3",
        padding: "10px 46px 18px",
        boxShadow: "0 18px 30px -10px rgba(0,0,0,0.45)",
        border: `6px solid ${V.ink}`,
      }}
    >
      <div style={{ fontFamily: theme.fonts.display, fontSize: 230, lineHeight: 1, color: V.ink, letterSpacing: "-0.01em" }}>{text}</div>
      <div style={{ position: "absolute", left: "8%", right: "8%", bottom: 22, height: 26, background: V.marker, opacity: 0.85, zIndex: -1 }} />
      <div style={{ position: "absolute", left: -30, top: -18, width: 150, height: 44, background: "rgba(255,92,138,0.75)", transform: "rotate(-14deg)" }} />
    </div>
  );
};

/* ---------------- narration captions: short chunks on paper tags ---------------- */
const Captions: React.FC<{ text: string; highlight: string; speechFrames: number; seed: number }> = ({ text, highlight, speechFrames, seed }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; ) {
    const n = words.length - i <= 4 ? words.length - i : 3;
    chunks.push(words.slice(i, i + n).join(" "));
    i += n;
  }
  const total = text.length;
  let acc = 0;
  const spans = chunks.map((ch) => {
    const s = (acc / total) * speechFrames;
    acc += ch.length + 1;
    return { ch, s };
  });
  const idx = spans.reduce((k, sp, i) => (frame >= sp.s ? i : k), -1);
  if (idx < 0) return null;
  const sp = spans[idx];
  return (
    <PaperTag
      key={idx}
      text={sp.ch}
      highlight={highlight}
      start={Math.round(sp.s)}
      size={54}
      seed={`c${seed}-${idx}`}
      align="center"
      style={{ left: 60, right: 60, top: 1380 }}
    />
  );
};

/* ---------------- lens: soft edges + vignette ---------------- */
const Lens: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        backdropFilter: "blur(2.5px)",
        WebkitMaskImage: "radial-gradient(ellipse at center, transparent 58%, black 100%)",
        maskImage: "radial-gradient(ellipse at center, transparent 58%, black 100%)",
      }}
    />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(40,25,10,0.28) 100%)" }} />
  </AbsoluteFill>
);

export const VoxReel: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const beats = script.beats as VoxBeat[];
  const cuts = timing.beats.map((t) => ({ from: Math.round(t.start * fps), dur: Math.round(t.duration * fps), speech: Math.round(t.speech * fps) }));
  return (
    <AbsoluteFill>
      <PaperBed />
      {beats.map((beat, i) => {
        const c = cuts[i];
        const isLast = i === beats.length - 1;
        const dur = isLast ? durationInFrames - c.from : c.dur;
        const file = beat.shot ?? (isLast ? beats[0].shot ?? "01.png" : `${String(i + 1).padStart(2, "0")}.png`);
        const a = beat.annot;
        const b = beat.big;
        return (
          <Sequence key={beat.id} from={c.from} durationInFrames={dur} name={`V${beat.id}`}>
            <PosterCard file={file} dur={dur} index={i} isFirst={i === 0} isLast={isLast}>
              {a && <Callout x={a.x} y={a.y} r={a.r} arrow={a.arrow} seed={beat.id} start={Math.round((a.at ?? 0.3) * c.speech)} />}
            </PosterCard>
            {b && <BigStamp text={b.text} start={Math.round((b.at ?? 0.45) * c.speech)} x={b.x ?? 540} y={b.y ?? 1080} rot={b.rot ?? -4} />}
            <PaperTag text={beat.caption} highlight={beat.highlight} start={i === 0 ? 0 : 4} size={76} seed={`h${beat.id}`} style={{ left: 64, top: 200, right: 64 }} />
            <Captions text={beat.narration} highlight={beat.highlight} speechFrames={c.speech} seed={beat.id} />
            {a && (
              <Sequence from={Math.max(0, Math.round((a.at ?? 0.3) * c.speech) - 2)} durationInFrames={20}>
                <Audio src={staticFile("sfx/tick.wav")} volume={0.35} />
              </Sequence>
            )}
            {b && (
              <Sequence from={Math.max(0, Math.round((b.at ?? 0.45) * c.speech) - 2)} durationInFrames={30}>
                <Audio src={staticFile("sfx/bass.wav")} volume={0.45} />
              </Sequence>
            )}
          </Sequence>
        );
      })}
      {cuts.slice(1).map((c, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, c.from - 6)} durationInFrames={18}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.28} />
        </Sequence>
      ))}
      <Audio src={staticFile("audio/vo.wav")} volume={1} />
      <Audio src={staticFile("sfx/music.wav")} volume={0.1} />
      <Lens />
    </AbsoluteFill>
  );
};
