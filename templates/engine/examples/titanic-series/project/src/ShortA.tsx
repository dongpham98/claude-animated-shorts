// Short A (vertical): "5 words that saved Titanic's photos" — Fr Francis Browne. From Episode 1 scenes, upgraded light.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps } from "remotion";
import TL from "./shA_timeline.json";
import { Chibi, Pose } from "./chibi";
import { BROWNE, BROWNE_NC, SPEDDEN_F, DOUGLAS, BRIDE, RICH_M, RICH_W, EMIGRANT } from "./cast1";
import { prog, lerp, clamp, INK } from "./style";
import { Sparkles } from "./fx";
import { NightSea, RadioRoom, Departure } from "./scenes";
import { Deck } from "./deck";
import { Saloon, Tender, Harbor, Trunk } from "./ep1sets";
import { Win, V, Grade, Fg, Rays, Captions, Watermark, Stamp, Label, Bubble, VTag, HookText, Card, TelegramForm, Ticket, Calendar, EndCard, Photo, useFonts, VW, FONT } from "./vshort";

export const SHA_FRAMES = TL.total;
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
/** set point -> vertical frame point for a Win(cx, cy, z) */
const toV = (sx: number, sy: number, cx: number, cy: number, z: number) => { const k = (z * 1920) / 1080; return [540 + (sx - cx) * k, 960 + (sy - cy) * k]; };

const Top: React.FC<{ f: number; x: number; y: number }> = ({ f, x, y }) => (
  <g transform={`translate(${x + Math.sin(f * 0.15) * 30} ${y})`}>
    <path d="M -34 -40 L 34 -40 L 0 10 Z" fill="#c0473f" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-6} y={-60} width={12} height={22} fill="#7a5233" stroke={INK} strokeWidth={4} />
  </g>
);
const spedSet = (fr: number, flash = 0, browne = true) => (
  <Deck f={fr} camX={0} zoom={1.12} focusY={600} stage={<g>
    {browne && <Chibi spec={BROWNE} pose={{ ...idle(fr, 1), armL: -30, armR: -26, flash, look: 0.4, eyes: flash > 0 ? "squint" : "normal" }} x={600} y={1010} size={470} />}
    <Chibi spec={SPEDDEN_F} pose={{ ...idle(fr, 2), look: 0.5, mouth: "smile", armR: 20 }} x={1330} y={1000} size={470} facing={-1} />
    <Chibi spec={DOUGLAS} pose={{ ...idle(fr, 3), armR: 60 + Math.sin(fr * 0.5) * 30, mouth: "grin", eyes: "happy", look: 0.3 }} x={1060} y={1010} size={470} />
    <Top f={fr} x={990} y={1000} />
  </g>} />
);
const radioSet = (fr: number) => <RadioRoom f={fr} spec={BRIDE} pose={{ write: 1, armL: -38, armR: -30 - Math.abs(Math.sin(fr * 1.1)) * 14, look: Math.sin(fr * 0.2) * 0.4, blink: blinkAt(fr, 60, 8), mouth: "flat" }} pile={0.25} clock="" />;

