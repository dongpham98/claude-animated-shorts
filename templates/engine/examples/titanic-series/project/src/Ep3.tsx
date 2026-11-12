// Titanic: The Real Story — Episode 3 "The Iceberg" (1920x1080, 30 fps). 11:39 p.m. to ~12:45 a.m.
// Spine: paradox hook from a small object (a bell + "Thank you"), Fleet -> Andrews, clock = Andrews' estimate,
// "You see" #1 tiller orders, #2 ice-cube tray, FILM vs REAL x2, callback ending on the quiet first boat.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps } from "remotion";
import TL from "./ep3_timeline.json";
import { Chibi, Pose, Spec } from "./chibi";
import { SMITH, ANDREWS, FLEET, LEE, PHILLIPS, MURDOCH } from "./cast";
import { BRIDE, RICH_M, WORKER, RICH_W, EMIGRANT } from "./cast1";
import { LIGHTOLLER, BEESLEY } from "./cast2";
import { PAL, prog, lerp, clamp, INK } from "./style";
import { Sunburst, SpeechBubble, NameTag, ShockLines, Sparkles } from "./fx";
import { Titanic, SeaSky, WaterFront, Iceberg } from "./ship";
import { Cam, NightSea, RadioRoom, CrowsNest, Bridge } from "./scenes";
import { Deck } from "./deck";
import { BoilerRoom } from "./ep1sets";
import { SmokingRoom } from "./ep2sets";
import { Cabin, EmptyHook } from "./keysets";
import { useFonts, FONT, FONT2 } from "./vshort";
import { L, Grade, Fg, Rays, Captions, Watermark, Stamp, Label, Chapter, Card, Marconigram, Clock } from "./kit16";
import { FilmVsReal, BellInsert, PhoneInsert, TillerMech, Stopwatch, TopTurn, DoorsCut, MailRoom, Stairs, IceTray, HullDamage, Compartments, PositionMap, BoatLower, Steam, IcePile, Glass } from "./ep3sets";

export const EP3_FRAMES = TL.total;
type K = keyof typeof TL.lines;
const S = (k: K) => TL.lines[k].start;
const E = (k: K) => TL.lines[k].start + TL.lines[k].dur;
/** frame at fraction t of line k */
const A = (k: K, t: number) => TL.lines[k].start + Math.round(TL.lines[k].dur * t);
const ENV = TL.env as Record<string, number[]>;
const env = (k: K, f: number) => { const e = ENV[k]; const i = f - S(k); return e && i >= 0 && i < e.length ? e[i] : 0; };
const blinkAt = (f: number, every = 70, seed = 0) => { const d = (f + seed * 23) % every; return d < 6 ? [0.5, 1, 1, 0.6, 0.2, 0][d] : 0; };
const idle = (f: number, seed = 0): Pose => ({ blink: blinkAt(f, 70 + seed * 7, seed), breathe: Math.sin(f / 16 + seed), head: Math.sin(f * 0.05 + seed) * 2 });
const walkP = (f: number, on: boolean, speed = 0.32): Pose => (on ? { walk: 1, phase: f * speed } : {});
const scene = (f: number) => TL.scenes.find((s) => f >= s.a && f < s.b) ?? TL.scenes[TL.scenes.length - 1];

// Episode 3 cast (appearance generic, period uniforms; people stay chibi, never photos)
const MOODY: Spec = { ...LIGHTOLLER, id: "moody", name: "James Moody", hair: PAL.hairDark, skin: PAL.skinLight, scale: 0.95 };
const BOXHALL: Spec = { ...LIGHTOLLER, id: "boxhall", name: "Joseph Boxhall", hair: "#8a5a3a", scale: 0.96 };
const HICHENS: Spec = { ...LEE, id: "hichens", name: "Robert Hichens", main: "#2c3a5e", hat: undefined };
const ROWE: Spec = { ...WORKER(1), id: "rowe", name: "George Rowe", main: "#2c3a5e", mainDark: "#1d2742", hat: "sailor", hatColor: "#1d2742" };
const CARPENTER: Spec = { ...WORKER(0), id: "carp", name: "", main: "#5a4a3c", mainDark: "#3e3229" };
const CLERK = (i: number): Spec => ({ id: `clerk${i}`, name: "", skin: [PAL.skinLight, PAL.skinMid][i % 2], hair: [PAL.hairDark, PAL.hairBrown, "#8a5a3a"][i % 3], hairStyle: i % 2 ? "sidepart" : "short", beard: i === 1 ? "moustache" : undefined, beardColor: PAL.hairDark, outfit: "suit", main: ["#3a3b46", "#4a3f36", "#2f3a4a"][i % 3], mainDark: "#22232a" });
const COTTAM: Spec = { ...PHILLIPS, id: "cottam", name: "Harold Cottam", hair: PAL.hairBrown, main: "#2b3a2e", mainDark: "#1d2a20", trim: "#4a6a52" };
const PLAYER2: Spec = { ...RICH_M, id: "pl2", hair: PAL.hairDark, beard: "moustache", beardColor: PAL.hairDark };
const PLAYER3: Spec = { ...RICH_M, id: "pl3", hair: PAL.hairBrown, beard: undefined, main: "#3a2e2a" };

const BIG = (x: number, y: number, t: string, c = "#fff7e6", fs = 44, w?: number) => {
  const ww = w ?? t.length * fs * 0.72 + 90;
  return <g transform={`translate(${x} ${y})`}><rect x={-ww / 2} y={-fs * 1.05} width={ww} height={fs * 1.9} rx={fs * 0.95} fill={c} stroke={INK} strokeWidth={6} /><text y={fs * 0.33} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={INK}>{t}</text></g>;
};
const pop = (f: number, a: number, node: React.ReactNode, key: string, x = 0, y = 0) => f >= a ? <g key={key} transform={`translate(${x} ${y}) scale(${prog(f, a, a + 7)})`}>{node}</g> : null;

const QuoteCard: React.FC<{ text: string[]; src: string }> = ({ text, src }) => (
  <g>
    <rect x={-600} y={-200} width={1200} height={400} rx={24} fill="#fbf4e4" stroke={INK} strokeWidth={8} />
    <text x={-540} y={-110} fontFamily="Georgia, serif" fontWeight={700} fontSize={120} fill="#d9cdb3">“</text>
    {text.map((t, i) => <text key={i} y={-30 + i * 76} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={58} fill={INK}>{t}</text>)}
    <text y={160} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={28} fill="#7b2f2a">{src}</text>
  </g>
);
/** a 90-minute dial: Andrews' estimate, with the part already used shaded */
const EstimateDial: React.FC<{ used: number; label: string }> = ({ used, label }) => {
  const a = used * Math.PI * 2, r = 170;
  return (
    <g>
      <circle r={200} fill="#fbf4e4" stroke={INK} strokeWidth={9} />
      {used > 0 && <path d={`M 0 0 L 0 ${-r} A ${r} ${r} 0 ${used > 0.5 ? 1 : 0} 1 ${Math.sin(a) * r} ${-Math.cos(a) * r} Z`} fill="#c0473f" opacity={0.75} />}
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={0} y1={-190} x2={0} y2={-160} stroke={INK} strokeWidth={7} transform={`rotate(${i * 60})`} />)}
      <text y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={INK} opacity={0.0}>.</text>
      <circle r={14} fill={INK} />
      <g transform="translate(0 270)"><rect x={-230} y={-44} width={460} height={80} rx={40} fill="#ffd84a" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>{label}</text></g>
    </g>
  );
};

