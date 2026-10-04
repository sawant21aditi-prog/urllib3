import { useSceneFrame as useCurrentFrame } from "../../time";
import { useStretch } from "../../time";
// Animator C shared props (S09–S12): pill, firefighter, key, keyswitch, label, sfx helper.
import React from "react";
import { Audio, Sequence, staticFile, random } from "remotion";
import { theme } from "../../theme";

const c = theme.colors;
const TAN = "#B89A6A";
const TAN_DARK = "#97794C";
const SKIN = "#E9B98F";

/** One-shot SFX placed at a scene-local frame. */
export const Sfx: React.FC<{ at: number; name: string; volume?: number }> = ({ at, name, volume = 0.45 }) => (
  <Sequence from={Math.max(0, Math.round(at * useStretch()))} durationInFrames={45} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** Two-tone capsule. `split` px pulls the halves apart; `symbol` prints the ▶|◀ on it. */
export const Pill: React.FC<{ width?: number; split?: number; symbol?: boolean }> = ({ width = 760, split = 0, symbol = true }) => {
  const h = (width * 180) / 400;
  const s = (split * 400) / width; // viewBox units
  return (
    <svg width={width} height={h} viewBox="0 0 400 180" style={{ overflow: "visible" }}>
      <g transform={`translate(${-s} 0)`}>
        <path d="M 204 10 L 90 10 A 80 80 0 0 0 90 170 L 204 170 Z" fill={c.hero} stroke={c.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 60 40 Q 80 24 130 24" stroke="#fff" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.55} />
        {symbol && (
          <g fill={c.ink}>
            <polygon points="118,58 178,90 118,122" />
            <rect x={192} y={52} width={14} height={76} rx={3} />
          </g>
        )}
      </g>
      <g transform={`translate(${s} 0)`}>
        <path d="M 200 10 L 310 10 A 80 80 0 0 1 310 170 L 200 170 Z" fill="#FBF6EC" stroke={c.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 330 36 A 56 56 0 0 1 362 80" stroke="#fff" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.8} />
        {symbol && <polygon points="282,58 222,90 282,122" fill={c.ink} />}
      </g>
    </svg>
  );
};

/** Pharmacy label sticker. */
export const RxLabel: React.FC = () => (
  <div
    style={{
      width: 380,
      padding: "14px 22px 16px",
      background: c.white,
      border: `5px solid ${c.ink}`,
      fontFamily: theme.fonts.body,
      color: c.ink,
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", gap: 16, borderBottom: `4px solid ${c.ink}`, paddingBottom: 6 }}>
      <span style={{ fontFamily: theme.fonts.display, fontSize: 54, lineHeight: 1 }}>Rx</span>
      <span style={{ fontFamily: theme.fonts.display, fontSize: 70, lineHeight: 1, letterSpacing: "0.04em" }}>PLACEBO</span>
    </div>
    <div style={{ fontWeight: 800, fontSize: 21, marginTop: 8, letterSpacing: "0.04em" }}>ACTIVE INGREDIENT: NONE</div>
    <div style={{ fontWeight: 800, fontSize: 21, letterSpacing: "0.04em", color: c.inkSoft }}>PRESS AS NEEDED</div>
  </div>
);

/** Flat firefighter: red helmet with brass shield, tan turnout coat with reflective stripes.
 *  armUp 0..1 raises the right arm holding a brass key. */
export const Firefighter: React.FC<{ height?: number; armUp?: number; glint?: number }> = ({ height = 780, armUp = 0, glint = 0 }) => {
  const w = (height * 260) / 420;
  const arm = -150 * armUp;
  return (
    <svg width={w} height={height} viewBox="0 0 260 420" style={{ overflow: "visible" }}>
      {/* legs + boots */}
      <rect x={86} y={290} width={38} height={104} rx={8} fill={TAN_DARK} />
      <rect x={136} y={290} width={38} height={104} rx={8} fill={TAN_DARK} />
      <rect x={86} y={350} width={38} height={10} fill={c.hero} />
      <rect x={136} y={350} width={38} height={10} fill={c.hero} />
      <rect x={78} y={386} width={50} height={26} rx={8} fill={c.ink} />
      <rect x={132} y={386} width={50} height={26} rx={8} fill={c.ink} />
      {/* left arm */}
      <rect x={42} y={150} width={36} height={130} rx={16} fill={TAN} />
      <rect x={42} y={238} width={36} height={12} fill={c.hero} />
      <circle cx={60} cy={286} r={17} fill={c.ink} />
      {/* coat */}
      <path d="M68 140 Q130 118 192 140 L200 306 Q130 318 60 306 Z" fill={TAN} />
      <rect x={126} y={140} width={8} height={170} fill={TAN_DARK} />
      <rect x={64} y={262} width={134} height={14} fill={c.hero} />
      <rect x={64} y={266} width={134} height={5} fill="#F7F3E8" />
      <rect x={66} y={200} width={128} height={14} fill={c.hero} />
      <rect x={66} y={204} width={128} height={5} fill="#F7F3E8" />
      {/* collar */}
      <path d="M96 132 L130 162 L164 132 L160 120 L100 120 Z" fill={TAN_DARK} />
      {/* right arm (raises key) */}
      <g transform={`rotate(${arm} 196 156)`}>
        <rect x={182} y={150} width={36} height={130} rx={16} fill={TAN} />
        <rect x={182} y={238} width={36} height={12} fill={c.hero} />
        <circle cx={200} cy={286} r={17} fill={c.ink} />
        {/* key in glove */}
        <g transform="translate(200 300) rotate(90)">
          <rect x={-4} y={-6} width={52} height={12} rx={3} fill={c.brass} stroke={c.brassDark} strokeWidth={2} />
          <rect x={30} y={4} width={8} height={10} fill={c.brass} />
          <rect x={40} y={4} width={6} height={7} fill={c.brass} />
        </g>
        {glint > 0 && (
          <g transform={`translate(200 352) scale(${glint})`} opacity={glint}>
            <path d="M0 -30 L6 -6 L30 0 L6 6 L0 30 L-6 6 L-30 0 L-6 -6 Z" fill="#fff" />
          </g>
        )}
      </g>
      {/* head */}
      <circle cx={130} cy={92} r={42} fill={SKIN} />
      <path d="M104 112 Q130 126 156 112 L152 104 Q130 112 108 104 Z" fill="#5B3A22" />
      <circle cx={116} cy={92} r={4.5} fill={c.ink} />
      <circle cx={144} cy={92} r={4.5} fill={c.ink} />
      <path d="M106 80 L124 82 M154 80 L136 82" stroke={c.ink} strokeWidth={4} strokeLinecap="round" />
      {/* helmet */}
      <path d="M70 74 Q72 20 130 18 Q188 20 190 74 Z" fill={c.fire} />
      <path d="M52 76 Q130 60 214 80 L208 88 Q130 74 58 86 Z" fill={c.fire} />
      <path d="M52 76 Q130 60 214 80" stroke="#A8281D" strokeWidth={4} fill="none" />
      <path d="M130 20 L130 70" stroke="#A8281D" strokeWidth={5} />
      {/* shield */}
      <path d="M112 34 L148 34 L152 56 L130 72 L108 56 Z" fill={c.brass} stroke={c.brassDark} strokeWidth={3} />
      <text x={130} y={58} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={20} fill={c.ink}>
        1
      </text>
    </svg>
  );
};

/** Red fire-service keyswitch plate (front view). turn: 0 (OFF) → 1 (ON). Key drawn separately. */
export const KeySwitch: React.FC<{ size?: number; turn?: number; on?: number }> = ({ size = 320, turn = 0, on = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
    <rect x={4} y={4} width={192} height={192} rx={18} fill={c.fire} />
    <rect x={14} y={14} width={172} height={172} rx={12} fill="none" stroke="#A8281D" strokeWidth={4} />
    <text x={100} y={40} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={18} letterSpacing={1.5} fill={c.white}>
      FIRE SERVICE
    </text>
    <text x={100} y={74} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={16} fill={c.white} opacity={1 - on * 0.5}>
      OFF
    </text>
    <text x={150} y={118} textAnchor="middle" fontFamily={theme.fonts.display} fontSize={16} fill={on > 0.5 ? c.hero : c.white}>
      ON
    </text>
    <circle cx={100} cy={112} r={30} fill={c.brassDark} />
    <circle cx={100} cy={112} r={25} fill={c.brass} />
    <g transform={`rotate(${turn * 90} 100 112)`}>
      {/* slot */}
      <rect x={97} y={94} width={6} height={36} rx={2} fill={c.ink} transform="rotate(90 100 112)" />
      {/* pointer notch towards label */}
      <circle cx={100} cy={91} r={3} fill={c.white} />
    </g>
  </svg>
);

/** Brass key, blade pointing left, tip at (0,0) of its own box. Length in px. */
export const BrassKey: React.FC<{ length?: number }> = ({ length = 300 }) => {
  const h = (length * 110) / 300;
  return (
    <svg width={length} height={h} viewBox="0 0 300 110" style={{ overflow: "visible", display: "block" }}>
      <path d="M0 47 L150 47 L150 63 L40 63 L36 72 L28 63 L20 72 L12 63 L0 63 Z" fill={c.brass} stroke={c.brassDark} strokeWidth={3} strokeLinejoin="round" />
      <rect x={140} y={40} width={28} height={30} rx={4} fill={c.brass} stroke={c.brassDark} strokeWidth={3} />
      <circle cx={222} cy={55} r={54} fill={c.brass} stroke={c.brassDark} strokeWidth={4} />
      <circle cx={240} cy={55} r={14} fill={c.brassDark} />
      <path d="M190 22 Q210 10 236 14" stroke="#fff" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.5} />
    </svg>
  );
};

/** Floating dust motes inside a light beam. */
export const DustMotes: React.FC<{ cx: number; cy: number; w: number; h: number; count?: number; opacity?: number }> = ({
  cx,
  cy,
  w,
  h,
  count = 26,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const bx = (random(`dx${i}`) - 0.5) * w;
        const by = (random(`dy${i}`) - 0.5) * h;
        const sp = 0.4 + random(`ds${i}`) * 0.9;
        const y = ((by - frame * sp + h * 10) % h) - h / 2;
        const x = bx + Math.sin(frame / (14 + i) + i) * 14;
        const r = 2 + random(`dr${i}`) * 4;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / 9 + i * 1.7));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + x,
              top: cy + y,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: "#FFF6D6",
              opacity: tw * opacity * 0.8,
              transform: "translate(-50%,-50%)",
            }}
          />
        );
      })}
    </>
  );
};

/** 4-point sparkle. */
export const Sparkle: React.FC<{ x: number; y: number; s: number; color?: string }> = ({ x, y, s, color = c.white }) =>
  s <= 0 ? null : (
    <svg
      width={120}
      height={120}
      viewBox="-60 -60 120 120"
      style={{ position: "absolute", left: x - 60, top: y - 60, transform: `scale(${s}) rotate(${s * 45}deg)`, opacity: Math.min(1, s * 1.5) }}
    >
      <path d="M0 -55 L9 -9 L55 0 L9 9 L0 55 L-9 9 L-55 0 L-9 -9 Z" fill={color} />
    </svg>
  );
