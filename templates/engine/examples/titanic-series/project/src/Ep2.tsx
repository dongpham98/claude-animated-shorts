// Titanic: The Real Story — Episode 2 "Four days at sea" (1920x1080, 30 fps). Style upgrade: lit grade, depth props,
// object inserts, one protagonist (Jack Phillips) + one clock (the ice warnings), "You see" mechanisms, callback ending.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps } from "remotion";
import TL from "./ep2_timeline.json";
import { Chibi, Pose, Spec } from "./chibi";
import { SMITH, ANDREWS_NB, FLEET, LEE, PHILLIPS, EVANS } from "./cast";
import { SPEDDEN_F, DOUGLAS, NAVRATIL, MICHEL, EDMOND, JOHN_SAGE, ANNIE_SAGE, SAGE_KIDS, ASTOR, MADELEINE, BRIDE, FIREMAN, RICH_M, RICH_W, EMIGRANT, WORKER } from "./cast1";
import { ISMAY, LIGHTOLLER, CARTER, DAISY, BARRETT, BEESLEY } from "./cast2";
import { PAL, prog, lerp, clamp, INK } from "./style";
import { Sunburst, Sparkles, SpeechBubble, NameTag, ShockLines } from "./fx";
import { Titanic, SeaSky, WaterFront, Iceberg } from "./ship";
import { Cam, NightSea, RadioRoom, CrowsNest, Bunk, Bridge } from "./scenes";
import { Deck } from "./deck";
import { BoilerRoom, Saloon } from "./ep1sets";
import { Gym, GeneralRoom, SmokingRoom, Saloon2, WirelessMech, Dog, Bear } from "./ep2sets";
import { useFonts, FONT, FONT2 } from "./vshort";
import { L, Grade, Fg, Rays, Captions, Watermark, Stamp, Label, Chapter, Card, Marconigram, WarnBoard, Clock, Thermo, Menu, RunBoard, AtlMap } from "./kit16";

export const EP2_FRAMES = TL.total;
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
const scene = (f: number) => TL.scenes.find((s) => f >= s.a && f < s.b) ?? TL.scenes[TL.scenes.length - 1];
const OFFICER: Spec = { ...LIGHTOLLER, id: "officer2", name: "", hair: PAL.hairDark };
const QM: Spec = { ...WORKER(1), id: "qm", name: "" };

// warning arrival times (frame) and the slips' real text (shortened faithfully)
const WT = () => [W("N34", 2), W("N35", 3), W("N37", 2), W("N40", 2), W("N46", 3), W("N48", 3)];

