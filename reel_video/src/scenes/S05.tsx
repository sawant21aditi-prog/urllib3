import { useSceneFrame as useCurrentFrame } from "../time";
// Scene 05 — "One rule: elevator doors must stay open long enough"
// Doors slide open (ding) → RULE stamp slams → yellow timing arc fills like a countdown while 1·2·3 SEC ticks.
import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { Burst, Camera, Cutout, Halftone, SceneExit, Tape, clamp, drawOn, useShake, useSpring } from "../components/lib";
import { ElevatorDoors } from "../components/illustrations";
import { InkStamp, Sfx } from "./b/util";

const c = theme.colors;
const CX = 540;
const DOOR_W = 560;
const DOOR_H = 735;
const DOOR_TOP = 600;
const ARC_CY = 960;
const ARC_R = 170;

export const S05: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  // timeline
  const tOpen = 3;
  const tStamp = sec(0.37); // 11
  const ticks = [sec(0.87), sec(1.53), sec(2.2)]; // 26, 46, 66
  const tDone = ticks[2] + 4;

  const enter = useSpring(0, "snappy");
  const open = useSpring(tOpen, "smooth") * 0.86;
  const shake = useShake(tStamp, 16, 10);
  const shake2 = useShake(ticks[2], 10, 8);

  // arc progress fills in three spring steps (a ticking timer)
  const s1 = useSpring(ticks[0], "snappy");
  const s2 = useSpring(ticks[1], "snappy");
  const s3 = useSpring(ticks[2], "snappy");
  const arcP = (s1 + s2 + s3) / 3;
  const count = frame >= ticks[2] ? 3 : frame >= ticks[1] ? 2 : frame >= ticks[0] ? 1 : 0;
  const lastTick = count === 0 ? 0 : ticks[count - 1];
  const punch = useSpring(lastTick, "bouncy");
  const numScale = count === 0 ? 0 : interpolate(punch, [0, 1], [1.7, 1]);
  const numRot = count === 0 ? 0 : interpolate(punch, [0, 1], [count % 2 ? -10 : 10, 0]);

  // ring + dimension diagram draws on before the first tick
  const ringIn = interpolate(frame, [12, 26], [0, 1], { ...clamp, easing: theme.ease.out });
  const dimIn = interpolate(frame, [16, 30], [0, 1], { ...clamp, easing: theme.ease.out });
  const breathe = Math.sin(frame / 9) * 0.02;
  const done = useSpring(tDone, "bouncy");
  const pinPulse = Math.sin(frame / 4) * 6;

  const circ = 2 * Math.PI * ARC_R;
  // door inner edge positions in screen px (doors are open ~86%)
  const doorScale = DOOR_W / 320;
  const leftEdge = CX - DOOR_W / 2 + (160 - open * 142) * doorScale;
  const rightEdge = CX - DOOR_W / 2 + (160 + open * 142) * doorScale;
  const dimY = 1268;

  return (
    <AbsoluteFill>
      <Sfx at={0} name="ding" volume={0.5} />
      <Sfx at={tStamp - 2} name="bass" volume={0.45} />
      {ticks.map((t, i) => (
        <Sfx key={i} at={t - 2} name="tick" volume={0.55} />
      ))}
      <Sfx at={tDone - 2} name="pop" volume={0.4} />
      <SceneExit durationInFrames={durationInFrames} len={7}>
        <Camera durationInFrames={durationInFrames} from={1} to={1.06} panY={-8}>
          <AbsoluteFill style={{ transform: `translate(${shake.x + shake2.x}px, ${shake.y + shake2.y}px) rotate(${shake.r}deg)` }}>
            {/* halftone shadow block (parallax-ish drift) */}
            <Halftone
              size={20}
              opacity={0.3}
              style={{
                left: CX - DOOR_W / 2 + 60,
                top: DOOR_TOP + 70 + frame * 0.3,
                width: DOOR_W,
                height: DOOR_H,
                transform: `scale(${interpolate(enter, [0, 1], [0.6, 1])})`,
                opacity: 0.3 * enter,
              }}
            />
            {/* elevator */}
            <div
              style={{
                position: "absolute",
                left: CX - DOOR_W / 2,
                top: DOOR_TOP,
                opacity: interpolate(enter, [0, 0.3], [0, 1], clamp),
                transform: `scale(${interpolate(enter, [0, 1], [1.25, 1])}) rotate(${interpolate(enter, [0, 1], [-4, 0])}deg)`,
                transformOrigin: "50% 60%",
              }}
            >
              <Cutout>
                <ElevatorDoors width={DOOR_W} height={DOOR_H} open={open} inside={c.paperDark} />
              </Cutout>
            </div>
            <Tape x={CX - DOOR_W / 2 + 20} y={DOOR_TOP + 10} rot={-28} w={150} />
            <Tape x={CX + DOOR_W / 2 - 20} y={DOOR_TOP + DOOR_H - 10} rot={-24} w={150} />

            {/* diagram layer */}
            <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              {/* ring track */}
              <circle
                cx={CX}
                cy={ARC_CY}
                r={ARC_R}
                fill="none"
                stroke={c.ink}
                strokeWidth={6}
                strokeDasharray="4 16"
                strokeLinecap="round"
                opacity={0.55 * ringIn}
                transform={`rotate(${frame * 0.6} ${CX} ${ARC_CY})`}
              />
              <circle cx={CX} cy={ARC_CY} r={ARC_R - 34} fill={c.white} opacity={0.85 * ringIn} />
              {/* yellow timing arc */}
              <circle
                cx={CX}
                cy={ARC_CY}
                r={ARC_R}
                fill="none"
                stroke={c.hero}
                strokeWidth={30}
                strokeLinecap="round"
                transform={`rotate(-90 ${CX} ${ARC_CY})`}
                style={drawOn(arcP, circ)}
                opacity={arcP > 0.001 ? 1 : 0}
              />
              {/* tick marks at each second */}
              {[0, 1, 2].map((i) => {
                const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
                const lit = count > i;
                return (
                  <line
                    key={i}
                    x1={CX + Math.cos(a) * (ARC_R + 26)}
                    y1={ARC_CY + Math.sin(a) * (ARC_R + 26)}
                    x2={CX + Math.cos(a) * (ARC_R + 52)}
                    y2={ARC_CY + Math.sin(a) * (ARC_R + 52)}
                    stroke={c.ink}
                    strokeWidth={lit ? 10 : 6}
                    strokeLinecap="round"
                    opacity={ringIn}
                  />
                );
              })}
              {/* dimension line between the open doors: |<—— HOLD OPEN ——>| */}
              <g opacity={dimIn > 0 ? 1 : 0}>
                <line x1={leftEdge + 6} y1={dimY - 30} x2={leftEdge + 6} y2={dimY + 30} stroke={c.ink} strokeWidth={6} />
                <line x1={rightEdge - 6} y1={dimY - 30} x2={rightEdge - 6} y2={dimY + 30} stroke={c.ink} strokeWidth={6} />
                <line
                  x1={CX}
                  y1={dimY}
                  x2={CX - (CX - leftEdge - 26) * dimIn}
                  y2={dimY}
                  stroke={c.ink}
                  strokeWidth={6}
                />
                <line x1={CX} y1={dimY} x2={CX + (rightEdge - CX - 26) * dimIn} y2={dimY} stroke={c.ink} strokeWidth={6} />
                <polygon
                  points={`${leftEdge + 12},${dimY} ${leftEdge + 44},${dimY - 18} ${leftEdge + 44},${dimY + 18}`}
                  fill={c.ink}
                  opacity={dimIn > 0.9 ? 1 : 0}
                />
                <polygon
                  points={`${rightEdge - 12},${dimY} ${rightEdge - 44},${dimY - 18} ${rightEdge - 44},${dimY + 18}`}
                  fill={c.ink}
                  opacity={dimIn > 0.9 ? 1 : 0}
                />
              </g>
              {/* pin arrows pushing the doors open (pulse) */}
              {[-1, 1].map((d) => {
                const ex = d < 0 ? leftEdge : rightEdge;
                const p = interpolate(frame, [20 + (d > 0 ? 3 : 0), 32 + (d > 0 ? 3 : 0)], [0, 1], { ...clamp, easing: theme.ease.out });
                const x0 = ex - d * (70 + pinPulse);
                return (
                  <g key={d} opacity={p} transform={`translate(${-d * (1 - p) * 60} 0)`}>
                    {[760, 1150].map((y) => (
                      <g key={y}>
                        <line x1={x0} y1={y} x2={ex - d * 4 + d * 10} y2={y} stroke={c.ink} strokeWidth={9} strokeLinecap="round" />
                        <polygon points={`${ex + d * 22},${y} ${ex - d * 6},${y - 20} ${ex - d * 6},${y + 20}`} fill={c.ink} />
                      </g>
                    ))}
                  </g>
                );
              })}
            </svg>

            {count === 0 && (
              <div
                style={{
                  position: "absolute",
                  left: CX - 150,
                  top: ARC_CY - 130,
                  width: 300,
                  height: 260,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: theme.fonts.display,
                  fontSize: 190,
                  color: c.ink,
                  opacity: 0.18 * ringIn,
                  transform: `scale(${interpolate(ringIn, [0, 1], [0.6, 1])})`,
                }}
              >
                0
              </div>
            )}
            {/* counter */}
            {count > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: CX - 150,
                  top: ARC_CY - 130,
                  width: 300,
                  height: 260,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${numScale + breathe}) rotate(${numRot}deg)`,
                }}
              >
                <div style={{ fontFamily: theme.fonts.display, fontSize: 190, lineHeight: 0.95, color: c.ink, fontVariantNumeric: "tabular-nums" }}>
                  {count}
                </div>
                <div
                  style={{
                    fontFamily: theme.fonts.body,
                    fontWeight: 900,
                    fontSize: 40,
                    letterSpacing: "0.18em",
                    color: c.ink,
                    marginTop: -4,
                  }}
                >
                  SEC
                </div>
              </div>
            )}
            {/* "3+ SEC" hold-open confirm label */}
            {frame >= tDone && (
              <div
                style={{
                  position: "absolute",
                  left: CX,
                  top: dimY - 76,
                  transform: `translate(-50%, 0) scale(${interpolate(done, [0, 1], [0.3, 1])}) rotate(-3deg)`,
                  opacity: interpolate(done, [0, 0.3], [0, 1], clamp),
                  background: c.ink,
                  color: c.white,
                  fontFamily: theme.fonts.body,
                  fontWeight: 900,
                  fontSize: 34,
                  letterSpacing: "0.12em",
                  padding: "8px 22px",
                  whiteSpace: "nowrap",
                }}
              >
                HOLD OPEN
              </div>
            )}
            <Burst x={CX} y={ARC_CY - ARC_R} delay={tDone} count={14} radius={220} />
            {/* RULE stamp */}
            <InkStamp text="RULE" delay={tStamp} x={858} y={640} rot={-14} size={88} bg={c.paper} />
          </AbsoluteFill>
        </Camera>
      </SceneExit>
    </AbsoluteFill>
  );
};
