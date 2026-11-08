// Sets for "The Real Titanic in 3 Minutes". Every component draws a full 1920x1080 SVG scene for local frame f.
import React from "react";
import { INK, PAL, prog, lerp, clamp } from "./style";
import { Chibi, Pose, Spec } from "./chibi";
import { Titanic, Steamer, Iceberg, SeaSky, WaterFront } from "./ship";
import { Sunburst, Sparkles } from "./fx";

const st = (w = 4) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
const FONT = "CapBlack, Montserrat, sans-serif";
const FONT2 = "WmBold, Montserrat, sans-serif";

/** camera wrapper: zoom around (cx, cy) plus pan */
export const Cam: React.FC<{ z?: number; cx?: number; cy?: number; dx?: number; dy?: number; rot?: number; children: React.ReactNode }> = ({ z = 1, cx = 960, cy = 540, dx = 0, dy = 0, rot = 0, children }) => (
  <g transform={`translate(${960 + dx} ${540 + dy}) rotate(${rot}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);

// ---------------------------------------------------------------- title + countdown cards
export const TitleCard: React.FC<{ f: number }> = ({ f }) => {
  const p = prog(f, 0, 6), bob = Math.sin(f * 0.08) * 6;
  return (
    <g>
      <SeaSky f={f} mode="night" horizon={760} />
      <g transform={`translate(${lerp(500, 1000, clamp(f / 70))} ${880 + bob}) scale(0.62)`}><Titanic f={f} night /></g>
      <g transform={`translate(0 ${880})`}><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g>
      <g transform={`translate(960 ${330 - (1 - p) * 60}) scale(${0.8 + 0.2 * p})`} opacity={p}>
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill="#fff4dc" stroke={INK} strokeWidth={16} paintOrder="stroke" letterSpacing={6}>THE REAL TITANIC</text>
        <g transform={`translate(0 92) rotate(-2)`} opacity={prog(f, 12, 20)}>
          <rect x={-330} y={-56} width={660} height={84} rx={42} fill="#ffd84a" stroke={INK} strokeWidth={7} />
          <text x={0} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>5 TINY THINGS</text>
        </g>
      </g>
      <Sparkles f={f} x={960} y={330} spread={520} n={10} seed={5} />
    </g>
  );
};

export const Icon: React.FC<{ kind: string; f: number }> = ({ kind, f }) => {
  if (kind === "binoculars") return (
    <g>
      <circle cx={-48} cy={20} r={42} fill="#2b2d38" {...st(6)} /><circle cx={48} cy={20} r={42} fill="#2b2d38" {...st(6)} />
      <circle cx={-48} cy={20} r={24} fill="#7fb6d6" {...st(4)} /><circle cx={48} cy={20} r={24} fill="#7fb6d6" {...st(4)} />
      <rect x={-20} y={-30} width={40} height={50} rx={10} fill="#3a3d4a" {...st(5)} />
      <path d="M -88 -80 L 88 80" stroke="#e5484d" strokeWidth={16} strokeLinecap="round" opacity={prog(f, 8, 12)} />
    </g>
  );
  if (kind === "radio") return (
    <g>
      <rect x={-90} y={-50} width={180} height={110} rx={14} fill="#7b4a2c" {...st(6)} />
      <circle cx={-40} cy={0} r={22} fill="#e9dcc0" {...st(4)} /><circle cx={30} cy={0} r={14} fill="#e9dcc0" {...st(4)} />
      <path d="M 0 -50 L 0 -110" {...st(6)} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${-30 - i * 22} ${-120 - i * 8} Q 0 ${-150 - i * 22} ${30 + i * 22} ${-120 - i * 8}`} fill="none" stroke={INK} strokeWidth={5} opacity={(Math.sin(f * 0.3 - i) + 1) / 2} />)}
    </g>
  );
  if (kind === "stopwatch") return (
    <g transform={`rotate(${Math.sin(f * 0.5) * 6})`}>
      <circle cx={0} cy={10} r={86} fill="#fff7e6" {...st(7)} /><rect x={-16} y={-100} width={32} height={22} rx={6} fill="#c0473f" {...st(5)} />
      <path d={`M 0 10 L ${Math.sin(f * 0.25) * 60} ${10 - Math.cos(f * 0.25) * 60}`} {...st(7)} /><circle cx={0} cy={10} r={8} fill={INK} />
    </g>
  );
  if (kind === "law") return (
    <g transform="rotate(-6)">
      <rect x={-80} y={-100} width={160} height={200} rx={10} fill="#fbf4e4" {...st(6)} />
      <text x={0} y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#7b2f2a">1894</text>
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M -54 ${-6 + i * 24} L 54 ${-6 + i * 24}`} stroke="#9aa6b8" strokeWidth={5} />)}
    </g>
  );
  return ( // sleeping radio
    <g>
      <rect x={-90} y={-40} width={180} height={100} rx={14} fill="#4a4f60" {...st(6)} />
      <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#9aa1b3">OFF</text>
      {[0, 1, 2].map((i) => <text key={i} x={70 + i * 34} y={-60 - i * 40 - ((f * 0.8) % 30)} fontFamily={FONT} fontWeight={900} fontSize={38 + i * 10} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">Z</text>)}
    </g>
  );
};

export const Countdown: React.FC<{ f: number; n: number; label: string; icon: string }> = ({ f, n, label, icon }) => {
  const p = prog(f, 0, 8), q = prog(f, 6, 14);
  return (
    <g>
      <Sunburst f={f} c1={n === 5 ? "#ff8a6b" : "#8fd3f0"} c2={n === 5 ? "#ff6f4f" : "#6fc0e6"} />
      <g transform={`translate(960 330) scale(${0.4 + 0.6 * p + Math.sin(clamp(f / 8) * Math.PI) * 0.12})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#fff" stroke={INK} strokeWidth={16} paintOrder="stroke" letterSpacing={4}>TINY THING #{n}</text>
      </g>
      <g transform={`translate(960 ${560 + (1 - q) * 40}) scale(${1.4 * q})`}><Icon kind={icon} f={f} /></g>
      <g opacity={prog(f, 10, 16)}>
        <rect x={960 - label.length * 19 - 40} y={760} width={label.length * 38 + 80} height={96} rx={48} fill="#fff7e6" stroke={INK} strokeWidth={7} />
        <text x={960} y={826} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={INK}>{label}</text>
      </g>
      <Sparkles f={f} x={960} y={540} spread={600} n={8} seed={n} />
    </g>
  );
};