const Slip: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}><rect x={-40} y={-26} width={80} height={52} rx={4} fill="#f6f0e2" stroke={INK} strokeWidth={4} /><path d="M -28 -8 L 24 -8 M -28 6 L 14 6" stroke="#9aa6b8" strokeWidth={4} /></g>
);
const Cake: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-200} y={-40} width={400} height={160} rx={24} fill="#f6d6e0" stroke={INK} strokeWidth={7} />
    <path d="M -200 0 Q -150 40 -100 0 Q -50 40 0 0 Q 50 40 100 0 Q 150 40 200 0" fill="#fff" stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={130} rx={260} ry={30} fill="#e9dcc0" stroke={INK} strokeWidth={6} />
    {[-100, 0, 100].map((x, i) => <g key={x}><rect x={x - 10} y={-110} width={20} height={70} fill={["#7fb3e8", "#ffd84a", "#c0473f"][i]} stroke={INK} strokeWidth={4} /><path d={`M ${x} -112 q ${-10 + Math.sin(f * 0.6 + i) * 4} -24 0 -40 q 10 16 0 40`} fill="#ffb24a" /></g>)}
    <text y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill="#c0473f">25</text>
  </g>
);
const QuoteCard: React.FC<{ text: string[]; src: string }> = ({ text, src }) => (
  <g>
    <rect x={-560} y={-200} width={1120} height={400} rx={24} fill="#fbf4e4" stroke={INK} strokeWidth={8} />
    <text x={-500} y={-110} fontFamily="Georgia, serif" fontWeight={700} fontSize={120} fill="#d9cdb3">“</text>
    {text.map((t, i) => <text key={i} y={-30 + i * 76} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={60} fill={INK}>{t}</text>)}
    <text y={160} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={28} fill="#7b2f2a">{src}</text>
  </g>
);
/** "You see" #2: why a flat calm with no moon hides an iceberg */
const CalmMech: React.FC<{ f: number; a: number; noMoon: number; dark: number }> = ({ f, a, noMoon, dark }) => (
  <g>
    {[0, 1].map((side) => {
      const ox = side * 960, calm = side === 1, wav = (x: number) => (calm ? 0 : Math.sin(x * 0.03 + f * 0.15) * 14);
      const pts = Array.from({ length: 33 }, (_, i) => `${ox + i * 30},${640 + wav(i * 30)}`).join(" ");
      const moon = !calm || noMoon < 1;
      return (
        <g key={side}>
          <rect x={ox} y={0} width={960} height={1080} fill={calm ? "#05081a" : "#0b1430"} />
          {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={ox + ((i * 97) % 940) + 10} cy={((i * 53) % 520) + 20} r={2 + (i % 3)} fill="#fff" opacity={0.6} />)}
          {moon && <g opacity={calm ? 1 - noMoon : 1}><circle cx={ox + 760} cy={160} r={60} fill="#f3f0dc" /><circle cx={ox + 760} cy={160} r={120} fill="#f3f0dc" opacity={0.15} /></g>}
          <polygon points={`${ox},1080 ${pts} ${ox + 960},1080`} fill={calm ? "#070b1c" : "#13204a"} />
          <g transform={`translate(${ox + 480} 650)`} opacity={calm ? lerp(1, 0.25, dark) : 1}>
            <path d="M -200 0 L -150 -130 L -80 -180 L -40 -280 L 30 -220 L 80 -250 L 140 -140 L 210 -60 L 240 0 Z" fill={calm ? "#1d2440" : "#dfeaf5"} stroke={calm ? "#2a3150" : INK} strokeWidth={6} />
            {!calm && Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={-220 + i * 58} cy={6 + Math.sin(f * 0.3 + i) * 4} rx={34} ry={10} fill="#fff" opacity={0.9} />)}
          </g>
          <g transform={`translate(${ox + 480} 900)`}><rect x={-330} y={-50} width={660} height={92} rx={46} fill={calm ? "#ff8a7a" : "#7fd08a"} stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={INK}>{calm ? "FLAT CALM, NO MOON" : "WAVES + MOONLIGHT"}</text></g>
          {!calm && f >= a + 40 && <g transform={`translate(${ox + 480} 420)`} opacity={prog(f, a + 40, a + 48)}><text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">white foam shows the berg</text></g>}
        </g>
      );
    })}
    <rect x={954} y={0} width={12} height={1080} fill={INK} />
  </g>
);
const Bulkhead: React.FC<{ f: number; a: number }> = ({ f, a }) => {
  const w = prog(f, a, a + 30);
  return (
    <g>
      <rect x={-420} y={-300} width={840} height={600} rx={20} fill="#2b2c35" stroke={INK} strokeWidth={8} />
      <path d={`M -200 -260 Q ${-200 + w * 70} -60 -200 0 Q ${-200 - w * 70} 140 -200 260`} fill="none" stroke="#8a8e9c" strokeWidth={30} />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-200 + (i % 2 ? w * 40 : -w * 30)} cy={-220 + i * 90} r={12} fill="#55535a" stroke={INK} strokeWidth={3} />)}
      <rect x={-140} y={-240} width={420} height={480} fill="#1a1214" stroke={INK} strokeWidth={5} />
      <ellipse cx={70} cy={150} rx={160} ry={70} fill="#ff6a1f" opacity={0.25 + 0.15 * Math.sin(f * 0.4)} />
      <text x={70} y={-180} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fbf4e4">EMPTIED BUNKER</text>
      <text x={-200} y={340} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#fbf4e4" stroke={INK} strokeWidth={6} paintOrder="stroke">steel wall (bulkhead)</text>
    </g>
  );
};
const SpeedBars: React.FC<{ f: number; a: number }> = ({ f, a }) => (
  <g>
    <rect x={-640} y={-260} width={1280} height={520} rx={26} fill="#fbf4e4" stroke={INK} strokeWidth={8} />
    <text y={-180} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={INK}>TOP SPEED</text>
    {[["Titanic", 0.82, "#26232a", -70], ["Mauretania (record holder)", 1, "#c0473f", 90]].map(([n, v, c, y]) => (
      <g key={String(n)} transform={`translate(-560 ${y})`}>
        <text y={-24} fontFamily={FONT2} fontWeight={700} fontSize={36} fill={INK}>{n}</text>
        <rect y={0} width={1120 * (v as number) * prog(f, a + (y as number > 0 ? 12 : 0), a + 30)} height={60} rx={30} fill={c as string} stroke={INK} strokeWidth={5} />
      </g>
    ))}
  </g>
);
const Transformer: React.FC<{ f: number; fixed: boolean }> = ({ f, fixed }) => (
  <g>
    <rect x={-360} y={-260} width={720} height={520} rx={24} fill="#3a3d4a" stroke={INK} strokeWidth={8} />
    <text y={-190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill="#e9e3d2">TRANSFORMER</text>
    {[-130, 130].map((x) => <g key={x}><rect x={x - 90} y={-120} width={180} height={260} rx={20} fill="#7b4a2c" stroke={INK} strokeWidth={6} />{Array.from({ length: 8 }, (_, i) => <line key={i} x1={x - 90} x2={x + 90} y1={-100 + i * 30} y2={-100 + i * 30} stroke="#c99a66" strokeWidth={8} />)}</g>)}
    {!fixed && f % 12 < 6 && <path d="M -30 -20 L 0 20 L -10 20 L 20 70" stroke="#ffe066" strokeWidth={10} fill="none" />}
    <g transform="translate(0 210)"><rect x={-130} y={-36} width={260} height={66} rx={33} fill={fixed ? "#7fd08a" : "#ff8a7a"} stroke={INK} strokeWidth={5} /><text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={INK}>{fixed ? "FIXED" : "FAULT"}</text></g>
  </g>
);
const Book: React.FC = () => (
  <g>
    <rect x={-260} y={-330} width={520} height={660} rx={14} fill="#7b2f3a" stroke={INK} strokeWidth={8} />
    <rect x={-220} y={-290} width={440} height={580} rx={10} fill="#fbf4e4" stroke={INK} strokeWidth={5} />
    <text y={-190} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={64} fill={INK}>“My Story”</text>
    <text y={-130} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={34} fill="#6b4a36">by Polar the bear</text>
    <Bear x={0} y={60} s={1.9} />
    <text y={250} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={30} fill="#7b2f2a">written by Daisy Spedden, 1913</text>
  </g>
);

export const Ep2: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFonts();
  if (!ok) return null;
  const noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  const sc = scene(f), name = sc.name;
  const pz = (z0: number, z1: number) => lerp(z0, z1, prog(f, sc.a, sc.b));
  let svg: React.ReactNode = null; const over: React.ReactNode[] = [], top: React.ReactNode[] = [], html: React.ReactNode[] = [];
  let hideCaps = false, board = -1;
  const wt = WT();
  const grade = (id: string, tint: string, pools: { x: number; y: number; r: number; c: string; a?: number; flicker?: number }[] = [], vig = 0.5) => over.push(<Grade key={`g${id}`} f={f} id={id} tint={tint} pools={pools} vig={vig} />);
  const deckShot = (stage: React.ReactNode, camX = 0, zoom = 1.15, focusY = 640) => <Deck f={f} camX={camX} zoom={zoom} focusY={focusY} stage={stage} />;
  const handOff = (t0: number, done = false) => { // Smith hands the Baltic slip to Ismay
    const p = done ? 1 : prog(f, t0, t0 + 24);
    return <g>
      <Chibi spec={SMITH} pose={{ ...idle(f, 1), armR: lerp(20, 70, p) * (p < 1 ? 1 : 0.6), look: -0.4, mouth: "flat" }} x={1180} y={1030} size={560} facing={-1} />
      <Chibi spec={ISMAY} pose={{ ...idle(f, 2), armR: p > 0.6 ? 60 : 15, look: 0.4, mouth: "flat" }} x={760} y={1030} size={570} />
      <Slip x={lerp(1080, 880, p)} y={lerp(790, 780, p)} s={1.2} rot={lerp(-10, 8, p)} />
    </g>;
  };
  const radio = (spec: Spec, pose: Pose, pile: number, clock = "", flash = 0, who: "titanic" | "californian" = "titanic") => <RadioRoom f={f} spec={spec} pose={{ blink: blinkAt(f, 60, 4), ...pose }} pile={pile} clock={clock} flash={flash} who={who} />;
  const tapping: Pose = { write: 1, armL: -38, armR: -30 - Math.abs(Math.sin(f * 1.1)) * 14, look: Math.sin(f * 0.2) * 0.3, mouth: "flat" };

  switch (name) {
    // ------------------------------------------------------------ cold open
    case "cold": {
      const hand = W("N01", 19), card = S("N02");
      svg = <Cam z={pz(1.05, 1.18)} cx={980} cy={600}>{deckShot(handOff(hand))}</Cam>;
      grade("cold", "warm", [{ x: 400, y: 200, r: 900, c: "#fff1c4", a: 0.45 }]);
      over.push(<Fg key="fg" kind="rail" f={f} />, <Rays key="r" f={f} x={500} y={-80} ang={20} />);
      html.push(<Stamp key="st" f={f} a={4} b={W("N01", 16)} text="Sunday, 14 April 1912" sub="early afternoon" />);
      html.push(<NameTag key="sm" f={f} a={W("N01", 16)} dur={60} x={1180} y={420} name="Captain Edward Smith" role="Titanic" color="#22304f" />);
      html.push(<NameTag key="is" f={f} a={W("N01", 25)} dur={card - W("N01", 25) + 10} x={760} y={420} name="J. Bruce Ismay" role="chairman, White Star Line" color="#7b2f3a" />);
      top.push(<Card key="m" f={f} a={card} b={sc.b + 2} y={520} rot={-2}><Marconigram f={f} from="S.S. Baltic" to="Captain Smith, Titanic" time="14 April 1912 · 1:42 p.m." prefix="MSG" lines={["GREEK STEAMER ATHENAI REPORTS", "PASSING ICEBERGS AND LARGE", "QUANTITIES OF FIELD ICE TODAY..."]} typed={prog(f, card + 6, sc.b - 20)} /></Card>);
      if (f >= card + 10) html.push(<Label key="lb" f={f} a={card + 10} b={sc.b} x={960} y={860} text="real message, shortened" />);
      break;
    }
    case "cold2": {
      const pocket = W("N03", 5), hrs = S("N04");
      const pk = prog(f, pocket, pocket + 14);
      svg = <Cam z={pz(1.5, 1.65)} cx={760} cy={700}>{deckShot(<g>
        <Chibi spec={ISMAY} pose={{ ...idle(f, 2), armR: lerp(60, 10, pk), look: f < pocket ? -0.1 : 0.4, eyes: f < pocket ? "squint" : "normal", mouth: "flat" }} x={760} y={1030} size={570} />
        {pk < 1 && <Slip x={lerp(840, 790, pk)} y={lerp(770, 900, pk)} s={lerp(1.3, 0.4, pk)} rot={8} />}
      </g>, 0, 1.15)}</Cam>;
      grade("c2", "warm", [{ x: 760, y: 300, r: 600, c: "#fff1c4", a: 0.4 }], 0.6);
      if (f >= hrs) top.push(<g key="ck" transform={`translate(1500 470) scale(${prog(f, hrs, hrs + 8) * 1.1})`}><Clock f={f} h={1} m={42} spin={0.9} label="5+ HOURS" /></g>);
      break;
    }
    case "cold3": {
      board = 0;
      svg = <Cam z={pz(1, 1.12)} cy={600}><NightSea f={f} shipX={lerp(500, 900, prog(f, sc.a, sc.b))} /></Cam>;
      grade("c3", "night", [], 0.7);
      const n = f >= W("N05", 4) ? Math.min(6, Math.floor((f - W("N05", 4)) / 5) + 1) : 0;
      top.push(<g key="wb" opacity={prog(f, sc.a, sc.a + 8)}><WarnBoard f={f} n={n} times={[0, 1, 2, 3, 4, 5].map((i) => W("N05", 4) + i * 5)} big={1} /></g>);
      break;
    }
    case "title": {
      hideCaps = true;
      const p = prog(f, sc.a, sc.a + 8), bob = Math.sin(f * 0.08) * 6;
      svg = (<g>
        <SeaSky f={f} mode="dawn" horizon={760} />
        <g transform={`translate(${lerp(1200, 800, prog(f, sc.a, sc.b))} ${880 + bob}) scale(-0.62 0.62)`}><Titanic f={f} /></g>
        <g transform="translate(0 880)"><WaterFront f={f} width={4000} color="#5a6f9e" /></g>
        <g transform={`translate(960 ${300 - (1 - p) * 60}) scale(${0.8 + 0.2 * p})`} opacity={p}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={128} fill="#fff4dc" stroke={INK} strokeWidth={15} paintOrder="stroke" letterSpacing={4}>TITANIC: THE REAL STORY</text>
          <g transform="translate(0 100) rotate(-2)" opacity={prog(f, sc.a + 8, sc.a + 14)}>
            <rect x={-460} y={-58} width={920} height={88} rx={44} fill="#ffd84a" stroke={INK} strokeWidth={7} />
            <text x={0} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={INK}>EPISODE 2 · FOUR DAYS AT SEA</text>
          </g>
        </g>
        <Sparkles f={f} x={960} y={300} spread={560} n={10} seed={6} />
      </g>);
      grade("tt", "dawn", [{ x: 1500, y: 700, r: 700, c: "#ffd2a0", a: 0.5 }], 0.45);
      break;
    }
    // ------------------------------------------------------------ Thursday: the radio room
    case "leave": {
      const mapT = W("N06", 13);
      if (f < mapT) {
        svg = (<g><SeaSky f={f} mode="day" horizon={700} />
          <path d={`M ${1500 + (f - sc.a) * 0.8} 700 L ${1700 + (f - sc.a) * 0.8} 620 L ${2000} 640 L 2000 700 Z`} fill="#7fae7a" stroke={INK} strokeWidth={3} />
          <g transform={`translate(${lerp(1100, 700, prog(f, sc.a, mapT))} 760) scale(-0.55 0.55)`}><Titanic f={f} /></g>
          <g transform="translate(0 760)"><WaterFront f={f} width={4000} color="#3f7fbf" /></g></g>);
        grade("lv", "warm", [{ x: 1600, y: 200, r: 800, c: "#fff1c4", a: 0.5 }], 0.45);
        over.push(<Fg key="fg" kind="rope" f={f} side={-1} />);
        html.push(<Stamp key="st" f={f} a={sc.a + 4} b={mapT - 2} text="Thursday, 11 April 1912" sub="leaving Ireland" />);
      } else {
        svg = <Cam z={pz(1, 1.06)}><AtlMap f={f} ship={lerp(0.02, 0.12, prog(f, mapT, sc.b))} /></Cam>;
        grade("lv2", "none", [], 0.35);
        top.push(<g key="na" transform={`translate(560 360) scale(${prog(f, W("N06", 16), W("N06", 16) + 8)})`}><rect x={-230} y={-50} width={460} height={92} rx={46} fill="#ffd84a" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>NEXT LAND: AMERICA</text></g>);
      }
      break;
    }
    case "radio": {
      const bride = S("N09") - 4, cake = W("N08", 9);
      if (f < bride) {
        svg = <Cam z={f < S("N08") ? pz(1, 1.06) : 1.2} cx={f < S("N08") ? 960 : 820} cy={f < S("N08") ? 540 : 640}>{radio(PHILLIPS, { ...tapping, mouth: f >= S("P1") ? "grin" : "flat", talk: env("P1", f), eyes: f >= S("P1") ? "happy" : "normal", write: f >= S("P1") ? 0 : 1 }, 0.15)}</Cam>;
        html.push(<NameTag key="ph" f={f} a={S("N08") + 2} dur={cake - S("N08") - 2} x={760} y={330} name="Jack Phillips" role="senior wireless operator, Marconi Co." color="#2c3a5e" />);
        top.push(<Card key="ck" f={f} a={cake} b={S("P1") - 2} x={1420} y={520} rot={4} s={0.9} dim={0.25}><Cake f={f} /></Card>);
        html.push(<SpeechBubble key="p1" f={f} a={S("P1") - 2} b={bride} x={1180} y={330} tx={860} ty={470} text="Happy birthday to me. Now, back to work!" width={560} />);
        html.push(<Label key="l1" f={f} a={S("P1")} b={bride} x={1180} y={350} text="playful" />);
      } else {
        svg = <Cam z={1.18} cx={820} cy={640}>{radio(BRIDE, { ...tapping, write: 0, armR: 10, armL: 10, mouth: "smile", eyes: "happy" }, 0.15)}</Cam>;
        html.push(<NameTag key="br" f={f} a={bride + 6} dur={sc.b - bride - 8} x={760} y={330} name="Harold Bride" role="junior wireless operator, 22" color="#2c3a5e" />);
      }
      grade("rd", "lamp", [{ x: 560, y: 300, r: 500, c: "#ffd27a", a: 0.55, flicker: 0.12 }, { x: 1500, y: 200, r: 500, c: "#fff1c4", a: 0.3 }], 0.55);
      over.push(<Fg key="fg" kind="wires" f={f} />);
      break;
    }
    case "mech": case "mech2": {
      const a = S("N11");
      svg = <Cam z={pz(1, 1.05)}><WirelessMech f={f} a={a} jam={name === "mech2" ? prog(f, W("N12", 11), W("N12", 14)) : 0} /></Cam>;
      if (name === "mech" && f < a) svg = <Cam z={1.15} cx={820} cy={640}>{radio(PHILLIPS, tapping, 0.2)}</Cam>;
      if (name === "mech" && f < a) top.push(<g key="mc" transform={`translate(1400 320) scale(${prog(f, W("N10", 7), W("N10", 7) + 8)})`}><rect x={-260} y={-60} width={520} height={110} rx={20} fill="#2c3a5e" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill="#fff">MARCONI CO.</text></g>);
      grade("mc", f < a ? "lamp" : "none", [], 0.35);
      if (f >= a) html.push(<Stamp key="ys" f={f} a={a} b={W("N11", 12)} text="You see..." />);
      break;
    }
    case "money": case "money2": {
      const price = W("N14", 10), wage = W("N14", 17);
      svg = <Cam z={name === "money2" ? pz(1.1, 1.0) : 1.12} cx={900} cy={600}>{radio(PHILLIPS, tapping, name === "money2" ? lerp(0.2, 0.5, prog(f, sc.a, sc.b)) : 0.2, "")}</Cam>;
      grade("mn", "lamp", [{ x: 560, y: 300, r: 500, c: "#ffd27a", a: 0.5, flicker: 0.12 }], 0.55);
      if (name === "money") {
        top.push(<Card key="pm" f={f} a={W("N14", 4)} b={sc.b + 2} x={700} y={500} rot={-3} s={0.8} dim={0.35}><Marconigram f={f} from="a passenger, Titanic" to="New York" time="example message" lines={["FINE SHIP. ALL WELL.", "SEE YOU WEDNESDAY."]} typed={prog(f, W("N14", 4) + 8, price)} /></Card>);
        if (f >= price) top.push(<g key="pr" transform={`translate(1480 420) rotate(4) scale(${prog(f, price, price + 7)})`}><rect x={-260} y={-120} width={520} height={240} rx={28} fill="#ffd84a" stroke={INK} strokeWidth={8} /><text y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={INK}>12s 6d</text><text y={70} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={40} fill={INK}>for 10 words</text></g>);
        if (f >= wage) top.push(<g key="wg" transform={`translate(1480 760) scale(${prog(f, wage, wage + 7)})`}><rect x={-300} y={-60} width={600} height={110} rx={55} fill="#fff7e6" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>≈ ½ week's pay (sailor)</text></g>);
      } else top.push(<g key="ck" transform="translate(1560 280) scale(0.7)"><Clock f={f} h={11} m={0} spin={2} label="DAY + NIGHT" /></g>);
      break;
    }
    // ------------------------------------------------------------ life on board
    case "ch_life": hideCaps = true; svg = <Chapter f={f} a={sc.a} b={sc.b} n="PART 1" title="LIFE ON BOARD" />; break;
    case "bear": case "bear2": {
      const doug = W("N17", 4), polar = W("N17", 12);
      svg = <Cam z={name === "bear" ? (f < doug ? pz(1, 1.1) : 1.3) : 1.3} cx={f < doug ? 960 : 1000} cy={f < doug ? 540 : 680}>{deckShot(<g>
        <Chibi spec={DAISY} pose={{ ...idle(f, 2), look: 0.3, mouth: "smile", armR: 20 }} x={1400} y={1020} size={470} facing={-1} />
        <Chibi spec={SPEDDEN_F} pose={{ ...idle(f, 3), look: 0.4, mouth: "smile" }} x={1650} y={1020} size={480} facing={-1} />
        <Chibi spec={DOUGLAS} pose={{ ...idle(f, 4), ...walkP(f, f < doug + 40, 0.4), armR: 70 + Math.sin(f * 0.2) * 10, mouth: f >= S("D1") ? "o" : "grin", eyes: "happy", talk: env("D1", f), look: 0.4 }} x={lerp(700, 1000, prog(f, sc.a, doug + 40))} y={1025} size={470} />
        <Bear x={lerp(700, 1000, prog(f, sc.a, doug + 40)) + 60} y={880 + Math.sin(f * 0.2) * 6} s={0.9} rot={-10} />
      </g>, 0, 1.15)}</Cam>;
      grade("bear", "warm", [{ x: 1300, y: 200, r: 900, c: "#fff1c4", a: 0.45 }], 0.45);
      over.push(<Fg key="fg" kind="rail" f={f} />, <Rays key="r" f={f} x={1500} y={-80} ang={-20} />);
      if (name === "bear") {
        html.push(<NameTag key="ds" f={f} a={doug} dur={polar - doug} x={1000} y={360} name="Douglas Spedden" role="age 6, first class" color="#3f7fbf" />);
        html.push(<NameTag key="pb" f={f} a={polar} dur={S("D1") - polar} x={1150} y={460} name="Polar" role="the teddy bear" color="#7b4a8c" />);
        html.push(<SpeechBubble key="d1" f={f} a={S("D1") - 2} b={sc.b} x={1100} y={330} tx={1000} ty={480} text="Look, Polar! A camel!" width={480} />);
        html.push(<Label key="l1" f={f} a={S("D1")} b={sc.b} x={1100} y={350} text="playful" />);
      } else top.push(<Card key="bk" f={f} a={sc.a + 2} b={sc.b + 2} x={1360} y={520} rot={4} s={0.8} dim={0.35}><Book /></Card>);
      break;
    }
    case "gym": {
      const icons: [string, number][] = [["SWIMMING POOL", W("N19", 11)], ["SQUASH COURT", W("N19", 14)], ["TURKISH BATH", W("N19", 18)]];
      svg = <Cam z={pz(1.05, 1.15)} cx={800} cy={560}><Gym f={f}><Chibi spec={RICH_M} pose={{ ...idle(f, 2), mouth: "grin", eyes: "happy", armR: 60, armL: 60 }} x={560} y={600 + Math.sin(f * 0.18) * 8} size={300} /></Gym></Cam>;
      grade("gym", "warm", [{ x: 960, y: 250, r: 900, c: "#fff6d6", a: 0.5 }], 0.4);
      over.push(<Rays key="r" f={f} x={960} y={150} ang={10} />);
      icons.forEach(([t, at], i) => { if (f >= at) top.push(<g key={t} transform={`translate(${1250 + (i % 2) * 120} ${330 + i * 140}) rotate(${i % 2 ? 3 : -3}) scale(${prog(f, at, at + 7)})`}><rect x={-230} y={-48} width={460} height={88} rx={44} fill="#fff7e6" stroke={INK} strokeWidth={6} /><text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>{t}</text></g>); });
      html.push(<Label key="gl" f={f} a={W("N19", 8)} b={sc.b} x={560} y={210} text="the electric camel" />);
      break;
    }
    case "astor": {
      const dogs = W("N19b", 16);
      svg = <Cam z={pz(1.1, 1.2)} cx={pz(800, 1100)} cy={660}>{deckShot(<g>
        <Chibi spec={MADELEINE} pose={{ ...idle(f, 1), ...walkP(f, true, 0.3), mouth: "smile", look: 0.3 }} x={lerp(500, 900, prog(f, sc.a, sc.b))} y={1020} size={450} />
        <Chibi spec={ASTOR} pose={{ ...idle(f, 2), ...walkP(f, true, 0.3), mouth: "smile", look: 0.3, armR: 40 }} x={lerp(700, 1100, prog(f, sc.a, sc.b))} y={1025} size={480} />
        <Dog f={f} x={lerp(980, 1380, prog(f, sc.a, sc.b))} y={1010} s={0.8} />
      </g>, 0, 1.15)}</Cam>;
      grade("as", "warm", [{ x: 1300, y: 200, r: 900, c: "#fff1c4", a: 0.45 }], 0.45);
      over.push(<Fg key="fg" kind="rail" f={f} />);
      html.push(<NameTag key="a1" f={f} a={W("N19b", 0)} dur={W("N19b", 7) - W("N19b", 0) + 20} x={lerp(700, 1100, prog(f, sc.a, sc.b)) * 1.1 - 100} y={380} name="John Jacob & Madeleine Astor" role="first class" color="#7b2f3a" />);
      html.push(<NameTag key="kt" f={f} a={W("N19b", 13)} dur={dogs - W("N19b", 13)} x={1350} y={560} name="Kitty" role="Airedale terrier" color="#a26a34" />);
      if (f >= dogs) top.push(<g key="dz" transform={`translate(1450 260) scale(${prog(f, dogs, dogs + 8)})`}><rect x={-250} y={-60} width={500} height={110} rx={55} fill="#fff7e6" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={INK}>≈ 12 dogs on board</text></g>);
      break;
    }
    case "nav": {
      svg = <Cam z={pz(1.15, 1.25)} cx={900} cy={660}>{deckShot(<g>
        <Chibi spec={NAVRATIL} pose={{ ...idle(f, 3), look: 0.4, armR: 20, mouth: "smile" }} x={700} y={1020} size={500} />
        <Chibi spec={MICHEL} pose={{ ...walkP(f, true, 0.4), ...idle(f, 4), mouth: "grin", eyes: "happy", armR: 90 }} x={1100 + Math.sin(f * 0.04) * 160} y={1030} size={500} facing={Math.cos(f * 0.04) > 0 ? 1 : -1} />
        <Chibi spec={EDMOND} pose={{ ...walkP(f, true, 0.45), ...idle(f, 5), mouth: "grin", armL: 60, look: -0.4 }} x={1250 + Math.sin(f * 0.04 + 1.2) * 160} y={1030} size={500} facing={Math.cos(f * 0.04 + 1.2) > 0 ? 1 : -1} />
      </g>, -150, 1.2)}</Cam>;
      grade("nv", "warm", [{ x: 900, y: 200, r: 900, c: "#fff1c4", a: 0.45 }], 0.45);
      html.push(<NameTag key="hf" f={f} a={W("N20", 4)} dur={sc.b - W("N20", 4) - 4} x={700} y={330} name="“Mr. Hoffman”" role="really Michel Navratil" color="#c0473f" />);
      break;
    }
    case "third": {
      const fam = [JOHN_SAGE, ANNIE_SAGE, SAGE_KIDS[0], SAGE_KIDS[3], SAGE_KIDS[6]];
      svg = <Cam z={pz(1, 1.1)} cx={900} cy={600}><GeneralRoom f={f}>{fam.map((s, i) => <Chibi key={s.id} spec={s} pose={{ ...idle(f, i), ...walkP(f, i > 1, 0.5), armR: 100 + Math.sin(f * 0.3 + i) * 40, armL: 100 + Math.cos(f * 0.3 + i) * 40, mouth: "grin", eyes: "happy" }} x={260 + i * 210 + Math.sin(f * 0.08 + i) * 40} y={1010 - Math.abs(Math.sin(f * 0.3 + i)) * 20} size={i < 2 ? 380 : 300} />)}{[0, 1].map((i) => <Chibi key={i} spec={EMIGRANT(i + 2)} pose={{ ...idle(f, i + 5), armR: 140, mouth: "grin" }} x={1250 + i * 150} y={1010} size={330} facing={-1} />)}</GeneralRoom></Cam>;
      grade("th", "lamp", [{ x: 1500, y: 500, r: 600, c: "#ffd27a", a: 0.45 }, { x: 500, y: 300, r: 500, c: "#fff1c4", a: 0.3 }], 0.5);
      html.push(<NameTag key="sg" f={f} a={W("N21", 2)} dur={70} x={600} y={420} name="The Sage family" role="third class" color="#3f7a5a" />);
      break;
    }
    case "andrews": {
      const q = S("N22b");
      svg = <Cam z={f < q ? pz(1.1, 1.25) : 1.25} cx={960} cy={650}>{deckShot(<Chibi spec={ANDREWS_NB} pose={{ ...idle(f, 2), ...walkP(f, f < W("N22", 9), 0.3), write: f >= W("N22", 9) ? 1 : 0, armL: -20, armR: -30 - Math.abs(Math.sin(f * 1.1)) * 12, look: 0.2, mouth: "smile" }} x={lerp(600, 960, prog(f, sc.a, W("N22", 9)))} y={1030} size={560} />, 0, 1.15)}</Cam>;
      grade("an", "warm", [{ x: 960, y: 250, r: 900, c: "#fff1c4", a: 0.45 }], 0.45);
      html.push(<NameTag key="an" f={f} a={W("N22", 1)} dur={q - W("N22", 1) - 4} x={960} y={330} name="Thomas Andrews" role="Harland & Wolff, designer" color="#3f7fbf" />);
      top.push(<Card key="q" f={f} a={q} b={sc.b + 2} y={480} rot={-2} dim={0.4}><QuoteCard text={["“as perfect, so he said,", "as brains could make her”"]} src="J. M. Bullock, Thomas Andrews, Shipbuilder (1912)" /></Card>);
      break;
    }
    // ------------------------------------------------------------ fire, speed, silence
    case "ch_fire": hideCaps = true; svg = <Chapter f={f} a={sc.a} b={sc.b} n="PART 2" title="FIRE, SPEED AND SILENCE" c="#ff9a5a" />; break;
    case "fire": case "fire2": {
      const barrett = W("N25", 5), wall = W("N25", 12);
      const dig = (i: number) => ({ ...idle(f, i), armR: 40 + Math.max(0, Math.sin(f * 0.25 + i * 2)) * 80, look: 0.5, eyes: "squint" as const, mouth: "flat" as const });
      svg = <Cam z={name === "fire" ? pz(1, 1.15) : 1.2} cx={name === "fire" ? 900 : 700} cy={600}><BoilerRoom f={f}>
        <g transform="translate(120 520)"><rect x={-150} y={-260} width={300} height={400} fill="#1a1214" stroke={INK} strokeWidth={6} />{Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-80 + (i * 43) % 160} cy={60 - (i * 37) % 200} r={30} fill="#3a2a2b" stroke={INK} strokeWidth={3} />)}<ellipse cx={0} cy={0} rx={120} ry={150} fill="#ff5a1f" opacity={0.25 + 0.15 * Math.sin(f * 0.3)} />{[0, 1, 2].map((i) => { const t = ((f + i * 20) % 60) / 60; return <circle key={i} cx={Math.sin(i * 2 + t * 3) * 40} cy={-60 - t * 200} r={16 + t * 30} fill="#4a3a3c" opacity={(1 - t) * 0.6} />; })}<text y={-290} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#ffb24a">COAL BUNKER</text></g>
        <Chibi spec={BARRETT} pose={{ ...dig(0), talk: env("F1", f), mouth: f >= S("F1") && f < E("F1") ? "o" : "flat" }} x={520} y={1010} size={360} />
        {[1, 2].map((i) => <Chibi key={i} spec={{ ...FIREMAN(i), prop: "shovel" }} pose={dig(i)} x={520 + i * 520} y={1010} size={330} facing={i === 2 ? -1 : 1} />)}
      </BoilerRoom></Cam>;
      grade("fi", "fire", [{ x: 200, y: 520, r: 500, c: "#ff8a3a", a: 0.6, flicker: 0.25 }, { x: 1000, y: 600, r: 600, c: "#ffb24a", a: 0.35, flicker: 0.2 }], 0.65);
      over.push(<Fg key="fg" kind="rivets" f={f} />);
      if (name === "fire") {
        html.push(<SpeechBubble key="f1" f={f} a={S("F1") - 2} b={sc.b} x={700} y={330} tx={560} ty={520} text="Keep digging, lads!" width={420} />);
        html.push(<Label key="l1" f={f} a={S("F1")} b={sc.b} x={700} y={350} text="playful" />);
        if (f >= W("N24", 19)) top.push(<g key="wb" transform={`translate(1500 240) scale(${prog(f, W("N24", 19), W("N24", 19) + 8)})`}><rect x={-270} y={-56} width={540} height={100} rx={50} fill="#fff7e6" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>bunker → furnaces</text></g>);
      } else {
        html.push(<Stamp key="st" f={f} a={sc.a + 2} b={barrett - 2} text="Saturday, 13 April" sub="the bunker is empty" />);
        html.push(<NameTag key="bt" f={f} a={barrett} dur={wall - barrett} x={520} y={500} name="Frederick Barrett" role="leading fireman" color="#55535a" />);
        top.push(<Card key="bk" f={f} a={wall} b={S("N26") + 40} x={1300} y={500} rot={3} s={0.8} dim={0.35}><Bulkhead f={f} a={wall + 8} /></Card>);
        if (f >= wall + 8) html.push(<Label key="lb" f={f} a={wall + 8} b={S("N26") + 40} x={1300} y={870} text="Barrett's account, 1912 inquiries" />);
        if (f >= S("N26") + 46) top.push(<g key="db" transform={`translate(1350 520) scale(${prog(f, S("N26") + 46, S("N26") + 54)})`}><rect x={-300} y={-60} width={600} height={110} rx={55} fill="#ffd84a" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>STILL DEBATED</text></g>);
      }
      break;
    }
    case "cape": {
      const cape = W("N26c", 8), hop = W("N26c", 25);
      svg = <Cam z={pz(1, 1.06)}><AtlMap f={f} ship={0.42} range={prog(f, W("N26b", 12), W("N26b", 16))} cape={prog(f, cape, cape + 8)}>
        {f >= hop && [0, 1, 2].map((i) => <g key={i}><circle cx={900 - i * 220} cy={420 + (i % 2) * 120} r={14} fill="#26232a" stroke={INK} strokeWidth={4} /></g>)}
        {f >= hop && <path d={`M 1110 460 L 900 420 L 680 540 L 460 420 L 260 500`} fill="none" stroke="#c0473f" strokeWidth={6} strokeDasharray={`${prog(f, hop, hop + 30) * 1100} 2000`} />}
      </AtlMap></Cam>;
      grade("cp", "none", [], 0.35);
      if (f >= W("N26b", 17)) top.push(<g key="gp" transform={`translate(700 260) scale(${prog(f, W("N26b", 17), W("N26b", 17) + 8)})`}><rect x={-280} y={-56} width={560} height={100} rx={50} fill="#fff7e6" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>no land station in range</text></g>);
      break;
    }
    case "runs": case "runs2": {
      const r1 = W("N28", 3), r2 = W("N28", 11), maur = W("N29", 9);
      if (name === "runs" || f < maur) {
        svg = <Cam z={pz(1, 1.08)} cx={960} cy={560}><SmokingRoom f={f}>
          <g transform="translate(960 380) scale(0.62)"><RunBoard f={f} rows={[["Fri → Sat", 519, r1], ["Sat → Sun", 546, r2]]} /></g>
          <Chibi spec={RICH_M} pose={{ ...idle(f, 2), mouth: "grin", armR: 110, look: 0.2 }} x={420} y={1020} size={420} />
          <Chibi spec={{ ...RICH_M, id: "rich3", hair: PAL.hairBrown, beard: "moustache", beardColor: PAL.hairBrown }} pose={{ ...idle(f, 3), mouth: "smile", look: -0.3 }} x={1500} y={1020} size={420} facing={-1} />
        </SmokingRoom></Cam>;
        grade("rn", "lamp", [{ x: 960, y: 600, r: 500, c: "#ff9a4a", a: 0.5, flicker: 0.2 }, { x: 300, y: 300, r: 400, c: "#ffd27a", a: 0.3 }], 0.6);
        over.push(<Fg key="fg" kind="curtain" f={f} />);
        if (name === "runs" && f >= W("N27", 15)) html.push(<Label key="bt" f={f} a={W("N27", 15)} b={r1 - 2} x={420} y={430} text="betting on the day's run" />);
      } else {
        svg = <Cam z={1.04}><Sunburst f={f} c1="#bfe3f0" c2="#a6d6ea" /></Cam>;
        top.push(<g key="sb" transform="translate(960 520)"><SpeedBars f={f} a={maur} /></g>);
      }
      if (name === "runs2" && f < maur) top.push(<g key="q" transform={`translate(960 520) scale(${prog(f, sc.a, sc.a + 8)})`}><rect x={-420} y={-80} width={840} height={150} rx={30} fill="#fff7e6" stroke={INK} strokeWidth={7} /><text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK}>A SPEED RECORD?</text></g>);
      break;
    }
    case "broke": case "broke2": {
      const tr = W("N31", 14), fixed = W("N31", 21);
      svg = <Cam z={name === "broke" ? pz(1.05, 1.2) : 1.1} cx={860} cy={620}>{radio(f < tr ? PHILLIPS : BRIDE, { ...idle(f, 3), armR: 110 + Math.sin(f * 0.6) * 20, armL: 80, look: -0.5, brow: 1, mouth: f >= S("B1") && f < E("B1") ? "o" : "flat", eyes: f >= S("B1") ? "wide" : "normal", talk: env("B1", f) }, name === "broke2" ? lerp(0.3, 1, prog(f, sc.a, sc.b)) : 0.3, "", f % 30 < 4 ? 1 : 0)}</Cam>;
      grade("bk", "night", [{ x: 560, y: 300, r: 380, c: "#ffd27a", a: 0.5, flicker: 0.4 }], 0.75);
      if (name === "broke") {
        if (f < tr) top.push(<g key="sl" transform={`translate(1480 300) scale(${prog(f, S("N30") + 10, S("N30") + 18)})`}><rect x={-230} y={-56} width={460} height={100} rx={50} fill="#ff8a7a" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>NO SIGNAL</text></g>);
        top.push(<Card key="tf" f={f} a={tr} b={sc.b + 2} x={1380} y={500} rot={3} s={0.75} dim={0.3}><Transformer f={f} fixed={f >= fixed} /></Card>);
        if (f >= W("N31", 18)) top.push(<g key="ck" transform="translate(420 300) scale(0.6)"><Clock f={f} h={11} m={0} spin={4} label="≈ 6 HOURS" /></g>);
        html.push(<SpeechBubble key="b1" f={f} a={S("B1") - 2} b={sc.b} x={760} y={330} tx={820} ty={470} text="Found it! The transformer!" width={460} />);
        html.push(<Label key="l1" f={f} a={S("B1")} b={sc.b} x={760} y={350} text="playful" />);
      } else html.push(<Label key="pl" f={f} a={sc.a + 10} b={sc.b} x={1400} y={250} text="the backlog of passenger messages" />);
      break;
    }
    // ------------------------------------------------------------ Sunday
    case "ch_sunday": hideCaps = true; svg = <Chapter f={f} a={sc.a} b={sc.b} n="PART 3" title="SUNDAY, 14 APRIL" c="#cfe6f5" />; break;
    case "sunday": {
      svg = <Cam z={pz(1, 1.08)} cx={960} cy={520}><Saloon f={f} table={false}>
        <Chibi spec={SMITH} pose={{ ...idle(f, 1), armR: -20, armL: -20, look: 0, mouth: "smile", nod: Math.max(0, Math.sin(f * 0.05)) * 0.3 }} x={960} y={900} size={500} />
        {[RICH_W, RICH_M, MADELEINE, ASTOR, BROWNISH(), SPEDDEN_F].map((s, i) => <Chibi key={s.id + i} spec={s} pose={{ ...idle(f, i), look: i < 3 ? 0.6 : -0.6, mouth: "smile" }} x={i < 3 ? 260 + i * 170 : 1240 + (i - 3) * 170} y={1060} size={330} facing={i < 3 ? 1 : -1} />)}
      </Saloon></Cam>;
      grade("su", "warm", [{ x: 960, y: 150, r: 600, c: "#fff6d6", a: 0.55 }], 0.45);
      over.push(<Rays key="r1" f={f} x={300} y={-60} ang={-15} />, <Rays key="r2" f={f} x={1600} y={-60} ang={15} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={sc.b} text="Sunday, 14 April" sub="10:30 a.m. service" />);
      break;
    }
    case "w1": {
      board = 1;
      const card = W("N34", 5);
      svg = <Cam z={pz(1.05, 1.2)} cx={1100} cy={520}><Bridge f={f} murdoch={{ ...idle(f, 2), look: -0.3, armR: f >= S("S1") ? 60 : 20, mouth: f >= S("S1") ? "smile" : "flat", talk: env("S1", f) }} mSpec={SMITH} helm={QM} wheel={0} berg={0} /></Cam>;
      grade("w1", "cool", [{ x: 960, y: 300, r: 900, c: "#f3f6ff", a: 0.35 }], 0.5);
      top.push(<Card key="m" f={f} a={card} b={S("S1") - 2} y={500} rot={-2}><Marconigram f={f} from="Cunard liner Caronia" to="Captain, Titanic" time="14 April · morning" prefix="MSG" lines={["WEST BOUND STEAMERS REPORT", "BERGS, GROWLERS AND FIELD ICE", "IN 42°N FROM 49° TO 51°W"]} typed={prog(f, card + 6, S("S1") - 20)} /></Card>);
      if (f >= card + 6 && f < S("S1")) html.push(<Label key="lb" f={f} a={card + 6} b={S("S1") - 2} x={960} y={840} text="real message" />);
      html.push(<SpeechBubble key="s1" f={f} a={S("S1") - 2} b={sc.b} x={1100} y={330} tx={1260} ty={500} text="Thanks for message and information." width={560} />);
      html.push(<Label key="l1" f={f} a={S("S1")} b={sc.b} x={1100} y={350} text="Smith's real reply, as recorded" />);
      break;
    }
    case "w2": case "w2b": {
      board = 2;
      const hand = W("N35", 19);
      svg = <Cam z={name === "w2" ? pz(1.05, 1.15) : pz(1.4, 1.5)} cx={name === "w2" ? 980 : 760} cy={name === "w2" ? 600 : 700}>{deckShot(name === "w2" ? handOff(hand) : <g>
        <Chibi spec={ISMAY} pose={{ ...idle(f, 2), armR: lerp(60, 10, prog(f, sc.a + 10, sc.a + 24)), look: 0.4, mouth: "flat" }} x={760} y={1030} size={570} />
        {f < sc.a + 24 && <Slip x={lerp(840, 790, prog(f, sc.a + 10, sc.a + 24))} y={lerp(770, 900, prog(f, sc.a + 10, sc.a + 24))} s={lerp(1.3, 0.4, prog(f, sc.a + 10, sc.a + 24))} rot={8} />}
      </g>)}</Cam>;
      grade("w2", "warm", [{ x: 500, y: 200, r: 900, c: "#fff1c4", a: 0.45 }], 0.5);
      over.push(<Fg key="fg" kind="rail" f={f} />);
      if (name === "w2") top.push(<Card key="m" f={f} a={W("N35", 7)} b={hand - 4} y={500} rot={2} s={0.9}><Marconigram f={f} from="S.S. Baltic" to="Captain Smith, Titanic" time="14 April · 1:42 p.m." prefix="MSG" lines={["...PASSING ICEBERGS AND LARGE", "QUANTITIES OF FIELD ICE TODAY"]} typed={1} /></Card>);
      else {
        html.push(<Label key="lb" f={f} a={sc.a + 10} b={sc.b} x={760} y={300} text="Ismay's own statement, 1912" />);
        top.push(<g key="ck" transform={`translate(1450 450) scale(${prog(f, sc.a + 20, sc.a + 28)})`}><Clock f={f} h={1} m={42} spin={0.5} label="IN HIS POCKET" /></g>);
      }
      break;
    }
    case "w3": {
      board = 3;
      const card = W("N37", 5), pile = W("N37", 31);
      svg = <Cam z={pz(1.05, 1.15)} cx={900} cy={600}>{radio(PHILLIPS, tapping, 0.5, "")}</Cam>;
      grade("w3", "lamp", [{ x: 560, y: 300, r: 500, c: "#ffd27a", a: 0.5, flicker: 0.12 }], 0.55);
      if (f < pile) top.push(<Card key="m" f={f} a={card} b={pile} y={480} rot={-2}><Marconigram f={f} from="German liner Amerika" to="Hydrographic Office, Washington" time="via Cape Race" prefix="MSG" lines={["AMERIKA PASSED TWO LARGE", "ICEBERGS IN 41°27'N 50°8'W"]} typed={prog(f, card + 6, W("N37", 16))} /></Card>);
      else top.push(<g key="sl" transform={`translate(${lerp(960, 1400, prog(f, pile, pile + 14))} ${lerp(480, 700, prog(f, pile, pile + 14))}) rotate(${lerp(0, -12, prog(f, pile, pile + 14))}) scale(${lerp(0.9, 0.25, prog(f, pile, pile + 14))})`}><Marconigram f={f} from="German liner Amerika" to="Washington" time="" lines={["..."]} /></g>);
      if (f >= W("N37", 38)) top.push(<g key="nb" transform={`translate(600 260) scale(${prog(f, W("N37", 38), W("N37", 38) + 7)})`}><rect x={-300} y={-56} width={600} height={100} rx={50} fill="#ff8a7a" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>NEVER REACHES THE BRIDGE</text></g>);
      break;
    }
    case "corner": {
      board = 3;
      const cn = W("N38", 10);
      svg = <Cam z={pz(1, 1.06)}><AtlMap f={f} ship={lerp(0.55, 0.62, prog(f, sc.a, sc.b))} corner={prog(f, cn, cn + 8)} /></Cam>;
      grade("cn", "cool", [], 0.4);
      top.push(<g key="th" transform={`translate(1700 560) scale(0.6) scale(${prog(f, sc.a + 4, sc.a + 12)})`}><Thermo f={f} v={lerp(0.7, 0.45, prog(f, sc.a, W("N38", 7)))} label="COLDER" /></g>);
      break;
    }
    case "w2c": {
      board = 3;
      svg = <Cam z={1.12} cx={960} cy={600}><SmokingRoom f={f}>
        <Chibi spec={ISMAY} pose={{ ...idle(f, 2), armR: lerp(10, 70, prog(f, W("N39", 5), W("N39", 9))), look: 0.4, mouth: "flat" }} x={760} y={1030} size={540} />
        <Chibi spec={SMITH} pose={{ ...idle(f, 1), armR: lerp(20, 70, prog(f, W("N39", 9), W("N39", 12))), look: -0.4, mouth: "flat" }} x={1180} y={1030} size={540} facing={-1} />
        {f >= W("N39", 6) && <Slip x={lerp(860, 1080, prog(f, W("N39", 9), W("N39", 12)))} y={790} s={1.2} />}
      </SmokingRoom></Cam>;
      grade("wc", "lamp", [{ x: 960, y: 600, r: 500, c: "#ff9a4a", a: 0.5, flicker: 0.2 }], 0.6);
      top.push(<g key="ck" transform="translate(1600 260) scale(0.55)"><Clock f={f} h={7} m={10} label="7:10 P.M." /></g>);
      break;
    }
    case "w4": {
      board = 4;
      const walk = W("N40", 13);
      if (f < walk) svg = <Cam z={1.15} cx={860} cy={640}>{radio(BRIDE, { ...tapping, write: 1 }, 0.6, "")}</Cam>;
      else svg = <Cam z={1.1} cx={1100} cy={560}><Bridge f={f} murdoch={{ ...idle(f, 2), look: 0.4, armR: f > walk + 40 ? 60 : 20, mouth: "flat" }} mSpec={OFFICER} helm={QM} wheel={0} berg={0} /><Chibi spec={BRIDE} pose={{ ...idle(f, 3), ...walkP(f, f < walk + 40, 0.35), armR: 70, look: 0.3, mouth: "flat" }} x={lerp(300, 900, prog(f, walk, walk + 40))} y={1080} size={560} /><Slip x={lerp(360, 980, prog(f, walk, walk + 40))} y={800} s={1.1} /></Cam>;
      grade("w4", f < walk ? "lamp" : "night", [{ x: 560, y: 300, r: 500, c: "#ffd27a", a: 0.5 }], 0.6);
      if (f < walk) top.push(<g key="ck" transform="translate(230 300) scale(0.45)"><Clock f={f} h={7} m={30} label="7:30 P.M." /></g>);
      if (f < walk) top.push(<Card key="m" f={f} a={W("N40", 6)} b={walk - 2} y={480} rot={-2} s={0.9}><Marconigram f={f} from="Californian → Antillian" to="(overheard by Titanic)" time="14 April · 7:30 p.m." lines={["THREE LARGE BERGS", "FIVE MILES TO SOUTHWARD OF US"]} typed={prog(f, W("N40", 6) + 6, walk - 10)} /></Card>);
      else html.push(<Label key="lb" f={f} a={walk + 6} b={sc.b} x={960} y={250} text="Bride's account: he couldn't recall which officer" />);
      break;
    }
    case "dinner": case "dinner2": {
      board = 4;
      const temp = W("N41", 11);
      svg = <Cam z={pz(1, 1.08)} cx={960} cy={560}><Saloon f={f}>
        <Chibi spec={SMITH} pose={{ ...idle(f, 1), look: 0.3, mouth: "smile", eyes: "happy" }} x={960} y={900} size={460} />
        {[RICH_W, RICH_M].map((s, i) => <Chibi key={i} spec={s} pose={{ ...idle(f, i + 2), look: i ? -0.5 : 0.5, mouth: "grin" }} x={i ? 1400 : 520} y={900} size={440} facing={i ? -1 : 1} />)}
      </Saloon></Cam>;
      grade("dn", "lamp", [{ x: 960, y: 120, r: 600, c: "#ffd27a", a: 0.55, flicker: 0.1 }], 0.55);
      over.push(<Fg key="fg" kind="lamp" f={f} />);
      if (name === "dinner") {
        html.push(<Stamp key="st" f={f} a={sc.a + 2} b={temp - 2} text="A dinner party" sub="the à la carte restaurant" />);
        if (f >= temp) top.push(<Card key="th" f={f} a={temp} b={sc.b + 2} x={1500} y={520} rot={0} s={0.8} dim={0.35}><Thermo f={f} v={lerp(0.55, 0.38, prog(f, temp + 10, sc.b - 10))} label="−4° IN 30 MIN" /></Card>);
      } else top.push(<Card key="mn" f={f} a={sc.a + 2} b={sc.b + 2} x={1380} y={520} rot={3} s={0.85} dim={0.35}><Menu f={f} a={sc.a + 10} items={["Oysters", "Consommé Olga", "Poached Salmon", "Filet Mignon Lili", "Roast Squab & Cress", "Waldorf Pudding", "Eclairs · French Ice Cream"]} /></Card>);
      break;
    }
    case "hymn": case "hymnend": {
      board = name === "hymn" ? 4 : 5;
      const bees = W("N45b", 24);
      svg = <Cam z={pz(1, 1.08)} cx={900} cy={560}><Saloon2 f={f}>
        <Chibi spec={CARTER} pose={{ ...idle(f, 1), armR: name === "hymnend" ? 90 : 120 + Math.sin(f * 0.2) * 20, armL: 40, look: 0.2, mouth: name === "hymnend" ? "smile" : "o", talk: name === "hymnend" ? Math.abs(Math.sin(f * 0.4)) * 0.6 : 0.5 + 0.3 * Math.sin(f * 0.25) }} x={1300} y={880} size={480} facing={-1} />
        {[BEESLEY, RICH_W, EMIGRANT(1), RICH_M, EMIGRANT(3)].map((s, i) => <Chibi key={s.id + i} spec={s} pose={{ ...idle(f, i), look: 0.5, mouth: name === "hymnend" ? "smile" : "o", talk: name === "hymnend" ? 0 : 0.4 + 0.3 * Math.sin(f * 0.25 + i) }} x={250 + i * 190} y={870} size={340} />)}
      </Saloon2></Cam>;
      grade("hy", "lamp", [{ x: 1300, y: 500, r: 600, c: "#ffd27a", a: 0.45, flicker: 0.1 }, { x: 500, y: 300, r: 500, c: "#fff1c4", a: 0.3 }], 0.55);
      if (name === "hymn") {
        html.push(<Stamp key="st" f={f} a={sc.a + 2} b={W("N45b", 9)} text="8:30 p.m." sub="second-class dining saloon" />);
        html.push(<NameTag key="ct" f={f} a={W("N45b", 9)} dur={bees - W("N45b", 9)} x={1300} y={420} name="Rev. Ernest Carter" role="second class" color="#26232a" />);
        html.push(<NameTag key="lb" f={f} a={bees} dur={sc.b - bees - 4} x={250} y={470} name="Lawrence Beesley" role="second class, later wrote a book" color="#4a4a5a" />);
        if (f >= W("N45b", 31)) top.push(<g key="hb" transform={`translate(960 260) scale(${prog(f, W("N45b", 31), W("N45b", 31) + 8)})`}><rect x={-320} y={-60} width={640} height={110} rx={55} fill="#fff7e6" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>hymns about danger at sea</text></g>);
        [0, 1, 2].forEach((i) => { const t = ((f * 1.2 + i * 25) % 75) / 75; top.push(<text key={`n${i}`} x={500 + i * 200 + t * 80} y={600 - t * 260} fontFamily={FONT} fontWeight={900} fontSize={70} fill="#7b4a8c" opacity={1 - t}>♪</text>); });
      } else top.push(<g key="ck" transform="translate(1680 230) scale(0.5)"><Clock f={f} h={10} m={5} label="JUST AFTER 10" /></g>);
      break;
    }
    case "bridge": case "bridge2": {
      board = 4;
      const leave = E("S2") - 4;
      svg = <Cam z={pz(1.05, 1.15)} cx={1050} cy={560}><Bridge f={f} murdoch={{ ...idle(f, 2), look: -0.3, mouth: f >= S("S2") && f < E("S2") ? "smile" : "flat", talk: env("S2", f), armR: f >= S("S2") ? 50 : 20, ...walkP(f, name === "bridge2" && f > leave, 0.3) }} mSpec={SMITH} helm={QM} wheel={0} berg={0} />
        <Chibi spec={LIGHTOLLER} pose={{ ...idle(f, 4), look: 0.4, talk: env("L1", f), mouth: f >= S("L1") && f < E("L1") ? "o" : "flat", armR: f >= S("L1") && f < E("L1") ? 60 : 15 }} x={860} y={1120} size={620} />
      </Cam>;
      grade("br", "night", [{ x: 960, y: 300, r: 900, c: "#9fb7ff", a: 0.25 }], 0.7);
      if (name === "bridge") {
        html.push(<NameTag key="lt" f={f} a={W("N42", 7)} dur={S("L1") - W("N42", 7)} x={860} y={380} name="Charles Lightoller" role="Second Officer, on watch" color="#22304f" />);
        html.push(<SpeechBubble key="l1" f={f} a={S("L1") - 2} b={sc.b} x={700} y={330} tx={860} ty={480} text="It is a flat calm." width={420} />);
        html.push(<Label key="ll" f={f} a={S("L1")} b={sc.b} x={700} y={350} text="real words, as Lightoller recalled them" />);
      } else {
        html.push(<SpeechBubble key="s2" f={f} a={S("S2") - 2} b={sc.b} x={1250} y={300} tx={1280} ty={470} text="If it becomes at all doubtful, let me know at once." width={600} />);
        html.push(<Label key="ls" f={f} a={S("S2")} b={sc.b} x={1250} y={320} text="as Lightoller recalled them" />);
      }
      break;
    }
    case "calm": {
      board = 4;
      const nm = W("N43", 31), dk = W("N43", 33);
      svg = <CalmMech f={f} a={W("N43", 13)} noMoon={prog(f, nm, nm + 10)} dark={prog(f, dk, dk + 20)} />;
      grade("cm", "none", [], 0.5);
      html.push(<Stamp key="ys" f={f} a={sc.a + 2} b={W("N43", 12)} text="You see..." />);
      break;
    }
    case "nest": {
      board = 4;
      svg = <Cam z={pz(1.05, 1.15)} cy={620}><CrowsNest f={f} fleet={{ ...idle(f, 1), look: 0.4, eyes: "squint", armR: f > W("N45", 8) ? 120 : 10 }} lee={{ ...idle(f, 2), look: -0.2, eyes: "squint" }} fleetSpec={FLEET} leeSpec={LEE} phone={f > W("N45", 4)} /></Cam>;
      grade("ns", "night", [], 0.75);
      top.push(<Card key="ms" f={f} a={W("N45", 8)} b={sc.b + 2} x={1450} y={420} rot={3} s={0.7} dim={0.2}><g><rect x={-420} y={-130} width={840} height={260} rx={20} fill="#fbf4e4" stroke={INK} strokeWidth={8} /><text y={-40} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={44} fill="#2a2a3a">KEEP A SHARP LOOKOUT</text><text y={20} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={44} fill="#2a2a3a">FOR SMALL ICE</text><text y={80} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={44} fill="#2a2a3a">AND GROWLERS</text></g></Card>);
      break;
    }
    case "w5": case "w5b": {
      board = 5;
      const card = W("N46", 6), path = W("N46", 19), cr = W("N47", 9), never = W("N47", 28);
      if (name === "w5" && f >= path) svg = <Cam z={1.04}><AtlMap f={f} ship={0.7} ice={[{ x: 470, y: 600, t: path, label: "MESABA ICE", c: "#ff8a7a" }, { x: 560, y: 520, t: path + 6, label: "", c: "#ff8a7a" }]} /></Cam>;
      else if (name === "w5b" && f >= cr && f < never) svg = <Cam z={1.04}><AtlMap f={f} ship={0.72} cape={1} range={prog(f, cr, cr + 20)} /></Cam>;
      else svg = <Cam z={name === "w5" ? pz(1.05, 1.15) : 1.2} cx={860} cy={640}>{radio(PHILLIPS, { ...tapping, armR: -30 - Math.abs(Math.sin(f * 1.6)) * 18, eyes: "squint" }, 0.95, "")}</Cam>;
      if (!(name === "w5" && f >= path) && !(name === "w5b" && f >= cr && f < never)) top.push(<g key="ck" transform="translate(230 300) scale(0.45)"><Clock f={f} h={name === "w5" ? 9 : 10} m={name === "w5" ? 40 : 0} label={name === "w5" ? "9:40 P.M." : "AFTER 10"} /></g>);
      grade("w5", "lamp", [{ x: 560, y: 300, r: 500, c: "#ffd27a", a: 0.5, flicker: 0.2 }], 0.6);
      if (name === "w5" && f < path) top.push(<Card key="m" f={f} a={card} b={path - 2} y={480} rot={-2} s={0.95}><Marconigram f={f} from="S.S. Mesaba" to="Titanic, and all eastbound ships" time="14 April · 9:40 p.m." lines={["SAW MUCH HEAVY PACK ICE AND", "GREAT NUMBER LARGE ICEBERGS.", "ALSO FIELD ICE."]} typed={prog(f, card + 6, path - 10)} /></Card>);
      if (name === "w5b" && f >= never) {
        top.push(<g key="sk" transform={`translate(1380 ${lerp(500, 760, prog(f, never, never + 12))}) rotate(-6) scale(${lerp(0.8, 0.3, prog(f, never, never + 12))})`}><Marconigram f={f} from="S.S. Mesaba" to="Titanic" time="" lines={["SAW MUCH HEAVY PACK ICE..."]} stamp="NOT SENT TO BRIDGE" stampAt={never + 4} /></g>);
      }
      if (name === "w5b" && f < cr) html.push(<Label key="ba" f={f} a={W("N47", 6)} b={cr - 2} x={1400} y={250} text="Bride is asleep · relieves him at midnight" />);
      break;
    }
    case "w6": case "w6b": {
      board = 6;
      const call = W("N48", 16);
      if (name === "w6" && f < call) svg = <Cam z={1.1} cy={560}><NightSea f={f} shipX={1300} /><g transform="translate(450 760) scale(0.35)" /></Cam>;
      else if (name === "w6") svg = <Cam z={1.15} cx={860} cy={640}>{radio(EVANS, { ...tapping }, 0.1, "", 0, "californian")}</Cam>;
      else svg = <Cam z={pz(1.2, 1.3)} cx={860} cy={640}>{radio(PHILLIPS, { ...tapping, eyes: "squint", brow: -1, mouth: f >= S("P2") && f < E("P2") ? "o" : "flat", talk: env("P2", f), armL: f < S("P2") ? 140 : -38 }, 0.9, "")}</Cam>;
      grade("w6", name === "w6" && f >= call ? "cool" : name === "w6" ? "night" : "lamp", [{ x: 560, y: 300, r: 500, c: "#ffd27a", a: 0.4 }], 0.65);
      if (name === "w6" && f < call) html.push(<Stamp key="st" f={f} a={sc.a + 2} b={call - 2} text="Almost 11 p.m." sub="the Californian, stopped for the night" />);
      if (name === "w6" && f >= call) {
        html.push(<NameTag key="ev" f={f} a={call} dur={50} x={760} y={330} name="Cyril Evans" role="Californian's only wireless operator" color="#3a4466" />);
        top.push(<Card key="m" f={f} a={call + 16} b={sc.b + 2} x={1300} y={480} rot={2} s={0.8} dim={0.25}><Marconigram f={f} from="Californian (Evans)" to="Titanic" time="about 11 p.m., ship's time" lines={["SAY, OLD MAN, WE ARE STOPPED", "AND SURROUNDED BY ICE"]} typed={prog(f, call + 22, sc.b - 10)} /></Card>);
      }
      if (name === "w6b") {
        if (f < S("P2")) top.push(<g key="jm"><ShockLines t={(f - sc.a) % 14} x={760} y={430} s={2} /><g transform={`translate(1400 300) rotate(${Math.sin(f * 0.8) * 5})`}><rect x={-220} y={-56} width={440} height={100} rx={50} fill="#ff8a7a" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>TOO LOUD!</text></g></g>);
        html.push(<SpeechBubble key="p2" f={f} a={S("P2") - 2} b={sc.b} x={1200} y={330} tx={860} ty={470} text="Shut up, shut up, I am busy. I am working Cape Race." width={640} />);
        html.push(<Label key="lp" f={f} a={S("P2")} b={sc.b} x={1200} y={350} text="real reply, as Evans recalled it (US inquiry)" />);
        hideCaps = f >= S("P2") - 2;
      }
      break;
    }
    case "evans": {
      board = 6;
      const bed = W("N50", 21);
      svg = f < bed ? <Cam z={1.15} cx={860} cy={640}>{radio(EVANS, { ...idle(f, 2), armR: 20, look: 0.2, mouth: "flat" }, 0.1, "", 0, "californian")}</Cam> : <Cam z={pz(1.05, 1.12)}><Bunk f={f} spec={EVANS} /></Cam>;
      grade("ev", f < bed ? "cool" : "night", [], 0.65);
      if (f < bed) html.push(<Label key="li" f={f} a={W("N50", 11)} b={bed - 2} x={960} y={250} text="Evans, British inquiry: “you do not take it as an insult”" />);
      else top.push(<g key="ck" transform="translate(1580 260) scale(0.55)"><Clock f={f} h={11} m={35} label="11:35 P.M." /></g>);
      break;
    }
    case "count": {
      board = -1;
      const fates = [W("N51", 6), W("N51", 11), W("N51", 19), W("N51", 23), W("N51", 35), W("N51", 42)];
      const nF = fates.filter((t) => f >= t + 6).length;
      svg = <Cam z={pz(1, 1.06)}><NightSea f={f} shipX={900} /></Cam>;
      grade("ct", "night", [], 0.7);
      top.push(<g key="wb"><WarnBoard f={f} n={6} times={[-99, -99, -99, -99, -99, -99]} fates={nF} big={prog(f, sc.a, sc.a + 12)} /></g>);
      break;
    }
    case "end": case "end2": case "end3": {
      board = name === "end" ? 6 : -1;
      if (name === "end2") svg = <Cam z={pz(1.05, 1.15)} cy={620}><CrowsNest f={f} fleet={{ ...idle(f, 1), look: 0.4, eyes: "squint" }} lee={{ ...idle(f, 2), look: -0.2, eyes: "squint" }} fleetSpec={FLEET} leeSpec={LEE} /></Cam>;
      else svg = <Cam z={pz(1, 1.12)} cy={600}><NightSea f={f} shipX={lerp(600, 1000, prog(f, sc.a, sc.b))} /></Cam>;
      grade("en", "night", [], 0.75);
      if (name === "end") top.push(<g key="kn" transform={`translate(560 280) scale(${prog(f, W("N53", 6), W("N53", 6) + 8)})`}><rect x={-200} y={-56} width={400} height={100} rx={50} fill="#fff7e6" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>≈ 22 KNOTS</text></g>);
      if (name === "end2") { html.push(<NameTag key="ff" f={f} a={W("N54", 8)} dur={60} x={820} y={420} name="Frederick Fleet" role="lookout" color="#2c3a5e" />); html.push(<NameTag key="rl" f={f} a={W("N54", 11)} dur={50} x={1130} y={420} name="Reginald Lee" role="lookout" color="#2c3a5e" />); }
      if (name === "end3") { hideCaps = false; top.push(<g key="ck" transform={`translate(960 470) scale(${prog(f, sc.a, sc.a + 8) * 1.3})`}><Clock f={f} h={11} m={39} label="11:39 P.M." /></g>); }
      break;
    }
    case "next": {
      hideCaps = true;
      svg = (<g><SeaSky f={f} mode="night" horizon={760} />
        <g transform={`translate(${lerp(700, 960, prog(f, sc.a, sc.b))} 900) scale(0.5)`}><Titanic f={f} night /></g>
        <g transform="translate(0 900)"><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g>
        <g transform={`translate(1500 820) scale(0.5)`}><Iceberg /></g>
        <g transform={`translate(700 300) scale(${prog(f, sc.a, sc.a + 8)})`}><rect x={-520} y={-100} width={1040} height={200} rx={30} fill="#ffd84a" stroke={INK} strokeWidth={8} /><text x={0} y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>NEXT · EPISODE 3</text><text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK}>THE ICEBERG</text></g></g>);
      grade("nx", "night", [], 0.6);
      break;
    }
    case "final": {
      const all = [PHILLIPS, BRIDE, SMITH, ISMAY, LIGHTOLLER, EVANS, DOUGLAS, ANDREWS_NB];
      svg = (<g><Sunburst f={f} c1="#ffe7a6" c2="#ffd77a" />
        {all.map((s, i) => <Chibi key={s.id + i} spec={s} pose={{ armR: s.prop === "notebook" ? -20 : 150 + Math.sin(f * 0.45 + i) * 14, mouth: "grin", eyes: i % 2 ? "happy" : "normal", breathe: Math.sin(f / 15 + i), head: Math.sin(f * 0.1 + i) * 3 }} x={200 + i * 217} y={1000} size={340} facing={i > 3 ? -1 : 1} />)}
        <g transform={`translate(960 250) scale(${prog(f, sc.a, sc.a + 8)})`}>
          <path d="M -460 -90 Q -460 -140 -410 -140 L 410 -140 Q 460 -140 460 -90 L 460 60 Q 460 110 410 110 L -60 110 L -120 170 L -120 110 L -410 110 Q -460 110 -460 60 Z" fill="#fff" stroke={INK} strokeWidth={8} />
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={INK}>Which warning should</text>
          <text x={0} y={44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={INK}>have stopped her?</text>
        </g>
        {f >= W("N57", 9) && <g transform={`translate(1600 560) scale(${prog(f, W("N57", 9), W("N57", 9) + 7) * (1 + Math.sin(f * 0.3) * 0.04)})`}><rect x={-170} y={-50} width={340} height={100} rx={20} fill="#e5302a" stroke={INK} strokeWidth={6} /><text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff">SUBSCRIBE</text></g>}
      </g>);
      break;
    }
  }
  // the running warning board (top right) once the warnings start
  if (board >= 0 && !["count", "cold3"].includes(name)) top.push(<g key="board" opacity={0.95}><WarnBoard f={f} n={wt.filter((t) => f >= t).length} times={wt} /></g>);

  return (
    <AbsoluteFill style={{ background: "#0b1430" }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>{svg}</svg>
      {over}
      <L>{top}</L>
      {html}
      <Captions f={f} caps={TL.caps} hide={hideCaps} />
      <Watermark />
      {!noAudio && <Audio src={staticFile("ep2_mix.wav")} />}
    </AbsoluteFill>
  );
};
function BROWNISH(): Spec { return { ...RICH_W, id: "pw2", main: "#7b4a8c", mainDark: "#5b3168", hatColor: "#4e3a63" }; }
void clamp; void Bear;
