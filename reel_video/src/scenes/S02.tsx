// Scene 02 — "You jab it. The doors take their time anyway."
// Host jabs the panel button (3 clicks), swings arm to check the watch, a stopwatch spins in, doors creep open 0→15%.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { Burst, Cutout, Halftone, Tape, clamp, useShake, useSpring } from "../components/lib";
import { CloseButton, ElevatorDoors, Host } from "../components/illustrations";
import { Sfx, Stopwatch, prog, stepped } from "./a/props";

const c = theme.colors;

const DOOR = { x: 520, y: 640, w: 520, h: 682 };
const HOST = { x: 20, h: 660, bottom: 1400 };
const BTN = { x: 466, y: 1000, size: 78 };
const JABS = [6, 12, 18];
const WATCH = 26;
const CLOCK = 30;

export const S02: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // entrances (staggered)
  const doorIn = useSpring(0, "snappy");
  const hostIn = useSpring(2, "bouncy");
  const panelIn = useSpring(4, "slam");

  // jab arm: already raised, three thrusts, then swing to the wristwatch
  const jab = JABS.reduce((acc, j) => acc + interpolate(frame - j, [-3, 0, 3], [0, 1, 0], { ...clamp, easing: theme.ease.inOut }), 0);
  const raise = interpolate(frame, [0, 4], [-60, -78], { ...clamp, easing: theme.ease.out });
  const swing = useSpring(WATCH, "snappy");
  const watchWobble = frame > WATCH + 10 ? Math.sin((frame - WATCH) / 3) * 3 : 0;
  const armAngle = interpolate(swing, [0, 1], [raise - jab * 14, 72]) + watchWobble;
  const pressed = Math.min(1, jab) * (1 - swing);

  // stopwatch spins in, hand ticks in stepped jumps
  const clockIn = useSpring(CLOCK, "bouncy");
  const tickIdx = Math.max(0, Math.floor((frame - CLOCK - 4) / 8));
  const tickSnap = interpolate((frame - CLOCK - 4) % 8, [0, 2], [0, 1], { ...clamp, easing: theme.ease.out });
  const handDeg = frame < CLOCK + 4 ? 0 : (tickIdx + tickSnap) * 30;

  // doors creep open — stop-motion stepped, painfully slow
  const open = 0.15 * prog(stepped(frame, 3), 36, 80, theme.ease.inOut);

  // annoyance marks
  const vein1 = useSpring(50, "slam");
  const vein2 = useSpring(64, "slam");
  const shake = useShake(64, 8, 8);

  // camera push + breathing + fast exit
  const push = 1 + 0.06 * prog(frame, 0, durationInFrames, theme.ease.inOut);
  const breathe = Math.sin((frame / fps) * Math.PI * 1.4) * 0.01;
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [0, 1], { ...clamp, easing: theme.ease.in });

  const hostX = HOST.x;
  const hostTop = HOST.bottom - HOST.h;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shake.x - exit * 260}px, ${shake.y}px) scale(${push + exit * 0.06})`,
        opacity: 1 - exit * 0.4,
        filter: exit > 0 ? `blur(${exit * 8}px)` : undefined,
      }}
    >
      {/* halftone floor + backing block */}
      <Halftone size={18} opacity={0.25} style={{ left: 60, top: 1240, width: 980, height: 150 }} />

      {/* elevator doors whip in from the right */}
      <div
        style={{
          position: "absolute",
          left: DOOR.x,
          top: DOOR.y,
          transform: `translateX(${interpolate(doorIn, [0, 1], [700, 0])}px) skewX(${interpolate(doorIn, [0, 0.6, 1], [-14, -4, 0], clamp)}deg) rotate(${interpolate(doorIn, [0, 1], [6, 1.5])}deg)`,
          opacity: interpolate(doorIn, [0, 0.2], [0, 1], clamp),
        }}
      >
        <Cutout border={8} shadow={16}>
          <ElevatorDoors width={DOOR.w} height={DOOR.h} open={open} inside={c.paper} />
        </Cutout>
        <Tape x={DOOR.w - 20} y={18} rot={28} w={150} />
      </div>

      {/* call panel with mini close button */}
      <div
        style={{
          position: "absolute",
          left: BTN.x - 56,
          top: BTN.y - 75,
          transform: `scale(${interpolate(panelIn, [0, 1], [0.2, 1])}) rotate(${interpolate(panelIn, [0, 1], [-20, -3])}deg)`,
          opacity: interpolate(panelIn, [0, 0.2], [0, 1], clamp),
        }}
      >
        <Cutout border={6} shadow={10}>
          <div style={{ width: 112, height: 240, borderRadius: 14, background: c.inkSoft, position: "relative" }}>
            <div style={{ position: "absolute", left: 17, top: 140, width: 78, height: 78 }}>
              <svg width={78} height={78} viewBox="0 0 200 200">
                <circle cx={100} cy={100} r={92} fill={c.brassDark} />
                <circle cx={100} cy={100} r={74} fill="#E2C978" />
                <g fill={c.ink}>
                  <polygon points="88,72 48,100 88,128" />
                  <rect x={96} y={70} width={8} height={60} rx={2} />
                  <polygon points="112,72 152,100 112,128" />
                </g>
              </svg>
            </div>
            <div style={{ position: "absolute", left: 17, top: 20 }}>
              <CloseButton size={BTN.size} pressed={pressed} />
            </div>
          </div>
        </Cutout>
      </div>

      {/* click sparks on each jab */}
      {JABS.map((j) => {
        const t = frame - j;
        if (t < 0 || t > 6) return null;
        const q = interpolate(t, [0, 6], [0, 1], { ...clamp, easing: theme.ease.out });
        return [-40, 0, 40].map((a, k) => (
          <div
            key={`${j}${k}`}
            style={{
              position: "absolute",
              left: BTN.x + 10,
              top: BTN.y - 20,
              width: 34 * (1 - q) + 8,
              height: 7,
              borderRadius: 4,
              background: c.ink,
              transformOrigin: "0 50%",
              transform: `rotate(${a}deg) translateX(${50 + q * 50}px)`,
              opacity: 1 - q,
            }}
          />
        ));
      })}

      {/* host pops up from below */}
      <div
        style={{
          position: "absolute",
          left: hostX,
          top: hostTop,
          transformOrigin: "50% 100%",
          transform: `translateY(${interpolate(hostIn, [0, 1], [420, 0])}px) scaleY(${1 + breathe}) rotate(${interpolate(hostIn, [0, 1], [-8, 0])}deg)`,
        }}
      >
        <Cutout border={7} shadow={14}>
          <Host height={HOST.h} armAngle={armAngle} leftArmAngle={8 + breathe * 200} mood="annoyed" />
        </Cutout>
      </div>

      {/* annoyance marks near the head */}
      {[vein1, vein2].map((v, i) => (
        <svg
          key={i}
          width={110}
          height={110}
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            left: i === 0 ? 300 : 70,
            top: i === 0 ? 760 : 800,
            transform: `scale(${v}) rotate(${(1 - v) * 90 + (i ? -14 : 12)}deg)`,
            opacity: interpolate(v, [0, 0.2], [0, 1], clamp),
          }}
        >
          {[0, 90, 180, 270].map((r) => (
            <path key={r} d="M58 20 Q50 42 30 42" stroke={c.ink} strokeWidth={10} fill="none" strokeLinecap="round" transform={`rotate(${r} 50 50)`} />
          ))}
        </svg>
      ))}

      {/* stopwatch spins in */}
      <div
        style={{
          position: "absolute",
          left: 770,
          top: 590,
          transform: `scale(${interpolate(clockIn, [0, 1], [0, 1])}) rotate(${interpolate(clockIn, [0, 1], [-260, 8])}deg)`,
          opacity: interpolate(clockIn, [0, 0.15], [0, 1], clamp),
        }}
      >
        <Cutout border={8} shadow={16}>
          <Stopwatch size={250} hand={handDeg} />
        </Cutout>
      </div>
      <Burst x={895} y={750} delay={CLOCK + 4} count={12} radius={220} color={c.ink} />

      {/* sfx */}
      {JABS.map((j) => (
        <Sfx key={j} at={j - 2} name="click" volume={0.45} />
      ))}
      <Sfx at={CLOCK - 2} name="whoosh" volume={0.35} />
      <Sfx at={CLOCK + 2} name="pop" volume={0.4} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Sfx key={`t${i}`} at={CLOCK + 2 + i * 8} name="tick" volume={0.3} />
      ))}
      <Sfx at={62} name="pop" volume={0.3} />
    </AbsoluteFill>
  );
};
