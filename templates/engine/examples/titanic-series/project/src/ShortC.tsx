// Short C (vertical): "The ice warning that spent 5 hours in a pocket" — from Episode 2.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps } from "remotion";
import TL from "./shC_timeline.json";
import { Chibi, Pose } from "./chibi";
import { SMITH, PHILLIPS } from "./cast";
import { RICH_W, MADELEINE } from "./cast1";
import { ISMAY, LIGHTOLLER } from "./cast2";
import { prog, lerp, clamp, INK, PAL } from "./style";
import { NightSea, RadioRoom } from "./scenes";
import { Deck } from "./deck";
import { SmokingRoom } from "./ep2sets";
import { Marconigram, WarnBoard, Clock, FATES } from "./kit16";
import { Win, V, Grade, Fg, Rays, Captions, Watermark, Stamp, Label, VTag, HookText, Card, EndCard, useFonts, FONT, FONT2 } from "./vshort";

export const SHC_FRAMES = TL.total;
type K = keyof typeof TL.lines;
const S = (k: K) => TL.lines[k].start;
const E = (k: K) => TL.lines[k].start + TL.lines[k].dur;
const WORDS = TL.words as Record<string, { w: string; s: number; e: number }[]>;
const W = (k: K, i: number) => { const w = WORDS[k]; return TL.lines[k].start + Math.round(w[Math.min(i, w.length - 1)].s * 30); };
const blinkAt = (f: number, every = 70, seed = 0) => { const d = (f + seed * 23) % every; return d < 6 ? [0.5, 1, 1, 0.6, 0.2, 0][d] : 0; };
const idle = (f: number, seed = 0): Pose => ({ blink: blinkAt(f, 70 + seed * 7, seed), breathe: Math.sin(f / 16 + seed), head: Math.sin(f * 0.05 + seed) * 2 });
const scene = (f: number) => TL.scenes.find((s) => f >= s.a && f < s.b) ?? TL.scenes[TL.scenes.length - 1];
const Slip: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}><rect x={-40} y={-26} width={80} height={52} rx={4} fill="#f6f0e2" stroke={INK} strokeWidth={4} /><path d="M -28 -8 L 24 -8 M -28 6 L 14 6" stroke="#9aa6b8" strokeWidth={4} /></g>
);
const BALTIC = ["GREEK STEAMER ATHENAI REPORTS", "PASSING ICEBERGS AND LARGE", "QUANTITIES OF FIELD ICE TODAY..."];
/** chart room pin board (vertical coords) */
const ChartRoom: React.FC<{ f: number; pins: number; empty: number }> = ({ f, pins, empty }) => (
  <V>
    <rect width={1080} height={1920} fill="#6b4a32" />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 190 - 20} y={0} width={160} height={1920} fill="#5a3a24" opacity={0.6} />)}
    <rect x={120} y={360} width={840} height={820} rx={16} fill="#c9a36a" stroke={INK} strokeWidth={10} />
    <text x={540} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>CHART ROOM · NOTICES</text>
    {Array.from({ length: 4 }, (_, i) => i < pins ? <g key={i} transform={`translate(${300 + (i % 2) * 480} ${600 + Math.floor(i / 2) * 330}) rotate(${(i % 2 ? 3 : -3)})`}><rect x={-190} y={-120} width={380} height={240} rx={8} fill="#f6f0e2" stroke={INK} strokeWidth={5} />{[0, 1, 2].map((k) => <line key={k} x1={-150} x2={150 - k * 40} y1={-50 + k * 50} y2={-50 + k * 50} stroke="#9aa6b8" strokeWidth={8} />)}<circle cx={0} cy={-110} r={16} fill="#c0473f" stroke={INK} strokeWidth={4} /><text y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK}>{["ICE · CARONIA", "WEATHER", "POSITIONS", ""][i]}</text></g> : null)}
    {empty > 0 && <g transform="translate(780 930)" opacity={empty}><rect x={-190} y={-120} width={380} height={240} rx={8} fill="none" stroke="#c0473f" strokeWidth={8} strokeDasharray="24 16" /><text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#c0473f">BALTIC?</text></g>}
    <rect x={60} y={1300} width={960} height={260} rx={20} fill="#9b6a3f" stroke={INK} strokeWidth={8} />
    <rect x={120} y={1330} width={840} height={200} fill="#e9dcc0" stroke={INK} strokeWidth={5} />
    <path d="M 160 1480 L 400 1400 L 640 1430 L 900 1360" fill="none" stroke="#c0473f" strokeWidth={8} strokeDasharray="20 12" />
  </V>
);

