// Titanic: The Real Story — Episode 1 "Get off that ship" (1920x1080, 30 fps).
// Timeline (lines, scenes, word timings, captions, mouth envelopes) from ep01/timeline.py -> src/ep1_timeline.json.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, delayRender, continueRender, getInputProps } from "remotion";
import TL from "./ep1_timeline.json";
import { Chibi, Pose, Spec } from "./chibi";
import { ANDREWS, ANDREWS_NB, BROWN, SMITH } from "./cast";
import { BROWNE, BROWNE_NC, GEDDES, SPEDDEN_F, DOUGLAS, NAVRATIL, MICHEL, EDMOND, JOHN_SAGE, ANNIE_SAGE, SAGE_KIDS, ASTOR, MADELEINE, BRIDE, FIREMAN, RICH_M, RICH_W, WORKER, EMIGRANT } from "./cast1";
import { PAL, prog, lerp, clamp, INK } from "./style";
import { Sunburst, Sparkles, SmokePuff, ShockLines, SpeechBubble, NameTag } from "./fx";
import { Titanic, Steamer, Iceberg, SeaSky, WaterFront } from "./ship";
import { Cam, NightSea, RadioRoom, Departure, Icon } from "./scenes";
import { Deck } from "./deck";
import { Shipyard, HullBuild, Launch, CrossSection, BoilerRoom, Saloon, Tender, Harbor, Snapshot, Trunk } from "./ep1sets";

const FONT = "CapBlack, Montserrat, sans-serif";
const FONT2 = "WmBold, Montserrat, sans-serif";
export const EP1_FRAMES = TL.total;
type K = keyof typeof TL.lines;
const S = (k: K) => TL.lines[k].start;
const E = (k: K) => TL.lines[k].start + TL.lines[k].dur;
const WORDS = TL.words as Record<string, { w: string; s: number; e: number }[]>;
const W = (k: K, i: number) => { const w = WORDS[k]; return TL.lines[k].start + Math.round(w[Math.min(i, w.length - 1)].s * 30); };
const ENV = TL.env as Record<string, number[]>;
const env = (k: K, f: number) => { const e = ENV[k]; const i = f - S(k); return e && i >= 0 && i < e.length ? e[i] : 0; };
const blinkAt = (f: number, every = 70, seed = 0) => { const d = (f + seed * 23) % every; return d < 6 ? [0.5, 1, 1, 0.6, 0.2, 0][d] : 0; };
const idle = (f: number, seed = 0): Pose => ({ blink: blinkAt(f, 70 + seed * 7, seed), breathe: Math.sin(f / 16 + seed), head: Math.sin(f * 0.05 + seed) * 2 });
const walkP = (f: number, on: boolean, speed = 0.32): Pose => (on ? { walk: 1, phase: f * speed } : {});

