import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { RealReel } from "./real/RealReel";
import { VoxReel } from "./vox/VoxReel";
import { CollageReel } from "./collage/CollageReel";
import { Avatar } from "./brand/Avatar";
import timing from "./data/timing.json";
import docScript from "./data/doc/script.json";
import docTiming from "./data/doc/timing.json";

const FPS = 30;
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={Math.round(timing.total * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="RealReel" component={RealReel} durationInFrames={Math.round(timing.total * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="VoxReel" component={VoxReel} durationInFrames={Math.round(timing.total * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="CollageReel" component={CollageReel} durationInFrames={Math.round(timing.total * FPS)} fps={FPS} width={1080} height={1920} />
    {/* long-form YouTube pilot: same collage engine, 16:9 */}
    <Composition id="CollageDoc" component={CollageReel} durationInFrames={Math.max(30, Math.round(docTiming.total * FPS))} fps={FPS} width={1920} height={1080}
      defaultProps={{ beatsData: docScript, timingData: docTiming, vo: "audio/doc_vo.wav" }} />
    <Composition id="Avatar" component={Avatar} durationInFrames={1} fps={30} width={1080} height={1080} />
  </>
);
