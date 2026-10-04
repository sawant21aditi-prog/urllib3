import { useSceneFrame as useCurrentFrame } from "../time";
// Scene 11 — "Firefighters. Turn their special key, and it works again."
// Firefighter cutout slams in on a red disc and flashes the key → whip pan to the panel: brass key slides
// into the red keyswitch, turns 90°, the close button lights up (ding + burst) → pull-out, doors SNAP shut.
import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { CloseButton, ElevatorDoors } from "../components/illustrations";
import { Burst, Cutout, Halftone, SceneExit, Slam, Tape, clamp, useShake } from "../components/lib";
import { BrassKey, Firefighter, KeySwitch, Sfx } from "./c/props";

// world layout (px). Stage 1 = firefighter, stage 2 = panel, stage 3 = doors.
const FF = { x: 540, y: 990 };
const PANEL = { x: 1620, y: 980, w: 480, h: 800 };
const BTN = { size: 300, lx: 90, ly: 40 };
const PLATE = { size: 320, lx: 80, ly: 400 };
const CYL = { x: PANEL.x - PANEL.w / 2 + PLATE.lx + PLATE.size * 0.5, y: PANEL.y - PANEL.h / 2 + PLATE.ly + PLATE.size * 0.56 };
const DOORS = { x: 2600, y: 980, w: 600, h: 790 };
const KEY_L = 240;

