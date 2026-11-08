// Ships and sea in the chibi style: Titanic side view (day/night, lit portholes, smoke, tilt), simple one-funnel ships
// (Carpathia: red funnel with black top; Californian: black funnel with a band), calm sea, stars, iceberg.
// Titanic facts used: black hull, white superstructure, four buff funnels with black tops raked aft (4th without smoke),
// two masts. Night of 14 April 1912: no moon, flat calm sea, clear starry sky.
import React from "react";
import { INK, PAL } from "./style";

const st = (w = 4) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });

/** Titanic side view, bow pointing right. Origin = waterline at the middle of the ship. ~1500 x 520 at scale 1. */
export const Titanic: React.FC<{ f: number; night?: boolean; smoke?: boolean; lights?: number }> = ({ f, night = false, smoke = true, lights = 1 }) => {
  const hullTop = -120, wl = 0, bowX = 740, sternX = -740;
  const funnels = [-330, -100, 130, 360];
  const puffs: React.ReactNode[] = [];
  if (smoke) funnels.slice(0, 3).forEach((fx, j) => {
    for (let k = 0; k < 7; k++) {
      const age = (f + j * 11 + k * 14) % 98, t = age / 98;
      puffs.push(<circle key={`${j}-${k}`} cx={fx - 34 - age * 1.6} cy={-470 - age * 0.9} r={22 + age * 0.5} fill={night ? "#59607a" : "#ece0d0"} stroke={night ? "#3a3f55" : "#d1bba3"} strokeWidth={3} opacity={(1 - t) * 0.8} />);
    }
  });
  const port = night ? "#ffd66b" : "#2b3448";
  return (
    <g>
      {puffs}
      {/* masts + rigging */}
      <path d={`M ${sternX + 170} ${hullTop} L ${sternX + 140} -560 M ${bowX - 230} ${hullTop} L ${bowX - 260} -560`} {...st(7)} stroke={night ? "#cfd6e8" : "#5b4a40"} />
      <path d={`M ${sternX + 140} -555 L ${bowX - 260} -555 M ${bowX - 260} -555 L ${bowX - 20} ${hullTop} M ${sternX + 140} -555 L ${sternX + 20} ${hullTop}`} stroke={night ? "#8e97b3" : "#6b5a4e"} strokeWidth={2} fill="none" />
      {/* funnels */}
      {funnels.map((fx, i) => (
        <g key={i}>
          <path d={`M ${fx - 42} -235 L ${fx - 42 - 34} -470 L ${fx + 42 - 34} -470 L ${fx + 42} -235 Z`} fill={PAL.funnelBuff} {...st()} />
          <path d={`M ${fx + 10} -235 L ${fx + 10 - 34} -470 L ${fx + 42 - 34} -470 L ${fx + 42} -235 Z`} fill={PAL.funnelBuffDark} opacity={0.7} />
          <path d={`M ${fx - 42 + 27} -420 L ${fx - 42 - 34} -470 L ${fx + 42 - 34} -470 L ${fx + 42 + 27} -420 Z`} fill={PAL.funnelBlack} {...st()} />
        </g>
      ))}
      {/* superstructure decks */}
      <path d={`M ${sternX + 110} ${hullTop} L ${sternX + 120} -235 L ${bowX - 170} -235 L ${bowX - 150} ${hullTop} Z`} fill={night ? "#d9dbe6" : PAL.white} {...st()} />
      <path d={`M ${sternX + 180} -235 L ${sternX + 190} -262 L ${bowX - 260} -262 L ${bowX - 250} -235 Z`} fill={night ? "#cfd2df" : "#f1ebdf"} {...st(3)} />
      {/* bridge */}
      <rect x={bowX - 300} y={-292} width={70} height={32} rx={5} fill={night ? "#cfd2df" : "#f1ebdf"} {...st(3)} />
      {Array.from({ length: 32 }, (_, i) => <rect key={i} x={sternX + 150 + i * 37} y={-205} width={20} height={14} rx={3} fill={port} opacity={night ? (0.55 + 0.45 * lights) : 1} />)}
      {Array.from({ length: 32 }, (_, i) => <rect key={`b${i}`} x={sternX + 150 + i * 37} y={-160} width={20} height={14} rx={3} fill={port} opacity={night ? (0.55 + 0.45 * lights) : 1} />)}
      {/* lifeboats along the boat deck */}
      {[-470, -420, -370, 60, 110, 190, 240, 450, 500].map((x, i) => <path key={i} d={`M ${x} -250 Q ${x + 21} -238 ${x + 42} -250 L ${x + 38} -262 L ${x + 4} -262 Z`} fill="#f7f3ea" {...st(2.5)} />)}
      {/* hull */}
      <path d={`M ${sternX} ${hullTop} L ${bowX} ${hullTop - 18} Q ${bowX + 20} ${hullTop + 40} ${bowX - 10} ${wl + 40} L ${sternX + 70} ${wl + 40} Q ${sternX - 10} ${wl - 20} ${sternX} ${hullTop} Z`} fill="#1d1b22" {...st()} />
      <path d={`M ${sternX + 4} ${hullTop + 6} L ${bowX - 4} ${hullTop - 12}`} stroke={PAL.gold} strokeWidth={3} />
      {Array.from({ length: 30 }, (_, i) => <circle key={`h${i}`} cx={sternX + 120 + i * 45} cy={-80 + (i % 2) * 0} r={5} fill={port} opacity={night ? 0.9 * lights + 0.1 : 0.85} />)}
      {Array.from({ length: 30 }, (_, i) => <circle key={`g${i}`} cx={sternX + 140 + i * 45} cy={-42} r={5} fill={port} opacity={night ? 0.8 * lights + 0.1 : 0.85} />)}
      <path d={`M ${sternX + 30} ${wl + 2} L ${bowX - 4} ${wl + 2}`} stroke="#8c2f2a" strokeWidth={10} opacity={0.9} />
      {night && lights > 0.3 && <ellipse cx={0} cy={-150} rx={820} ry={220} fill="#ffd66b" opacity={0.06 * lights} />}
    </g>
  );
};

