// Vertical Short kit (1080x1920) for the Titanic chibi series: crops of 16:9 sets + "lit 2.5D" grade + object inserts.
// Style-upgrade rules (claude/style-upgrade-2026-11-08.md): light pools, vignette, warm/cool grade, blurred foreground prop,
// an object insert every few seconds, 1-3 word captions, watermark.
import React from "react";
import { staticFile, delayRender, continueRender } from "remotion";
import { INK, prog, lerp, clamp } from "./style";

export const VW = 1080, VH = 1920;
export const FONT = "CapBlack, Montserrat, sans-serif";
export const FONT2 = "WmBold, Montserrat, sans-serif";

// ---------------------------------------------------------------- fonts
let fontP: Promise<void> | null = null;
const loadFonts = () => (fontP ??= Promise.all([
  new FontFace("WmBold", `url(${staticFile("fonts/montserrat-latin-700-normal.woff2")})`, { weight: "700" }).load(),
  new FontFace("CapBlack", `url(${staticFile("fonts/montserrat-latin-900-normal.woff2")})`, { weight: "900" }).load(),
]).then((ff) => { ff.forEach((x) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(x)); }).catch(() => undefined));
export const useFonts = () => {
  const [ok, setOk] = React.useState(false);
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { loadFonts().then(() => { setOk(true); continueRender(h); }); }, [h]);
  return ok;
};

// ---------------------------------------------------------------- the window onto a 1920x1080 set
/** shows the part of a landscape set centred on (cx, cy); z = 1 fills the height (608 x 1080 of the set) */
export const Win: React.FC<{ cx: number; cy?: number; z?: number; rot?: number; children: React.ReactNode }> = ({ cx, cy = 540, z = 1, rot = 0, children }) => {
  const h = 1080 / z, w = h * (VW / VH);
  const x = clamp(cx - w / 2, -400, 1920 + 400 - w), y = clamp(cy - h / 2, -300, 1080 + 300 - h);
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={VW} height={VH} preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
      <g transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined}>{children}</g>
    </svg>
  );
};
/** full-frame vertical svg layer */
export const V: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg viewBox={`0 0 ${VW} ${VH}`} width={VW} height={VH} style={{ position: "absolute", inset: 0, ...style }}>{children}</svg>
);

