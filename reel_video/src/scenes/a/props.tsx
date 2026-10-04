// Animator A helpers: SFX shorthand + flat SVG props (calendar, Capitol, legal doc, pen, wax seal, stopwatch).
import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { theme } from "../../theme";
import { clamp } from "../../components/lib";

const c = theme.colors;

export type SfxName = "whoosh" | "pop" | "click" | "tick" | "bass" | "ding" | "glitch" | "riser";

/** One-shot SFX at a scene-local frame. */
export const Sfx: React.FC<{ at: number; name: SfxName; volume?: number }> = ({ at, name, volume = 0.45 }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={45} name={`sfx-${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** Eased, clamped 0→1 progress between two frames. */
export const prog = (frame: number, a: number, b: number, easing: (t: number) => number = theme.ease.out) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing });

/** Stop-motion stepping: holds each value for `step` frames. */
export const stepped = (frame: number, step = 2) => Math.floor(frame / step) * step;

/* ---------------- Calendar page ---------------- */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Desk-calendar page. 520 x 620 px. */
export const CalendarPage: React.FC<{ year: number; month?: number; width?: number }> = ({ year, month = 6, width = 520 }) => {
  const h = (width * 620) / 520;
  return (
    <svg width={width} height={h} viewBox="0 0 520 620" style={{ overflow: "visible" }}>
      <rect x={0} y={20} width={520} height={600} rx={10} fill={c.white} />
      <rect x={0} y={20} width={520} height={120} rx={10} fill={c.ink} />
      <rect x={0} y={110} width={520} height={30} fill={c.ink} />
      {/* binder rings */}
      {[90, 190, 330, 430].map((x) => (
        <g key={x}>
          <rect x={x - 9} y={0} width={18} height={52} rx={9} fill={c.inkSoft} />
          <circle cx={x} cy={46} r={7} fill={c.paperDark} />
        </g>
      ))}
      <text x={260} y={118} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={56} fill={c.paper} letterSpacing={8}>
        {MONTHS[month % 12]}
      </text>
      <text
        x={260}
        y={330}
        textAnchor="middle"
        fontFamily={theme.fonts.display}
        fontSize={190}
        fill={c.ink}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {year}
      </text>
      {/* day grid */}
      {Array.from({ length: 21 }).map((_, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        return (
          <rect
            key={i}
            x={44 + col * 64}
            y={392 + row * 64}
            width={48}
            height={48}
            rx={4}
            fill={i === 3 ? c.inkSoft : c.paperDark}
            opacity={i === 3 ? 0.9 : 1}
          />
        );
      })}
    </svg>
  );
};

/* ---------------- Capitol dome (archival photo cutout) ---------------- */

export const CapitolPhoto: React.FC<{ width?: number; draw?: number }> = ({ width = 440, draw = 1 }) => {
  const h = (width * 380) / 440;
  const d = Math.max(0, Math.min(1, draw));
  return (
    <svg width={width} height={h} viewBox="0 0 440 380">
      <rect x={0} y={0} width={440} height={380} fill={c.paperDark} />
      {/* sky band + halftone-ish dots */}
      <rect x={0} y={0} width={440} height={240} fill="#D8CCB4" />
      {Array.from({ length: 60 }).map((_, i) => (
        <circle key={i} cx={(i % 12) * 38 + 14} cy={Math.floor(i / 12) * 40 + 18} r={3.2} fill={c.inkSoft} opacity={0.22} />
      ))}
      <g opacity={d} transform={`translate(0 ${(1 - d) * 40})`}>
        {/* statue + lantern */}
        <rect x={214} y={28} width={12} height={26} fill={c.ink} />
        <rect x={204} y={54} width={32} height={30} fill={c.inkSoft} />
        {/* dome */}
        <path d="M150 170 Q150 84 220 80 Q290 84 290 170 Z" fill={c.inkSoft} />
        {[166, 188, 210, 232, 254, 274].map((x) => (
          <line key={x} x1={x} y1={170} x2={220 + (x - 220) * 0.3} y2={92} stroke={c.ink} strokeWidth={3} opacity={0.6} />
        ))}
        {/* drum with columns */}
        <rect x={136} y={170} width={168} height={52} fill={c.ink} />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={144 + i * 16} y={176} width={7} height={42} fill={c.paperDark} opacity={0.7} />
        ))}
        {/* wings */}
        <rect x={20} y={232} width={400} height={20} fill={c.inkSoft} />
        <rect x={30} y={252} width={380} height={70} fill={c.ink} />
        {Array.from({ length: 22 }).map((_, i) => (
          <rect key={i} x={40 + i * 17} y={260} width={7} height={54} fill={c.paperDark} opacity={0.55} />
        ))}
        <path d="M170 232 L220 200 L270 232 Z" fill={c.inkSoft} />
        <rect x={0} y={322} width={440} height={58} fill={c.inkSoft} />
      </g>
      {/* film scratches */}
      <line x1={92} y1={0} x2={98} y2={380} stroke={c.white} strokeWidth={1.5} opacity={0.25} />
      <line x1={350} y1={0} x2={344} y2={380} stroke={c.white} strokeWidth={1} opacity={0.3} />
      <rect x={0} y={0} width={440} height={380} fill="none" stroke={c.white} strokeWidth={18} />
    </svg>
  );
};

/* ---------------- Fountain pen ---------------- */

/** Fountain pen pointing down-left; nib tip at (0,0) of this svg's local origin offset (tipX, tipY). */
export const PEN_TIP = { x: 14, y: 286 };
export const FountainPen: React.FC<{ height?: number }> = ({ height = 300 }) => {
  const s = height / 300;
  return (
    <svg width={120 * s} height={300 * s} viewBox="0 0 120 300" style={{ overflow: "visible" }}>
      <g transform="rotate(28 14 286)">
        {/* nib */}
        <path d="M14 286 L2 238 Q14 226 26 238 Z" fill={c.brass} />
        <line x1={14} y1={284} x2={14} y2={244} stroke={c.brassDark} strokeWidth={2} />
        <circle cx={14} cy={244} r={3} fill={c.brassDark} />
        {/* grip + barrel */}
        <rect x={0} y={192} width={28} height={44} rx={6} fill={c.inkSoft} />
        <rect x={-3} y={60} width={34} height={136} rx={12} fill={c.ink} />
        <rect x={-3} y={180} width={34} height={8} fill={c.brass} />
        <rect x={-3} y={70} width={34} height={6} fill={c.brass} />
        <rect x={24} y={76} width={5} height={70} rx={2} fill={c.brass} />
        <ellipse cx={7} cy={120} rx={4} ry={40} fill={c.white} opacity={0.18} />
      </g>
    </svg>
  );
};

/* ---------------- Wax seal ---------------- */

export const WaxSeal: React.FC<{ size?: number }> = ({ size = 220 }) => {
  const blob = Array.from({ length: 18 })
    .map((_, i) => {
      const a = (i / 18) * Math.PI * 2;
      const r = 96 + (i % 2 ? 6 : -2) + Math.sin(i * 2.3) * 3;
      return `${100 + Math.cos(a) * r},${100 + Math.sin(a) * r}`;
    })
    .join(" ");
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 200 260" style={{ overflow: "visible" }}>
      {/* ribbon tails */}
      <path d="M70 150 L44 258 L66 240 L84 256 L100 160 Z" fill={c.ink} />
      <path d="M130 150 L156 258 L134 240 L116 256 L100 160 Z" fill={c.inkSoft} />
      <polygon points={blob} fill={c.brassDark} />
      <circle cx={100} cy={100} r={74} fill={c.brass} />
      <circle cx={100} cy={100} r={64} fill="none" stroke={c.brassDark} strokeWidth={4} strokeDasharray="3 6" />
      <circle cx={100} cy={100} r={50} fill="none" stroke={c.brassDark} strokeWidth={3} />
      {/* embossed star */}
      <polygon
        points={Array.from({ length: 10 })
          .map((_, i) => {
            const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
            const r = i % 2 ? 16 : 38;
            return `${100 + Math.cos(a) * r},${100 + Math.sin(a) * r}`;
          })
          .join(" ")}
        fill={c.brassDark}
      />
      <ellipse cx={74} cy={66} rx={22} ry={9} fill={c.white} opacity={0.3} transform="rotate(-35 74 66)" />
    </svg>
  );
};

/* ---------------- Stopwatch ---------------- */

export const Stopwatch: React.FC<{ size?: number; hand?: number }> = ({ size = 260, hand = 0 }) => (
  <svg width={size} height={size * 1.18} viewBox="0 0 200 236" style={{ overflow: "visible" }}>
    <rect x={86} y={0} width={28} height={22} rx={4} fill={c.inkSoft} />
    <rect x={78} y={16} width={44} height={14} rx={4} fill={c.ink} />
    <rect x={150} y={36} width={22} height={14} rx={3} fill={c.inkSoft} transform="rotate(40 161 43)" />
    <circle cx={100} cy={136} r={98} fill={c.ink} />
    <circle cx={100} cy={136} r={84} fill={c.white} />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r1 = i % 3 === 0 ? 62 : 70;
      return (
        <line
          key={i}
          x1={100 + Math.sin(a) * r1}
          y1={136 - Math.cos(a) * r1}
          x2={100 + Math.sin(a) * 78}
          y2={136 - Math.cos(a) * 78}
          stroke={c.ink}
          strokeWidth={i % 3 === 0 ? 7 : 4}
          strokeLinecap="round"
        />
      );
    })}
    {/* elapsed wedge */}
    <path
      d={(() => {
        const a = (hand * Math.PI) / 180;
        const large = hand % 360 > 180 ? 1 : 0;
        return `M100 136 L100 76 A60 60 0 ${large} 1 ${100 + Math.sin(a) * 60} ${136 - Math.cos(a) * 60} Z`;
      })()}
      fill={c.paperDark}
    />
    <g transform={`rotate(${hand} 100 136)`}>
      <line x1={100} y1={150} x2={100} y2={70} stroke={c.ink} strokeWidth={6} strokeLinecap="round" />
    </g>
    <circle cx={100} cy={136} r={9} fill={c.ink} />
  </svg>
);