/** one-funnel steamer (Carpathia: red funnel/black top; Californian: black funnel with a red band) */
export const Steamer: React.FC<{ f: number; kind: "carpathia" | "californian"; night?: boolean; lights?: number }> = ({ f, kind, night = false, lights = 1 }) => {
  const fun = kind === "carpathia" ? "#d8592d" : "#1d1b22";
  const port = night ? "#ffd66b" : "#2b3448";
  return (
    <g>
      {kind === "carpathia" && Array.from({ length: 6 }, (_, k) => { const age = (f + k * 16) % 96; return <circle key={k} cx={30 - age * 1.4} cy={-330 - age * 0.8} r={18 + age * 0.4} fill={night ? "#59607a" : "#ece0d0"} stroke={night ? "#3a3f55" : "#d1bba3"} strokeWidth={3} opacity={(1 - age / 96) * 0.8} />; })}
      <path d="M -330 -100 L -320 -350 M 280 -100 L 300 -350" {...st(6)} stroke={night ? "#cfd6e8" : "#5b4a40"} />
      <path d="M -20 -190 L -5 -340 L 75 -340 L 60 -190 Z" fill={fun} {...st()} />
      <path d="M -11 -290 L -5 -340 L 75 -340 L 69 -290 Z" fill="#1d1b22" {...st(3)} />
      {kind === "californian" && <path d="M -14 -250 L 66 -250 L 64 -232 L -16 -232 Z" fill="#c0473f" />}
      <path d="M -260 -100 L -250 -190 L 230 -190 L 240 -100 Z" fill={night ? "#d9dbe6" : PAL.white} {...st()} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-235 + i * 39} y={-160} width={18} height={13} rx={3} fill={port} opacity={night ? 0.4 + 0.6 * lights : 1} />)}
      <path d="M -440 -100 L 440 -112 Q 460 -60 430 30 L -380 30 Q -450 -20 -440 -100 Z" fill="#1d1b22" {...st()} />
      {Array.from({ length: 16 }, (_, i) => <circle key={`p${i}`} cx={-360 + i * 48} cy={-55} r={5} fill={port} opacity={night ? 0.3 + 0.6 * lights : 0.85} />)}
    </g>
  );
};

