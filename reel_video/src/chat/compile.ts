// Turns a chat-skit script (list of events) into a timeline: when each event starts and how long it holds.
// Durations come from reading speed, so no voiceover is needed.

export type Character = { id: string; name: string; animal: string; color: string };
export type ChatEvent =
  | { type: "msg"; from: string; text: string; sfx?: string; hold?: number; reply?: number }
  | { type: "typing"; from: string; dur?: number }
  | { type: "react"; target: "last" | number; emoji: string; from?: string }
  | { type: "edit"; target: "last" | number; text: string }
  | { type: "delete"; target: "last" | number }
  | { type: "join"; from: string }
  | { type: "leave"; from: string }
  | { type: "rename"; from: string; name: string }
  | { type: "card"; text: string; dur?: number }
  | { type: "pause"; dur: number }
  | { type: "sfx"; name: string };
export type ChatScript = { title: string; server: string; channel: string; characters: Character[]; events: ChatEvent[] };

export type Timed = { ev: ChatEvent; start: number; dur: number; msgIndex?: number; targetIndex?: number };

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

/** Seconds a message stays the newest thing on screen: enough to read it, plus any comic "hold". */
export const readTime = (text: string) => Math.min(4.6, Math.max(1.25, 0.75 + text.length * 0.045));

export const compile = (script: ChatScript): { timeline: Timed[]; total: number } => {
  const timeline: Timed[] = [];
  let f = sec(0.6);
  let msgCount = 0;
  const resolve = (target: "last" | number) => (target === "last" ? msgCount - 1 : target);
  for (const ev of script.events) {
    let d = 0;
    const item: Timed = { ev, start: f, dur: 0 };
    switch (ev.type) {
      case "msg":
        item.msgIndex = msgCount++;
        d = sec(readTime(ev.text) + (ev.hold ?? 0));
        break;
      case "typing": d = sec(ev.dur ?? 1.2); break;
      case "react": item.targetIndex = resolve(ev.target); d = sec(0.75); break;
      case "edit": item.targetIndex = resolve(ev.target); d = sec(1.2 + readTime(ev.text) * 0.6); break;
      case "delete": item.targetIndex = resolve(ev.target); d = sec(1.1); break;
      case "join": case "leave": case "rename": d = sec(1.5); break;
      case "card": d = sec(ev.dur ?? 1.9); break;
      case "pause": d = sec(ev.dur); break;
      case "sfx": d = sec(0.15); break;
    }
    item.dur = d;
    timeline.push(item);
    f += d;
  }
  return { timeline, total: f + sec(1.5) };
};
