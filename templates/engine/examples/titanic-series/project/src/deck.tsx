// Boat deck at golden hour, looking inboard: sky, four buff funnels with smoke, the white deckhouse, teak deck,
// a lifeboat hanging in the foreground. Each layer moves with its own parallax factor for a sense of depth.
import React from "react";
import { PAL, INK, BG_LINE } from "./style";

const st = { stroke: INK, strokeWidth: BG_LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const L = (camX: number, par: number, children: React.ReactNode, extra = "") => (
  <g transform={`translate(${-camX * par} 0) ${extra}`}>{children}</g>
);

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -120 20 Q -130 -10 -96 -14 Q -90 -46 -52 -40 Q -30 -70 8 -54 Q 40 -74 66 -44 Q 110 -48 112 -12 Q 140 0 120 22 Z"
      fill="#fde6cf" stroke="#e8b59a" strokeWidth={4} strokeLinejoin="round" />
    <path d="M -110 18 Q 0 6 118 20" fill="none" stroke="#f3c3a4" strokeWidth={6} opacity={0.7} />
  </g>
);

const Funnel: React.FC<{ x: number; smoke: boolean; f: number; seed: number }> = ({ x, smoke, f, seed }) => {
  const top = 150, base = 640, w = 74, rake = 46;
  const puffs: React.ReactNode[] = [];
  if (smoke) {
    for (let k = 0; k < 9; k++) {
      const age = ((f + seed * 7 + k * 12) % 108);
      const t = age / 108;
      const px = x + rake + age * 1.35 + Math.sin((age + seed * 20) / 9) * 6;
      const py = top - 10 - age * 1.05;
      const r = 20 + age * 0.55;
      puffs.push(<circle key={k} cx={px} cy={py} r={r} fill="#ece0d0" stroke="#d1bba3" strokeWidth={3} opacity={(1 - t) * 0.85} />);
    }
  }
  return (
    <g>
      {puffs}
      {/* guy wires */}
      <path d={`M ${x - w + 22} ${top + 120} L ${x - w - 150} ${base}`} stroke="#5b4a40" strokeWidth={2} />
      <path d={`M ${x + w + 36} ${top + 120} L ${x + w + 210} ${base}`} stroke="#5b4a40" strokeWidth={2} />
      <path d={`M ${x - w} ${base} L ${x - w + rake} ${top} Q ${x + rake} ${top - 14} ${x + w + rake} ${top} L ${x + w} ${base} Z`} fill={PAL.funnelBuff} {...st} />
      <path d={`M ${x + w * 0.35} ${base} L ${x + w * 0.35 + rake} ${top} Q ${x + w * 0.7 + rake} ${top - 8} ${x + w + rake} ${top} L ${x + w} ${base} Z`} fill={PAL.funnelBuffDark} opacity={0.75} />
      <path d={`M ${x - w + rake * 0.83} ${top + 80} L ${x - w + rake} ${top} Q ${x + rake} ${top - 14} ${x + w + rake} ${top} L ${x + w + rake * 0.83} ${top + 80} Q ${x + rake * 0.83} ${top + 92} ${x - w + rake * 0.83} ${top + 80} Z`} fill={PAL.funnelBlack} {...st} />
      <ellipse cx={x + rake} cy={top} rx={w} ry={13} fill="#4a3f3c" {...st} />
      <ellipse cx={x + rake} cy={top + 2} rx={w - 14} ry={8} fill="#1b1617" />
      {/* steam pipe in front */}
      <path d={`M ${x - w * 0.5} ${base} L ${x - w * 0.5 + rake * 1.02} ${top - 18}`} stroke={INK} strokeWidth={13} strokeLinecap="round" />
      <path d={`M ${x - w * 0.5} ${base} L ${x - w * 0.5 + rake * 1.02} ${top - 18}`} stroke="#c9b9a0" strokeWidth={7} strokeLinecap="round" />
      <path d={`M ${x - w + 8} ${base - 140} L ${x - w + 8 + rake * 0.28} ${base - 260}`} stroke="#fff" strokeOpacity={0.25} strokeWidth={8} strokeLinecap="round" />
    </g>
  );
};