// ---------------------------------------------------------------- Southampton departure (day)
export const Departure: React.FC<{ f: number; shipX: number; children?: React.ReactNode }> = ({ f, shipX, children }) => (
  <g>
    <SeaSky f={f} mode="day" horizon={600} />
    {/* far shore */}
    <path d="M -100 600 L 300 560 L 520 585 L 820 548 L 1100 590 L 1500 560 L 2020 600 Z" fill="#7fae7a" {...st(3)} />
    <g transform={`translate(${shipX} 760) scale(0.78)`}><Titanic f={f} /></g>
    <g transform="translate(960 760)"><WaterFront f={f} width={4000} color="#3f7fbf" /></g>
    {/* quay */}
    <rect x={-100} y={880} width={2120} height={220} fill="#b9a27f" {...st(4)} />
    <rect x={-100} y={880} width={2120} height={26} fill="#8f7b5e" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 180 - 40} y={906} width={4} height={180} fill="#9c8869" />)}
    {[180, 1700].map((x, i) => <g key={i}><rect x={x - 18} y={850} width={36} height={40} rx={10} fill="#3a3d4a" {...st(4)} /></g>)}
    {children}
  </g>
);

// ---------------------------------------------------------------- crow's nest at night
export const CrowsNest: React.FC<{ f: number; fleet: Pose; lee: Pose; fleetSpec: Spec; leeSpec: Spec; bell?: number; phone?: boolean; berg?: number }> = ({ f, fleet, lee, fleetSpec, leeSpec, bell = -99, phone = false, berg = 0 }) => {
  const ring = f - bell >= 0 && f - bell < 40 ? Math.sin((f - bell) * 1.2) * 18 * (1 - (f - bell) / 40) : 0;
  return (
    <g>
      <SeaSky f={f} mode="night" horizon={930} />
      {berg > 0 && <g transform={`translate(1500 935) scale(${0.12 + berg * 0.3})`} opacity={berg}><path d="M -260 0 L -200 -150 L -120 -210 L -70 -330 L 10 -260 L 70 -300 L 150 -170 L 230 -90 L 280 0 Z" fill="#2a3150" stroke="#46507a" strokeWidth={6} /></g>}
      {/* mast */}
      <rect x={900} y={700} width={120} height={500} fill="#c9a36a" {...st(5)} />
      <rect x={990} y={700} width={30} height={500} fill="rgba(70,30,60,0.22)" />
      {/* lookouts behind the rim */}
      <Chibi spec={fleetSpec} pose={fleet} x={820} y={980} size={560} />
      <Chibi spec={leeSpec} pose={lee} x={1130} y={985} size={560} facing={-1} />
      {/* breath */}
      {[0, 1].map((k) => { const a = (f + k * 37) % 74; return <circle key={k} cx={(k ? 1050 : 900) + a * 1.2 * (k ? -1 : 1)} cy={620 - a * 0.6} r={10 + a * 0.4} fill="#dfe8f5" opacity={(1 - a / 74) * 0.5} />; })}
      {/* rim of the nest */}
      <path d="M 560 760 L 1360 760 L 1330 980 Q 960 1010 590 980 Z" fill="#e8e1d2" {...st(6)} />
      <path d="M 1100 760 L 1360 760 L 1330 980 Q 1230 992 1120 996 Z" fill="rgba(70,30,60,0.22)" />
      <path d="M 560 760 L 1360 760" stroke="#bfb6a3" strokeWidth={16} />
      {/* bell + phone */}
      <g transform={`translate(600 700) rotate(${ring})`}>
        <path d="M 0 0 L 0 26" {...st(5)} />
        <path d="M -38 92 Q -40 30 0 26 Q 40 30 38 92 Z" fill="#e3b14a" {...st(5)} />
        <circle cx={0} cy={98} r={9} fill="#b07d2c" {...st(3)} />
      </g>
      <path d="M 560 700 L 640 700" {...st(8)} />
      <g transform="translate(1320 690)">
        <rect x={-36} y={-50} width={72} height={100} rx={10} fill="#7b4a2c" {...st(5)} />
        {!phone && <path d="M -22 -40 Q 0 -60 22 -40" fill="none" {...st(9)} />}
      </g>
      {ring !== 0 && <g>{[0, 1, 2].map((i) => <path key={i} d={`M ${520 - i * 26} ${760 - i * 10} q -20 -30 0 -60`} fill="none" stroke="#fff" strokeWidth={6} opacity={0.8} strokeLinecap="round" />)}</g>}
    </g>
  );
};

