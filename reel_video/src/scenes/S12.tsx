import { useSceneFrame as useCurrentFrame } from "../time";
// Scene 12 — "So next time you're smashing that button, remember."  (LOOPS into S01)
// Collage recap whip (host / doors / pill fly past in parallax) → yellow circle + close button slam into
// S01's exact placement → ink "remember" rings → the hand rises, cocks and is mid-jab on the last frame,
// on the exact trajectory S01 continues from. No fade, no end card.
import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";
import { CloseButton, ElevatorDoors, Host } from "../components/illustrations";
import { Cutout, Halftone, Tape, clamp, useShake } from "../components/lib";
import { HERO_BUTTON, HERO_HAND, HandAt } from "./S01";
import { Pill, Sfx } from "./c/props";

const c = theme.colors;
const B = HERO_BUTTON;
/** S01 frame-0 circle radius (S01: size * 0.68 * 0.82 at frame 0). */
const END_R = B.size * 0.68 * 0.82;

/** S01's jab offset formula, evaluated at S01-local frame k (negative = before the loop point). */
const s01JabOffset = (k: number) => {
  const local = (((k - 2) % 12) + 12) % 12;
  if (local <= 4) return interpolate(local, [0, 4], [0, 150], { ...clamp, easing: theme.ease.out });
  return interpolate(local, [4, 12], [150, 0], { ...clamp, easing: theme.ease.in });
};

/** One collage piece whipping across the frame left→right. */
const Flyby: React.FC<{ start: number; len: number; y: number; scale: number; rot: number; children: React.ReactNode }> = ({
  start,
  len,
  y,
  scale,
  rot,
  children,
}) => {
  const frame = useCurrentFrame();
  if (frame < start - 1 || frame > start + len + 1) return null;
  // whip in (fast) → drift through centre → whip out (faster)
  const posAt = (fr: number) => {
    const inP = interpolate(fr, [start, start + 4], [0, 1], { ...clamp, easing: theme.ease.out });
    const drift = interpolate(fr, [start + 4, start + len - 3], [0, 1], { ...clamp, easing: theme.ease.inOut });
    const outP = interpolate(fr, [start + len - 3, start + len], [0, 1], { ...clamp, easing: theme.ease.in });
    return -760 + inP * (760 + 470) + drift * 140 + outP * 1300;
  };
  const x = posAt(frame);
  const vel = Math.abs(posAt(frame + 1) - x);
  const p = interpolate(frame, [start, start + len], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rot + p * 24}deg) scale(${scale})`,
        filter: `blur(${Math.min(14, vel / 40)}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const S12: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const last = durationInFrames - 1;
  const f = (s: number) => Math.round(s * fps);
  const T = {
    circle: f(0.5), // 15
    button: f(0.63), // 19
    ring1: f(1.0), // 30
    ring2: f(1.3), // 39
    hand: f(1.33), // 40
    jab: last - 5, // hand joins S01's jab trajectory here
  };

  // circle + halftone + button build
  const circP = spring({ frame: frame - T.circle, fps, config: theme.spring.bouncy });
  const settle = interpolate(frame, [last - 14, last], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const breathe = Math.sin(frame / 8) * 0.025 * (1 - settle);
  const circleR = END_R * circP * (1 + breathe);
  const btnP = spring({ frame: frame - T.button, fps, config: theme.spring.slam });
  const btnShake = useShake(T.button + 3, 20, 10);
  const ht = interpolate(frame, [T.circle, T.circle + 8], [0, 1], { ...clamp, easing: theme.ease.out });

  // camera push-in, accelerating into the cut (no slowdown), ends exactly at S01's framing
  const cam = interpolate(frame, [T.circle, last], [0.93, 1], { ...clamp, easing: theme.ease.in });

  // hand: rise + cock (decelerating), then S01's own accelerating jab curve for the last frames
  const handOffset =
    frame >= T.jab
      ? s01JabOffset(frame - durationInFrames)
      : interpolate(frame, [T.hand, T.jab], [900, s01JabOffset(T.jab - durationInFrames)], { ...clamp, easing: theme.ease.out });
  const handVisible = frame >= T.hand;

  // "remember" ink rings
  const rings = [T.ring1, T.ring2].map((s, i) => {
    const t = frame - s;
    if (t < 0 || t > 12) return null;
    const q = interpolate(t, [0, 12], [0, 1], { ...clamp, easing: theme.ease.out });
    const r = END_R * (1.02 + q * 0.4);
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
          border: `${(1 - q) * 14}px solid ${c.ink}`,
          opacity: 1 - q,
        }}
      />
    );
  });
  const ringPunch = [T.ring1, T.ring2].reduce((a, s) => a + interpolate(frame - s, [0, 2, 8], [0, 0.04, 0], clamp), 0);

  return (
    <AbsoluteFill>
      <Sfx at={0} name="whoosh" volume={0.4} />
      <Sfx at={5} name="whoosh" volume={0.3} />
      <Sfx at={T.circle - 2} name="pop" volume={0.45} />
      <Sfx at={T.button + 1} name="bass" volume={0.5} />
      <Sfx at={T.ring1 - 2} name="tick" volume={0.4} />
      <Sfx at={T.ring2 - 2} name="tick" volume={0.4} />
      <Sfx at={durationInFrames - 27} name="riser" volume={0.45} />

      {/* ===== recap whip ===== */}
      <Flyby start={-3} len={11} y={1080} scale={1} rot={-14}>
        <Cutout border={9} shadow={18}>
          <Host height={900} mood="annoyed" armAngle={-30} />
        </Cutout>
      </Flyby>
      <Flyby start={6} len={10} y={860} scale={0.75} rot={8}>
        <Cutout border={8} shadow={16}>
          <ElevatorDoors width={560} height={740} open={0.4} />
        </Cutout>
      </Flyby>
      <Flyby start={13} len={9} y={1180} scale={0.7} rot={-20}>
        <Cutout border={8} shadow={14}>
          <Pill width={620} />
        </Cutout>
      </Flyby>

      {/* ===== the button, S01 placement ===== */}
      <AbsoluteFill style={{ transform: `scale(${cam}) translate(${btnShake.x}px, ${btnShake.y}px)`, transformOrigin: `${B.x}px ${B.y}px` }}>
        <Halftone
          size={20}
          opacity={0.22}
          style={{ left: B.x - 470, top: B.y - 330, width: 520, height: 520, borderRadius: "50%", transform: `scale(${ht})` }}
        />
        {rings}
        {circP > 0.001 && (
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
        )}
        {btnP > 0.001 && (
          <div
            style={{
              position: "absolute",
              left: B.x - B.size / 2,
              top: B.y - B.size / 2,
              opacity: interpolate(btnP, [0, 0.15], [0, 1], clamp),
              transform: `scale(${interpolate(btnP, [0, 1], [2.2, 1]) + ringPunch * (1 - settle)}) rotate(${interpolate(btnP, [0, 1], [-10, 0])}deg)`,
            }}
          >
            <Cutout border={9} shadow={18}>
              <CloseButton size={B.size} />
            </Cutout>
          </div>
        )}
        {/* tape tab that peels away before the loop point */}
        {frame >= T.button + 4 && frame < last - 8 && (
          <div style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [last - 14, last - 8], [1, 0], { ...clamp, easing: theme.ease.in }) }}>
            <Tape x={B.x - 230} y={B.y - 250} rot={-38} />
          </div>
        )}
        {handVisible && <HandAt tipX={HERO_HAND.tipX} tipY={HERO_HAND.tipY + handOffset} width={HERO_HAND.width} rot={HERO_HAND.rot} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
