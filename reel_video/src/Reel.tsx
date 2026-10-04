import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import script from "./data/script.json";
import timing from "./data/timing.json";
import { SCENES } from "./scenes";
import { PaperBg, Grade, Grain, Vignette } from "./components/lib";
import { Headline, Subtitles, CutFlash } from "./components/overlays";
import { Beat } from "./types";
import "./fonts";

export const Reel: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const beats = script.beats as Beat[];
  const cuts = timing.beats.map((t) => ({
    from: Math.round(t.start * fps),
    dur: Math.round(t.duration * fps),
    speech: Math.round(t.speech * fps),
  }));
  return (
    <AbsoluteFill>
      <PaperBg />
      {beats.map((beat, i) => {
        const Scene = SCENES[i];
        const c = cuts[i];
        const dur = i === beats.length - 1 ? durationInFrames - c.from : c.dur;
        return (
          <Sequence key={beat.id} from={c.from} durationInFrames={dur} name={`S${beat.id}`}>
            <Scene beat={beat} durationInFrames={dur} speechFrames={c.speech} />
            <Headline text={beat.caption} highlight={beat.highlight} durationInFrames={dur} />
            <Subtitles text={beat.narration} speechFrames={c.speech} />
            {i > 0 && <CutFlash />}
          </Sequence>
        );
      })}
      {/* whoosh 3 frames before every cut */}
      {cuts.slice(1).map((c, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, c.from - 3)} durationInFrames={15}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
        </Sequence>
      ))}
      <Audio src={staticFile("audio/vo.wav")} volume={1} />
      <Audio src={staticFile("sfx/music.wav")} volume={0.13} />
      <Grade />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