const TELE = ["GET OFF THAT SHIP"];
export const ShortA: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFonts();
  if (!ok) return null;
  const noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  const sc = scene(f), name = sc.name, pz = (a: number, b: number) => lerp(a, b, prog(f, sc.a, sc.b));
  let world: React.ReactNode = null, bg = "#0b1430";
  const over: React.ReactNode[] = [], html: React.ReactNode[] = [], top: React.ReactNode[] = [];
  let hideCaps = false;

  switch (name) {
    case "hook": {
      const z = pz(1.05, 1.18);
      world = <Win cx={1150} cy={560} z={z}><Harbor f={f} mode="queenstown" shipX={1150} shipS={0.66}><g transform="translate(700 860) scale(0.62)"><Tender f={f} name="AMERICA" /></g></Harbor></Win>;
      over.push(<Grade key="g" f={f} id="hk" tint="cool" vig={0.7} pools={[{ x: 540, y: 820, r: 700, c: "#ffe7b0", a: 0.4 }]} />);
      top.push(<Card key="c" f={f} a={-20} b={sc.b + 2} y={860} rot={-2} dim={0.35}><TelegramForm f={f} to="Francis Browne, on board Titanic" lines={[]} typed={0} stamp={-99} stampText="GET OFF THAT SHIP" stampSub="– PROVINCIAL" /></Card>);
      // five words counted one by one
      top.push(<g key="w">{[0, 1, 2, 3, 4].map((i) => { const t = 3 + i * 5; if (f < t) return null; const s = 1 + Math.sin(clamp((f - t) / 6) * Math.PI) * 0.3; return <g key={i} transform={`translate(${300 + i * 120} 1300) scale(${s})`}><circle r={50} fill="#ffd84a" stroke={INK} strokeWidth={7} /><text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK}>{i + 1}</text></g>; })}</g>);
      html.push(<HookText key="h" f={f} a={0} b={sc.b} l1="5 WORDS SAVED" l2="TITANIC'S PHOTOS" y={240} />);
      hideCaps = true;
      break;
    }
    case "ticket": case "ticket2": {
      const bIn = sc.a, tkt = W("A02", 12);
      const z = name === "ticket" ? pz(1.0, 1.15) : 1.2;
      const bx = lerp(250, 700, prog(f, bIn, bIn + 60));
      world = <Win cx={name === "ticket" ? lerp(900, 760, prog(f, bIn, bIn + 60)) : 760} cy={620} z={z}><Departure f={f} shipX={1050}>
        {Array.from({ length: 4 }, (_, i) => <Chibi key={i} spec={EMIGRANT(i)} pose={{ ...idle(f, i), mouth: "smile", look: 0.5, armR: i === 1 ? 150 + Math.sin(f * 0.4) * 15 : 10 }} x={1000 + i * 120} y={1000} size={230} />)}
        <Chibi spec={BROWNE} pose={{ ...(f < bIn + 60 ? { walk: 1, phase: f * 0.32 } : {}), ...idle(f, 1), armL: -30, armR: -26, look: 0.6, mouth: "smile", eyes: f > tkt ? "happy" : "normal" }} x={bx} y={1010} size={380} />
      </Departure></Win>;
      over.push(<Grade key="g" f={f} id="tk" tint="warm" vig={0.5} pools={[{ x: 820, y: 300, r: 800, c: "#fff1c4", a: 0.5 }]} />, <Rays key="r" f={f} x={900} y={-60} ang={28} />, <Fg key="fg" kind="rope" f={f} />);
      if (name === "ticket") {
        html.push(<Stamp key="st" f={f} a={sc.a + 2} b={W("A02", 2) + 30} text="Southampton" sub="10 April 1912" />);
        const [tx, ty] = toV(bx, 640, 760, 620, z);
        html.push(<VTag key="nt" f={f} a={W("A02", 2)} dur={tkt - W("A02", 2) - 2} x={tx} y={ty - 40} name="Francis Browne" role="Jesuit student, keen photographer" color="#7b4a8c" />);
      }
      top.push(<Card key="tk" f={f} a={tkt} b={name === "ticket2" ? sc.b + 2 : sc.b + 30} y={800} rot={-4}><Ticket f={f} to="Queenstown" circle={S("A03") + 4} note="(AND NO FURTHER)" /></Card>);
      if (f >= tkt && f < tkt + 20) top.push(<Sparkles key="sp" f={f} x={540} y={700} spread={380} n={10} seed={4} />);
      break;
    }
    case "photos": {
      const flashes = [W("A04", 2), W("A04", 9), W("A04", 16)];
      const last = flashes.filter((x) => f >= x).pop() ?? -99, fl = clamp(1 - (f - last) / 6);
      const radio = W("A04", 10);
      world = f < radio ? <Win cx={lerp(620, 1000, prog(f, sc.a, W("A04", 6)))} cy={640} z={1.2}>{spedSet(f, fl)}</Win> : <Win cx={980} cy={560} z={pz(1.05, 1.12)}>{radioSet(f)}</Win>;
      over.push(<Grade key="g" f={f} id="ph" tint={f < radio ? "warm" : "lamp"} vig={0.55} pools={f < radio ? [{ x: 540, y: 300, r: 900, c: "#fff1c4", a: 0.45 }] : [{ x: 300, y: 600, r: 520, c: "#ffd27a", a: 0.6, flicker: 0.15 }]} />, <Fg key="fg" kind={f < radio ? "rail" : "glass"} f={f} />);
      if (f >= last && f < last + 6) top.push(<rect key="fl" width={1080} height={1920} fill="#fff" opacity={fl * 0.85} />);
      top.push(<Card key="p1" f={f} a={W("A04", 9) + 3} b={radio} y={760} rot={-5} s={0.95} dim={0.3}><Photo id="p1" caption="drawn after Browne's photo, 1912" w={760} vb="560 300 1100 780">{spedSet(30, 0, false)}</Photo></Card>);
      top.push(<Card key="p2" f={f} a={W("A04", 16) + 3} b={sc.b + 2} y={760} rot={4} s={0.95} dim={0.3}><Photo id="p2" caption="the only known photo of the radio room (drawn after it)" w={760}>{radioSet(30)}</Photo></Card>);
      if (f >= W("A04", 10)) html.push(<VTag key="hb" f={f} a={radio + 4} dur={W("A04", 16) - radio - 2} y={1150} name="Harold Bride" role="wireless operator" color="#3f7fbf" />);
      break;
    }
    case "dinner": case "dinner2": {
      const offer = W("A05", 12), tele = S("A06"), write = W("A06", 10);
      const cx = name === "dinner" ? (f < offer ? lerp(1400, 1250, prog(f, sc.a, offer)) : lerp(1250, 900, prog(f, offer, offer + 30))) : 720;
      const z = name === "dinner" ? 1.12 : 1.3, cy = name === "dinner" ? 600 : 660;
      const bp: Pose = { ...idle(f, 1), look: f < tele ? 0.5 : 0.1, mouth: f >= offer ? "grin" : "smile", eyes: f >= offer && f < tele + 30 ? "happy" : "normal", talk: env("R1", f), write: f >= write && f < S("R1") ? 1 : 0, armR: f >= write && f < S("R1") ? -30 - Math.abs(Math.sin(f * 1.1)) * 12 : f >= S("R1") ? 120 : 10 };
      world = <Win cx={cx} cy={cy} z={z}><Saloon f={f}>
        <Chibi spec={{ ...BROWNE_NC, prop: f >= write && f < S("R1") ? "notebook" : undefined }} pose={bp} x={700} y={900} size={460} />
        <Chibi spec={RICH_M} pose={{ ...idle(f, 2), look: -0.5, mouth: "smile", armR: f >= offer && f < offer + 40 ? 110 : 20, talk: f >= offer - 20 && f < offer + 10 ? Math.abs(Math.sin(f * 0.6)) : 0 }} x={1220} y={900} size={460} facing={-1} />
        <Chibi spec={RICH_W} pose={{ ...idle(f, 3), look: -0.4, mouth: "smile", eyes: "happy" }} x={1520} y={900} size={440} facing={-1} />
      </Saloon></Win>;
      over.push(<Grade key="g" f={f} id="dn" tint="lamp" vig={0.65} pools={[{ x: 200, y: 420, r: 420, c: "#ffcf7a", a: 0.6, flicker: 0.12 }, { x: 900, y: 380, r: 420, c: "#ffcf7a", a: 0.55, flicker: 0.12 }]} />, <Fg key="fg" kind="lamp" f={f} />);
      if (name === "dinner") {
        html.push(<VTag key="cp" f={f} a={W("A05", 3)} dur={offer - W("A05", 3)} y={560} name="A rich American couple" role="Browne's dinner table" color="#3f7a5a" />);
        top.push(<Card key="nyt" f={f} a={offer + 4} b={sc.b + 2} y={760} rot={-5} s={0.9} dim={0.3}><Ticket f={f} to="New York" circle={offer + 16} note="PAID FOR BY THEM" /></Card>);
      } else {
        top.push(<Card key="tf" f={f} a={write - 6} b={S("R1") - 2} y={760} rot={-3} s={0.95}><TelegramForm f={f} to="Fr Provincial, Dublin" from="F. Browne, Titanic" lines={["MAY I STAY ON BOARD", "TO NEW YORK?"]} typed={prog(f, write, S("R1") - 10)} /></Card>);
        const [hx, hy] = toV(700, 560, 720, 660, 1.3);
        html.push(<Bubble key="r1" f={f} a={S("R1") - 2} b={sc.b} y={520} tx={hx} ty={hy - 40} text="May I stay on board, all the way to New York?" />);
        html.push(<Label key="lr" f={f} a={S("R1")} b={sc.b} y={540} text="playful" />);
        hideCaps = f >= S("R1") - 2;
      }
      break;
    }
    case "queens": {
      const last = W("A07", 7);
      world = <Win cx={pz(1300, 1180)} cy={560} z={pz(1.0, 1.1)}><Harbor f={f} mode="queenstown" shipX={1250} shipS={0.62}>
        <g transform="translate(560 900) scale(0.85)"><Tender f={f} name="AMERICA" /></g>
        {Array.from({ length: 6 }, (_, i) => <Chibi key={i} spec={EMIGRANT(i)} pose={{ ...idle(f, i), mouth: "smile", look: 0.5, armR: i % 3 === 0 ? 150 + Math.sin(f * 0.4 + i) * 15 : 10 }} x={450 + i * 38} y={860 - (i % 2) * 10} size={150} />)}
      </Harbor></Win>;
      over.push(<Grade key="g" f={f} id="qn" tint="cool" vig={0.6} pools={[{ x: 760, y: 260, r: 700, c: "#f3f6ff", a: 0.35 }]} />, <Fg key="fg" kind="chain" f={f} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={last - 2} text="Queenstown, Ireland" sub="11 April 1912" />);
      top.push(<Card key="cal" f={f} a={last} b={sc.b + 2} y={800} rot={3} s={0.95}><Calendar f={f} day="11" month="APRIL" note="LAST STOP" /></Card>);
      break;
    }
    case "telegram": {
      world = <Win cx={960} cy={620} z={1.15}><Deck f={f} camX={100} zoom={1.25} focusY={640} stage={<Chibi spec={BROWNE_NC} pose={{ ...idle(f, 1), armR: 110, look: 0.4, eyes: f >= S("T1") + 10 ? "wide" : "normal", brow: f >= S("T1") + 10 ? 1 : 0, mouth: f >= S("T1") + 10 ? "o" : "smile" }} x={960} y={1030} size={520} />} /></Win>;
      over.push(<Grade key="g" f={f} id="tg" tint="cool" vig={0.75} pools={[{ x: 540, y: 800, r: 700, c: "#fff1c4", a: 0.35 }]} />);
      top.push(<Card key="tf" f={f} a={sc.a - 2} b={sc.b + 30} y={800} rot={-2} dim={0.55}><TelegramForm f={f} to="F. Browne, on board Titanic" from="Fr Provincial, Dublin" lines={[]} typed={0} stamp={S("T1")} stampText={TELE[0]} stampSub="– PROVINCIAL" /></Card>);
      html.push(<Label key="lb" f={f} a={S("T1") + 4} b={sc.b} y={1290} text="telegram text as reported" />);
      hideCaps = true;
      break;
    }
    case "leave": {
      const snap = W("A08", 14), lv = prog(f, W("A08", 8), sc.b + 30), fl = clamp(1 - Math.abs(f - snap) / 5);
      const cx = lerp(500, 820, prog(f, sc.a, snap));
      world = <Win cx={cx} cy={640} z={pz(1.12, 1.2)}><Harbor f={f} mode="queenstown" shipX={1000} shipS={0.55} leave={lv}>
        <g transform="translate(420 960) scale(1.3)"><Tender f={f} name="AMERICA" /></g>
        <Chibi spec={BROWNE} pose={{ ...idle(f, 4), armL: -30, armR: -26, flash: fl, look: 0.6 }} x={460} y={900} size={330} />
      </Harbor></Win>;
      over.push(<Grade key="g" f={f} id="lv" tint="dawn" vig={0.55} pools={[{ x: 800, y: 420, r: 800, c: "#ffe1b0", a: 0.45 }]} />, <Fg key="fg" kind="rope" f={f} side={-1} />);
      if (f >= snap && f < snap + 6) top.push(<rect key="fl" width={1080} height={1920} fill="#fff" opacity={fl * 0.85} />);
      top.push(<Card key="ph" f={f} a={snap + 3} b={sc.b + 2} y={760} rot={-4} s={0.95} dim={0.3}><Photo id="lvp" caption="Titanic leaves Queenstown (drawn)" w={760}><Harbor f={snap} mode="queenstown" shipX={1000} shipS={0.55} leave={lv} /></Photo></Card>);
      break;
    }
    case "berg": {
      world = <Win cx={1250} cy={560} z={pz(1.1, 1.25)}><NightSea f={f} shipX={lerp(800, 1000, prog(f, sc.a, sc.b))} berg={1} bergX={1450} scale={0.6} /></Win>;
      over.push(<Grade key="g" f={f} id="bg" tint="night" vig={0.8} pools={[{ x: 700, y: 300, r: 500, c: "#cfe0ff", a: 0.25 }]} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={sc.b} text="3 days later" sub="14 April 1912, 11:40 p.m." />);
      bg = "#070b1c";
      break;
    }
    case "trunk": {
      const open = prog(f, W("A10", 6), W("A10", 9)), cnt = f >= W("A10", 10) ? 42000 * prog(f, W("A10", 10), W("A10", 13) + 8) : 0;
      world = <Win cx={960} cy={pz(560, 600)} z={pz(0.95, 1.05)}><Trunk f={f} open={open} count={0} /></Win>;
      bg = "#3b2f3a";
      if (cnt > 0) top.push(<g key="cnt" transform={`translate(540 560) scale(${1 + Math.sin(clamp((f - W("A10", 10)) / 8) * Math.PI) * 0.1})`}><text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170} fill="#fff4dc" stroke={INK} strokeWidth={18} paintOrder="stroke">{Math.round(cnt).toLocaleString("en-US")}</text><text y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#ffd84a" stroke={INK} strokeWidth={10} paintOrder="stroke">PHOTOS</text></g>);
      over.push(<Grade key="g" f={f} id="tr" tint="dust" vig={0.75} pools={[{ x: 540, y: 1150, r: 600, c: "#ffd99a", a: 0.5 }]} />, <Rays key="r" f={f} x={300} y={-80} ang={-18} c="#ffe2b0" a={0.3} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={sc.b} text="Jesuit archives, Dublin" sub="mid-1980s" y={1560} />);
      break;
    }
    case "end": {
      const fw = W("A11", 11), endA = E("A11") + 6;
      world = <Win cx={960} cy={620} z={1.15}><Deck f={f} camX={100} zoom={1.25} focusY={640} stage={<Chibi spec={BROWNE} pose={{ ...idle(f, 1), armL: -30, armR: -26, look: 0.2, mouth: "smile", eyes: "happy" }} x={960} y={1030} size={520} />} /></Win>;
      over.push(<Grade key="g" f={f} id="en" tint="dawn" vig={0.6} pools={[{ x: 540, y: 500, r: 800, c: "#ffe1b0", a: 0.5 }]} />);
      top.push(<Card key="tf" f={f} a={sc.a} b={endA} y={780} rot={-3} s={0.95} dim={0.4}><g><TelegramForm f={f} to="F. Browne, on board Titanic" from="Fr Provincial, Dublin" lines={[]} typed={0} stamp={sc.a - 20} stampText="GET OFF THAT SHIP" stampSub="– PROVINCIAL" />{f >= fw && <g transform={`translate(0 -470) scale(${1 + Math.sin(clamp((f - fw) / 8) * Math.PI) * 0.15})`}><rect x={-260} y={-60} width={520} height={110} rx={55} fill="#ffd84a" stroke={INK} strokeWidth={8} /><text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK}>5 WORDS</text></g>}</g></Card>);
      html.push(<Label key="lb" f={f} a={W("A11", 1)} b={fw - 2} y={1150} text="kept for the rest of his life (reportedly)" />);
      top.push(<EndCard key="ec" f={f} a={endA} title="EPISODE 1" sub="“Get Off That Ship”"><Chibi spec={BROWNE} pose={{ ...idle(f, 1), armL: -30, armR: -26, mouth: "grin", eyes: "happy" }} x={0} y={110} size={420} /></EndCard>);
      if (f >= endA) hideCaps = true;
      break;
    }
  }

  return (
    <AbsoluteFill style={{ background: bg }}>
      {world}
      {over}
      <V>{top}</V>
      {html}
      <Captions f={f} caps={TL.caps} hide={hideCaps} />
      <Watermark />
      {!noAudio && <Audio src={staticFile("shA_mix.wav")} />}
    </AbsoluteFill>
  );
};
void VW;
