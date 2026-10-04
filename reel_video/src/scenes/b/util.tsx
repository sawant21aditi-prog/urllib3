import { useSceneFrame as useCurrentFrame } from "../../time";
import { useStretch } from "../../time";
// Animator B helpers (S05–S08). Local to these scenes only.
import React from "react";
import { Audio, Sequence, interpolate, staticFile, random } from "remotion";
import { theme } from "../../theme";
import { clamp, useSpring } from "../../components/lib";

const c = theme.colors;

export type SfxName = "whoosh" | "pop" | "click" | "tick" | "bass" | "ding" | "glitch" | "riser";

/** One-shot SFX at a scene-local frame. */
export const Sfx: React.FC<{ at: number; name: SfxName; volume?: number }> = ({ at, name, volume = 0.45 }) => (
  <Sequence from={Math.max(0, Math.round(at * useStretch()))} durationInFrames={45} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** Rubber ink stamp that slams down (oversized → 1, overshoot), with rough ink edges. */
export const InkStamp: React.FC<{
  text: string;
  delay: number;
  x: number;
  y: number;
  rot?: number;
  size?: number;
  color?: string;
  bg?: string;
}> = ({ text, delay, x, y, rot = -12, size = 96, color = c.ink, bg = "transparent" }) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, "slam");
  if (frame < delay) return null;
  const scale = interpolate(p, [0, 1], [2.6, 1]);
  const op = interpolate(frame - delay, [0, 2], [0, 1], clamp);
  const r = size * 0.14;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`,
        opacity: op * 0.94,
      }}
    >
      {bg !== "transparent" && <div style={{ position: "absolute", inset: 0, background: bg, borderRadius: r, opacity: 0.9 }} />}
      <div
        style={{
          position: "relative",
          border: `${Math.round(size * 0.09)}px solid ${color}`,
          borderRadius: r,
          padding: `${size * 0.04}px ${size * 0.26}px ${size * 0.02}px`,
          fontFamily: theme.fonts.display,
          fontSize: size,
          lineHeight: 1.1,
          letterSpacing: "0.06em",
          color,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Comic motion/impact lines radiating from a point, jittered stop-motion style (changes every `step` frames). */
export const ImpactLines: React.FC<{ x: number; y: number; count?: number; r0?: number; r1?: number; step?: number; seed?: string; width?: number; spread?: number; dir?: number }> = ({
  x,
  y,
  count = 5,
  r0 = 60,
  r1 = 130,
  step = 2,
  seed = "il",
  width = 9,
  spread = Math.PI * 0.9,
  dir = Math.PI,
}) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / step);
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      {Array.from({ length: count }).map((_, i) => {
        const a = dir - spread / 2 + (spread * (i + 0.5)) / count + (random(`${seed}a${i}${k}`) - 0.5) * 0.25;
        const j = random(`${seed}r${i}${k}`) * 20;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * (r0 + j)}
            y1={y + Math.sin(a) * (r0 + j)}
            x2={x + Math.cos(a) * (r1 + j)}
            y2={y + Math.sin(a) * (r1 + j)}
            stroke={c.ink}
            strokeWidth={width}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

/** White-out flash for N frames starting at `at`. */
export const Flash: React.FC<{ at: number; len?: number; opacity?: number }> = ({ at, len = 2, opacity = 0.9 }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= at + len + 2) return null;
  const o = frame < at + len ? opacity : interpolate(frame, [at + len, at + len + 2], [opacity * 0.5, 0], clamp);
  return <div style={{ position: "absolute", inset: -200, background: c.white, opacity: o }} />;
};
