import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { RealReel } from "./real/RealReel";
import { VoxReel } from "./vox/VoxReel";
import { CollageReel } from "./collage/CollageReel";
import { Avatar } from "./brand/Avatar";
import { ChatSkit } from "./chat/ChatSkit";
import { ChatScript, compile } from "./chat/compile";
import comedyScript from "./data/comedy/script.json";
import { Toon, ToonData } from "./toon/Toon";
import toonScript from "./data/toon/script.json";
import toonTiming from "./data/toon/timing.json";
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
    {/* comedy channel: long-form chat skits (16:9), length computed from the script */}
    <Composition id="ChatSkit" component={ChatSkit} fps={FPS} width={1920} height={1080} durationInFrames={300}
      defaultProps={{ script: comedyScript as unknown as ChatScript }}
      calculateMetadata={({ props }) => ({ durationInFrames: compile(props.script).total })} />
    {/* storytime cartoon (16:9): deadpan narrator + code-drawn characters + crazy effects */}
    <Composition id="Toon" component={Toon} fps={FPS} width={1920} height={1080} durationInFrames={Math.max(30, Math.round(toonTiming.total * FPS))}
      defaultProps={{ data: toonScript as unknown as ToonData, timing: toonTiming, vo: "audio/toon_vo.wav" }} />
    <Composition id="Avatar" component={Avatar} durationInFrames={1} fps={30} width={1080} height={1080} />
  </>
);
