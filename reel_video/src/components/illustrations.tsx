// Shared SVG illustrations so every scene draws the SAME button, doors and host.
// All are flat paper-cutout style — wrap in <Cutout> for the white sticker border.
import React from "react";
import { theme } from "../theme";

const c = theme.colors;

/** The star of the film: round brass close-door button (▶|◀). */
export const CloseButton: React.FC<{
  size?: number;
  pressed?: number; // 0..1 how far pushed in
  glow?: number; // 0..1 yellow light-up
  triColor?: string; // triangle color override (e.g. red flicker)
}> = ({ size = 420, pressed = 0, glow = 0, triColor }) => {
  const inset = pressed * 0.06;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      {glow > 0 && <circle cx={100} cy={100} r={98 + glow * 30} fill={c.hero} opacity={0.35 * glow} />}
      {/* bezel */}
      <circle cx={100} cy={100} r={96} fill={c.brassDark} />
      <circle cx={100} cy={100} r={88} fill={c.brass} />
      {/* cap */}
      <g transform={`translate(100 100) scale(${1 - inset}) translate(-100 -100)`}>
        <circle cx={100} cy={100 + pressed * 3} r={72} fill={glow > 0.5 ? c.hero : "#E2C978"} />
        <circle cx={100} cy={100 + pressed * 3} r={72} fill="none" stroke={c.brassDark} strokeWidth={4} />
        <ellipse cx={82} cy={74} rx={30} ry={14} fill="#fff" opacity={0.35 * (1 - pressed)} transform="rotate(-25 82 74)" />
        {/* ▶|◀ symbol */}
        <g fill={triColor ?? c.ink} transform={`translate(0 ${pressed * 3})`}>
          <polygon points="52,72 92,100 52,128" />
          <rect x={96} y={70} width={8} height={60} rx={2} />
          <polygon points="148,72 108,100 148,128" />
        </g>
      </g>
    </svg>
  );
};

/** Elevator doors in a frame. open: 0 closed → 1 fully open. */
export const ElevatorDoors: React.FC<{ width?: number; height?: number; open?: number; inside?: string }> = ({
  width = 620,
  height = 820,
  open = 0,
  inside = c.hero,
}) => {
  const half = 150;
  const shift = open * (half - 8);
  return (
    <svg width={width} height={height} viewBox="0 0 320 420">
      <rect x={0} y={0} width={320} height={420} rx={6} fill={c.inkSoft} />
      <rect x={10} y={30} width={300} height={390} fill={inside} />
      {/* light spill from inside */}
      <rect x={10} y={30} width={300} height={390} fill="#fff" opacity={0.18 * open} />
      <g>
        <rect x={10 - shift} y={30} width={half} height={390} fill={c.ink} />
        <rect x={160 + shift} y={30} width={half} height={390} fill={c.ink} />
        <line x1={160 - shift} y1={30} x2={160 - shift} y2={420} stroke={c.inkSoft} strokeWidth={2} />
        <line x1={160 + shift} y1={30} x2={160 + shift} y2={420} stroke={c.inkSoft} strokeWidth={2} />
      </g>
      {/* floor indicator */}
      <rect x={120} y={6} width={80} height={18} rx={4} fill={c.ink} />
      <circle cx={160} cy={15} r={5} fill={c.hero} />
    </svg>
  );
};

/** Host character: cartoon person in a mustard hoodie with round glasses.
 *  armAngle rotates the right forearm (degrees) so scenes can animate jabbing / watch-checking. */
