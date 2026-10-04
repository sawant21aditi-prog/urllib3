// Scene 01 — THE HOOK: a finger already jabbing the close button on frame 0; triangles flicker red on "lying".
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, random } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { Burst, Cutout, Halftone, clamp, useShake } from "../components/lib";
import { CloseButton, PointingHand } from "../components/illustrations";
import { Sfx } from "./a/props";

const c = theme.colors;

/** Shared with S12 so the loop lands on the exact same composition. Center coords. */
export const HERO_BUTTON = { x: 540, y: 960, size: 520 };
/** Fingertip contact point + hand styling used when the finger rests on the button. */
export const HERO_HAND = { tipX: 610, tipY: 1118, width: 240, rot: -16 };

/** Draws the PointingHand so its fingertip sits at (tipX, tipY + offset), rotated about the fingertip. */
export const HandAt: React.FC<{ tipX: number; tipY: number; width: number; rot: number }> = ({ tipX, tipY, width, rot }) => {
  const fx = (55 / 120) * width;
  const fy = (6 / 120) * width;
  return (
    <div
      style={{
        position: "absolute",
        left: tipX - fx,
        top: tipY - fy,
        transformOrigin: `${fx}px ${fy}px`,
        transform: `rotate(${rot}deg)`,
      }}
    >
      <Cutout border={6} shadow={12}>
        <PointingHand width={width} />
      </Cutout>
    </div>
  );
};

const PRESSES = [2, 14, 26];

