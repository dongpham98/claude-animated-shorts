// Comic effects kit for the chibi recap style: sunburst, sparkles, smoke puffs, speed lines, sweat drop,
// speech bubbles, name tags, quote cards and narrator phrase captions. All flat shapes with the series ink outline.
import React from "react";
import { INK, clamp, prog } from "./style";

/** rotating yellow sunburst for "big moments" (full frame, SVG) */
export const Sunburst: React.FC<{ f: number; c1?: string; c2?: string; cx?: number; cy?: number }> = ({ f, c1 = "#ffd84a", c2 = "#ffc21f", cx = 960, cy = 540 }) => {
  const rays = 18, rot = f * 0.6;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill={c1} />
      <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
        {Array.from({ length: rays }, (_, i) => {
          const a0 = (i / rays) * Math.PI * 2, a1 = a0 + Math.PI / rays;
          return <path key={i} d={`M 0 0 L ${Math.cos(a0) * 2400} ${Math.sin(a0) * 2400} L ${Math.cos(a1) * 2400} ${Math.sin(a1) * 2400} Z`} fill={c2} />;
        })}
      </g>
      <circle cx={cx} cy={cy} r={260} fill="#fff6c8" opacity={0.55} />
    </g>
  );
};

const star = (r: number) => `M 0 ${-r} Q ${r * 0.18} ${-r * 0.18} ${r} 0 Q ${r * 0.18} ${r * 0.18} 0 ${r} Q ${-r * 0.18} ${r * 0.18} ${-r} 0 Q ${-r * 0.18} ${-r * 0.18} 0 ${-r} Z`;
/** twinkling sparkles around a point (screen coords) */
export const Sparkles: React.FC<{ f: number; x: number; y: number; spread?: number; n?: number; color?: string; seed?: number }> = ({ f, x, y, spread = 260, n = 9, color = "#ffffff", seed = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a = (i * 2.399 + seed) % (Math.PI * 2), d = spread * (0.45 + ((i * 37 + seed * 11) % 100) / 180);
      const tw = Math.max(0, Math.sin(f * 0.25 + i * 1.7));
      const r = 10 + ((i * 13) % 14);
      return <path key={i} d={star(r * (0.4 + tw))} transform={`translate(${x + Math.cos(a) * d} ${y + Math.sin(a) * d * 0.8})`} fill={color} stroke={INK} strokeWidth={2} opacity={0.35 + tw * 0.65} />;
    })}
  </g>
);

/** smoke puff that bursts out and fades (t = frames since start) */
export const SmokePuff: React.FC<{ t: number; x: number; y: number; size?: number; color?: string }> = ({ t, x, y, size = 1, color = "#bfe3f0" }) => {
  if (t < 0 || t > 22) return null;
  const p = t / 22;
  return (
    <g opacity={1 - p * p}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.3, d = (30 + p * 150) * size;
        const r = (40 + i % 3 * 12) * size * (1 - p * 0.5);
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.75} r={r} fill={color} stroke={INK} strokeWidth={3} />;
      })}
      <circle cx={x} cy={y} r={70 * size * (1 - p)} fill="#ffffff" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** horizontal speed lines (comic motion) */
export const SpeedLines: React.FC<{ f: number; y0?: number; y1?: number; dir?: 1 | -1; opacity?: number }> = ({ f, y0 = 80, y1 = 1000, dir = 1, opacity = 0.8 }) => (
  <g opacity={opacity}>
    {Array.from({ length: 22 }, (_, i) => {
      const y = y0 + ((i * 97) % (y1 - y0));
      const len = 160 + ((i * 53) % 260);
      const x = ((i * 331 + f * 70 * dir) % 2600 + 2600) % 2600 - 340;
      return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke="#ffffff" strokeWidth={4 + (i % 3) * 2} strokeLinecap="round" />;
    })}
  </g>
);

/** sweat drop next to a head (screen coords), slides down a little */
export const SweatDrop: React.FC<{ t: number; x: number; y: number; s?: number }> = ({ t, x, y, s = 1 }) => {
  if (t < 0) return null;
  const k = prog(t, 0, 6), dy = Math.min(t, 40) * 0.6;
  return (
    <g transform={`translate(${x} ${y + dy}) scale(${s * k})`}>
      <path d="M 0 -34 Q 22 -2 18 12 Q 12 28 0 28 Q -12 28 -18 12 Q -22 -2 0 -34 Z" fill="#9fd8f5" stroke={INK} strokeWidth={4} />
      <path d="M -7 4 Q -8 14 -2 18" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

/** small "!" / emphasis lines around a head */
export const ShockLines: React.FC<{ t: number; x: number; y: number; s?: number }> = ({ t, x, y, s = 1 }) => {
  if (t < 0 || t > 30) return null;
  const k = prog(t, 0, 4) * (1 - prog(t, 22, 30));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}>
      {[-50, -20, 10].map((a, i) => {
        const r = (a * Math.PI) / 180, r0 = 40, r1 = 40 + 36 * k;
        return <line key={i} x1={Math.sin(r) * r0} y1={-Math.cos(r) * r0} x2={Math.sin(r) * r1} y2={-Math.cos(r) * r1} stroke={INK} strokeWidth={6} strokeLinecap="round" />;
      })}
    </g>
  );
};