// ---------------------------------------------------------------- radio room
export const RadioRoom: React.FC<{ f: number; spec: Spec; pose: Pose; pile: number; clock?: string; flash?: number; who?: "titanic" | "californian" }> = ({ f, spec, pose, pile, clock = "9:40", flash = 0, who = "titanic" }) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill={who === "titanic" ? "#d9c2a0" : "#3a4466"} />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200 - 20} y={0} width={8} height={760} fill={who === "titanic" ? "#c4aa84" : "#30395a"} />)}
    <rect x={0} y={740} width={1920} height={30} fill="#8a5a36" {...st(4)} />
    {/* clock */}
    <g transform="translate(1560 230)">
      <circle r={86} fill="#fff7e6" {...st(6)} />
      <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>{clock}</text>
      <text y={-40} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={20} fill="#7b6a58">P.M.</text>
    </g>
    {/* Marconi set on the wall */}
    <g transform="translate(560 300)">
      <rect x={-220} y={-120} width={440} height={240} rx={16} fill="#5a3a24" {...st(6)} />
      {[-130, -40, 50, 140].map((x, i) => <g key={i}><circle cx={x} cy={-30} r={30} fill="#e9dcc0" {...st(4)} /><path d={`M ${x} -30 L ${x + Math.sin(f * 0.2 + i) * 20} ${-30 - 18}`} {...st(4)} /></g>)}
      {[-150, -90, -30, 30, 90, 150].map((x) => <rect key={x} x={x - 14} y={50} width={28} height={36} rx={5} fill="#2b2d38" {...st(3)} />)}
      <circle cx={180} cy={-90} r={12} fill={flash > 0 ? "#ffe066" : "#4a3a2a"} {...st(3)} />
    </g>
    {/* operator */}
    <Chibi spec={spec} pose={pose} x={760} y={1030} size={620} />
    {/* desk */}
    <rect x={-40} y={860} width={2000} height={260} fill="#9b6a3f" {...st(6)} />
    <rect x={-40} y={860} width={2000} height={30} fill="#b98656" {...st(4)} />
    {/* telegraph key */}
    <g transform="translate(980 860)">
      <rect x={-70} y={-24} width={140} height={24} rx={6} fill="#3a3d4a" {...st(4)} />
      <path d={`M -50 -30 L 60 ${-46 + (pose.write ? Math.abs(Math.sin(f * 1.4)) * 10 : 0)}`} {...st(8)} />
      <circle cx={64} cy={-48} r={12} fill="#2b2b38" {...st(4)} />
    </g>
    {/* pile of passengers' messages */}
    {Array.from({ length: Math.round(4 + pile * 34) }, (_, i) => {
      const x = 1280 + ((i * 53) % 220) - (i % 3) * 18, y = 850 - i * (8 + pile * 4) + ((i * 7) % 6), r = ((i * 37) % 30) - 15;
      return <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><rect x={-70} y={-24} width={140} height={48} rx={4} fill="#fbf4e4" {...st(3)} /><path d="M -50 -6 L 40 -6 M -50 8 L 20 8" stroke="#9aa6b8" strokeWidth={4} /></g>;
    })}
  </g>
);