/** water in front of a hull: covers everything below the waterline (y = 0 in ship space) */
export const WaterFront: React.FC<{ f: number; width: number; color: string; line?: string }> = ({ f, width, color, line = "#ffffff" }) => (
  <g>
    <path d={`M ${-width / 2} 0 ${Array.from({ length: 41 }, (_, i) => `L ${-width / 2 + (i * width) / 40} ${Math.sin(i * 1.3 + f * 0.12) * 4}`).join(" ")} L ${width / 2} 120 L ${-width / 2} 120 Z`} fill={color} />
    <path d={`M ${-width / 2} 0 ${Array.from({ length: 41 }, (_, i) => `L ${-width / 2 + (i * width) / 40} ${Math.sin(i * 1.3 + f * 0.12) * 4}`).join(" ")}`} fill="none" stroke={line} strokeWidth={3} opacity={0.5} />
  </g>
);

export const Iceberg: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -260 0 L -200 -150 L -120 -210 L -70 -330 L 10 -260 L 70 -300 L 150 -170 L 230 -90 L 280 0 Z" fill="#eaf6fb" {...st(5)} />
    <path d="M -70 -330 L -40 -160 L -120 -210 Z M 70 -300 L 60 -150 L 10 -260 Z M 150 -170 L 120 -60 L 230 -90 Z" fill="#bfe0ee" />
    <path d="M -40 -160 L 60 -150 L 120 -60 L -200 -150 Z" fill="#d6edf6" opacity={0.8} />
    <path d="M -260 0 L 280 0 L 220 70 L -210 70 Z" fill="#8fc3dc" opacity={0.55} />
  </g>
);

/** full-frame sea + sky. mode: night (no moon, stars), dawn, day */
export const SeaSky: React.FC<{ f: number; mode: "night" | "dawn" | "day"; horizon?: number }> = ({ f, mode, horizon = 640 }) => {
  const sky = mode === "night" ? ["#060a1c", "#111a3a", "#1b2650"] : mode === "dawn" ? ["#3b4f86", "#e59b86", "#f8cf9a"] : ["#6f9fd8", "#a9cdee", "#e8f2f8"];
  const sea = mode === "night" ? ["#0b1430", "#060b1d"] : mode === "dawn" ? ["#5a6f9e", "#2c3c66"] : ["#3f7fbf", "#2a5d96"];
  const id = `ss-${mode}`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="0.7" stopColor={sky[1]} /><stop offset="1" stopColor={sky[2]} /></linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sea[0]} /><stop offset="1" stopColor={sea[1]} /></linearGradient>
      </defs>
      <rect x={-400} y={-400} width={2720} height={horizon + 400} fill={`url(#${id}-sky)`} />
      {mode === "night" && Array.from({ length: 140 }, (_, i) => {
        const x = (i * 337) % 2600 - 340, y = (i * 191) % (horizon - 40) - 60, tw = 0.5 + 0.5 * Math.sin(f * 0.07 + i);
        return <circle key={i} cx={x} cy={y} r={1.2 + (i % 4) * 0.7} fill="#ffffff" opacity={0.35 + 0.6 * tw} />;
      })}
      {mode === "dawn" && <circle cx={1500} cy={horizon - 10} r={90} fill="#ffe7b0" opacity={0.95} />}
      <rect x={-400} y={horizon} width={2720} height={1200} fill={`url(#${id}-sea)`} />
      {Array.from({ length: 26 }, (_, i) => {
        const y = horizon + 18 + Math.pow(i / 26, 1.6) * 520, x = ((i * 263 + f * (0.6 + i * 0.05)) % 2400) - 300;
        return <path key={i} d={`M ${x} ${y} q 30 -6 60 0`} stroke={mode === "night" ? "#2a3a6b" : "#ffffff"} strokeWidth={2 + i * 0.15} opacity={mode === "night" ? 0.7 : 0.45} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};