const FONT = "CapBlack, Montserrat, sans-serif";

/** comic speech bubble, tail pointing to (tx, ty); pops in, holds, pops out (HTML overlay) */
export const SpeechBubble: React.FC<{ f: number; a: number; b: number; x: number; y: number; tx: number; ty: number; text: string; color?: string; width?: number }> = ({ f, a, b, x, y, tx, ty, text, color = "#ffffff", width = 520 }) => {
  if (f < a || f > b) return null;
  const pin = prog(f, a, a + 5), pout = prog(f, b - 4, b);
  const s = (0.6 + 0.4 * pin + Math.sin(clamp((f - a) / 6) * Math.PI) * 0.08) * (1 - pout * 0.4);
  const dx = tx - x, dy = ty - y;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none", opacity: 1 - pout }}>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`M ${x - 26} ${y} L ${x + dx * 0.92} ${y + dy * 0.92} L ${x + 26} ${y} Z`} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={pin} />
      </svg>
      <div style={{ position: "absolute", left: x - width / 2, top: y, width, transform: `translateY(-100%) scale(${s})`, transformOrigin: "50% 100%" }}>
        <div style={{ background: color, border: `5px solid ${INK}`, borderRadius: 46, padding: "20px 30px", fontFamily: FONT, fontWeight: 900, fontSize: 46,
          lineHeight: 1.15, color: "#2a1b16", textAlign: "center", boxShadow: "0 6px 0 rgba(42,27,22,0.35)" }}>{text}</div>
      </div>
    </div>
  );
};

/** name tag that pops up next to a head on first appearance */
export const NameTag: React.FC<{ f: number; a: number; dur?: number; x: number; y: number; name: string; role: string; color: string }> = ({ f, a, dur = 80, x, y, name, role, color }) => {
  if (f < a || f > a + dur) return null;
  const pin = prog(f, a, a + 6), pout = prog(f, a + dur - 8, a + dur);
  const pop = 1 + Math.sin(clamp((f - a) / 7) * Math.PI) * 0.12;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -100%) scale(${(0.5 + 0.5 * pin) * pop})`, transformOrigin: "50% 100%", opacity: 1 - pout,
      display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ background: color, border: `4px solid ${INK}`, borderRadius: 18, padding: "8px 20px 10px", textAlign: "center", boxShadow: "0 5px 0 rgba(42,27,22,0.35)" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 34, color: "#fff", WebkitTextStroke: `1.5px ${INK}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>{name}</div>
        <div style={{ fontFamily: "WmBold, Montserrat, sans-serif", fontWeight: 700, fontSize: 22, color: "#2a1b16", whiteSpace: "nowrap", marginTop: 2 }}>{role}</div>
      </div>
      <svg width={30} height={18}><path d="M 2 0 L 15 16 L 28 0 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" /></svg>
    </div>
  );
};

/** quote card for a real, sourced quote */
export const QuoteCard: React.FC<{ f: number; a: number; b: number; quote: string; source: string }> = ({ f, a, b, quote, source }) => {
  if (f < a || f > b) return null;
  const pin = prog(f, a, a + 7), pout = prog(f, b - 5, b);
  return (
    <div style={{ position: "absolute", left: 260, right: 260, top: 300, transform: `translateY(${(1 - pin) * 40}px) rotate(-1.5deg) scale(${0.92 + 0.08 * pin})`, opacity: pin * (1 - pout),
      background: "#fbf4e4", border: `6px solid ${INK}`, borderRadius: 26, padding: "40px 56px", boxShadow: "0 10px 0 rgba(42,27,22,0.4)" }}>
      <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 62, color: "#2a1b16", lineHeight: 1.2 }}>“{quote}”</div>
      <div style={{ fontFamily: "WmBold, Montserrat, sans-serif", fontWeight: 700, fontSize: 28, color: "#6b4a36", marginTop: 22 }}>{source}</div>
    </div>
  );
};

export type Word = { word: string; start: number; end: number };
/** narrator phrase captions (long-video style: 2-5 words, lower third, no pop) */
export const phrases = (words: Word[], offsetFrames: number, fps = 30) => {
  const out: { text: string; a: number; b: number }[] = [];
  let cur: Word[] = [];
  const flush = () => { if (!cur.length) return; out.push({ text: cur.map((w) => w.word).join(" "), a: offsetFrames + Math.round(cur[0].start * fps) - 1, b: offsetFrames + Math.round(cur[cur.length - 1].end * fps) + 4 }); cur = []; };
  words.forEach((w) => { cur.push(w); if (/[.,:!?]["”]?$/.test(w.word) || cur.length >= 4) flush(); });
  flush();
  for (let i = 0; i < out.length - 1; i++) if (out[i + 1].a - out[i].b < 8) out[i].b = out[i + 1].a - 1;
  return out;
};
export const Captions: React.FC<{ f: number; list: { text: string; a: number; b: number }[] }> = ({ f, list }) => {
  const c = list.find((p) => f >= p.a && f <= p.b);
  if (!c) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 108, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#fff",
      WebkitTextStroke: "12px #1a1012", paintOrder: "stroke fill", textShadow: "0 5px 8px rgba(0,0,0,0.6)", letterSpacing: 0.5 }}>{c.text}</div>
  );
};
