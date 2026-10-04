// Scene 04 — "That year, the U.S. passes the Americans with Disabilities Act."
// Legal document slides up, title wipes + text lines draw on, fountain pen signs, wax seal stamps down with shake + burst.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { Burst, Cutout, Halftone, clamp, drawOn, useShake, useSpring } from "../components/lib";
import { FountainPen, PEN_TIP, Sfx, WaxSeal, prog } from "./a/props";

const c = theme.colors;

const DOC = { x: 240, y: 580, w: 600, h: 780 };
const TITLE = 8;
const LINES = 18;
const PEN_IN = 32;
const SIGN_A = 40;
const SIGN_B = 64;
const PEN_OUT = 66;
const SEAL = 74;
const SEAL_POS = { x: 478, y: 612 }; // doc-local center

// signature: prolate trochoid -> loopy cursive
const SIG_N = 120;
const sigPoint = (t: number) => {
  const th = t * Math.PI * 2 * 3.4;
  const a = 250 / (Math.PI * 2 * 3.4);
  const b = 10 + 22 * Math.abs(Math.sin(t * Math.PI * 1.7 + 0.6)); // irregular loop sizes
  const y = 650 + b * Math.cos(th) * 1.1 - t * 26 + Math.sin(t * Math.PI * 2.3) * 12;
  return { x: 70 + a * th - b * 0.8 * Math.sin(th) + 10, y };
};
const SIG_PTS = Array.from({ length: SIG_N + 1 }, (_, i) => sigPoint(i / SIG_N));

const BODY = [0.92, 0.84, 0.9, 0.62, 0.88, 0.95, 0.7, 0.86, 0.5];

