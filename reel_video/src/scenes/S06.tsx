// Scene 06 — "for someone using a wheelchair to get inside."
// Camera tracks a smiling wheelchair user rolling in (parallax wall/floor) → she glides into the open
// elevator → confetti pop → she waves.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { Burst, Cutout, Halftone, SceneExit, Tape, clamp, useSpring } from "../components/lib";
import { ElevatorDoors } from "../components/illustrations";
import { WheelchairRider } from "./b/WheelchairRider";
import { Sfx } from "./b/util";

const c = theme.colors;
const DOOR_W = 560;
const DOOR_H = 735;
const DOOR_TOP = 600;
const FLOOR_Y = 1335;
const ELEV_WORLD_X = 1400;
const RIDER_H = 450;
const RIDER_W = (RIDER_H * 300) / 340;
const SCALE = RIDER_H / 340;

export const S06: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tArrive = Math.round(1.5 * fps); // 45
  const tWave = tArrive + 6;

  // camera pans right through the world, settling on the elevator
  const camX = interpolate(frame, [0, tArrive], [0, ELEV_WORLD_X - 540], { ...clamp, easing: theme.ease.inOut });
  // rider screen x: whips in from off-screen left, then drifts to center as the camera settles
  const screenX =
    frame < 8
      ? interpolate(frame, [0, 8], [-260, 210], { ...clamp, easing: theme.ease.out })
      : interpolate(frame, [8, tArrive], [210, 540], { ...clamp, easing: theme.ease.out });
  const worldX = screenX + camX;
  const wheelRot = ((worldX + 260) / (80 * SCALE)) * (180 / Math.PI);
  // pushing rhythm on the rim while moving, then a wave
  const moving = frame < tArrive;
  const pushArm = -18 + Math.sin(frame / 2.6) * 14;
  const wave = useSpring(tWave, "bouncy");
  const armAngle = moving ? pushArm : interpolate(wave, [0, 1], [-18, -118]) + Math.sin((frame - tWave) / 2.5) * 12 * wave;
  // little settle bounce on arrival
  const settle = useSpring(tArrive, "bouncy");
  const bob = moving ? Math.abs(Math.sin(frame / 2.6)) * -4 : interpolate(settle, [0, 0.5, 1], [0, -18, 0]);
  const tiltLean = moving ? -3 : interpolate(settle, [0, 1], [-3, 0]);

  const circle = useSpring(0, "bouncy");
  const circleX = screenX - interpolate(frame, [0, tArrive], [40, 0], clamp);
  const breathe = 1 + Math.sin(frame / 10) * 0.02;
  const glow = useSpring(tArrive, "smooth");

  const elevX = ELEV_WORLD_X - camX;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Sfx at={0} name="whoosh" volume={0.35} />
      <Sfx at={tArrive - 2} name="pop" volume={0.55} />
      <Sfx at={tArrive + 1} name="ding" volume={0.3} />
      <SceneExit durationInFrames={durationInFrames} len={7}>
        {/* far layer: wall panels + halftone (0.45x parallax) */}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = i * 420 - camX * 0.45 - 120;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: 640,
                width: 300,
                height: 640,
                border: `6px solid ${c.paperDark}`,
                borderRadius: 8,
                opacity: 0.9,
              }}
            />
          );
        })}
        <Halftone size={20} opacity={0.22} style={{ left: 600 - camX * 0.3, top: 700, width: 900, height: 560 }} />

        {/* elevator (world-anchored) */}
        <div style={{ position: "absolute", left: elevX - DOOR_W / 2, top: DOOR_TOP, transform: `scale(${1 + glow * 0.02})` }}>
          <Cutout>
            <ElevatorDoors width={DOOR_W} height={DOOR_H} open={1} inside={c.paperDark} />
          </Cutout>
        </div>
        <Tape x={elevX - DOOR_W / 2 + 10} y={DOOR_TOP + 14} rot={-30} w={140} />

        {/* yellow circle accent behind her */}
        <div
          style={{
            position: "absolute",
            left: circleX,
            top: 1080,
            width: 470,
            height: 470,
            borderRadius: "50%",
            background: c.hero,
            transform: `translate(-50%,-50%) scale(${circle * breathe})`,
          }}
        />

        {/* floor: tiles at 1x parallax */}
        <div style={{ position: "absolute", left: 0, top: FLOOR_Y, width: 1080, height: 70, background: c.ink }} />
        {Array.from({ length: 12 }).map((_, i) => {
          const x = ((((i * 130 - camX) % 1560) + 1560) % 1560) - 120;
          return <div key={i} style={{ position: "absolute", left: x, top: FLOOR_Y + 14, width: 70, height: 10, background: c.inkSoft, borderRadius: 5 }} />;
        })}

        {/* rider */}
        <div
          style={{
            position: "absolute",
            left: screenX - RIDER_W / 2,
            top: FLOOR_Y - RIDER_H + bob,
            transform: `rotate(${tiltLean}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          <Cutout border={6} shadow={10}>
            <WheelchairRider height={RIDER_H} wheelRot={wheelRot} armAngle={armAngle} headTilt={moving ? Math.sin(frame / 5) * 3 : -6 * settle} />
          </Cutout>
        </div>

        {/* speed streaks while rolling (foreground, 1.6x) */}
        {moving &&
          [0, 1, 2].map((i) => {
            const o = interpolate(frame, [tArrive - 10, tArrive], [1, 0], clamp);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: screenX - RIDER_W / 2 - 150 - i * 30,
                  top: FLOOR_Y - 300 + i * 90,
                  width: 120 - i * 20,
                  height: 10,
                  borderRadius: 5,
                  background: c.ink,
                  opacity: o * 0.8,
                }}
              />
            );
          })}

        {/* confetti pop on entry */}
        <Burst x={540} y={1050} delay={tArrive} count={18} radius={330} />
        <Burst x={540} y={900} delay={tArrive + 4} count={10} radius={240} color={c.white} />
      </SceneExit>
    </AbsoluteFill>
  );
};
