import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Chibi } from "./chibi";
import { CAST } from "./cast";
export const Lineup: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#fbf3e6,#efdcc0)" }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {CAST.map((c, i) => (
          <g key={c.id}>
            <Chibi spec={c} x={300 + i * 440} y={900} size={560}
              pose={{ breathe: Math.sin(f / 20), look: i === 0 ? 0.3 : i === 3 ? -0.3 : 0, armR: c.id === "hartley" ? 103 : c.id === "brown" ? 150 : c.id === "andrews" ? 60 : 0, armL: c.id === "hartley" ? 55 : 0, bow: Math.sin(f / 6), mouth: i === 1 ? "grin" : "smile" }} />
            <text x={300 + i * 440} y={1010} textAnchor="middle" fontFamily="sans-serif" fontWeight={700} fontSize={30} fill="#3a2a22">{c.name}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
