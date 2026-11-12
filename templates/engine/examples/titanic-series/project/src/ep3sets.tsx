// Episode 3 "The iceberg": new sets and object inserts (bell, phone, tiller, stopwatch, top-down turn, watertight doors,
// mail room, ice-cube tray, hull damage, compartments, CQD position map, lifeboat lowering, FILM vs REAL card).
import React from "react";
import { INK, PAL, prog, lerp, clamp } from "./style";
import { FONT, FONT2 } from "./vshort";
import { Iceberg, Titanic } from "./ship";

const st = (w = 6) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });

export const FilmReel: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <circle r={90} fill="#3a3d4a" stroke={INK} strokeWidth={7} />
    {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return <circle key={i} cx={Math.cos(a) * 50} cy={Math.sin(a) * 50} r={20} fill="#cfd2df" stroke={INK} strokeWidth={4} />; })}
    <circle r={14} fill="#cfd2df" stroke={INK} strokeWidth={4} />
    <path d="M 60 70 Q 140 110 220 80 L 230 110 Q 140 140 60 100 Z" fill="#2b2d38" stroke={INK} strokeWidth={5} />
  </g>
);

/** FILM vs REAL card: left = film (reel + text only), right = what really happened (children = chibi scene or insert) */
export const FilmVsReal: React.FC<{ f: number; a: number; real: number; film: string[]; realText: string[]; children?: React.ReactNode }> = ({ f, a, real, film, realText, children }) => {
  const p = prog(f, a, a + 10), r = prog(f, real, real + 10);
  return (
    <g>
      <rect width={1920} height={1080} fill="#efe3c6" />
      <rect x={960} width={960} height={1080} fill="#d6e6ef" />
      <g opacity={lerp(1, 0.55, r)}>
        <g transform={`translate(440 250) rotate(${f * 1.4}) scale(${p * 0.95})`}><FilmReel /></g>
        <text x={480} y={520} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK} opacity={p}>IN THE 1997 FILM</text>
        {film.map((t, i) => <text key={i} x={480} y={600 + i * 60} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={44} fill="#7b2f2a" opacity={prog(f, a + 8 + i * 4, a + 16 + i * 4)}>{t}</text>)}
        <g transform="translate(480 790)" opacity={p}><rect x={-230} y={-34} width={460} height={60} rx={30} fill="#fff7e6" {...st(4)} /><text y={8} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={28} fill={INK}>a scene in the movie</text></g>
      </g>
      <g opacity={r}>
        <text x={1440} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK}>WHAT REALLY HAPPENED</text>
        <g>{children}</g>
        {realText.map((t, i) => <text key={i} x={1440} y={790 + i * 56} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={42} fill="#22304f" opacity={prog(f, real + 8 + i * 4, real + 16 + i * 4)}>{t}</text>)}
      </g>
      <rect x={954} width={12} height={1080} fill={INK} />
      <g transform={`translate(960 540) scale(${p})`}><circle r={74} fill="#ffd84a" {...st(7)} /><text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>VS</text></g>
    </g>
  );
};