// ---------------------------------------------------------------- light + grade
export type Pool = { x: number; y: number; r: number; c: string; a?: number; flicker?: number };
const TINT: Record<string, [string, number]> = { warm: ["#ffcf94", 0.28], lamp: ["#ffb76b", 0.34], cool: ["#9fc3e8", 0.26], night: ["#3b5aa8", 0.5], dawn: ["#f7b28d", 0.3], dust: ["#e8b27a", 0.32], none: ["#ffffff", 0] };
/** colour grade + glowing light pools + vignette + fine grain, drawn over the set */
export const Grade: React.FC<{ f: number; tint?: keyof typeof TINT; pools?: Pool[]; vig?: number; grain?: boolean; id: string }> = ({ f, tint = "warm", pools = [], vig = 0.55, grain = true, id }) => {
  const [tc, ta] = TINT[tint];
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: tc, opacity: ta, mixBlendMode: "multiply" }} />
      <V style={{ mixBlendMode: "screen" }}>
        <defs>{pools.map((p, i) => <radialGradient key={i} id={`pl-${id}-${i}`}><stop offset="0" stopColor={p.c} stopOpacity={1} /><stop offset="0.45" stopColor={p.c} stopOpacity={0.45} /><stop offset="1" stopColor={p.c} stopOpacity={0} /></radialGradient>)}</defs>
        {pools.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={`url(#pl-${id}-${i})`} opacity={(p.a ?? 0.55) * (1 + (p.flicker ?? 0) * (Math.sin(f * 0.9 + i) * 0.5 + Math.sin(f * 2.3 + i * 3) * 0.3))} />)}
      </V>
      <V>
        <defs>
          <radialGradient id={`vg-${id}`} cx="50%" cy="46%" r="75%"><stop offset="0.5" stopColor="#0d0810" stopOpacity={0} /><stop offset="1" stopColor="#0d0810" stopOpacity={vig} /></radialGradient>
          {grain && <filter id={`gr-${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 7} /><feColorMatrix type="saturate" values="0" /></filter>}
        </defs>
        <rect width={VW} height={VH} fill={`url(#vg-${id})`} />
        {grain && <rect width={VW} height={VH} filter={`url(#gr-${id})`} opacity={0.05} />}
      </V>
    </>
  );
};
/** out-of-focus foreground prop (depth layer) */
export const Fg: React.FC<{ kind: "rail" | "rope" | "lamp" | "rivets" | "frame" | "glass" | "chain"; f: number; side?: 1 | -1; drift?: number }> = ({ kind, f, side = 1, drift = 0 }) => {
  const dx = Math.sin(f * 0.01) * 14 + drift;
  const flip = side < 0 ? `translate(${VW} 0) scale(-1 1)` : "";
  return (
    <V style={{ filter: "blur(9px)" }}>
      <g transform={`${flip} translate(${dx} 0)`}>
        {kind === "rail" && <g><rect x={-40} y={1660} width={1200} height={44} rx={20} fill="#6b4226" /><rect x={-40} y={1700} width={1200} height={30} fill="#3a2418" />{[80, 400, 720, 1040].map((x) => <rect key={x} x={x} y={1700} width={34} height={300} fill="#4a2e1e" />)}</g>}
        {kind === "rope" && <g>{Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={-30} cy={1780 - i * 26} rx={330 - i * 30} ry={70} fill="none" stroke={i % 2 ? "#a88452" : "#8a6a44"} strokeWidth={34} />)}</g>}
        {kind === "lamp" && <g><rect x={860} y={-20} width={18} height={380} fill="#3a2a22" /><path d="M 800 360 L 940 360 L 900 470 L 840 470 Z" fill="#c99a3f" /><circle cx={870} cy={480} r={60} fill="#ffe2a0" opacity={0.85} /></g>}
        {kind === "rivets" && <g><rect x={-20} y={0} width={190} height={VH} fill="#1c1a20" />{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={90} cy={80 + i * 160} r={22} fill="#34303a" />)}</g>}
        {kind === "frame" && <g><rect x={-20} y={-20} width={VW + 40} height={VH + 40} fill="none" stroke="#2a1b16" strokeWidth={90} /></g>}
        {kind === "glass" && <g><rect x={-20} y={1500} width={300} height={500} rx={30} fill="#3a5a72" opacity={0.6} /><rect x={30} y={1540} width={40} height={400} rx={20} fill="#cfe6f5" opacity={0.6} /></g>}
        {kind === "chain" && <g>{Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={980 + (i % 2) * 8} cy={i * 140} rx={46} ry={78} fill="none" stroke="#4a4650" strokeWidth={26} transform={i % 2 ? `rotate(90 ${980} ${i * 140})` : ""} />)}</g>}
      </g>
    </V>
  );
};
/** light rays from a window/porthole */
export const Rays: React.FC<{ f: number; x: number; y: number; ang?: number; c?: string; a?: number }> = ({ f, x, y, ang = 25, c = "#fff1c4", a = 0.22 }) => (
  <V style={{ mixBlendMode: "screen" }}>
    <defs><linearGradient id={`ry${x}${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity={a} /><stop offset="1" stopColor={c} stopOpacity={0} /></linearGradient></defs>
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>{[0, 1, 2].map((i) => <path key={i} d={`M ${-60 + i * 70} 0 L ${-160 + i * 160} 1500 L ${-40 + i * 160} 1500 L ${10 + i * 70} 0 Z`} fill={`url(#ry${x}${y})`} opacity={0.6 + 0.4 * Math.sin(f * 0.03 + i)} />)}</g>
    {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={x + ((i * 97 + f * 0.6) % 500) - 150} cy={y + 200 + ((i * 151 + f * 0.9) % 1100)} r={3} fill={c} opacity={0.5} />)}
  </V>
);

// ---------------------------------------------------------------- captions, stamps, labels, watermark
export const Captions: React.FC<{ f: number; caps: { text: string; a: number; b: number }[]; hide?: boolean; y?: number }> = ({ f, caps, hide, y = 1270 }) => {
  const c = caps.find((p) => f >= p.a && f <= p.b);
  if (!c || hide) return null;
  const pop = 1 + Math.sin(clamp((f - c.a) / 5) * Math.PI) * 0.1;
  return <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: "#fff", WebkitTextStroke: "16px #1a1012", paintOrder: "stroke fill", textShadow: "0 6px 10px rgba(0,0,0,0.6)", transform: `scale(${pop})`, textTransform: "uppercase" }}>{c.text.replace(/[.,:]$/, "")}</div>;
};
export const Watermark: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FONT2, fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,0.72)", WebkitTextStroke: "1.5px rgba(10,8,20,0.55)", paintOrder: "stroke fill", textShadow: "0 2px 4px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.55)" }}>@LeoKnowledgeSharing</div>
);
export const Stamp: React.FC<{ f: number; a: number; b: number; text: string; sub?: string; y?: number }> = ({ f, a, b, text, sub, y = 260 }) => {
  if (f < a || f > b) return null;
  const p = prog(f, a, a + 7), q = prog(f, b - 6, b);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${(1 - p) * -40}px)`, opacity: p * (1 - q) }}>
      <div style={{ background: "#fbf4e4", border: `6px solid ${INK}`, borderRadius: 18, padding: "8px 26px", fontFamily: FONT, fontWeight: 900, fontSize: 50, color: INK, boxShadow: "0 6px 0 rgba(42,27,22,0.35)" }}>{text}</div>
      {sub && <div style={{ marginTop: 10, background: "#2a1b16", borderRadius: 12, padding: "5px 18px", fontFamily: FONT2, fontWeight: 700, fontSize: 32, color: "#fbf4e4" }}>{sub}</div>}
    </div>
  );
};
export const Label: React.FC<{ f: number; a: number; b: number; y: number; text: string; x?: number }> = ({ f, a, b, y, text, x = VW / 2 }) => f < a || f > b ? null : (
  <div style={{ position: "absolute", left: x, top: y, transform: "translateX(-50%)", background: "#ffd84a", border: `4px solid ${INK}`, borderRadius: 14, padding: "4px 16px", fontFamily: FONT2, fontWeight: 700, fontSize: 30, color: INK, whiteSpace: "nowrap", opacity: prog(f, a, a + 5) }}>{text}</div>
);
export const Bubble: React.FC<{ f: number; a: number; b: number; y: number; tx: number; ty: number; text: string; w?: number; x?: number }> = ({ f, a, b, y, tx, ty, text, w = 820, x = VW / 2 }) => {
  if (f < a || f > b) return null;
  const pin = prog(f, a, a + 5), pout = prog(f, b - 4, b), s = (0.6 + 0.4 * pin + Math.sin(clamp((f - a) / 6) * Math.PI) * 0.08) * (1 - pout * 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - pout }}>
      <V><path d={`M ${x - 34} ${y - 4} L ${tx} ${ty} L ${x + 34} ${y - 4} Z`} fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" opacity={pin} /></V>
      <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, transform: `translateY(-100%) scale(${s})`, transformOrigin: "50% 100%" }}>
        <div style={{ background: "#fff", border: `6px solid ${INK}`, borderRadius: 54, padding: "24px 34px", fontFamily: FONT, fontWeight: 900, fontSize: 58, lineHeight: 1.12, color: INK, textAlign: "center", boxShadow: "0 7px 0 rgba(42,27,22,0.35)" }}>{text}</div>
      </div>
    </div>
  );
};
export const VTag: React.FC<{ f: number; a: number; dur: number; x?: number; y: number; name: string; role: string; color: string }> = ({ f, a, dur, x = VW / 2, y, name, role, color }) => {
  if (f < a || f > a + dur) return null;
  const pin = prog(f, a, a + 6), pout = prog(f, a + dur - 8, a + dur), pop = 1 + Math.sin(clamp((f - a) / 7) * Math.PI) * 0.12;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -100%) scale(${(0.5 + 0.5 * pin) * pop})`, transformOrigin: "50% 100%", opacity: 1 - pout, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ background: color, border: `5px solid ${INK}`, borderRadius: 20, padding: "10px 26px 12px", textAlign: "center", boxShadow: "0 6px 0 rgba(42,27,22,0.35)" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 48, color: "#fff", WebkitTextStroke: `2px ${INK}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>{name}</div>
        <div style={{ fontFamily: FONT2, fontWeight: 700, fontSize: 30, color: INK, whiteSpace: "nowrap", marginTop: 2 }}>{role}</div>
      </div>
      <svg width={36} height={22}><path d="M 2 0 L 18 20 L 34 0 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" /></svg>
    </div>
  );
};
/** big top hook text (frame 1) */
export const HookText: React.FC<{ f: number; a: number; b: number; l1: string; l2: string; y?: number; c2?: string }> = ({ f, a, b, l1, l2, y = 300, c2 = "#ffd84a" }) => {
  if (f < a || f > b) return null;
  const p = a <= 0 ? 1 : prog(f, a, a + 6), q = prog(f, b - 6, b), wob = Math.sin(f * 0.25) * 1.2;
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: y, textAlign: "center", opacity: p * (1 - q), transform: `rotate(${wob - 1.5}deg)` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 82, lineHeight: 1.04, color: "#fff4dc", WebkitTextStroke: "16px #1a1012", paintOrder: "stroke fill", textShadow: "0 7px 0 rgba(0,0,0,0.4)" }}>{l1}</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.04, color: c2, WebkitTextStroke: "16px #1a1012", paintOrder: "stroke fill", textShadow: "0 7px 0 rgba(0,0,0,0.4)", marginTop: 8 }}>{l2}</div>
    </div>
  );
};

// ---------------------------------------------------------------- object inserts (vertical coordinates)
/** paper card that slides up, sits with a slow push-in, then leaves */
export const Card: React.FC<{ f: number; a: number; b: number; x?: number; y?: number; rot?: number; s?: number; children: React.ReactNode; dim?: number }> = ({ f, a, b, x = 540, y = 820, rot = -3, s = 1, children, dim = 0.45 }) => {
  if (f < a || f > b) return null;
  const p = prog(f, a, a + 9), q = prog(f, b - 6, b), drift = clamp((f - a) / 240);
  return (
    <g>
      <rect width={VW} height={VH} fill="#120c10" opacity={dim * p * (1 - q)} />
      <g transform={`translate(${x} ${lerp(y + 700, y, p) - drift * 30 + q * 900}) rotate(${lerp(rot + 9, rot, p) + drift * 2}) scale(${s * (1 + drift * 0.06)})`}>{children}</g>
    </g>
  );
};
const paper = (w: number, h: number, c = "#fbf4e4") => <g><rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={14} fill="#000" opacity={0.25} /><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={c} stroke={INK} strokeWidth={8} /></g>;
export const TelegramForm: React.FC<{ f: number; to: string; lines: string[]; typed: number; stamp?: number; stampText?: string; stampSub?: string; from?: string }> = ({ f, to, lines, typed, stamp = -99, stampText, stampSub, from }) => {
  const total = lines.join("").length; let left = Math.floor(typed * total);
  const s = f >= stamp ? 1 + Math.sin(clamp((f - stamp) / 6) * Math.PI) * 0.18 : 0;
  return (
    <g>
      {paper(900, 640)}
      <rect x={-450} y={-320} width={900} height={110} rx={14} fill="#e9dcc0" stroke={INK} strokeWidth={8} />
      <text x={0} y={-248} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill="#7b2f2a" letterSpacing={6}>TELEGRAM</text>
      <text x={-400} y={-150} fontFamily={FONT2} fontWeight={700} fontSize={34} fill="#6b4a36">To: {to}</text>
      {from && <text x={-400} y={-104} fontFamily={FONT2} fontWeight={700} fontSize={34} fill="#6b4a36">From: {from}</text>}
      {[0, 1, 2, 3].map((i) => <line key={i} x1={-400} x2={400} y1={-30 + i * 80} y2={-30 + i * 80} stroke="#d9cdb3" strokeWidth={4} />)}
      {lines.map((l, i) => { const n = Math.max(0, Math.min(l.length, left)); left -= l.length; return <text key={i} x={-400} y={-44 + i * 80} fontFamily="Courier New, monospace" fontWeight={900} fontSize={50} fill="#2a2a3a">{l.slice(0, n)}{n > 0 && n < l.length && Math.floor(f / 4) % 2 ? "▌" : ""}</text>; })}
      {s > 0 && stampText && <g transform={`translate(0 190) rotate(-5) scale(${s})`}><rect x={-420} y={-70} width={840} height={140} rx={18} fill="#fbf4e4" opacity={0.6} stroke="#c0473f" strokeWidth={13} /><text x={0} y={14} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={70} fill="#c0473f">{stampText}</text>{stampSub && <text x={250} y={58} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={34} fill="#c0473f">{stampSub}</text>}</g>}
    </g>
  );
};
export const Ticket: React.FC<{ f: number; to: string; circle?: number; note?: string }> = ({ f, to, circle = -99, note }) => (
  <g>
    {paper(860, 420, "#f6e7c1")}
    <path d="M 250 -210 L 250 210" stroke={INK} strokeWidth={5} strokeDasharray="14 12" />
    <circle cx={250} cy={-210} r={26} fill="#2a1b16" /><circle cx={250} cy={210} r={26} fill="#2a1b16" />
    <text x={-80} y={-120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill="#7b2f2a">WHITE STAR LINE</text>
    <text x={-80} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>R.M.S. TITANIC</text>
    <text x={-80} y={16} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={38} fill={INK}>FIRST CLASS</text>
    <text x={-80} y={92} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={40} fill={INK}>Southampton → {to}</text>
    <text x={340} y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={INK} transform="rotate(90 340 -40)">No. 1912</text>
    {f >= circle && <ellipse cx={-80 + 170} cy={80} rx={lerp(0, 210, prog(f, circle, circle + 10))} ry={lerp(0, 60, prog(f, circle, circle + 10))} fill="none" stroke="#c0473f" strokeWidth={10} />}
    {note && f >= circle && <text x={-80} y={170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill="#c0473f" opacity={prog(f, circle + 8, circle + 14)}>{note}</text>}
  </g>
);
/** tear-off calendar page */
export const Calendar: React.FC<{ f: number; day: string; month: string; note?: string; crossed?: { day: string; month: string; t: number } }> = ({ f, day, month, note, crossed }) => {
  const showNew = !crossed || f >= crossed.t + 14;
  const d = showNew ? day : crossed!.day, m = showNew ? month : crossed!.month;
  const tear = crossed && f >= crossed.t + 8 && f < crossed.t + 14 ? (f - crossed.t - 8) / 6 : 0;
  return (
    <g>
      {paper(520, 600)}
      <rect x={-260} y={-300} width={520} height={130} rx={14} fill="#c0473f" stroke={INK} strokeWidth={8} />
      {[-160, 0, 160].map((x) => <rect key={x} x={x - 14} y={-330} width={28} height={60} rx={12} fill="#6b6f7d" stroke={INK} strokeWidth={5} />)}
      <text x={0} y={-212} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#fff">{m}</text>
      <g transform={`translate(0 ${tear * 300}) rotate(${tear * 30})`} opacity={1 - tear}><text x={0} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={250} fill={INK}>{d}</text></g>
      <text x={0} y={220} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={44} fill="#6b4a36">1912</text>
      {crossed && f >= crossed.t && f < crossed.t + 14 && <path d={`M -200 -120 L ${lerp(-200, 200, prog(f, crossed.t, crossed.t + 7))} ${lerp(-120, 180, prog(f, crossed.t, crossed.t + 7))}`} stroke="#c0473f" strokeWidth={22} strokeLinecap="round" />}
      {note && <g transform="translate(0 370) rotate(-3)"><rect x={-290} y={-50} width={580} height={90} rx={45} fill="#ffd84a" stroke={INK} strokeWidth={6} /><text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>{note}</text></g>}
    </g>
  );
};
/** 1912 newspaper with a real headline (drawn by us; the text is the real headline) */
export const Newspaper: React.FC<{ f: number; paperName: string; date: string; head: string[]; sub?: string[]; hl?: number }> = ({ f, paperName, date, head, sub = [], hl = -99 }) => (
  <g>
    {paper(940, 1120, "#f3ecdc")}
    <text x={0} y={-450} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={70} fill={INK}>{paperName}</text>
    <line x1={-430} x2={430} y1={-420} y2={-420} stroke={INK} strokeWidth={6} />
    <text x={0} y={-386} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={30} fill="#4a3a30">{date}</text>
    <line x1={-430} x2={430} y1={-366} y2={-366} stroke={INK} strokeWidth={3} />
    {head.map((h, i) => <text key={i} x={0} y={-280 + i * 82} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={70} fill={INK}>{h}</text>)}
    {sub.map((h, i) => { const y = -280 + head.length * 82 + 20 + i * 62; const on = f >= hl && i === sub.length - 1; return <g key={i}>{on && <rect x={-400} y={y - 46} width={lerp(0, 800, prog(f, hl, hl + 10))} height={62} fill="#ffd84a" opacity={0.85} />}<text x={0} y={y} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={44} fill={INK}>{h}</text></g>; })}
    {Array.from({ length: 9 }, (_, i) => <g key={i}>{[-1, 1].map((s) => <rect key={s} x={s < 0 ? -420 : 20} y={140 + i * 40} width={400 - ((i * 37 + (s > 0 ? 11 : 0)) % 90)} height={14} fill="#bdb3a0" />)}</g>)}
  </g>
);
/** ship's engine-order telegraph dial */
export const EngineDial: React.FC<{ f: number; to: number; t: number; label?: string }> = ({ f, to, t, label = "STOP" }) => {
  const a = lerp(-70, to, prog(f, t, t + 10)) + (f >= t + 10 ? Math.sin((f - t) * 0.9) * 3 * Math.exp(-(f - t - 10) / 10) : 0);
  return (
    <g>
      <rect x={-30} y={120} width={60} height={420} fill="#c9a36a" stroke={INK} strokeWidth={7} />
      <circle r={260} fill="#e3b14a" stroke={INK} strokeWidth={10} /><circle r={210} fill="#fff7e6" stroke={INK} strokeWidth={6} />
      {[["FULL", -70], ["HALF", -35], [label, 0], ["HALF", 35], ["FULL", 70]].map(([l, d], i) => <text key={i} x={Math.sin((Number(d) * Math.PI) / 180) * 150} y={-Math.cos((Number(d) * Math.PI) / 180) * 150 + 12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={i === 2 ? 46 : 32} fill={i === 2 ? "#c0473f" : INK}>{l}</text>)}
      <text x={-120} y={90} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={26} fill="#6b4a36">AHEAD</text><text x={120} y={90} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={26} fill="#6b4a36">ASTERN</text>
      <g transform={`rotate(${a})`}><path d="M -14 0 L 0 -190 L 14 0 Z" fill={INK} /><circle r={30} fill="#c0473f" stroke={INK} strokeWidth={6} /></g>
    </g>
  );
};
/** end card pointing to the long video */
export const EndCard: React.FC<{ f: number; a: number; title: string; sub: string; children?: React.ReactNode }> = ({ f, a, title, sub, children }) => {
  if (f < a) return null;
  const p = prog(f, a, a + 9);
  return (
    <g opacity={p}>
      <rect width={VW} height={VH} fill="#120c10" opacity={0.55} />
      <g transform={`translate(540 ${lerp(900, 760, p)}) scale(${0.85 + 0.15 * p})`}>
        <rect x={-460} y={-380} width={920} height={700} rx={36} fill="#fbf4e4" stroke={INK} strokeWidth={10} />
        <g transform="translate(0 -60)">{children}</g>
        <rect x={-380} y={-440} width={760} height={110} rx={55} fill="#ffd84a" stroke={INK} strokeWidth={8} />
        <text x={0} y={-366} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>FULL STORY ↓</text>
        <text x={0} y={210} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK}>{title}</text>
        <text x={0} y={280} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={40} fill="#7b2f2a">{sub}</text>
      </g>
    </g>
  );
};
/** sepia "photo" of a drawn scene (labelled as drawn) */
export const Photo: React.FC<{ id: string; w?: number; caption?: string; children: React.ReactNode; vb?: string }> = ({ id, w = 820, caption, children, vb = "0 0 1920 1080" }) => {
  const [, , vw, vh] = vb.split(" ").map(Number); const h = (w * vh) / vw;
  return (
    <g>
      <rect x={-w / 2 - 30 + 10} y={-h / 2 - 30 + 14} width={w + 60} height={h + (caption ? 130 : 60)} fill="#000" opacity={0.25} />
      <rect x={-w / 2 - 30} y={-h / 2 - 30} width={w + 60} height={h + (caption ? 130 : 60)} fill="#fbf6ea" stroke={INK} strokeWidth={6} />
      <defs><filter id={`ps-${id}`}><feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0.04  0.35 0.69 0.17 0 0.02  0.27 0.53 0.13 0 0  0 0 0 1 0" /></filter></defs>
      <svg x={-w / 2} y={-h / 2} width={w} height={h} viewBox={vb} preserveAspectRatio="xMidYMid slice"><g filter={`url(#ps-${id})`}>{children}</g></svg>
      {caption && <text x={0} y={h / 2 + 62} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={34} fill="#4a3a30">{caption}</text>}
    </g>
  );
};
