// Profile picture for The Hidden Why: a charcoal paper-cutout "?" on sky blue whose dot is the
// real brass close-door button from Reel #1 (the page's signature object). Reads at 110px and 32px.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "../fonts";

export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ background: "#8FD3FE" }}>
    {/* soft halftone shadow, bottom-right */}
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(30,29,27,0.09) 30%, transparent 32%)", backgroundSize: "18px 18px",
      WebkitMaskImage: "radial-gradient(circle at 80% 85%, black 0, transparent 55%)", maskImage: "radial-gradient(circle at 80% 85%, black 0, transparent 55%)" }} />
    {/* tape + confetti accents (inside the circular crop) */}
    <div style={{ position: "absolute", left: 250, top: 200, width: 170, height: 46, background: "rgba(255,92,138,0.85)", transform: "rotate(-24deg)" }} />
    <div style={{ position: "absolute", left: 690, top: 270, width: 150, height: 42, background: "rgba(46,196,166,0.85)", transform: "rotate(18deg)" }} />
    {[["#FFB020", 300, 720, 20], ["#9B6BFF", 780, 640, -30], ["#FF7A45", 240, 470, 40], ["#3DA5FF", 800, 470, 10]].map(([c, x, y, r], i) => (
      <div key={i} style={{ position: "absolute", left: x as number, top: y as number, width: 34, height: 16, background: c as string, transform: `rotate(${r}deg)` }} />
    ))}
    {/* the "?" as a cutout: white sticker border + hard shadow */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 40, display: "flex", justifyContent: "center", transform: "rotate(-6deg)" }}>
      <span style={{ fontFamily: "Playfair", fontWeight: 900, fontSize: 900, lineHeight: 1, color: "#1E1D1B",
        WebkitTextStroke: "26px #FFFFFF", paintOrder: "stroke fill",
        filter: "drop-shadow(14px 18px 0 rgba(30,29,27,0.35))",
        clipPath: "inset(0 0 29% 0)" /* hide the font's own dot; the button replaces it */ }}>?</span>
    </div>
    {/* the dot = real brass button */}
    <Img src={staticFile("brand/button.png")} style={{ position: "absolute", left: 512 - 95, top: 690, width: 190,
      transform: "rotate(-6deg)", filter: "drop-shadow(0 0 0 #fff) drop-shadow(8px 12px 0 rgba(30,29,27,0.35))" }} />
  </AbsoluteFill>
);
