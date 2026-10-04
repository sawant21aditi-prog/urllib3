import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { RealReel } from "./real/RealReel";
import timing from "./data/timing.json";

const FPS = 30;
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={Math.round(timing.total * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="RealReel" component={RealReel} durationInFrames={Math.round(timing.total * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
