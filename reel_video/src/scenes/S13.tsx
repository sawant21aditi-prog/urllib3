import { useSceneFrame as useCurrentFrame } from "../time";
// Hook part 2 (plays 2nd, ~1.3–3.0s): "And only one person can make it work."
// Open loop for the 3-second rule — a mystery silhouette that only pays off at the firefighter reveal (S11).
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { Cutout, Halftone, Tape, Slam, Burst, useShake, useSpring, SceneExit, clamp } from "../components/lib";
import { Firefighter, Sparkle, Sfx } from "./c/props";

const c = theme.colors;

export const S13: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const shake = useShake(10, 16, 10);

  // faulty-bulb flicker, then steady
  const flicker = frame < 2 ? 0 : frame < 4 ? 1 : frame < 6 ? 0.15 : frame < 8 ? 1 : 0.92 + Math.sin(frame / 3) * 0.04;
  const rise = useSpring(3, "smooth");
  const q = useSpring(10, "slam");
  const qBreathe = 1 + Math.sin(frame / 5) * 0.03;
  const glint = interpolate(frame, [22, 26, 32], [0, 1, 0], clamp);
  const push = interpolate(frame, [0, durationInFrames], [1, 1.06], { ...clamp, easing: theme.ease.inOut });

  return (
    <SceneExit durationInFrames={durationInFrames} len={6}>
      <Sfx at={0} name="glitch" volume={0.35} />
      <Sfx at={8} name="bass" volume={0.55} />
      <Sfx at={20} name="tick" volume={0.4} />
      <AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.r}deg) scale(${push})` }}>
        <Halftone color={c.ink} size={20} opacity={0.22} style={{ left: 60, top: 640, width: 360, height: 360, borderRadius: "50%" }} />
        <Slam delay={0} rot={5} style={{ position: "absolute", left: 150, top: 600, width: 780, height: 790 }}>
          <Cutout>
            <div style={{ position: "relative", width: 780, height: 790, background: c.ink, overflow: "hidden", borderRadius: 6 }}>
              {/* spotlight cone */}
              <div
                style={{
                  position: "absolute",
                  left: 390 - 330,
                  top: -40,
                  width: 660,
                  height: 870,
                  opacity: flicker,
                  background: `radial-gradient(ellipse at 50% 85%, rgba(245,197,24,0.55), rgba(245,197,24,0.12) 55%, transparent 72%)`,
                  clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
                }}
              />
              {/* mystery silhouette */}
              <div
                style={{
                  position: "absolute",
                  left: 390 - 190,
                  top: interpolate(rise, [0, 1], [820, 170]),
                  filter: "brightness(0)",
                  opacity: 0.92,
                }}
              >
                <Firefighter height={620} />
              </div>
              <Sparkle x={390 + 120} y={470} s={5 * glint} color={c.hero} />
            </div>
          </Cutout>
        </Slam>
        <Tape x={210} y={620} rot={-14} />
        <Tape x={880} y={1370} rot={-10} />
        {/* the big question mark */}
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 860,
            transform: `translate(-50%, -50%) scale(${interpolate(q, [0, 1], [3, 1]) * qBreathe}) rotate(${interpolate(q, [0, 1], [-25, 8])}deg)`,
            opacity: interpolate(q, [0, 0.15], [0, 1], clamp),
            fontFamily: theme.fonts.display,
            fontSize: 420,
            lineHeight: 1,
            color: c.hero,
            WebkitTextStroke: `10px ${c.ink}`,
            paintOrder: "stroke fill",
            textShadow: `14px 18px 0 ${c.ink}`,
          }}
        >
          ?
        </div>
        <Burst x={540} y={860} delay={10} count={16} radius={330} />
      </AbsoluteFill>
    </SceneExit>
  );
};
