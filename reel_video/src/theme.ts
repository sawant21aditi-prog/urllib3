// Single source of truth. NEVER inline colors, easings, or spring configs in components.
import { Easing } from "remotion";

export const theme = {
  colors: {
    paper: "#F3EBDD", // aged cream base
    paperDark: "#E6DAC4",
    ink: "#1E1D1B", // charcoal
    inkSoft: "#4A4741",
    hero: "#F5C518", // signature yellow (the button); scenes add colour via theme.pop / sceneColors
    brass: "#C9A646",
    brassDark: "#8C6F22",
    white: "#FFFFFF",
    fire: "#D7392B", // only for the firefighter beat
    tape: "rgba(245, 197, 24, 0.55)",
  },
  // Vivid multi-colour palette for confetti, tape, accents.
  pop: ["#FF5C8A", "#3DA5FF", "#2EC4A6", "#FFB020", "#9B6BFF", "#FF7A45", "#7ED957"],
  // Per-scene background + headline highlight, in playback order (S01, S13, S02 … S12).
  // Last entry matches the first so the loop stays seamless.
  sceneColors: [
    { bg: "#8FD3FE", accent: "#F5C518" }, // S01 sky blue
    { bg: "#FF8FB8", accent: "#F5C518" }, // S13 hot pink
    { bg: "#8BE3B5", accent: "#FF5C8A" }, // S02 mint
    { bg: "#BBA9F7", accent: "#F5C518" }, // S03 lavender
    { bg: "#FFA184", accent: "#3DA5FF" }, // S04 coral
    { bg: "#74D9E3", accent: "#FF5C8A" }, // S05 aqua
    { bg: "#C9EC7E", accent: "#9B6BFF" }, // S06 lime
    { bg: "#A3B8FF", accent: "#F5C518" }, // S07 periwinkle
    { bg: "#FFBE85", accent: "#3DA5FF" }, // S08 peach
    { bg: "#6DD3BF", accent: "#FF5C8A" }, // S09 teal
    { bg: "#1E1D1B", accent: "#F5C518" }, // S10 dark (scene draws its own field)
    { bg: "#86CCFF", accent: "#FF7A45" }, // S11 sky
    { bg: "#8FD3FE", accent: "#F5C518" }, // S12 sky blue = S01 for the loop
  ],
  fonts: {
    display: "Anton", // condensed editorial headlines
    body: "Montserrat",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
    slam: { damping: 9, stiffness: 260, mass: 0.6 },
  },
  // 1080x1920 layout zones (px). Keep critical content inside them.
  zones: {
    headlineTop: 250, // headline block starts here (IG top UI above)
    visualTop: 560,
    visualBottom: 1380,
    subtitleY: 1290, // subtitle top; bottom edge ≈1380, clear of IG caption + buttons
  },
} as const;