// ---------------------------------------------------------------- Californian: operator asleep
export const Bunk: React.FC<{ f: number; spec: Spec; t0?: number }> = ({ f, spec }) => {
  const snore = Math.sin(f * 0.12);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#26304f" />
      {/* porthole with stars */}
      <g transform="translate(1500 300)"><circle r={130} fill="#0b1230" {...st(10)} stroke="#c9a36a" />{Array.from({ length: 9 }, (_, i) => <circle key={i} cx={((i * 61) % 180) - 90} cy={((i * 43) % 180) - 90} r={3} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f * 0.1 + i)} />)}</g>
      {/* radio set: switched off */}
      <g transform="translate(420 380)">
        <rect x={-200} y={-110} width={400} height={220} rx={16} fill="#3e3a44" {...st(6)} />
        <rect x={-150} y={-60} width={300} height={70} rx={10} fill="#1b1d26" {...st(4)} />
        <text y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#5c6274">OFF</text>
        <circle cx={130} cy={60} r={22} fill="#5c6274" {...st(4)} />
      </g>
      {/* bunk */}
      <rect x={300} y={700} width={1400} height={60} rx={14} fill="#7b4a2c" {...st(6)} />
      <ellipse cx={830} cy={668} rx={120} ry={42} fill="#f3efe2" stroke={INK} strokeWidth={5} />
      <g transform="translate(1250 660) rotate(-90)"><Chibi spec={spec} pose={{ eyes: "happy", mouth: f % 80 < 40 ? "o" : "flat", breathe: snore }} x={0} y={0} size={420} /></g>
      <path d={`M 1010 ${650 - snore * 6} Q 1300 ${600 - snore * 10} 1660 ${650 - snore * 4} L 1660 720 L 1000 720 Z`} fill="#c0473f" {...st(6)} />
      <path d={`M 1080 ${650 - snore * 6} Q 1300 ${615 - snore * 10} 1560 ${655}`} fill="none" stroke="#e0716b" strokeWidth={8} />
      <rect x={300} y={760} width={1400} height={330} fill="#5a3a24" {...st(6)} />
      {[0, 1, 2].map((i) => { const a = (f * 0.9 + i * 30) % 90; return <text key={i} x={840 + a * 2.2} y={500 - a * 2} fontFamily={FONT} fontWeight={900} fontSize={60 + a * 0.5} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={1 - a / 90}>Z</text>; })}
    </g>
  );
};

