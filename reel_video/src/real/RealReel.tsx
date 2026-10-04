// Photoreal version of the Reel: AI-generated stills (public/shots/NN.png) + cinematic camera moves,
// light leaks, grade, kinetic headline and subtitles. Same voiceover, timing and loop as the collage cut.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import script from "../data/script.json";
import timing from "../data/timing.json";
import available from "../data/shots_available.json";
import { theme } from "../theme";
import { clamp } from "../components/lib";
import { Headline, Subtitles } from "../components/overlays";
import { Beat } from "../types";
import "../fonts";

type Move = "punch" | "pushIn" | "pullOut" | "panLeft" | "panRight" | "shake";
const MOVES: Move[] = ["punch", "pushIn", "panLeft", "pullOut", "pushIn", "panRight"];

// Each beat may set shot (image file in public/shots), cam (camera move) and sfx in script.json.
// Defaults: shot NN.png by playback order, moves cycle so consecutive shots never feel the same,
// and the LAST beat reuses the first beat's image for a seamless loop.
const direction = (beat: Beat & { shot?: string; cam?: string; sfx?: string }, i: number, beats: Beat[]) => {
  const first = beats[0] as Beat & { shot?: string };
  const isLast = i === beats.length - 1;
  return {
    file: beat.shot ?? (isLast ? first.shot ?? "01.png" : `${String(i + 1).padStart(2, "0")}.png`),
    move: (beat.cam as Move) ?? (i === 0 ? "punch" : MOVES[i % MOVES.length]),
    sfx: beat.sfx,
  };
};

const Shot: React.FC<{ file: string; move: Move; dur: number; isLast: boolean }> = ({ file, move, dur, isLast }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, dur], [0, 1], { ...clamp, easing: theme.ease.inOut });
  // cut-in: every shot lands slightly oversized and settles (feels like a cinematic punch cut)
  const settle = interpolate(frame, [0, 10], [1.06, 1], { ...clamp, easing: theme.ease.out });
  let scale = 1.0, x = 0, y = 0;
  if (move === "punch") scale = 1.12 - 0.06 * p;
  if (move === "pushIn") scale = 1.02 + 0.1 * p;
  if (move === "pullOut") scale = 1.14 - 0.1 * p;
  if (move === "panLeft") { scale = 1.12; x = 40 - 80 * p; }
  if (move === "panRight") { scale = 1.12; x = -40 + 80 * p; }
  if (move === "shake") {
    scale = 1.1;
    const t = Math.floor(frame / 2);
    x = (random(`x${t}`) - 0.5) * 18;
    y = (random(`y${t}`) - 0.5) * 18;
  }
  // last beat ends exactly on beat 1's opening framing (punch starts at 1.12 * 1.06 settle) for the loop
  if (isLast) scale = interpolate(frame, [0, dur], [1.02, 1.12 * 1.06], { ...clamp, easing: theme.ease.in });
  const has = (available as string[]).includes(file);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale * (isLast ? 1 : settle)}) translate(${x}px, ${y}px)` }}>
      {has ? (
        <Img src={staticFile(`shots/${file}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <AbsoluteFill
          style={{
            background: "radial-gradient(ellipse at 50% 45%, #3a3f4a, #0d0f13 70%)",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.fonts.display,
            fontSize: 80,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          {`SHOT ${file}`}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** Warm light-leak sweep across each cut. */
const LightLeak: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 3, 12], [0, 0.55, 0], clamp);
  const x = interpolate(frame, [0, 12], [-30, 110], clamp);
  const hue = seed % 2 ? "255,140,60" : "255,90,140";
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: o,
        background: `radial-gradient(ellipse 60% 90% at ${x}% 40%, rgba(${hue},0.9), transparent 60%)`,
      }}
    />
  );
};

/** Cinematic grade: contrast curve, teal shadows / warm highlights, vignette, grain. */
const CineGrade: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,60,80,0.18), transparent 40%, rgba(255,150,60,0.10))", mixBlendMode: "soft-light" }} />
      {/* darken top + bottom so white headline/subtitles always read over any photo */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.30) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.25) 100%)" }} />
      <AbsoluteFill
        style={{
          backgroundImage: noise,
          backgroundSize: "220px",
          backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
          opacity: 0.08,
          mixBlendMode: "overlay",
        }}
      />
    </AbsoluteFill>
  );
};

export const RealReel: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const beats = script.beats as Beat[];
  const cuts = timing.beats.map((t) => ({ from: Math.round(t.start * fps), dur: Math.round(t.duration * fps), speech: Math.round(t.speech * fps) }));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {beats.map((beat, i) => {
        const c = cuts[i];
        const dur = i === beats.length - 1 ? durationInFrames - c.from : c.dur;
        const d = direction(beat, i, beats);
        return (
          <Sequence key={beat.id} from={c.from} durationInFrames={dur} name={`R${beat.id}`}>
            <Shot file={d.file} move={d.move} dur={dur} isLast={i === beats.length - 1} />
            {i > 0 && <LightLeak seed={i} />}
            {d.sfx && (
              <Sequence from={0} durationInFrames={40}>
                <Audio src={staticFile(`sfx/${d.sfx}.wav`)} volume={0.35} />
              </Sequence>
            )}
            <CineGrade />
            <Headline
              text={beat.caption}
              highlight={beat.highlight}
              durationInFrames={dur}
              lead={i === 0 ? 8 : 0}
              accent={theme.sceneColors[i % theme.sceneColors.length].accent}
              variant="photo"
            />
            <Subtitles text={beat.narration} speechFrames={c.speech} />
          </Sequence>
        );
      })}
      {cuts.slice(1).map((c, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, c.from - 3)} durationInFrames={15}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} />
        </Sequence>
      ))}
      <Audio src={staticFile("audio/vo.wav")} volume={1} />
      <Audio src={staticFile("sfx/music.wav")} volume={0.12} />
    </AbsoluteFill>
  );
};
