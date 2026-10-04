// Flat paper-cutout woman using a wheelchair, side view facing right, head turned to camera, smiling.
// Same construction language as <Host/>: flat fills, round caps, charcoal ink, no outlines.
import React from "react";
import { theme } from "../../theme";

const c = theme.colors;
const SKIN = "#A86B45";
const HAIR = "#2A1D14";

export const WheelchairRider: React.FC<{
  height?: number;
  wheelRot?: number; // degrees
  armAngle?: number; // 0 = hand on push-rim, -150 = waving up
  headTilt?: number;
}> = ({ height = 380, wheelRot = 0, armAngle = -18, headTilt = 0 }) => {
  const w = (height * 300) / 340;
  const casterRot = wheelRot * (80 / 18);
  const spokes = Array.from({ length: 8 }).map((_, i) => (i * 180) / 8);
  return (
    <svg width={w} height={height} viewBox="0 0 300 340" style={{ overflow: "visible" }}>
      {/* push handle + back rest */}
      <path d="M100 205 L84 98 L62 94" stroke={c.inkSoft} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* frame to caster */}
      <path d="M150 205 L238 236 L250 300" stroke={c.inkSoft} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* caster */}
      <g transform={`rotate(${casterRot} 250 312)`}>
        <circle cx={250} cy={312} r={18} fill={c.ink} />
        <circle cx={250} cy={312} r={6} fill={c.paperDark} />
        <rect x={248} y={296} width={4} height={10} fill={c.paperDark} />
      </g>
      {/* hair (behind head) */}
      <circle cx={118} cy={46} r={30} fill={HAIR} />
      <circle cx={140} cy={28} r={30} fill={HAIR} />
      <circle cx={112} cy={74} r={24} fill={HAIR} />
      {/* torso: striped top */}
      <path d="M104 186 Q100 128 114 100 Q140 90 164 102 Q174 140 170 190 Z" fill={c.white} />
      {[118, 136, 154, 172].map((y) => (
        <rect key={y} x={104} y={y} width={68} height={7} fill={c.ink} opacity={0.85} />
      ))}
      {/* seat */}
      <rect x={92} y={192} width={124} height={14} rx={6} fill={c.inkSoft} />
      {/* thigh + shin + shoe */}
      <rect x={112} y={170} width={110} height={34} rx={17} fill={c.ink} />
      <rect x={196} y={182} width={30} height={104} rx={15} fill={c.ink} transform="rotate(-12 211 186)" />
      <ellipse cx={242} cy={290} rx={24} ry={11} fill={c.inkSoft} />
      {/* foot plate */}
      <rect x={220} y={298} width={44} height={8} rx={3} fill={c.inkSoft} />
      {/* big wheel */}
      <g transform={`rotate(${wheelRot} 130 250)`}>
        <circle cx={130} cy={250} r={80} fill="none" stroke={c.ink} strokeWidth={16} />
        <circle cx={130} cy={250} r={64} fill="none" stroke={c.inkSoft} strokeWidth={5} />
        {spokes.map((a) => (
          <line
            key={a}
            x1={130 + Math.cos((a * Math.PI) / 180) * 72}
            y1={250 + Math.sin((a * Math.PI) / 180) * 72}
            x2={130 - Math.cos((a * Math.PI) / 180) * 72}
            y2={250 - Math.sin((a * Math.PI) / 180) * 72}
            stroke={c.inkSoft}
            strokeWidth={3}
          />
        ))}
        <circle cx={130} cy={250} r={12} fill={c.ink} />
        <circle cx={130} cy={250} r={4} fill={c.paperDark} />
        {/* tread marker so rotation reads */}
        <rect x={124} y={166} width={12} height={8} rx={2} fill={c.paperDark} />
      </g>
      {/* neck + head */}
      <rect x={130} y={80} width={20} height={26} rx={8} fill={SKIN} />
      <g transform={`rotate(${headTilt} 140 90)`}>
        <circle cx={142} cy={58} r={36} fill={SKIN} />
        {/* hair fringe */}
        <path d="M106 52 Q110 18 146 20 Q176 24 176 50 Q160 34 140 38 Q122 36 106 52 Z" fill={HAIR} />
        {/* happy closed eyes */}
        <path d="M124 58 Q131 50 138 58" stroke={c.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M150 58 Q157 50 164 58" stroke={c.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* big smile */}
        <path d="M128 70 Q144 90 160 70 Z" fill={c.ink} />
        <path d="M134 73 Q144 80 154 73" stroke={c.white} strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* cheeks */}
        <circle cx={122} cy={70} r={6} fill="#C9805A" opacity={0.7} />
        <circle cx={166} cy={70} r={6} fill="#C9805A" opacity={0.7} />
        {/* earring */}
        <circle cx={108} cy={74} r={4} fill={c.brass} />
      </g>
      {/* arm (sleeve + forearm), pivots at the shoulder */}
      <g transform={`rotate(${armAngle} 142 112)`}>
        <rect x={128} y={100} width={28} height={58} rx={14} fill={c.white} />
        <rect x={130} y={150} width={24} height={72} rx={12} fill={SKIN} />
        <circle cx={142} cy={226} r={15} fill={SKIN} />
      </g>
    </svg>
  );
};
