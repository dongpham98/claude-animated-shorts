// Short B (vertical): "Titanic almost crashed before leaving port" — the New York incident, 10 April 1912.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps } from "remotion";
import TL from "./shB_timeline.json";
import { Chibi, Pose } from "./chibi";
import { SMITH } from "./cast";
import { GEDDES, WORKER } from "./cast1";
import { prog, lerp, clamp, INK, PAL } from "./style";
import { ShockLines, Sparkles } from "./fx";
import { Titanic, Steamer, WaterFront, SeaSky } from "./ship";
import { NightSea, Bridge } from "./scenes";
import { Deck } from "./deck";
import { Shipyard } from "./ep1sets";
import { Win, V, Grade, Fg, Rays, Captions, Watermark, Stamp, Label, Bubble, VTag, HookText, Card, Calendar, Newspaper, EngineDial, EndCard, useFonts, FONT, FONT2 } from "./vshort";

export const SHB_FRAMES = TL.total;
type K = keyof typeof TL.lines;
const S = (k: K) => TL.lines[k].start;
const E = (k: K) => TL.lines[k].start + TL.lines[k].dur;
const WORDS = TL.words as Record<string, { w: string; s: number; e: number }[]>;
const W = (k: K, i: number) => { const w = WORDS[k]; return TL.lines[k].start + Math.round(w[Math.min(i, w.length - 1)].s * 30); };
const ENV = TL.env as Record<string, number[]>;
const env = (k: K, f: number) => { const e = ENV[k]; const i = f - S(k); return e && i >= 0 && i < e.length ? e[i] : 0; };
const blinkAt = (f: number, every = 70, seed = 0) => { const d = (f + seed * 23) % every; return d < 6 ? [0.5, 1, 1, 0.6, 0.2, 0][d] : 0; };
const idle = (f: number, seed = 0): Pose => ({ blink: blinkAt(f, 70 + seed * 7, seed), breathe: Math.sin(f / 16 + seed), head: Math.sin(f * 0.05 + seed) * 2 });
const scene = (f: number) => TL.scenes.find((s) => f >= s.a && f < s.b) ?? TL.scenes[TL.scenes.length - 1];
const st = (w = 6) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });

// ---------------------------------------------------------------- side view of the dock (16:9 set, cropped by Win)
const Side: React.FC<{ f: number; tX: number; sw: number; tug?: number; rope?: number }> = ({ f, tX, sw, tug = 0, rope = 0 }) => {
  const nyX = lerp(900, 1010, sw), nyY = lerp(950, 880, sw);
  return (
    <g>
      <SeaSky f={f} mode="day" horizon={560} />
      <path d="M -100 560 L 400 530 L 900 550 L 1400 525 L 2020 560 Z" fill="#7fae7a" stroke={INK} strokeWidth={3} />
      {[200, 480, 1500, 1750].map((x, i) => <rect key={i} x={x} y={500 - (i % 2) * 20} width={70} height={60} fill="#d8c8a8" stroke={INK} strokeWidth={3} />)}
      <g transform={`translate(${tX} 650) scale(0.45)`}><Titanic f={f} /></g>
      <g transform="translate(960 650)"><WaterFront f={f} width={4000} color="#3f7fbf" /></g>
      <g transform={`translate(${nyX} ${nyY}) rotate(${lerp(0, -9, sw)}) scale(0.6)`}><Steamer f={f} kind="californian" /><text x={0} y={-10} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={40} fill="#f1e6c8">NEW YORK</text></g>
      {tug > 0 && <g transform={`translate(${lerp(400, 640, tug)} 960) scale(0.32)`}><path d="M -260 -40 L 260 -40 L 200 60 L -220 60 Z" fill="#3a3133" {...st(8)} /><rect x={-120} y={-120} width={200} height={80} fill="#e8dcc0" {...st(7)} /><rect x={-20} y={-230} width={70} height={110} fill="#c0473f" {...st(7)} /><text x={0} y={30} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={60} fill="#f1e6c8">VULCAN</text></g>}
      {tug > 0 && rope > 0 && <path d={`M ${lerp(400, 640, tug) + 80} 945 Q ${(lerp(400, 640, tug) + nyX) / 2 - 60} ${rope > 1 ? 960 : 930} ${nyX - 170} ${nyY - 20}`} fill="none" stroke="#8a6a44" strokeWidth={6} />}
      <g transform="translate(960 950)"><WaterFront f={f} width={4000} color="#2f6fa8" /></g>
      <rect x={-100} y={1010} width={2120} height={120} fill="#b9a27f" stroke={INK} strokeWidth={4} />
      {[300, 700, 1300].map((x) => <g key={x}><rect x={x - 18} y={985} width={36} height={30} rx={6} fill="#3a3133" {...st(4)} /><rect x={x - 26} y={978} width={52} height={14} rx={6} fill="#3a3133" {...st(4)} /></g>)}
    </g>
  );
};

