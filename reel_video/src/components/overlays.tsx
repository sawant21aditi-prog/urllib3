// Global text layers driven by script.json — scenes never draw these.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme } from "../theme";
import { clamp } from "./lib";

/** Vox-style kinetic headline in the top zone: words slam in, highlight word on a yellow pill. */
export const Headline: React.FC<{ text: string; highlight: string; durationInFrames: number; lead?: number; accent?: string }> = ({
  text,
  highlight,
  durationInFrames,
  lead = 0,
  accent = theme.colors.hero,
}) => {
  // lead > 0 starts the entrance already in progress (hook text visible on frame 0)
  const frame = useCurrentFrame() + lead;
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const exit = interpolate(frame - lead, [durationInFrames - 6, durationInFrames], [0, 1], { ...clamp, easing: theme.ease.in });
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          marginTop: theme.zones.headlineTop,
          width: 960,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "6px 22px",
          transform: `translateY(${-exit * 40}px)`,
          opacity: 1 - exit,
        }}
      >
        {words.map((w, i) => {
          const p = spring({ frame: frame - i * 3, fps, config: theme.spring.slam });
          const isHi = w.replace(/[^A-Z0-9+]/gi, "") === highlight.replace(/[^A-Z0-9+]/gi, "");
          const pill = spring({ frame: frame - i * 3 - 5, fps, config: theme.spring.snappy });
          return (
            <span
              key={i}
              style={{
                position: "relative",
                display: "inline-block",
                fontFamily: theme.fonts.display,
                fontSize: words.length > 3 ? 118 : 138,
                lineHeight: 1.08,
                letterSpacing: "0.01em",
                color: theme.colors.ink,
                opacity: interpolate(p, [0, 0.2], [0, 1], clamp),
                transform: `translateY(${interpolate(p, [0, 1], [70, 0])}px) scale(${interpolate(p, [0, 1], [1.5, 1])}) rotate(${interpolate(p, [0, 1], [i % 2 ? 6 : -6, 0])}deg)`,
                padding: "0 10px",
              }}
            >
              {isHi && (
                <span
                  style={{
                    position: "absolute",
                    inset: "8px -4px 4px -4px",
                    background: accent,
                    transform: `scaleX(${pill}) rotate(-2deg)`,
                    transformOrigin: "left center",
                    zIndex: -1,
                    boxShadow: `6px 8px 0 ${theme.colors.ink}`,
                  }}
                />
              )}
              <span style={{ WebkitTextStroke: `3px ${theme.colors.white}`, paintOrder: "stroke fill" }}>{w}</span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Burned-in narration subtitles (for muted viewers): 2–4 word chunks, active chunk pops. */
export const Subtitles: React.FC<{ text: string; speechFrames: number }> = ({ text, speechFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const chunks: string[][] = [];
  for (let i = 0; i < words.length; ) {
    const n = words.length - i <= 4 ? words.length - i : 3;
    chunks.push(words.slice(i, i + n));
    i += n;
  }
  const totalChars = words.join(" ").length;
  let acc = 0;
  const spans = chunks.map((ch) => {
    const len = ch.join(" ").length;
    const s = (acc / totalChars) * speechFrames;
    acc += len + 1;
    return { ch, s, e: (acc / totalChars) * speechFrames };
  });
  const cur = spans.findIndex((sp, i) => frame >= sp.s && (frame < sp.e || i === spans.length - 1));
  if (cur < 0) return null;
  const sp = spans[cur];
  const p = spring({ frame: frame - sp.s, fps, config: theme.spring.snappy });
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: theme.zones.subtitleY,
          width: 940,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 900,
          fontSize: 62,
          lineHeight: 1.15,
          color: theme.colors.white,
          WebkitTextStroke: `10px ${theme.colors.ink}`,
          paintOrder: "stroke fill",
          transform: `scale(${interpolate(p, [0, 1], [0.8, 1])}) translateY(${interpolate(p, [0, 1], [16, 0])}px)`,
          opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        }}
      >
        {sp.ch.join(" ")}
      </div>
    </AbsoluteFill>
  );
};

/** 2-frame white flash on every cut. */
export const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 3], [0.55, 0], clamp);
  return <AbsoluteFill style={{ background: theme.colors.white, opacity: o, pointerEvents: "none" }} />;
};
