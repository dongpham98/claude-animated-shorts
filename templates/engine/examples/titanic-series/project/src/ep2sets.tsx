// Episode 2 sets (16:9): gym, third-class general room, smoking room, second-class saloon, wireless cut-away, small props.
import React from "react";
import { INK, PAL, prog, lerp, clamp } from "./style";
import { FONT, FONT2 } from "./vshort";

const st = (w = 5) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });

export const Dog: React.FC<{ f: number; x: number; y: number; s?: number; walk?: boolean }> = ({ f, x, y, s = 1, walk = true }) => {
  const ph = walk ? f * 0.45 : 0, wag = Math.sin(f * 0.6) * 18;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[[-50, 1], [-25, -1], [40, 1], [62, -1]].map(([lx, d], i) => <rect key={i} x={lx} y={-10} width={16} height={46} rx={7} fill={i % 2 ? "#8a5a2c" : "#a26a34"} {...st(4)} transform={`rotate(${Math.sin(ph + i) * 18 * (d as number)} ${(lx as number) + 8} -10)`} />)}
      <ellipse cx={0} cy={-26} rx={80} ry={34} fill="#3a2a22" {...st(5)} />
      <ellipse cx={-10} cy={-12} rx={62} ry={20} fill="#b07a40" />
      <path d={`M -78 -40 q -20 -20 ${-10 + wag * 0.3} -50`} fill="none" stroke="#3a2a22" strokeWidth={10} strokeLinecap="round" />
      <g transform="translate(78 -52)">
        <rect x={-16} y={-34} width={62} height={56} rx={18} fill="#b07a40" {...st(5)} />
        <rect x={30} y={-12} width={34} height={30} rx={10} fill="#b07a40" {...st(4)} />
        <path d="M -12 -32 L -20 -56 L 6 -40 Z" fill="#8a5a2c" {...st(4)} />
        <circle cx={18} cy={-14} r={5} fill={INK} /><circle cx={62} cy={-2} r={7} fill={INK} />
      </g>
    </g>
  );
};
export const Bear: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={20} rx={34} ry={40} fill="#f6f3ea" {...st(4)} />
    <circle cx={0} cy={-36} r={30} fill="#f6f3ea" {...st(4)} />
    <circle cx={-24} cy={-60} r={12} fill="#f6f3ea" {...st(4)} /><circle cx={24} cy={-60} r={12} fill="#f6f3ea" {...st(4)} />
    <ellipse cx={0} cy={-26} rx={14} ry={10} fill="#ece4d2" {...st(3)} /><circle cx={0} cy={-30} r={4} fill={INK} />
    <circle cx={-11} cy={-42} r={3.5} fill={INK} /><circle cx={11} cy={-42} r={3.5} fill={INK} />
    <ellipse cx={-34} cy={8} rx={12} ry={20} fill="#f6f3ea" {...st(4)} transform="rotate(25 -34 8)" /><ellipse cx={34} cy={8} rx={12} ry={20} fill="#f6f3ea" {...st(4)} transform="rotate(-25 34 8)" />
  </g>
);

