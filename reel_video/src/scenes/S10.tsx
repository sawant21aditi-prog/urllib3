import { useSceneFrame as useCurrentFrame } from "../time";
// Scene 10 — "But there's one person it still works for."
// Dark charcoal field. Faulty spotlight flickers twice, a giant yellow "WHO?" flashes, then the beam
// settles on a lone button panel (with a keyhole that glints). Slow ominous push-in, dust in the beam.
import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { CloseButton } from "../components/illustrations";
import { Cutout, Halftone, SceneExit, clamp, useShake } from "../components/lib";
import { DustMotes, Sfx, Sparkle } from "./c/props";

const CX = 540;
const CY = 990;

export const S10: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = {
    flick1: 2,
    flick2: 6,
    who: Math.round(0.3 * fps), // 9
    whoEnd: Math.round(0.6 * fps), // 18
    on: Math.round(0.63 * fps), // 19
    glint: Math.round(1.2 * fps), // 36
    shadow: Math.round(1.45 * fps), // 44
  };

  // faulty-bulb light level per frame
  const flickerSeq: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 0.75, 4: 0, 5: 0, 6: 0.9, 7: 0.25, 8: 1, 9: 0 };
  let L: number;
  if (frame < T.who) L = flickerSeq[frame] ?? 0;
  else if (frame < T.on) L = 0;
  else {
    const p = spring({ frame: frame - T.on, fps, config: theme.spring.snappy });
    // one tiny late stutter so the bulb stays "alive"
    const stutter = frame === T.on + 14 ? 0.7 : 1;
    L = Math.min(1, p * 1.2) * stutter;
  }

  // WHO? flash
  const whoOn = frame >= T.who && frame < T.whoEnd;
  const whoP = spring({ frame: frame - T.who, fps, config: theme.spring.slam });
  const whoShake = useShake(T.who, 16, T.whoEnd - T.who);
  const whoOut = interpolate(frame, [T.whoEnd - 3, T.whoEnd], [1, 0], { ...clamp, easing: theme.ease.in });

  // push-in after the light settles
  const push = interpolate(frame, [T.on, durationInFrames], [1, 1.14], { ...clamp, easing: theme.ease.inOut });
  const onShake = useShake(T.on, 8, 6);

  // panel pop when the beam lands
  const panelP = spring({ frame: frame - T.on + 2, fps, config: theme.spring.bouncy });
  const glint = spring({ frame: frame - T.glint, fps, config: theme.spring.snappy }) * interpolate(frame, [T.glint + 8, T.glint + 16], [1, 0], { ...clamp, easing: theme.ease.in });
  const shadowIn = interpolate(frame, [T.shadow, durationInFrames], [0, 1], { ...clamp, easing: theme.ease.out });

  const ink = theme.colors.ink;
  const stripP = spring({ frame, fps, config: theme.spring.snappy });

  return (
    <AbsoluteFill style={{ background: ink }}>
      <Sfx at={0} name="tick" volume={0.5} />
      <Sfx at={T.flick2 - 2} name="glitch" volume={0.35} />
      <Sfx at={T.who - 2} name="bass" volume={0.55} />
      <Sfx at={T.on - 2} name="click" volume={0.55} />
      <Sfx at={T.glint - 2} name="tick" volume={0.35} />
      <SceneExit durationInFrames={durationInFrames} len={5}>
        <AbsoluteFill style={{ transform: `scale(${push}) translate(${onShake.x}px, ${onShake.y}px)`, transformOrigin: `${CX}px ${CY}px` }}>
          {/* dark paper texture */}
          <Halftone color="#000" size={14} opacity={0.35} style={{ inset: 0 }} />
          {/* light beam from top */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: L * 0.9,
              background: `linear-gradient(180deg, rgba(245,197,24,0.0) 0%, rgba(245,197,24,0.22) 60%, rgba(245,197,24,0.05) 100%)`,
              clipPath: `polygon(${CX - 70}px -40px, ${CX + 70}px -40px, ${CX + 380}px ${CY + 330}px, ${CX - 380}px ${CY + 330}px)`,
            }}
          />
          {/* pool of light */}
          <div
            style={{
              position: "absolute",
              left: CX - 420,
              top: CY - 360,
              width: 840,
              height: 760,
              borderRadius: "50%",
              background: `radial-gradient(ellipse at center, rgba(245,197,24,0.55) 0%, rgba(245,197,24,0.28) 45%, rgba(245,197,24,0) 70%)`,
              opacity: L,
            }}
          />
          {/* lone button panel */}
          <div
            style={{
              position: "absolute",
              left: CX - 190,
              top: CY - 300,
              filter: `brightness(${0.15 + 0.85 * L})`,
              transform: `scale(${interpolate(panelP, [0, 1], [0.9, 1])}) rotate(${-3 + Math.sin(frame / 18) * 0.8}deg)`,
            }}
          >
            <Cutout border={7} shadow={18}>
              <svg width={380} height={600} viewBox="0 0 380 600">
                <rect x={0} y={0} width={380} height={600} rx={22} fill={theme.colors.paperDark} />
                <rect x={18} y={18} width={344} height={564} rx={14} fill="none" stroke={theme.colors.inkSoft} strokeWidth={3} strokeDasharray="10 8" />
                <circle cx={44} cy={44} r={8} fill={theme.colors.inkSoft} />
                <circle cx={336} cy={44} r={8} fill={theme.colors.inkSoft} />
                <circle cx={44} cy={556} r={8} fill={theme.colors.inkSoft} />
                <circle cx={336} cy={556} r={8} fill={theme.colors.inkSoft} />
                {/* keyhole */}
                <circle cx={190} cy={470} r={44} fill={theme.colors.brassDark} />
                <circle cx={190} cy={470} r={36} fill={theme.colors.brass} />
                <circle cx={190} cy={460} r={10} fill={ink} />
                <path d="M184 464 L196 464 L200 492 L180 492 Z" fill={ink} />
              </svg>
            </Cutout>
            <div style={{ position: "absolute", left: 50, top: 60 }}>
              <CloseButton size={280} />
            </div>
            <Sparkle x={220} y={444} s={glint * 1.1} />
          </div>
          {/* a helmet shadow creeps into the edge of the light — the answer is coming */}
          <svg
            width={520}
            height={420}
            viewBox="0 0 260 210"
            style={{
              position: "absolute",
              left: interpolate(shadowIn, [0, 1], [1100, 700]),
              top: CY - 160,
              opacity: 0.85 * shadowIn * L,
            }}
          >
            <path d="M40 120 Q42 30 130 26 Q218 30 220 120 Z M10 122 Q130 96 254 126 L246 140 Q130 118 18 136 Z M80 140 Q130 190 180 140 L190 210 L70 210 Z" fill="#000" />
          </svg>
          <DustMotes cx={CX} cy={CY - 120} w={560} h={900} opacity={L} />
          {/* darkness falloff outside the pool */}
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse 520px 640px at ${CX}px ${CY - 40}px, transparent 55%, rgba(30,29,27,0.85) 100%)`,
            }}
          />
          {/* full blackout between flickers */}
          <AbsoluteFill style={{ background: ink, opacity: 1 - L }} />
        </AbsoluteFill>
        {/* torn cream strip behind the global headline so it stays readable on the dark field */}
        <div
          style={{
            position: "absolute",
            left: -40,
            top: 222,
            width: 1160,
            height: 300,
            background: theme.colors.paper,
            transform: `translateX(${interpolate(stripP, [0, 1], [-1200, 0])}px) rotate(-1.5deg)`,
            clipPath:
              "polygon(0 6%, 8% 0, 17% 5%, 29% 1%, 41% 6%, 55% 0, 68% 5%, 80% 1%, 92% 6%, 100% 2%, 100% 94%, 90% 100%, 77% 95%, 63% 100%, 50% 94%, 36% 99%, 22% 94%, 10% 100%, 0 95%)",
          }}
        />
        {whoOn && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translate(${whoShake.x}px, ${whoShake.y}px)` }}>
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontSize: 330,
                lineHeight: 1,
                color: theme.colors.hero,
                marginTop: 80,
                transform: `scale(${interpolate(whoP, [0, 1], [1.6, 1])}) rotate(${interpolate(whoP, [0, 1], [-8, -3])}deg)`,
                opacity: interpolate(whoP, [0, 0.15], [0, 1], clamp) * whoOut,
                textShadow: `12px 14px 0 #000`,
              }}
            >
              WHO?
            </div>
          </AbsoluteFill>
        )}
      </SceneExit>
    </AbsoluteFill>
  );
};
