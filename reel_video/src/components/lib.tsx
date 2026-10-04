import { useSceneFrame as useCurrentFrame } from "../time";
// Shared motion + collage building blocks. Every scene composes from these.
import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig, random } from "remotion";
import { theme } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export { clamp };

/* ---------- Background / finishing layers ---------- */

export const PaperBg: React.FC<{ color?: string }> = ({ color = theme.colors.paper }) => {
  const frame = useCurrentFrame();
  const d = Math.sin(frame / 60) * 30;
  return (
    <AbsoluteFill style={{ background: color }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${50 + d / 10}% 35%, rgba(255,255,255,0.55), transparent 60%),
                       radial-gradient(ellipse at 20% 90%, ${theme.colors.paperDark}, transparent 55%)`,
        }}
      />
      {/* paper fibres */}
      <AbsoluteFill
        style={{
          opacity: 0.18,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012 0.09' numOctaves='3'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23f)' opacity='0.6'/%3E%3C/svg%3E")`,
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};

export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: "#ffffff", mixBlendMode: "soft-light", opacity: 0.08 }} />
    <AbsoluteFill
      style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.12), transparent 25%, transparent 75%, rgba(0,0,0,0.18))" }}
    />
  </AbsoluteFill>
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: noise,
        backgroundSize: "220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity: 0.07,
        mixBlendMode: "multiply",
      }}
    />
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.28) 100%)" }}
  />
);

/* ---------- Collage primitives ---------- */

/** Halftone dot field. Use as accent fill or shadow. */
export const Halftone: React.FC<{
  color?: string;
  size?: number;
  opacity?: number;
  style?: React.CSSProperties;
  drift?: boolean;
}> = ({ color = theme.colors.ink, size = 18, opacity = 0.35, style, drift = true }) => {
  const frame = useCurrentFrame();
  const o = drift ? (frame * 0.4) % size : 0;
  return (
    <div
      style={{
        position: "absolute",
        backgroundImage: `radial-gradient(${color} 28%, transparent 30%)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${o}px ${o}px`,
        opacity,
        ...style,
      }}
    />
  );
};

/** White sticker border + hard drop shadow around ANY child (SVG/div/img). */
export const Cutout: React.FC<{
  children: React.ReactNode;
  border?: number;
  shadow?: number;
  style?: React.CSSProperties;
}> = ({ children, border = 7, shadow = 14, style }) => {
  const b = border;
  const w = theme.colors.white;
  return (
    <div
      style={{
        filter: `drop-shadow(${b}px 0 0 ${w}) drop-shadow(-${b}px 0 0 ${w}) drop-shadow(0 ${b}px 0 ${w}) drop-shadow(0 -${b}px 0 ${w}) drop-shadow(${shadow * 0.6}px ${shadow}px 0 rgba(30,29,27,0.28))`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Washi tape strip. */
export const Tape: React.FC<{ x: number; y: number; rot?: number; w?: number; color?: string }> = ({
  x,
  y,
  rot = -8,
  w = 170,
  color,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: 46,
      background: color ?? `${theme.pop[Math.abs(Math.round(x * 7 + y * 13)) % theme.pop.length]}B3`,
      transform: `translate(-50%, -50%) rotate(${rot}deg)`,
      clipPath: "polygon(2% 0, 98% 4%, 100% 50%, 97% 100%, 3% 96%, 0 50%)",
      boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    }}
  />
);

/* ---------- Motion helpers ---------- */

/** 0→1 spring progress starting at `delay` frames. */
export const useSpring = (delay = 0, config: keyof typeof theme.spring = "smooth") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: theme.spring[config] });
};

/** Camera shake offsets for impact moments. Decays over `len` frames. */
export const useShake = (start: number, intensity = 18, len = 12) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > len) return { x: 0, y: 0, r: 0 };
  const decay = 1 - t / len;
  return {
    x: (random(`sx${start}-${t}`) * 2 - 1) * intensity * decay,
    y: (random(`sy${start}-${t}`) * 2 - 1) * intensity * decay,
    r: (random(`sr${start}-${t}`) * 2 - 1) * 2 * decay,
  };
};