export const Gym: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g>
    <rect width={1920} height={1080} fill="#eef0ea" />
    {Array.from({ length: 16 }, (_, i) => Array.from({ length: 6 }, (_, j) => <rect key={`${i}-${j}`} x={i * 120} y={j * 120} width={120} height={120} fill="none" stroke="#dfe2da" strokeWidth={3} />))}
    {[260, 960, 1660].map((x) => <g key={x} transform={`translate(${x} 250)`}><rect x={-150} y={-110} width={300} height={220} rx={20} fill="#cfe3ee" {...st(6)} /><path d="M 0 -110 L 0 110 M -150 0 L 150 0" stroke="#fff" strokeWidth={8} /></g>)}
    <rect y={740} width={1920} height={340} fill="#c9a36a" {...st(5)} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 170} y={740} width={170} height={340} fill={i % 2 ? "#d4ae74" : "#c9a36a"} />)}
    {/* electric camel */}
    <g transform={`translate(560 760) rotate(${Math.sin(f * 0.18) * 4})`}>
      <rect x={-12} y={-140} width={24} height={140} fill="#6b6f7d" {...st(4)} />
      <path d="M -150 -200 Q -100 -290 -40 -210 Q 0 -280 60 -210 L 120 -200 L 150 -260 L 190 -250 L 170 -180 L 120 -150 L -150 -150 Z" fill="#c99a66" {...st(6)} />
      <rect x={-70} y={-232} width={70} height={26} rx={8} fill="#7b2f3a" {...st(4)} />
    </g>
    {/* rowing machine + punching ball */}
    <g transform="translate(1180 760)"><rect x={-180} y={-40} width={360} height={40} rx={10} fill="#8a5a36" {...st(5)} /><rect x={-60 + Math.sin(f * 0.15) * 50} y={-70} width={80} height={30} rx={8} fill="#7b2f3a" {...st(4)} /><path d={`M 150 -40 L ${100 + Math.sin(f * 0.15) * 40} -120`} {...st(10)} /></g>
    <g transform="translate(1560 300)"><line x1={0} y1={-300} x2={0} y2={0} {...st(5)} /><ellipse cx={Math.sin(f * 0.3) * 20} cy={60} rx={60} ry={80} fill="#a5532d" {...st(5)} /></g>
    {children}
  </g>
);
export const GeneralRoom: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g>
    <rect width={1920} height={1080} fill="#f3efe4" />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200} y={0} width={14} height={760} fill="#e1dccd" />)}
    {[400, 1100, 1700].map((x) => <g key={x} transform={`translate(${x} 260)`}><circle r={70} fill="#9fc3d9" {...st(10)} stroke="#b89a6a" /><circle r={70} fill="none" {...st(4)} /></g>)}
    <rect y={740} width={1920} height={340} fill="#b7957a" {...st(4)} />
    {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 150} y1={740} x2={i * 150 - 60} y2={1080} stroke="#a4836a" strokeWidth={4} />)}
    {/* upright piano */}
    <g transform="translate(1500 760)">
      <rect x={-200} y={-300} width={400} height={300} rx={10} fill="#5a3520" {...st(6)} />
      <rect x={-190} y={-130} width={380} height={40} fill="#fbf8f2" {...st(4)} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-180 + i * 32} y={-130} width={14} height={24} fill={INK} />)}
      {[0, 1, 2].map((i) => { const t = ((f * 1.5 + i * 25) % 75) / 75; return <text key={i} x={-60 + i * 50 + t * 60} y={-330 - t * 160} fontFamily={FONT} fontWeight={900} fontSize={60} fill="#7b4a8c" opacity={1 - t}>♪</text>; })}
    </g>
    {/* benches */}
    <rect x={120} y={880} width={700} height={40} rx={10} fill="#c9a36a" {...st(5)} />
    {children}
  </g>
);
export const SmokingRoom: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g>
    <rect width={1920} height={1080} fill="#4a2e1e" />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 250 - 20} y={60} width={210} height={640} rx={6} fill="#5a3824" {...st(3)} />)}
    {[300, 1620].map((x) => <g key={x} transform={`translate(${x} 300)`}><rect x={-120} y={-170} width={240} height={340} rx={10} fill="#8fb3c9" {...st(6)} />{Array.from({ length: 4 }, (_, i) => <rect key={i} x={-110 + (i % 2) * 110} y={-160 + Math.floor(i / 2) * 165} width={100} height={150} fill={["#c99a3f", "#7b4a8c", "#3f7a5a", "#c0473f"][i]} opacity={0.65} />)}</g>)}
    <g transform="translate(960 620)"><rect x={-180} y={-160} width={360} height={240} fill="#3a2418" {...st(6)} /><rect x={-120} y={-100} width={240} height={160} fill="#1a0f0a" {...st(4)} /><ellipse cx={0} cy={30} rx={90} ry={26} fill="#ff8a3a" opacity={0.7 + 0.3 * Math.sin(f * 0.6)} /><ellipse cx={0} cy={22} rx={50} ry={16} fill="#ffd84a" opacity={0.8 + 0.2 * Math.sin(f * 0.9)} /></g>
    <rect y={760} width={1920} height={320} fill="#6b3a2a" {...st(4)} />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200} y={760} width={100} height={320} fill="#5a2e22" opacity={0.6} />)}
    {children}
  </g>
);
export const Saloon2: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g>
    <rect width={1920} height={1080} fill="#e9dcc4" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 230 - 40} y={80} width={190} height={620} rx={8} fill="#dccab0" {...st(3)} />)}
    {[200, 960, 1720].map((x) => <g key={x}><line x1={x} y1={0} x2={x} y2={110} stroke={INK} strokeWidth={4} /><circle cx={x} cy={130} r={22} fill="#fff3c2" {...st(3)} /></g>)}
    <rect y={700} width={1920} height={380} fill="#8a5a36" {...st(4)} />
    {/* small piano at the side */}
    <g transform="translate(1600 760)"><rect x={-170} y={-240} width={340} height={240} rx={8} fill="#5a3520" {...st(5)} /><rect x={-160} y={-110} width={320} height={34} fill="#fbf8f2" {...st(3)} /></g>
    {children}
    <path d="M 120 880 L 1300 880 L 1340 1000 L 80 1000 Z" fill="#fbf8f2" {...st(5)} />
    {[300, 640, 980].map((x) => <g key={x} transform={`translate(${x} 900) rotate(-6)`}><rect x={-46} y={-30} width={92} height={60} rx={4} fill="#7b2f3a" {...st(3)} /><line x1={0} y1={-30} x2={0} y2={30} stroke="#5a1f2a" strokeWidth={4} /></g>)}
  </g>
);

