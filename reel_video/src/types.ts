import script from "./data/script.json";
export type Beat = (typeof script)["beats"][number] & { retention?: string };
export type SceneProps = {
  beat: Beat;
  /** scene length in frames (cut to cut) */
  durationInFrames: number;
  /** frames until the voiceover line finishes inside this scene */
  speechFrames: number;
};