/** Premium entrance: opacity + rise + scale, spring driven. */
export const Entrance: React.FC<{
  delay?: number;
  from?: "up" | "down" | "left" | "right" | "scale";
  dist?: number;
  config?: keyof typeof theme.spring;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, from = "up", dist = 60, config = "smooth", children, style }) => {
  const p = useSpring(delay, config);
  const d = interpolate(p, [0, 1], [dist, 0]);
  const tr =
    from === "up" ? `translateY(${d}px)` : from === "down" ? `translateY(${-d}px)` : from === "left" ? `translateX(${-d * 3}px)` : from === "right" ? `translateX(${d * 3}px)` : "";
  return (
    <div style={{ opacity: Math.min(1, p * 1.4), transform: `${tr} scale(${interpolate(p, [0, 1], [from === "scale" ? 0.3 : 0.94, 1])})`, ...style }}>
      {children}
    </div>
  );
};

/** Slam in from oversized + rotation — for hero objects. */
export const Slam: React.FC<{ delay?: number; children: React.ReactNode; rot?: number; style?: React.CSSProperties }> = ({
  delay = 0,
  children,
  rot = -6,
  style,
}) => {
  const p = useSpring(delay, "slam");
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.15], [0, 1], clamp),
        transform: `scale(${interpolate(p, [0, 1], [2.2, 1])}) rotate(${interpolate(p, [0, 1], [rot, 0])}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Faster exit for the last frames of a scene. Wrap scene content. */
export const SceneExit: React.FC<{ durationInFrames: number; children: React.ReactNode; len?: number }> = ({
  durationInFrames,
  children,
  len = 8,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [durationInFrames - len, durationInFrames], [0, 1], { ...clamp, easing: theme.ease.in });
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + p * 0.12})`, opacity: 1 - p * 0.35, filter: `blur(${p * 6}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/** Slow 2D camera push (Ken-Burns for vector scenes). */
export const Camera: React.FC<{
  durationInFrames: number;
  from?: number;
  to?: number;
  panX?: number;
  panY?: number;
  children: React.ReactNode;
}> = ({ durationInFrames, from = 1, to = 1.08, panX = 0, panY = 0, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], { ...clamp, easing: theme.ease.inOut });
  return (
    <AbsoluteFill style={{ transform: `scale(${from + (to - from) * p}) translate(${panX * p}px, ${panY * p}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/** SVG path draw-on progress → strokeDashoffset helper. */
export const drawOn = (progress: number, length: number) => ({
  strokeDasharray: length,
  strokeDashoffset: length * (1 - Math.max(0, Math.min(1, progress))),
});

/** Burst of paper confetti / sparks radiating from a point. */
export const Burst: React.FC<{ x: number; y: number; delay?: number; count?: number; color?: string; radius?: number }> = ({
  x,
  y,
  delay = 0,
  count = 14,
  color = theme.colors.hero,
  radius = 260,
}) => {
  const frame = useCurrentFrame();
  const t = frame - delay;
  if (t < 0 || t > 24) return null;
  const p = interpolate(t, [0, 24], [0, 1], { ...clamp, easing: theme.ease.out });
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + random(`ba${i}${delay}`) * 0.4;
        const r = radius * p * (0.7 + random(`br${i}${delay}`) * 0.5);
        const s = 22 * (1 - p) + 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * r,
              top: y + Math.sin(a) * r,
              width: s,
              height: s * 0.5,
              background: i % 3 === 0 ? theme.colors.ink : i % 3 === 1 ? color : theme.pop[i % theme.pop.length],
              transform: `translate(-50%,-50%) rotate(${a + p * 6}rad)`,
              borderRadius: 3,
            }}
          />
        );
      })}
    </>
  );
};
