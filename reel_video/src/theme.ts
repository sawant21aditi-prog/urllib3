// Single source of truth. NEVER inline colors, easings, or spring configs in components.
import { Easing } from "remotion";

export const theme = {
  colors: {
    paper: "#F3EBDD", // aged cream base
    paperDark: "#E6DAC4",
    ink: "#1E1D1B", // charcoal
    inkSoft: "#4A4741",
    hero: "#F5C518", // THE accent — max one hero element per frame
    brass: "#C9A646",
    brassDark: "#8C6F22",
    white: "#FFFFFF",
    fire: "#D7392B", // only for the firefighter beat
    tape: "rgba(245, 197, 24, 0.55)",
  },
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
    subtitleY: 1450, // subtitle baseline area
  },
} as const;
