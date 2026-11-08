// Sets for Episode 1 "Get off that ship" (same chibi style: INK outlines, flat colours + one shade layer).
// Facts used: Harland & Wolff Arrol gantry, slips 2 (Olympic, no. 400) and 3 (Titanic, no. 401); tenders at Cherbourg
// (Nomadic, Traffic) and Queenstown (America, Ireland); boiler rooms with coal-fired furnaces; first-class dining saloon.
import React from "react";
import { INK, PAL, prog, lerp, clamp } from "./style";
import { Titanic, SeaSky, WaterFront } from "./ship";

const st = (w = 4) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
const FONT = "CapBlack, Montserrat, sans-serif";
const FONT2 = "WmBold, Montserrat, sans-serif";

// ---------------------------------------------------------------- shipyard (Belfast)
/** hull under construction, bow right. build 0 = keel only, 0.5 = all frames, 1 = fully plated */
export const HullBuild: React.FC<{ build: number; label: string; s?: number }> = ({ build, label, s = 1 }) => {
  const frames = Math.round(clamp(build / 0.5) * 40), plate = clamp((build - 0.5) / 0.5);
  return (
    <g transform={`scale(${s})`}>
      <rect x={-760} y={-14} width={1520} height={28} rx={6} fill="#6e5a4a" {...st(5)} />
      {Array.from({ length: frames }, (_, i) => {
        const x = -720 + i * 37, h = 330 - Math.pow(Math.abs(i - 20) / 20, 3) * 140;
        return <path key={i} d={`M ${x} -10 Q ${x - 18} ${-h * 0.5} ${x - 6} ${-h}`} fill="none" stroke="#8a4a32" strokeWidth={9} strokeLinecap="round" />;
      })}
      {plate > 0 && <path d={`M -740 -10 L ${-740 + 1480 * plate} -10 L ${-740 + 1480 * plate} -320 L -730 -300 Q -770 -150 -740 -10 Z`} fill="#3a3133" {...st(5)} />}
      {plate > 0 && Array.from({ length: Math.round(12 * plate) }, (_, r) => <line key={r} x1={-720 + r * 120} y1={-20} x2={-720 + r * 120} y2={-300} stroke="#544649" strokeWidth={3} />)}
      {/* yard number board */}
      <g transform="translate(0 -390)">
        <rect x={-120} y={-34} width={240} height={70} rx={10} fill="#fbf4e4" {...st(5)} />
        <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>{label}</text>
      </g>
    </g>
  );
};

