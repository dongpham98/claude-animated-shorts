// 16:9 "lit 2.5D" kit for the long episodes (style upgrade 8 Nov 2026): grade, light pools, rays, depth props,
// object inserts, warning board, maps, clocks. Shared drawing pieces come from vshort.tsx (size-agnostic).
import React from "react";
import { INK, PAL, prog, lerp, clamp } from "./style";
import { FONT, FONT2 } from "./vshort";

export const W16 = 1920, H16 = 1080;
const st = (w = 6) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
export const L: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0, ...style }}>{children}</svg>
);

// ---------------------------------------------------------------- light + grade
export type Pool = { x: number; y: number; r: number; c: string; a?: number; flicker?: number };
const TINT: Record<string, [string, number]> = { warm: ["#ffcf94", 0.26], lamp: ["#ffb76b", 0.32], cool: ["#9fc3e8", 0.26], night: ["#3b5aa8", 0.48], dawn: ["#f7b28d", 0.28], dust: ["#e8b27a", 0.3], fire: ["#ff9a5a", 0.3], none: ["#ffffff", 0] };
export const Grade: React.FC<{ f: number; tint?: string; pools?: Pool[]; vig?: number; grain?: boolean; id: string }> = ({ f, tint = "warm", pools = [], vig = 0.5, grain = true, id }) => {
  const [tc, ta] = TINT[tint] ?? TINT.none;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: tc, opacity: ta, mixBlendMode: "multiply" }} />
      <L style={{ mixBlendMode: "screen" }}>
        <defs>{pools.map((p, i) => <radialGradient key={i} id={`pl-${id}-${i}`}><stop offset="0" stopColor={p.c} stopOpacity={1} /><stop offset="0.45" stopColor={p.c} stopOpacity={0.45} /><stop offset="1" stopColor={p.c} stopOpacity={0} /></radialGradient>)}</defs>
        {pools.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={`url(#pl-${id}-${i})`} opacity={(p.a ?? 0.5) * (1 + (p.flicker ?? 0) * (Math.sin(f * 0.9 + i) * 0.5 + Math.sin(f * 2.3 + i * 3) * 0.3))} />)}
      </L>
      <L>
        <defs>
          <radialGradient id={`vg-${id}`} cx="50%" cy="48%" r="72%"><stop offset="0.55" stopColor="#0d0810" stopOpacity={0} /><stop offset="1" stopColor="#0d0810" stopOpacity={vig} /></radialGradient>
          {grain && <filter id={`gr-${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 7} /><feColorMatrix type="saturate" values="0" /></filter>}
        </defs>
        <rect width={1920} height={1080} fill={`url(#vg-${id})`} />
        {grain && <rect width={1920} height={1080} filter={`url(#gr-${id})`} opacity={0.045} />}
      </L>
    </>
  );
};
export const Fg: React.FC<{ kind: "rail" | "rope" | "lamp" | "rivets" | "glass" | "chain" | "plant" | "wires" | "curtain"; f: number; side?: 1 | -1 }> = ({ kind, f, side = 1 }) => {
  const dx = Math.sin(f * 0.01) * 16;
  return (
    <L style={{ filter: "blur(10px)" }}>
      <g transform={`${side < 0 ? "translate(1920 0) scale(-1 1)" : ""} translate(${dx} 0)`}>
        {kind === "rail" && <g><rect x={-40} y={960} width={2000} height={40} rx={18} fill="#6b4226" /><rect x={-40} y={995} width={2000} height={26} fill="#3a2418" />{[60, 520, 980, 1440, 1900].map((x) => <rect key={x} x={x} y={995} width={30} height={200} fill="#4a2e1e" />)}</g>}
        {kind === "rope" && <g>{Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={20} cy={1070 - i * 24} rx={300 - i * 28} ry={64} fill="none" stroke={i % 2 ? "#a88452" : "#8a6a44"} strokeWidth={30} />)}</g>}
        {kind === "lamp" && <g><rect x={1700} y={-20} width={16} height={300} fill="#3a2a22" /><path d="M 1640 280 L 1776 280 L 1740 380 L 1676 380 Z" fill="#c99a3f" /><circle cx={1708} cy={392} r={56} fill="#ffe2a0" opacity={0.85} /></g>}
        {kind === "rivets" && <g><rect x={-20} y={0} width={170} height={1080} fill="#1c1a20" />{Array.from({ length: 7 }, (_, i) => <circle key={i} cx={80} cy={80 + i * 150} r={20} fill="#34303a" />)}</g>}
        {kind === "glass" && <g><rect x={1620} y={760} width={260} height={360} rx={30} fill="#3a5a72" opacity={0.6} /><rect x={1660} y={790} width={36} height={300} rx={18} fill="#cfe6f5" opacity={0.6} /></g>}
        {kind === "chain" && <g>{Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={1820 + (i % 2) * 8} cy={i * 130} rx={42} ry={70} fill="none" stroke="#4a4650" strokeWidth={24} transform={i % 2 ? `rotate(90 1820 ${i * 130})` : ""} />)}</g>}
        {kind === "plant" && <g>{Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={60 + Math.cos(i) * 70} cy={900 - i * 50} rx={90} ry={34} fill={i % 2 ? "#3f6b3a" : "#4f7d44"} transform={`rotate(${-30 + i * 12} 60 ${900 - i * 50})`} />)}<rect x={0} y={960} width={180} height={140} rx={20} fill="#8a5a36" /></g>}
        {kind === "wires" && <g>{[0, 1, 2].map((i) => <path key={i} d={`M -20 ${60 + i * 40} Q 600 ${180 + i * 30} 1940 ${80 + i * 50}`} fill="none" stroke="#2a2420" strokeWidth={14} />)}</g>}
        {kind === "curtain" && <g><path d="M -20 -20 L 260 -20 Q 200 400 260 1100 L -20 1100 Z" fill="#7b2f3a" /><path d="M 60 -20 Q 40 500 80 1100" stroke="#5a1f2a" strokeWidth={20} fill="none" /></g>}
      </g>
    </L>
  );
};
export const Rays: React.FC<{ f: number; x: number; y: number; ang?: number; c?: string; a?: number; spread?: number }> = ({ f, x, y, ang = 25, c = "#fff1c4", a = 0.2, spread = 1 }) => (
  <L style={{ mixBlendMode: "screen" }}>
    <defs><linearGradient id={`ry${x}${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity={a} /><stop offset="1" stopColor={c} stopOpacity={0} /></linearGradient></defs>
    <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${spread} 1)`}>{[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-90 + i * 70} 0 L ${-220 + i * 170} 1300 L ${-110 + i * 170} 1300 L ${-30 + i * 70} 0 Z`} fill={`url(#ry${x}${y})`} opacity={0.6 + 0.4 * Math.sin(f * 0.03 + i)} />)}</g>
    {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={x + ((i * 97 + f * 0.6) % 600) - 200} cy={y + 150 + ((i * 151 + f * 0.8) % 800)} r={3} fill={c} opacity={0.45} />)}
  </L>
);

// ---------------------------------------------------------------- text bits
export const Captions: React.FC<{ f: number; caps: { text: string; a: number; b: number }[]; hide?: boolean }> = ({ f, caps, hide }) => {
  const c = caps.find((p) => f >= p.a && f <= p.b);
  if (!c || hide) return null;
  return <div style={{ position: "absolute", left: 0, right: 0, bottom: 92, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 62, color: "#fff", WebkitTextStroke: "12px #1a1012", paintOrder: "stroke fill", textShadow: "0 5px 8px rgba(0,0,0,0.6)" }}>{c.text}</div>;
};
export const Watermark: React.FC = () => (
  <div style={{ position: "absolute", right: 40, bottom: 34, fontFamily: FONT2, fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.68)", letterSpacing: 0.3, WebkitTextStroke: "1.5px rgba(10,8,20,0.55)", paintOrder: "stroke fill", textShadow: "0 2px 4px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.55)" }}>@LeoKnowledgeSharing</div>
);
export const Stamp: React.FC<{ f: number; a: number; b: number; text: string; sub?: string }> = ({ f, a, b, text, sub }) => {
  if (f < a || f > b) return null;
  const p = prog(f, a, a + 7), q = prog(f, b - 6, b);
  return (
    <div style={{ position: "absolute", left: 70, top: 64, transform: `translateX(${(1 - p) * -60}px)`, opacity: p * (1 - q) }}>
      <div style={{ background: "#fbf4e4", border: `5px solid ${INK}`, borderRadius: 16, padding: "8px 22px", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: INK, boxShadow: "0 5px 0 rgba(42,27,22,0.35)" }}>{text}</div>
      {sub && <div style={{ marginTop: 8, display: "inline-block", background: "#2a1b16", borderRadius: 12, padding: "4px 16px", fontFamily: FONT2, fontWeight: 700, fontSize: 24, color: "#fbf4e4" }}>{sub}</div>}
    </div>
  );
};
export const Label: React.FC<{ f: number; a: number; b: number; x: number; y: number; text: string }> = ({ f, a, b, x, y, text }) => f < a || f > b ? null : (
  <div style={{ position: "absolute", left: x, top: y, transform: "translateX(-50%)", background: "#ffd84a", border: `4px solid ${INK}`, borderRadius: 14, padding: "4px 14px", fontFamily: FONT2, fontWeight: 700, fontSize: 24, color: INK, whiteSpace: "nowrap", opacity: prog(f, a, a + 5) }}>{text}</div>
);
/** chapter card: big word sliding in over a moving backdrop */
export const Chapter: React.FC<{ f: number; a: number; b: number; n: string; title: string; c?: string }> = ({ f, a, b, n, title, c = "#ffd84a" }) => {
  const p = prog(f, a, a + 8), q = prog(f, b - 6, b);
  return (
    <g opacity={1 - q}>
      <rect width={1920} height={1080} fill="#14101a" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={((i * 260 + (f - a) * 9) % 2400) - 300} y={0} width={120} height={1080} fill="#1e1826" transform="skewX(-12)" />)}
      <g transform={`translate(${lerp(-400, 960, p)} 540)`}>
        <text y={-70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={c} letterSpacing={8}>{n}</text>
        <text y={50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill="#fff4dc" stroke={INK} strokeWidth={12} paintOrder="stroke">{title}</text>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- inserts
export const Card: React.FC<{ f: number; a: number; b: number; x?: number; y?: number; rot?: number; s?: number; children: React.ReactNode; dim?: number }> = ({ f, a, b, x = 960, y = 520, rot = -3, s = 1, children, dim = 0.45 }) => {
  if (f < a || f > b) return null;
  const p = prog(f, a, a + 9), q = prog(f, b - 6, b), drift = clamp((f - a) / 300);
  return (
    <g>
      <rect width={1920} height={1080} fill="#120c10" opacity={dim * p * (1 - q)} />
      <g transform={`translate(${x} ${lerp(y + 700, y, p) - drift * 24 + q * 800}) rotate(${lerp(rot + 8, rot, p) + drift * 2}) scale(${s * (1 + drift * 0.05)})`}>{children}</g>
    </g>
  );
};
const paper = (w: number, h: number, c = "#fbf4e4") => <g><rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={12} fill="#000" opacity={0.25} /><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill={c} {...st(7)} /></g>;
/** Marconi form with a typed message (redrawn; text is the real message or a short faithful summary) */
export const Marconigram: React.FC<{ f: number; from: string; to: string; time: string; lines: string[]; typed?: number; stamp?: string; stampAt?: number; stampColor?: string; prefix?: string }> = ({ f, from, to, time, lines, typed = 1, stamp, stampAt = -99, stampColor = "#c0473f", prefix }) => {
  const total = lines.join("").length; let left = Math.floor(typed * total);
  const s = stamp && f >= stampAt ? 1 + Math.sin(clamp((f - stampAt) / 6) * Math.PI) * 0.2 : 0;
  return (
    <g>
      {paper(1000, 600, "#f6f0e2")}
      <rect x={-500} y={-300} width={1000} height={96} rx={12} fill="#dfe6ee" {...st(7)} />
      <text x={0} y={-262} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#2c3a5e" letterSpacing={2}>MARCONI INTERNATIONAL MARINE</text>
      <text x={0} y={-224} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={24} fill="#2c3a5e">COMMUNICATION CO. · WIRELESS MESSAGE</text>
      {prefix && <g transform="translate(380 -150)"><rect x={-70} y={-30} width={140} height={52} rx={10} fill="#ffd84a" {...st(5)} /><text y={8} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={34} fill={INK}>{prefix}</text></g>}
      <text x={-450} y={-150} fontFamily={FONT2} fontWeight={700} fontSize={30} fill="#5a4a3c">From: {from}</text>
      <text x={-450} y={-110} fontFamily={FONT2} fontWeight={700} fontSize={30} fill="#5a4a3c">To: {to}</text>
      <text x={-450} y={-70} fontFamily={FONT2} fontWeight={700} fontSize={30} fill="#5a4a3c">{time}</text>
      {[0, 1, 2, 3].map((i) => <line key={i} x1={-450} x2={450} y1={10 + i * 66} y2={10 + i * 66} stroke="#d9cdb3" strokeWidth={4} />)}
      {lines.map((l, i) => { const n = Math.max(0, Math.min(l.length, left)); left -= l.length; return <text key={i} x={-450} y={-2 + i * 66} fontFamily="Courier New, monospace" fontWeight={900} fontSize={40} fill="#22223a">{l.slice(0, n)}{n > 0 && n < l.length && Math.floor(f / 4) % 2 ? "▌" : ""}</text>; })}
      {s > 0 && <g transform={`translate(230 230) rotate(-8) scale(${s})`}><rect x={-230} y={-50} width={460} height={100} rx={16} fill="#fbf4e4" opacity={0.7} stroke={stampColor} strokeWidth={10} /><text y={18} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={46} fill={stampColor}>{stamp}</text></g>}
    </g>
  );
};
/** the running count of ice warnings (top right), with each card's fate */
export const FATES = ["BRIDGE", "POCKET", "WASHINGTON", "BRIDGE", "RADIO ROOM", "CUT OFF"];
export const WarnBoard: React.FC<{ f: number; n: number; times: number[]; fates?: number; big?: number }> = ({ f, n, times, fates = 0, big = 0 }) => {
  const s = lerp(0.46, 1, big), x = lerp(1640, 960, big), y = lerp(105, 470, big);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-470} y={-120} width={940} height={big > 0.5 ? 560 : 240} rx={24} fill="#1a2440" opacity={0.92} {...st(6)} />
      <text x={0} y={-72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#cfe6f5" letterSpacing={4}>ICE WARNINGS · 14 APRIL</text>
      {Array.from({ length: 6 }, (_, i) => {
        const on = i < n, t = times[i] ?? -99, pop = on ? 1 + Math.sin(clamp((f - t) / 7) * Math.PI) * 0.25 : 1;
        const cx = -375 + i * 150;
        return (
          <g key={i} transform={`translate(${cx} 30) scale(${pop})`}>
            <rect x={-60} y={-70} width={120} height={150} rx={14} fill={on ? "#fbf4e4" : "#2c3858"} {...st(5)} />
            {on && <path d="M -30 10 L 0 -40 L 30 10 Z" fill="#cfe6f5" {...st(4)} />}
            <text y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={on ? INK : "#53628a"}>{i + 1}</text>
            {fates > i && big > 0.5 && <g transform="translate(0 150) rotate(-8)"><rect x={-74} y={-28} width={148} height={56} rx={12} fill={FATES[i] === "BRIDGE" ? "#7fd08a" : "#ff8a7a"} {...st(4)} /><text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={FATES[i].length > 8 ? 18 : 24} fill={INK}>{FATES[i]}</text></g>}
          </g>
        );
      })}
    </g>
  );
};
export const Clock: React.FC<{ f: number; h: number; m: number; label?: string; spin?: number }> = ({ f, h, m, label, spin = 0 }) => {
  const mm = m + spin * f * 6, hh = h + mm / 60;
  return (
    <g>
      <circle r={150} fill="#fbf4e4" {...st(9)} /><circle r={150} fill="none" stroke={PAL.gold} strokeWidth={8} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-130} x2={0} y2={-110} stroke={INK} strokeWidth={i % 3 ? 5 : 9} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-75} stroke={INK} strokeWidth={12} strokeLinecap="round" transform={`rotate(${(hh % 12) * 30})`} />
      <line x1={0} y1={0} x2={0} y2={-112} stroke={INK} strokeWidth={7} strokeLinecap="round" transform={`rotate(${(mm % 60) * 6})`} />
      <circle r={12} fill="#c0473f" {...st(4)} />
      {label && <g transform="translate(0 210)"><rect x={-150} y={-42} width={300} height={78} rx={39} fill="#ffd84a" {...st(6)} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>{label}</text></g>}
    </g>
  );
};
export const Thermo: React.FC<{ f: number; v: number; label?: string }> = ({ v, label }) => (
  <g>
    <rect x={-50} y={-330} width={100} height={560} rx={50} fill="#fbf4e4" {...st(8)} />
    <rect x={-18} y={-290} width={36} height={430} rx={18} fill="#e9dcc0" {...st(4)} />
    <rect x={-18} y={lerp(140, -290, v)} width={36} height={lerp(0, 430, v)} rx={18} fill="#c0473f" />
    <circle cx={0} cy={180} r={56} fill="#c0473f" {...st(7)} />
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1={24} x2={46} y1={-270 + i * 55} y2={-270 + i * 55} stroke={INK} strokeWidth={5} />)}
    {label && <text x={0} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">{label}</text>}
  </g>
);
/** dinner menu card (redrawn; dishes from the surviving menu) */
export const Menu: React.FC<{ f: number; a: number; items: string[] }> = ({ f, a, items }) => (
  <g>
    {paper(640, 900, "#fbf6ea")}
    <rect x={-290} y={-420} width={580} height={840} rx={8} fill="none" stroke={PAL.gold} strokeWidth={6} />
    <text y={-340} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={44} fill={INK}>R.M.S. TITANIC</text>
    <text y={-292} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={30} fill="#6b4a36">April 14, 1912 · First Class</text>
    <path d="M -200 -260 L 200 -260" stroke={PAL.gold} strokeWidth={4} />
    {items.map((t, i) => <text key={i} y={-190 + i * 72} textAnchor="middle" fontFamily="Georgia, serif" fontSize={38} fill={INK} opacity={prog(f, a + i * 8, a + i * 8 + 6)}>{t}</text>)}
    <text y={380} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={24} fill="#8a6a44">redrawn from the surviving menu</text>
  </g>
);
/** big daily-run board (smoking room) */
export const RunBoard: React.FC<{ f: number; rows: [string, number, number][] }> = ({ f, rows }) => (
  <g>
    <rect x={-420} y={-280} width={840} height={560} rx={20} fill="#2b3a2c" {...st(8)} />
    <rect x={-400} y={-260} width={800} height={520} rx={14} fill="none" stroke="#8a6a44" strokeWidth={10} />
    <text y={-190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill="#f1ecdf" letterSpacing={4}>DAY'S RUN · NOON</text>
    {rows.map(([d, miles, t], i) => f >= t ? <g key={i} transform={`translate(0 ${-80 + i * 120}) scale(${1 + Math.sin(clamp((f - t) / 7) * Math.PI) * 0.12})`}><text x={-320} y={0} fontFamily={FONT2} fontWeight={700} fontSize={44} fill="#e9e3d2">{d}</text><text x={320} y={0} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={70} fill="#ffd84a">{Math.round(miles * prog(f, t, t + 20))} mi</text></g> : null)}
  </g>
);
/** simple top-down map of the North Atlantic with Titanic's track, Cape Race, ice and radio range */
export const AtlMap: React.FC<{ f: number; ship: number; range?: number; cape?: number; corner?: number; ice?: { x: number; y: number; t: number; label: string; c?: string }[]; children?: React.ReactNode }> = ({ f, ship, range = 0, cape = 0, corner = 0, ice = [], children }) => {
  const route: [number, number][] = [[1720, 330], [1320, 400], [960, 470], [700, 540], [560, 600], [300, 640]];
  const pathD = `M ${route.map((p) => p.join(" ")).join(" L ")}`;
  const seg = (t: number): [number, number] => { const n = route.length - 1, x = clamp(t) * n, i = Math.min(n - 1, Math.floor(x)), u = x - i; return [lerp(route[i][0], route[i + 1][0], u), lerp(route[i][1], route[i + 1][1], u)]; };
  const [sx, sy] = seg(ship);
  return (
    <g>
      <rect width={1920} height={1080} fill="#9fc3d9" />
      {Array.from({ length: 14 }, (_, i) => <line key={i} x1={0} x2={1920} y1={i * 80} y2={i * 80} stroke="#b7d4e6" strokeWidth={2} />)}
      {Array.from({ length: 24 }, (_, i) => <line key={i} y1={0} y2={1080} x1={i * 80} x2={i * 80} stroke="#b7d4e6" strokeWidth={2} />)}
      <path d="M 1700 120 L 1800 140 L 1860 230 L 1920 260 L 1920 520 L 1840 470 L 1780 400 L 1760 330 L 1700 300 L 1690 220 Z" fill="#b9cf8e" {...st(4)} />
      <text x={1810} y={340} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={26} fill="#5b6b3a">IRELAND</text>
      <path d="M 0 360 L 120 330 L 200 380 L 240 470 L 190 520 L 110 530 L 0 560 Z" fill="#b9cf8e" {...st(4)} />
      <text x={110} y={450} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={24} fill="#5b6b3a">NEWFOUNDLAND</text>
      <path d="M 0 700 L 160 720 L 200 860 L 120 1080 L 0 1080 Z" fill="#b9cf8e" {...st(4)} />
      <text x={960} y={980} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#7d9db0" letterSpacing={10}>NORTH ATLANTIC</text>
      <path d={pathD} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="16 14" opacity={0.8} />
      {corner > 0 && <g opacity={corner} transform="translate(700 540)"><circle r={22} fill="#ffd84a" {...st(5)} /><text y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={INK}>THE CORNER</text><text y={60} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={24} fill={INK}>42°N 47°W</text></g>}
      {cape > 0 && <g opacity={cape} transform="translate(230 505)"><path d="M -20 30 L 0 -50 L 20 30 Z" fill="#c0473f" {...st(4)} /><line x1={0} y1={-50} x2={0} y2={-90} stroke={INK} strokeWidth={5} /><text x={30} y={-60} fontFamily={FONT} fontWeight={900} fontSize={32} fill={INK}>CAPE RACE</text>{range > 0 && <circle r={lerp(0, 420, range)} fill="#c0473f" opacity={0.1} stroke="#c0473f" strokeWidth={5} strokeDasharray="20 14" />}</g>}
      {range > 0 && <circle cx={sx} cy={sy} r={lerp(0, 380, range)} fill="#2c3a5e" opacity={0.1} stroke="#2c3a5e" strokeWidth={5} strokeDasharray="20 14" />}
      {ice.map((p, i) => f >= p.t ? <g key={i} transform={`translate(${p.x} ${p.y}) scale(${prog(f, p.t, p.t + 8)})`}><path d="M -30 16 L -12 -30 L 6 -8 L 18 -34 L 34 16 Z" fill="#eef6fb" {...st(4)} /><g transform="translate(0 44)"><rect x={-90} y={-22} width={180} height={44} rx={22} fill={p.c ?? "#fff7e6"} {...st(4)} /><text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={INK}>{p.label}</text></g></g> : null)}
      <g transform={`translate(${sx} ${sy}) rotate(${-10})`}><path d="M -40 -10 L 30 -10 L 44 0 L 30 10 L -40 10 Z" fill="#26232a" {...st(4)} />{[-20, -5, 10].map((x) => <rect key={x} x={x} y={-6} width={8} height={12} fill={PAL.funnelBuff} />)}</g>
      {children}
    </g>
  );
};