/** how 1912 wireless worked: key -> spark -> waves -> headphones; a second ship jams the first */
export const WirelessMech: React.FC<{ f: number; a: number; jam: number }> = ({ f, a, jam }) => {
  const key = Math.floor((f - a) / 6) % 3 !== 2, wave = (f - a) * 6;
  const ring = (cx: number, cy: number, c: string, off: number, max: number) => Array.from({ length: 5 }, (_, i) => { const r = ((wave + off + i * 80) % 400); return r < max ? <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth={8} opacity={1 - r / max} /> : null; });
  return (
    <g>
      <rect width={1920} height={1080} fill="#e9eef2" />
      {Array.from({ length: 24 }, (_, i) => <line key={i} x1={i * 80} y1={0} x2={i * 80} y2={1080} stroke="#dde5ec" strokeWidth={2} />)}
      {/* sender */}
      <g transform="translate(330 700)">
        <rect x={-150} y={-30} width={300} height={40} rx={10} fill="#3a3d4a" {...st(5)} />
        <path d={`M -110 -40 L 120 ${key ? -40 : -80}`} {...st(14)} />
        <circle cx={124} cy={key ? -44 : -84} r={20} fill="#2b2b38" {...st(5)} />
        <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={INK}>MORSE KEY</text>
      </g>
      <g transform="translate(650 600)">
        <rect x={-90} y={-60} width={180} height={120} rx={14} fill="#5a3a24" {...st(5)} />
        <circle cx={-26} cy={0} r={18} fill="#e9dcc0" {...st(4)} /><circle cx={26} cy={0} r={18} fill="#e9dcc0" {...st(4)} />
        {key && <path d={`M -10 ${-6 + Math.sin(f) * 6} L 0 6 L 10 -8`} stroke="#4fb8ff" strokeWidth={8} fill="none" />}
        <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={INK}>SPARK</text>
      </g>
      <line x1={650} y1={540} x2={650} y2={200} {...st(8)} />
      {key && ring(650, 200, "#4fb8ff", 0, 380)}
      {/* receiver */}
      <g transform="translate(1500 640)">
        <path d="M -110 -40 Q 0 -180 110 -40" fill="none" {...st(16)} />
        <rect x={-150} y={-70} width={70} height={110} rx={26} fill="#2b2b38" {...st(5)} /><rect x={80} y={-70} width={70} height={110} rx={26} fill="#2b2b38" {...st(5)} />
        <text y={130} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={INK}>HEADPHONES</text>
        {key && <text y={-170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill="#2c3a5e">bzz-bzz</text>}
      </g>
      {jam > 0 && <g opacity={jam}>
        <line x1={1200} y1={1000} x2={1200} y2={300} {...st(8)} />
        {ring(1200, 300, "#c0473f", 40, 340)}
        <text x={1200} y={1050} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#c0473f">SECOND SHIP</text>
        <g transform={`translate(1500 360) rotate(${Math.sin(f * 0.8) * 6})`}><rect x={-170} y={-50} width={340} height={90} rx={45} fill="#ff8a7a" {...st(6)} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>JAMMED!</text></g>
      </g>}
    </g>
  );
};