/** close-up of the crow's-nest bell, struck n times */
export const BellInsert: React.FC<{ f: number; hits: number[] }> = ({ f, hits }) => {
  const last = hits.filter((h) => f >= h).pop() ?? -99, d = f - last;
  const swing = d >= 0 && d < 14 ? Math.sin(d * 0.9) * (14 - d) * 1.6 : 0;
  const n = hits.filter((h) => f >= h).length;
  return (
    <g>
      <rect width={1920} height={1080} fill="#070b1c" />
      {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={(i * 197) % 1920} cy={(i * 89) % 700} r={1.5 + (i % 3)} fill="#fff" opacity={0.5 + 0.3 * Math.sin(f * 0.1 + i)} />)}
      <rect x={-50} y={660} width={2020} height={60} fill="#3a2a22" {...st(6)} />
      <rect x={-50} y={700} width={2020} height={400} fill="#4a362b" />
      <g transform={`translate(960 260)`}>
        <rect x={-260} y={-30} width={520} height={44} rx={10} fill="#5a4030" {...st(6)} />
        <g transform={`rotate(${swing})`}>
          <rect x={-14} y={0} width={28} height={70} fill="#8a6a3a" {...st(5)} />
          <path d="M -150 330 Q -150 120 0 70 Q 150 120 150 330 Z" fill="#e3b14a" {...st(9)} />
          <path d="M -150 330 Q -150 120 0 70 Q -60 150 -90 330 Z" fill="#fff4c8" opacity={0.35} />
          <rect x={-175} y={320} width={350} height={34} rx={14} fill="#c99437" {...st(7)} />
          <circle cx={Math.sin((swing * Math.PI) / 180) * -40} cy={380} r={30} fill="#7a5a2a" {...st(6)} />
        </g>
        {d >= 0 && d < 12 && [0, 1, 2].map((k) => <path key={k} d={`M ${-240 - k * 50} ${200 - k * 10} q -30 ${60} 0 ${120}`} fill="none" stroke="#ffd84a" strokeWidth={10} opacity={1 - d / 12} transform={`translate(${-d * 4} 0)`} />)}
        {d >= 0 && d < 12 && [0, 1, 2].map((k) => <path key={k} d={`M ${240 + k * 50} ${200 - k * 10} q 30 ${60} 0 ${120}`} fill="none" stroke="#ffd84a" strokeWidth={10} opacity={1 - d / 12} transform={`translate(${d * 4} 0)`} />)}
      </g>
      <g transform="translate(960 900)">{[0, 1, 2].map((i) => <circle key={i} cx={(i - 1) * 110} cy={0} r={34} fill={i < n ? "#ffd84a" : "#2b2d38"} {...st(6)} />)}</g>
    </g>
  );
};

/** old telephone handset, close */
export const PhoneInsert: React.FC<{ f: number; ring: number; label?: string }> = ({ f, ring, label }) => {
  const shake = f >= ring && f < ring + 20 ? Math.sin(f * 2.4) * 4 : 0;
  return (
    <g transform={`rotate(${shake})`}>
      <rect x={-170} y={-150} width={340} height={300} rx={30} fill="#2b2622" {...st(8)} />
      <circle cx={0} cy={20} r={92} fill="#4a3f36" {...st(6)} />
      {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2 - 1.2; return <circle key={i} cx={Math.cos(a) * 62} cy={20 + Math.sin(a) * 62} r={14} fill="#e9e3d2" {...st(3)} />; })}
      <path d="M -200 -170 Q -220 -250 -120 -250 L 120 -250 Q 220 -250 200 -170 L 150 -170 Q 160 -210 100 -210 L -100 -210 Q -160 -210 -150 -170 Z" fill="#1d1a17" {...st(7)} />
      {label && <g transform="translate(0 230)"><rect x={-220} y={-40} width={440} height={76} rx={38} fill="#ffd84a" {...st(6)} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={INK}>{label}</text></g>}
    </g>
  );
};

