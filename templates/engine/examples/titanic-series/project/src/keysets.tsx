// Sets + inserts for Short E "The key" (recap Short). World sets are 1920x1080 (used through Win), inserts are vertical 1080x1920 coords.
import React from "react";
import { INK, PAL, prog, lerp, clamp } from "./style";
import { FONT, FONT2 } from "./vshort";
import type { Spec } from "./chibi";

const st = (w = 6) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });

export const BLAIR: Spec = { id: "blair", name: "David Blair", skin: PAL.skinLight, hair: PAL.hairDark, hairStyle: "sidepart", beard: "moustache", beardColor: PAL.hairDark, outfit: "officer", main: PAL.navy, mainDark: PAL.navyDark, hat: "captain", scale: 1.0 };
export const OFFICER2: Spec = { id: "officer2", name: "Chief Officer", skin: PAL.skinMid, hair: "#3a2a20", hairStyle: "short", outfit: "officer", main: "#1d2944", mainDark: "#141d33", hat: "captain", scale: 1.05 };
export const LOOKOUT: Spec = { id: "lookout", name: "", skin: PAL.skinMid, hair: PAL.hairBrown, hairStyle: "short", outfit: "crew", main: "#2f3a52", mainDark: "#222a3c", hat: "sailor", scale: 0.95 };
export const CADET: Spec = { id: "cadet", name: "", skin: PAL.skinTan, hair: PAL.hairDark, hairStyle: "short", outfit: "crew", main: "#2f4a7a", mainDark: "#223761", hat: "sailor", scale: 0.85 };

/** iron key with a brass oval tag; side 0 = "R.M.S. TITANIC", side 1 = "CROW'S NEST TELEPHONE KEY" */
export const Key: React.FC<{ x: number; y: number; s?: number; rot?: number; flip?: number; glint?: number }> = ({ x, y, s = 1, rot = 0, flip = 0, glint = 0 }) => {
  const sx = Math.cos(flip * Math.PI); const side = flip > 0.5 ? 1 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* ring + string */}
      <path d="M 0 -170 Q 30 -120 0 -70" fill="none" stroke="#7a5a3a" strokeWidth={6} />
      {/* tag */}
      <g transform={`translate(0 -230) scale(${Math.max(0.04, Math.abs(sx))} 1)`}>
        <ellipse rx={150} ry={74} fill="#d9a441" {...st(7)} />
        <ellipse rx={128} ry={56} fill="none" stroke="#a87a26" strokeWidth={4} />
        <circle cx={0} cy={-58} r={9} fill="#3a2a20" />
        {side === 0 ? <text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#4a3210">R.M.S. TITANIC</text>
          : <g><text y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={25} fill="#4a3210">CROW'S NEST</text><text y={28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={25} fill="#4a3210">TELEPHONE KEY</text></g>}
      </g>
      {/* key: bow, shank, bit */}
      <circle cx={0} cy={-30} r={42} fill="none" stroke={INK} strokeWidth={30} />
      <circle cx={0} cy={-30} r={42} fill="none" stroke="#5d5a5e" strokeWidth={20} />
      <rect x={-13} y={8} width={26} height={250} rx={8} fill="#5d5a5e" {...st(6)} />
      <path d="M 13 200 L 70 200 L 70 222 L 50 222 L 50 240 L 70 240 L 70 258 L 13 258" fill="#5d5a5e" {...st(6)} />
      <rect x={-8} y={20} width={6} height={220} fill="#8d8a90" opacity={0.7} />
      {glint > 0 && <g opacity={glint}>{[0, 1].map((i) => <path key={i} d={`M ${-60 + i * 110} ${-80 + i * 160} l 0 -40 m -20 20 l 40 0`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />)}</g>}
    </g>
  );
};