export const ShortC: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFonts();
  if (!ok) return null;
  const noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  const sc = scene(f), name = sc.name, pz = (a: number, b: number) => lerp(a, b, prog(f, sc.a, sc.b));
  let world: React.ReactNode = null, bg = "#0b1430";
  const over: React.ReactNode[] = [], html: React.ReactNode[] = [], top: React.ReactNode[] = [];
  let hideCaps = false;
  const deckSet = (stage: React.ReactNode) => <Deck f={f} camX={0} zoom={1.15} focusY={640} stage={stage} />;
  const day = (id: string) => over.push(<Grade key="g" f={f} id={id} tint="warm" vig={0.5} pools={[{ x: 760, y: 260, r: 900, c: "#fff1c4", a: 0.45 }]} />, <Fg key="fg" kind="rail" f={f} />);

  switch (name) {
    case "hook": {
      const pk = prog(f, 20, 40);
      world = <Win cx={760} cy={720} z={pz(1.35, 1.5)}>{deckSet(<g>
        <Chibi spec={ISMAY} pose={{ ...idle(f, 2), armR: lerp(60, 10, pk), look: 0.3, mouth: "flat", eyes: "squint" }} x={760} y={1030} size={570} />
        {pk < 1 && <Slip x={lerp(840, 790, pk)} y={lerp(770, 900, pk)} s={lerp(1.3, 0.4, pk)} rot={8} />}
      </g>)}</Win>;
      day("hk");
      top.push(<g key="ck" transform={`translate(800 1080) scale(${0.85 + Math.sin(clamp(f / 8) * Math.PI) * 0.1})`}><Clock f={f} h={1} m={42} spin={1.2} label="5 HOURS" /></g>);
      html.push(<HookText key="h" f={f} a={0} b={sc.b} l1="THIS ICE WARNING SPENT" l2="5 HOURS IN A POCKET" y={240} />);
      hideCaps = true;
      break;
    }
    case "baltic": {
      const card = W("C02", 4);
      world = <Win cx={820} cy={620} z={1.2}><RadioRoom f={f} spec={PHILLIPS} pose={{ write: 1, armL: -38, armR: -30 - Math.abs(Math.sin(f * 1.1)) * 14, blink: blinkAt(f, 60, 4), mouth: "flat" }} pile={0.4} clock="" /></Win>;
      over.push(<Grade key="g" f={f} id="bt" tint="lamp" vig={0.6} pools={[{ x: 300, y: 600, r: 520, c: "#ffd27a", a: 0.6, flicker: 0.15 }]} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={card - 2} text="Sunday, 14 April 1912" sub="1:42 p.m." />);
      top.push(<Card key="m" f={f} a={card} b={sc.b + 2} y={860} rot={-3} s={0.98}><Marconigram f={f} from="S.S. Baltic" to="Captain Smith, Titanic" time="14 April 1912 · 1:42 p.m." prefix="MSG" lines={BALTIC} typed={prog(f, card + 6, sc.b - 20)} /></Card>);
      html.push(<Label key="lb" f={f} a={card + 10} b={sc.b} y={1200} text="real message, shortened" />);
      break;
    }
    case "hand": {
      const t0 = W("C03", 18), p = prog(f, t0, t0 + 20);
      world = <Win cx={lerp(1150, 960, prog(f, sc.a, W("C03", 8)))} cy={660} z={1.15}>{deckSet(<g>
        <Chibi spec={SMITH} pose={{ ...idle(f, 1), armR: lerp(20, 70, p), look: -0.4, mouth: "flat" }} x={1180} y={1030} size={560} facing={-1} />
        <Chibi spec={ISMAY} pose={{ ...idle(f, 2), armR: p > 0.6 ? 60 : 15, look: 0.4, mouth: "smile" }} x={760} y={1030} size={570} />
        <Slip x={lerp(1080, 880, p)} y={lerp(790, 780, p)} s={1.2} rot={lerp(-10, 8, p)} />
      </g>)}</Win>;
      day("hd");
      html.push(<VTag key="sm" f={f} a={sc.a + 2} dur={W("C03", 8) - sc.a - 2} y={560} name="Captain Edward Smith" role="Titanic" color="#22304f" />);
      html.push(<VTag key="is" f={f} a={W("C03", 9)} dur={sc.b - W("C03", 9)} y={560} name="J. Bruce Ismay" role="head of White Star Line" color="#7b2f3a" />);
      break;
    }
    case "pocket": {
      const pk = prog(f, W("C04", 8), W("C04", 12));
      world = <Win cx={760} cy={720} z={1.5}>{deckSet(<g>
        <Chibi spec={ISMAY} pose={{ ...idle(f, 2), armR: lerp(60, 10, pk), look: f < W("C04", 7) ? -0.1 : 0.4, eyes: f < W("C04", 7) ? "squint" : "normal", mouth: "flat" }} x={760} y={1030} size={570} />
        {pk < 1 && <Slip x={lerp(840, 790, pk)} y={lerp(770, 900, pk)} s={lerp(1.3, 0.4, pk)} rot={8} />}
      </g>)}</Win>;
      day("pk");
      html.push(<Label key="lb" f={f} a={sc.a + 4} b={sc.b} y={560} text="Ismay's own statement, 1912" />);
      break;
    }
    case "chart": {
      world = <ChartRoom f={f} pins={f >= W("C05", 14) ? 3 : 1} empty={prog(f, W("C05", 23), W("C05", 25))} />;
      over.push(<Grade key="g" f={f} id="ch" tint="lamp" vig={0.55} pools={[{ x: 540, y: 600, r: 700, c: "#ffd27a", a: 0.45 }]} />);
      html.push(<Stamp key="ys" f={f} a={W("C05", 6)} b={W("C05", 14)} text="You see..." />);
      if (f >= W("C05", 23)) world = <>{world}<Win cx={900} cy={760} z={1.0}><g /></Win></>;
      if (false) html.push(<VTag key="lt" f={f} a={W("C05", 24)} dur={sc.b - W("C05", 24)} x={540} y={1300} name="officers on watch" role="e.g. Second Officer Lightoller" color="#22304f" />);
      void LIGHTOLLER;
      break;
    }
    case "deck": {
      const read = W("C06", 9);
      world = <Win cx={f < read ? 760 : 980} cy={660} z={1.15}>{deckSet(<g>
        <Chibi spec={ISMAY} pose={{ ...idle(f, 2), armR: f >= read ? 70 : 10, look: 0.4, mouth: f >= read ? "o" : "flat", talk: f >= read ? Math.abs(Math.sin(f * 0.5)) * 0.7 : 0 }} x={760} y={1030} size={570} />
        {f >= read && <Slip x={850} y={780} s={1.2} rot={-6} />}
        <Chibi spec={RICH_W} pose={{ ...idle(f, 3), look: -0.4, mouth: "o" }} x={1150} y={1020} size={500} facing={-1} />
        <Chibi spec={{ ...MADELEINE, id: "lady2", name: "", main: "#3f6a8a", mainDark: "#2f5070", hatColor: "#2f5070" }} pose={{ ...idle(f, 4), look: -0.4, mouth: "smile" }} x={1400} y={1020} size={480} facing={-1} />
      </g>)}</Win>;
      day("dk");
      if (f < read) top.push(<g key="ck" transform="translate(800 1050) scale(0.7)"><Clock f={f} h={2} m={0} spin={3} label="ALL AFTERNOON" /></g>);
      else html.push(<Label key="lb" f={f} a={read + 4} b={sc.b} y={560} text="Ismay at the inquiry: “I read it to her, I think”" />);
      break;
    }
    case "back": {
      world = <Win cx={960} cy={640} z={1.2}><SmokingRoom f={f}>
        <Chibi spec={ISMAY} pose={{ ...idle(f, 2), armR: lerp(10, 70, prog(f, W("C07", 8), W("C07", 11))), look: 0.4, mouth: "flat" }} x={760} y={1030} size={540} />
        <Chibi spec={SMITH} pose={{ ...idle(f, 1), armR: lerp(20, 70, prog(f, W("C07", 9), W("C07", 12))), look: -0.4, mouth: "flat" }} x={1180} y={1030} size={540} facing={-1} />
        <Slip x={lerp(860, 1080, prog(f, W("C07", 9), W("C07", 12)))} y={790} s={1.2} />
      </SmokingRoom></Win>;
      over.push(<Grade key="g" f={f} id="bk" tint="lamp" vig={0.6} pools={[{ x: 540, y: 1100, r: 600, c: "#ff9a4a", a: 0.5, flicker: 0.2 }]} />, <Fg key="fg" kind="lamp" f={f} />);
      top.push(<g key="ck" transform={`translate(540 520) scale(${prog(f, sc.a, sc.a + 8) * 0.8})`}><Clock f={f} h={7} m={10} label="7:10 P.M." /></g>);
      break;
    }
    case "count": {
      const fates = [W("C08", 9), W("C08", 9) + 6, W("C08", 13), W("C08", 13) + 6, W("C08", 14), W("C08", 15)];
      world = <Win cx={900} cy={560} z={1.1}><NightSea f={f} shipX={900} /></Win>;
      bg = "#070b1c";
      over.push(<Grade key="g" f={f} id="ct" tint="night" vig={0.75} />);
      const n = Math.min(6, Math.max(0, Math.floor((f - W("C08", 4)) / 4) + 1));
      top.push(<g key="wb" transform="translate(540 920) scale(1.05) translate(-960 -470)"><WarnBoard f={f} n={n} times={[0, 1, 2, 3, 4, 5].map((i) => W("C08", 4) + i * 4)} fates={fates.filter((t) => f >= t).length} big={1} /></g>);
      void FATES;
      break;
    }
    case "end": {
      const endA = E("C09") - 30;
      world = <Win cx={1250} cy={560} z={pz(1.1, 1.25)}><NightSea f={f} shipX={lerp(800, 1000, prog(f, sc.a, sc.b))} berg={1} bergX={1450} scale={0.6} /></Win>;
      bg = "#070b1c";
      over.push(<Grade key="g" f={f} id="en" tint="night" vig={0.8} pools={[{ x: 700, y: 300, r: 500, c: "#cfe0ff", a: 0.25 }]} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={endA} text="That night" sub="14 April 1912, 11:40 p.m." />);
      top.push(<EndCard key="ec" f={f} a={endA} title="EPISODE 2" sub="“Four Days at Sea”"><g transform="translate(-60 30)"><Chibi spec={ISMAY} pose={{ ...idle(f, 2), mouth: "flat", armR: 60 }} x={0} y={120} size={400} /><Slip x={90} y={-40} s={1.6} rot={-8} /></g></EndCard>);
      if (f >= endA) hideCaps = true;
      break;
    }
  }
  void Rays; void PAL; void FONT2;
  return (
    <AbsoluteFill style={{ background: bg }}>
      {world}
      {over}
      <V>{top}</V>
      {html}
      <Captions f={f} caps={TL.caps} hide={hideCaps} />
      <Watermark />
      {!noAudio && <Audio src={staticFile("shC_mix.wav")} />}
    </AbsoluteFill>
  );
};
