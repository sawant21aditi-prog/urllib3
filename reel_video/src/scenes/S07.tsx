// Scene 07 — "So in many American elevators, the close button is switched off."
// Button panel slams in → flips in Y to its blueprint back → wiring draws on, current flows →
// on "off": punch-zoom, the CLOSE wire yanks out of its socket, sparks, flash, LED dies.
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { Burst, Cutout, Halftone, SceneExit, Tape, clamp, drawOn, useShake, useSpring } from "../components/lib";
import { CloseButton } from "../components/illustrations";
import { Flash, Sfx } from "./b/util";

const c = theme.colors;
const CARD_W = 640;
const CARD_H = 800;
const CARD_L = 540 - CARD_W / 2;
const CARD_T = 565;
const LABEL: React.CSSProperties = { fontFamily: theme.fonts.body, fontWeight: 900, letterSpacing: "0.14em" };

/* ---------- front: the familiar button panel ---------- */
const OpenButton: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <circle cx={100} cy={100} r={96} fill={c.brassDark} />
    <circle cx={100} cy={100} r={88} fill={c.brass} />
    <circle cx={100} cy={100} r={72} fill="#E2C978" stroke={c.brassDark} strokeWidth={4} />
    <g fill={c.ink}>
      <polygon points="92,72 52,100 92,128" />
      <rect x={96} y={70} width={8} height={60} rx={2} />
      <polygon points="108,72 148,100 108,128" />
    </g>
  </svg>
);

