import { useSceneFrame as useCurrentFrame } from "../time";
// Scene 08 — "It might light up. Nothing happens."
// Host frantically jabs (stop-motion, click per jab) → button lights up → NOTHING stamp + dead freeze →
// a tumbleweed rolls past.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useVideoConfig } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { Cutout, Halftone, SceneExit, Tape, clamp, useShake, useSpring } from "../components/lib";
import { CloseButton, Host } from "../components/illustrations";
import { ImpactLines, InkStamp, Sfx } from "./b/util";

const c = theme.colors;
const HOST_H = 640;
const HOST_L = 150;
const HOST_T = 715;
const BTN = { x: 690, y: 975, size: 240 };

const Tumbleweed: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ overflow: "visible" }}>
    <circle r={44} fill="none" stroke={c.inkSoft} strokeWidth={4} />
    <path
      d="M-40 -10 Q0 -50 38 -14 Q10 30 -34 22 Q-10 -30 30 18 Q0 44 -20 -36 Q20 -40 26 30 M-44 4 Q0 10 44 -2"
      fill="none"
      stroke={c.ink}
      strokeWidth={4}
      strokeLinecap="round"
    />
  </svg>
);

export const S08: React.FC<SceneProps> = ({ durationInFrames }) => {
  const realFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const STEP = 3;
  const tJabEnd = 27;
  const tGlow = Math.round(0.4 * fps); // 12 — "light up"
  const tStamp = 31; // "Nothing"
  const tFreezeEnd = 46;
  const tWeed = 44;

  // DEADPAN FREEZE: from tJabEnd to tFreezeEnd the character/button layer holds one frame
  const frame = realFrame >= tJabEnd && realFrame < tFreezeEnd ? tJabEnd : realFrame;
  const jabbing = frame < tJabEnd;
  const k = Math.floor(frame / STEP);
  const right = k % 2 === 0;
  const jx = jabbing ? (random(`jx${k}`) - 0.5) * 10 : 0;
  const jy = jabbing ? (random(`jy${k}`) - 0.5) * 10 : 0;
  const jr = jabbing ? (random(`jr${k}`) - 0.5) * 4 : 0;
  const armAngle = jabbing ? (right ? -92 : -64) + jr * 2 : -92;
  const leftArmAngle = jabbing ? (right ? 30 : 150) + jr * 3 : 12;
  const lurch = jabbing && !right ? 26 : 0;
  const pressed = jabbing && right ? 1 : 0;
  const mood = realFrame >= tStamp ? "shock" : "annoyed";

  const enter = useSpring(0, "slam");
  const glow = realFrame >= tGlow ? Math.min(1, spring({ frame: realFrame - tGlow, fps, config: theme.spring.snappy })) : 0;
  const shake = useShake(tStamp, 22, 10);
  const breathe = realFrame >= tFreezeEnd ? Math.sin((realFrame - tFreezeEnd) / 8) * 0.01 : 0;

  // tumbleweed
  const wp = interpolate(realFrame, [tWeed, durationInFrames], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const weedX = interpolate(wp, [0, 1], [1180, -160]);
  const weedBounce = -Math.abs(Math.sin(wp * Math.PI * 3.2)) * 70;
  const weedRot = -wp * 900;

  return (
    <AbsoluteFill>
      {/* one click per jab, landing 1 frame before the visual press */}
      {Array.from({ length: Math.ceil(tJabEnd / STEP) }).map((_, i) => (
        <Sfx key={i} at={i * STEP - 1} name="click" volume={i % 2 ? 0.28 : 0.38} />
      ))}
      <Sfx at={tGlow - 2} name="ding" volume={0.3} />
      <Sfx at={tStamp - 2} name="bass" volume={0.55} />
      <Sfx at={tWeed - 2} name="whoosh" volume={0.25} />
      <SceneExit durationInFrames={durationInFrames} len={6}>
        <AbsoluteFill
          style={{
            transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.r}deg) scale(${interpolate(enter, [0, 1], [1.18, 1]) + breathe})`,
            transformOrigin: "540px 980px",
          }}
        >
          <Halftone size={20} opacity={0.26} style={{ left: 600, top: 820, width: 340, height: 460 }} drift={realFrame >= tFreezeEnd || realFrame < tJabEnd} />
          {/* wall panel with the button */}
          <div style={{ position: "absolute", left: BTN.x - 160, top: BTN.y - 230, transform: `rotate(${2 + jr * 0.3}deg)` }}>
            <Cutout>
              <div style={{ width: 320, height: 470, background: c.paperDark, borderRadius: 18 }} />
            </Cutout>
          </div>
          <Tape x={BTN.x + 130} y={BTN.y - 222} rot={30} w={140} />
          <div
            style={{
              position: "absolute",
              left: BTN.x - BTN.size / 2,
              top: BTN.y - BTN.size / 2,
              transform: `scale(${pressed ? 0.95 : 1}) translate(${jx * 0.3}px, ${jy * 0.3}px)`,
            }}
          >
            <CloseButton size={BTN.size} pressed={pressed} glow={glow} />
          </div>

          {/* host, stop-motion jittered */}
          <div
            style={{
              position: "absolute",
              left: HOST_L + jx + lurch,
              top: HOST_T + jy,
              transform: `rotate(${jr + (jabbing ? 2 : 0)}deg)`,
              transformOrigin: "50% 100%",
            }}
          >
            <Cutout>
              <Host height={HOST_H} armAngle={armAngle} leftArmAngle={leftArmAngle} mood={mood} />
            </Cutout>
          </div>

          {/* motion lines around the contact point while jabbing (and frozen mid-air during the hold) */}
          {jabbing && <ImpactLines x={BTN.x} y={BTN.y} r0={150} r1={210} count={5} dir={Math.PI * 1.5} spread={Math.PI * 1.1} seed="b8" />}
          {jabbing && !right && (
            <ImpactLines x={HOST_L + 40 + lurch} y={HOST_T + 120} r0={60} r1={110} count={3} dir={Math.PI * 1.25} spread={1.2} seed="h8" width={7} />
          )}
          {/* glow halo ring once lit */}
          {glow > 0 && (
            <div
              style={{
                position: "absolute",
                left: BTN.x,
                top: BTN.y,
                width: BTN.size * 1.35,
                height: BTN.size * 1.35,
                borderRadius: "50%",
                border: `6px solid ${c.ink}`,
                transform: `translate(-50%,-50%) scale(${interpolate(glow, [0, 1], [0.7, 1.12])})`,
                opacity: interpolate(glow, [0, 0.4, 1], [0, 0.6, 0]),
              }}
            />
          )}
          <InkStamp text="NOTHING" delay={tStamp} x={560} y={1235} rot={-7} size={108} bg={c.paper} />

          {/* tumbleweed gag */}
          {realFrame >= tWeed && (
            <>
              {[0, 1, 2].map((i) => {
                const dp = interpolate(realFrame, [tWeed + 4 + i * 5, tWeed + 16 + i * 5], [0, 1], { ...clamp, easing: theme.ease.out });
                const x0 = interpolate(interpolate(realFrame - 4 - i * 5, [tWeed, durationInFrames], [0, 1], clamp), [0, 1], [1180, -160]);
                return dp > 0 && dp < 1 ? (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: x0 + 40,
                      top: 1330 - dp * 30,
                      width: 40 + dp * 50,
                      height: 40 + dp * 50,
                      borderRadius: "50%",
                      background: c.inkSoft,
                      opacity: 0.35 * (1 - dp),
                      transform: "translate(-50%,-50%)",
                    }}
                  />
                ) : null;
              })}
              <div style={{ position: "absolute", left: weedX - 60, top: 1250 + weedBounce, transform: `rotate(${weedRot}deg)` }}>
                <Tumbleweed size={120} />
              </div>
            </>
          )}
        </AbsoluteFill>
      </SceneExit>
    </AbsoluteFill>
  );
};