// ---------------------------------------------------------------- bridge
export const Bridge: React.FC<{ f: number; murdoch: Pose; mSpec: Spec; helm: Spec; wheel: number; berg: number; shake?: number }> = ({ f, murdoch, mSpec, helm, wheel, berg, shake = 0 }) => (
  <g transform={`translate(${Math.sin(f * 2.1) * shake * 8} ${Math.cos(f * 1.7) * shake * 5})`}>
    <rect x={0} y={0} width={1920} height={1080} fill="#3a2a22" />
    {/* windows to the night sea */}
    <g>
      <rect x={120} y={120} width={1680} height={460} fill="#070b1c" />
      <rect x={120} y={430} width={1680} height={150} fill="#0b1430" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={140 + ((i * 211) % 1640)} cy={140 + ((i * 97) % 270)} r={2 + (i % 3)} fill="#fff" opacity={0.6} />)}
      <g transform={`translate(${960 + berg * 120} 470) scale(${0.15 + berg * 1.0})`} opacity={clamp(berg * 3)}><Iceberg /></g>
      {[120, 540, 960, 1380, 1800].map((x) => <rect key={x} x={x - 22} y={100} width={44} height={500} fill="#8a5a36" {...st(5)} />)}
      <rect x={100} y={100} width={1720} height={40} fill="#8a5a36" {...st(5)} />
      <rect x={100} y={570} width={1720} height={40} fill="#8a5a36" {...st(5)} />
    </g>
    <rect x={0} y={610} width={1920} height={470} fill="#6b4a32" />
    {/* engine telegraph */}
    <g transform="translate(1520 760)"><rect x={-24} y={0} width={48} height={260} fill="#c9a36a" {...st(5)} /><circle cx={0} cy={-40} r={90} fill="#e3b14a" {...st(6)} /><circle cx={0} cy={-40} r={66} fill="#fff7e6" {...st(4)} /><path d={`M 0 -40 L ${Math.sin(wheel * 0.02) * 50} ${-40 - Math.cos(wheel * 0.02) * 50}`} {...st(7)} /></g>
    <Chibi spec={mSpec} pose={murdoch} x={1240} y={1120} size={640} facing={-1} />
    {/* helmsman + wheel */}
    <Chibi spec={helm} pose={{ armL: 40, armR: 40, look: 0.2, eyes: "wide" }} x={560} y={960} size={540} />
    <g transform={`translate(560 985) rotate(${wheel})`}>
      <circle r={170} fill="none" stroke={INK} strokeWidth={30} /><circle r={170} fill="none" stroke="#9b6a3f" strokeWidth={20} />
      {Array.from({ length: 8 }, (_, i) => <g key={i} transform={`rotate(${i * 45})`}><rect x={-9} y={-230} width={18} height={230} fill="#9b6a3f" {...st(4)} /><circle cy={-236} r={16} fill="#b98656" {...st(4)} /></g>)}
      <circle r={40} fill="#e3b14a" {...st(6)} />
    </g>
  </g>
);

