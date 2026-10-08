// Original, code-drawn animal avatars (no external images): a coloured disc with a simple face and ears.
import React from "react";

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
};

export const AnimalAvatar: React.FC<{ animal: string; color: string; size: number; blink?: boolean }> = ({ animal, color, size, blink }) => {
  const dark = shade(color, 0.62);
  const light = shade(color, 1.25);
  const eyeH = blink ? 1.2 : 7;
  const ears: Record<string, React.ReactNode> = {
    cat: <><path d="M18 34 L24 6 L42 24 Z" fill={color} /><path d="M82 34 L76 6 L58 24 Z" fill={color} /><path d="M24 28 L27 14 L36 24 Z" fill={dark} /><path d="M76 28 L73 14 L64 24 Z" fill={dark} /></>,
    fox: <><path d="M14 38 L22 2 L44 24 Z" fill={color} /><path d="M86 38 L78 2 L56 24 Z" fill={color} /><path d="M22 30 L25 12 L36 24 Z" fill="#fff" /><path d="M78 30 L75 12 L64 24 Z" fill="#fff" /></>,
    dog: <><ellipse cx="17" cy="44" rx="11" ry="22" fill={dark} transform="rotate(18 17 44)" /><ellipse cx="83" cy="44" rx="11" ry="22" fill={dark} transform="rotate(-18 83 44)" /></>,
    bear: <><circle cx="22" cy="20" r="12" fill={color} /><circle cx="78" cy="20" r="12" fill={color} /><circle cx="22" cy="20" r="6" fill={dark} /><circle cx="78" cy="20" r="6" fill={dark} /></>,
    bunny: <><ellipse cx="34" cy="10" rx="8" ry="24" fill={color} /><ellipse cx="66" cy="10" rx="8" ry="24" fill={color} /><ellipse cx="34" cy="12" rx="4" ry="16" fill="#F7B6C8" /><ellipse cx="66" cy="12" rx="4" ry="16" fill="#F7B6C8" /></>,
    owl: <><path d="M20 30 L18 8 L38 22 Z" fill={dark} /><path d="M80 30 L82 8 L62 22 Z" fill={dark} /></>,
    frog: <><circle cx="30" cy="26" r="15" fill={color} /><circle cx="70" cy="26" r="15" fill={color} /></>,
    duck: null,
  };
  const eyes =
    animal === "owl" ? (
      <><circle cx="36" cy="50" r="13" fill="#fff" /><circle cx="64" cy="50" r="13" fill="#fff" /><ellipse cx="36" cy="51" rx="6" ry={eyeH} fill="#1b1b1f" /><ellipse cx="64" cy="51" rx="6" ry={eyeH} fill="#1b1b1f" /></>
    ) : animal === "frog" ? (
      <><circle cx="30" cy="26" r="9" fill="#fff" /><circle cx="70" cy="26" r="9" fill="#fff" /><ellipse cx="30" cy="27" rx="4.5" ry={eyeH * 0.8} fill="#1b1b1f" /><ellipse cx="70" cy="27" rx="4.5" ry={eyeH * 0.8} fill="#1b1b1f" /></>
    ) : (
      <><ellipse cx="38" cy="50" rx="5" ry={eyeH} fill="#1b1b1f" /><ellipse cx="62" cy="50" rx="5" ry={eyeH} fill="#1b1b1f" /><circle cx="40" cy="47" r="1.6" fill="#fff" /><circle cx="64" cy="47" r="1.6" fill="#fff" /></>
    );
  const snout =
    animal === "duck" ? <ellipse cx="50" cy="66" rx="16" ry="8" fill="#F5A623" /> :
    animal === "owl" ? <path d="M45 60 L55 60 L50 70 Z" fill="#F5A623" /> :
    animal === "frog" ? <path d="M32 66 Q50 78 68 66" stroke="#1b1b1f" strokeWidth="3" fill="none" strokeLinecap="round" /> :
    <><ellipse cx="50" cy="66" rx="13" ry="9" fill={light} /><ellipse cx="50" cy="62" rx="4.5" ry="3.2" fill="#2a2025" /><path d="M50 65 Q50 71 44 71 M50 65 Q50 71 56 71" stroke="#2a2025" strokeWidth="2" fill="none" strokeLinecap="round" /></>;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <defs>
        <clipPath id={`clip-${animal}-${color}`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>
      <g clipPath={`url(#clip-${animal}-${color})`}>
        <rect width="100" height="100" fill={shade(color, 0.42)} />
        {ears[animal]}
        <ellipse cx="50" cy="58" rx="36" ry="33" fill={color} />
        <ellipse cx="27" cy="66" rx="6" ry="4" fill="#F28FAD" opacity="0.55" />
        <ellipse cx="73" cy="66" rx="6" ry="4" fill="#F28FAD" opacity="0.55" />
        {eyes}
        {snout}
      </g>
    </svg>
  );
};