// ---------------------------------------------------------------- top-down dock (vertical coordinates)
const TopShip: React.FC<{ len: number; w: number; funnels: number; hull?: string; deck?: string; fun?: string; label?: string; lc?: string }> = ({ len, w, funnels, hull = "#26232a", deck = "#e9dcc0", fun = PAL.funnelBuff, label, lc = "#fff" }) => {
  const h = len / 2, hull_d = `M 0 ${-h} Q ${w / 2} ${-h + w * 0.7} ${w / 2} ${-h + w * 1.5} L ${w / 2} ${h - w * 0.35} Q ${w / 2} ${h} 0 ${h} Q ${-w / 2} ${h} ${-w / 2} ${h - w * 0.35} L ${-w / 2} ${-h + w * 1.5} Q ${-w / 2} ${-h + w * 0.7} 0 ${-h} Z`;
  return (
    <g>
      <path d={hull_d} fill="#000" opacity={0.18} transform="translate(14 18)" />
      <path d={hull_d} fill={hull} {...st(6)} />
      <path d={hull_d} fill={deck} transform={`scale(0.8 0.94)`} />
      {Array.from({ length: Math.floor(len / 90) }, (_, i) => <rect key={i} x={w * 0.33} y={-h + w * 1.6 + i * 85} width={w * 0.1} height={44} fill="#fbf8f2" stroke={INK} strokeWidth={3} />)}
      {Array.from({ length: Math.floor(len / 90) }, (_, i) => <rect key={i} x={-w * 0.43} y={-h + w * 1.6 + i * 85} width={w * 0.1} height={44} fill="#fbf8f2" stroke={INK} strokeWidth={3} />)}
      {Array.from({ length: funnels }, (_, i) => { const y = -h * 0.45 + (i * h * 0.95) / Math.max(1, funnels - 1); return <g key={i}><ellipse cx={0} cy={y} rx={w * 0.22} ry={w * 0.3} fill={fun} {...st(5)} /><ellipse cx={0} cy={y} rx={w * 0.12} ry={w * 0.17} fill="#262225" /></g>; })}
      {label && <text x={0} y={h * 0.62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.min(56, w * 0.4)} fill={lc} stroke={INK} strokeWidth={8} paintOrder="stroke" transform={`rotate(-90 0 ${h * 0.62})`}>{label}</text>}
    </g>
  );
};
const Water: React.FC<{ f: number; w?: number; h?: number }> = ({ f, w = 1080, h = 1920 }) => (
  <g>
    <rect x={-600} y={-600} width={w + 1200} height={h + 1200} fill="#3f7fbf" />
    {Array.from({ length: 40 }, (_, i) => { const x = ((i * 173) % (w + 400)) - 200, y = ((i * 311 + f * 1.2) % (h + 400)) - 200; return <path key={i} d={`M ${x} ${y} q 20 -10 40 0 q 20 10 40 0`} fill="none" stroke="#bfe0f5" strokeWidth={5} opacity={0.5} />; })}
  </g>
);
/** dock seen from above. tY = Titanic centre y; sw = New York stern swing 0..1; ropes 0 tight .. 1 snapped */
const TopDock: React.FC<{ f: number; tY: number; sw: number; ropes?: number; tug?: number; tugRope?: number; arrows?: number; gap?: number; labels?: boolean; noTugLabel?: boolean; z?: number; fx?: number; fy?: number }> = ({ f, tY, sw, ropes = 0, tug = 0, tugRope = 0, arrows = 0, gap = 0, labels = true, z = 1, fx = 540, fy = 960, noTugLabel = false }) => {
  const nyBow = [440, 530], ang = -14 * sw;
  const stern = [nyBow[0] - Math.sin((ang * Math.PI) / 180) * 900, nyBow[1] + Math.cos((ang * Math.PI) / 180) * 900];
  const tugP = [lerp(560, stern[0] - 40, tug), lerp(1900, stern[1] + 120, tug)];
  return (
    <V>
      <g transform={`translate(540 960) scale(${z}) translate(${-fx} ${-fy})`}>
        <Water f={f} />
        <rect x={-600} y={-600} width={760} height={3200} fill="#b9a27f" {...st(5)} />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={110} y={i * 160 - 100} width={40} height={40} rx={10} fill="#3a3133" {...st(4)} />)}
        <g transform="translate(270 900)"><TopShip len={1150} w={160} funnels={2} label={labels ? "OCEANIC" : undefined} /></g>
        {/* mooring ropes New York -> Oceanic */}
        {[640, 900, 1200, 1380].map((y, i) => {
          const snapped = ropes * 4 > i; const p0 = [350, y - 20];
          const yy = lerp(y, y, 0); const r0 = (yy - nyBow[1]) / 900; const p1 = [nyBow[0] - Math.sin((ang * Math.PI) / 180) * 900 * r0 - 50, nyBow[1] + Math.cos((ang * Math.PI) / 180) * 900 * r0];
          return snapped ? <g key={i}><path d={`M ${p0[0]} ${p0[1]} q 30 40 10 70`} fill="none" stroke="#8a6a44" strokeWidth={8} /><path d={`M ${p1[0]} ${p1[1]} q -30 40 -10 70`} fill="none" stroke="#8a6a44" strokeWidth={8} /></g> : <line key={i} x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke="#8a6a44" strokeWidth={8} />;
        })}
        <g transform={`translate(${nyBow[0]} ${nyBow[1]}) rotate(${ang}) translate(0 450)`}><TopShip len={900} w={130} funnels={2} hull="#2b2c35" fun="#262225" label={labels ? "NEW YORK" : undefined} lc="#ffd84a" /></g>
        <g transform={`translate(830 ${tY})`}><TopShip len={1750} w={230} funnels={4} label={labels ? "TITANIC" : undefined} /></g>
        {arrows > 0 && Array.from({ length: 5 }, (_, i) => { const y = tY - 700 + i * 300, t = (f * 0.04 + i * 0.2) % 1; return <g key={i} opacity={arrows * (1 - t)} transform={`translate(${700 - t * 150} ${y})`}><path d="M 0 0 L -90 0 M -60 -26 L -92 0 L -60 26" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" /></g>; })}
        {tug > 0 && <g transform={`translate(${tugP[0]} ${tugP[1]})`}><TopShip len={190} w={70} funnels={1} hull="#3a3133" fun="#c0473f" />{!noTugLabel && <text x={70} y={10} fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">VULCAN</text>}</g>}
        {tug > 0.9 && tugRope > 0 && (tugRope < 1 || tugRope >= 2) && <line x1={tugP[0]} y1={tugP[1] - 90} x2={stern[0]} y2={stern[1] - 30} stroke="#d9b37a" strokeWidth={9} />}
        {tug > 0.9 && tugRope >= 1 && tugRope < 2 && <g><path d={`M ${tugP[0]} ${tugP[1] - 90} q 30 -30 10 -60`} fill="none" stroke="#d9b37a" strokeWidth={9} /><path d={`M ${stern[0]} ${stern[1] - 30} q -20 40 10 60`} fill="none" stroke="#d9b37a" strokeWidth={9} /></g>}
        {gap > 0 && <g opacity={gap}><path d={`M ${stern[0] + 58} ${stern[1] - 90} L 715 ${stern[1] - 90}`} stroke="#c0473f" strokeWidth={12} /><path d={`M ${stern[0] + 58} ${stern[1] - 120} L ${stern[0] + 58} ${stern[1] - 60} M 715 ${stern[1] - 120} L 715 ${stern[1] - 60}`} stroke="#c0473f" strokeWidth={10} /></g>}
      </g>
    </V>
  );
};

// ---------------------------------------------------------------- rope snap close-up (vertical)
const RopeSnap: React.FC<{ f: number; snaps: number[] }> = ({ f, snaps }) => (
  <V>
    <rect width={1080} height={1920} fill="#2b2c35" />
    {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={120 + (i % 2) * 840} cy={120 + i * 180} r={20} fill="#3e3f4a" {...st(4)} />)}
    <rect x={0} y={1500} width={1080} height={420} fill="#b9a27f" {...st(5)} />
    {snaps.map((t, i) => {
      const y0 = 1560 + i * 90, x0 = 160 + i * 60, x1 = 980, y1 = 360 + i * 300;
      const shake = f < t ? Math.sin(f * 2.5 + i) * clamp((f - t + 30) / 30) * 6 : 0;
      if (f < t) return <g key={i}><line x1={x0} y1={y0} x2={x1} y2={y1 + shake} stroke="#6b6f7d" strokeWidth={30} strokeLinecap="round" /><line x1={x0} y1={y0} x2={x1} y2={y1 + shake} stroke="#a7abb8" strokeWidth={10} strokeDasharray="22 18" /></g>;
      const p = clamp((f - t) / 12), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      return (
        <g key={i}>
          <path d={`M ${x0} ${y0} Q ${lerp(mx, x0 + 120, p)} ${lerp(my, y0 - 40, p) + p * 260} ${lerp(mx - 20, x0 + 200, p)} ${lerp(my, y0 + 40, p) + p * 200}`} fill="none" stroke="#6b6f7d" strokeWidth={30} strokeLinecap="round" />
          <path d={`M ${x1} ${y1} Q ${lerp(mx, x1 - 80, p)} ${lerp(my, y1 + 80, p) + p * 200} ${lerp(mx + 20, x1 - 40, p)} ${lerp(my, y1 + 300, p)}`} fill="none" stroke="#6b6f7d" strokeWidth={30} strokeLinecap="round" />
          {f - t < 14 && <g><ShockLines t={f - t} x={mx} y={my} s={2.6} /><text x={mx} y={my - 70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill="#ffd84a" stroke={INK} strokeWidth={16} paintOrder="stroke" transform={`rotate(${-10 + i * 8} ${mx} ${my}) scale(1)`}>BANG!</text></g>}
        </g>
      );
    })}
  </V>
);

// ---------------------------------------------------------------- water cut-away: how one ship pulls another
const Mech: React.FC<{ f: number; a: number; lift: number; drop: number; snap: number }> = ({ f, a, lift, drop, snap }) => {
  const tx = lerp(-700, 1500, clamp((f - a) / 230));
  const bump = Math.exp(-(((540 - tx - 250) / 260) ** 2));          // bulge ahead of the hull
  const level = f < drop ? bump * 70 * prog(f, lift - 10, lift + 6) : -90 * prog(f, drop - 4, drop + 8) + 90 * prog(f, drop + 30, drop + 60);
  const surf = (x: number) => 900 - Math.exp(-(((x - tx - 250) / 260) ** 2)) * 70 * clamp((f - a) / 20) + Math.exp(-(((x - tx + 300) / 300) ** 2)) * 70 * clamp((f - a) / 20);
  const pts = Array.from({ length: 28 }, (_, i) => { const x = -40 + i * 42; return `${x},${surf(x)}`; }).join(" ");
  const nyY = 900 - level;
  return (
    <V>
      <rect width={1080} height={1920} fill="#cfe3ee" />
      <polygon points={`-40,1920 ${pts} 1120,1920`} fill="#3f7fbf" />
      <rect x={0} y={1600} width={1080} height={320} fill="#7a6a52" />
      <text x={540} y={1760} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#e8dcc0">RIVER BED</text>
      {/* Titanic cut-away hull (huge, deep) */}
      <g transform={`translate(${tx} -170) scale(0.8)`} opacity={0.8}>
        <path d="M -620 700 L 300 700 Q 420 760 380 1180 L -620 1180 Z" fill="#4a4652" {...st(8)} />
        <rect x={-620} y={560} width={900} height={140} fill="#f1ece2" {...st(6)} />
        <text x={-160} y={980} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill="#fff4dc">TITANIC</text>
      </g>
      {/* little New York on the surface + rope to the quay */}
      <rect x={-20} y={720} width={140} height={880} fill="#b9a27f" {...st(5)} />
      <rect x={70} y={690} width={40} height={40} rx={8} fill="#3a3133" {...st(4)} />
      {f < snap ? <path d={`M 100 700 Q ${(100 + 420) / 2} ${lerp(760, 700, clamp(level / 70))} 420 ${nyY - 40}`} fill="none" stroke="#8a6a44" strokeWidth={10} /> : <g><path d="M 100 700 q 60 60 30 120" fill="none" stroke="#8a6a44" strokeWidth={10} /><path d={`M 420 ${nyY - 40} q -50 50 -20 110`} fill="none" stroke="#8a6a44" strokeWidth={10} /></g>}
      <g transform={`translate(560 ${nyY}) rotate(${Math.sin(f * 0.2) * 2 + (f > drop ? -4 : 0)})`}>
        <path d="M -170 -40 L 170 -40 L 130 50 L -140 50 Z" fill="#2b2c35" {...st(7)} />
        <rect x={-110} y={-100} width={200} height={60} fill="#e8dcc0" {...st(6)} />
        <rect x={-30} y={-180} width={50} height={80} fill="#262225" {...st(6)} />
        <text x={0} y={22} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={34} fill="#f1e6c8">NEW YORK</text>
      </g>
      {f >= snap && f < snap + 14 && <g><ShockLines t={f - snap} x={260} y={700} s={2} /><text x={260} y={620} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={100} fill="#ffd84a" stroke={INK} strokeWidth={12} paintOrder="stroke">SNAP!</text></g>}
      {[["WATER PUSHED ASIDE", a + 20, 420], ["LIFTED…", lift, 560], ["…DROPPED", drop, 680]].map(([t, at, y], i) => f >= (at as number) ? <g key={i} transform={`translate(540 ${y}) rotate(${i % 2 ? 2 : -2}) scale(${prog(f, at as number, (at as number) + 6)})`}><rect x={-330} y={-50} width={660} height={90} rx={45} fill={i === 0 ? "#fff7e6" : "#ffd84a"} {...st(6)} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>{t}</text></g> : null)}
      <text x={540} y={1460} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={34} fill="#fff" opacity={0.85}>cut-away, not to scale</text>
    </V>
  );
};

// ---------------------------------------------------------------- the Solent, 20 Sept 1911 (top-down)
const Solent: React.FC<{ f: number; p: number; hit: number }> = ({ f, p, hit }) => {
  const hx = lerp(820, 640, p), hy = lerp(1400, 1050, p);
  const shake = f >= hit && f < hit + 14 ? Math.sin(f * 3) * 10 : 0;
  return (
    <V>
      <g transform={`translate(${shake} 0)`}>
        <Water f={f} />
        <path d="M -50 0 L 160 0 Q 230 500 150 1000 Q 90 1500 180 1920 L -50 1920 Z" fill="#7fae7a" {...st(5)} />
        <text x={70} y={980} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff" transform="rotate(-90 70 980)" stroke={INK} strokeWidth={6} paintOrder="stroke">ISLE OF WIGHT</text>
        <g transform={`translate(480 ${lerp(1000, 940, p)})`}><TopShip len={1700} w={220} funnels={4} label="OLYMPIC" /></g>
        <g transform={`translate(${hx} ${hy}) rotate(${lerp(0, -18, p)})`}><TopShip len={620} w={110} funnels={2} hull="#6b6f7d" deck="#a7abb8" fun="#55535a" label="HMS HAWKE" lc="#ffd84a" /></g>
        {Array.from({ length: 4 }, (_, i) => { const t = (f * 0.04 + i * 0.25) % 1; return <path key={i} d={`M ${720 + t * -40} ${1300 - i * 160} l -70 -20`} stroke="#fff" strokeWidth={12} strokeLinecap="round" opacity={(1 - t) * clamp(p * 3) * (f < hit ? 1 : 0)} />; })}
        {f >= hit && <g><ShockLines t={f - hit} x={600} y={1250} s={2.4} /><text x={760} y={1150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill="#ffd84a" stroke={INK} strokeWidth={14} paintOrder="stroke" transform={`scale(${f < hit + 8 ? 1 + (1 - (f - hit) / 8) * 0.3 : 1})`} style={{ transformOrigin: "760px 1150px" }}>CRASH!</text></g>}
      </g>
    </V>
  );
};

export const ShortB: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFonts();
  if (!ok) return null;
  const noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  const sc = scene(f), name = sc.name, pz = (a: number, b: number) => lerp(a, b, prog(f, sc.a, sc.b));
  let world: React.ReactNode = null, bg = "#3f7fbf";
  const over: React.ReactNode[] = [], html: React.ReactNode[] = [], top: React.ReactNode[] = [];
  let hideCaps = false;
  const dayGrade = (id: string, extra: React.ReactNode[] = []) => over.push(<Grade key="g" f={f} id={id} tint="warm" vig={0.5} pools={[{ x: 760, y: 260, r: 900, c: "#fff1c4", a: 0.45 }]} />, ...extra);

  switch (name) {
    case "hook": {
      world = <TopDock f={f} tY={1250} sw={0.85} ropes={1} gap={1} z={pz(1.25, 1.45)} fx={600} fy={1180} />;
      over.push(<Grade key="g" f={f} id="hk" tint="warm" vig={0.65} />);
      top.push(<g key="m" transform={`translate(560 1460) scale(${1 + Math.sin(f * 0.2) * 0.04})`}><rect x={-160} y={-58} width={320} height={104} rx={52} fill="#fff7e6" {...st(7)} /><text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill="#c0473f">4 FEET</text></g>);
      html.push(<HookText key="h" f={f} a={0} b={W("B01", 10) - 2} l1="TITANIC ALMOST CRASHED" l2="BEFORE SHE LEFT PORT" y={230} />);
      if (f >= W("B01", 10)) html.push(<HookText key="h2" f={f} a={W("B01", 10)} b={sc.b} l1="NOT INTO AN ICEBERG…" l2="INTO ANOTHER SHIP" y={230} c2="#ff8a7a" />);
      hideCaps = true;
      break;
    }
    case "dock": {
      const td = W("B02", 7);
      if (f < td) {
        world = <Win cx={lerp(700, 980, prog(f, sc.a, td))} cy={640} z={1.05}><Side f={f} tX={lerp(200, 700, prog(f, sc.a, td))} sw={0} /></Win>;
        dayGrade("dk", [<Rays key="r" f={f} x={850} y={-80} ang={24} />, <Fg key="fg" kind="rope" f={f} />]);
        html.push(<Stamp key="st" f={f} a={sc.a + 2} b={td - 2} text="Southampton" sub="10 April 1912 · noon" />);
      } else {
        world = <TopDock f={f} tY={lerp(2300, 1650, prog(f, td, sc.b + 140))} sw={0} z={0.92} />;
        over.push(<Grade key="g" f={f} id="dk2" tint="warm" vig={0.45} grain />);
        html.push(<Label key="l" f={f} a={td + 6} b={sc.b} y={240} text="seen from above" />);
      }
      break;
    }
    case "snap": {
      const bangs = [W("B03", 1), W("B03", 2), W("B03", 3)];
      if (f < W("B03", 4)) world = <RopeSnap f={f} snaps={bangs} />;
      else world = <TopDock f={f} tY={lerp(1650, 1500, prog(f, W("B03", 4), sc.b))} sw={0.05 * prog(f, W("B03", 9), sc.b)} ropes={prog(f, W("B03", 8), W("B03", 13))} z={1.0} fy={1000} />;
      over.push(<Grade key="g" f={f} id="sn" tint={f < W("B03", 4) ? "cool" : "warm"} vig={0.6} />);
      if (f >= W("B03", 12)) html.push(<Label key="l" f={f} a={W("B03", 12)} b={sc.b} y={240} text="“like gunfire” — reports at the time" />);
      break;
    }
    case "swing": {
      const sw = prog(f, sc.a, sc.b + 10);
      world = <TopDock f={f} tY={lerp(1500, 1350, prog(f, sc.a, sc.b))} sw={sw * 0.85} ropes={1} z={lerp(1.0, 1.1, sw)} fy={1150} />;
      over.push(<Grade key="g" f={f} id="sw" tint="warm" vig={0.6} />);
      top.push(<g key="ar" opacity={prog(f, sc.a + 6, sc.a + 12)} transform="translate(560 1520)"><path d="M -120 0 Q 0 -60 120 0" fill="none" stroke="#c0473f" strokeWidth={18} strokeLinecap="round" /><path d="M 90 -36 L 126 2 L 78 20" fill="none" stroke="#c0473f" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" /></g>);
      break;
    }
    case "question": {
      world = <TopDock f={f} tY={1350} sw={0.85} ropes={1} z={1.1} fy={1150} />;
      over.push(<Grade key="g" f={f} id="qs" tint="cool" vig={0.7} />);
      top.push(<rect key="d" width={1080} height={1920} fill="#120c10" opacity={0.35 * prog(f, sc.a, sc.a + 8)} />);
      html.push(<HookText key="h" f={f} a={sc.a + 2} b={sc.b} l1="PULLED…" l2="WITHOUT TOUCHING?" y={300} />);
      top.push(<g key="q">{[0, 1, 2].map((i) => <text key={i} x={300 + i * 240} y={1000 - Math.abs(Math.sin(f * 0.2 + i)) * 40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170} fill="#fff" stroke={INK} strokeWidth={14} paintOrder="stroke" opacity={prog(f, sc.a + 4 + i * 3, sc.a + 10 + i * 3)}>?</text>)}</g>);
      hideCaps = true;
      break;
    }
    case "mech": {
      const youSee = W("B06", 0);
      world = <Mech f={f} a={youSee} lift={W("B06", 18)} drop={W("B06", 20)} snap={W("B06", 24)} />;
      over.push(<Grade key="g" f={f} id="mc" tint="none" vig={0.4} grain={false} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 1} b={W("B06", 6)} text="You see…" y={260} />);
      break;
    }
    case "tug": {
      const dial = W("B07", 2), tugIn = W("B07", 5), throw1 = W("B07", 9), snap1 = W("B07", 13), hold = W("B07", 14);
      if (f < tugIn - 2) {
        world = <Win cx={1460} cy={560} z={1.0}><Bridge f={f} murdoch={{ ...idle(f, 2), look: -0.3, armR: 90, brow: -1, mouth: "o", eyes: "wide" }} mSpec={SMITH} helm={WORKER(1)} wheel={0} berg={0} /></Win>;
        over.push(<Grade key="g" f={f} id="tg" tint="lamp" vig={0.65} pools={[{ x: 540, y: 300, r: 700, c: "#fff1c4", a: 0.35 }]} />);
        top.push(<Card key="dl" f={f} a={dial - 8} b={tugIn - 2} y={820} rot={0} s={0.95} dim={0.35}><EngineDial f={f} to={0} t={dial} /></Card>);
        html.push(<VTag key="sm" f={f} a={sc.a + 2} dur={dial - sc.a - 6} y={560} name="Captain Edward Smith" role="on the bridge" color="#22304f" />);
      } else {
        const tugP = prog(f, tugIn, throw1);
        const ropeState = f < throw1 ? 0 : f < snap1 ? 0.5 : f < hold + 6 ? 1.5 : 2.5;
        world = <TopDock f={f} tY={1300} sw={0.85} ropes={1} tug={tugP} tugRope={ropeState} z={1.15} fy={1300} />;
        over.push(<Grade key="g" f={f} id="tg2" tint="warm" vig={0.6} />);
        if (f >= snap1 && f < snap1 + 14) top.push(<g key="sn"><ShockLines t={f - snap1} x={560} y={1100} s={2} /><text x={560} y={1000} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#ffd84a" stroke={INK} strokeWidth={12} paintOrder="stroke">SNAP!</text></g>);
        if (f >= hold + 8) top.push(<g key="ok" transform={`translate(560 1000) scale(${prog(f, hold + 8, hold + 14)})`}><rect x={-170} y={-60} width={340} height={100} rx={50} fill="#7fd08a" {...st(7)} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>HOLDS!</text></g>);
      }
      break;
    }
    case "close": {
      const ft = W("B08", 5);
      world = <TopDock f={f} tY={1300} sw={0.85} ropes={1} tug={1} tugRope={2.5} gap={prog(f, ft - 6, ft)} z={pz(1.3, 1.7)} fx={620} fy={1250} noTugLabel />;
      over.push(<Grade key="g" f={f} id="cl" tint="warm" vig={0.65} />);
      top.push(<g key="m" opacity={prog(f, ft - 6, ft)} transform={`translate(560 1520) scale(${1 + Math.sin(clamp((f - ft) / 8) * Math.PI) * 0.2})`}><rect x={-230} y={-60} width={460} height={110} rx={55} fill="#fff7e6" {...st(7)} /><text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#c0473f">≈ 4 FT · 1.2 M</text></g>);
      break;
    }
    case "geddes": {
      world = <Win cx={1000} cy={640} z={1.15}><Deck f={f} camX={-60} zoom={1.25} focusY={640} stage={<Chibi spec={GEDDES} pose={{ ...idle(f, 5), talk: env("G1", f), eyes: "wide", brow: 1, mouth: "o", armR: 120, armL: 40 }} x={1000} y={1030} size={520} />} /></Win>;
      over.push(<Grade key="g" f={f} id="gd" tint="warm" vig={0.55} pools={[{ x: 540, y: 300, r: 800, c: "#fff1c4", a: 0.45 }]} />, <Fg key="fg" kind="rail" f={f} />);
      html.push(<Bubble key="b" f={f} a={S("G1") - 2} b={sc.b} y={560} tx={560} ty={720} text="The New York broke her ropes and very nearly ran into us!" />);
      html.push(<Label key="l" f={f} a={S("G1")} b={sc.b} y={580} text="steward Richard Geddes, letter home" />);
      html.push(<VTag key="t" f={f} a={sc.a + 2} dur={sc.b - sc.a - 4} y={1250} name="Richard Geddes" role="steward" color="#3f7a5a" />);
      hideCaps = true;
      break;
    }
    case "smith": {
      world = <Win cx={1240} cy={720} z={1.25}><Bridge f={f} murdoch={{ ...idle(f, 2), look: -0.5, armR: 20, brow: -1, mouth: "flat", eyes: "squint" }} mSpec={SMITH} helm={WORKER(1)} wheel={0} berg={0} /></Win>;
      over.push(<Grade key="g" f={f} id="sm" tint="lamp" vig={0.75} pools={[{ x: 540, y: 700, r: 600, c: "#ffe2a0", a: 0.4 }]} />);
      top.push(<g key="sw" opacity={0.6 * prog(f, sc.a + 10, sc.b)}>{[0, 1, 2].map((i) => <circle key={i} cx={540} cy={760} r={300 + i * 120 + ((f * 4) % 120)} fill="none" stroke="#fff" strokeWidth={10} strokeDasharray="30 30" opacity={0.4} />)}</g>);
      break;
    }
    case "hawke": {
      const hit = W("B10", 18), paper = hit + 26;
      world = <Solent f={f} p={prog(f, W("B10", 8), hit)} hit={hit} />;
      over.push(<Grade key="g" f={f} id="hw" tint="cool" vig={0.6} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={W("B10", 8)} text="The Solent, England" sub="20 September 1911" />);
      top.push(<Card key="np" f={f} a={paper} b={sc.b + 40} y={900} rot={-3} s={0.95} dim={0.5}><Newspaper f={f} paperName="The New York Times" date="Thursday, 11 April 1912" head={["TITANIC IN PERIL", "ON LEAVING PORT"]} sub={["Suction of giant liner", "breaks hawsers of the New York", "LIKE THE OLYMPIC ACCIDENT"]} hl={paper + 14} /></Card>);
      if (f >= paper) html.push(<Label key="l" f={f} a={paper + 8} b={sc.b + 40} y={1500} text="real 1912 headlines (redrawn)" />);
      break;
    }
    case "delay": {
      const cal = W("B11", 7), cross = W("B11", 13);
      world = <Win cx={pz(900, 1100)} cy={700} z={1.1}><Shipyard f={f} build401={0.95}>
        {[0, 1, 2, 3].map((i) => <Chibi key={i} spec={WORKER(i)} pose={{ ...idle(f, i), walk: 1, phase: f * 0.35 + i, armR: 20, look: 0.3 }} x={lerp(700 + i * 120, 1500 + i * 120, ((f - sc.a) / 200 + i * 0.1) % 1)} y={1000} size={230} />)}
      </Shipyard></Win>;
      over.push(<Grade key="g" f={f} id="dl" tint="warm" vig={0.55} pools={[{ x: 300, y: 500, r: 500, c: "#ffb76b", a: 0.4, flicker: 0.2 }]} />, <Fg key="fg" kind="rivets" f={f} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={cal - 2} text="Belfast shipyard" sub="autumn 1911" />);
      top.push(<Card key="cal" f={f} a={cal} b={sc.b + 2} y={820} rot={3} s={0.95}><Calendar f={f} day="10" month="APRIL" note="MAIDEN VOYAGE" crossed={{ day: "20", month: "MARCH", t: cross }} /></Card>);
      break;
    }
    case "end": {
      const endA = E("B12") + 4;
      world = <Win cx={1250} cy={560} z={pz(1.1, 1.25)}><NightSea f={f} shipX={lerp(800, 1000, prog(f, sc.a, sc.b))} berg={1} bergX={1450} scale={0.6} /></Win>;
      bg = "#070b1c";
      over.push(<Grade key="g" f={f} id="en" tint="night" vig={0.8} pools={[{ x: 700, y: 300, r: 500, c: "#cfe0ff", a: 0.25 }]} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={endA} text="4 days later" sub="14 April 1912" />);
      top.push(<EndCard key="ec" f={f} a={endA} title="EPISODE 1" sub="the near-miss + who was on board"><g transform="translate(0 40) scale(0.42)"><Titanic f={f} /></g><Sparkles f={f} x={0} y={-60} spread={300} n={8} seed={3} /></EndCard>);
      if (f >= endA) hideCaps = true;
      break;
    }
  }
  void Rays; void WaterFront;
  return (
    <AbsoluteFill style={{ background: bg }}>
      {world}
      {over}
      <V>{top}</V>
      {html}
      <Captions f={f} caps={TL.caps} hide={hideCaps} />
      <Watermark />
      {!noAudio && <Audio src={staticFile("shB_mix.wav")} />}
    </AbsoluteFill>
  );
};