// ---------------------------------------------------------------- map
export const MapCard: React.FC<{ f: number; route: number; show: "route" | "ships" }> = ({ f, route, show }) => {
  const pts: [number, number][] = [[1500, 455], [1505, 520], [1330, 445], [1100, 500], [820, 570], [560, 610]];
  const totalLen = pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  const X: [number, number] = [560, 610];
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#cfe3ee" />
      <rect x={60} y={60} width={1800} height={960} rx={30} fill="#f3e6c8" {...st(7)} />
      <rect x={90} y={90} width={1740} height={900} rx={20} fill="#bcd9e6" {...st(4)} />
      {/* land (simplified) */}
      <path d="M 1430 200 L 1480 210 L 1500 260 L 1540 300 L 1560 380 L 1590 430 L 1560 455 L 1470 460 L 1420 440 L 1440 400 L 1410 350 L 1440 300 L 1415 250 Z" fill="#b9cf8e" {...st(4)} />
      <path d="M 1300 300 L 1360 290 L 1390 330 L 1380 400 L 1330 440 L 1280 420 L 1270 360 Z" fill="#b9cf8e" {...st(4)} />
      <path d="M 1470 520 L 1540 505 L 1600 490 L 1700 520 L 1720 640 L 1660 760 L 1540 740 L 1500 640 L 1440 600 Z" fill="#c9d79a" {...st(4)} />
      <path d="M 90 300 L 330 330 L 420 480 L 380 600 L 300 700 L 90 760 Z" fill="#b9cf8e" {...st(4)} />
      {[["BRITAIN", 1495, 340], ["FRANCE", 1610, 650], ["IRELAND", 1328, 365], ["NEWFOUNDLAND", 230, 520]].map(([t, x, y]) => <text key={String(t)} x={x as number} y={y as number} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={22} fill="#5b6b3a">{t}</text>)}
      <text x={960} y={820} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#7d9db0" letterSpacing={10}>NORTH ATLANTIC</text>
      {/* route */}
      <path d={`M ${pts.map((p) => p.join(" ")).join(" L ")}`} fill="none" stroke="#c0473f" strokeWidth={8} strokeDasharray={`${totalLen * route} 4000`} strokeLinecap="round" />
      {[["Southampton", 1500, 455], ["Cherbourg", 1505, 520], ["Queenstown", 1330, 445]].map(([t, x, y], i) => route > i * 0.12 ? <g key={String(t)}><circle cx={x as number} cy={y as number} r={10} fill="#fff" {...st(4)} /><text x={(x as number) + (i === 2 ? -20 : 22)} y={(y as number) + (i === 2 ? 40 : i === 1 ? 34 : -14)} textAnchor={i === 2 ? "end" : "start"} fontFamily={FONT2} fontWeight={700} fontSize={26} fill={INK}>{t}</text></g> : null)}
      {route > 0.98 && <g transform={`translate(${X[0]} ${X[1]}) scale(${1 + Math.sin(f * 0.3) * 0.1})`}><path d="M -26 -26 L 26 26 M 26 -26 L -26 26" stroke="#c0473f" strokeWidth={14} strokeLinecap="round" /></g>}
      {show === "ships" && (
        <g opacity={prog(f, 0, 10)}>
          <g transform="translate(540 520)"><circle r={14} fill="#1d1b22" {...st(4)} /><text x={0} y={-30} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={28} fill={INK}>Californian</text><text x={0} y={-62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#3a4466">Zzz</text></g>
          <g transform="translate(860 700)"><circle r={14} fill="#d8592d" {...st(4)} /><text x={0} y={50} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={28} fill={INK}>Carpathia</text></g>
          <path d={`M 860 700 L ${lerp(860, 580, prog(f, 10, 60))} ${lerp(700, 615, prog(f, 10, 60))}`} stroke="#d8592d" strokeWidth={6} strokeDasharray="14 12" />
          <g opacity={prog(f, 30, 40)}><rect x={650} y={680} width={170} height={56} rx={28} fill="#fff7e6" {...st(4)} /><text x={735} y={719} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK}>58 miles</text></g>
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- the 1894 law board
export const LawBoard: React.FC<{ f: number; step: number }> = ({ f, step }) => {
  // step 0: table to 10,000 t; 1: Titanic bar 46,328 t; 2: seats vs people; 3: first boat 28/65
  const bar = (y: number, w: number, label: string, c: string, a: number) => (
    <g opacity={a}><rect x={300} y={y} width={w * a} height={70} rx={14} fill={c} {...st(5)} /><text x={300 + w * a + 20} y={y + 50} fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>{label}</text></g>
  );
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2f5a4a" />
      <rect x={80} y={70} width={1760} height={940} rx={24} fill="#355f50" stroke="#7b4a2c" strokeWidth={26} />
      {step < 2 ? (
        <g>
          <text x={960} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#f3efe2">LIFEBOAT RULES (1894)</text>
          <text x={960} y={250} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={32} fill="#cfe0d6">boats set by ship size: the table stops at 10,000 tons</text>
          {bar(360, 230, "10,000 tons", "#e9dcc0", prog(f, 4, 16))}
          {step >= 1 && bar(520, 1060, "Titanic: 46,328 tons", "#d89b45", prog(f, 0, 30))}
          {step >= 1 && <text x={545} y={460} fontFamily={FONT} fontWeight={900} fontSize={30} fill="#ffd84a" opacity={prog(f, 26, 32)}>← the rules end here</text>}
        </g>
      ) : (
        <g>
          <text x={960} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#f3efe2">{step === 2 ? "SEATS vs PEOPLE" : "THE FIRST LIFEBOAT"}</text>
          {step === 2 ? (
            <g>
              {Array.from({ length: 44 }, (_, i) => { const on = i < Math.round(44 * 1178 / 2208); const a = prog(f, i * 0.6, i * 0.6 + 6); return <g key={i} transform={`translate(${330 + (i % 11) * 116} ${310 + Math.floor(i / 11) * 120}) scale(${a})`}><circle cy={-26} r={22} fill={on ? "#f3d2b0" : "#9aa6b8"} {...st(4)} /><path d="M -30 34 Q -30 0 0 0 Q 30 0 30 34 Z" fill={on ? "#ffd84a" : "#6b7891"} {...st(4)} /></g>; })}
              <g opacity={prog(f, 34, 42)}><rect x={360} y={790} width={540} height={80} rx={40} fill="#ffd84a" {...st(5)} /><text x={630} y={845} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>seats: about 1,178</text></g>
              <g opacity={prog(f, 50, 58)}><rect x={1000} y={790} width={560} height={80} rx={40} fill="#9aa6b8" {...st(5)} /><text x={1280} y={845} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>people: about 2,200</text></g>
            </g>
          ) : (
            <g>
              <g transform="translate(960 520)">
                <path d="M -600 -40 Q 0 30 600 -40 Q 560 140 300 180 Q 0 210 -300 180 Q -560 140 -600 -40 Z" fill="#f5f0e6" {...st(7)} />
                <path d="M -600 -40 Q 0 30 600 -40" fill="none" stroke="#8a5a36" strokeWidth={18} />
                {Array.from({ length: 65 }, (_, i) => { const filled = i < 28 && f > 10 + i * 1.2; return <circle key={i} cx={-520 + (i % 22) * 49} cy={-60 - Math.floor(i / 22) * 56} r={20} fill={filled ? "#f3d2b0" : "rgba(255,255,255,0.18)"} stroke={filled ? INK : "#cfe0d6"} strokeWidth={filled ? 4 : 3} strokeDasharray={filled ? "" : "6 6"} />; })}
              </g>
              <text x={960} y={850} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill="#ffd84a" stroke={INK} strokeWidth={10} paintOrder="stroke">{Math.min(28, Math.max(0, Math.floor((f - 10) / 1.2) + 1))} / 65</text>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- collision / sinking exteriors
export const NightSea: React.FC<{ f: number; shipX: number; tilt?: number; sink?: number; lights?: number; berg?: number; bergX?: number; scale?: number; rockets?: boolean }> = ({ f, shipX, tilt = 0, sink = 0, lights = 1, berg = 0, bergX = 1600, scale = 0.7, rockets = false }) => (
  <g>
    <SeaSky f={f} mode="night" horizon={700} />
    {rockets && [0, 1].map((k) => { const a = (f + k * 45) % 90; return a < 40 ? <g key={k} opacity={1 - a / 40}><circle cx={shipX - 120 + k * 60} cy={260 - a * 2} r={6} fill="#fff" />{Array.from({ length: 10 }, (_, i) => <line key={i} x1={shipX - 120 + k * 60} y1={260 - a * 2} x2={shipX - 120 + k * 60 + Math.cos(i * 0.63) * a * 2.5} y2={260 - a * 2 + Math.sin(i * 0.63) * a * 2.5} stroke="#fff" strokeWidth={3} />)}</g> : null; })}
    {berg > 0 && <g transform={`translate(${bergX} 830) scale(${0.55 * berg})`}><Iceberg /></g>}
    <g transform={`translate(${shipX} ${860 + sink * 300}) rotate(${tilt}) scale(${scale})`}><Titanic f={f} night smoke={sink === 0} lights={lights} /></g>
    <g transform="translate(960 860)"><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g>
  </g>
);

// ---------------------------------------------------------------- boat deck at night (band + lifeboat lowering)
export const BandNight: React.FC<{ f: number; hartley: Spec; extra: Spec[] }> = ({ f, hartley, extra }) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#0b1230" />
    {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 331) % 1920} cy={(i * 97) % 420} r={1.5 + (i % 3)} fill="#fff" opacity={0.5} />)}
    {/* lifeboat being lowered in the back */}
    <g transform={`translate(1450 ${330 + prog(f, 0, 160) * 260})`} opacity={0.9}>
      <path d="M -200 0 Q 0 30 200 0 Q 180 70 100 84 Q 0 92 -100 84 Q -180 70 -200 0 Z" fill="#cfd2df" {...st(4)} />
      <path d="M -180 0 L -180 -400 M 180 0 L 180 -400" stroke="#9aa1b3" strokeWidth={3} />
    </g>
    <rect x={0} y={640} width={1920} height={440} fill="#3b3346" />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={660 + i * i * 4} x2={1920} y2={660 + i * i * 4} stroke="#2b2535" strokeWidth={2} />)}
    {/* deck lamp glow */}
    <ellipse cx={960} cy={760} rx={700} ry={260} fill="#ffd66b" opacity={0.08} />
    {extra.map((s, i) => <Chibi key={s.id} spec={s} pose={{ armL: 50 + Math.sin(f * 0.18 + i) * 14, armR: 103, bow: Math.sin(f * 0.18 + i), head: -6, eyes: "happy", sway: Math.sin(f * 0.09 + i) * 2 }} x={i === 0 ? 560 : 1360} y={940} size={430} facing={i === 0 ? 1 : -1} />)}
    <Chibi spec={hartley} pose={{ armL: 50 + Math.sin(f * 0.18) * 16, armR: 103, bow: Math.sin(f * 0.18), head: -8, eyes: "happy", sway: Math.sin(f * 0.09) * 2, breathe: Math.sin(f / 16) }} x={960} y={980} size={520} facing={-1} />
  </g>
);

// ---------------------------------------------------------------- dawn rescue
export const Dawn: React.FC<{ f: number; brown: Spec; rowers: Spec[]; carpX: number }> = ({ f, brown, rowers, carpX }) => {
  const row = Math.sin(f * 0.15);
  return (
    <g>
      <SeaSky f={f} mode="dawn" horizon={600} />
      {/* ice floes */}
      {[[300, 640, 0.25], [1650, 625, 0.18], [1200, 660, 0.12]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y})`}><Iceberg s={s as number} /></g>)}
      <g transform={`translate(${carpX} 640) scale(0.55)`}><Steamer f={f} kind="carpathia" /></g>
      <g transform="translate(960 640)"><WaterFront f={f} width={4000} color="#5a6f9e" /></g>
      {/* lifeboat with survivors (Margaret Brown rowing) */}
      <g transform={`translate(860 ${930 + Math.sin(f * 0.07) * 6}) rotate(${Math.sin(f * 0.05) * 1.5})`}>
        {rowers.map((s, i) => <Chibi key={s.id} spec={s} pose={{ armL: 40 + row * 20, armR: 40 + row * 20, eyes: "normal", mouth: "flat", head: -6 }} x={-360 + i * 260} y={20} size={330} />)}
        <Chibi spec={brown} pose={{ armL: 30 + row * 25, armR: 30 + row * 25, eyes: "squint", brow: -0.5, mouth: "flat", look: 0.3 }} x={430} y={30} size={360} facing={-1} />
        <path d={`M 360 -40 L ${470 + row * 40} 70`} {...st(8)} stroke="#8a5a36" />
        <path d="M -620 -60 Q 0 -20 620 -60 Q 600 60 420 90 Q 0 110 -420 90 Q -600 60 -620 -60 Z" fill="#f5f0e6" {...st(6)} />
        <path d="M -620 -60 Q 0 -20 620 -60" fill="none" stroke="#8a5a36" strokeWidth={14} />
      </g>
      <g transform="translate(960 1000)"><WaterFront f={f + 30} width={4000} color="#3d5285" line="#c9d6f0" /></g>
    </g>
  );
};

// ---------------------------------------------------------------- the rules today
export const RulesCard: React.FC<{ f: number }> = ({ f }) => {
  const items = [["Lifeboats for all", "lifeboat"], ["Radio on 24/7", "radio"], ["Ice patrol on watch", "ice"]];
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#f3e6c8" />
      <rect x={60} y={60} width={1800} height={960} rx={36} fill="#fffaf0" {...st(7)} />
      <text x={960} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={INK}>WHAT CHANGED AFTER 1912</text>
      {items.map(([t, k], i) => {
        const a = prog(f, 10 + i * 45, 22 + i * 45);
        return (
          <g key={k} transform={`translate(${380 + i * 580} 560) scale(${a})`}>
            <circle r={170} fill={["#cfe8d6", "#d9e4f5", "#e4f3fa"][i]} {...st(7)} />
            {k === "lifeboat" && <path d="M -110 -10 Q 0 20 110 -10 Q 100 60 50 70 Q 0 76 -50 70 Q -100 60 -110 -10 Z" fill="#f5f0e6" {...st(6)} />}
            {k === "radio" && <g transform="scale(0.8)"><Icon kind="radio" f={f} /></g>}
            {k === "ice" && <g transform="translate(0 70)"><Iceberg s={0.4} /></g>}
            <text x={0} y={250} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>{t}</text>
            <path d="M 110 -150 l 30 30 l 60 -70" fill="none" stroke="#2f9e5a" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" opacity={prog(f, 20 + i * 45, 26 + i * 45)} />
          </g>
        );
      })}
    </g>
  );
};