export const Ep3: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFonts();
  if (!ok) return null;
  const noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  const sc = scene(f), name = sc.name;
  const pz = (z0: number, z1: number) => lerp(z0, z1, prog(f, sc.a, sc.b));
  let svg: React.ReactNode = null; const over: React.ReactNode[] = [], top: React.ReactNode[] = [], html: React.ReactNode[] = [];
  let hideCaps = false;
  const grade = (id: string, tint: string, pools: { x: number; y: number; r: number; c: string; a?: number; flicker?: number }[] = [], vig = 0.5) => over.push(<Grade key={`g${id}`} f={f} id={id} tint={tint} pools={pools} vig={vig} />);
  const nightDeck = (stage: React.ReactNode, camX = 0, zoom = 1.15, focusY = 640) => <Deck f={f} camX={camX} zoom={zoom} focusY={focusY} stage={stage} dim={0.42} />;
  const radio = (spec: Spec, pose: Pose, pile: number, clock = "", who: "titanic" | "californian" = "titanic") => <RadioRoom f={f} spec={spec} pose={{ blink: blinkAt(f, 60, 4), ...pose }} pile={pile} clock={clock} flash={0} who={who} />;
  const tapping: Pose = { write: 1, armL: -38, armR: -30 - Math.abs(Math.sin(f * 1.1)) * 14, look: Math.sin(f * 0.2) * 0.3, mouth: "flat" };
  const shiver = Math.sin(f * 0.9) * 1.2;
  const bellHits = [S("N01") - 6, S("N01") + 8, S("N01") + 22];

  switch (name) {
    // ------------------------------------------------------------ cold open
    case "bell": {
      svg = <Cam z={pz(1.0, 1.12)} cy={520}><BellInsert f={f} hits={bellHits} /></Cam>;
      grade("bell", "night", [{ x: 960, y: 420, r: 500, c: "#ffd27a", a: 0.3 }], 0.7);
      break;
    }
    case "phone": {
      const ph = S("F1") - 10;
      svg = <Cam z={pz(1.05, 1.25)} cx={900} cy={560}><CrowsNest f={f} fleet={{ sway: shiver, look: 0.6, eyes: "wide", brow: 1, armR: 120, talk: env("F1", f), mouth: "o", blink: blinkAt(f, 66, 4) }} lee={{ sway: -shiver, look: 0.7, eyes: "wide", mouth: "o", blink: blinkAt(f, 72, 6) }} fleetSpec={FLEET} leeSpec={LEE} bell={bellHits[2]} phone berg={1} /></Cam>;
      grade("ph", "night", [], 0.65);
      html.push(<NameTag key="fl" f={f} a={A("N02", 0.2)} dur={ph - A("N02", 0.2)} x={820} y={330} name="Frederick Fleet" role="lookout" color="#2c3a5e" />);
      html.push(<NameTag key="le" f={f} a={A("N02", 0.45)} dur={60} x={1130} y={330} name="Reginald Lee" role="lookout" color="#2c3a5e" />);
      html.push(<SpeechBubble key="f1" f={f} a={S("F1") - 2} b={sc.b} x={560} y={300} tx={760} ty={420} text="Iceberg right ahead." width={520} color="#fff7d6" />);
      html.push(<Label key="lf" f={f} a={S("F1")} b={sc.b} x={560} y={130} text="his words, as he recalled them" />);
      break;
    }
    case "thanks": {
      svg = <Cam z={1.35} cx={1240} cy={640}><Bridge f={f} murdoch={{ look: -0.4, armR: 120, talk: env("O1", f), mouth: "smile", eyes: "normal", blink: blinkAt(f, 70, 9) }} mSpec={MOODY} helm={HICHENS} wheel={0} berg={0.25} shake={0} /></Cam>;
      grade("th", "lamp", [{ x: 1240, y: 300, r: 500, c: "#ffd27a", a: 0.35 }], 0.6);
      html.push(<SpeechBubble key="o1" f={f} a={sc.a} b={sc.b} x={1500} y={300} tx={1300} ty={430} text="Thank you." width={380} color="#fff7d6" />);
      break;
    }
    case "hook": {
      svg = <Cam z={pz(1, 1.1)} cy={600}><NightSea f={f} shipX={lerp(600, 760, prog(f, sc.a, sc.b))} berg={0.6} bergX={1650} scale={0.62} /></Cam>;
      grade("hk", "night", [], 0.7);
      top.push(<rect key="dk" width={1920} height={1080} fill="#060a1c" opacity={0.45} />);
      top.push(pop(f, A("N03", 0.05), <g><g transform="scale(0.55)"><BellInsertMini /></g>{BIG(0, 170, "3 BELLS", "#ffd84a", 44)}</g>, "b3", 620, 430));
      top.push(pop(f, A("N03", 0.55), <g><rect x={-260} y={-120} width={520} height={200} rx={30} fill="#fff7d6" stroke={INK} strokeWidth={8} /><text y={10} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontWeight={700} fontSize={84} fill={INK}>“Thank you.”</text>{BIG(0, 170, "2 POLITE WORDS", "#fff7e6", 40)}</g>, "ty", 1300, 430));
      break;
    }
    case "hook2": {
      const p = prog(f, sc.a, sc.b);
      svg = <Cam z={pz(1, 1.15)} cy={600}><NightSea f={f} shipX={lerp(760, 1000, p)} scale={0.62} /></Cam>;
      grade("hk2", "night", [{ x: 1000, y: 650, r: 400, c: "#ffd27a", a: 0.2 }], 0.7);
      const c1 = A("N04", 0.55), c2 = A("N04", 0.75);
      top.push(pop(f, c1, <g transform="scale(0.8)"><Clock f={f} h={11} m={40} label="11:40 P.M." /></g>, "c1", 560, 400));
      if (f >= c2) top.push(<g key="ar" opacity={prog(f, c2, c2 + 8)}><path d="M 760 400 L 1150 400" stroke="#ffd84a" strokeWidth={14} strokeDasharray="26 18" /><path d="M 1150 370 L 1200 400 L 1150 430 Z" fill="#ffd84a" /></g>);
      top.push(pop(f, A("N04", 0.82), <g transform="scale(0.8)"><Clock f={f} h={12} m={45} label="12:45 A.M." /></g>, "c2", 1360, 400));
      top.push(pop(f, A("N04", 0.9), BIG(0, 0, "ICEBERG → FIRST LIFEBOAT", "#fff7e6", 40), "ib", 960, 820));
      break;
    }
    case "title": {
      hideCaps = true;
      const p = prog(f, sc.a, sc.a + 8), bob = Math.sin(f * 0.08) * 6;
      svg = (<g>
        <SeaSky f={f} mode="night" horizon={760} />
        <g transform={`translate(${lerp(1100, 800, prog(f, sc.a, sc.b))} ${880 + bob}) scale(-0.62 0.62)`}><Titanic f={f} night /></g>
        <g transform="translate(0 880)"><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g>
        <g transform="translate(1600 870) scale(0.55)"><Iceberg /></g>
        <g transform={`translate(960 300) scale(${0.8 + 0.2 * p})`} opacity={p}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={128} fill="#fff4dc" stroke={INK} strokeWidth={15} paintOrder="stroke" letterSpacing={4}>TITANIC: THE REAL STORY</text>
          <g transform="translate(0 100) rotate(-2)" opacity={prog(f, sc.a + 8, sc.a + 14)}>
            <rect x={-420} y={-58} width={840} height={88} rx={44} fill="#ffd84a" stroke={INK} strokeWidth={7} />
            <text x={0} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={INK}>EPISODE 3 · THE ICEBERG</text>
          </g>
        </g>
        <Sparkles f={f} x={960} y={300} spread={560} n={10} seed={7} />
      </g>);
      grade("tt", "night", [{ x: 960, y: 300, r: 700, c: "#ffd2a0", a: 0.25 }], 0.5);
      break;
    }
    // ------------------------------------------------------------ part 1: less than a minute
    case "ch1": hideCaps = true; svg = <Chapter f={f} a={sc.a} b={sc.b} n="PART 1" title="LESS THAN A MINUTE" />; break;
    case "rewind": case "rewind2": {
      const p = prog(f, sc.a, sc.b), rw = name === "rewind" ? 1 - prog(f, sc.a, sc.a + 24) : 0;
      svg = <Cam z={pz(1.12, 1.0)} cy={600}><NightSea f={f + (rw > 0 ? -rw * 40 : 0)} shipX={name === "rewind" ? lerp(1000, 640, prog(f, sc.a, sc.a + 24)) + (f - sc.a) * 0.4 : lerp(740, 900, p)} scale={0.62} /></Cam>;
      grade("rw", "night", [], 0.7);
      if (rw > 0) top.push(<g key="vh" opacity={rw}>{Array.from({ length: 8 }, (_, i) => <rect key={i} x={0} y={(i * 137 + f * 40) % 1080} width={1920} height={8} fill="#fff" opacity={0.25} />)}<g transform="translate(160 140)"><path d="M 0 0 L -50 30 L 0 60 Z M 50 0 L 0 30 L 50 60 Z" fill="#fff" /></g></g>);
      if (name === "rewind") html.push(<Stamp key="st" f={f} a={A("N05", 0.3)} b={sc.b} text="Sunday, 14 April 1912" sub="a little before 11:40 p.m." />);
      else {
        top.push(pop(f, A("N06", 0.1), BIG(0, 0, "≈ 22 KNOTS", "#fff7e6", 46), "kn", 520, 280));
        top.push(pop(f, A("N06", 0.5), BIG(0, 0, "FLAT CALM", "#cfe8f5", 46), "fc", 1000, 280));
        top.push(pop(f, A("N06", 0.75), BIG(0, 0, "NO MOON", "#ff8a7a", 46), "nm", 1430, 280));
      }
      break;
    }
    case "nest": case "nest2": {
      const spot = name === "nest" ? prog(f, A("N07", 0.6), A("N07", 0.72)) : 1;
      const bells = name === "nest2" ? [A("N08", 0.62), A("N08", 0.62) + 10, A("N08", 0.62) + 20] : [];
      const bellAt = bells.filter((b) => f >= b).pop() ?? -99;
      const phone = name === "nest2" && f >= A("N08", 0.85);
      const fleetPose: Pose = { sway: shiver, look: spot > 0.5 ? 0.7 : Math.sin(f * 0.05) * 0.6, eyes: spot > 0.5 ? "wide" : "squint", brow: spot > 0.5 ? 1 : 0, blink: blinkAt(f, 66, 4), armL: bellAt > 0 && f - bellAt < 8 ? 110 : 0, armR: phone ? 120 : 0, mouth: spot > 0.5 ? "o" : "flat" };
      const leePose: Pose = { sway: -shiver, look: spot > 0.5 ? 0.7 : -Math.sin(f * 0.05 + 1) * 0.6, eyes: spot > 0.5 ? "wide" : "squint", blink: blinkAt(f, 72, 6), mouth: spot > 0.5 ? "o" : "flat" };
      svg = <Cam z={name === "nest" ? pz(1, 1.12) : pz(1.12, 1.25)} cy={560}><CrowsNest f={f} fleet={fleetPose} lee={leePose} fleetSpec={FLEET} leeSpec={LEE} bell={bellAt} phone={phone} berg={spot} /></Cam>;
      grade("ns", "night", [], 0.65);
      if (name === "nest") {
        html.push(<NameTag key="rl" f={f} a={A("N07", 0.15)} dur={50} x={1130} y={330} name="Reginald Lee" role="lookout" color="#2c3a5e" />);
        top.push(<EmptyHook key="eh" f={f} p={prog(f, A("N07", 0.3), A("N07", 0.38)) * (1 - prog(f, A("N07", 0.58), A("N07", 0.62)))} x={1500} y={300} />);
        if (f >= A("N07", 0.3) && f < A("N07", 0.6)) html.push(<Label key="nb" f={f} a={A("N07", 0.3)} b={A("N07", 0.6)} x={1500} y={490} text="no binoculars in the nest" />);
        if (spot > 0) top.push(<ShockLines key="sk" t={f - A("N07", 0.62)} x={700} y={360} s={2.4} />);
      } else {
        if (f >= A("N08", 0.05) && f < A("N08", 0.58)) hideCaps = true;
        top.push(<Card key="tb" f={f} a={A("N08", 0.05)} b={A("N08", 0.58)} x={1350} y={460} rot={3} s={0.8} dim={0.3}><QuoteCard text={["“as large as those two", "tables put together”"]} src="Fleet, US Senate inquiry, 23 April 1912" /></Card>);
      }
      break;
    }
    case "moody": {
      const turn = A("N09", 0.5);
      svg = <Cam z={pz(1.05, 1.15)} cx={1100} cy={560}><Bridge f={f} murdoch={{ ...idle(f, 2), look: f > turn ? 0.5 : -0.3, eyes: f > turn ? "wide" : "normal", brow: f > turn ? 1 : 0, mouth: "flat" }} mSpec={MURDOCH} helm={HICHENS} wheel={0} berg={0.3} shake={0} /><Chibi spec={MOODY} pose={{ ...idle(f, 3), armR: f < turn ? 120 : 70, look: f < turn ? 0.3 : -0.6, mouth: f > turn && f < turn + 40 ? "o" : "flat", talk: f > turn && f < turn + 40 ? Math.abs(Math.sin(f * 0.6)) * 0.7 : 0 }} x={1690} y={1110} size={560} facing={-1} /></Cam>;
      grade("mo", "lamp", [{ x: 1300, y: 300, r: 600, c: "#ffd27a", a: 0.35 }], 0.6);
      html.push(<NameTag key="mo" f={f} a={A("N09", 0.0)} dur={turn - A("N09", 0.0)} x={1620} y={360} name="James Moody" role="Sixth Officer" color="#22304f" />);
      html.push(<NameTag key="mu" f={f} a={A("N09", 0.62)} dur={sc.b - A("N09", 0.62)} x={1260} y={430} name="William Murdoch" role="First Officer, in charge" color="#c0473f" />);
      break;
    }
    case "film1": {
      hideCaps = false;
      const real = A("N10", 0.45);
      svg = <Cam z={pz(1, 1.05)}><FilmVsReal f={f} a={sc.a} real={real} film={["the lookouts are distracted,", "watching two lovers on deck"]} realText={["Fleet: he struck the bell", "“as soon as I saw it”"]}>
        <g transform="translate(1440 470)"><g transform="scale(0.5)"><BellInsertMini /></g></g>
        <Chibi spec={FLEET} pose={{ ...idle(f, 1), eyes: "wide", brow: 1, armL: 110, mouth: "o" }} x={1240} y={700} size={360} />
        <Chibi spec={LEE} pose={{ ...idle(f, 2), eyes: "wide", mouth: "o", look: 0.5 }} x={1660} y={700} size={360} facing={-1} />
      </FilmVsReal></Cam>;
      html.push(<Label key="lb" f={f} a={real + 10} b={sc.b} x={1440} y={210} text="British inquiry, 1912" />);
      break;
    }
    case "order": {
      const wheel = -lerp(0, 120, prog(f, S("M1"), sc.b));
      svg = <Cam z={pz(1.15, 1.3)} cx={1150} cy={620}><Bridge f={f} murdoch={{ look: -0.5, talk: env("M1", f), eyes: "wide", brow: 1, armR: f >= S("M1") ? 110 : 30, blink: blinkAt(f, 70, 9), mouth: "o" }} mSpec={MURDOCH} helm={HICHENS} wheel={wheel} berg={0.55} shake={0} /></Cam>;
      grade("or", "lamp", [{ x: 1300, y: 300, r: 600, c: "#ffd27a", a: 0.3 }], 0.6);
      html.push(<SpeechBubble key="m1" f={f} a={S("M1") - 2} b={sc.b} x={1500} y={300} tx={1280} ty={430} text="Hard-a-starboard!" width={560} color="#fff7d6" />);
      html.push(<Label key="lm" f={f} a={S("M1")} b={sc.b} x={1500} y={130} text="the order, as Boxhall recalled it" />);
      break;
    }
    case "tiller": {
      const push = prog(f, A("N12", 0.45), A("N12", 0.6)), swing = prog(f, A("N12", 0.62), A("N12", 0.95));
      svg = <TillerMech f={f} push={push} swing={swing} labels={prog(f, A("N12", 0.3), A("N12", 0.38))} />;
      if (f < A("N12", 0.3)) top.push(<g key="rt" opacity={1 - prog(f, A("N12", 0.25), A("N12", 0.3))}>{BIG(960, 300, "“STARBOARD” = RIGHT … ?", "#fff7e6", 52)}</g>);
      html.push(<Stamp key="ys" f={f} a={sc.a} b={A("N12", 0.25)} text="You see..." />);
      break;
    }
    case "wheel": {
      const wheel = -lerp(120, 360, prog(f, sc.a, sc.b));
      svg = <Cam z={pz(1.3, 1.45)} cx={760} cy={760}><Bridge f={f} murdoch={{ look: 0.5, eyes: "wide", brow: 1, armR: 120, mouth: "flat", blink: blinkAt(f, 70, 9) }} mSpec={MURDOCH} helm={HICHENS} wheel={wheel} berg={0.75} shake={0} /></Cam>;
      grade("wh", "lamp", [{ x: 760, y: 500, r: 500, c: "#ffd27a", a: 0.3 }], 0.6);
      html.push(<NameTag key="hi" f={f} a={A("N13", 0.4)} dur={sc.b - A("N13", 0.4)} x={620} y={400} name="Robert Hichens" role="Quartermaster, at the wheel" color="#2c3a5e" />);
      top.push(pop(f, A("N13", 0.12), <g><rect x={-200} y={-70} width={400} height={140} rx={24} fill="#e3b14a" stroke={INK} strokeWidth={7} /><text y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={INK}>ENGINE ROOM</text><text y={42} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={30} fill={INK}>telegraph rung</text></g>, "et", 1500, 260));
      break;
    }
    case "clock37": {
      const run = prog(f, sc.a + 4, A("N14", 0.4)), cross = prog(f, A("N14", 0.5), A("N14", 0.58)), honest = A("N14", 0.82);
      svg = <g><rect width={1920} height={1080} fill="#0b1430" />{Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 211) % 1920} cy={(i * 97) % 1080} r={2 + (i % 3)} fill="#fff" opacity={0.4} />)}</g>;
      top.push(<g key="sw" transform={`translate(${f < honest ? 960 : lerp(960, 600, prog(f, honest, honest + 10))} 470) scale(${prog(f, sc.a, sc.a + 8) * 1.05})`}><Stopwatch f={f} sec={37 * run} cross={cross} label={cross > 0 ? "a test on OLYMPIC, not that night" : undefined} /></g>);
      top.push(pop(f, honest, BIG(0, 0, "LESS THAN A MINUTE", "#ffd84a", 58), "lt", 1360, 470));
      break;
    }
    case "turn": {
      svg = <TopTurn f={f} turn={prog(f, sc.a, sc.b)} slide={prog(f, sc.a, sc.b) * 0.6} />;
      grade("tu", "night", [], 0.55);
      top.push(pop(f, A("N15", 0.4), BIG(0, 0, "≈ 2 POINTS (≈ 20°) TO PORT", "#fff7e6", 40), "pt", 1300, 180));
      break;
    }
    case "hit": {
      const shake = prog(f, sc.a, sc.a + 4) * (1 - prog(f, sc.b - 10, sc.b));
      svg = (<g transform={`translate(${Math.sin(f * 2.3) * 10 * shake} ${Math.cos(f * 1.9) * 6 * shake})`}>
        <TopTurn f={f} turn={1} slide={lerp(0.6, 1, prog(f, sc.a, sc.b))} hit={1} />
      </g>);
      grade("hi", "night", [], 0.55);
      top.push(<ShockLines key="sl" t={f - sc.a} x={1100} y={420} s={3} />);
      break;
    }
    case "rowe": {
      const watch = A("N17", 0.62);
      svg = <Cam z={pz(1.2, 1.3)} cx={960} cy={660}>{nightDeck(<Chibi spec={ROWE} pose={{ ...idle(f, 2), sway: f < A("N17", 0.35) ? 0 : Math.sin(f * 0.8) * 2, armR: f >= watch - 10 ? 100 : 10, look: f >= watch - 10 ? 0.3 : 0.6, eyes: f >= A("N17", 0.3) ? "wide" : "normal", mouth: "flat" }} x={900} y={1030} size={560} />, 0, 1.15)}</Cam>;
      grade("ro", "night", [{ x: 900, y: 400, r: 600, c: "#ffd27a", a: 0.2 }], 0.65);
      over.push(<Fg key="fg" kind="rail" f={f} />);
      html.push(<NameTag key="rw" f={f} a={A("N17", 0.05)} dur={watch - A("N17", 0.05)} x={900} y={330} name="George Rowe" role="Quartermaster, at the stern" color="#2c3a5e" />);
      top.push(pop(f, watch, <g transform="scale(0.95)"><Clock f={f} h={11} m={40} label="11:40 P.M." /></g>, "wt", 1450, 430));
      break;
    }
    case "doors": {
      const pull = prog(f, A("N18", 0.2), A("N18", 0.35)), drop = prog(f, A("N18", 0.35), A("N18", 0.75));
      svg = <DoorsCut f={f} pull={pull} drop={drop} />;
      grade("dr", "none", [], 0.45);
      break;
    }
    case "doors2": {
      svg = <Cam z={1.15} cx={1200} cy={600}><Bridge f={f} murdoch={{ look: 0.6, talk: env("M2", f), eyes: "normal", brow: 0.5, mouth: "flat", blink: blinkAt(f, 70, 9) }} mSpec={MURDOCH} helm={HICHENS} wheel={-360} berg={0} shake={0} /><Chibi spec={SMITH} pose={{ ...idle(f, 1), ...walkP(f, f < sc.a + 18, 0.5), look: -0.5, talk: env("S1", f), eyes: "wide", brow: 1, mouth: "o", armR: 40 }} x={lerp(1950, 1690, prog(f, sc.a, sc.a + 18))} y={1110} size={600} facing={-1} /></Cam>;
      grade("d2", "lamp", [{ x: 1300, y: 300, r: 600, c: "#ffd27a", a: 0.3 }], 0.6);
      html.push(<NameTag key="sm" f={f} a={sc.a + 4} dur={S("S1") - sc.a - 2} x={1650} y={420} name="Captain Edward Smith" role="Titanic" color="#22304f" />);
      html.push(<SpeechBubble key="s1" f={f} a={S("S1") - 2} b={E("S1") + 6} x={1560} y={290} tx={1650} ty={440} text="Close the watertight door." width={520} color="#fff7d6" />);
      html.push(<SpeechBubble key="m2" f={f} a={S("M2") - 2} b={sc.b} x={900} y={290} tx={1200} ty={430} text="They are already closed." width={500} color="#fff7d6" />);
      html.push(<Label key="lb" f={f} a={S("S1")} b={sc.b} x={1200} y={100} text="as Hichens recalled it (British inquiry)" />);
      break;
    }
    // ------------------------------------------------------------ part 2: ice for this
    case "ch2": hideCaps = true; svg = <Chapter f={f} a={sc.a} b={sc.b} n="PART 2" title="ICE FOR THIS" c="#9fd2ff" />; break;
    case "beesley": {
      const q = A("N19", 0.62);
      svg = <Cam z={pz(1.1, 1.2)} cx={900} cy={600}><Cabin f={f} night><Chibi spec={BEESLEY} pose={{ ...idle(f, 2), look: f > A("N19", 0.2) ? 0.3 : -0.2, eyes: f > A("N19", 0.2) ? "normal" : "squint", armR: 40, mouth: "flat", sway: f > A("N19", 0.1) && f < A("N19", 0.2) ? Math.sin(f) * 3 : 0 }} x={900} y={1000} size={540} /></Cabin></Cam>;
      grade("be", "lamp", [{ x: 600, y: 300, r: 500, c: "#ffd27a", a: 0.45, flicker: 0.08 }], 0.55);
      html.push(<NameTag key="bs" f={f} a={A("N19", 0.22)} dur={q - A("N19", 0.22)} x={900} y={330} name="Lawrence Beesley" role="second class, science teacher" color="#4a4a5a" />);
      if (f >= q) hideCaps = true;
      top.push(<Card key="qc" f={f} a={q} b={sc.b + 2} y={460} rot={-2} dim={0.4}><QuoteCard text={["“nothing more than", "an extra heave of the engines”"]} src="Lawrence Beesley, The Loss of the S.S. Titanic (1912)" /></Card>);
      break;
    }
    case "steam": {
      const p = prog(f, sc.a, sc.b), sx = lerp(860, 900, p);
      svg = (<g><SeaSky f={f} mode="night" horizon={760} />
        <g transform={`translate(${sx} 880) scale(0.62)`}><Titanic f={f} night /></g>
        {f >= A("N20", 0.3) && [-300, -95, 110].map((dx, i) => <Steam key={i} f={f + i * 17} x={sx + dx * 0.62 * -1 + 40} y={480} s={prog(f, A("N20", 0.3), A("N20", 0.45)) * 1.2} />)}
        <g transform="translate(0 880)"><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g></g>);
      grade("stm", "night", [], 0.65);
      top.push(pop(f, A("N20", 0.05), BIG(0, 0, "ENGINES STOPPED", "#fff7e6", 44), "es", 480, 240));
      top.push(pop(f, A("N20", 0.4), BIG(0, 0, "ROARING STEAM", "#ffd84a", 44), "rs", 1420, 240));
      break;
    }
    case "smoke": {
      const g1 = S("G1");
      const players = [RICH_M, PLAYER2, PLAYER3];
      svg = <Cam z={f < g1 ? pz(1.05, 1.15) : 1.3} cx={f < g1 ? 960 : 820} cy={640}><SmokingRoom f={f}>
        {players.map((s, i) => <Chibi key={s.id} spec={s} pose={{ ...idle(f, i), look: i === 0 ? 0.4 : -0.3, armR: i === 0 && f >= g1 ? 80 : 30, talk: i === 0 ? env("G1", f) : 0, mouth: i === 0 && f >= g1 ? "grin" : "smile", eyes: "normal" }} x={[760, 1180, 1420][i]} y={1020} size={420} facing={i === 0 ? 1 : -1} />)}
        <rect x={860} y={860} width={460} height={40} rx={12} fill="#2e5a3a" stroke={INK} strokeWidth={5} />
        <g transform="translate(930 830) scale(0.35)"><Glass f={f} ice={0} /></g>
      </SmokingRoom></Cam>;
      grade("sm", "lamp", [{ x: 960, y: 300, r: 700, c: "#ffd27a", a: 0.45, flicker: 0.1 }], 0.55);
      over.push(<Fg key="fg" kind="glass" f={f} />);
      if (f < g1) top.push(pop(f, A("N21", 0.05), <g><IcePile x={0} y={0} s={1.3} />{BIG(0, 140, "≈ A COUPLE OF TONS OF ICE", "#cfe8f5", 38)}</g>, "ip", 1350, 380));
      html.push(<SpeechBubble key="g1" f={f} a={g1 - 2} b={sc.b} x={620} y={290} tx={760} ty={460} text="Just run along the deck and see if any ice has come aboard. I would like some for this." width={720} color="#fff7d6" />);
      html.push(<Label key="lg" f={f} a={g1} b={sc.b} x={1450} y={880} text="as Beesley recalled it (1912)" />);
      if (f >= A("G1", 0.75)) top.push(<Card key="gl" f={f} a={A("G1", 0.75)} b={sc.b + 2} x={1450} y={520} rot={4} s={0.9} dim={0.2}><Glass f={f} ice={prog(f, A("G1", 0.8), A("G1", 0.95))} /></Card>);
      break;
    }
    case "icedeck": {
      const kids = [EMIGRANT(1), EMIGRANT(2), RICH_W];
      svg = <Cam z={pz(1.15, 1.25)} cx={960} cy={680}>{nightDeck(<g>
        <IcePile x={1000} y={980} s={1.6} />
        {kids.map((s, i) => <Chibi key={s.id} spec={s} pose={{ ...idle(f, i), armR: i === 1 ? 120 + Math.sin(f * 0.3) * 20 : 40, mouth: "grin", eyes: "happy", look: 0.3 }} x={[620, 1350, 1600][i]} y={1025} size={430} facing={i ? -1 : 1} />)}
        <g transform={`translate(${1250 + Math.sin(f * 0.15) * 60} ${880 - Math.abs(Math.sin(f * 0.15)) * 80})`}><path d="M -20 8 L -6 -18 L 12 -10 L 20 8 L 0 16 Z" fill="#eef6fb" stroke={INK} strokeWidth={4} /></g>
      </g>, 0, 1.15)}</Cam>;
      grade("id", "night", [{ x: 1000, y: 500, r: 600, c: "#ffd27a", a: 0.2 }], 0.65);
      break;
    }
    case "mail": case "mail2": {
      const water = name === "mail" ? 0 : prog(f, sc.a, sc.b) * 0.45;
      const clerks = [0, 1, 2, 3, 4].map((i) => CLERK(i));
      const carry = name === "mail2";
      svg = <Cam z={pz(1.05, 1.15)} cy={600}><MailRoom f={f} water={water}>
        {clerks.map((s, i) => <Chibi key={s.id} spec={s} pose={{ ...idle(f, i), ...walkP(f, carry, 0.4), armR: carry ? 120 : i === 2 ? 130 + Math.sin(f * 0.4) * 20 : 30, armL: carry ? 120 : 20, mouth: carry ? "flat" : "grin", eyes: carry ? "wide" : "happy", look: carry ? 0.6 : (i - 2) * -0.2 }} x={carry ? 200 + i * 300 + ((f - sc.a) * 2.2) % 300 : 420 + i * 270} y={1000} size={400} facing={carry ? 1 : i < 2 ? 1 : -1} />)}
        {carry && clerks.map((_, i) => <g key={`s${i}`} transform={`translate(${200 + i * 300 + ((f - sc.a) * 2.2) % 300 + 40} 560) scale(0.55)`}><path d="M -70 60 Q -90 -40 -40 -90 L 40 -90 Q 90 -40 70 60 Z" fill="#c9b48a" stroke={INK} strokeWidth={6} /></g>)}
      </MailRoom></Cam>;
      grade("ml", "lamp", [{ x: 960, y: 200, r: 700, c: "#ffd27a", a: 0.4, flicker: 0.1 }], 0.55);
      if (name === "mail") {
        top.push(<Card key="bd" f={f} a={A("N23", 0.5)} b={sc.b + 2} x={1480} y={420} rot={4} s={0.8} dim={0.2}><g><rect x={-260} y={-170} width={520} height={340} rx={20} fill="#fbf4e4" stroke={INK} strokeWidth={8} /><text y={-90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#c0473f">15 APRIL</text><text y={-20} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={40} fill={INK}>Oscar Woody's</text><text y={36} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={40} fill={INK}>birthday</text><text y={120} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={26} fill="#7b2f2a">US sea-post clerk</text></g></Card>);
        html.push(<Label key="rp" f={f} a={A("N23", 0.1)} b={A("N23", 0.5)} x={960} y={200} text="5 sea-post clerks: 3 American, 2 British" />);
      } else top.push(pop(f, A("N24", 0.55), BIG(0, 0, "REGISTERED MAIL FIRST", "#fff7e6", 40), "rm", 1400, 240));
      break;
    }
    // ------------------------------------------------------------ part 3: six compartments
    case "ch3": hideCaps = true; svg = <Chapter f={f} a={sc.a} b={sc.b} n="PART 3" title="SIX COMPARTMENTS" c="#ff8a7a" />; break;
    case "boxhall": {
      const carp = A("N25", 0.72);
      svg = <Cam z={pz(1.05, 1.15)} cx={900} cy={620}><Stairs f={f}>
        <Chibi spec={BOXHALL} pose={{ ...idle(f, 2), ...walkP(f, f < A("N25", 0.4), 0.35), look: f >= carp ? 0.6 : 0.2, eyes: f >= S("K1") ? "wide" : "normal", brow: f >= S("K1") ? 1 : 0, mouth: f >= S("K1") ? "o" : "flat" }} x={lerp(300, 800, prog(f, sc.a, A("N25", 0.4)))} y={1010} size={540} />
        {f >= carp - 20 && <Chibi spec={CARPENTER} pose={{ ...idle(f, 4), ...walkP(f, f < carp + 10, 0.4), look: -0.5, talk: env("K1", f), mouth: "o", eyes: "wide", brow: 1 }} x={lerp(1450, 1150, prog(f, carp - 20, carp + 10))} y={lerp(800, 1010, prog(f, carp - 20, carp + 10))} size={520} facing={-1} />}
      </Stairs></Cam>;
      grade("bx", "warm", [{ x: 200, y: 150, r: 500, c: "#fff1c4", a: 0.4 }], 0.55);
      html.push(<NameTag key="bh" f={f} a={A("N25", 0.0)} dur={A("N25", 0.4)} x={600} y={330} name="Joseph Boxhall" role="Fourth Officer" color="#22304f" />);
      html.push(<SpeechBubble key="k1" f={f} a={S("K1") - 2} b={sc.b} x={1300} y={300} tx={1150} ty={460} text="The ship is making water." width={500} color="#fff7d6" />);
      html.push(<Label key="lk" f={f} a={S("K1")} b={sc.b} x={1300} y={130} text="as Boxhall recalled it (US inquiry)" />);
      break;
    }
    case "mailhold": {
      svg = <Cam z={pz(1.15, 1.25)} cy={640}><MailRoom f={f} water={lerp(0.55, 0.75, prog(f, sc.a, sc.b))}>
        <Chibi spec={BOXHALL} pose={{ ...idle(f, 2), look: 0.4, eyes: "wide", brow: 1, mouth: "o" }} x={560} y={900} size={520} />
        <Chibi spec={CLERK(1)} pose={{ ...idle(f, 1), look: -0.5, talk: env("J1", f), mouth: "o", eyes: "wide", armR: 120 }} x={1300} y={880} size={480} facing={-1} />
      </MailRoom></Cam>;
      grade("mh", "lamp", [{ x: 960, y: 200, r: 600, c: "#ffd27a", a: 0.35, flicker: 0.15 }], 0.6);
      html.push(<SpeechBubble key="j1" f={f} a={S("J1") - 2} b={sc.b} x={1400} y={280} tx={1300} ty={430} text="The mail hold is filling rapidly." width={540} color="#fff7d6" />);
      html.push(<Label key="lj" f={f} a={S("J1")} b={sc.b} x={1400} y={110} text="as Boxhall recalled it (US inquiry)" />);
      if (f < S("J1")) top.push(pop(f, A("N26", 0.55), BIG(0, 0, "MAIL BAGS FLOATING", "#cfe8f5", 42), "mf", 1350, 240));
      break;
    }
    case "boiler6": {
      const w = prog(f, sc.a, A("N27", 0.55));
      const firemen = [WORKER(0), WORKER(1), WORKER(2)];
      const climb = prog(f, A("N27", 0.3), sc.b);
      svg = <Cam z={pz(1.0, 1.1)} cy={580}><BoilerRoom f={f}>
        {firemen.map((s, i) => <Chibi key={s.id} spec={{ ...s, main: "#55535a", mainDark: "#3e3d42" }} pose={{ ...idle(f, i), ...walkP(f, true, 0.5), armR: 140, armL: 120, look: 0.4, eyes: "wide", mouth: "o" }} x={600 + i * 300 + climb * 200} y={1010 - climb * 520 - i * 20} size={380} />)}
      </BoilerRoom></Cam>;
      const wy = lerp(1080, 560, w);
      top.push(<g key="wt"><rect x={0} y={wy} width={1920} height={1080 - wy} fill="#2e5b86" opacity={0.75} /><path d={`M 0 ${wy} ${Array.from({ length: 25 }, (_, i) => `Q ${i * 80 + 40} ${wy - 10 * Math.sin(f * 0.2 + i)} ${i * 80 + 80} ${wy}`).join(" ")}`} fill="none" stroke="#a9d1f0" strokeWidth={5} /></g>);
      top.push(<g key="ru" opacity={prog(f, sc.a + 10, sc.a + 20)}><line x1={1760} y1={1080} x2={1760} y2={540} stroke="#ffd84a" strokeWidth={8} />{Array.from({ length: 9 }, (_, i) => <line key={i} x1={1730} x2={1790} y1={1080 - i * 65} y2={1080 - i * 65} stroke="#ffd84a" strokeWidth={6} />)}{BIG(1640, 500, "8 FT", "#ffd84a", 48, 220)}</g>);
      top.push(pop(f, A("N27", 0.25), BIG(0, 0, "BOILER ROOM 6 · +10 MIN", "#fff7e6", 40), "b6", 560, 200));
      grade("b6", "fire", [{ x: 400, y: 600, r: 500, c: "#ff8a3a", a: 0.3, flicker: 0.2 }], 0.6);
      break;
    }
    case "andrews": case "andrews2": {
      const walk = true;
      svg = <Cam z={pz(1.1, 1.2)} cx={900} cy={640}><Stairs f={f}>
        <Chibi spec={ANDREWS} pose={{ ...idle(f, 2), ...walkP(f, walk, 0.32), armR: 30, look: 0.4, eyes: name === "andrews2" ? "wide" : "normal", brow: name === "andrews2" ? 1 : 0, mouth: "flat" }} x={lerp(500, 1000, prog(f, sc.a, sc.b))} y={1010} size={560} />
        <Chibi spec={SMITH} pose={{ ...idle(f, 1), ...walkP(f, walk, 0.32), look: 0.3, mouth: "flat", brow: 0.6 }} x={lerp(220, 720, prog(f, sc.a, sc.b))} y={1010} size={560} />
      </Stairs></Cam>;
      grade("an", "warm", [{ x: 200, y: 150, r: 500, c: "#fff1c4", a: 0.4 }], 0.6);
      if (name === "andrews") html.push(<NameTag key="ta" f={f} a={A("N28", 0.5)} dur={sc.b - A("N28", 0.5)} x={1000} y={330} name="Thomas Andrews" role="Harland & Wolff, her designer" color="#3f7fbf" />);
      else {
        top.push(pop(f, A("N29", 0.45), BIG(0, 0, "MAIL ROOM: FLOODING", "#cfe8f5", 40), "r1", 1420, 260));
        top.push(pop(f, A("N29", 0.7), BIG(0, 0, "SQUASH COURT: FLOODING", "#ff8a7a", 40), "r2", 1420, 400));
      }
      break;
    }
    case "damage": {
      const gash = prog(f, A("N30", 0.12), A("N30", 0.2)) * (1 - prog(f, A("N30", 0.3), A("N30", 0.36)));
      svg = <Cam z={pz(1.0, 1.06)}><HullDamage f={f} gash={gash} cracks={prog(f, A("N30", 0.38), A("N30", 0.7))} door={prog(f, A("N30", 0.7), A("N30", 0.8))} /></Cam>;
      grade("dm", "night", [], 0.5);
      top.push(pop(f, A("N30", 0.38), BIG(0, 0, "≈ 12 SQUARE FEET in total", "#fff7e6", 40), "sq", 700, 180));
      html.push(<Label key="wd" f={f} a={A("N30", 0.38)} b={sc.b} x={700} y={90} text="Edward Wilding's estimate, British inquiry" />);
      break;
    }
    case "compart": case "compart2": {
      const two = name === "compart2";
      svg = <Cam z={pz(1.0, 1.04)}><Compartments f={f} open={two ? 6 : prog(f, A("N31", 0.55), A("N31", 0.85)) > 0.5 ? 4 : 0} fill={two ? prog(f, sc.a, sc.b) : prog(f, A("N31", 0.6), A("N31", 0.95))} safe={two ? 0 : 4} /></Cam>;
      html.push(<Stamp key="ys" f={f} a={A("N31", 0)} b={A("N31", 0.25)} text="You see..." />);
      if (!two) top.push(pop(f, A("N31", 0.75), BIG(0, 0, "4 FLOODED: STILL FLOATS", "#7fd08a", 44), "f4", 960, 200));
      else top.push(pop(f, sc.a, BIG(0, 0, "THE ICEBERG OPENED 6", "#ff8a7a", 56), "o6", 960, 200));
      grade("cp", "none", [], 0.4);
      break;
    }
    case "tray": {
      const tilt = prog(f, A("N33", 0.35), A("N33", 0.5)), fill = prog(f, A("N33", 0.5), sc.b) * 0.8;
      svg = <g><rect width={1920} height={1080} fill="#22304f" /><g transform="translate(960 560)"><IceTray f={f} tilt={tilt} fill={fill} /></g></g>;
      top.push(pop(f, A("N33", 0.25), BIG(0, 0, "AN ICE CUBE TRAY", "#fff7e6", 48), "it", 960, 200));
      top.push(pop(f, A("N33", 0.05), BIG(0, 0, "WALLS OPEN AT THE TOP", "#ffd84a", 36), "wo", 960, 320));
      grade("tr", "none", [], 0.4);
      break;
    }
    case "tray2": {
      svg = <Cam z={pz(1.0, 1.1)} cy={600}><NightSea f={f} shipX={900} tilt={-1.2} sink={0.05} scale={0.62} /></Cam>;
      grade("t2", "night", [], 0.75);
      top.push(pop(f, A("N34", 0.5), BIG(0, 0, "ONLY QUESTION: WHEN?", "#fff7e6", 48), "wq", 960, 260));
      break;
    }
    case "film2": {
      const real = A("N35", 0.33);
      svg = <Cam z={pz(1, 1.06)}><FilmVsReal f={f} a={sc.a} real={real} film={["Andrews: “a mathematical", "certainty”, an hour or two"]} realText={["no one recorded his exact words", "biographer, 1912: “an hour and a half”"]}>
        <Chibi spec={ANDREWS} pose={{ ...idle(f, 2), look: 0.3, eyes: "normal", mouth: "flat", brow: 0.5 }} x={1230} y={720} size={400} />
        <g transform={`translate(1640 480) scale(${prog(f, real + 30, real + 40) * 0.75})`}><EstimateDial used={0} label="≈ 1½ HOURS" /></g>
      </FilmVsReal></Cam>;
      html.push(<Label key="bu" f={f} a={real + 10} b={sc.b} x={1440} y={210} text="Shan Bullock, Thomas Andrews, Shipbuilder (1912)" />);
      break;
    }
    case "midnight": {
      svg = <Cam z={pz(1.0, 1.08)} cy={600}><NightSea f={f} shipX={900} tilt={-1.4} sink={0.06} scale={0.62} /></Cam>;
      grade("md", "night", [], 0.75);
      top.push(<g key="ck" transform={`translate(960 470) scale(${prog(f, sc.a, sc.a + 8) * 1.2})`}><Clock f={f} h={12} m={0} label="MIDNIGHT" /></g>);
      break;
    }
    // ------------------------------------------------------------ part 4: CQD
    case "ch4": hideCaps = true; svg = <Chapter f={f} a={sc.a} b={sc.b} n="PART 4" title="C Q D" c="#ffd84a" />; break;
    case "wireless": {
      const into = A("N37", 0.42);
      if (f < into) {
        svg = <BoatLower f={f} down={0} people={0} />;
        over.push(<svg key="cr" viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>{[0, 1].map((i) => <Chibi key={i} spec={WORKER(i + 2)} pose={{ ...idle(f, i), armR: 130 + Math.sin(f * 0.3 + i) * 20, armL: 120, look: 0.4, mouth: "flat" }} x={1100 + i * 300} y={1060} size={340} />)}</svg>);
        top.push(pop(f, A("N37", 0.08), BIG(0, 0, "UNCOVER THE LIFEBOATS", "#fff7e6", 42), "ul", 1250, 160));
        grade("w0", "night", [], 0.6);
      } else {
        svg = <Cam z={1.12} cx={900} cy={620}>{radio(PHILLIPS, { ...tapping, write: 0, look: 0.6, eyes: "normal", mouth: "flat" }, 0.05, "12:00")}<Chibi spec={SMITH} pose={{ ...idle(f, 1), ...walkP(f, f < into + 20, 0.4), look: -0.5, mouth: "flat", brow: 0.6 }} x={lerp(2000, 1550, prog(f, into, into + 20))} y={1100} size={600} facing={-1} /></Cam>;
        html.push(<NameTag key="ph" f={f} a={A("N37", 0.6)} dur={sc.b - A("N37", 0.6)} x={760} y={330} name="Jack Phillips" role="senior wireless operator" color="#2c3a5e" />);
        grade("w1", "lamp", [{ x: 560, y: 300, r: 500, c: "#ffd27a", a: 0.55, flicker: 0.12 }], 0.55);
      }
      break;
    }
    case "cqd": {
      svg = <Cam z={1.15} cx={820} cy={640}>{radio(PHILLIPS, tapping, 0.05, "")}</Cam>;
      grade("cq", "lamp", [{ x: 560, y: 300, r: 500, c: "#ffd27a", a: 0.55, flicker: 0.12 }], 0.55);
      top.push(<Card key="mg" f={f} a={A("N38", 0.4)} b={sc.b + 2} x={1250} y={520} rot={3} s={0.85} dim={0.25}><Marconigram f={f} from="Titanic (MGY)" to="all ships" time="soon after midnight" prefix="CQD" lines={["CQD CQD CQD MGY", "REQUIRE ASSISTANCE", "POSITION FOLLOWS..."]} typed={prog(f, A("N38", 0.5), sc.b)} /></Card>);
      html.push(<Label key="lc" f={f} a={A("N38", 0.6)} b={sc.b} x={1250} y={150} text="CQD = the distress call of the day (MGY = Titanic)" />);
      break;
    }
    case "position": case "position2": {
      const two = name === "position2";
      svg = <Cam z={pz(1.0, 1.05)}><PositionMap f={f} cqd={two ? 1 : prog(f, A("N39", 0.55), A("N39", 0.65))} wreck={two ? prog(f, A("N40", 0.35), A("N40", 0.7)) : 0} /></Cam>;
      if (two) top.push(pop(f, A("N40", 0.1), BIG(0, 0, "WRONG POSITION", "#ff8a7a", 46), "wp", 600, 240));
      break;
    }
    case "sos": {
      const b1 = S("B1");
      svg = <Cam z={1.08} cx={960} cy={600}>{radio(f < b1 - 10 ? PHILLIPS : BRIDE, f < b1 - 10 ? tapping : { ...idle(f, 3), look: 0.4, talk: env("B1", f), mouth: f >= b1 ? "grin" : "smile", armR: 60 }, 0.05, "")}</Cam>;
      grade("so", "lamp", [{ x: 560, y: 300, r: 500, c: "#ffd27a", a: 0.55, flicker: 0.12 }], 0.55);
      html.push(<NameTag key="hb" f={f} a={A("N41", 0.2)} dur={b1 - A("N41", 0.2)} x={760} y={330} name="Harold Bride" role="junior wireless operator" color="#2c3a5e" />);
      html.push(<SpeechBubble key="b1" f={f} a={b1 - 2} b={sc.b} x={1250} y={300} tx={900} ty={460} text="Send SOS. It's the new call, and besides, this may be your last chance to send it!" width={700} color="#fff7d6" />);
      html.push(<Label key="lb" f={f} a={b1} b={sc.b} x={1500} y={880} text="Bride's own account, 1912" />);
      break;
    }
    case "sos2": {
      svg = <Cam z={pz(1.12, 1.25)} cx={820} cy={640}>{radio(PHILLIPS, { ...tapping, eyes: "squint" }, 0.05, "")}</Cam>;
      grade("s2", "lamp", [{ x: 560, y: 300, r: 450, c: "#ffd27a", a: 0.4, flicker: 0.15 }], 0.75);
      top.push(pop(f, A("N42", 0.1), <g><rect x={-300} y={-110} width={600} height={220} rx={24} fill="#fbf4e4" stroke={INK} strokeWidth={8} /><text y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill="#c0473f">S O S</text><text y={60} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={34} fill={INK}>in use since 1909</text></g>, "ss", 1420, 360));
      top.push(pop(f, A("N42", 0.5), BIG(0, 0, "CQD + SOS", "#ffd84a", 44), "cs", 1420, 620));
      break;
    }
    case "carpathia": case "carpathia2": {
      svg = <Cam z={1.12} cx={820} cy={640}>{radio(COTTAM, { ...idle(f, 2), ...(name === "carpathia" ? tapping : {}), look: 0.4, eyes: name === "carpathia2" ? "wide" : "normal", brow: name === "carpathia2" ? 1 : 0, mouth: name === "carpathia2" ? "o" : "flat" }, 0.1, "", "californian")}</Cam>;
      grade("ca", "lamp", [{ x: 560, y: 300, r: 500, c: "#ffd27a", a: 0.45, flicker: 0.1 }], 0.6);
      if (name === "carpathia") {
        html.push(<NameTag key="hc" f={f} a={A("N43", 0.25)} dur={sc.b - A("N43", 0.25)} x={760} y={330} name="Harold Cottam" role="wireless operator, Carpathia" color="#3f7a5a" />);
        top.push(pop(f, A("N43", 0.05), BIG(0, 0, "58 MILES AWAY", "#ffd84a", 46), "58", 1450, 240));
      } else {
        top.push(<Card key="t1" f={f} a={sc.a} b={sc.b + 2} x={1250} y={520} rot={-2} s={0.85} dim={0.3}><Marconigram f={f} from="Titanic (MGY)" to="Carpathia (MPA)" time="about 12:20 a.m., Titanic time" prefix="MSG" lines={["COME AT ONCE.", "WE HAVE STRUCK A BERG.", "IT IS A CQD."]} typed={prog(f, sc.a + 4, sc.b - 6)} /></Card>);
        html.push(<Label key="lt" f={f} a={sc.a + 6} b={sc.b} x={1250} y={150} text="as Cottam recalled it (US inquiry)" />);
      }
      break;
    }
    case "carpathia3": {
      svg = <Cam z={pz(1.0, 1.05)}><PositionMap f={f} cqd={1} wreck={0} carp={prog(f, A("N44", 0.45), sc.b)} /></Cam>;
      html.push(<NameTag key="ar" f={f} a={A("N44", 0.3)} dur={50} x={1500} y={300} name="Arthur Rostron" role="captain, Carpathia" color="#3f7a5a" />);
      top.push(pop(f, A("N44", 0.75), BIG(0, 0, "NORTH-WEST, INTO THE ICE", "#fff7e6", 38), "nw", 1300, 160));
      break;
    }
    // ------------------------------------------------------------ part 5: the first boat
    case "ch5": hideCaps = true; svg = <Chapter f={f} a={sc.a} b={sc.b} n="PART 5" title="THE FIRST BOAT" c="#cfe8f5" />; break;
    case "boatdeck": case "boatdeck2": {
      const people = [RICH_W, EMIGRANT(0), RICH_M, EMIGRANT(3)];
      svg = <Cam z={pz(1.15, 1.25)} cx={960} cy={660}>{nightDeck(<g>
        <Chibi spec={MURDOCH} pose={{ ...idle(f, 1), armR: name === "boatdeck" ? 110 : 60, look: 0.4, talk: name === "boatdeck" && f > A("N45", 0.55) ? Math.abs(Math.sin(f * 0.6)) * 0.6 : 0, mouth: "o" }} x={500} y={1030} size={560} />
        {people.map((s, i) => <g key={s.id}><Chibi spec={s} pose={{ ...idle(f, i + 2), look: -0.3, mouth: "flat", eyes: i % 2 ? "squint" : "normal", armR: 20, sway: Math.sin(f * 0.7 + i) * 1.5 }} x={950 + i * 230} y={1030} size={430} facing={-1} /></g>)}
      </g>, 0, 1.15)}</Cam>;
      grade("bd", "night", [{ x: 700, y: 300, r: 600, c: "#fff1c4", a: 0.2 }], 0.65);
      over.push(<Fg key="fg" kind="rail" f={f} />);
      if (name === "boatdeck") { top.push(pop(f, A("N45", 0.55), BIG(0, 0, "WOMEN AND CHILDREN INTO THE BOATS", "#fff7e6", 40), "wc", 960, 200)); html.push(<Stamp key="st" f={f} a={sc.a + 2} b={A("N45", 0.5)} text="about 12:25 a.m." />); }
      else {
        top.push(pop(f, A("N46", 0.05), BIG(0, 0, "LIFEBELTS ON", "#fff7e6", 40), "lb", 480, 200));
        top.push(pop(f, A("N46", 0.35), BIG(0, 0, "FREEZING · STEAM ROARING", "#cfe8f5", 40), "fz", 1300, 200));
        top.push(pop(f, A("N46", 0.62), BIG(0, 0, "NO BOAT DRILL", "#ff8a7a", 44), "nd", 960, 330));
      }
      break;
    }
    case "boat7": {
      svg = <BoatLower f={f} down={prog(f, A("N47", 0.1), sc.b)} people={8} />;
      grade("b7", "night", [{ x: 400, y: 500, r: 500, c: "#ffd27a", a: 0.2 }], 0.6);
      top.push(pop(f, A("N47", 0.42), BIG(0, 0, "CAPACITY 65", "#fff7e6", 44), "c65", 1500, 160));
      top.push(pop(f, A("N47", 0.55), BIG(0, 0, "ABOARD: FEWER THAN 30", "#ff8a7a", 44), "a30", 1400, 290));
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={A("N47", 0.4)} text="about 12:45 a.m." sub="lifeboat 7, starboard side" />);
      break;
    }
    case "quiet": {
      const p = prog(f, sc.a, sc.b);
      svg = (<g><SeaSky f={f} mode="night" horizon={760} />
        <g transform={`translate(${lerp(980, 1020, p)} 880) scale(0.75)`}><Titanic f={f} night /></g>
        <g transform="translate(0 880)"><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g>
        <g transform={`translate(${lerp(1500, 1560, p)} 905) scale(0.22)`}><path d="M -330 -40 L 330 -40 Q 300 60 200 70 L -200 70 Q -300 60 -330 -40 Z" fill={PAL.boatHull} stroke={INK} strokeWidth={10} /></g></g>);
      grade("qt", "night", [{ x: 1000, y: 700, r: 600, c: "#ffd27a", a: 0.15 }], 0.75);
      if (f < A("N48", 0.3)) top.push(<g key="cb" opacity={1 - prog(f, A("N48", 0.25), A("N48", 0.3))}><g transform={`translate(620 330) scale(${prog(f, sc.a, sc.a + 8) * 0.4})`}><BellInsertMini /></g><g transform={`translate(1300 330) scale(${prog(f, A("N48", 0.12), A("N48", 0.16))})`}><rect x={-230} y={-80} width={460} height={140} rx={26} fill="#fff7d6" stroke={INK} strokeWidth={7} /><text y={20} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontWeight={700} fontSize={64} fill={INK}>“Thank you.”</text></g></g>);
      hideCaps = false;
      break;
    }
    case "half": {
      svg = <Cam z={pz(1.0, 1.06)} cy={600}><NightSea f={f} shipX={1000} tilt={-2} sink={0.08} scale={0.62} /></Cam>;
      grade("hf", "night", [], 0.8);
      top.push(<g key="ed" transform={`translate(960 430) scale(${prog(f, sc.a, sc.a + 8)})`}><EstimateDial used={0.5 * prog(f, sc.a + 8, sc.b - 20)} label="ANDREWS' 1½ HOURS" /></g>);
      break;
    }
    case "final": {
      const all = [FLEET, MOODY, MURDOCH, SMITH, ANDREWS, BOXHALL, PHILLIPS, BRIDE];
      const sub = A("N50", 0.62);
      svg = (<g><Sunburst f={f} c1="#cfe3ee" c2="#b7d4e6" />
        {all.map((s, i) => <Chibi key={s.id + i} spec={s} pose={{ armR: 150 + Math.sin(f * 0.45 + i) * 14, mouth: "grin", eyes: i % 2 ? "happy" : "normal", breathe: Math.sin(f / 15 + i), head: Math.sin(f * 0.1 + i) * 3 }} x={200 + i * 217} y={1000} size={340} facing={i > 3 ? -1 : 1} />)}
        <g transform={`translate(960 250) scale(${prog(f, sc.a, sc.a + 8)})`}>
          <path d="M -520 -90 Q -520 -140 -470 -140 L 470 -140 Q 520 -140 520 -90 L 520 60 Q 520 110 470 110 L -60 110 L -120 170 L -120 110 L -470 110 Q -520 110 -520 60 Z" fill="#fff" stroke={INK} strokeWidth={8} />
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={INK}>Episode 4: the lifeboats</text>
          <text x={0} y={44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#7b2f2a">Want it? Tell me in the comments</text>
        </g>
        {f >= sub && <g transform={`translate(1600 560) scale(${prog(f, sub, sub + 7) * (1 + Math.sin(f * 0.3) * 0.04)})`}><rect x={-170} y={-50} width={340} height={100} rx={20} fill="#e5302a" stroke={INK} strokeWidth={6} /><text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff">SUBSCRIBE</text></g>}
      </g>);
      break;
    }
  }

  return (
    <AbsoluteFill style={{ background: "#0b1430" }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>{svg}</svg>
      {over}
      <L>{top}</L>
      {html}
      <Captions f={f} caps={TL.caps} hide={hideCaps} />
      <Watermark />
      {!noAudio && <Audio src={staticFile("ep3_mix.wav")} />}
    </AbsoluteFill>
  );
};

/** small static bell icon for cards */
function BellInsertMini() {
  return (
    <g>
      <rect x={-14} y={-200} width={28} height={70} fill="#8a6a3a" stroke={INK} strokeWidth={5} />
      <path d="M -150 130 Q -150 -80 0 -130 Q 150 -80 150 130 Z" fill="#e3b14a" stroke={INK} strokeWidth={9} />
      <rect x={-175} y={120} width={350} height={34} rx={14} fill="#c99437" stroke={INK} strokeWidth={7} />
      <circle cy={180} r={30} fill="#7a5a2a" stroke={INK} strokeWidth={6} />
    </g>
  );
}
void clamp; void Rays; void PhoneInsert; void E;
