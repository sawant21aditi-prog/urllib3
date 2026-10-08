// Long-form comedy chat skit (16:9): an original group-chat app UI where messages, typing indicators, reactions,
// edits, deletes, joins and scene cards play out on a timeline compiled from a script (src/data/comedy/script.json).
// Everything is code-drawn (no images needed) and the sound effects are synthesised (scripts/make_chat_sfx.py).
import React from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { AnimalAvatar } from "./AnimalAvatar";
import { ChatScript, Timed, compile } from "./compile";
import { clamp } from "../components/lib";

const FONT = "Nunito";
if (typeof document !== "undefined" && !document.getElementById("chat-font")) {
  const h = delayRender("chat font");
  const face = new FontFace(FONT, `url(${staticFile("fonts/Nunito-var.woff2")}) format("woff2")`, { weight: "400 900" });
  document.fonts.add(face);
  face.load().then(() => continueRender(h), () => continueRender(h));
  const marker = document.createElement("meta");
  marker.id = "chat-font";
  document.head.appendChild(marker);
}

const C = { rail: "#17181c", side: "#212328", chat: "#2b2d33", hover: "#33363d", text: "#E8E9EC", muted: "#9A9EA8", line: "#3a3d45", accent: "#7C83FF" };
const EMOJI: Record<string, string> = { skull: "💀", laugh: "😂", cry: "😭", fire: "🔥", eyes: "👀", thumbs: "👍", heart: "❤️", clown: "🤡", shock: "😱", "100": "💯" };
const SFX = new Set(["boom", "ping", "bruh", "drumroll", "record", "crickets", "ding", "alarm", "pop", "whoosh", "join", "leave", "send", "typing"]);

// layout (1920×1080)
const RAIL = 96, SIDE = 300, MEMBERS = 330;
const CHAT_X = RAIL + SIDE, CHAT_W = 1920 - CHAT_X - MEMBERS;
const HEADER = 72, INPUT = 116, AVATAR = 74, TEXT = 34, LINE = 46;
const CHARS_PER_LINE = 52;

type Row = {
  kind: "msg" | "system";
  from?: string; text: string; start: number; idx?: number; reply?: number;
  edited?: number; deleted?: number; reactions: { emoji: string; at: number; count: number }[]; nameAt?: string;
};

const wrapLines = (text: string) => {
  const words = text.split(" ");
  let lines = 1, cur = 0;
  for (const w of words) {
    if (cur + w.length + (cur ? 1 : 0) > CHARS_PER_LINE) { lines++; cur = w.length; } else cur += w.length + (cur ? 1 : 0);
  }
  return lines;
};

const clock = (i: number) => {
  const m = 42 + Math.floor(i * 0.6);
  return `Today at ${7 + Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")} PM`;
};

/** Everything visible at frame f, derived purely from the timeline. */
const stateAt = (script: ChatScript, timeline: Timed[], f: number) => {
  const rows: Row[] = [];
  const msgRow: Record<number, Row> = {};
  const names: Record<string, string> = Object.fromEntries(script.characters.map((c) => [c.id, c.name]));
  const firstJoin = new Set(script.events.filter((e) => e.type === "join").map((e) => (e as { from: string }).from));
  const online = new Set(script.characters.filter((c) => !firstJoin.has(c.id)).map((c) => c.id));
  let typing: { from: string; start: number } | null = null;
  let card: { text: string; start: number; dur: number } | null = null;
  let punch = -1;
  for (const t of timeline) {
    if (t.start > f) break;
    const ev = t.ev;
    const active = f < t.start + t.dur;
    switch (ev.type) {
      case "msg": {
        const r: Row = { kind: "msg", from: ev.from, text: ev.text, start: t.start, idx: t.msgIndex, reply: ev.reply, reactions: [], nameAt: names[ev.from] };
        rows.push(r);
        msgRow[t.msgIndex!] = r;
        if (ev.sfx === "boom" || ev.sfx === "record" || ev.sfx === "drumroll") punch = t.start;
        break;
      }
      case "typing": if (active) typing = { from: ev.from, start: t.start }; break;
      case "react": {
        const r = msgRow[t.targetIndex!];
        if (r) {
          const ex = r.reactions.find((x) => x.emoji === ev.emoji);
          if (ex) { ex.count++; ex.at = t.start; } else r.reactions.push({ emoji: ev.emoji, at: t.start, count: 1 });
        }
        break;
      }
      case "edit": { const r = msgRow[t.targetIndex!]; if (r) { r.text = ev.text; r.edited = t.start; } break; }
      case "delete": { const r = msgRow[t.targetIndex!]; if (r) r.deleted = t.start; break; }
      case "join": online.add(ev.from); rows.push({ kind: "system", text: `${names[ev.from]} joined the chat.`, start: t.start, reactions: [] }); break;
      case "leave": online.delete(ev.from); rows.push({ kind: "system", text: `${names[ev.from]} left the chat.`, start: t.start, reactions: [] }); break;
      case "rename":
        rows.push({ kind: "system", text: `${names[ev.from]} changed their nickname to ${ev.name}.`, start: t.start, reactions: [] });
        names[ev.from] = ev.name;
        break;
      case "card": if (active) card = { text: ev.text, start: t.start, dur: t.dur }; break;
    }
  }
  return { rows, typing, card, names, online, punch };
};