/** dark velvet auction backdrop with a spotlight (vertical coords) */
export const Velvet: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <radialGradient id="spot" cx="50%" cy="38%" r="55%"><stop offset="0" stopColor="#c0453e" /><stop offset="0.55" stopColor="#5e1a1e" /><stop offset="1" stopColor="#1c0709" /></radialGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3d0" stopOpacity="0.5" /><stop offset="1" stopColor="#fff3d0" stopOpacity="0" /></linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#spot)" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${i * 135 - 20} 0 Q ${i * 135 + 30 + Math.sin(f / 30 + i) * 8} 960 ${i * 135 - 20} 1920`} fill="none" stroke="#2a0b0e" strokeWidth={10} opacity={0.35} />)}
    <path d={`M ${470 + Math.sin(f / 40) * 10} -40 L ${610 + Math.sin(f / 40) * 10} -40 L 900 1500 L 180 1500 Z`} fill="url(#beam)" />
    {/* plinth */}
    <ellipse cx={540} cy={1500} rx={360} ry={60} fill="#1a0e0c" opacity={0.6} />
    <rect x={250} y={1450} width={580} height={470} fill="#2c1a14" {...st(6)} />
    <rect x={250} y={1450} width={580} height={30} fill="#4a2e22" />
    {Array.from({ length: 14 }, (_, i) => { const a = (f * 0.7 + i * 47) % 300; return <circle key={i} cx={300 + ((i * 97) % 480)} cy={1400 - a * 3} r={3} fill="#fff3d0" opacity={(1 - a / 300) * 0.6} />; })}
  </g>
);

export const PriceTag: React.FC<{ f: number; a: number; x: number; y: number; text: string; sub?: string }> = ({ f, a, x, y, text, sub }) => {
  if (f < a) return null;
  const p = prog(f, a, a + 8), sw = Math.sin((f - a) / 6) * 6 * (1 - clamp((f - a) / 60));
  return (
    <g transform={`translate(${x} ${y}) rotate(${-8 + sw}) scale(${lerp(0.3, 1, p) + Math.sin(clamp((f - a) / 8) * Math.PI) * 0.12})`} opacity={p}>
      <path d="M -230 -70 L 170 -70 L 240 0 L 170 70 L -230 70 Z" fill="#fbf4e4" {...st(8)} />
      <circle cx={160} cy={0} r={14} fill="#5e1a1e" {...st(4)} />
      <text x={-30} y={sub ? 6 : 24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={sub ? 64 : 76} fill="#7b2f2a">{text}</text>
      {sub && <text x={-30} y={50} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={30} fill={INK}>{sub}</text>}
    </g>
  );
};

export const Gavel: React.FC<{ f: number; hit: number; x: number; y: number; s?: number }> = ({ f, hit, x, y, s = 1 }) => {
  const d = f - hit; const ang = d < -10 ? -40 : d < 0 ? lerp(-40, 10, (d + 10) / 10) : d < 4 ? 10 : lerp(10, -25, clamp((d - 4) / 14));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-120} y={40} width={240} height={46} rx={14} fill="#7b4a2c" {...st(6)} />
      <g transform={`rotate(${ang} 140 -40)`}>
        <rect x={-20} y={-60} width={170} height={26} rx={10} fill="#9b6a3f" {...st(6)} />
        <rect x={-70} y={-110} width={80} height={130} rx={16} fill="#7b4a2c" {...st(6)} />
      </g>
      {d >= 0 && d < 10 && [0, 1, 2].map((i) => <path key={i} d={`M ${-40 + i * 40} 20 l ${-30 + i * 30} -50`} stroke="#fff3d0" strokeWidth={8} strokeLinecap="round" opacity={1 - d / 10} />)}
    </g>
  );
};