const Front: React.FC = () => (
  <div style={{ position: "relative", width: CARD_W, height: CARD_H, background: c.paperDark, borderRadius: 26, overflow: "hidden" }}>
    {/* brushed metal lines */}
    {Array.from({ length: 22 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: 0, top: i * 37, width: CARD_W, height: 2, background: c.white, opacity: 0.35 }} />
    ))}
    {/* floor display */}
    <div
      style={{
        position: "absolute",
        left: CARD_W / 2 - 110,
        top: 56,
        width: 220,
        height: 110,
        background: c.ink,
        borderRadius: 14,
        color: c.white,
        fontFamily: theme.fonts.display,
        fontSize: 84,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      4
    </div>
    <div style={{ position: "absolute", left: 90, top: 225 }}>
      <OpenButton size={210} />
    </div>
    <div style={{ position: "absolute", left: 340, top: 225 }}>
      <CloseButton size={210} />
    </div>
    <div style={{ ...LABEL, position: "absolute", left: 90, top: 450, width: 210, textAlign: "center", fontSize: 26, color: c.ink }}>OPEN</div>
    <div style={{ ...LABEL, position: "absolute", left: 340, top: 450, width: 210, textAlign: "center", fontSize: 26, color: c.ink }}>CLOSE</div>
    {[1, 2, 3, 4].map((n, i) => (
      <div
        key={n}
        style={{
          position: "absolute",
          left: 140 + (i % 2) * 230,
          top: 540 + Math.floor(i / 2) * 120,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: c.inkSoft,
          border: `8px solid ${c.ink}`,
          boxSizing: "border-box",
          color: c.white,
          fontFamily: theme.fonts.display,
          fontSize: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {n}
      </div>
    ))}
  </div>
);

/* ---------- back: blueprint wiring ---------- */
// back is mirrored: the CLOSE socket sits on the left
const CLOSE = { x: 195, y: 330 };
const OPEN = { x: 445, y: 330 };
const FLOORS = [
  { x: 490, y: 640 },
  { x: 150, y: 640 },
  { x: 490, y: 740 },
  { x: 150, y: 740 },
];
const CTRL = { x: 320, y: 520 }; // controller box center
const wirePaths = [
  `M ${OPEN.x} ${OPEN.y + 62} C ${OPEN.x} 440, 380 450, 380 ${CTRL.y - 40}`,
  `M ${FLOORS[0].x - 46} 640 C 400 640, 380 600, 380 ${CTRL.y + 40}`,
  `M ${FLOORS[1].x + 46} 640 C 240 640, 260 600, 260 ${CTRL.y + 40}`,
  `M ${FLOORS[2].x - 46} 740 C 380 740, 350 640, 350 ${CTRL.y + 40}`,
  `M ${FLOORS[3].x + 46} 740 C 260 740, 290 640, 290 ${CTRL.y + 40}`,
];

const Back: React.FC<{ frame: number; drawStart: number; yank: number; tYank: number }> = ({ frame, drawStart, yank, tYank }) => {
  const grid = interpolate(frame, [drawStart - 6, drawStart + 6], [0, 1], clamp);
  const wire = (i: number) => interpolate(frame, [drawStart + i * 4, drawStart + 18 + i * 4], [0, 1], { ...clamp, easing: theme.ease.out });
  const flowOn = frame > drawStart + 34;
  const flow = -frame * 6;
  // close wire endpoint: plugged at socket bottom → yanked out and dangling (spring may overshoot)
  const plug = { x: CLOSE.x, y: CLOSE.y + 62 };
  const loose = { x: 64, y: 560 };
  const ex = plug.x + (loose.x - plug.x) * yank;
  const ey = plug.y + (loose.y - plug.y) * yank;
  const swing = frame > tYank ? Math.sin((frame - tYank) / 3) * 10 * Math.max(0, 1 - (frame - tYank) / 24) : 0;
  const closePath = `M 260 ${CTRL.y - 40} C 260 ${440 - yank * 60}, ${CLOSE.x - yank * 120} ${450 - yank * 40}, ${ex + swing} ${ey}`;
  const plugAng = interpolate(yank, [0, 1], [0, -35]) + swing * 1.5;
  const closeWire = wire(5);
  const dead = frame >= tYank;
  const flicker = dead && frame < tYank + 6 ? random(`fl${frame}`) > 0.5 : false;
  const ledOn = !dead || flicker;
  const socketLabel = (txt: string, x: number, y: number, o: number) => (
    <text x={x} y={y} fill={c.white} opacity={0.85 * o} fontFamily={theme.fonts.body} fontWeight={800} fontSize={20} letterSpacing={3} textAnchor="middle">
      {txt}
    </text>
  );
  return (
    <div style={{ position: "relative", width: CARD_W, height: CARD_H, background: c.ink, borderRadius: 26, overflow: "hidden" }}>
      <svg width={CARD_W} height={CARD_H} viewBox={`0 0 ${CARD_W} ${CARD_H}`}>
        {/* blueprint grid */}
        <g opacity={grid * 0.14} stroke={c.white} strokeWidth={1.5}>
          {Array.from({ length: 17 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={CARD_H} />
          ))}
          {Array.from({ length: 21 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 40} x2={CARD_W} y2={i * 40} />
          ))}
        </g>
        <text x={36} y={64} fill={c.white} opacity={grid * 0.9} fontFamily={theme.fonts.body} fontWeight={900} fontSize={24} letterSpacing={4}>
          FIG. 07 — DOOR CIRCUIT
        </text>
        <line x1={36} y1={80} x2={36 + 330 * grid} y2={80} stroke={c.white} strokeWidth={3} />
        {/* sockets */}
        {[CLOSE, OPEN].map((s, i) => (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r={78} fill="none" stroke={c.white} strokeWidth={4} style={drawOn(wire(i), 2 * Math.PI * 78)} />
            <circle cx={s.x} cy={s.y} r={50} fill="none" stroke={c.white} strokeWidth={2} strokeDasharray="6 8" opacity={wire(i)} />
            <rect x={s.x - 14} y={s.y + 56} width={28} height={14} fill={c.white} opacity={wire(i)} />
          </g>
        ))}
        {socketLabel("DOOR CLOSE", CLOSE.x, CLOSE.y - 96, wire(0))}
        {socketLabel("DOOR OPEN", OPEN.x, OPEN.y - 96, wire(1))}
        {FLOORS.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={44} fill="none" stroke={c.white} strokeWidth={3} style={drawOn(wire(i + 1), 2 * Math.PI * 44)} />
        ))}
        {/* controller */}
        <rect
          x={CTRL.x - 90}
          y={CTRL.y - 40}
          width={180}
          height={80}
          fill="none"
          stroke={c.white}
          strokeWidth={4}
          style={drawOn(wire(0), 520)}
        />
        <text x={CTRL.x} y={CTRL.y + 8} fill={c.white} opacity={wire(1)} fontFamily={theme.fonts.body} fontWeight={900} fontSize={20} letterSpacing={3} textAnchor="middle">
          CONTROL
        </text>
        {/* wires */}
        {wirePaths.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke={c.white} strokeWidth={5} strokeLinecap="round" style={drawOn(wire(i + 1), 420)} />
            {flowOn && <path d={d} fill="none" stroke={c.paperDark} strokeWidth={9} strokeLinecap="round" strokeDasharray="2 46" strokeDashoffset={flow + i * 9} opacity={0.9} />}
          </g>
        ))}
        {/* the CLOSE wire (hero) */}
        <path d={closePath} fill="none" stroke={c.white} strokeWidth={7} strokeLinecap="round" style={drawOn(closeWire, 460)} />
        {flowOn && !dead && <path d={closePath} fill="none" stroke={c.hero} strokeWidth={11} strokeLinecap="round" strokeDasharray="2 40" strokeDashoffset={flow} />}
        {/* plug head */}
        <g transform={`translate(${ex + swing} ${ey}) rotate(${plugAng})`} opacity={closeWire > 0.95 ? 1 : 0}>
          <rect x={-16} y={-8} width={32} height={36} rx={5} fill={c.white} />
          <rect x={-10} y={-22} width={6} height={16} fill={c.white} />
          <rect x={4} y={-22} width={6} height={16} fill={c.white} />
        </g>
        {/* LED in the close socket */}
        <circle cx={CLOSE.x} cy={CLOSE.y} r={ledOn ? 34 : 26} fill={ledOn ? c.hero : c.inkSoft} opacity={wire(0)} />
        {ledOn && <circle cx={CLOSE.x} cy={CLOSE.y} r={56} fill={c.hero} opacity={0.25 * wire(0)} />}
        {dead && !flicker && (
          <g stroke={c.white} strokeWidth={6} strokeLinecap="round">
            <line x1={CLOSE.x - 14} y1={CLOSE.y - 14} x2={CLOSE.x + 14} y2={CLOSE.y + 14} />
            <line x1={CLOSE.x + 14} y1={CLOSE.y - 14} x2={CLOSE.x - 14} y2={CLOSE.y + 14} />
          </g>
        )}
      </svg>
    </div>
  );
};