export const Host: React.FC<{
  height?: number;
  armAngle?: number;
  leftArmAngle?: number;
  mood?: "annoyed" | "neutral" | "shock" | "laugh";
}> = ({ height = 760, armAngle = 0, leftArmAngle = 0, mood = "annoyed" }) => {
  const w = (height * 240) / 400;
  const mouth =
    mood === "annoyed" ? <path d="M108 98 Q120 92 132 98" stroke={c.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
    : mood === "shock" ? <ellipse cx={120} cy={100} rx={9} ry={12} fill={c.ink} />
    : mood === "laugh" ? <path d="M104 94 Q120 116 136 94 Z" fill={c.ink} />
    : <line x1={110} y1={98} x2={130} y2={98} stroke={c.ink} strokeWidth={4} strokeLinecap="round" />;
  return (
    <svg width={w} height={height} viewBox="0 0 240 400" style={{ overflow: "visible" }}>
      {/* legs */}
      <rect x={88} y={270} width={26} height={110} rx={10} fill={c.ink} />
      <rect x={126} y={270} width={26} height={110} rx={10} fill={c.ink} />
      <ellipse cx={98} cy={384} rx={22} ry={10} fill={c.inkSoft} />
      <ellipse cx={142} cy={384} rx={22} ry={10} fill={c.inkSoft} />
      {/* left arm */}
      <g transform={`rotate(${leftArmAngle} 72 160)`}>
        <rect x={56} y={150} width={30} height={110} rx={15} fill={c.hero} />
        <circle cx={71} cy={262} r={14} fill="#E9B98F" />
      </g>
      {/* hoodie body */}
      <path d="M70 150 Q120 128 170 150 L178 285 Q120 298 62 285 Z" fill={c.hero} />
      <path d="M96 210 L144 210 L148 250 L92 250 Z" fill="#E0B414" />
      <line x1={112} y1={150} x2={108} y2={190} stroke={c.ink} strokeWidth={3} />
      <line x1={128} y1={150} x2={132} y2={190} stroke={c.ink} strokeWidth={3} />
      {/* right arm (animated) */}
      <g transform={`rotate(${armAngle} 168 160)`}>
        <rect x={154} y={150} width={30} height={110} rx={15} fill={c.hero} />
        <circle cx={169} cy={262} r={14} fill="#E9B98F" />
        <rect x={160} y={232} width={20} height={9} rx={3} fill={c.ink} />
      </g>
      {/* head */}
      <circle cx={120} cy={84} r={50} fill="#E9B98F" />
      <path d="M70 80 Q72 28 122 30 Q172 30 170 78 Q160 52 140 56 Q126 40 104 54 Q84 50 70 80 Z" fill="#5B3A22" />
      {/* glasses */}
      <circle cx={102} cy={84} r={15} fill="#fff" opacity={0.5} stroke={c.ink} strokeWidth={4} />
      <circle cx={140} cy={84} r={15} fill="#fff" opacity={0.5} stroke={c.ink} strokeWidth={4} />
      <line x1={117} y1={84} x2={125} y2={84} stroke={c.ink} strokeWidth={4} />
      <circle cx={102} cy={86} r={4} fill={c.ink} />
      <circle cx={140} cy={86} r={4} fill={c.ink} />
      {mood === "annoyed" && (
        <>
          <line x1={90} y1={64} x2={112} y2={70} stroke={c.ink} strokeWidth={4} strokeLinecap="round" />
          <line x1={152} y1={64} x2={130} y2={70} stroke={c.ink} strokeWidth={4} strokeLinecap="round" />
        </>
      )}
      <g transform="translate(0 14)">{mouth}</g>
    </svg>
  );
};

/** Pointing hand entering from the bottom edge; fingertip at the top-center of the svg. */
export const PointingHand: React.FC<{ width?: number; skin?: string; sleeve?: string }> = ({
  width = 260,
  skin = "#E9B98F",
  sleeve = c.hero,
}) => (
  <svg width={width} height={width * 2} viewBox="0 0 120 240">
    <rect x={30} y={150} width={66} height={100} rx={10} fill={sleeve} />
    <rect x={30} y={146} width={66} height={14} rx={4} fill="#E0B414" />
    <rect x={34} y={78} width={58} height={76} rx={22} fill={skin} />
    <rect x={44} y={6} width={22} height={90} rx={11} fill={skin} />
    <path d="M46 30 Q55 24 64 30" stroke="#C99671" strokeWidth={2} fill="none" />
    <rect x={64} y={70} width={20} height={30} rx={10} fill="#DDA97E" />
  </svg>
);