const rowHeight = (rows: Row[], i: number, f: number) => {
  const r = rows[i];
  if (r.kind === "system") return 58;
  const prev = rows[i - 1];
  const grouped = prev && prev.kind === "msg" && prev.from === r.from && !prev.deleted && r.reply === undefined && r.start - prev.start < 30 * 20;
  let h = (grouped ? 6 : 26 + 42) + wrapLines(r.text) * LINE + (r.reply !== undefined ? 36 : 0) + (r.reactions.length ? 56 : 0);
  if (r.deleted !== undefined) h *= 1 - interpolate(f - r.deleted, [14, 24], [0, 1], clamp);
  return h;
};

const Reply: React.FC<{ row?: Row; color: string; name: string }> = ({ row, color, name }) =>
  row ? (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 6, marginBottom: 4, fontSize: 24, color: C.muted, whiteSpace: "nowrap", overflow: "hidden" }}>
      <div style={{ width: 40, height: 18, borderLeft: `3px solid ${C.muted}`, borderTop: `3px solid ${C.muted}`, borderTopLeftRadius: 10, marginTop: 14 }} />
      <span style={{ color, fontWeight: 800 }}>@{name}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: CHAT_W - 360 }}>{row.text}</span>
    </div>
  ) : null;

export const ChatSkit: React.FC<{ script: ChatScript }> = ({ script }) => {
  const f = useCurrentFrame();
  const { timeline } = compile(script);
  const st = stateAt(script, timeline, f);
  const chars = Object.fromEntries(script.characters.map((c) => [c.id, c]));
  const msgRows: Record<number, Row> = {};
  st.rows.forEach((r) => { if (r.idx !== undefined) msgRows[r.idx] = r; });

  // stack rows bottom-up; the newest row grows in so the chat scrolls smoothly
  const bottom = 1080 - INPUT - 14;
  const heights = st.rows.map((_, i) => rowHeight(st.rows, i, f));
  const last = st.rows.length - 1;
  if (last >= 0) heights[last] *= interpolate(f - st.rows[last].start, [0, 5], [0, 1], clamp);
  const ys: number[] = [];
  let y = bottom;
  for (let i = last; i >= 0; i--) { y -= heights[i]; ys[i] = y; }

  // punchline camera: quick push toward the newest message + shake
  const pt = st.punch >= 0 ? f - st.punch : 999;
  const zoom = pt < 40 ? interpolate(pt, [0, 3, 30, 40], [1, 1.14, 1.12, 1], clamp) : 1;
  const shake = pt < 10 ? (random(`s${f}`) - 0.5) * 22 * (1 - pt / 10) : 0;

  return (
    <AbsoluteFill style={{ background: C.chat, fontFamily: FONT, color: C.text }}>
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px) scale(${zoom})`, transformOrigin: `${CHAT_X + 420}px 930px` }}>
        {/* server rail */}
        <div style={{ position: "absolute", left: 0, top: 0, width: RAIL, height: 1080, background: C.rail, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 22, gap: 16 }}>
          {[script.server.slice(0, 1), "?", "+", "☆"].map((s, i) => (
            <div key={i} style={{ width: 62, height: 62, borderRadius: i === 0 ? 20 : 31, background: i === 0 ? C.accent : C.side, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: i === 0 ? "#fff" : C.muted }}>{s}</div>
          ))}
        </div>
        {/* channel sidebar */}
        <div style={{ position: "absolute", left: RAIL, top: 0, width: SIDE, height: 1080, background: C.side }}>
          <div style={{ height: HEADER, display: "flex", alignItems: "center", padding: "0 22px", fontWeight: 900, fontSize: 28, borderBottom: `2px solid ${C.rail}` }}>{script.server}</div>
          <div style={{ padding: "18px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.muted, letterSpacing: "0.08em", margin: "6px 8px" }}>TEXT CHANNELS</div>
            {[script.channel, "memes", "homework", "gaming", "rules"].map((ch, i) => (
              <div key={ch} style={{ padding: "8px 12px", borderRadius: 10, fontSize: 26, fontWeight: i === 0 ? 900 : 700, color: i === 0 ? C.text : C.muted, background: i === 0 ? C.hover : "transparent" }}># {ch}</div>
            ))}
          </div>
        </div>
        {/* chat header */}
        <div style={{ position: "absolute", left: CHAT_X, top: 0, width: CHAT_W, height: HEADER, display: "flex", alignItems: "center", padding: "0 28px", fontSize: 30, fontWeight: 900, borderBottom: `2px solid ${C.rail}`, background: C.chat, zIndex: 3 }}>
          <span style={{ color: C.muted, marginRight: 10 }}>#</span>{script.channel}
        </div>
        {/* messages */}
        <div style={{ position: "absolute", left: CHAT_X, top: HEADER, width: CHAT_W, height: bottom - HEADER, overflow: "hidden" }}>
          {st.rows.map((r, i) => {
            const top = ys[i] - HEADER;
            if (top + heights[i] < -40) return null;
            const appear = interpolate(f - r.start, [0, 5], [0, 1], clamp);
            if (r.kind === "system")
              return (
                <div key={i} style={{ position: "absolute", left: 0, top, width: CHAT_W, height: heights[i], display: "flex", alignItems: "center", padding: "0 34px", fontSize: 26, color: C.muted, opacity: appear }}>
                  <span style={{ color: "#3BA55C", fontSize: 30, marginRight: 14 }}>→</span>{r.text}
                </div>
              );
            const ch = chars[r.from!];
            const prev = st.rows[i - 1];
            const grouped = prev && prev.kind === "msg" && prev.from === r.from && !prev.deleted && r.reply === undefined && r.start - prev.start < 30 * 20;
            const del = r.deleted !== undefined ? f - r.deleted : -1;
            const isNew = f - r.start < 26 && i === last;
            return (
              <div key={i} style={{ position: "absolute", left: 0, top, width: CHAT_W, height: heights[i], overflow: "hidden",
                background: del >= 0 ? `rgba(237,66,69,${interpolate(del, [0, 6, 14], [0, 0.35, 0.15], clamp)})` : isNew ? `rgba(255,255,255,${interpolate(f - r.start, [0, 26], [0.06, 0], clamp)})` : "transparent",
                opacity: del >= 14 ? 1 - (del - 14) / 10 : 1 }}>
                <div style={{ position: "absolute", left: 28, top: grouped ? 3 : 22, right: 30, transform: `translateY(${(1 - appear) * 18}px)` }}>
                  {r.reply !== undefined && <Reply row={msgRows[r.reply]} color={chars[msgRows[r.reply]?.from ?? ""]?.color ?? C.muted} name={msgRows[r.reply]?.nameAt ?? ""} />}
                  <div style={{ display: "flex", gap: 22 }}>
                    <div style={{ width: AVATAR, flexShrink: 0 }}>
                      {!grouped && <AnimalAvatar animal={ch.animal} color={ch.color} size={AVATAR} blink={Math.floor((f + i * 37) / 90) % 9 === 0 && (f + i * 37) % 90 < 5} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {!grouped && (
                        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 2 }}>
                          <span style={{ fontSize: 30, fontWeight: 900, color: ch.color }}>{r.nameAt}</span>
                          <span style={{ fontSize: 20, color: C.muted, fontWeight: 700 }}>{clock(r.idx ?? 0)}</span>
                        </div>
                      )}
                      <div style={{ fontSize: TEXT, lineHeight: `${LINE}px`, fontWeight: 600, wordBreak: "break-word", textDecoration: del >= 0 ? "line-through" : "none" }}>
                        {r.text}
                        {r.edited !== undefined && f >= r.edited && <span style={{ fontSize: 20, color: C.muted, marginLeft: 10 }}>(edited)</span>}
                      </div>
                      {r.reactions.length > 0 && (
                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                          {r.reactions.map((x) => {
                            const pop = interpolate(f - x.at, [0, 3, 6], [0.4, 1.25, 1], clamp);
                            return (
                              <div key={x.emoji} style={{ transform: `scale(${pop})`, display: "flex", alignItems: "center", gap: 8, padding: "4px 14px", borderRadius: 14, background: "rgba(124,131,255,0.22)", border: `2px solid ${C.accent}`, fontSize: 26, fontWeight: 900 }}>
                                <span style={{ fontFamily: "Noto Color Emoji" }}>{EMOJI[x.emoji] ?? x.emoji}</span>{x.count}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* input box + typing indicator */}
        <div style={{ position: "absolute", left: CHAT_X + 26, top: 1080 - INPUT + 8, width: CHAT_W - 52, height: 64, borderRadius: 16, background: "#383a42", display: "flex", alignItems: "center", padding: "0 24px", fontSize: 26, color: C.muted, fontWeight: 700 }}>
          Message #{script.channel}
        </div>
        {st.typing && (
          <div style={{ position: "absolute", left: CHAT_X + 34, top: 1080 - 40, fontSize: 22, fontWeight: 800, color: C.text, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-flex", gap: 5 }}>
              {[0, 1, 2].map((k) => <span key={k} style={{ width: 9, height: 9, borderRadius: 5, background: C.text, opacity: 0.4 + 0.6 * Math.max(0, Math.sin((f - k * 4) / 4)), transform: `translateY(${-3 * Math.max(0, Math.sin((f - k * 4) / 4))}px)` }} />)}
            </span>
            <b>{st.names[st.typing.from]}</b> <span style={{ color: C.muted }}>is typing…</span>
          </div>
        )}
        {/* member list */}
        <div style={{ position: "absolute", left: 1920 - MEMBERS, top: 0, width: MEMBERS, height: 1080, background: C.side, padding: "22px 20px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.muted, letterSpacing: "0.08em", margin: "0 0 14px 6px" }}>ONLINE — {st.online.size}</div>
          {script.characters.filter((c) => st.online.has(c.id)).map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 6px" }}>
              <div style={{ position: "relative" }}>
                <AnimalAvatar animal={c.animal} color={c.color} size={52} />
                <div style={{ position: "absolute", right: -2, bottom: -2, width: 18, height: 18, borderRadius: 9, background: "#3BA55C", border: `4px solid ${C.side}` }} />
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: c.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.names[c.id]}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* scene card */}
      {st.card && (() => {
        const k = f - st.card.start;
        const op = interpolate(k, [0, 4, st.card.dur - 5, st.card.dur], [0, 1, 1, 0], clamp);
        return (
          <AbsoluteFill style={{ background: "#0e0f12", opacity: op, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 92, fontWeight: 900, color: "#fff", transform: `scale(${interpolate(k, [0, 6], [1.15, 1], clamp)})`, textAlign: "center", maxWidth: 1500, lineHeight: 1.1 }}>{st.card.text}</div>
          </AbsoluteFill>
        );
      })()}

      {/* sound */}
      <Audio src={staticFile("sfx/chat/music_loop.wav")} volume={0.1} loop />
      {timeline.map((t, i) => {
        const ev = t.ev;
        const name =
          ev.type === "msg" ? "ping" : ev.type === "typing" ? "typing" : ev.type === "react" ? "pop" : ev.type === "join" ? "join" :
          ev.type === "leave" ? "leave" : ev.type === "card" ? "whoosh" : ev.type === "sfx" ? ev.name : null;
        const extra = ev.type === "msg" && ev.sfx && SFX.has(ev.sfx) ? ev.sfx : null;
        return (
          <React.Fragment key={i}>
            {name && SFX.has(name) && (
              <Sequence from={t.start} durationInFrames={90}><Audio src={staticFile(`sfx/chat/${name}.wav`)} volume={name === "typing" ? 0.25 : name === "ping" ? 0.35 : 0.6} /></Sequence>
            )}
            {extra && <Sequence from={t.start + 2} durationInFrames={90}><Audio src={staticFile(`sfx/chat/${extra}.wav`)} volume={0.7} /></Sequence>}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