export const S04: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const docIn = useSpring(0, "snappy");
  const triIn = useSpring(3, "bouncy");
  const triSpin = interpolate(triIn, [0, 1], [-140, -8]) + Math.sin((frame / fps) * Math.PI * 0.8) * 4;

  // title wipe per line
  const t1 = interpolate(frame, [TITLE, TITLE + 8], [0, 100], { ...clamp, easing: theme.ease.out });
  const t2 = interpolate(frame, [TITLE + 4, TITLE + 12], [0, 100], { ...clamp, easing: theme.ease.out });
  const rule = prog(frame, TITLE + 10, TITLE + 18);

  // signature + pen
  const sig = prog(frame, SIGN_A, SIGN_B, theme.ease.inOut);
  const nShown = Math.max(1, Math.round(sig * SIG_N));
  const tip = SIG_PTS[nShown];
  const penIn = useSpring(PEN_IN, "snappy");
  const penOut = interpolate(frame, [PEN_OUT, PEN_OUT + 6], [0, 1], { ...clamp, easing: theme.ease.in });
  const startTip = SIG_PTS[0];
  const penX = interpolate(penIn, [0, 1], [startTip.x + 500, startTip.x]) + (tip.x - startTip.x) + penOut * 420;
  const penY = interpolate(penIn, [0, 1], [startTip.y - 420, startTip.y]) + (tip.y - startTip.y) - penOut * 520;
  const penLift = frame < SIGN_A ? interpolate(frame, [PEN_IN + 4, SIGN_A], [-18, 0], { ...clamp, easing: theme.ease.out }) : 0;
  const sigLine = prog(frame, PEN_IN - 4, PEN_IN + 6);

  // wax seal stamp
  const seal = useSpring(SEAL, "slam");
  const shake = useShake(SEAL + 1, 28, 14);
  const stampShadow = interpolate(seal, [0, 1], [40, 12]);

  const push = 1 + 0.05 * prog(frame, 0, durationInFrames, theme.ease.inOut);
  const sealPunch = interpolate(frame - SEAL, [0, 3, 10], [0, 0.035, 0], clamp);
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [0, 1], { ...clamp, easing: theme.ease.in });

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.r}deg) scale(${push + sealPunch + exit * 0.1})`,
        opacity: 1 - exit * 0.35,
        filter: exit > 0 ? `blur(${exit * 6}px)` : undefined,
      }}
    >
      {/* yellow triangle accent */}
      <svg
        width={420}
        height={380}
        viewBox="0 0 420 380"
        style={{
          position: "absolute",
          left: 50,
          top: 960,
          transform: `scale(${triIn}) rotate(${triSpin}deg)`,
          opacity: interpolate(triIn, [0, 0.2], [0, 1], clamp),
        }}
      >
        <polygon points="210,0 420,370 0,370" fill={c.hero} />
      </svg>

      {/* document */}
      <div
        style={{
          position: "absolute",
          left: DOC.x,
          top: DOC.y,
          width: DOC.w,
          height: DOC.h,
          transform: `translateY(${interpolate(docIn, [0, 1], [760, 0])}px) rotate(${interpolate(docIn, [0, 1], [9, -2])}deg)`,
        }}
      >
        <Halftone size={18} opacity={0.3} style={{ left: 40, top: 46, width: DOC.w, height: DOC.h }} />
        <Cutout border={8} shadow={16}>
          <div style={{ width: DOC.w, height: DOC.h, background: "#FBF6EC", position: "relative", overflow: "hidden" }}>
            {/* header ornaments */}
            <div style={{ position: "absolute", left: 60, right: 60, top: 40, height: 6, background: c.ink }} />
            <div style={{ position: "absolute", left: 60, right: 60, top: 52, height: 2, background: c.ink }} />
            {/* title */}
            {[
              ["AMERICANS WITH", t1, 74],
              ["DISABILITIES ACT", t2, 164],
            ].map(([txt, p, top]) => (
              <div
                key={txt as string}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: top as number,
                  textAlign: "center",
                  fontFamily: theme.fonts.display,
                  fontSize: 82,
                  lineHeight: 1,
                  color: c.ink,
                  letterSpacing: "0.01em",
                  clipPath: `inset(0 ${100 - (p as number)}% 0 0)`,
                  transform: `translateX(${interpolate(p as number, [0, 100], [-30, 0])}px)`,
                }}
              >
                {txt}
              </div>
            ))}
            <div
              style={{
                position: "absolute",
                left: 60,
                top: 266,
                width: DOC.w - 120,
                height: 5,
                background: c.ink,
                transform: `scaleX(${rule})`,
                transformOrigin: "50% 50%",
              }}
            />
            {/* body text lines */}
            {BODY.map((w, i) => {
              const p = prog(frame, LINES + i * 2, LINES + i * 2 + 9);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: 60,
                    top: 300 + i * 30,
                    width: (DOC.w - 120) * w,
                    height: 11,
                    borderRadius: 6,
                    background: c.inkSoft,
                    opacity: 0.55,
                    transform: `scaleX(${p})`,
                    transformOrigin: "0 50%",
                  }}
                />
              );
            })}
            {/* signature baseline */}
            <div
              style={{
                position: "absolute",
                left: 60,
                top: 690,
                width: 300,
                height: 3,
                background: c.ink,
                transform: `scaleX(${sigLine})`,
                transformOrigin: "0 50%",
              }}
            />
            <div style={{ position: "absolute", left: 60, top: 704, width: 120, height: 8, borderRadius: 4, background: c.inkSoft, opacity: 0.4 * sigLine }} />
          </div>
        </Cutout>

        {/* ink signature (outside Cutout so the white border doesn't outline it) */}
        <svg width={DOC.w} height={DOC.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {sig > 0 && (
            <polyline
              points={SIG_PTS.slice(0, nShown + 1)
                .map((p) => `${p.x},${p.y}`)
                .join(" ")}
              fill="none"
              stroke={c.ink}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {/* flourish underline after signing */}
          <path d="M60 682 Q 200 664 350 676" fill="none" stroke={c.ink} strokeWidth={4} strokeLinecap="round" style={drawOn(prog(frame, SIGN_B - 2, SIGN_B + 4), 300)} opacity={frame >= SIGN_B - 2 ? 1 : 0} />
        </svg>

        {/* wax seal stamp */}
        {frame >= SEAL && (
          <div
            style={{
              position: "absolute",
              left: SEAL_POS.x - 130,
              top: SEAL_POS.y - 130,
              transform: `scale(${interpolate(seal, [0, 1], [2.6, 1])}) rotate(${interpolate(seal, [0, 1], [-30, 8])}deg)`,
              opacity: interpolate(seal, [0, 0.12], [0, 1], clamp),
              filter: `drop-shadow(${stampShadow * 0.5}px ${stampShadow}px 0 rgba(30,29,27,0.3))`,
            }}
          >
            <WaxSeal size={260} />
          </div>
        )}
        <Burst x={SEAL_POS.x} y={SEAL_POS.y} delay={SEAL + 1} count={16} radius={300} />

        {/* fountain pen */}
        {frame >= PEN_IN && penOut < 1 && (
          <div
            style={{
              position: "absolute",
              left: penX - PEN_TIP.x * (300 / 300),
              top: penY - PEN_TIP.y + penLift,
              opacity: interpolate(penIn, [0, 0.15], [0, 1], clamp),
            }}
          >
            <Cutout border={5} shadow={10}>
              <FountainPen height={300} />
            </Cutout>
          </div>
        )}
      </div>

      {/* sfx */}
      <Sfx at={0} name="whoosh" volume={0.3} />
      <Sfx at={TITLE - 2} name="pop" volume={0.3} />
      <Sfx at={PEN_IN - 2} name="whoosh" volume={0.3} />
      <Sfx at={SIGN_A - 2} name="click" volume={0.3} />
      <Sfx at={SEAL - 3} name="bass" volume={0.55} />
      <Sfx at={SEAL - 1} name="click" volume={0.4} />
    </AbsoluteFill>
  );
};