export const S11: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const T = {
    slam: 0,
    arm: f(0.4), // 12
    glint: f(0.6), // 18
    whip: f(0.87), // 26
    whipEnd: f(1.13), // 34
    keyIn: f(1.2), // 36
    keyEnd: f(1.6), // 48
    turn: f(1.73), // 52
    turnEnd: f(1.93), // 58
    glow: f(2.2), // 66  ("works again")
    pull: f(2.43), // 73
    pullEnd: f(2.63), // 79
    doors: f(2.63), // 79
    doorsEnd: f(2.8), // 84
  };

  // ---- camera ----
  const whip = interpolate(frame, [T.whip, T.whipEnd], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const pull = interpolate(frame, [T.pull, T.pullEnd], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const camX = 540 + whip * (PANEL.x - 540) + pull * ((PANEL.x + DOORS.x) / 2 - PANEL.x);
  const camS = 1 - pull * 0.38;
  const whipVel = Math.abs(
    interpolate(frame + 1, [T.whip, T.whipEnd], [0, 1], { ...clamp, easing: theme.ease.inOut }) - whip,
  );
  const blur = whipVel * 120;
  const shake1 = useShake(3, 24, 10);
  const shakeT = useShake(T.turnEnd, 6, 6);
  const shakeD = useShake(T.doorsEnd, 22, 10);
  const sh = { x: shake1.x + shakeT.x + shakeD.x, y: shake1.y + shakeT.y + shakeD.y };

  // ---- stage 1: firefighter ----
  const disc = spring({ frame: frame - 2, fps, config: theme.spring.bouncy });
  const armUp = spring({ frame: frame - T.arm, fps, config: theme.spring.snappy });
  const glint = spring({ frame: frame - T.glint, fps, config: theme.spring.snappy }) * interpolate(frame, [T.glint + 6, T.glint + 12], [1, 0], { ...clamp, easing: theme.ease.in });
  const breathe = 1 + Math.sin(frame / 9) * 0.012;

  // ---- stage 2: key + switch + button ----
  const keyP = interpolate(frame, [T.keyIn, T.keyEnd], [0, 1], { ...clamp, easing: theme.ease.out });
  const keySlide = (1 - keyP) * 620;
  const turn = interpolate(frame, [T.turn, T.turnEnd], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const glowP = spring({ frame: frame - T.glow, fps, config: theme.spring.bouncy });
  const glow = Math.min(1, glowP) * (frame >= T.glow ? 1 : 0);
  const btnPunch = frame >= T.glow ? 1 + 0.12 * Math.sin(Math.min(1, (frame - T.glow) / 8) * Math.PI) : 1;

  // ---- stage 3: doors ----
  const doorOpen = interpolate(frame, [T.doors, T.doorsEnd], [1, 0], { ...clamp, easing: theme.ease.in });

  const w2s = (wx: number, wy: number) => ({ x: 540 + (wx - camX) * camS, y: 960 + (wy - 960) * camS });

  return (
    <AbsoluteFill>
      <Sfx at={0} name="bass" volume={0.55} />
      <Sfx at={T.glint - 2} name="tick" volume={0.4} />
      <Sfx at={T.keyIn - 2} name="whoosh" volume={0.25} />
      <Sfx at={T.turn - 2} name="click" volume={0.6} />
      <Sfx at={T.turnEnd - 2} name="click" volume={0.5} />
      <Sfx at={T.glow - 2} name="ding" volume={0.5} />
      <Sfx at={T.doorsEnd - 3} name="bass" volume={0.5} />
      <SceneExit durationInFrames={durationInFrames} len={6}>
        <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 4000,
              height: 1920,
              transformOrigin: "0 0",
              transform: `translate(${540 - camX * camS}px, ${960 - 960 * camS}px) scale(${camS})`,
            }}
          >
            {/* ===== stage 1 ===== */}
            <div
              style={{
                position: "absolute",
                left: FF.x - 380,
                top: FF.y - 400,
                width: 760,
                height: 760,
                borderRadius: "50%",
                background: theme.colors.fire,
                transform: `scale(${disc})`,
              }}
            />
            {/* ink speed rays */}
            <svg width={1400} height={1400} viewBox="-700 -700 1400 1400" style={{ position: "absolute", left: FF.x - 700, top: FF.y - 720, opacity: disc * (1 - whip), transform: `rotate(${frame * 0.8}deg)` }}>
              {Array.from({ length: 14 }).map((_, i) => {
                const a = (i / 14) * Math.PI * 2;
                const r1 = 440 + (i % 2) * 40;
                const r2 = 580;
                const d = 0.05;
                return (
                  <polygon
                    key={i}
                    points={`${Math.cos(a) * r1},${Math.sin(a) * r1} ${Math.cos(a - d) * r2},${Math.sin(a - d) * r2} ${Math.cos(a + d) * r2},${Math.sin(a + d) * r2}`}
                    fill={theme.colors.ink}
                    opacity={0.85}
                  />
                );
              })}
            </svg>
            <Halftone color={theme.colors.ink} size={16} opacity={0.18} style={{ left: FF.x - 380, top: FF.y - 400, width: 760, height: 760, borderRadius: "50%" }} />
            <div style={{ position: "absolute", left: FF.x - 260, top: FF.y - 440, transform: `scale(${breathe})`, transformOrigin: "50% 100%" }}>
              <Slam rot={-8}>
                <Cutout border={9} shadow={20}>
                  <Firefighter height={840} armUp={armUp} glint={glint} />
                </Cutout>
              </Slam>
            </div>
            <Tape x={FF.x - 250} y={FF.y - 330} rot={-35} />

            {/* ===== stage 2 ===== */}
            <div style={{ position: "absolute", left: PANEL.x - PANEL.w / 2, top: PANEL.y - PANEL.h / 2, transform: `rotate(-1.5deg)` }}>
              <Cutout border={8} shadow={18}>
                <svg width={PANEL.w} height={PANEL.h} viewBox={`0 0 ${PANEL.w} ${PANEL.h}`}>
                  <rect width={PANEL.w} height={PANEL.h} rx={24} fill={theme.colors.paperDark} />
                  <rect x={18} y={18} width={PANEL.w - 36} height={PANEL.h - 36} rx={14} fill="none" stroke={theme.colors.inkSoft} strokeWidth={3} strokeDasharray="10 8" />
                </svg>
              </Cutout>
              <div style={{ position: "absolute", left: BTN.lx, top: BTN.ly, transform: `scale(${btnPunch})` }}>
                <CloseButton size={BTN.size} glow={glow} />
              </div>
              <div style={{ position: "absolute", left: PLATE.lx, top: PLATE.ly }}>
                <KeySwitch size={PLATE.size} turn={turn} on={turn} />
              </div>
            </div>
            <Burst x={PANEL.x - PANEL.w / 2 + BTN.lx + BTN.size / 2} y={PANEL.y - PANEL.h / 2 + BTN.ly + BTN.size / 2} delay={T.glow} count={16} radius={300} />
            {/* key: tip at cylinder centre, slides in from the right, then turns 90° */}
            {frame >= T.keyIn && (
              <div
                style={{
                  position: "absolute",
                  left: CYL.x + keySlide,
                  top: CYL.y - (KEY_L * 55) / 300,
                  transformOrigin: `0px ${(KEY_L * 55) / 300}px`,
                  transform: `rotate(${turn * 90}deg) scale(${1 + 0.06 * Math.sin(turn * Math.PI)})`,
                }}
              >
                <Cutout border={5} shadow={10}>
                  <BrassKey length={KEY_L} />
                </Cutout>
              </div>
            )}

            {/* ===== stage 3 ===== */}
            <div style={{ position: "absolute", left: DOORS.x - DOORS.w / 2, top: DOORS.y - DOORS.h / 2 }}>
              <Cutout border={8} shadow={18}>
                <ElevatorDoors width={DOORS.w} height={DOORS.h} open={doorOpen} inside={theme.colors.paper} />
              </Cutout>
            </div>
          </div>
          {/* "CLOSED." slap when doors shut */}
          {frame >= T.doorsEnd && (
            <ClosedStamp at={w2s(DOORS.x, DOORS.y + DOORS.h / 2 - 40)} start={T.doorsEnd} />
          )}
        </AbsoluteFill>
      </SceneExit>
    </AbsoluteFill>
  );
};

const ClosedStamp: React.FC<{ at: { x: number; y: number }; start: number }> = ({ at, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: theme.spring.slam });
  return (
    <div
      style={{
        position: "absolute",
        left: at.x - 150,
        top: at.y - 50,
        width: 300,
        textAlign: "center",
        fontFamily: theme.fonts.display,
        fontSize: 84,
        lineHeight: 1.1,
        color: theme.colors.white,
        background: theme.colors.ink,
        transform: `scale(${interpolate(p, [0, 1], [2, 1])}) rotate(${interpolate(p, [0, 1], [-14, -6])}deg)`,
        opacity: interpolate(p, [0, 0.2], [0, 1], clamp),
      }}
    >
      CLOSED.
    </div>
  );
};