/** "You see": tiller orders. Push the tiller to starboard -> the rudder (and the bow) swing to port. Top-down view. */
export const TillerMech: React.FC<{ f: number; push: number; swing: number; labels: number }> = ({ f, push, swing, labels }) => (
  <g>
    <rect width={1920} height={1080} fill="#2e5b86" />
    {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M ${((i * 230 + f * 2) % 2100) - 100} ${(i * 131) % 1080} q 20 -10 40 0 q 20 10 40 0`} fill="none" stroke="#5b8cbf" strokeWidth={5} />)}
    <g transform={`translate(960 600) rotate(${-swing * 22})`}>
      {/* hull from above: bow up */}
      <path d="M 0 -420 Q 120 -300 130 -60 L 130 330 Q 120 400 0 410 Q -120 400 -130 330 L -130 -60 Q -120 -300 0 -420 Z" fill="#26232a" {...st(9)} />
      <path d="M 0 -380 Q 95 -280 104 -60 L 104 320 Q 96 370 0 378 Q -96 370 -104 320 L -104 -60 Q -95 -280 0 -380 Z" fill="#c99a66" />
      {[-200, -60, 80, 200].map((y) => <rect key={y} x={-34} y={y} width={68} height={60} rx={10} fill={PAL.funnelBuff} {...st(5)} />)}
      {/* rudder + tiller at the stern */}
      <g transform="translate(0 410)">
        <g transform={`rotate(${-push * 35})`}><rect x={-10} y={0} width={20} height={90} rx={6} fill="#8a5a36" {...st(5)} /></g>
        <g transform={`rotate(${push * 35})`}><rect x={-8} y={-150} width={16} height={150} rx={6} fill="#e3b14a" {...st(5)} /><circle cy={-150} r={18} fill="#c0473f" {...st(4)} /></g>
      </g>
    </g>
    {/* hand pushing tiller */}
    {labels > 0 && <g opacity={labels}>
      <g transform="translate(330 300)"><rect x={-260} y={-60} width={520} height={110} rx={24} fill="#fff7e6" {...st(6)} /><text y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>“HARD-A-STARBOARD”</text><text y={34} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={30} fill="#7b2f2a">= push the tiller to the RIGHT</text></g>
      <g transform="translate(1590 300)" opacity={prog(swing, 0.2, 0.6)}><rect x={-250} y={-60} width={500} height={110} rx={24} fill="#ffd84a" {...st(6)} /><text y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>BOW SWINGS LEFT</text><text y={34} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={30} fill={INK}>(to port)</text></g>
      <path d={`M 1150 ${700} q 140 -60 260 0`} fill="none" stroke="#ffd84a" strokeWidth={12} strokeDasharray="20 16" opacity={0} />
      <g transform="translate(960 1030)"><rect x={-380} y={-36} width={760} height={66} rx={33} fill="#22304f" {...st(5)} /><text y={12} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={30} fill="#fff">1912 British helm orders (changed in the 1930s)</text></g>
    </g>}
  </g>
);

/** stopwatch insert */
export const Stopwatch: React.FC<{ f: number; sec: number; cross?: number; label?: string }> = ({ f, sec, cross = 0, label }) => (
  <g>
    <rect x={-26} y={-250} width={52} height={50} rx={10} fill="#c99437" {...st(5)} />
    <circle r={210} fill="#e3b14a" {...st(9)} /><circle r={180} fill="#fbf4e4" {...st(5)} />
    {Array.from({ length: 60 }, (_, i) => <line key={i} x1={0} y1={-170} x2={0} y2={i % 5 ? -158 : -145} stroke={INK} strokeWidth={i % 5 ? 3 : 6} transform={`rotate(${i * 6})`} />)}
    <path d={`M 0 0 L 0 -170 A 170 170 0 ${sec > 30 ? 1 : 0} 1 ${Math.sin((sec / 60) * Math.PI * 2) * 170} ${-Math.cos((sec / 60) * Math.PI * 2) * 170} Z`} fill="#c0473f" opacity={0.25} />
    <line x1={0} y1={0} x2={0} y2={-165} stroke="#c0473f" strokeWidth={8} strokeLinecap="round" transform={`rotate(${sec * 6})`} />
    <circle r={14} fill={INK} />
    <text y={95} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK}>{Math.floor(sec)} s</text>
    {cross > 0 && <g opacity={cross}><line x1={-230} y1={-230} x2={230 * cross} y2={230 * cross} stroke="#c0473f" strokeWidth={22} strokeLinecap="round" opacity={0.75} /></g>}
    {label && <g transform="translate(0 300)"><rect x={-390} y={-44} width={780} height={80} rx={40} fill="#fff7e6" {...st(6)} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={INK}>{label}</text></g>}
  </g>
);

/** top-down: ship swinging to port, berg sliding down the starboard side */
export const TopTurn: React.FC<{ f: number; turn: number; slide: number; hit?: number }> = ({ f, turn, slide, hit = 0 }) => (
  <g>
    <rect width={1920} height={1080} fill="#0b1a33" />
    {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M ${(i * 211) % 1920} ${((i * 131) + f * 3) % 1080} q 20 -8 40 0`} fill="none" stroke="#213a63" strokeWidth={4} />)}
    <g transform={`translate(${960 + slide * 0} ${540 - slide * 40}) rotate(${-turn * 22})`}>
      <path d="M 0 -420 Q 110 -300 120 -60 L 120 330 Q 110 400 0 410 Q -110 400 -120 330 L -120 -60 Q -110 -300 0 -420 Z" fill="#26232a" {...st(8)} />
      <path d="M 0 -385 Q 88 -280 96 -60 L 96 320 Q 88 368 0 376 Q -88 368 -96 320 L -96 -60 Q -88 -280 0 -385 Z" fill="#c99a66" />
      {[-200, -60, 80, 200].map((y) => <rect key={y} x={-30} y={y} width={60} height={54} rx={10} fill={PAL.funnelBuff} {...st(5)} />)}
      {hit > 0 && <g opacity={hit}>{Array.from({ length: 7 }, (_, i) => <path key={i} d={`M 118 ${-330 + i * 40} l 14 10`} stroke="#ffd84a" strokeWidth={9} />)}</g>}
    </g>
    <g transform={`translate(${1210 - turn * 40} ${lerp(-120, 520, slide)}) scale(0.55)`}><path d="M -160 -60 L -40 -170 L 70 -120 L 180 -10 L 120 120 L -80 150 L -190 60 Z" fill="#dfeaf5" {...st(12)} /><path d="M -40 -170 L 10 -20 L 180 -10" fill="none" stroke="#a9c3db" strokeWidth={10} /></g>
    <g transform="translate(230 120)"><circle r={60} fill="#fbf4e4" {...st(5)} /><text y={-22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK}>N</text><path d="M 0 -8 L 14 30 L 0 20 L -14 30 Z" fill="#c0473f" /></g>
  </g>
);