const Cowl: React.FC<{ x: number; y: number; s: number; flip?: boolean }> = ({ x, y, s, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <rect x={-10} y={-40} width={20} height={42} fill={PAL.funnelBuff} {...st} />
    <path d="M -10 -40 Q -12 -74 22 -76 Q 40 -74 40 -52 L 22 -52 Q 18 -60 10 -56 L 10 -40 Z" fill={PAL.funnelBuff} {...st} />
    <ellipse cx={31} cy={-63} rx={8} ry={12} fill="#7a2f2a" {...st} strokeWidth={2.4} />
  </g>
);

const Window: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g>
    <rect x={x - 42} y={y - 56} width={84} height={112} rx={14} fill="#9b6a3f" {...st} />
    <rect x={x - 32} y={y - 46} width={64} height={92} rx={9} fill={PAL.glass} stroke={INK} strokeWidth={2.4} />
    <path d={`M ${x - 32} ${y - 4} L ${x + 32} ${y - 4}`} stroke="#9b6a3f" strokeWidth={5} />
    <path d={`M ${x - 22 + (f * 0.15) % 18} ${y + 40} L ${x + 12 + (f * 0.15) % 18} ${y - 42}`} stroke={PAL.glassLight} strokeWidth={10} opacity={0.55} strokeLinecap="round" />
    <path d={`M ${x + 2 + (f * 0.15) % 18} ${y + 40} L ${x + 22 + (f * 0.15) % 18} ${y - 10}`} stroke={PAL.glassLight} strokeWidth={4} opacity={0.4} strokeLinecap="round" />
  </g>
);

const Door: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 50} y={y - 150} width={100} height={182} rx={10} fill="#a5703f" {...st} />
    <rect x={x - 36} y={y - 136} width={72} height={64} rx={6} fill={PAL.glass} stroke={INK} strokeWidth={2.4} />
    <rect x={x - 36} y={y - 60} width={72} height={78} rx={6} fill="#8d5c31" stroke={INK} strokeWidth={2} />
    <circle cx={x + 32} cy={y - 50} r={5} fill={PAL.gold} stroke={INK} strokeWidth={1.6} />
  </g>
);

const Lifeboat: React.FC = () => (
  <g>
    {/* davit arms */}
    <path d="M 40 -60 Q 40 60 110 90" fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" />
    <path d="M 40 -60 Q 40 60 110 90" fill="none" stroke="#e9e3d8" strokeWidth={17} strokeLinecap="round" />
    <path d="M 560 -60 Q 560 60 630 90" fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" />
    <path d="M 560 -60 Q 560 60 630 90" fill="none" stroke="#e9e3d8" strokeWidth={17} strokeLinecap="round" />
    <path d="M 110 90 L 110 120 M 630 90 L 630 120" stroke="#4a3a30" strokeWidth={4} />
    {/* hull */}
    <path d="M -60 120 Q 360 104 760 120 Q 720 210 560 236 Q 360 252 160 236 Q 0 214 -60 120 Z" fill={PAL.boatHull} {...st} />
    <path d="M -40 150 Q 360 160 744 148 Q 720 200 560 228 Q 360 244 160 228 Q 10 208 -40 150 Z" fill="#dcd3c4" opacity={0.9} />
    <path d="M -60 120 Q 360 104 760 120 L 756 134 Q 360 118 -56 134 Z" fill={PAL.boatTrim} {...st} />
    <path d="M -20 118 Q 360 70 720 118" fill={PAL.canvas} {...st} />
  </g>
);

const Bench: React.FC = () => (
  <g>
    <rect x={-10} y={40} width={22} height={150} fill="#5b3b22" {...st} />
    <rect x={360} y={40} width={22} height={150} fill="#5b3b22" {...st} />
    {[0, 34, 68].map((y) => <rect key={y} x={-60} y={y - 60} width={500} height={26} rx={6} fill="#b98656" {...st} />)}
    <rect x={-60} y={44} width={500} height={28} rx={6} fill="#c69462" {...st} />
  </g>
);

export const DECK_FLOOR = 830;

