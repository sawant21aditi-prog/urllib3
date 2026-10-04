// Scene 09 — "It's what's known as a placebo button."
// Giant capsule drops from the top spinning 180° to reveal ▶|◀, paper-thud bounce, tape slaps,
// Rx PLACEBO label swings in, then the capsule pops open: nothing inside.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { Burst, Cutout, Halftone, SceneExit, Tape, clamp, useShake } from "../components/lib";
import { Pill, RxLabel, Sfx } from "./c/props";

const CX = 540;
const CY = 930;
const PILL_W = 760;

export const S09: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = {
    land: Math.round(0.3 * fps), // 9 — under 0.5s per retention note
    tape1: Math.round(0.47 * fps), // 14
    tape2: Math.round(0.6 * fps), // 18
    label: Math.round(0.8 * fps), // 24
    open: Math.round(1.27 * fps), // 38
    close: Math.round(1.67 * fps), // 50
  };

  // drop (accelerating) + spin 180° → 0
  const drop = interpolate(frame, [0, T.land], [-640, 0], { ...clamp, easing: theme.ease.in });
  const spin = interpolate(frame, [0, T.land + 3], [180, 0], { ...clamp, easing: theme.ease.out });
  const tl = frame - T.land;
  const bounce = tl > 0 ? -Math.abs(Math.sin(tl * 0.42)) * 80 * Math.exp(-tl * 0.2) : 0;
  const squash = tl >= 0 ? interpolate(tl, [0, 2, 6, 10], [0.78, 1.08, 0.97, 1], { ...clamp, easing: theme.ease.out }) : 1;
  const idle = Math.sin(frame / 10) * 6;
  const tilt = interpolate(frame, [0, T.land], [-18, -4], { ...clamp, easing: theme.ease.out }) + Math.sin(frame / 14) * 1.2;
  const shake = useShake(T.land, 22, 10);
  const shake2 = useShake(T.close, 12, 8);

  // open / snap shut
  const openP = spring({ frame: frame - T.open, fps, config: theme.spring.bouncy });
  const closeP = spring({ frame: frame - T.close, fps, config: theme.spring.slam });
  const split = 95 * openP * (1 - closeP);

  // camera pull-out
  const cam = interpolate(frame, [0, durationInFrames], [1.07, 1], { ...clamp, easing: theme.ease.inOut });

  // shadow grows as pill approaches
  const shadowP = interpolate(frame, [0, T.land], [0.2, 1], { ...clamp, easing: theme.ease.in });

  // tape slaps
  const tapeP = (d: number) => spring({ frame: frame - d, fps, config: theme.spring.slam });
  const t1 = tapeP(T.tape1);
  const t2 = tapeP(T.tape2);

  // label swing
  const lab = spring({ frame: frame - T.label, fps, config: theme.spring.bouncy });
  const labRot = interpolate(lab, [0, 1], [-60, 7]) + Math.sin(frame / 9) * 1.5 * lab;

  // "nothing inside" text pop between halves
  const emptyP = openP * (1 - closeP);

  return (
    <AbsoluteFill>
      <Sfx at={T.land - 3} name="bass" volume={0.5} />
      <Sfx at={T.land - 2} name="pop" volume={0.5} />
      <Sfx at={T.tape1 - 2} name="tick" volume={0.4} />
      <Sfx at={T.tape2 - 2} name="tick" volume={0.4} />
      <Sfx at={T.label - 2} name="whoosh" volume={0.3} />
      <Sfx at={T.open - 2} name="pop" volume={0.45} />
      <Sfx at={T.close - 2} name="click" volume={0.5} />
      <SceneExit durationInFrames={durationInFrames} len={6}>
        <AbsoluteFill style={{ transform: `scale(${cam}) translate(${shake.x + shake2.x}px, ${shake.y + shake2.y}px)` }}>
          {/* decorative: big halftone disc behind */}
          <Halftone
            size={22}
            opacity={0.22}
            style={{
              left: CX - 380,
              top: CY - 380,
              width: 760,
              height: 760,
              borderRadius: "50%",
              transform: `scale(${interpolate(frame, [0, 6], [0.3, 1], { ...clamp, easing: theme.ease.out }) + Math.sin(frame / 12) * 0.02}) rotate(${frame * 0.3}deg)`,
            }}
          />
          {/* halftone shadow */}
          <Halftone
            size={16}
            opacity={0.5 * shadowP}
            style={{
              left: CX - (PILL_W / 2) * shadowP + 30,
              top: CY + 150,
              width: PILL_W * shadowP,
              height: 90,
              borderRadius: "50%",
              transform: `scaleX(${1 / squash})`,
            }}
          />
          {/* the pill */}
          <div
            style={{
              position: "absolute",
              left: CX - PILL_W / 2,
              top: CY - (PILL_W * 180) / 400 / 2,
              transform: `translateY(${drop + bounce + (tl > 12 ? idle : 0)}px) rotate(${tilt}deg) perspective(1600px) rotateY(${spin}deg) scale(${1 / squash}, ${squash * (frame < T.land ? 1.12 : 1)})`,
              transformOrigin: "50% 100%",
            }}
          >
            <Cutout border={9} shadow={18}>
              <Pill width={PILL_W} split={split} symbol={Math.cos((spin * Math.PI) / 180) > 0} />
            </Cutout>
            {emptyP > 0.05 && (
              <div
                style={{
                  position: "absolute",
                  left: PILL_W / 2 - 80,
                  top: (PILL_W * 180) / 400 / 2 - 44,
                  width: 160,
                  textAlign: "center",
                  fontFamily: theme.fonts.display,
                  fontSize: 72,
                  color: theme.colors.ink,
                  transform: `scale(${emptyP}) rotate(-8deg)`,
                  opacity: emptyP,
                }}
              >
                0mg
              </div>
            )}
          </div>
          <Burst x={CX} y={CY} delay={T.open} count={10} color={theme.colors.paperDark} radius={220} />
          {/* tape slaps */}
          {t1 > 0.01 && (
            <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${CX - 330}px, ${CY - 150}px) scale(${interpolate(t1, [0, 1], [1.8, 1])})`, opacity: interpolate(t1, [0, 0.2], [0, 1], clamp) }}>
              <Tape x={0} y={0} rot={-32} w={200} />
            </div>
          )}
          {t2 > 0.01 && (
            <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${CX + 340}px, ${CY + 120}px) scale(${interpolate(t2, [0, 1], [1.8, 1])})`, opacity: interpolate(t2, [0, 0.2], [0, 1], clamp) }}>
              <Tape x={0} y={0} rot={-28} w={200} />
            </div>
          )}
          {/* Rx label swings in from its tape pin */}
          {lab > 0.01 && (
            <div
              style={{
                position: "absolute",
                left: CX + 10,
                top: CY + 190,
                transformOrigin: "40px 0px",
                transform: `rotate(${labRot}deg) scale(${interpolate(lab, [0, 1], [0.6, 1])})`,
                opacity: interpolate(lab, [0, 0.15], [0, 1], clamp),
              }}
            >
              <Cutout border={6} shadow={12}>
                <RxLabel />
              </Cutout>
              <Tape x={40} y={6} rot={-12} w={110} />
            </div>
          )}
        </AbsoluteFill>
      </SceneExit>
    </AbsoluteFill>
  );
};
