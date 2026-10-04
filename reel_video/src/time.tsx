// Per-scene time-stretch. Scenes were animated against a "design" duration; when the voiceover
// is re-timed, the Reel sets stretch = actual / design so every animation stays synced to the words.
import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";

const StretchContext = createContext(1);

export const SceneTime: React.FC<{ stretch: number; children: React.ReactNode }> = ({ stretch, children }) => (
  <StretchContext.Provider value={stretch}>{children}</StretchContext.Provider>
);

/** Real frames per design frame inside the current scene (1 outside scenes). */
export const useStretch = () => useContext(StretchContext);

/** Drop-in replacement for useCurrentFrame() that runs on the scene's design clock. */
export const useSceneFrame = () => useCurrentFrame() / useContext(StretchContext);