/** watertight door cut-away: lever on the bridge, doors drop below */
export const DoorsCut: React.FC<{ f: number; pull: number; drop: number }> = ({ f, pull, drop }) => (
  <g>
    <rect width={1920} height={1080} fill="#1d1b22" />
    {Array.from({ length: 5 }, (_, i) => {
      const x = 260 + i * 330;
      return <g key={i}>
        <rect x={x - 150} y={180} width={300} height={720} fill="#2f2e36" {...st(5)} />
        <rect x={x - 60} y={560} width={120} height={340} fill="#3f7fbf" opacity={0.0} />
        <rect x={x - 70} y={lerp(380, 640, clamp(drop * 1.3 - i * 0.07))} width={140} height={260} fill="#7b7f8f" {...st(6)} />
        <rect x={x - 76} y={360} width={152} height={540} fill="none" stroke="#55535a" strokeWidth={10} />
        <path d={`M ${x} 300 L ${x} 340`} stroke="#ffd84a" strokeWidth={10} opacity={drop > 0.1 && drop < 0.95 ? 0.5 + 0.5 * Math.sin(f) : 0} />
        <text x={x} y={960} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={28} fill="#cfd2df">{["Boiler 6", "Boiler 5", "Boiler 4", "Boiler 3", "Engines"][i]}</text>
      </g>;
    })}
    <rect x={0} y={900} width={1920} height={180} fill="#121117" />
    <g transform="translate(1700 120)"><rect x={-170} y={-70} width={340} height={140} rx={20} fill="#c9a36a" {...st(6)} /><g transform={`rotate(${lerp(-40, 40, pull)})`}><rect x={-12} y={-120} width={24} height={120} rx={8} fill="#55535a" {...st(5)} /><circle cy={-120} r={22} fill="#c0473f" {...st(5)} /></g><text y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={INK}>BRIDGE LEVER</text></g>
    <g transform="translate(700 100)" opacity={prog(drop, 0.5, 0.9)}><rect x={-330} y={-46} width={660} height={84} rx={42} fill="#7fd08a" {...st(6)} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>WATERTIGHT DOORS CLOSED</text></g>
  </g>
);