export const S07: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tFlip = Math.round(0.4 * fps); // 12
  const drawStart = tFlip + 16;
  const tYank = Math.round(3.1 * fps); // 93 — the word "off"

  const enter = useSpring(0, "slam");
  const flip = useSpring(tFlip, "smooth");
  const rotY = flip * 180;
  const showBack = rotY > 90;
  // lift the card toward camera mid-flip
  const lift = Math.sin(flip * Math.PI) * 0.08;
  const yank = useSpring(tYank, "bouncy");
  const zoom = useSpring(tYank - 3, "snappy");
  const shake = useShake(tYank, 26, 14);
  const tagIn = useSpring(tYank + 8, "bouncy");
  const idle = Math.sin(frame / 14) * 1.2;

  // close-socket in screen space (back is drawn un-mirrored on screen)
  const ox = CARD_L + CLOSE.x;
  const oy = CARD_T + CLOSE.y + 60;
  const scale = 1 + zoom * 0.15;

  return (
    <AbsoluteFill>
      <Sfx at={0} name="click" volume={0.45} />
      <Sfx at={tFlip - 2} name="whoosh" volume={0.45} />
      <Sfx at={drawStart + 2} name="riser" volume={0.25} />
      <Sfx at={tYank - 3} name="bass" volume={0.6} />
      <Sfx at={tYank - 2} name="glitch" volume={0.45} />
      <SceneExit durationInFrames={durationInFrames} len={7}>
        <AbsoluteFill
          style={{
            transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.r}deg) scale(${scale})`,
            transformOrigin: `${ox}px ${oy}px`,
          }}
        >
          <Halftone
            size={22}
            opacity={0.28}
            style={{ left: CARD_L + 70, top: CARD_T + 60, width: CARD_W, height: CARD_H, opacity: 0.28 * enter }}
          />
          {/* the flipping card */}
          <div
            style={{
              position: "absolute",
              left: CARD_L,
              top: CARD_T,
              width: CARD_W,
              height: CARD_H,
              opacity: interpolate(enter, [0, 0.2], [0, 1], clamp),
              transform: `perspective(1900px) rotateY(${showBack ? rotY - 180 : rotY}deg) scale(${interpolate(enter, [0, 1], [1.35, 1]) + lift}) rotate(${interpolate(enter, [0, 1], [-8, 0]) + idle}deg)`,
            }}
          >
            <Cutout border={8} shadow={16}>
              {showBack ? <Back frame={frame} drawStart={drawStart} yank={yank} tYank={tYank} /> : <Front />}
            </Cutout>
          </div>
          {!showBack && <Tape x={CARD_L + 40} y={CARD_T + 10} rot={-32} w={150} />}
          {showBack && (
            <div
              style={{
                position: "absolute",
                left: CARD_L + CARD_W - 40,
                top: CARD_T + CARD_H - 10,
                transform: `translate(-50%,-50%) rotate(-24deg) scaleX(${interpolate(frame, [drawStart, drawStart + 8], [0, 1], { ...clamp, easing: theme.ease.out })})`,
              }}
            >
              <Tape x={0} y={0} rot={0} w={160} />
            </div>
          )}
          {/* sparks */}
          <Burst x={ox} y={oy} delay={tYank} count={16} radius={240} />
          <Burst x={ox} y={oy} delay={tYank + 2} count={10} radius={160} color={c.white} />
          {/* DISCONNECTED tag */}
          {frame >= tYank + 8 && (
            <div
              style={{
                position: "absolute",
                left: CARD_L + 330,
                top: CARD_T + 690,
                transform: `translate(-50%,-50%) rotate(${interpolate(tagIn, [0, 1], [18, -6])}deg) scale(${interpolate(tagIn, [0, 1], [0.2, 1])})`,
                opacity: interpolate(tagIn, [0, 0.25], [0, 1], clamp),
                background: c.white,
                color: c.ink,
                ...LABEL,
                fontSize: 40,
                padding: "10px 26px",
                boxShadow: `8px 10px 0 rgba(30,29,27,0.35)`,
                whiteSpace: "nowrap",
              }}
            >
              DISCONNECTED
            </div>
          )}
        </AbsoluteFill>
        <Flash at={tYank} len={2} />
      </SceneExit>
    </AbsoluteFill>
  );
};
