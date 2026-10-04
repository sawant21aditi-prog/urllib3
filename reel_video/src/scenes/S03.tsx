import { useSceneFrame as useCurrentFrame } from "../time";
// Scene 03 — "To understand why, you have to go back to 1990."
// VHS rewind whip: calendar pages flip back 2026→1990, 1990 slams + tape snaps; Capitol photo slides in; yellow marker circles 1990.
import React from "react";
import { AbsoluteFill, interpolate, random, useVideoConfig } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { Burst, Cutout, Halftone, Tape, clamp, drawOn, useShake, useSpring } from "../components/lib";
import { CalendarPage, CapitolPhoto, Sfx, prog } from "./a/props";

const c = theme.colors;

const CAL = { x: 540, y: 950, w: 520 }; // center
const CAL_H = (CAL.w * 620) / 520;
const RW_START = 14;
const RW_END = 40;
const SLAM = 41;
const MOVE = 54;
const CAPITOL = 58;
const MARK = 78;

export const S03: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- calendar drop-in ---
  const drop = useSpring(0, "slam");
  // --- rewind ---
  const rewinding = frame >= RW_START && frame < RW_END + 1;
  const yf = interpolate(frame, [RW_START, RW_END], [2026, 1990], { ...clamp, easing: theme.ease.inOut });
  const topYear = Math.ceil(yf - 1e-6);
  const underYear = Math.floor(yf + 1e-6);
  const flipP = topYear - yf; // 0..1 how far the top page has flipped away
  const jitterX = rewinding ? (random(`jx${frame}`) * 2 - 1) * 22 : 0;
  const jitterY = rewinding ? (random(`jy${frame}`) * 2 - 1) * 6 : 0;
  const rwBlur = rewinding ? interpolate(Math.abs(yf - 2008), [0, 18], [5, 0], clamp) : 0;

  // --- slam on 1990 ---
  const slam = useSpring(SLAM, "slam");
  const slamScale = frame >= SLAM ? interpolate(slam, [0, 1], [1.18, 1]) : 1;
  const shake = useShake(SLAM, 30, 14);
  const tapeIn = useSpring(SLAM + 3, "slam");

  // --- move aside + capitol ---
  const move = useSpring(MOVE, "smooth");
  const capIn = useSpring(CAPITOL, "snappy");
  const capTape = useSpring(CAPITOL + 8, "slam");
  const capDraw = prog(frame, CAPITOL + 4, CAPITOL + 22);
  const mark = prog(frame, MARK, MARK + 12, theme.ease.inOut);

  // --- REW badge (hero yellow) ---
  const badgeIn = useSpring(RW_START - 4, "slam");
  const badgeOut = interpolate(frame, [RW_END - 2, RW_END + 3], [1, 0], { ...clamp, easing: theme.ease.in });
  const badgeBlink = Math.floor(frame / 4) % 2 === 0 ? 1 : 0.55;

  const breathe = Math.sin((frame / fps) * Math.PI * 1.2) * 0.008;
  const exit = interpolate(frame, [durationInFrames - 7, durationInFrames], [0, 1], { ...clamp, easing: theme.ease.in });

  const calTx = interpolate(move, [0, 1], [0, -175]);
  const calTy = interpolate(move, [0, 1], [0, -70]);
  const calS = interpolate(move, [0, 1], [1, 0.8]) * slamScale * (1 + breathe);
  const calR = interpolate(move, [0, 1], [0, -5]) + interpolate(drop, [0, 1], [-14, 0]);

  const showYear = frame < RW_START ? 2026 : frame >= RW_END ? 1990 : underYear;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shake.x + jitterX}px, ${shake.y + jitterY}px) rotate(${shake.r}deg) scale(${1 + exit * 0.1})`,
        opacity: 1 - exit * 0.35,
        filter: exit > 0 ? `blur(${exit * 6}px)` : undefined,
      }}
    >
      {/* halftone backing block */}
      <Halftone
        size={18}
        opacity={0.28}
        style={{ left: CAL.x - CAL.w / 2 + 50 + calTx, top: CAL.y - CAL_H / 2 + 60 + calTy, width: CAL.w, height: CAL_H }}
      />

      <Burst x={CAL.x} y={CAL.y - 40} delay={SLAM} count={18} radius={520} color={c.ink} />

      {/* calendar group */}
      <div
        style={{
          position: "absolute",
          left: CAL.x - CAL.w / 2,
          top: CAL.y - CAL_H / 2,
          width: CAL.w,
          height: CAL_H,
          transform: `translate(${calTx}px, ${calTy + interpolate(drop, [0, 1], [-900, 0])}px) scale(${calS}) rotate(${calR}deg)`,
          filter: rwBlur > 0.2 ? `blur(${rwBlur * 0.4}px)` : undefined,
          perspective: 1400,
        }}
      >
        <Cutout border={8} shadow={16}>
          <CalendarPage year={showYear} month={frame >= RW_END ? 6 : frame < RW_START ? 9 : (underYear * 7) % 12} width={CAL.w} />
        </Cutout>
        {/* page being torn back */}
        {rewinding && flipP > 0.02 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transformOrigin: "50% 8%",
              transform: `rotateX(${flipP * 120}deg)`,
              opacity: interpolate(flipP, [0, 0.6, 0.85], [1, 1, 0], clamp),
            }}
          >
            <CalendarPage year={topYear} month={(topYear * 7) % 12} width={CAL.w} />
          </div>
        )}
        {/* yellow marker circle around the year */}
        <svg width={CAL.w} height={CAL_H} viewBox="0 0 520 620" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path
            d="M262 172 C 420 160 486 222 470 282 C 452 350 120 362 58 300 C 14 252 84 176 236 168 C 300 165 340 170 372 182"
            fill="none"
            stroke={c.hero}
            strokeWidth={16}
            strokeLinecap="round"
            style={{ ...drawOn(mark, 1300), opacity: mark > 0 ? 1 : 0, mixBlendMode: "multiply" }}
          />
        </svg>
        {/* tape snaps on */}
        {frame >= SLAM + 3 && (
          <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${interpolate(tapeIn, [0, 1], [1.7, 1])})`, transformOrigin: "50% 0%", opacity: interpolate(tapeIn, [0, 0.2], [0, 1], clamp) }}>
            <Tape x={70} y={60} rot={-38} w={190} />
            <Tape x={CAL.w - 60} y={CAL_H - 40} rot={-30} w={170} />
          </div>
        )}
      </div>

      {/* VHS scanlines + tracking bands during rewind */}
      {rewinding && (
        <>
          <AbsoluteFill
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, rgba(30,29,27,0.10) 0px, rgba(30,29,27,0.10) 3px, transparent 3px, transparent 9px)`,
              backgroundPosition: `0 ${(frame * 23) % 9}px`,
            }}
          />
          {[0, 1].map((i) => {
            const y = 560 + random(`band${i}${Math.floor(frame / 2)}`) * 820;
            const h = 12 + random(`bh${i}${frame}`) * 40;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: y,
                  height: h,
                  background: i ? c.paper : c.ink,
                  opacity: i ? 0.75 : 0.18,
                  transform: `translateX(${(random(`bx${i}${frame}`) * 2 - 1) * 60}px)`,
                }}
              />
            );
          })}
        </>
      )}

      {/* REW badge — the hero yellow shape during the whip */}
      {frame >= RW_START - 4 && badgeOut > 0 && (
        <div
          style={{
            position: "absolute",
            left: 760,
            top: 580,
            transform: `scale(${interpolate(badgeIn, [0, 1], [0.2, 1]) * badgeOut}) rotate(${interpolate(badgeIn, [0, 1], [30, 6])}deg)`,
            opacity: badgeBlink,
          }}
        >
          <Cutout border={6} shadow={10}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 26px",
                background: c.hero,
                borderRadius: 10,
              }}
            >
              <svg width={92} height={56} viewBox="0 0 92 56">
                <polygon points="46,0 0,28 46,56" fill={c.ink} />
                <polygon points="92,0 46,28 92,56" fill={c.ink} />
              </svg>
              <span style={{ fontFamily: theme.fonts.display, fontSize: 62, color: c.ink, lineHeight: 1 }}>REW</span>
            </div>
          </Cutout>
        </div>
      )}

      {/* archival Capitol photo slides in */}
      {frame >= CAPITOL && (
        <div
          style={{
            position: "absolute",
            left: 590,
            top: 960,
            transform: `translateX(${interpolate(capIn, [0, 1], [620, 0])}px) rotate(${interpolate(capIn, [0, 1], [18, 5])}deg)`,
          }}
        >
          <Cutout border={6} shadow={14}>
            <CapitolPhoto width={430} draw={capDraw} />
          </Cutout>
          <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${interpolate(capTape, [0, 1], [1.8, 1])})`, opacity: interpolate(capTape, [0, 0.2], [0, 1], clamp) }}>
            <Tape x={215} y={0} rot={4} w={180} />
          </div>
        </div>
      )}

      {/* sfx */}
      <Sfx at={0} name="pop" volume={0.35} />
      <Sfx at={RW_START - 3} name="glitch" volume={0.4} />
      {Array.from({ length: 9 }).map((_, i) => (
        <Sfx key={i} at={RW_START + i * 3} name="tick" volume={0.28} />
      ))}
      <Sfx at={SLAM - 2} name="bass" volume={0.55} />
      <Sfx at={SLAM + 1} name="pop" volume={0.35} />
      <Sfx at={CAPITOL - 3} name="whoosh" volume={0.35} />
      <Sfx at={CAPITOL + 6} name="click" volume={0.3} />
      <Sfx at={MARK - 2} name="ding" volume={0.3} />
    </AbsoluteFill>
  );
};