export const Shipyard: React.FC<{ f: number; build401: number; build400?: number; sparks?: boolean; children?: React.ReactNode }> = ({ f, build401, build400 = 0.85, sparks = true, children }) => (
  <g>
    <SeaSky f={f} mode="day" horizon={930} />
    {/* Belfast hills + cranes */}
    <path d="M -100 640 Q 200 520 480 600 Q 760 500 1080 590 Q 1400 520 1700 600 Q 1900 560 2020 620 L 2020 940 L -100 940 Z" fill="#8fb38a" {...st(3)} />
    {/* Arrol gantry */}
    <g>
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={40 + i * 165} y={150} width={16} height={790} fill="#9a4d38" {...st(3)} />)}
      {[150, 330, 520, 710].map((y) => <rect key={y} x={30} y={y} width={1860} height={14} fill="#a65a43" {...st(3)} />)}
      {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M ${48 + i * 165} 164 L ${213 + i * 165} 330 M ${213 + i * 165} 164 L ${48 + i * 165} 330`} stroke="#a65a43" strokeWidth={4} />)}
      <g transform={`translate(${700 + Math.sin(f * 0.02) * 200} 164)`}><rect x={-40} y={0} width={80} height={40} fill="#f0c04a" {...st(3)} /><line x1={0} y1={40} x2={0} y2={200 + Math.sin(f * 0.05) * 40} stroke={INK} strokeWidth={3} /><path d={`M -14 ${200 + Math.sin(f * 0.05) * 40} q 14 24 28 0`} fill="none" {...st(4)} /></g>
    </g>
    {/* Olympic (behind, further along) and 401 */}
    <g transform="translate(960 650)"><HullBuild build={build400} label="400" s={0.7} /></g>
    <g transform="translate(980 900)"><HullBuild build={build401} label="401" s={0.95} /></g>
    {/* slipway ground */}
    <rect x={-100} y={930} width={2120} height={200} fill="#8f7b5e" {...st(4)} />
    {sparks && Array.from({ length: 5 }, (_, i) => {
      const t = (f + i * 9) % 18, x = 420 + ((i * 271) % 1100), y = 760 - ((i * 53) % 220);
      return t < 8 ? <g key={i} opacity={1 - t / 8}>{[0, 1, 2, 3].map((k) => <line key={k} x1={x} y1={y} x2={x + Math.cos(k * 1.6 + i) * (10 + t * 4)} y2={y + Math.sin(k * 1.6 + i) * (10 + t * 4)} stroke="#ffd84a" strokeWidth={4} strokeLinecap="round" />)}</g> : null;
    })}
    {children}
  </g>
);

/** the launch, 31 May 1911: hull slides down slip into the river, splash, crowd */
export const Launch: React.FC<{ f: number; p: number }> = ({ f, p }) => {
  const x = lerp(150, 900, p), y = lerp(500, 820, p), splash = clamp((p - 0.75) / 0.25);
  return (
    <g>
      <SeaSky f={f} mode="day" horizon={820} />
      <path d="M -100 820 L 900 300 L 1000 300 L 1000 820 Z" fill="#8f7b5e" {...st(4)} transform="translate(-700 0)" />
      <g transform={`translate(${x} ${y}) rotate(${lerp(-14, 0, p)})`}><HullBuild build={1} label="401" s={0.75} /></g>
      <g transform="translate(960 830)"><WaterFront f={f} width={4000} color="#3f7fbf" /></g>
      {splash > 0 && Array.from({ length: 14 }, (_, i) => { const a = -Math.PI * (0.15 + 0.7 * (i / 13)), r = 60 + splash * 260; return <circle key={i} cx={x + 420 + Math.cos(a) * r} cy={820 + Math.sin(a) * r * 0.8} r={22 * (1 - splash * 0.5)} fill="#dff1fb" {...st(3)} opacity={1 - splash * 0.6} />; })}
      {/* crowd */}
      {Array.from({ length: 34 }, (_, i) => { const cx = 1180 + i * 24 + (i % 2) * 8, wave = Math.sin(f * 0.4 + i) * 6; return <g key={i}><circle cx={cx} cy={930 - (i % 3) * 18} r={13} fill={["#3a3d4a", "#6e4a31", "#7b4a8c", "#2c3a5e"][i % 4]} {...st(2)} /><path d={`M ${cx + 8} ${920 - (i % 3) * 18} l ${10} ${-22 + wave}`} {...st(3)} /></g>; })}
      <rect x={1100} y={940} width={900} height={200} fill="#8f7b5e" {...st(4)} />
    </g>
  );
};

// ---------------------------------------------------------------- cut-away with the three classes
export const CrossSection: React.FC<{ f: number; hl: number; counts?: boolean }> = ({ f, hl, counts = true }) => {
  const bands = [
    { y: -250, h: 90, c: "#f2d48b", label: "1st class", n: "324" },
    { y: -160, h: 80, c: "#b9d3ec", label: "2nd class", n: "~284" },
    { y: -80, h: 80, c: "#cfe2b8", label: "3rd class", n: "709" },
    { y: 0, h: 70, c: "#e6a07a", label: "crew & engines", n: "~900" },
  ];
  return (
    <g>
      <rect x={-600} y={-600} width={3120} height={2280} fill="#f3e6c8" />
      <g transform="translate(960 600)">
        <path d="M -820 -250 L 760 -270 Q 820 -100 760 70 L -760 70 Q -840 -80 -820 -250 Z" fill="#1d1b22" {...st(7)} />
        {bands.map((b, i) => {
          const on = hl === i + 1, dim = hl > 0 && !on;
          return (
            <g key={i} opacity={dim ? 0.35 : 1}>
              <rect x={-780} y={b.y} width={1530} height={b.h - 8} rx={8} fill={b.c} {...st(4)} />
              <text x={-740} y={b.y + b.h / 2 + 10} fontFamily={FONT} fontWeight={900} fontSize={36} fill={INK}>{b.label}</text>
              {counts && <text x={700} y={b.y + b.h / 2 + 12} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>{b.n}</text>}
              {on && <rect x={-790} y={b.y - 8} width={1550} height={b.h + 8} rx={12} fill="none" stroke="#ffd84a" strokeWidth={10} opacity={0.6 + 0.4 * Math.sin(f * 0.3)} />}
            </g>
          );
        })}
        {[-330, -100, 130, 360].map((fx, i) => <path key={i} d={`M ${fx - 42} -265 L ${fx - 70} -430 L ${fx + 14} -430 L ${fx + 42} -265 Z`} fill={PAL.funnelBuff} {...st(4)} />)}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- boiler room
export const BoilerRoom: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#2a1d1f" />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-50 + i * 360} 0 L ${-50 + i * 360} 260 Q ${-50 + i * 360} 300 ${-10 + i * 360} 300 L ${300 + i * 360} 300`} fill="none" stroke="#5a4446" strokeWidth={26} />)}
    {/* boiler fronts with three furnace doors each */}
    {[0, 1, 2].map((b) => (
      <g key={b} transform={`translate(${330 + b * 630} 560)`}>
        <rect x={-280} y={-260} width={560} height={420} rx={60} fill="#4b3a3c" {...st(6)} />
        {[-170, 0, 170].map((x, k) => {
          const flick = 0.6 + 0.4 * Math.abs(Math.sin(f * 0.37 + b * 2 + k));
          return <g key={k}><rect x={x - 62} y={-40} width={124} height={110} rx={14} fill="#1a1214" {...st(5)} /><rect x={x - 50} y={-28} width={100} height={86} rx={10} fill="#ff7a2e" opacity={flick} /><rect x={x - 34} y={-12} width={68} height={50} rx={8} fill="#ffd84a" opacity={flick} /></g>;
        })}
        {[-180, 0, 180].map((x) => <circle key={x} cx={x} cy={-170} r={30} fill="#e9dcc0" {...st(4)} />)}
      </g>
    ))}
    <rect x={0} y={880} width={1920} height={200} fill="#3a2a2b" {...st(5)} />
    <path d="M 1500 1000 Q 1620 880 1760 1000 Z" fill="#141012" {...st(4)} />
    {children}
    <rect x={0} y={0} width={1920} height={1080} fill="#ff6a1f" opacity={0.06 + 0.03 * Math.sin(f * 0.5)} />
  </g>
);