// ---------------------------------------------------------------- captions
const CAPS = TL.caps as { text: string; a: number; b: number }[];
const Captions: React.FC<{ f: number; hide?: boolean }> = ({ f, hide }) => {
  const c = CAPS.find((p) => f >= p.a && f <= p.b);
  if (!c || hide) return null;
  return <div style={{ position: "absolute", left: 0, right: 0, bottom: 96, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 62, color: "#fff", WebkitTextStroke: "12px #1a1012", paintOrder: "stroke fill", textShadow: "0 5px 8px rgba(0,0,0,0.6)" }}>{c.text}</div>;
};
/** small yellow label next to a speech bubble: real words vs playful */
const Label: React.FC<{ f: number; a: number; b: number; x: number; y: number; text: string }> = ({ f, a, b, x, y, text }) => f < a || f > b ? null : (
  <div style={{ position: "absolute", left: x, top: y, transform: "translateX(-50%)", background: "#ffd84a", border: `4px solid ${INK}`, borderRadius: 14, padding: "4px 14px", fontFamily: FONT2, fontWeight: 700, fontSize: 24, color: INK, whiteSpace: "nowrap", opacity: prog(f, a, a + 5) }}>{text}</div>
);
/** date / place stamp, top left */
const Stamp: React.FC<{ f: number; a: number; b: number; text: string; sub?: string }> = ({ f, a, b, text, sub }) => {
  if (f < a || f > b) return null;
  const p = prog(f, a, a + 7), q = prog(f, b - 6, b);
  return (
    <div style={{ position: "absolute", left: 70, top: 64, transform: `translateX(${(1 - p) * -60}px)`, opacity: p * (1 - q) }}>
      <div style={{ background: "#fbf4e4", border: `5px solid ${INK}`, borderRadius: 16, padding: "8px 22px", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: INK, boxShadow: "0 5px 0 rgba(42,27,22,0.35)" }}>{text}</div>
      {sub && <div style={{ marginTop: 8, display: "inline-block", background: "#2a1b16", borderRadius: 12, padding: "4px 16px", fontFamily: FONT2, fontWeight: 700, fontSize: 24, color: "#fbf4e4" }}>{sub}</div>}
    </div>
  );
};
/** count-up number badge */
const Counter: React.FC<{ f: number; a: number; to: number; x: number; y: number; label: string; dur?: number; color?: string; size?: number }> = ({ f, a, to, x, y, label, dur = 24, color = "#ffd84a", size = 110 }) => {
  if (f < a) return null;
  const p = prog(f, a, a + dur), pop = 1 + Math.sin(clamp((f - a) / 8) * Math.PI) * 0.12;
  return (
    <g transform={`translate(${x} ${y}) scale(${pop * (0.6 + 0.4 * prog(f, a, a + 6))})`}>
      <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} stroke={INK} strokeWidth={size / 8} paintOrder="stroke">{Math.round(to * p).toLocaleString("en-US")}</text>
      <text x={0} y={size * 0.55} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size * 0.36} fill="#fff" stroke={INK} strokeWidth={size / 16} paintOrder="stroke">{label}</text>
    </g>
  );
};
/** the telegram, big */
const BigTelegram: React.FC<{ f: number; a: number; b: number; stamp: number }> = ({ f, a, b, stamp }) => {
  if (f < a || f > b) return null;
  const p = prog(f, a, a + 9), s = f >= stamp ? 1 + Math.sin(clamp((f - stamp) / 6) * Math.PI) * 0.18 : 0;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#120c10" opacity={0.55 * p} />
      <g transform={`translate(960 ${lerp(1300, 520, p) - clamp((f - a) / 200) * 30}) rotate(${lerp(8, -2, p) + clamp((f - a) / 200) * 2}) scale(${1 + clamp((f - a) / 200) * 0.06})`}>
        <rect x={-560} y={-260} width={1120} height={520} rx={14} fill="#fbf4e4" stroke={INK} strokeWidth={8} />
        <rect x={-560} y={-260} width={1120} height={96} rx={14} fill="#e9dcc0" stroke={INK} strokeWidth={8} />
        <text x={-520} y={-196} fontFamily={FONT} fontWeight={900} fontSize={44} fill="#7b2f2a">TELEGRAM · TO: FRANCIS BROWNE</text>
        {[0, 1, 2].map((i) => <path key={i} d={`M -500 ${-110 + i * 40} L ${300 - i * 120} ${-110 + i * 40}`} stroke="#c9bda4" strokeWidth={10} strokeLinecap="round" />)}
        {s > 0 && (
          <g transform={`translate(0 120) rotate(-4) scale(${s})`}>
            <rect x={-500} y={-90} width={1000} height={170} rx={20} fill="none" stroke="#c0473f" strokeWidth={14} />
            <text x={0} y={18} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={84} fill="#c0473f">GET OFF THAT SHIP</text>
            <text x={300} y={66} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={40} fill="#c0473f">– PROVINCIAL</text>
          </g>
        )}
      </g>
    </g>
  );
};
/** round portrait badge (roll call) */
const Badge: React.FC<{ f: number; a: number; x: number; y: number; specs: Spec[]; label: string; sz?: number }> = ({ f, a, x, y, specs, label, sz = 1 }) => {
  if (f < a) return null;
  const p = prog(f, a, a + 7), pop = 1 + Math.sin(clamp((f - a) / 8) * Math.PI) * 0.15;
  const id = `bd${label.replace(/\W/g, "")}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${p * pop * sz})`}>
      <defs><clipPath id={id}><circle r={110} /></clipPath></defs>
      <circle r={118} fill="#fbf4e4" stroke={INK} strokeWidth={7} />
      <g clipPath={`url(#${id})`}><circle r={110} fill="#bfe3f0" />{specs.map((s, i) => <Chibi key={s.id + i} spec={s} pose={{ ...idle(f, i), mouth: "smile" }} x={(i - (specs.length - 1) / 2) * 70} y={190} size={300 / (s.scale ?? 1)} />)}</g>
      <rect x={-110} y={110} width={220} height={52} rx={26} fill="#ffd84a" stroke={INK} strokeWidth={5} />
      <text x={0} y={146} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={label.length > 12 ? 24 : 30} fill={INK}>{label}</text>
    </g>
  );
};
/** spinning top (Douglas Spedden) */
const Top: React.FC<{ f: number; x: number; y: number }> = ({ f, x, y }) => (
  <g transform={`translate(${x + Math.sin(f * 0.15) * 30} ${y})`}>
    <path d="M -34 -40 L 34 -40 L 0 10 Z" fill="#c0473f" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M ${-34 + ((f * 9) % 68)} -40 L ${-10 + ((f * 9) % 30)} -8`} stroke="#ffd84a" strokeWidth={6} />
    <rect x={-6} y={-60} width={12} height={22} fill="#7a5233" stroke={INK} strokeWidth={4} />
    {[0, 1].map((i) => <path key={i} d={`M ${-56 - i * 14} ${-30 + i * 10} q 10 -14 0 -26`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(f + i)} />)}
  </g>
);
const FilmReel: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <circle r={90} fill="#3a3d4a" stroke={INK} strokeWidth={7} />
    {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return <circle key={i} cx={Math.cos(a) * 50} cy={Math.sin(a) * 50} r={20} fill="#cfd2df" stroke={INK} strokeWidth={4} />; })}
    <circle r={14} fill="#cfd2df" stroke={INK} strokeWidth={4} />
    <path d="M 60 70 Q 140 110 220 80 L 230 110 Q 140 140 60 100 Z" fill="#2b2d38" stroke={INK} strokeWidth={5} />
  </g>
);

// ---------------------------------------------------------------- fonts + watermark
let fontP: Promise<void> | null = null;
const loadFonts = () => (fontP ??= Promise.all([
  new FontFace("WmBold", `url(${staticFile("fonts/montserrat-latin-700-normal.woff2")})`, { weight: "700" }).load(),
  new FontFace("CapBlack", `url(${staticFile("fonts/montserrat-latin-900-normal.woff2")})`, { weight: "900" }).load(),
]).then((ff) => { ff.forEach((x) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(x)); }).catch(() => undefined));
const useFonts = () => {
  const [ok, setOk] = React.useState(false);
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { loadFonts().then(() => { setOk(true); continueRender(h); }); }, [h]);
  return ok;
};
const Watermark: React.FC = () => (
  <div style={{ position: "absolute", right: 40, bottom: 34, fontFamily: "WmBold, Montserrat, sans-serif", fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.68)", letterSpacing: 0.3, WebkitTextStroke: "1.5px rgba(10,8,20,0.55)", paintOrder: "stroke fill", textShadow: "0 2px 4px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.55)" }}>@LeoKnowledgeSharing</div>
);
const scene = (f: number) => TL.scenes.find((s) => f >= s.a && f < s.b) ?? TL.scenes[TL.scenes.length - 1];

// ---------------------------------------------------------------- reusable deck shots
const spedShot = (fr: number, browneFlash = 0, withBrowne = true) => (
  <Deck f={fr} camX={0} zoom={1.12} focusY={600} stage={<g>
    {withBrowne && <Chibi spec={BROWNE} pose={{ ...idle(fr, 1), armL: -30, armR: -26, flash: browneFlash, look: 0.4, eyes: browneFlash > 0 ? "squint" : "normal" }} x={360} y={1010} size={470} />}
    <Chibi spec={SPEDDEN_F} pose={{ ...idle(fr, 2), look: 0.5, mouth: "smile", armR: 20 }} x={1440} y={1000} size={470} facing={-1} />
    <Chibi spec={DOUGLAS} pose={{ ...idle(fr, 3), armR: 60 + Math.sin(fr * 0.5) * 30, mouth: "grin", eyes: "happy", look: 0.3 }} x={1080} y={1010} size={470} />
    <Top f={fr} x={1000} y={1000} />
  </g>} />
);
const radioShot = (fr: number) => <RadioRoom f={fr} spec={BRIDE} pose={{ write: 1, armL: -38, armR: -30 - Math.abs(Math.sin(fr * 1.1)) * 14, look: Math.sin(fr * 0.2) * 0.4, blink: blinkAt(fr, 60, 8), mouth: "flat" }} pile={0.25} clock="" />;
const leaveShot = (fr: number, lv: number, flash = 0) => (
  <Harbor f={fr} mode="queenstown" shipX={1000} shipS={0.55} leave={lv}>
    <g transform="translate(420 960) scale(1.3)"><Tender f={fr} name="AMERICA" /></g>
    <Chibi spec={BROWNE} pose={{ ...idle(fr, 4), armL: -30, armR: -26, flash, look: 0.6 }} x={460} y={900} size={330} />
  </Harbor>
);

export const Ep1: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFonts();
  if (!ok) return null;
  const noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  const sc = scene(f), lf = f - sc.a, name = sc.name;
  let svg: React.ReactNode = null; const html: React.ReactNode[] = [];
  let hideCaps = false;
  const pz = (z0: number, z1: number) => lerp(z0, z1, prog(f, sc.a, sc.b));

  switch (name) {
    case "cold": {
      // 1) wide: Titanic at anchor off Queenstown, tender alongside  2) close: Browne climbs down  3) on the tender, telegram
      const climb0 = W("N01", 9), onBoat = S("N02") - 4;
      if (f < climb0) {
        svg = <Cam z={pz(1, 1.08)} cx={900} cy={620}><Harbor f={f} mode="queenstown" shipX={1050} shipS={0.66}><g transform="translate(560 830) scale(0.62)"><Tender f={f} name="AMERICA" /></g></Harbor></Cam>;
        html.push(<Stamp key="st" f={f} a={4} b={climb0 - 2} text="Queenstown, Ireland" sub="11 April 1912" />);
      } else if (f < onBoat) {
        const p = prog(f, climb0, onBoat);
        svg = (<g>
          <SeaSky f={f} mode="day" horizon={980} />
          <rect x={980} y={-100} width={1100} height={1300} fill="#1d1b22" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={1180 + (i % 2) * 240} cy={120 + i * 170} r={22} fill="#2b3448" stroke={INK} strokeWidth={4} />)}
          <path d="M 980 70 L 1940 60" stroke={PAL.gold} strokeWidth={5} />
          {[900, 1000].map((x) => <line key={x} x1={x} y1={-50} x2={x} y2={1100} stroke="#8a6a44" strokeWidth={8} />)}
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={900} y1={i * 70} x2={1000} y2={i * 70} stroke="#8a6a44" strokeWidth={7} />)}
          <Chibi spec={BROWNE_NC} pose={{ ...idle(f, 1), armL: 150 + Math.sin(f * 0.4) * 15, armR: 150 - Math.sin(f * 0.4) * 15, look: -0.5, walk: 0.5, phase: f * 0.4 }} x={950} y={lerp(430, 900, p)} size={420} facing={-1} />
          <g transform="translate(560 1000) scale(1.4)"><Tender f={f} name="AMERICA" /></g>
        </g>);
      } else {
        const pocket = W("N02", 3);
        svg = (<g>
          <Cam z={pz(1.05, 1.15)} cx={700} cy={620}>
            <Harbor f={f} mode="queenstown" shipX={1350} shipS={0.7}>
              <g transform="translate(640 980) scale(1.5)"><Tender f={f} name="AMERICA" /></g>
              <Chibi spec={BROWNE_NC} pose={{ ...idle(f, 1), armR: f > pocket ? 100 : 0, look: 0.3, eyes: "normal", mouth: "flat" }} x={700} y={900} size={430} />
            </Harbor>
          </Cam>
          <BigTelegram f={f} a={S("T1") - 10} b={sc.b} stamp={S("T1")} />
        </g>);
        html.push(<Label key="lb" f={f} a={S("T1") + 4} b={sc.b} x={960} y={900} text="telegram text as reported" />);
        hideCaps = f >= S("T1") - 10;
      }
      break;
    }
    case "flash": {
      svg = <g><Cam z={pz(1, 1.12)} cy={620}><NightSea f={f} shipX={lerp(600, 900, prog(f, sc.a, sc.b))} berg={1} bergX={1550} scale={0.6} /></Cam></g>;
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={sc.b} text="3 days later" sub="14 April 1912, 11:40 p.m." />);
      break;
    }
    case "browne": {
      const flashes = [W("N04", 5), W("N04", 10), W("N04", 14)];
      const lastFlash = flashes.filter((x) => f >= x).pop() ?? -99;
      const fl = clamp(1 - (f - lastFlash) / 6);
      const minis: [string, number, number, number][] = [["deck", 360, 300, -8], ["radio", 1560, 320, 7], ["sped", 1500, 760, -5]];
      svg = (<g>
        <Sunburst f={f} c1="#f6e2b6" c2="#efd39c" />
        <Chibi spec={BROWNE} pose={{ ...idle(f, 1), armL: -30, armR: -26, flash: fl, eyes: fl > 0.3 ? "squint" : "happy", mouth: "smile", look: 0.2 }} x={960} y={1020} size={620} />
        {minis.map(([k, x, y, r], i) => f >= flashes[i] ? (
          <g key={k} transform={`translate(${x} ${y}) rotate(${r}) scale(${prog(f, flashes[i], flashes[i] + 8) * 0.22})`}>
            <rect x={-1010} y={-590} width={2020} height={1180} fill="#fbf6ea" stroke={INK} strokeWidth={24} />
            <defs><filter id={`ms${i}`}><feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0.04  0.35 0.69 0.17 0 0.02  0.27 0.53 0.13 0 0  0 0 0 1 0" /></filter><clipPath id={`mc${i}`}><rect x={-960} y={-540} width={1920} height={1080} /></clipPath></defs>
            <g clipPath={`url(#mc${i})`} filter={`url(#ms${i})`}><g transform="translate(-960 -540)">{k === "deck" ? <Deck f={30} camX={0} zoom={1} stage={<g />} /> : k === "radio" ? radioShot(30) : spedShot(30, 0, false)}</g></g>
          </g>
        ) : null)}
      </g>);
      html.push(<NameTag key="nt" f={f} a={W("N04", 1)} dur={sc.b - W("N04", 1) - 4} x={960} y={300} name="Francis Browne" role="Jesuit student & photographer" color="#7b4a8c" />);
      break;
    }
    case "film": {
      const q = S("N06");
      if (f < q - 2) {
        const crowd = [BROWNE_NC, SMITH, ANDREWS, BROWN, DOUGLAS, NAVRATIL, ANNIE_SAGE, JOHN_SAGE, BRIDE, ASTOR, MADELEINE, MICHEL];
        const r = W("N05", 9);
        svg = (<g>
          <rect x={0} y={0} width={1920} height={1080} fill="#f3e6c8" />
          <rect x={960} y={0} width={960} height={1080} fill="#cfe3ee" />
          <line x1={960} y1={0} x2={960} y2={1080} stroke={INK} strokeWidth={8} />
          <g transform={`translate(420 360) rotate(${f * 1.5}) scale(${prog(f, sc.a, sc.a + 8) * 1.3})`}><FilmReel /></g>
          <text x={480} y={700} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={INK}>THE 1997 FILM</text>
          <g opacity={prog(f, W("N05", 4), W("N05", 4) + 6)}><rect x={190} y={740} width={580} height={86} rx={43} fill="#fff7e6" stroke={INK} strokeWidth={6} /><text x={480} y={798} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill="#c0473f">2 invented passengers</text></g>
          {f >= r && crowd.map((s, i) => <g key={s.id + i} opacity={prog(f, r + i * 2, r + i * 2 + 5)}><Chibi spec={s} pose={{ ...idle(f, i), mouth: "smile", eyes: i % 3 ? "normal" : "happy" }} x={1080 + (i % 6) * 140} y={i < 6 ? 620 : 900} size={250} /></g>)}
          {f >= r && <text x={1440} y={250} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={INK} opacity={prog(f, r, r + 6)}>THIS SERIES</text>}
          {f >= r && <g opacity={prog(f, r + 6, r + 12)}><rect x={1170} y={290} width={540} height={86} rx={43} fill="#ffd84a" stroke={INK} strokeWidth={6} /><text x={1440} y={348} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={INK}>real people only</text></g>}
        </g>);
      } else {
        const z = prog(f, W("N06", 10), sc.b);
        svg = (<g>
          <Cam z={lerp(1, 9, z * z)} cx={980} cy={760}><Shipyard f={f} build401={0.7} sparks={false} /></Cam>
          {[0, 1, 2].map((i) => <text key={i} x={500 + i * 460} y={320 - Math.abs(Math.sin(f * 0.2 + i)) * 24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill="#fff" stroke={INK} strokeWidth={12} paintOrder="stroke" opacity={1 - z}>?</text>)}
          <rect x={0} y={0} width={1920} height={1080} fill="#fff" opacity={prog(f, sc.b - 8, sc.b)} />
        </g>);
      }
      break;
    }
    case "title": {
      hideCaps = true;
      const p = prog(f, sc.a, sc.a + 8), bob = Math.sin(f * 0.08) * 6;
      svg = (<g>
        <SeaSky f={f} mode="dawn" horizon={760} />
        <g transform={`translate(${lerp(560, 900, prog(f, sc.a, sc.b))} ${880 + bob}) scale(0.62)`}><Titanic f={f} /></g>
        <g transform="translate(0 880)"><WaterFront f={f} width={4000} color="#5a6f9e" /></g>
        <g transform={`translate(960 ${300 - (1 - p) * 60}) scale(${0.8 + 0.2 * p})`} opacity={p}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={128} fill="#fff4dc" stroke={INK} strokeWidth={15} paintOrder="stroke" letterSpacing={4}>TITANIC: THE REAL STORY</text>
          <g transform="translate(0 100) rotate(-2)" opacity={prog(f, sc.a + 8, sc.a + 14)}>
            <rect x={-470} y={-58} width={940} height={88} rx={44} fill="#ffd84a" stroke={INK} strokeWidth={7} />
            <text x={0} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={INK}>EPISODE 1 · GET OFF THAT SHIP</text>
          </g>
        </g>
        <Sparkles f={f} x={960} y={300} spread={560} n={10} seed={5} />
      </g>);
      break;
    }
    case "yard": {
      const andrewsIn = S("N09") - 4, olympic = S("N08");
      const build = lerp(0.04, 0.42, prog(f, sc.a, olympic + 20)) + lerp(0, 0.2, prog(f, andrewsIn, sc.b));
      const cam = f < olympic ? { z: lerp(1.15, 1.25, prog(f, sc.a, olympic)), cx: 980, cy: 800 } : f < andrewsIn ? { z: lerp(1.5, 1.6, prog(f, olympic, andrewsIn)), cx: 960, cy: 600 } : { z: 1.18, cx: 1100, cy: 700 };
      svg = (<g>
        <Cam z={cam.z} cx={cam.cx} cy={cam.cy}>
          <Shipyard f={f} build401={build}>
            {[0, 1, 2].map((i) => <Chibi key={i} spec={WORKER(i)} pose={{ ...idle(f, i), armR: 60 + Math.abs(Math.sin(f * 0.5 + i * 2)) * 60, look: 0.3 }} x={420 + i * 520} y={1000} size={230} facing={i % 2 ? -1 : 1} />)}
            {f >= andrewsIn && <g transform={`translate(1560 1010) scale(${prog(f, andrewsIn, andrewsIn + 6)}) translate(-1560 -1010)`}><Chibi spec={ANDREWS} pose={{ ...idle(f, 2), armR: f >= S("A1") ? 130 : 30, look: -0.4, talk: env("A1", f), mouth: f >= S("A1") ? "grin" : "smile", eyes: f >= S("A1") ? "happy" : "normal" }} x={1560} y={1010} size={360} facing={-1} /></g>}
            {f >= olympic && f < andrewsIn && <circle cx={960} cy={560} r={330 + Math.sin(f * 0.3) * 6} fill="none" stroke="#ffd84a" strokeWidth={10} strokeDasharray="28 16" opacity={prog(f, olympic, olympic + 6)} />}
          </Shipyard>
        </Cam>
      </g>);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={olympic - 2} text="Belfast · Harland & Wolff" sub="31 March 1909" />);
      if (f >= olympic && f < andrewsIn) html.push(<NameTag key="ol" f={f} a={olympic + 6} dur={andrewsIn - olympic - 8} x={960} y={330} name="Olympic" role="Ship no. 400 · Titanic's older sister" color="#3f7fbf" />);
      html.push(<NameTag key="an" f={f} a={andrewsIn + 6} dur={sc.b - andrewsIn - 10} x={1440} y={380} name="Thomas Andrews" role="Harland & Wolff, head of design" color="#3f7fbf" />);
      html.push(<SpeechBubble key="a1" f={f} a={S("A1") - 2} b={sc.b} x={1100} y={330} tx={1360} ty={470} text="Three million rivets. Let's get started!" width={560} />);
      html.push(<Label key="l1" f={f} a={S("A1")} b={sc.b} x={1100} y={350} text="playful" />);
      break;
    }
    case "yard2": {
      const dark = W("N10", 12);
      if (f < dark) {
        const hit = Math.abs(Math.sin(f * 0.45));
        svg = (<g>
          <rect x={0} y={0} width={1920} height={1080} fill="#3a3133" />
          {Array.from({ length: 7 }, (_, r) => Array.from({ length: 12 }, (_, c) => <circle key={`${r}-${c}`} cx={120 + c * 150} cy={130 + r * 130} r={24} fill="#5a4b4d" stroke={INK} strokeWidth={4} />))}
          <circle cx={960} cy={560} r={70} fill="#ff9a4a" stroke={INK} strokeWidth={6} opacity={0.7 + 0.3 * Math.sin(f)} />
          <g transform={`translate(1060 ${400 - hit * 80}) rotate(${-30 + hit * 30})`}><rect x={-20} y={0} width={40} height={260} fill="#8a6a44" stroke={INK} strokeWidth={5} /><rect x={-70} y={-40} width={140} height={60} rx={8} fill="#6b6f7d" stroke={INK} strokeWidth={5} /></g>
          {hit > 0.95 && <ShockLines t={2} x={960} y={560} s={1.6} />}
          <Counter f={f} a={W("N10", 4)} to={3000000} x={960} y={780} label="rivets" dur={40} size={120} />
        </g>);
      } else {
        svg = (<g>
          <rect x={0} y={0} width={1920} height={1080} fill="#141018" />
          <g transform={`translate(960 470) scale(${1 + 0.1 * prog(f, dark, sc.b)})`} opacity={prog(f, dark, dark + 10)}>
            {Array.from({ length: 8 }, (_, i) => <g key={i} transform={`translate(${(i - 3.5) * 150} 0)`}><rect x={-18} y={-10} width={36} height={60} rx={6} fill="#e9dcc0" stroke={INK} strokeWidth={4} /><path d={`M 0 -10 q ${-8 + Math.sin(f * 0.3 + i) * 3} -22 0 -40 q 8 18 0 40`} fill="#ffd66b" /><circle cx={0} cy={-26} r={40} fill="#ffd66b" opacity={0.12} /></g>)}
            <text x={0} y={160} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#fbf4e4">8 workers died building her</text>
          </g>
        </g>);
      }
      break;
    }
    case "launch": {
      svg = <Launch f={f} p={prog(f, sc.a + 10, sc.b - 20)} />;
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={sc.b} text="The launch" sub="31 May 1911" />);
      break;
    }
    case "fit": {
      const icons: [string, number][] = [["engine", W("N12", 5)], ["cabin", W("N12", 6)], ["stairs", W("N12", 8)]];
      const named = S("K1");
      svg = f < W("N12", 11) ? (
        <g transform={`translate(960 540) scale(${lerp(1, 1.08, prog(f, sc.a, W("N12", 11)))}) translate(-960 -540)`}>
          <Sunburst f={f} c1="#bfe3f0" c2="#a6d6ea" />
          {icons.map(([k, t], i) => f >= t ? (
            <g key={k} transform={`translate(${460 + i * 500} ${520 + Math.sin(f * 0.15 + i) * 14}) rotate(${Math.sin(f * 0.1 + i) * 4}) scale(${prog(f, t, t + 6) * (1 + Math.sin(clamp((f - t) / 8) * Math.PI) * 0.15)})`}>
              <circle r={170} fill="#fff7e6" stroke={INK} strokeWidth={8} />
              {k === "engine" && <g transform={`rotate(${f * 4})`}>{Array.from({ length: 8 }, (_, j) => <rect key={j} x={-22} y={-120} width={44} height={50} rx={8} fill="#6b6f7d" stroke={INK} strokeWidth={5} transform={`rotate(${j * 45})`} />)}<circle r={80} fill="#8a8e9c" stroke={INK} strokeWidth={6} /><circle r={26} fill="#3a3d4a" stroke={INK} strokeWidth={5} /></g>}
              {k === "cabin" && <g><rect x={-110} y={-10} width={220} height={70} rx={12} fill="#c99a66" stroke={INK} strokeWidth={6} /><rect x={-110} y={-50} width={80} height={50} rx={14} fill="#fbf8f2" stroke={INK} strokeWidth={5} /><rect x={-20} y={-30} width={130} height={40} rx={10} fill="#7b4a8c" stroke={INK} strokeWidth={5} /></g>}
              {k === "stairs" && <g>{Array.from({ length: 6 }, (_, j) => <rect key={j} x={-110 + j * 10} y={70 - j * 26} width={220 - j * 20} height={26} fill="#c99a66" stroke={INK} strokeWidth={4} />)}<path d="M -120 80 Q -140 -40 -60 -100 M 120 80 Q 140 -40 60 -100" fill="none" stroke={PAL.gold} strokeWidth={10} /><circle cx={0} cy={-120} r={30} fill="#d9e3ea" stroke={INK} strokeWidth={5} /></g>}
            </g>
          ) : null)}
        </g>
      ) : (
        <g>
          <SeaSky f={f} mode="day" horizon={760} />
          <g transform="translate(560 900) scale(1.6)"><Titanic f={f} smoke={false} /></g>
          <g transform="translate(0 900)"><WaterFront f={f} width={4000} color="#3f7fbf" /></g>
          {f >= named && <g transform={`translate(1460 760) rotate(-3)`}>{"TITANIC".split("").map((ch, i) => <text key={i} x={-170 + i * 52} y={0} fontFamily={FONT} fontWeight={900} fontSize={70} fill="#fbf4e4" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={prog(f, named + i * 2, named + i * 2 + 4)}>{ch}</text>)}</g>}
          {f >= named && <Sparkles f={f} x={1460} y={740} spread={300} n={8} seed={3} />}
        </g>
      );
      if (f >= named) hideCaps = true;
      break;
    }
    case "south": case "south2": {
      const bIn = S("N14"), tkt = W("N14", 22);
      const moving = name === "south2";
      const shipX = moving ? lerp(1050, 1500, prog(f, sc.a, sc.b)) : 1050;
      const crowd = Array.from({ length: 6 }, (_, i) => EMIGRANT(i));
      svg = (<g>
        <Cam z={moving ? lerp(1, 1.1, prog(f, sc.a, sc.b)) : f < bIn ? pz(1, 1.05) : 1.18} cx={moving ? 1100 : f < bIn ? 960 : 760} cy={f < bIn || moving ? 560 : 700}>
          <Departure f={f} shipX={shipX}>
            {crowd.map((s, i) => <Chibi key={i} spec={s} pose={{ ...idle(f, i), armR: moving ? 150 + Math.sin(f * 0.5 + i) * 15 : 20, mouth: "smile", look: 0.5 }} x={1150 + i * 120} y={1000} size={230} />)}
            {!moving && f >= bIn - 4 && <Chibi spec={BROWNE} pose={{ ...walkP(f, f < bIn + 50), ...idle(f, 1), armL: -30, armR: -26, look: 0.6, mouth: "smile" }} x={lerp(80, 600, prog(f, bIn, bIn + 50))} y={1010} size={360} />}
          </Departure>
        </Cam>
        {!moving && f >= tkt && (
          <g transform={`translate(1380 330) rotate(-4) scale(${prog(f, tkt, tkt + 7)})`}>
            <rect x={-320} y={-130} width={640} height={260} rx={18} fill="#f6e7c1" stroke={INK} strokeWidth={7} />
            <text x={0} y={-62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#7b2f2a">WHITE STAR LINE</text>
            <text x={0} y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>FIRST CLASS</text>
            <text x={0} y={54} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={34} fill={INK}>Southampton → Queenstown</text>
            <text x={0} y={100} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={26} fill="#c0473f">(and no further)</text>
          </g>
        )}
        {moving && f >= W("N15", 10) && <g><ShockLines t={f - W("N15", 10)} x={960} y={330} s={2.2} /><text x={960} y={360} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={160} fill="#c0473f" stroke={INK} strokeWidth={12} paintOrder="stroke" transform={`rotate(${Math.sin(f * 0.8) * 4} 960 300)`}>!</text></g>}
      </g>);
      if (name === "south") {
        html.push(<Stamp key="st" f={f} a={sc.a + 2} b={bIn - 2} text="Southampton" sub="10 April 1912 · departure day" />);
        html.push(<NameTag key="nt" f={f} a={bIn + 20} dur={60} x={lerp(80, 600, prog(f, bIn + 20, bIn + 50))} y={560} name="Francis Browne" role="1st-class ticket, a gift" color="#7b4a8c" />);
      }
      break;
    }
    case "nearmiss": {
      const snap = W("N16", 14), miss = S("N17"), stew = S("G1") - 4, tug = S("N18");
      if (f < stew) {
        const sw = prog(f, snap, miss + 10), close = f >= miss;
        svg = (<g>
          <Cam z={close ? lerp(1.5, 1.6, prog(f, miss, stew)) : pz(1, 1.06)} cx={close ? 1120 : 960} cy={close ? 600 : 560}>
            <SeaSky f={f} mode="day" horizon={560} />
            <path d="M -100 560 L 400 530 L 900 550 L 1400 525 L 2020 560 Z" fill="#7fae7a" stroke={INK} strokeWidth={3} />
            <g transform={`translate(${lerp(300, 1250, prog(f, sc.a, stew))} 650) scale(0.45)`}><Titanic f={f} /></g>
            <g transform="translate(960 650)"><WaterFront f={f} width={4000} color="#3f7fbf" /></g>
            <g transform={`translate(${lerp(900, 1000, sw)} ${lerp(950, 870, sw)}) rotate(${lerp(0, -9, sw)}) scale(0.6)`}><Steamer f={f} kind="californian" /><text x={0} y={-10} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={40} fill="#f1e6c8">NEW YORK</text></g>
            <g transform="translate(960 950)"><WaterFront f={f} width={4000} color="#2f6fa8" /></g>
            <rect x={-100} y={1010} width={2120} height={120} fill="#b9a27f" stroke={INK} strokeWidth={4} />
            {[700, 1300].map((x, i) => f < snap ? <path key={i} d={`M ${x} 995 Q ${x + 60} 960 ${x + 120} 880`} fill="none" stroke="#8a6a44" strokeWidth={8} /> : <path key={i} d={`M ${x} 995 Q ${x + 30 + Math.sin(f * 0.6 + i) * 20} ${960 + (f - snap)} ${x + 50} 990`} fill="none" stroke="#8a6a44" strokeWidth={8} />)}
            {f >= snap && f < snap + 30 && <g><ShockLines t={f - snap} x={820} y={930} s={1.4} /><text x={760} y={860} fontFamily={FONT} fontWeight={900} fontSize={90} fill="#ffd84a" stroke={INK} strokeWidth={10} paintOrder="stroke" transform={`rotate(-10 760 860) scale(${1 + Math.sin(clamp((f - snap) / 6) * Math.PI) * 0.2})`}>SNAP!</text></g>}
          </Cam>
          {close && <g opacity={prog(f, miss + 4, miss + 10)}><path d="M 1060 470 L 1060 640" stroke="#c0473f" strokeWidth={10} markerEnd="" /><path d="M 1040 490 L 1060 460 L 1080 490 M 1040 620 L 1060 650 L 1080 620" fill="none" stroke="#c0473f" strokeWidth={10} strokeLinecap="round" /><rect x={1100} y={500} width={360} height={90} rx={45} fill="#fff7e6" stroke={INK} strokeWidth={6} /><text x={1280} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>a few feet!</text></g>}
        </g>);
        if (f < snap) html.push(<NameTag key="ny" f={f} a={W("N16", 5)} dur={snap - W("N16", 5) - 2} x={1000} y={640} name="SS New York" role="moored, waiting out a coal strike" color="#c0473f" />);
      } else if (f < tug - 2) {
        svg = <Deck f={f} camX={-60} zoom={1.25} focusY={640} stage={<Chibi spec={GEDDES} pose={{ ...idle(f, 5), talk: env("G1", f), eyes: f >= S("G1") ? "wide" : "normal", brow: 1, mouth: "o", armR: f >= S("G1") ? 120 : 10, armL: 40 }} x={1000} y={1030} size={520} />} />;
        html.push(<SpeechBubble key="g1" f={f} a={S("G1") - 2} b={tug - 2} x={1320} y={330} tx={1120} ty={460} text="The New York broke her ropes and very nearly ran into us!" width={620} />);
        html.push(<Label key="lg" f={f} a={S("G1")} b={tug - 2} x={1320} y={350} text="steward Richard Geddes, letter home" />);
        html.push(<NameTag key="ng" f={f} a={stew + 4} dur={50} x={700} y={420} name="Richard Geddes" role="Steward" color="#3f7a5a" />);
      } else {
        svg = (<g>
          <SeaSky f={f} mode="day" horizon={560} />
          <g transform={`translate(1500 690) scale(0.55)`}><Titanic f={f} /></g>
          <g transform="translate(960 690)"><WaterFront f={f} width={4000} color="#3f7fbf" /></g>
          <g transform={`translate(${lerp(1000, 700, prog(f, tug, sc.b))} 860) rotate(-6) scale(0.5)`}><Steamer f={f} kind="californian" /></g>
          <g transform={`translate(${lerp(760, 460, prog(f, tug, sc.b))} 900) scale(0.35)`}><Tender f={f} name="TUG" /></g>
          <path d={`M ${lerp(760, 460, prog(f, tug, sc.b)) + 70} 890 L ${lerp(1000, 700, prog(f, tug, sc.b)) - 180} 860`} stroke="#8a6a44" strokeWidth={6} />
          <g transform="translate(960 900)"><WaterFront f={f} width={4000} color="#2f6fa8" /></g>
          <g transform={`translate(1500 280) scale(${prog(f, W("N18", 8), W("N18", 8) + 6)})`}><circle r={110} fill="#fff7e6" stroke={INK} strokeWidth={7} /><path d={`M 0 0 L ${Math.sin(f * 0.2) * 70} ${-Math.cos(f * 0.2) * 70}`} stroke={INK} strokeWidth={8} strokeLinecap="round" /><text x={0} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">up to 1 hour late</text></g>
        </g>);
      }
      break;
    }
    case "classes": case "classes1": case "classes3": case "classes4": {
      const hl = name === "classes" ? 0 : name === "classes1" ? 1 : name === "classes3" ? 3 : 4;
      svg = (<g>
        <Cam z={hl ? 1.12 : pz(1, 1.06)} cy={hl === 1 ? 420 : hl === 3 ? 560 : hl === 4 ? 640 : 540}><CrossSection f={f} hl={hl} counts={hl > 0} /></Cam>
        {name === "classes" && <Counter f={f} a={W("N19", 5)} to={2200} x={1640} y={200} label="people on board" dur={28} />}
      </g>);
      if (name === "classes" && f >= W("N19", 13)) svg = <g>{svg}<text x={960} y={1000} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={INK}>{""}</text></g>;
      break;
    }
    case "spedden": {
      const snap = W("N21", 4), film = S("N22");
      svg = (<g>
        {spedShot(f, clamp(1 - Math.abs(f - snap) / 5))}
        <Snapshot f={f} a={snap + 3} id="sp" render={(fr) => spedShot(fr, 0, false)} s={f >= film ? 0.5 : 0.62} x={f >= film ? 760 : 960} caption="Douglas Spedden · 10 April 1912 · photo: F. Browne" />
        {f >= W("N22", 4) && <g transform={`translate(1500 600) rotate(6) scale(${prog(f, W("N22", 4), W("N22", 4) + 7)})`}><circle r={210} fill="#fff7e6" stroke={INK} strokeWidth={8} /><g transform="translate(-40 -50) scale(0.9)"><FilmReel /></g><text x={0} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#c0473f">re-created</text><text x={0} y={166} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#c0473f">in 1997</text></g>}
      </g>);
      if (f < snap + 3) {
        html.push(<NameTag key="ds" f={f} a={W("N21", 9) - 30 < sc.a ? sc.a + 6 : sc.a + 6} dur={snap - sc.a - 4} x={1080} y={560} name="Douglas Spedden" role="age 6, first class" color="#3f7fbf" />);
      }
      break;
    }
    case "navratil": {
      const real = S("N24"), stamp = W("N24", 4);
      svg = <Deck f={f} camX={-200} zoom={f < real ? pz(1.15, 1.22) : 1.3} focusY={640} dim={f >= stamp ? 0.15 : 0} stage={<g>
        <Chibi spec={NAVRATIL} pose={{ ...idle(f, 3), look: 0.4, armR: 20, armL: 25, mouth: f >= real ? "flat" : "smile", eyes: f >= real ? "normal" : "happy" }} x={900} y={1020} size={500} />
        <Chibi spec={MICHEL} pose={{ ...walkP(f, true, 0.4), ...idle(f, 4), mouth: "grin", eyes: "happy", armR: 90 }} x={1180 + Math.sin(f * 0.04) * 120} y={1030} size={500} facing={Math.cos(f * 0.04) > 0 ? 1 : -1} />
        <Chibi spec={EDMOND} pose={{ ...idle(f, 5), mouth: "smile", armL: 30 + Math.sin(f * 0.3) * 20, look: -0.4 }} x={700} y={1030} size={500} />
      </g>} />;
      if (f < stamp) html.push(<NameTag key="hf" f={f} a={W("N23", 8)} dur={stamp - W("N23", 8)} x={760} y={290} name="“Mr. Hoffman”" role="2nd class, with two sons" color="#7b4a8c" />);
      else {
        html.push(<NameTag key="nv" f={f} a={W("N24", 6)} dur={sc.b - W("N24", 6) - 4} x={760} y={290} name="Michel Navratil" role="travelling under a false name" color="#c0473f" />);
        html.push(<NameTag key="mi" f={f} a={W("N24", 12)} dur={sc.b - W("N24", 12) - 4} x={1250} y={560} name="Michel, 3" role="son" color="#3f7fbf" />);
        html.push(<NameTag key="ed" f={f} a={W("N24", 12) + 6} dur={sc.b - W("N24", 12) - 10} x={540} y={600} name="Edmond, 2" role="son" color="#3f7fbf" />);
      }
      if (f >= stamp && f < stamp + 50) html.push(<div key="fn" style={{ position: "absolute", left: 1180, top: 200, transform: `rotate(-12deg) scale(${1 + Math.sin(clamp((f - stamp) / 6) * Math.PI) * 0.2})`, border: "10px solid #c0473f", borderRadius: 20, padding: "6px 26px", fontFamily: FONT, fontWeight: 900, fontSize: 72, color: "#c0473f", opacity: 1 - prog(f, stamp + 40, stamp + 50) }}>FALSE NAME</div>);
      break;
    }
    case "sage": {
      const fam = [JOHN_SAGE, ANNIE_SAGE, ...SAGE_KIDS];
      const t0 = W("N26", 4), strike = W("N26", 22);
      if (f < strike) {
        svg = (<g>
          <Cam z={pz(1, 1.06)} cy={600}>
            <Departure f={f} shipX={1180}>
              {fam.map((s, i) => { const a = t0 + i * 6; if (f < a) return null; const x = lerp(-80, 120 + i * 155, prog(f, a, a + 30)); return <g key={s.id}><Chibi spec={s} pose={{ ...walkP(f, f < a + 30, 0.4), ...idle(f, i), mouth: "smile", look: 0.4 }} x={x} y={1010} size={i < 2 ? 300 : 300} /><text x={x} y={720 + (i < 2 ? 0 : 60)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#ffd84a" stroke={INK} strokeWidth={7} paintOrder="stroke" opacity={prog(f, a + 20, a + 26)}>{i + 1}</text></g>; })}
            </Departure>
          </Cam>
        </g>);
        html.push(<NameTag key="sg" f={f} a={W("N26", 2)} dur={t0 + 30 - W("N26", 2)} x={960} y={300} name="The Sage family" role="3rd class · Peterborough, England" color="#3f7a5a" />);
      } else {
        svg = (<g>
          <rect x={0} y={0} width={1920} height={1080} fill="#cfe3ee" />
          <g transform={`translate(960 540) scale(${lerp(1, 1.1, prog(f, strike, sc.b))}) translate(-960 -540)`}>
          <g transform="translate(520 640) scale(0.7)"><Steamer f={f} kind="carpathia" /></g>
          <text x={520} y={780} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={INK}>SS Philadelphia</text>
          <g transform={`translate(520 300) rotate(-10) scale(${prog(f, strike, strike + 6)})`}><rect x={-260} y={-60} width={520} height={110} rx={16} fill="none" stroke="#c0473f" strokeWidth={12} /><text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#c0473f">COAL STRIKE</text></g>
          <path d={`M 860 600 L ${lerp(860, 1180, prog(f, W("N26", 30), W("N26", 33)))} 600`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
          {f >= W("N26", 33) && <path d="M 1150 570 L 1190 600 L 1150 630" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />}
          <g transform="translate(1500 640) scale(0.3)" opacity={prog(f, W("N26", 31), W("N26", 33))}><Titanic f={f} /></g>
          <text x={1500} y={760} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={INK} opacity={prog(f, W("N26", 31), W("N26", 33))}>Titanic</text>
          </g>
        </g>);
      }
      break;
    }
    case "remember": {
      svg = (<g>
        <Sunburst f={f} c1="#f6e2b6" c2="#efd39c" />
        <Badge f={f} a={sc.a + 2} x={420} y={460} sz={1.6} specs={[SPEDDEN_F, DOUGLAS]} label="the Speddens" />
        <Badge f={f} a={sc.a + 8} x={960} y={460} sz={1.6} specs={[MICHEL, NAVRATIL, EDMOND]} label="the Navratils" />
        <Badge f={f} a={sc.a + 14} x={1500} y={460} sz={1.6} specs={[ANNIE_SAGE, SAGE_KIDS[8], JOHN_SAGE]} label="the Sages" />
      </g>);
      break;
    }
    case "boiler": {
      const fire = (i: number) => ({ ...idle(f, i), armR: 40 + Math.max(0, Math.sin(f * 0.25 + i * 2)) * 80, look: 0.5, eyes: "squint" as const, mouth: "flat" as const });
      svg = (<g>
        <Cam z={f < S("N30") ? pz(1, 1.05) : f < S("F1") ? 1.18 : 1.35} cx={f >= S("F1") ? 700 : 960} cy={f >= S("F1") ? 640 : 540}>
          <BoilerRoom f={f}>
            {[0, 1, 2].map((i) => <Chibi key={i} spec={FIREMAN(i)} pose={{ ...fire(i), talk: i === 0 ? env("F1", f) : 0, mouth: i === 0 && f >= S("F1") ? "o" : "flat" }} x={330 + i * 630} y={1010} size={330} facing={i === 2 ? -1 : 1} />)}
            <g transform={`translate(${200 + ((f * 4) % 1600)} 1000)`}><path d="M -60 -20 L 60 -20 L 50 20 L -50 20 Z" fill="#3a3d4a" stroke={INK} strokeWidth={4} /><path d="M -50 -20 Q 0 -60 50 -20" fill="#141012" stroke={INK} strokeWidth={3} /><circle cx={-30} cy={28} r={12} fill="#6b6f7d" stroke={INK} strokeWidth={3} /></g>
            {Array.from({ length: 14 }, (_, i) => { const t = ((f * 2 + i * 9) % 40) / 40; return <circle key={i} cx={330 + (i % 3) * 630 + 80 - t * 120} cy={900 - Math.sin(t * Math.PI) * 160} r={8} fill="#141012" />; })}
          </BoilerRoom>
        </Cam>
        <Counter f={f} a={W("N29", 6)} to={29} x={420} y={220} label="boilers" dur={14} size={100} />
        <Counter f={f} a={W("N29", 9)} to={159} x={960} y={220} label="furnaces" dur={14} size={100} />
        <Counter f={f} a={W("N30", 10)} to={600} x={1500} y={220} label="tons of coal a day" dur={20} size={100} />
      </g>);
      html.push(<SpeechBubble key="f1" f={f} a={S("F1") - 2} b={sc.b} x={980} y={340} tx={760} ty={520} text="More coal!" width={360} color="#fff7d6" />);
      html.push(<Label key="lf" f={f} a={S("F1")} b={sc.b} x={980} y={360} text="playful" />);
      break;
    }
    case "radio": {
      const snap = W("N31", 10);
      svg = (<g>
        <Cam z={pz(1, 1.06)}>{radioShot(f)}</Cam>
        <Snapshot f={f} a={snap} id="rd" render={(fr) => radioShot(fr)} caption="The radio room · Harold Bride · photo: F. Browne" />
      </g>);
      if (f < snap) html.push(<NameTag key="hb" f={f} a={sc.a + 6} dur={snap - sc.a - 8} x={760} y={330} name="Harold Bride" role="Junior radio operator" color="#3f7fbf" />);
      break;
    }
    case "radio2": {
      svg = (<g>
        <Cam z={lerp(1.2, 1.45, prog(f, sc.a, sc.b))} cx={700} cy={600}>{radioShot(f)}</Cam>
        <rect x={0} y={0} width={1920} height={1080} fill="#0b1430" opacity={0.45} />
        <g transform={`translate(1500 300) scale(${prog(f, sc.a + 4, sc.a + 10)})`}><circle r={120} fill="#fff7e6" stroke={INK} strokeWidth={7} /><text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={86} fill="#c0473f">4</text><text x={0} y={-40} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={28} fill={INK}>DAYS</text></g>
      </g>);
      break;
    }
    case "cherbourg": {
      const astorS = S("N34") - 2, brownS = S("N35") - 2;
      if (f < astorS) {
        svg = <Cam z={pz(1, 1.1)} cy={640}><Harbor f={f} mode="cherbourg" shipX={1250} shipS={0.6}>
          <g transform={`translate(${lerp(200, 620, prog(f, sc.a, astorS))} 900) scale(0.55)`}><Tender f={f} name="NOMADIC" night /></g>
          <g transform={`translate(${lerp(-100, 300, prog(f, sc.a, astorS))} 960) scale(0.45)`}><Tender f={f + 20} name="TRAFFIC" night /></g>
        </Harbor></Cam>;
        html.push(<Stamp key="st" f={f} a={sc.a + 2} b={astorS - 2} text="Cherbourg, France" sub="10 April 1912, evening" />);
        html.push(<NameTag key="no" f={f} a={W("N33", 8)} dur={astorS - W("N33", 8) - 4} x={lerp(200, 620, prog(f, sc.a, astorS)) + 40} y={700} name="Nomadic" role="tender, 1st & 2nd class" color="#3f7fbf" />);
      } else {
        const rock = Math.sin(f * 0.12) * 3;
        const brownOn = f >= brownS;
        svg = (<g>
          <SeaSky f={f} mode="dawn" horizon={600} />
          <g transform="translate(1500 640) scale(0.4)"><Titanic f={f} smoke={false} lights={1} /></g>
          <g transform={`rotate(${rock} 960 900)`}>
            <rect x={-100} y={820} width={2120} height={300} fill="#c99a66" stroke={INK} strokeWidth={5} />
            {Array.from({ length: 22 }, (_, i) => <rect key={i} x={-60 + i * 100} y={700} width={10} height={130} fill="#f5f0e6" stroke={INK} strokeWidth={3} />)}
            <rect x={-100} y={690} width={2120} height={18} rx={8} fill="#f5f0e6" stroke={INK} strokeWidth={4} />
            {!brownOn ? (<g>
              <Chibi spec={ASTOR} pose={{ ...idle(f, 1), look: 0.3, mouth: "smile", armR: 30 }} x={760} y={1020} size={470} />
              <Chibi spec={MADELEINE} pose={{ ...idle(f, 2), look: -0.3, mouth: "smile" }} x={1140} y={1020} size={470} facing={-1} />
            </g>) : (
              <Chibi spec={BROWN} pose={{ ...idle(f, 3), sway: Math.sin(f * 0.9) * 1.5, look: 0.2, talk: env("B1", f), mouth: f >= S("B1") ? "o" : "flat", eyes: "squint", armL: -20, armR: -20 }} x={960} y={1020} size={500} />
            )}
          </g>
          {brownOn && Array.from({ length: 10 }, (_, i) => { const t = ((f + i * 11) % 50) / 50; return <circle key={i} cx={200 + ((i * 197) % 1500)} cy={200 + t * 700} r={5} fill="#fff" opacity={0.7 * (1 - t)} />; })}
        </g>);
        if (!brownOn) {
          html.push(<NameTag key="ja" f={f} a={W("N34", 3)} dur={brownS - W("N34", 3) - 4} x={760} y={430} name="John Jacob Astor" role="one of the richest men alive" color="#c0473f" />);
          html.push(<NameTag key="ma" f={f} a={W("N34", 14)} dur={brownS - W("N34", 14) - 4} x={1150} y={440} name="Madeleine Astor" role="expecting a baby" color="#7b4a8c" />);
        } else {
          html.push(<NameTag key="mb" f={f} a={brownS + 6} dur={S("B1") - brownS - 6} x={960} y={420} name="Margaret Brown" role="1st class · Denver" color="#7b4a8c" />);
          html.push(<SpeechBubble key="b1" f={f} a={S("B1") - 2} b={sc.b} x={1300} y={330} tx={1060} ty={460} text="All were chilled through." width={520} />);
          html.push(<Label key="lb" f={f} a={S("B1")} b={sc.b} x={1300} y={350} text="Margaret Brown's own words, 1912" />);
        }
      }
      break;
    }
    case "nomadic": {
      svg = (<g>
        <SeaSky f={f} mode="day" horizon={700} />
        <g transform={`translate(${lerp(820, 960, prog(f, sc.a, sc.b))} 800) scale(1.3)`}><Tender f={f} name="NOMADIC" /></g>
        <g transform="translate(960 800)"><WaterFront f={f} width={4000} color="#3f7fbf" /></g>
        <g transform={`translate(1480 330) rotate(-6) scale(${prog(f, W("N36", 7), W("N36", 7) + 7)})`}><rect x={-300} y={-80} width={600} height={160} rx={30} fill="#ffd84a" stroke={INK} strokeWidth={8} /><text x={0} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>STILL EXISTS</text><text x={0} y={50} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={30} fill={INK}>visit her in Belfast today</text></g>
      </g>);
      html.push(<div key="ft" style={{ position: "absolute", left: 1220, top: 470, fontFamily: FONT2, fontWeight: 700, fontSize: 22, color: INK, opacity: prog(f, W("N36", 7) + 6, W("N36", 7) + 12) }}>restored, on show in Hamilton Dock</div>);
      break;
    }
    case "dinner": {
      const offer = W("N37", 16), tele = S("N38"), write = W("N38", 14);
      const browneP: Pose = { ...idle(f, 1), look: f < tele ? 0.5 : 0.1, mouth: f >= offer ? "grin" : "smile", eyes: f >= offer && f < tele + 30 ? "happy" : "normal", talk: env("R1", f), write: f >= write ? 1 : 0, armR: f >= write ? -30 - Math.abs(Math.sin(f * 1.1)) * 12 : 10 };
      svg = (<g>
        <Cam z={f < tele ? pz(1, 1.06) : 1.25} cx={f < tele ? 960 : 700} cy={f < tele ? 540 : 640}>
          <Saloon f={f}>
            <Chibi spec={{ ...BROWNE_NC, prop: f >= write ? "notebook" : undefined }} pose={browneP} x={700} y={900} size={460} />
            <Chibi spec={RICH_M} pose={{ ...idle(f, 2), look: -0.5, mouth: "smile", armR: f >= offer && f < offer + 40 ? 110 : 20, talk: f >= offer - 20 && f < offer ? Math.abs(Math.sin(f * 0.6)) : 0 }} x={1220} y={900} size={460} facing={-1} />
            <Chibi spec={RICH_W} pose={{ ...idle(f, 3), look: -0.4, mouth: "smile", eyes: "happy" }} x={1520} y={900} size={440} facing={-1} />
          </Saloon>
        </Cam>
        {f >= offer && f < tele && (
          <g transform={`translate(${lerp(1220, 900, prog(f, offer, offer + 20))} ${lerp(500, 380, prog(f, offer, offer + 20))}) rotate(-6) scale(${prog(f, offer, offer + 8)})`}>
            <rect x={-230} y={-80} width={460} height={160} rx={16} fill="#f6e7c1" stroke={INK} strokeWidth={6} />
            <text x={0} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#7b2f2a">TICKET</text>
            <text x={0} y={42} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={34} fill={INK}>→ New York</text>
          </g>
        )}
        {f >= offer && f < tele && <Sparkles f={f} x={1000} y={420} spread={260} n={8} seed={9} />}
      </g>);
      html.push(<NameTag key="cp" f={f} a={W("N37", 6)} dur={offer - W("N37", 6)} x={1360} y={360} name="A wealthy American couple" role="Browne's table companions" color="#3f7a5a" />);
      html.push(<SpeechBubble key="r1" f={f} a={S("R1") - 2} b={sc.b} x={1100} y={330} tx={820} ty={470} text="May I stay on board, all the way to New York?" width={600} />);
      html.push(<Label key="lr" f={f} a={S("R1")} b={sc.b} x={1100} y={350} text="playful" />);
      break;
    }
    case "queens": {
      const anchor = S("N39"), em = S("N40"), ans = S("N41");
      if (f < ans) {
        const emig = Array.from({ length: 8 }, (_, i) => EMIGRANT(i));
        svg = (<g>
          <Cam z={f < em ? pz(1, 1.05) : 1.25} cx={f < em ? 960 : 760} cy={f < em ? 560 : 720}>
            <Harbor f={f} mode="queenstown" shipX={1250} shipS={0.62}>
              <g transform="translate(560 900) scale(0.85)"><Tender f={f} name="AMERICA" /></g>
              {f >= em && emig.map((s, i) => <Chibi key={i} spec={s} pose={{ ...idle(f, i), mouth: "smile", look: 0.5, armR: i % 3 === 0 ? 150 + Math.sin(f * 0.4 + i) * 15 : 10 }} x={430 + i * 38} y={860 - (i % 2) * 10} size={150} />)}
            </Harbor>
          </Cam>
          {f >= em && <Counter f={f} a={W("N40", 1)} to={120} x={1400} y={300} label="came on board" dur={24} />}
        </g>);
        html.push(<Stamp key="st" f={f} a={anchor + 2} b={em - 2} text="Queenstown (Cobh), Ireland" sub="11 April 1912, 11:30 a.m." />);
      } else {
        svg = (<g>
          <Deck f={f} camX={100} zoom={1.25} focusY={640} stage={<Chibi spec={BROWNE_NC} pose={{ ...idle(f, 1), armR: 110, look: 0.4, eyes: f >= S("T2") ? "wide" : "normal", brow: f >= S("T2") ? 1 : 0, mouth: f >= S("T2") ? "o" : "smile" }} x={960} y={1030} size={520} />} />
          <BigTelegram f={f} a={S("T2") - 10} b={sc.b} stamp={S("T2")} />
        </g>);
        html.push(<Label key="lb" f={f} a={S("T2") + 4} b={sc.b} x={960} y={900} text="telegram text as reported" />);
        hideCaps = f >= S("T2") - 10;
      }
      break;
    }
    case "leave": {
      const snap = W("N42", 18);
      const lv = prog(f, W("N42", 14), sc.b + 20);
      svg = (<g>
        <Cam z={pz(1.05, 1.12)} cx={760} cy={640}>{leaveShot(f, lv, clamp(1 - Math.abs(f - snap) / 5))}</Cam>
        <Snapshot f={f} a={snap + 3} id="lv" render={(fr) => <Harbor f={fr} mode="queenstown" shipX={1000} shipS={0.55} leave={lv} />} caption="Titanic leaves Queenstown · 11 April 1912" />
      </g>);
      break;
    }
    case "leave2": {
      svg = (<g>
        <Sunburst f={f} c1="#f6e2b6" c2="#efd39c" />
        <g transform={`translate(960 ${520 - prog(f, sc.a, sc.b) * 40}) rotate(${-4 + Math.sin(f * 0.1) * 2}) scale(${prog(f, sc.a, sc.a + 8) * lerp(0.9, 1.02, prog(f, sc.a, sc.b))})`}>
          <rect x={-420} y={-180} width={840} height={360} rx={12} fill="#fbf4e4" stroke={INK} strokeWidth={8} />
          <path d="M -420 0 L 420 0" stroke="#d9cdb3" strokeWidth={6} />
          <text x={0} y={-50} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={62} fill="#c0473f">GET OFF THAT SHIP</text>
          <text x={0} y={90} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={34} fill="#6b4a36">kept for the rest of his life (reportedly)</text>
        </g>
      </g>);
      break;
    }
    case "trunk": {
      const trunkT = W("N44", 8);
      if (f < trunkT) {
        svg = (<g>
          <rect x={0} y={0} width={1920} height={1080} fill="#efe4cf" />
          <g transform={`translate(960 ${540 - prog(f, sc.a, trunkT) * 30}) rotate(${-3 + prog(f, sc.a, trunkT) * 2}) scale(${prog(f, sc.a, sc.a + 8) * lerp(1, 1.08, prog(f, sc.a, trunkT))})`}>
            <rect x={-560} y={-380} width={1120} height={760} fill="#f7f1e3" stroke={INK} strokeWidth={8} />
            <text x={0} y={-270} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={84} fill={INK}>THE DAILY NEWS · 1912</text>
            <path d="M -500 -230 L 500 -230" stroke={INK} strokeWidth={6} />
            <text x={0} y={-150} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={60} fill={INK}>LIFE ON BOARD TITANIC</text>
            {[[-260, 60], [260, 60]].map(([x, y], i) => <g key={i}><rect x={x - 220} y={y - 150} width={440} height={300} fill="#b99d78" stroke={INK} strokeWidth={5} /><path d={`M ${x - 200} ${y + 130} L ${x - 60} ${y} L ${x + 40} ${y + 80} L ${x + 200} ${y - 60} L ${x + 200} ${y + 130} Z`} fill="#8a7255" /></g>)}
            <text x={0} y={300} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={36} fill="#4a3a30">photographs by Francis Browne</text>
          </g>
        </g>);
      } else {
        svg = <Trunk f={f} open={prog(f, W("N44", 22), W("N44", 26))} count={f >= W("N44", 30) ? 42000 * prog(f, W("N44", 30), W("N44", 34) + 10) : 0} />;
        html.push(<Stamp key="st" f={f} a={W("N44", 18)} b={sc.b} text="Jesuit archives, Dublin" sub="mid-1980s" />);
      }
      break;
    }
    case "west": {
      const items: [Spec[], string, number][] = [[[SPEDDEN_F, DOUGLAS], "the Speddens", W("N45", 4)], [[MICHEL, EDMOND], "Navratil boys", W("N45", 6)], [[ANNIE_SAGE, JOHN_SAGE], "the Sages", W("N45", 9)], [[FIREMAN(0), FIREMAN(1)], "the firemen", W("N45", 12)], [[BRIDE], "radio room", W("N45", 14)]];
      const andrewsT = W("N45", 17);
      svg = (<g>
        <SeaSky f={f} mode="dawn" horizon={760} />
        <g transform={`translate(${lerp(500, 1300, prog(f, sc.a, sc.b))} 900) scale(0.5)`}><Titanic f={f} /></g>
        <g transform="translate(0 900)"><WaterFront f={f} width={4000} color="#5a6f9e" /></g>
        {f < andrewsT ? items.map(([sp, l, t], i) => <Badge key={l} f={f} a={t} x={250 + i * 355} y={330} specs={sp} label={l} sz={1.2} />) : (
          <g transform={`translate(960 1000) scale(${prog(f, andrewsT, andrewsT + 8)}) translate(-960 -1000)`}><Chibi spec={ANDREWS_NB} pose={{ ...idle(f, 2), write: 1, armL: -20, armR: -30 - Math.abs(Math.sin(f * 1.1)) * 12, look: 0.2, mouth: "smile", eyes: "happy" }} x={960} y={1000} size={560} /></g>
        )}
      </g>);
      if (f >= andrewsT) html.push(<NameTag key="an" f={f} a={andrewsT + 6} dur={sc.b - andrewsT - 8} x={960} y={330} name="Thomas Andrews" role="making notes of improvements" color="#3f7fbf" />);
      break;
    }
    case "next": {
      svg = (<g>
        <SeaSky f={f} mode="night" horizon={760} />
        <g transform={`translate(${lerp(700, 960, prog(f, sc.a, sc.b))} 900) scale(0.5)`}><Titanic f={f} night /></g>
        <g transform="translate(0 900)"><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g>
        {[0, 1, 2].map((i) => { const t = ((f - sc.a + i * 20) % 60) / 60; return <g key={i} transform={`translate(${1500 - t * 900} ${200 + i * 110 + Math.sin(t * 6) * 20}) rotate(${-10 + t * 20})`} opacity={prog(f, W("N46", 8), W("N46", 10)) * (1 - t)}><rect x={-120} y={-40} width={240} height={80} rx={6} fill="#fbf4e4" stroke={INK} strokeWidth={4} /><text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#7b2f2a">ICE!</text></g>; })}
        <g transform={`translate(700 300) scale(${prog(f, sc.a, sc.a + 8)})`}>
          <rect x={-520} y={-100} width={1040} height={200} rx={30} fill="#ffd84a" stroke={INK} strokeWidth={8} />
          <text x={0} y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>NEXT · EPISODE 2</text>
          <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK}>FOUR DAYS AT SEA</text>
        </g>
      </g>);
      break;
    }
    case "final": {
      const all = [BROWNE, DOUGLAS, NAVRATIL, ANNIE_SAGE, FIREMAN(0), BRIDE, BROWN, ANDREWS];
      svg = (<g>
        <Sunburst f={f} c1="#ffe7a6" c2="#ffd77a" />
        {all.map((s, i) => <Chibi key={s.id + i} spec={s} pose={{ armR: s.prop === "camera" ? -26 : 150 + Math.sin(f * 0.45 + i) * 14, armL: s.prop === "camera" ? -30 : 0, mouth: "grin", eyes: i % 2 ? "happy" : "normal", breathe: Math.sin(f / 15 + i), head: Math.sin(f * 0.1 + i) * 3 }} x={200 + i * 217} y={1000} size={340} facing={i > 3 ? -1 : 1} />)}
        <g transform={`translate(960 250) scale(${prog(f, sc.a, sc.a + 8)})`}>
          <path d="M -400 -90 Q -400 -140 -350 -140 L 350 -140 Q 400 -140 400 -90 L 400 60 Q 400 110 350 110 L -60 110 L -120 170 L -120 110 L -350 110 Q -400 110 -400 60 Z" fill="#fff" stroke={INK} strokeWidth={8} />
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>Who will you follow</text>
          <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>into Episode 2?</text>
        </g>
        {f >= W("N47", 14) && <g transform={`translate(1600 560) scale(${prog(f, W("N47", 14), W("N47", 14) + 7) * (1 + Math.sin(f * 0.3) * 0.04)})`}><rect x={-170} y={-50} width={340} height={100} rx={20} fill="#e5302a" stroke={INK} strokeWidth={6} /><text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff">SUBSCRIBE</text></g>}
      </g>);
      break;
    }
  }

  return (
    <AbsoluteFill style={{ background: "#0b1430" }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>{svg}</svg>
      {html}
      <Captions f={f} hide={hideCaps} />
      <Watermark />
      {!noAudio && <Audio src={staticFile("ep1_mix.wav")} />}
    </AbsoluteFill>
  );
};