/** mail room (Post Office deep in the bow): sacks, sorting racks, water rising */
export const MailRoom: React.FC<{ f: number; water: number; children?: React.ReactNode }> = ({ f, water, children }) => {
  const wy = lerp(1100, 760, water);
  return (
    <g>
      <rect width={1920} height={1080} fill="#5a4636" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 230 - 40} y={0} width={14} height={1080} fill="#3e3026" />)}
      {[0, 1].map((r) => <g key={r} transform={`translate(${200 + r * 1080} 120)`}>
        <rect width={560} height={420} fill="#7b5b40" {...st(5)} />
        {Array.from({ length: 24 }, (_, i) => <rect key={i} x={14 + (i % 6) * 90} y={14 + Math.floor(i / 6) * 100} width={80} height={90} fill="#4a3628" {...st(3)} />)}
        {Array.from({ length: 24 }, (_, i) => i % 3 ? <rect key={`l${i}`} x={24 + (i % 6) * 90} y={44 + Math.floor(i / 6) * 100} width={60} height={50} fill="#f3ead6" {...st(2)} /> : null)}
      </g>)}
      <g transform="translate(960 300)"><circle r={60} fill="#fbf4e4" {...st(5)} /><text y={-14} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={20} fill={INK}>SEA POST</text><text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#c0473f">RMS</text></g>
      {Array.from({ length: 8 }, (_, i) => <g key={i} transform={`translate(${140 + i * 230} ${860 - (wy < 900 ? Math.sin(f * 0.1 + i) * 8 * water : 0)}) rotate(${(i % 3) * 6 - 6})`}><path d="M -70 60 Q -90 -40 -40 -90 L 40 -90 Q 90 -40 70 60 Z" fill="#c9b48a" {...st(5)} /><path d="M -40 -90 Q 0 -120 40 -90" fill="none" {...st(5)} /><text y={10} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={22} fill="#7b2f2a">US MAIL</text></g>)}
      {children}
      <rect x={0} y={wy} width={1920} height={1100 - wy} fill="#2e5b86" opacity={0.78} />
      <path d={`M 0 ${wy} ${Array.from({ length: 25 }, (_, i) => `Q ${i * 80 + 40} ${wy - 10 * Math.sin(f * 0.2 + i)} ${i * 80 + 80} ${wy}`).join(" ")}`} fill="none" stroke="#a9d1f0" strokeWidth={5} />
    </g>
  );
};

/** ship's iron stairway (E deck): for Boxhall + carpenter */
export const Stairs: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g>
    <rect width={1920} height={1080} fill="#d8cdb8" />
    <rect x={0} y={0} width={1920} height={90} fill="#bfb29a" />
    {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={30 + i * 66} cy={70} r={6} fill="#9a8e78" />)}
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={1200 + i * 70} y={1000 - i * 90} width={300} height={24} fill="#7b7f8f" {...st(4)} />)}
    <path d="M 1160 1040 L 1800 230" stroke="#55535a" strokeWidth={14} />
    <rect x={120} y={200} width={160} height={260} rx={14} fill="#f3ede2" {...st(5)} />
    <circle cx={200} cy={330} r={58} fill="#355275" {...st(5)} />
    <rect x={0} y={1000} width={1920} height={80} fill="#a9967a" />
    <g opacity={0.85}><circle cx={200} cy={140} r={30} fill="#fff4c8" /><circle cx={200} cy={140} r={140} fill="#fff4c8" opacity={0.15} /></g>
    <text x={600} y={260} fontFamily={FONT2} fontWeight={700} fontSize={34} fill="#6b5a3c" opacity={0.8}>E DECK · FORWARD</text>
    {children}
  </g>
);

