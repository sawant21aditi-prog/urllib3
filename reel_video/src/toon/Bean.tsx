// "Gus" and friends: an original, code-drawn bean character with exaggerated cartoon expressions.
// Every expression is parametric (eyes, brows, mouth, extras), so the character stays identical in every scene.
import React from "react";

export type Expr =
  | "neutral" | "happy" | "smug" | "shock" | "panic" | "cry" | "rage" | "dead" | "deadpan" | "sparkle" | "nervous" | "evil";
export type Pose = "idle" | "armsUp" | "point" | "facepalm" | "hold" | "shrug";

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
};

const INK = "#1d1b20";

export const Bean: React.FC<{
  color: string; expr: Expr; pose?: Pose; size: number; frame: number; hat?: "cap" | "bow" | "tie" | "glasses" | "none"; talking?: boolean;
}> = ({ color, expr, pose = "idle", size, frame, hat = "none", talking }) => {
  const blink = expr !== "dead" && expr !== "shock" && frame % 96 < 4;
  const mouthOpen = talking ? 0.35 + 0.65 * Math.abs(Math.sin(frame / 2.2)) : 0;
  const tremble = expr === "panic" || expr === "rage" || expr === "nervous" ? Math.sin(frame * 2.1) * 2.2 : 0;
  const body = color, dark = shade(color, 0.7);

  // eyes
  const eye = (cx: number, side: 1 | -1) => {
    if (blink && expr !== "sparkle") return <path d={`M${cx - 14} 112 Q${cx} 118 ${cx + 14} 112`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    switch (expr) {
      case "dead": return <g stroke={INK} strokeWidth={7} strokeLinecap="round"><path d={`M${cx - 12} 100 L${cx + 12} 124`} /><path d={`M${cx + 12} 100 L${cx - 12} 124`} /></g>;
      case "shock": return <><circle cx={cx} cy={110} r={22} fill="#fff" stroke={INK} strokeWidth={5} /><circle cx={cx} cy={110} r={4} fill={INK} /></>;
      case "panic": return <><circle cx={cx} cy={110} r={20} fill="#fff" stroke={INK} strokeWidth={5} /><circle cx={cx + Math.sin(frame) * 4} cy={110} r={6} fill={INK} /></>;
      case "deadpan": return <><path d={`M${cx - 18} 104 L${cx + 18} 104`} stroke={INK} strokeWidth={6} strokeLinecap="round" /><ellipse cx={cx} cy={113} rx={9} ry={7} fill={INK} /></>;
      case "smug": return <><path d={`M${cx - 18} 106 L${cx + 18} 106`} stroke={INK} strokeWidth={6} strokeLinecap="round" /><path d={`M${cx - 14} 106 Q${cx} 124 ${cx + 14} 106`} fill={INK} /></>;
      case "happy": return <path d={`M${cx - 16} 116 Q${cx} 96 ${cx + 16} 116`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
      case "cry": return <><path d={`M${cx - 16} 112 Q${cx} 100 ${cx + 16} 112`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" /></>;
      case "sparkle": return <><ellipse cx={cx} cy={110} rx={17} ry={21} fill={INK} /><circle cx={cx - 5} cy={102} r={7} fill="#fff" /><circle cx={cx + 6} cy={117} r={3.5} fill="#fff" /><path d={`M${cx + 7} 96 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z`} fill="#fff" /></>;
      case "rage": return <><ellipse cx={cx} cy={112} rx={11} ry={13} fill={INK} /></>;
      case "evil": return <><ellipse cx={cx} cy={113} rx={12} ry={9} fill="#E5352B" /><ellipse cx={cx} cy={113} rx={3} ry={8} fill={INK} /></>;
      case "nervous": return <><ellipse cx={cx + side * -3} cy={111} rx={10} ry={13} fill={INK} /><circle cx={cx - 3} cy={106} r={3.5} fill="#fff" /></>;
      default: return <><ellipse cx={cx} cy={111} rx={10} ry={14} fill={INK} /><circle cx={cx - 3} cy={105} r={3.5} fill="#fff" /></>;
    }
  };
  // brows
  const brows: Record<string, string> = {
    rage: "M58 82 L92 96 M162 82 L128 96", evil: "M58 80 L92 96 M162 80 L128 96", smug: "M60 90 L92 86 M160 82 L128 90",
    nervous: "M60 88 L92 80 M160 88 L128 80", cry: "M60 92 L92 82 M160 92 L128 82", panic: "M60 80 L92 72 M160 80 L128 72",
    shock: "M58 70 Q75 60 92 70 M162 70 Q145 60 128 70", deadpan: "M60 88 L92 88 M160 88 L128 88",
  };
  // mouth
  const mouth = () => {
    if (talking && !["dead", "shock", "panic"].includes(expr)) return <ellipse cx={110} cy={152} rx={16} ry={4 + mouthOpen * 14} fill={INK} />;
    switch (expr) {
      case "happy": case "sparkle": return <path d="M86 144 Q110 176 134 144 Z" fill={INK} />;
      case "smug": case "evil": return <path d="M88 150 Q118 166 136 142" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
      case "shock": return <ellipse cx={110} cy={160} rx={18} ry={26} fill={INK} />;
      case "panic": return <path d="M84 168 Q90 140 110 142 Q130 140 136 168 Z" fill={INK} />;
      case "cry": return <path d="M84 164 Q110 136 136 164" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />;
      case "rage": return <><rect x={82} y={144} width={56} height={24} rx={6} fill="#fff" stroke={INK} strokeWidth={6} /><path d="M96 144 V168 M110 144 V168 M124 144 V168" stroke={INK} strokeWidth={4} /></>;
      case "dead": return <path d="M90 156 L130 156" stroke={INK} strokeWidth={7} strokeLinecap="round" />;
      case "nervous": return <path d="M86 154 l8 -6 8 6 8 -6 8 6 8 -6 8 6" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      case "deadpan": return <path d="M94 154 L126 154" stroke={INK} strokeWidth={7} strokeLinecap="round" />;
      default: return <path d="M94 150 Q110 160 126 150" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
    }
  };
  // arms (behind/in front of body)
  const sw = Math.sin(frame / 6) * 4;
  const arm = (d: string) => <path d={d} stroke={dark} strokeWidth={20} fill="none" strokeLinecap="round" />;
  const arms: Record<Pose, React.ReactNode> = {
    idle: <>{arm(`M42 190 Q22 ${226 + sw} 30 250`)}{arm(`M178 190 Q198 ${226 - sw} 190 250`)}</>,
    armsUp: <>{arm(`M44 170 Q8 ${120 + sw * 3} ${18 + sw} 64`)}{arm(`M176 170 Q212 ${120 - sw * 3} ${202 - sw} 64`)}</>,
    point: <>{arm(`M42 190 Q22 226 30 250`)}{arm(`M176 176 Q220 160 262 150`)}</>,
    facepalm: <>{arm(`M42 190 Q22 226 30 250`)}{arm(`M178 200 Q160 140 132 112`)}<ellipse cx={128} cy={108} rx={26} ry={20} fill={dark} /></>,
    hold: <>{arm(`M44 196 Q70 220 96 214`)}{arm(`M176 196 Q150 220 124 214`)}</>,
    shrug: <>{arm(`M44 186 Q10 180 14 ${146 + sw}`)}{arm(`M176 186 Q210 180 206 ${146 - sw}`)}</>,
  };
  const hats: Record<string, React.ReactNode> = {
    cap: <><path d="M44 66 Q110 6 176 66 Z" fill="#E5352B" /><path d="M150 62 Q196 60 214 74 L160 74 Z" fill="#B3241C" /></>,
    bow: <path d="M110 34 L78 16 L80 52 Z M110 34 L142 16 L140 52 Z" fill="#FF5C8A" stroke={INK} strokeWidth={4} />,
    tie: <path d="M110 214 L98 226 L110 270 L122 226 Z" fill="#3D5AFE" stroke={INK} strokeWidth={4} />,
    glasses: <g stroke={INK} strokeWidth={5} fill="rgba(255,255,255,0.25)"><circle cx={80} cy={110} r={26} /><circle cx={140} cy={110} r={26} /><path d="M106 110 H114" /></g>,
    none: null,
  };
  return (
    <svg width={size} height={size * 1.3} viewBox="-30 -10 280 300" style={{ overflow: "visible", transform: `translateX(${tremble}px)` }}>
      <ellipse cx={110} cy={282} rx={70} ry={10} fill="rgba(0,0,0,0.25)" />
      {pose !== "facepalm" && arms[pose]}
      <path d="M110 30 C178 30 196 92 194 160 C192 236 160 276 110 276 C60 276 28 236 26 160 C24 92 42 30 110 30 Z" fill={body} stroke={INK} strokeWidth={7} />
      <ellipse cx={74} cy={74} rx={20} ry={12} fill="rgba(255,255,255,0.35)" transform="rotate(-30 74 74)" />
      {(expr === "shock" || expr === "dead") ? null : <><ellipse cx={58} cy={140} rx={13} ry={8} fill="#FF8FA8" opacity={0.6} /><ellipse cx={162} cy={140} rx={13} ry={8} fill="#FF8FA8" opacity={0.6} /></>}
      {eye(80, -1)}{eye(140, 1)}
      {brows[expr] && <path d={brows[expr]} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />}
      {mouth()}
      {expr === "cry" && (
        <g fill="#7FD3FF" opacity={0.95}>
          {[0, 1, 2].map((k) => {
            const y = ((frame * 9 + k * 40) % 120);
            return <React.Fragment key={k}><rect x={66} y={118 + y * 0.6} width={18} height={30} rx={9} /><rect x={136} y={118 + y * 0.6} width={18} height={30} rx={9} /></React.Fragment>;
          })}
        </g>
      )}
      {hats[hat]}
      {pose === "facepalm" && arms.facepalm}
    </svg>
  );
};