/** officer's cabin (world 1920x1080): panelling, porthole with daylight, bunk, open suitcase, cupboard */
export const Cabin: React.FC<{ f: number; children?: React.ReactNode; door?: number; bino?: number; lock?: number; packed?: number; night?: boolean }> = ({ f, children, door = 0, bino = 0, lock = 0, packed = 0, night = false }) => (
  <g>
    <rect width={1920} height={1080} fill={night ? "#6e5340" : "#c79a68"} />
    {Array.from({ length: 11 }, (_, i) => <g key={i}><rect x={i * 190 - 10} y={0} width={176} height={780} fill={night ? "#7a5c46" : "#d3a776"} {...st(3)} /><path d={`M ${i * 190 + 10} 40 Q ${i * 190 + 60} 300 ${i * 190 + 20} 740`} stroke={night ? "#6a4e3a" : "#bf9161"} strokeWidth={5} fill="none" /></g>)}
    <rect x={0} y={760} width={1920} height={30} fill="#7b4a2c" {...st(4)} />
    {/* carpet */}
    <rect x={0} y={790} width={1920} height={300} fill="#7a2f34" />
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M ${i * 130} 820 l 40 30 l -40 30 l -40 -30 Z`} fill="#a8484b" opacity={0.6} />)}
    {/* porthole */}
    <g transform="translate(560 300)">
      <circle r={120} fill={night ? "#0b1230" : "#bfe0f5"} {...st(10)} stroke="#c9a36a" />
      {!night && <path d="M -110 30 Q 0 0 110 30 L 110 120 L -110 120 Z" fill="#6fa7d4" opacity={0.8} />}
      <circle r={120} fill="none" stroke={INK} strokeWidth={5} />
      {[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 135} cy={Math.sin((a * Math.PI) / 180) * 135} r={8} fill="#a87a26" {...st(3)} />)}
    </g>
    {/* lamp */}
    <g transform="translate(980 170)"><path d="M -60 0 L 60 0 L 40 -60 L -40 -60 Z" fill="#e8c46a" {...st(5)} /><rect x={-4} y={-140} width={8} height={80} fill={INK} /></g>
    {/* cupboard */}
    <g transform="translate(1560 420)">
      <rect x={-170} y={-260} width={340} height={600} rx={10} fill="#8a5a36" {...st(7)} />
      <rect x={-150} y={-240} width={300} height={260} fill="#5a3a24" {...st(4)} />
      {bino > 0 && <g transform={`translate(${lerp(-260, 0, bino)} ${lerp(-60, -110, bino)})`}><Binoculars s={0.9} /></g>}
      <g transform={`translate(-150 -240) scale(${Math.cos(door * Math.PI * 0.45)} 1)`}><rect x={0} y={0} width={300} height={260} fill="#9b6a3f" {...st(5)} /><rect x={30} y={30} width={240} height={200} fill="none" stroke="#7b4a2c" strokeWidth={5} /></g>
      {lock > 0 && <g transform={`translate(130 ${-110 + (1 - lock) * -40}) scale(${lock})`}><path d="M -22 0 L -22 -26 Q 0 -54 22 -26 L 22 0" fill="none" {...st(8)} /><rect x={-34} y={0} width={68} height={56} rx={8} fill="#e3b14a" {...st(5)} /><circle cx={0} cy={26} r={7} fill={INK} /></g>}
      <rect x={-150} y={60} width={300} height={250} fill="#9b6a3f" {...st(5)} />
      <circle cx={0} cy={180} r={12} fill="#e3b14a" {...st(3)} />
    </g>
    {/* bunk + suitcase */}
    <rect x={150} y={640} width={760} height={60} rx={14} fill="#7b4a2c" {...st(6)} />
    <rect x={150} y={590} width={760} height={56} rx={20} fill="#f3efe2" {...st(5)} />
    <g transform="translate(330 560)">
      <rect x={-130} y={-60} width={260} height={110} rx={12} fill="#6b3f26" {...st(6)} />
      <g transform={`rotate(${lerp(-70, 0, packed)} -130 -60)`}><rect x={-130} y={-120} width={260} height={60} rx={12} fill="#7b4a2c" {...st(6)} /></g>
      <rect x={-30} y={-80} width={60} height={20} rx={8} fill="none" {...st(5)} />
      {packed < 1 && [0, 1, 2].map((i) => <rect key={i} x={-110 + i * 70} y={-80 - i * 6} width={60} height={30} rx={6} fill={["#f6f1e7", "#22304f", "#c9b48a"][i]} {...st(4)} opacity={1 - packed} />)}
    </g>
    {children}
    {/* floating dust */}
    {Array.from({ length: 10 }, (_, i) => { const a = (f * 0.6 + i * 53) % 400; return <circle key={i} cx={420 + ((i * 131) % 380)} cy={420 - a * 0.4 + Math.sin(f / 20 + i) * 10} r={3} fill="#fff6dc" opacity={0.5 * Math.sin((a / 400) * Math.PI)} />; })}
  </g>
);

export const Binoculars: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-80} y={-40} width={70} height={110} rx={22} fill="#2b2c35" {...st(6)} />
    <rect x={10} y={-40} width={70} height={110} rx={22} fill="#2b2c35" {...st(6)} />
    <rect x={-14} y={-10} width={28} height={36} fill="#5d5a5e" {...st(4)} />
    <circle cx={-45} cy={70} r={24} fill="#355275" {...st(4)} /><circle cx={45} cy={70} r={24} fill="#355275" {...st(4)} />
  </g>
);

/** postcard (vertical insert coords, centred) */
export const Postcard: React.FC<{ f: number; a: number }> = ({ f, a }) => {
  const t = clamp((f - a - 8) / 30);
  const lines = ["I shall have to step out", "to make room for chief", "officer of the Olympic...", "I feel very disappointed."];
  const tot = lines.join("").length; let left = Math.floor(t * tot);
  return (
    <g>
      <rect x={-420 + 12} y={-270 + 16} width={840} height={540} rx={12} fill="#000" opacity={0.25} />
      <rect x={-420} y={-270} width={840} height={540} rx={12} fill="#f4ead2" {...st(8)} />
      <path d="M 60 -230 L 60 240" stroke="#b9a882" strokeWidth={4} />
      <rect x={250} y={-240} width={130} height={150} fill="#c0473f" {...st(4)} />
      <circle cx={315} cy={-165} r={40} fill="none" stroke="#f4ead2" strokeWidth={5} />
      <path d="M 200 -120 q 40 -30 80 0 q 40 30 80 0 q 40 -30 80 0" fill="none" stroke="#5a4a6a" strokeWidth={4} opacity={0.7} />
      {[0, 1, 2].map((i) => <line key={i} x1={100} x2={380} y1={0 + i * 70} y2={0 + i * 70} stroke="#b9a882" strokeWidth={4} />)}
      {lines.map((l, i) => { const n = clamp(left, 0, l.length); left -= l.length; return <text key={i} x={-390} y={-170 + i * 92} fontFamily="Georgia, serif" fontStyle="italic" fontSize={i === 3 ? 44 : 38} fontWeight={i === 3 ? 700 : 400} fill="#2a3a6a">{l.slice(0, n)}</text>; })}
      <text x={-390} y={225} fontFamily={FONT2} fontWeight={700} fontSize={26} fill="#7b5a3a">David Blair · April 1912 · as quoted (Irish Post, 2018)</text>
    </g>
  );
};

/** eye vs binoculars cut-away (world 1920x1080, drawn inside a Panel) */
export const EyeVsGlasses: React.FC<{ f: number; a: number; b2: number }> = ({ f, a, b2 }) => {
  const sweep = Math.sin((f - a) / 14) * 22; const p2 = prog(f, b2, b2 + 12);
  return (
    <g>
      <rect width={1920} height={1080} fill="#0f1a38" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 211) % 1920} cy={(i * 97) % 520} r={3} fill="#fff" opacity={0.3 + 0.4 * Math.sin(f * 0.1 + i)} />)}
      <rect y={560} width={1920} height={520} fill="#13244a" />
      {/* berg */}
      <g transform="translate(1500 600) scale(0.55)"><path d="M -260 0 L -200 -150 L -120 -210 L -70 -330 L 10 -260 L 70 -300 L 150 -170 L 230 -90 L 280 0 Z" fill="#dfe8f5" {...st(8)} /></g>
      {/* eye */}
      <g transform="translate(260 560)">
        <path d="M -120 0 Q 0 -90 120 0 Q 0 90 -120 0 Z" fill="#fff" {...st(8)} />
        <circle r={38} fill="#355275" {...st(5)} /><circle r={16} fill={INK} />
      </g>
      {/* wide search cone */}
      <g opacity={1 - p2 * 0.6}><path d={`M 380 560 L 1900 ${360 + sweep * 10} L 1900 ${800 + sweep * 10} Z`} fill="#ffd84a" opacity={0.22} /></g>
      {/* narrow check cone */}
      {p2 > 0 && <g opacity={p2}><path d="M 420 560 L 1500 500 L 1500 600 Z" fill="#7fd0ff" opacity={0.45} /><g transform="translate(600 560)"><Binoculars s={0.8} /></g></g>}
      <g transform="translate(300 160)"><rect x={-20} y={-60} width={620} height={90} rx={45} fill="#ffd84a" {...st(6)} /><text x={290} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={INK}>1 · EYES: SEARCH</text></g>
      {p2 > 0 && <g transform="translate(1000 160)" opacity={p2}><rect x={-20} y={-60} width={720} height={90} rx={45} fill="#7fd0ff" {...st(6)} /><text x={340} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={INK}>2 · GLASSES: CHECK</text></g>}
    </g>
  );
};

/** small "lookouts' binoculars" empty-spot marker (vertical coords) */
export const EmptyHook: React.FC<{ f: number; p: number; x: number; y: number }> = ({ f, p, x, y }) => (
  <g transform={`translate(${x} ${y}) scale(${0.6 + p * 0.4})`} opacity={p}>
    <rect x={-170} y={-130} width={340} height={260} rx={26} fill="rgba(255,255,255,0.08)" stroke="#ff8a7a" strokeWidth={10} strokeDasharray="26 16" />
    <g opacity={0.35 + 0.1 * Math.sin(f / 6)}><Binoculars s={1.1} /></g>
    <path d="M -120 -90 L 120 90 M 120 -90 L -120 90" stroke="#ff8a7a" strokeWidth={14} strokeLinecap="round" />
  </g>
);

/** charity: books, sailor cadet, "education" banner (world coords) */
export const School: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g>
    <rect width={1920} height={1080} fill="#f3e3c4" />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 260} y={0} width={14} height={760} fill="#e3cfa8" />)}
    {/* map of the world on the wall */}
    <g transform="translate(600 330)"><rect x={-300} y={-180} width={600} height={360} rx={12} fill="#cfe3ef" {...st(6)} /><path d="M -220 -60 q 60 -60 120 -10 q 40 40 0 90 q -60 30 -120 -20 Z M 40 -90 q 120 -30 190 30 q 20 80 -60 110 q -90 10 -130 -60 Z" fill="#9cc49a" {...st(4)} /><path d="M -200 100 Q 0 40 220 90" fill="none" stroke="#c0473f" strokeWidth={6} strokeDasharray="18 12" /></g>
    {/* ship's wheel */}
    <g transform={`translate(1400 300) rotate(${f * 0.3})`}><circle r={110} fill="none" stroke="#7b4a2c" strokeWidth={26} />{Array.from({ length: 8 }, (_, i) => <g key={i} transform={`rotate(${i * 45})`}><rect x={-8} y={-160} width={16} height={160} fill="#7b4a2c" {...st(3)} /><circle cy={-165} r={14} fill="#9b6a3f" {...st(3)} /></g>)}<circle r={30} fill="#9b6a3f" {...st(4)} /></g>
    <rect y={760} width={1920} height={320} fill="#9b6a3f" />
    {/* desk + books */}
    <rect x={500} y={740} width={1000} height={50} rx={10} fill="#7b4a2c" {...st(6)} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={560 + i * 18} y={640 - i * 28} width={200} height={30} rx={6} fill={["#c0473f", "#22304f", "#3f7a5a", "#e3b14a"][i]} {...st(4)} />)}
    {children}
  </g>
);