// ---------------------------------------------------------------- first-class dining saloon
export const Saloon: React.FC<{ f: number; children?: React.ReactNode; table?: boolean }> = ({ f, children, table = true }) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#f4ecdc" />
    {Array.from({ length: 9 }, (_, i) => <g key={i}><rect x={i * 230 - 40} y={80} width={190} height={620} rx={12} fill="#efe4cf" {...st(3)} /><rect x={i * 230 - 10} y={130} width={130} height={240} rx={60} fill="#d9e3ea" {...st(3)} /><path d={`M ${i * 230 + 55} 130 L ${i * 230 + 55} 370 M ${i * 230 - 10} 250 L ${i * 230 + 120} 250`} stroke="#b9c7d2" strokeWidth={4} /></g>)}
    <rect x={0} y={700} width={1920} height={380} fill="#b06b4a" {...st(4)} />
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${i * 150} 700 l 75 60 l 75 -60`} fill="none" stroke="#9a5a3d" strokeWidth={4} />)}
    {/* chandelier */}
    <g transform={`translate(960 40) rotate(${Math.sin(f * 0.04) * 1.5} 0 0)`}>
      <line x1={0} y1={0} x2={0} y2={90} stroke={INK} strokeWidth={4} />
      <path d="M -120 100 Q 0 170 120 100" fill="none" stroke={PAL.gold} strokeWidth={10} />
      {[-120, -60, 0, 60, 120].map((x) => <g key={x}><circle cx={x} cy={x === 0 ? 135 : 100 + Math.abs(x) * 0.1} r={14} fill="#fff3c2" {...st(3)} /><circle cx={x} cy={x === 0 ? 135 : 100 + Math.abs(x) * 0.1} r={34} fill="#fff3c2" opacity={0.25} /></g>)}
    </g>
    {children}
    {table && <g>
      <path d="M 420 860 L 1500 860 L 1560 1000 L 360 1000 Z" fill="#fbf8f2" {...st(5)} />
      <rect x={360} y={1000} width={1200} height={120} fill="#efe6d6" {...st(5)} />
      {[620, 960, 1300].map((x) => <g key={x}><ellipse cx={x} cy={920} rx={70} ry={20} fill="#fff" {...st(3)} /><ellipse cx={x} cy={918} rx={40} ry={10} fill="#f2e6cf" /><path d={`M ${x + 90} 920 l 0 -40`} stroke="#b9c7d2" strokeWidth={4} /></g>)}
      <g transform="translate(960 870)"><path d="M -14 0 L 14 0 L 8 -50 L -8 -50 Z" fill="#cfe8ee" {...st(3)} /><circle cx={0} cy={-62} r={14} fill="#f39a8f" {...st(3)} /></g>
    </g>}
  </g>
);

// ---------------------------------------------------------------- small tender ferry (Nomadic / America)
export const Tender: React.FC<{ f: number; name: string; night?: boolean }> = ({ f, name, night = false }) => (
  <g transform={`translate(0 ${Math.sin(f * 0.15) * 4}) rotate(${Math.sin(f * 0.12) * 1.5})`}>
    {Array.from({ length: 4 }, (_, k) => { const age = (f + k * 20) % 80; return <circle key={k} cx={20 - age * 1.1} cy={-170 - age * 0.7} r={12 + age * 0.3} fill={night ? "#59607a" : "#ece0d0"} stroke={night ? "#3a3f55" : "#d1bba3"} strokeWidth={2} opacity={(1 - age / 80) * 0.8} />; })}
    <path d="M -10 -80 L 0 -170 L 50 -170 L 40 -80 Z" fill={PAL.funnelBuff} {...st(4)} /><path d="M -2 -150 L 0 -170 L 50 -170 L 48 -150 Z" fill={PAL.funnelBlack} />
    <path d="M -150 -40 L -140 -90 L 140 -90 L 150 -40 Z" fill={night ? "#d9dbe6" : PAL.white} {...st(4)} />
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-125 + i * 38} y={-76} width={18} height={14} rx={3} fill={night ? "#ffd66b" : "#2b3448"} />)}
    <path d="M -230 -40 L 230 -46 Q 250 -10 225 30 L -200 30 Q -245 0 -230 -40 Z" fill="#1d1b22" {...st(4)} />
    <text x={0} y={2} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={22} fill="#f1e6c8">{name}</text>
  </g>
);

/** harbour scene: Titanic at anchor + coast. mode "cherbourg" = dusk with breakwater, "queenstown" = day, green hills */
export const Harbor: React.FC<{ f: number; mode: "cherbourg" | "queenstown"; shipX?: number; shipS?: number; children?: React.ReactNode; leave?: number }> = ({ f, mode, shipX = 1150, shipS = 0.62, children, leave = 0 }) => {
  const dusk = mode === "cherbourg";
  return (
    <g>
      <SeaSky f={f} mode={dusk ? "dawn" : "day"} horizon={640} />
      {dusk ? (
        <g><path d="M -100 640 L 300 600 L 700 615 L 900 590 L 1300 620 L 2020 610 L 2020 650 L -100 650 Z" fill="#6c5a7a" {...st(3)} />
          {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={60 + i * 70} cy={612 - (i % 3) * 6} r={4} fill="#ffd66b" opacity={0.7 + 0.3 * Math.sin(f * 0.1 + i)} />)}</g>
      ) : (
        <g><path d="M -100 640 Q 150 470 420 560 Q 620 440 860 560 Q 1000 600 1100 640 Z" fill="#6fae64" {...st(3)} />
          <path d="M 1400 640 Q 1650 520 2020 560 L 2020 640 Z" fill="#7fbb70" {...st(3)} />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={140 + i * 70} y={560 - (i % 3) * 20} width={44} height={36} fill={["#f3ede2", "#e9d39a", "#d9e3ea"][i % 3]} {...st(2)} />)}</g>
      )}
      <g transform={`translate(${shipX + leave * 1400} 790) scale(${shipS * (1 - leave * 0.6)})`}><Titanic f={f} night={false} smoke={leave > 0} lights={dusk ? 1 : 0} /></g>
      {dusk && <ellipse cx={shipX} cy={700} rx={600} ry={140} fill="#ffd66b" opacity={0.08} />}
      <g transform="translate(960 790)"><WaterFront f={f} width={4000} color={dusk ? "#5a6f9e" : "#3f7fbf"} /></g>
      {children}
    </g>
  );
};

// ---------------------------------------------------------------- photo freeze (Browne's camera)
/** shows `render(frozenFrame)` as a sepia snapshot with a white border, popping in after the flash at frame a */
export const Snapshot: React.FC<{ f: number; a: number; render: (fr: number) => React.ReactNode; x?: number; y?: number; s?: number; rot?: number; caption?: string; id: string }> = ({ f, a, render, x = 960, y = 520, s = 0.62, rot = -3, caption, id }) => {
  if (f < a) return null;
  const p = prog(f, a, a + 10), flash = 1 - clamp((f - a) / 6), drift = clamp((f - a) / 600);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#ffffff" opacity={flash * 0.9} />
      <rect x={0} y={0} width={1920} height={1080} fill="#1a1214" opacity={0.45 * p} />
      <defs>
        <filter id={`sep-${id}`}><feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0.04  0.35 0.69 0.17 0 0.02  0.27 0.53 0.13 0 0  0 0 0 1 0" /></filter>
        <clipPath id={`clip-${id}`}><rect x={0} y={0} width={1920} height={1080} /></clipPath>
      </defs>
      <g transform={`translate(${x} ${y}) rotate(${lerp(rot - 8, rot, p) + drift * 2}) scale(${lerp(s * 1.25, s, p) * (1 + 0.08 * drift)}) translate(-960 -540)`}>
        <rect x={-50} y={-50} width={2020} height={caption ? 1280 : 1180} fill="#fbf6ea" {...st(8)} />
        <g clipPath={`url(#clip-${id})`} filter={`url(#sep-${id})`}>{render(a)}</g>
        <rect x={0} y={0} width={1920} height={1080} fill="none" stroke="#3a2b2e" strokeWidth={6} />
        {caption && <text x={960} y={1180} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={74} fill="#4a3a30">{caption}</text>}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- the trunk in the Jesuit archives
export const Trunk: React.FC<{ f: number; open: number; count?: number }> = ({ f, open, count = 0 }) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#3b2f3a" />
    <rect x={0} y={820} width={1920} height={260} fill="#5a4038" {...st(4)} />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={(i * 263 + f * 0.5) % 1920} cy={200 + ((i * 97) % 500)} r={3} fill="#d9c7a8" opacity={0.4} />)}
    <g transform="translate(960 820)">
      <rect x={-330} y={-300} width={660} height={300} rx={20} fill="#7b4a2c" {...st(6)} />
      {[-200, 200].map((x) => <rect key={x} x={x - 20} y={-300} width={40} height={300} fill="#5a3520" {...st(4)} />)}
      <g transform={`translate(0 -300) rotate(${-lerp(0, 75, open)} -330 0)`}><rect x={-330} y={-80} width={660} height={80} rx={20} fill="#8a5a36" {...st(6)} /></g>
      {open > 0.5 && Array.from({ length: 16 }, (_, i) => {
        const t = ((f * 1.2 + i * 13) % 90) / 90, ang = -Math.PI / 2 + (i % 8 - 3.5) * 0.18;
        return <g key={i} transform={`translate(${Math.cos(ang) * t * 900} ${-300 + Math.sin(ang) * t * 700 + t * t * 300}) rotate(${i * 37 + t * 200})`} opacity={1 - t}><rect x={-60} y={-44} width={120} height={88} fill="#fbf6ea" {...st(3)} /><rect x={-48} y={-34} width={96} height={60} fill="#b99d78" /></g>;
      })}
    </g>
    {count > 0 && <text x={960} y={230} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={140} fill="#fff4dc" stroke={INK} strokeWidth={14} paintOrder="stroke">{Math.round(count).toLocaleString("en-US")}</text>}
  </g>
);
