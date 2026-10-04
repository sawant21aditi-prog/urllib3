// Scene 02 — placeholder. Animator agents replace this file.
import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneProps } from "../types";
import { theme } from "../theme";

export const S02: React.FC<SceneProps> = ({ beat }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: theme.fonts.display, fontSize: 90, color: theme.colors.inkSoft, opacity: 0.4 }}>SCENE {beat.id}</div>
  </AbsoluteFill>
);