/** "You see" #2: the ice-cube tray. tilt 0..1, fill 0..1 progression along the cells */
export const IceTray: React.FC<{ f: number; tilt: number; fill: number }> = ({ f, tilt, fill }) => {
  const n = 8;
  return (
    <g transform={`rotate(${-tilt * 9})`}>
      <rect x={-760} y={-130} width={1520} height={250} rx={30} fill="#d6eaf5" {...st(9)} />
      {Array.from({ length: n }, (_, i) => {
        const x = 760 - (i + 1) * 190, lv = clamp(fill * n - i);
        return <g key={i}>
          <rect x={x + 10} y={-110} width={170} height={210} rx={14} fill="#f3fafe" {...st(4)} />
          {lv > 0 && <rect x={x + 12} y={100 - 210 * lv} width={166} height={210 * lv} rx={10} fill="#3f7fbf" opacity={0.85} />}
          {lv > 0.9 && i < n - 1 && clamp(fill * n - i - 1) < 1 && <path d={`M ${x + 12} -110 q -20 ${-20} -40 10`} fill="none" stroke="#3f7fbf" strokeWidth={14} strokeLinecap="round" opacity={0.9} />}
        </g>;
      })}
      <text x={600} y={-170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#ffd84a" transform={`rotate(${tilt * 9} 600 -170)`}>BOW</text>
    </g>
  );
};

/** hull side with narrow openings + a small door for scale */
export const HullDamage: React.FC<{ f: number; cracks: number; door: number; gash: number }> = ({ f, cracks, door, gash }) => (
  <g>
    <rect width={1920} height={1080} fill="#0b1a33" />
    <rect x={0} y={640} width={1920} height={440} fill="#14284d" />
    <path d="M -100 300 L 1650 300 Q 1840 310 1880 420 L 1760 760 L -100 760 Z" fill="#1d1b22" {...st(9)} />
    <rect x={-100} y={300} width={1820} height={50} fill="#f3ede2" opacity={0.9} />
    {Array.from({ length: 26 }, (_, i) => <line key={i} x1={i * 70} y1={350} x2={i * 70} y2={760} stroke="#2b2a33" strokeWidth={3} />)}
    {Array.from({ length: 4 }, (_, i) => <line key={i} x1={-100} y1={420 + i * 90} x2={1800} y2={420 + i * 90} stroke="#2b2a33" strokeWidth={3} />)}
    {gash > 0 && <g opacity={gash}><path d="M 600 610 L 1700 600" stroke="#ff8a6b" strokeWidth={60} strokeLinecap="round" opacity={0.75} /><line x1={560} y1={560} x2={1760} y2={680} stroke="#c0473f" strokeWidth={20} /><line x1={560} y1={680} x2={1760} y2={560} stroke="#c0473f" strokeWidth={20} /><text x={1150} y={540} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill="#ff8a6b">NOT a giant gash</text></g>}
    {Array.from({ length: 9 }, (_, i) => {
      const x = 1700 - i * 130, on = clamp(cracks * 9 - i);
      return on > 0 ? <g key={i}><path d={`M ${x} ${590 + (i % 3) * 18} l ${-90 * on} ${(i % 2 ? 6 : -6) * on}`} stroke="#9fd2ff" strokeWidth={8} strokeLinecap="round" /><circle cx={x - 40} cy={600 + (i % 3) * 18} r={5 + 4 * Math.sin(f * 0.6 + i)} fill="#9fd2ff" opacity={on * 0.7} /></g> : null;
    })}
    {door > 0 && <g transform={`translate(330 ${lerp(1200, 560, door)})`}><rect x={-80} y={-170} width={160} height={300} rx={8} fill="#a26a34" {...st(7)} /><circle cx={50} cy={-10} r={10} fill="#e3b14a" {...st(3)} /><text y={190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#ffd84a">≈ 12 sq ft</text></g>}
    <text x={1760} y={260} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#ffd84a">BOW →</text>
  </g>
);

/** side cut-away: front compartments, which flood */
export const Compartments: React.FC<{ f: number; open: number; fill: number; safe: number; tilt?: number }> = ({ f, open, fill, safe, tilt = 0 }) => {
  const names = ["Fore-\npeak", "Hold 1", "Hold 2", "Hold 3", "Boiler 6", "Boiler 5", "Boiler 4", "Boiler 3", "Boiler 2", "Boiler 1"];
  return (
    <g transform={`rotate(${tilt * 4} 960 540)`}>
      <rect width={1920} height={1080} fill="#0b1430" />
      <path d="M 80 360 L 1700 360 Q 1860 380 1880 520 L 1760 760 L 80 760 Z" fill="#1d1b22" {...st(9)} />
      {names.map((n, i) => {
        const x1 = 1780 - i * 165, x0 = x1 - 165, isOpen = i < open, lv = isOpen ? clamp(fill * (i === 5 ? 0.25 : 1)) : 0;
        return <g key={i}>
          <rect x={x0 + 6} y={380} width={159} height={370} fill={i < safe ? "#2c4a3a" : "#2b2a33"} />
          {lv > 0 && <rect x={x0 + 6} y={750 - 370 * lv} width={159} height={370 * lv} fill="#3f7fbf" opacity={0.9} />}
          <line x1={x0} y1={470} x2={x0} y2={760} stroke="#cfd2df" strokeWidth={8} />
          <text x={x0 + 85} y={810} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={24} fill="#cfd2df">{n.replace("\n", "")}</text>
          {isOpen && <text x={x0 + 85} y={350} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#ff8a6b">{i + 1}</text>}
        </g>;
      })}
      <text x={1820} y={300} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#ffd84a">BOW →</text>
      <text x={240} y={430} fontFamily={FONT2} fontWeight={700} fontSize={26} fill="#cfd2df">walls (bulkheads) stop below the top deck</text>
    </g>
  );
};

/** map close-up: CQD position vs wreck site */
export const PositionMap: React.FC<{ f: number; cqd: number; wreck: number; carp?: number }> = ({ f, cqd, wreck, carp = 0 }) => (
  <g>
    <rect width={1920} height={1080} fill="#9fc3d9" />
    {Array.from({ length: 14 }, (_, i) => <line key={i} x1={0} x2={1920} y1={i * 80} y2={i * 80} stroke="#b7d4e6" strokeWidth={2} />)}
    {Array.from({ length: 24 }, (_, i) => <line key={i} y1={0} y2={1080} x1={i * 80} x2={i * 80} stroke="#b7d4e6" strokeWidth={2} />)}
    {[["50°20'W", 280], ["50°10'W", 760], ["50°00'W", 1240], ["49°50'W", 1720]].map(([t, x]) => <text key={String(t)} x={x as number} y={50} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={26} fill="#5b7a8f">{t}</text>)}
    {Array.from({ length: 10 }, (_, i) => <path key={i} transform={`translate(${200 + (i * 173) % 1500} ${120 + (i * 97) % 250}) scale(0.6)`} d="M -30 16 L -12 -30 L 6 -8 L 18 -34 L 34 16 Z" fill="#eef6fb" {...st(4)} />)}
    {cqd > 0 && <g transform={`translate(${600} 560) scale(${cqd})`}><line x1={-40} y1={-40} x2={40} y2={40} stroke="#c0473f" strokeWidth={14} /><line x1={-40} y1={40} x2={40} y2={-40} stroke="#c0473f" strokeWidth={14} /><g transform="translate(0 -110)"><rect x={-230} y={-50} width={460} height={96} rx={20} fill="#fff7e6" {...st(5)} /><text y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={INK}>CQD POSITION</text><text y={32} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={28} fill="#7b2f2a">41°46'N 50°14'W</text></g></g>}
    {wreck > 0 && <g opacity={wreck}>
      <path d={`M 640 600 L ${lerp(640, 1430, wreck)} 600`} stroke="#22304f" strokeWidth={8} strokeDasharray="22 14" />
      <g transform="translate(1440 640)"><circle r={30} fill="#22304f" {...st(5)} /><g transform="translate(0 110)"><rect x={-240} y={-50} width={480} height={96} rx={20} fill="#ffd84a" {...st(5)} /><text y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={INK}>WRECK (found 1985)</text><text y={32} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={28} fill={INK}>41°44'N 49°57'W</text></g></g>
      <g transform="translate(1030 560)"><rect x={-180} y={-40} width={360} height={74} rx={37} fill="#fff" {...st(5)} /><text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={INK}>≈ 13 nautical miles</text></g>
    </g>}
    {carp > 0 && <g opacity={carp}>
      <path d={`M 1700 880 Q 1250 820 ${lerp(1700, 700, carp)} ${lerp(880, 640, carp)}`} fill="none" stroke="#c0473f" strokeWidth={8} strokeDasharray="20 12" />
      <g transform={`translate(${lerp(1700, 700, carp)} ${lerp(880, 640, carp)}) rotate(-15) scale(1.4)`}><path d="M -40 -10 L 30 -10 L 44 0 L 30 10 L -40 10 Z" fill="#c0473f" {...st(4)} /></g>
      <g transform="translate(1350 760)"><rect x={-250} y={-44} width={500} height={80} rx={40} fill="#c0473f" stroke={INK} strokeWidth={5} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff">CARPATHIA · 58 miles</text></g>
    </g>}
  </g>
);

/** lifeboat being lowered down the dark side of the ship */
export const BoatLower: React.FC<{ f: number; down: number; people: number }> = ({ f, down, people }) => {
  const by = lerp(260, 820, down);
  return (
    <g>
      <rect width={1920} height={1080} fill="#070b1c" />
      {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={(i * 197) % 1920} cy={(i * 83) % 500} r={1.5 + (i % 3)} fill="#fff" opacity={0.6} />)}
      <rect x={0} y={880} width={1920} height={200} fill="#060a18" />
      <path d={`M 0 880 ${Array.from({ length: 25 }, (_, i) => `Q ${i * 80 + 40} ${880 - 6 * Math.sin(f * 0.1 + i)} ${i * 80 + 80} 880`).join(" ")}`} fill="none" stroke="#3d4f86" strokeWidth={4} />
      {/* ship side with lit portholes */}
      <rect x={0} y={0} width={760} height={900} fill="#1d1b22" {...st(6)} />
      <rect x={0} y={60} width={760} height={30} fill="#f3ede2" />
      {Array.from({ length: 30 }, (_, i) => <g key={i}><circle cx={60 + (i % 6) * 120} cy={200 + Math.floor(i / 6) * 140} r={20} fill="#ffd27a" {...st(4)} /><circle cx={60 + (i % 6) * 120} cy={200 + Math.floor(i / 6) * 140} r={50} fill="#ffd27a" opacity={0.12} /></g>)}
      {/* davit + falls */}
      <path d="M 700 40 Q 900 0 1000 120" fill="none" stroke="#cfd2df" strokeWidth={22} />
      <path d="M 1480 40 Q 1680 0 1780 120" fill="none" stroke="#cfd2df" strokeWidth={22} opacity={0} />
      <line x1={1000} y1={120} x2={1000} y2={by - 40} stroke="#d9ccb2" strokeWidth={5} />
      <line x1={1500} y1={120} x2={1500} y2={by - 40} stroke="#d9ccb2" strokeWidth={5} />
      <path d="M 1040 40 Q 1240 0 1500 120" fill="none" stroke="#cfd2df" strokeWidth={22} />
      <g transform={`translate(1250 ${by})`}>
        <path d="M -330 -40 L 330 -40 Q 300 60 200 70 L -200 70 Q -300 60 -330 -40 Z" fill={PAL.boatHull} {...st(7)} />
        <rect x={-330} y={-52} width={660} height={20} fill={PAL.boatTrim} {...st(4)} />
        <text y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>7</text>
        {Array.from({ length: people }, (_, i) => <g key={i} transform={`translate(${-270 + i * 60} ${-60 - (i % 2) * 10})`}><circle r={18} fill={i % 3 ? PAL.skinLight : PAL.skinMid} {...st(3)} /><path d={`M -16 -6 Q 0 -30 16 -6`} fill={i % 2 ? "#4a3326" : "#6e4a31"} /></g>)}
      </g>
    </g>
  );
};

/** small steam plume for funnels */
export const Steam: React.FC<{ f: number; x: number; y: number; s?: number }> = ({ f, x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>{Array.from({ length: 9 }, (_, i) => { const a = (f * 2 + i * 13) % 120; return <circle key={i} cx={Math.sin(i * 1.7) * 20 + a * 0.4} cy={-a * 2.4} r={30 + a * 0.6} fill="#e9eef5" opacity={0.75 * (1 - a / 120)} />; })}</g>
);

/** pile of ice on the well deck */
export const IcePile: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 14 }, (_, i) => <path key={i} transform={`translate(${(i % 7) * 70 - 220} ${-Math.floor(i / 7) * 50 - (i % 3) * 10}) rotate(${i * 23})`} d="M -30 10 L -10 -30 L 20 -20 L 34 10 L 0 26 Z" fill={i % 2 ? "#eef6fb" : "#d6eaf5"} {...st(4)} />)}
  </g>
);

/** glass of whisky with/without ice */
export const Glass: React.FC<{ f: number; ice: number }> = ({ f, ice }) => (
  <g>
    <path d="M -110 -150 L 110 -150 L 90 160 Q 0 180 -90 160 Z" fill="#dfeef7" opacity={0.6} {...st(7)} />
    <path d="M -100 -20 L 100 -20 L 90 158 Q 0 176 -90 158 Z" fill="#c98a3a" opacity={0.85} />
    {ice > 0 && [0, 1].map((i) => <rect key={i} x={-60 + i * 60} y={lerp(-300, -40 + i * 20, ice)} width={64} height={64} rx={10} fill="#eef6fb" opacity={0.9} {...st(4)} transform={`rotate(${i * 18 + Math.sin(f * 0.1) * 3})`} />)}
  </g>
);

export { Iceberg, Titanic };