export const S01: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- jab cycle: hand is already thrusting on frame 0 ---
  const jabOffset = (() => {
    if (frame >= PRESSES[2]) {
      // rests on the button, then pulls back for the exit
      return interpolate(frame, [durationInFrames - 9, durationInFrames], [0, 260], { ...clamp, easing: theme.ease.in });
    }
    const local = (((frame - PRESSES[0]) % 12) + 12) % 12;
    if (local <= 4) return interpolate(local, [0, 4], [0, 150], { ...clamp, easing: theme.ease.out });
    return interpolate(local, [4, 12], [150, 0], { ...clamp, easing: theme.ease.in });
  })();
  const pressed = interpolate(jabOffset, [0, 30], [1, 0], clamp);

  // --- "LYING" lie-detector moment ---
  const LIE = 20;
  const shake = useShake(LIE, 26, 14);
  const flickerOn = frame >= LIE - 2 && frame < LIE + 16 && Math.floor(frame / 2) % 2 === 0;
  const redHold = frame >= LIE + 16; // ends on red: the verdict
  const triColor = flickerOn || redHold ? c.fire : undefined;

  // scale punches on each press + bigger one on "lying"
  const punch = PRESSES.reduce((acc, p) => acc + interpolate(frame - p, [0, 2, 8], [0, 0.05, 0], clamp), 0);
  const liePunch = interpolate(frame - LIE, [0, 2, 10], [0, 0.1, 0], { ...clamp, easing: theme.ease.out });
  const breathe = Math.sin((frame / fps) * Math.PI * 1.6) * 0.012;

  // yellow circle: pops from 0.85 on frame 0 (already visible), rings on hits
  const circleIn = interpolate(frame, [0, 8], [0.82, 1], { ...clamp, easing: theme.ease.out });
  const circleR = HERO_BUTTON.size * 0.68 * (circleIn + breathe * 2 + liePunch * 0.6);

  // glitch RGB-split on "lying"
  const glitch = frame >= LIE && frame < LIE + 8 ? (random(`g${frame}`) * 2 - 1) * 22 : 0;

  // exit
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [0, 1], { ...clamp, easing: theme.ease.in });

  const B = HERO_BUTTON;
  const btnScale = 1 + punch + liePunch + breathe;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.r}deg) scale(${1 + exit * 0.1})`,
        opacity: 1 - exit * 0.3,
        filter: exit > 0 ? `blur(${exit * 5}px)` : undefined,
      }}
    >
      {/* halftone field behind */}
      <Halftone
        size={20}
        opacity={0.22}
        style={{ left: B.x - 470, top: B.y - 330, width: 520, height: 520, borderRadius: "50%" }}
      />
      {/* shockwave rings (ink) on every press */}
      {[...PRESSES, LIE].map((p, i) => {
        const t = frame - p;
        if (t < 0 || t > 12) return null;
        const q = interpolate(t, [0, 12], [0, 1], { ...clamp, easing: theme.ease.out });
        const r = B.size * (0.55 + q * (i === 3 ? 0.75 : 0.4));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: B.x - r,
              top: B.y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `${(1 - q) * (i === 3 ? 18 : 9)}px solid ${c.ink}`,
              opacity: 1 - q,
            }}
          />
        );
      })}
      {/* THE yellow circle */}
      <div
        style={{
          position: "absolute",
          left: B.x - circleR,
          top: B.y - circleR,
          width: circleR * 2,
          height: circleR * 2,
          borderRadius: "50%",
          background: c.hero,
          boxShadow: `14px 18px 0 rgba(30,29,27,0.18)`,
        }}
      />
      {/* lie-detector alarm ticks around the circle */}
      {frame >= LIE &&
        Array.from({ length: 12 }).map((_, i) => {
          const t = frame - LIE;
          const q = interpolate(t, [0, 10], [0, 1], { ...clamp, easing: theme.ease.out });
          const a = (i / 12) * Math.PI * 2 + 0.2;
          const r0 = B.size * 0.7 + q * 24;
          const len = interpolate(t, [0, 4, 18], [0, 56, 30], clamp);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: B.x + Math.cos(a) * r0,
                top: B.y + Math.sin(a) * r0,
                width: len,
                height: 14,
                borderRadius: 7,
                background: c.ink,
                transform: `translate(0,-50%) rotate(${a}rad)`,
                transformOrigin: "0 50%",
              }}
            />
          );
        })}
      {/* glitch ghost (red) */}
      {glitch !== 0 && (
        <div
          style={{
            position: "absolute",
            left: B.x - B.size / 2 + glitch,
            top: B.y - B.size / 2,
            opacity: 0.55,
            mixBlendMode: "multiply",
            transform: `scale(${btnScale})`,
          }}
        >
          <CloseButton size={B.size} pressed={pressed} triColor={c.fire} />
        </div>
      )}
      {/* the button */}
      <div
        style={{
          position: "absolute",
          left: B.x - B.size / 2,
          top: B.y - B.size / 2,
          transform: `scale(${btnScale}) translateX(${-glitch * 0.4}px)`,
        }}
      >
        <Cutout border={9} shadow={18}>
          <CloseButton size={B.size} pressed={pressed} triColor={triColor} />
        </Cutout>
      </div>
      <Burst x={B.x} y={B.y} delay={LIE} count={18} radius={430} />
      {/* impact sparks at the fingertip on each press */}
      {PRESSES.map((p) => {
        const t = frame - p;
        if (t < 0 || t > 7) return null;
        const q = interpolate(t, [0, 7], [0, 1], { ...clamp, easing: theme.ease.out });
        return [-60, -20, 20].map((a, k) => (
          <div
            key={`${p}-${k}`}
            style={{
              position: "absolute",
              left: HERO_HAND.tipX - 20,
              top: HERO_HAND.tipY - 10,
              width: 50 * (1 - q) + 10,
              height: 9,
              borderRadius: 5,
              background: c.ink,
              transformOrigin: "0 50%",
              transform: `rotate(${a - 90}deg) translateX(${40 + q * 70}px)`,
              opacity: 1 - q,
            }}
          />
        ));
      })}
      {/* the jabbing hand */}
      <HandAt tipX={HERO_HAND.tipX} tipY={HERO_HAND.tipY + jabOffset} width={HERO_HAND.width} rot={HERO_HAND.rot} />

      <Sfx at={0} name="click" volume={0.55} />
      <Sfx at={12} name="click" volume={0.5} />
      <Sfx at={24} name="click" volume={0.55} />
      <Sfx at={LIE - 3} name="glitch" volume={0.35} />
      <Sfx at={LIE - 2} name="bass" volume={0.45} />
    </AbsoluteFill>
  );
};