export const Deck: React.FC<{ f: number; camX: number; zoom: number; stage: React.ReactNode }> = ({ f, camX, zoom, stage }) => {
  // deck planks with perspective spacing
  const planks: React.ReactNode[] = [];
  let y = DECK_FLOOR, h = 14, i = 0;
  while (y < 1120) {
    planks.push(<rect key={`p${i}`} x={-600} y={y} width={3600} height={h} fill={i % 2 ? PAL.deckWood : "#cfa26e"} />);
    planks.push(<line key={`l${i}`} x1={-600} y1={y} x2={3000} y2={y} stroke={PAL.deckLine} strokeWidth={1.4 + i * 0.12} opacity={0.7} />);
    for (let k = 0; k < 9; k++) {
      const sx = ((k * 431 + i * 173) % 3400) - 500;
      planks.push(<line key={`s${i}-${k}`} x1={sx} y1={y} x2={sx} y2={y + h} stroke={PAL.deckLine} strokeWidth={1.4} opacity={0.6} />);
    }
    y += h; h *= 1.16; i++;
  }
  const gx = -100 + ((f * 6.2) % 2300), gy = 300 + Math.sin(f / 9) * 14, flap = Math.sin(f * 0.55) * 14;
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAL.skyTop} /><stop offset="0.5" stopColor={PAL.skyMid} /><stop offset="0.72" stopColor={PAL.skyLow} />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff6d6" stopOpacity="1" /><stop offset="0.35" stopColor="#ffe3a0" stopOpacity="0.8" /><stop offset="1" stopColor="#ffd08a" stopOpacity="0" /></radialGradient>
        <radialGradient id="glow" cx="0.18" cy="0.35" r="0.9"><stop offset="0" stopColor="#ffd9a0" stopOpacity="0.32" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
        <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.65" stopColor="#1a0f1e" stopOpacity="0" /><stop offset="1" stopColor="#1a0f1e" stopOpacity="0.32" /></radialGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e7dccb" /><stop offset="0.18" stopColor={PAL.wall} /><stop offset="1" stopColor="#eadfcd" /></linearGradient>
        <filter id="fgblur"><feGaussianBlur stdDeviation="3.5" /></filter>
      </defs>
      <g transform={`translate(960 540) scale(${zoom}) translate(-960 -540)`}>
        {/* sky */}
        <rect x={-200} y={-200} width={2400} height={1300} fill="url(#sky)" />
        {L(camX, 0.06, <g>
          <circle cx={360} cy={520} r={260} fill="url(#sun)" />
          <circle cx={360} cy={520} r={62} fill={PAL.sun} stroke="#ffd98f" strokeWidth={4} />
        </g>)}
        {L(camX, 0.1, <g>
          <Cloud x={700 + f * 0.25} y={250} s={1.2} /><Cloud x={1500 + f * 0.2} y={160} s={0.9} /><Cloud x={180 + f * 0.3} y={130} s={0.7} /><Cloud x={2150 + f * 0.25} y={300} s={1.0} />
        </g>)}
        {/* seagull */}
        {L(camX, 0.15, <path d={`M ${gx - 26} ${gy - flap} Q ${gx - 12} ${gy - 8} ${gx} ${gy} Q ${gx + 12} ${gy - 8} ${gx + 26} ${gy - flap}`} fill="none" stroke="#3a2b2e" strokeWidth={4} strokeLinecap="round" />)}
        {/* funnels */}
        {L(camX, 0.42, <g>
          <Funnel x={180} smoke f={f} seed={1} /><Funnel x={720} smoke f={f} seed={2} /><Funnel x={1260} smoke f={f} seed={3} /><Funnel x={1800} smoke={false} f={f} seed={4} />
        </g>)}
        {/* roof vents */}
        {L(camX, 0.6, <g>
          <Cowl x={40} y={572} s={1.1} /><Cowl x={520} y={572} s={0.95} flip /><Cowl x={1020} y={572} s={1.15} /><Cowl x={1580} y={572} s={1} flip /><Cowl x={2060} y={572} s={1.1} />
        </g>)}
        {/* deckhouse */}
        {L(camX, 0.78, <g>
          <rect x={-600} y={560} width={3600} height={290} fill="url(#wall)" {...st} />
          <rect x={-600} y={548} width={3600} height={22} fill="#e9e1d4" {...st} />
          {Array.from({ length: 22 }, (_, k) => <line key={k} x1={-600 + k * 170} y1={570} x2={-600 + k * 170} y2={830} stroke="#d6cab6" strokeWidth={3} />)}
          <rect x={-600} y={570} width={3600} height={26} fill="rgba(110,70,60,0.14)" />
          {Array.from({ length: 16 }, (_, k) => {
            const wx = -440 + k * 230;
            return k % 4 === 2 ? <Door key={k} x={wx} y={800} /> : <Window key={k} x={wx} y={694} f={f} />;
          })}
          <rect x={-600} y={812} width={3600} height={22} fill="#9b6a3f" {...st} />
        </g>)}
        {/* deck + characters */}
        {L(camX, 1, <g>{planks}<rect x={-600} y={DECK_FLOOR} width={3600} height={60} fill="rgba(80,40,30,0.18)" />{stage}</g>)}
        {/* foreground */}
        {L(camX, 1.35, <g filter="url(#fgblur)">
          <g transform="translate(-120 1010) scale(1.15)"><Bench /></g>
        </g>)}
        <rect x={-200} y={-200} width={2400} height={1400} fill="url(#glow)" />
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#vig)" />
    </svg>
  );
};
