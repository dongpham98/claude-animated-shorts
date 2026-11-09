// Short E (vertical): "The key that could have saved Titanic?" — recap Short (tiny thing #1).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps } from "remotion";
import TL from "./shE_timeline.json";
import { Chibi, Pose } from "./chibi";
import { FLEET, LEE } from "./cast";
import { LIGHTOLLER } from "./cast2";
import { prog, lerp, clamp, INK } from "./style";
import { CrowsNest, Departure, NightSea } from "./scenes";
import { Deck } from "./deck";
import { Clock } from "./kit16";
import { Win, V, Grade, Fg, Rays, Captions, Watermark, Stamp, Label, VTag, HookText, Card, EndCard, Bubble, Panel, useFonts, FONT, FONT2 } from "./vshort";
import { BLAIR, OFFICER2, LOOKOUT, CADET, Key, Velvet, PriceTag, Gavel, Cabin, Binoculars, Postcard, EyeVsGlasses, EmptyHook, School } from "./keysets";

export const SHE_FRAMES = TL.total;
type K = keyof typeof TL.lines;
const S = (k: K) => TL.lines[k].start;
const E = (k: K) => TL.lines[k].start + TL.lines[k].dur;
const WORDS = TL.words as Record<string, { w: string; s: number; e: number }[]>;
const ENV = TL.env as Record<string, number[]>;
const W = (k: K, i: number) => { const w = WORDS[k]; return TL.lines[k].start + Math.round(w[Math.min(i, w.length - 1)].s * 30); };
const talkOf = (k: K, f: number) => { const e = ENV[k]; const i = f - S(k); return e && i >= 0 && i < e.length ? e[i] : 0; };
const blinkAt = (f: number, every = 70, seed = 0) => { const d = (f + seed * 23) % every; return d < 6 ? [0.5, 1, 1, 0.6, 0.2, 0][d] : 0; };
const idle = (f: number, seed = 0): Pose => ({ blink: blinkAt(f, 70 + seed * 7, seed), breathe: Math.sin(f / 16 + seed), head: Math.sin(f * 0.05 + seed) * 2 });
const scene = (f: number) => TL.scenes.find((s) => f >= s.a && f < s.b) ?? TL.scenes[TL.scenes.length - 1];
const swing = (f: number, amp = 9, sp = 22) => Math.sin(f / sp) * amp;

export const ShortE: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFonts();
  if (!ok) return null;
  const noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  const sc = scene(f), name = sc.name, pz = (a: number, b: number) => lerp(a, b, prog(f, sc.a, sc.b));
  let world: React.ReactNode = null, bg = "#0b1430";
  const over: React.ReactNode[] = [], html: React.ReactNode[] = [], top: React.ReactNode[] = [];
  let hideCaps = false;
  const quay = (cx: number, z: number, kids: React.ReactNode) => <Win cx={cx} cy={640} z={z}><Departure f={f} shipX={1180}>{kids}</Departure></Win>;
  const day = (id: string) => over.push(<Grade key="g" f={f} id={id} tint="warm" vig={0.5} pools={[{ x: 760, y: 260, r: 900, c: "#fff1c4", a: 0.45 }]} />);

  switch (name) {
    case "hook": {
      const hit = W("K01", 7), c2 = W("K01", 3) - 2, c3 = W("K01", 8) - 2;
      if (f < c3) {
        const z = f < c2 ? lerp(1.0, 1.08, prog(f, 0, c2)) : lerp(1.35, 1.45, prog(f, c2, c3));
        const cy = f < c2 ? 960 : 1040;
        world = <V><Velvet f={f} /><g transform={`translate(540 ${cy}) scale(${z}) translate(-540 -960)`}><Key x={540} y={930} s={1.3} rot={swing(f, 10, 18)} glint={0.5 + 0.5 * Math.sin(f / 5)} /></g></V>;
        bg = "#1c0709";
        top.push(<Gavel key="gv" f={f} hit={hit} x={840} y={1600} s={1.0} />);
        top.push(<PriceTag key="pt" f={f} a={W("K01", 5)} x={330} y={1580} text="£90,000" sub="sold, 2007" />);
        top.push(<Rays key="r" f={f} x={540} y={-40} ang={90} c="#fff3d0" a={0.18} />);
      } else {
        world = <Win cx={1250} cy={560} z={lerp(1.1, 1.35, prog(f, c3, sc.b))}><NightSea f={f} shipX={lerp(950, 1080, prog(f, c3, sc.b))} berg={1} bergX={1350} scale={0.6} /></Win>;
        bg = "#070b1c";
        over.push(<Grade key="g" f={f} id="hk2" tint="night" vig={0.8} />);
        top.push(<Key key="k" x={250} y={1450} s={0.6} rot={swing(f, 12, 14)} glint={0.8} />);
      }
      html.push(<HookText key="h" f={f} a={0} b={c3 + 30} l1="THE KEY THAT COULD" l2="HAVE SAVED TITANIC?" y={190} />);
      break;
    }
    case "cabin": {
      const pk = Math.abs(Math.sin(f / 7));
      world = <Win cx={f < W("K02", 7) ? lerp(560, 640, prog(f, sc.a, W("K02", 7))) : 420} cy={f < W("K02", 7) ? 560 : 640} z={f < W("K02", 7) ? 1.25 : lerp(1.7, 1.85, prog(f, W("K02", 7), sc.b))}><Cabin f={f} packed={prog(f, W("K02", 7), sc.b - 10)}>
        <Chibi spec={BLAIR} pose={{ ...idle(f, 1), armR: 40 + pk * 40, armL: 30 + pk * 20, look: -0.5, mouth: "flat", brow: -1 }} x={620} y={1020} size={560} facing={-1} />
      </Cabin></Win>;
      over.push(<Grade key="g" f={f} id="cb" tint="lamp" vig={0.55} pools={[{ x: 380, y: 520, r: 520, c: "#fff1c4", a: 0.55 }, { x: 760, y: 200, r: 300, c: "#ffd27a", a: 0.4, flicker: 0.1 }]} />, <Fg key="fg" kind="lamp" f={f} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={W("K02", 2) + 4} text="April 1912" sub="Southampton" />);
      html.push(<VTag key="bt" f={f} a={W("K02", 3)} dur={sc.b - W("K02", 3)} y={560} name="David Blair" role="Titanic's Second Officer" color="#22304f" />);
      break;
    }
    case "shuffle": {
      const wIn = prog(f, W("K03", 4), W("K03", 14)), out = prog(f, W("K03", 15), sc.b);
      world = quay(lerp(780, 1250, prog(f, sc.a, sc.b)), 1.0, <g>
        <Chibi spec={OFFICER2} pose={{ ...idle(f, 2), walk: wIn > 0 && wIn < 1 ? 1 : 0, phase: f * 0.5, armR: 20, mouth: "smile" }} x={lerp(450, 820, wIn)} y={1010} size={560} />
        <Chibi spec={BLAIR} pose={{ ...idle(f, 1), walk: out > 0 && out < 1 ? 1 : 0, phase: f * 0.5, armL: 15, look: -0.3, mouth: "flat", brow: -1 }} x={lerp(1180, 1500, out)} y={1015} size={560} facing={out > 0 ? 1 : -1} />
        <g transform={`translate(${lerp(1180, 1500, out) + 70} 960)`}><rect x={-60} y={-40} width={120} height={80} rx={10} fill="#6b3f26" stroke={INK} strokeWidth={5} /></g>
      </g>);
      day("sh"); over.push(<Fg key="fg" kind="rope" f={f} />);
      html.push(<VTag key="ot" f={f} a={W("K03", 5)} dur={W("K03", 15) - W("K03", 5)} y={560} name="Olympic's chief officer" role="moves to Titanic" color="#1d2944" />);
      break;
    }
    case "postcard": {
      world = quay(760, 1.3, <Chibi spec={BLAIR} pose={{ ...idle(f, 1), mouth: talkOf("B1", f) > 0.2 ? "o" : "flat", talk: talkOf("B1", f), brow: -1, look: 0.2, armR: 50 }} x={760} y={1015} size={560} facing={-1} />);
      day("pc");
      top.push(<Card key="pc" f={f} a={sc.a - 2} b={sc.b + 2} y={1500} rot={-3} s={0.9}><Postcard f={f} a={sc.a} /></Card>);
      html.push(<Bubble key="b" f={f} a={S("B1") - 2} b={sc.b} y={540} tx={560} ty={700} text="I feel very disappointed." />);
      hideCaps = true;
      break;
    }
    case "pocket": {
      const pk = prog(f, W("K04", 8), W("K04", 12));
      world = quay(760, 1.6, <Chibi spec={BLAIR} pose={{ ...idle(f, 1), walk: 1, phase: f * 0.5, armR: lerp(60, 5, pk), look: -0.3, mouth: "flat" }} x={760 - (f - sc.a) * 1.2} y={1015} size={560} facing={-1} />);
      day("pk");
      top.push(<Key key="k" x={lerp(780, 540, pk)} y={lerp(1250, 1300, pk)} s={lerp(0.7, 0.25, pk)} rot={lerp(-20, 10, pk) + swing(f, 6, 6)} glint={1 - pk} />);
      if (pk >= 1) top.push(<g key="gl" transform="translate(540 1300)">{[0, 1, 2, 3].map((i) => <path key={i} d={`M 0 0 L ${Math.cos(i * 1.57) * 60} ${Math.sin(i * 1.57) * 60}`} stroke="#ffe9a8" strokeWidth={8} strokeLinecap="round" opacity={1 - prog(f, W("K04", 12), W("K04", 12) + 15)} />)}</g>);
      break;
    }
    case "nest": {
      const none = W("K05", 14);
      world = <Win cx={960} cy={760} z={pz(0.82, 0.92)}><CrowsNest f={f} fleetSpec={FLEET} leeSpec={LEE} fleet={{ ...idle(f, 1), look: 0.3, mouth: "flat", armR: f >= none ? 70 : 10 }} lee={{ ...idle(f, 2), look: -0.3, mouth: f >= none ? "o" : "flat" }} /></Win>;
      bg = "#070b1c";
      over.push(<Grade key="g" f={f} id="ns" tint="cool" vig={0.65} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={W("K05", 8)} text="Belfast → Southampton" sub="one pair of binoculars" />);
      top.push(<EmptyHook key="eh" f={f} p={prog(f, none, none + 8)} x={540} y={1620} />);
      html.push(<Label key="l" f={f} a={none + 4} b={sc.b} y={1790} text="Fred Fleet, US inquiry: “none from Southampton to New York”" />);
      break;
    }
    case "reply": {
      world = <Win cx={950} cy={660} z={1.0}><Deck f={f} camX={0} zoom={1.15} focusY={640} stage={<g>
        <Chibi spec={LOOKOUT} pose={{ ...idle(f, 3), look: 0.4, mouth: "o", armR: 40 }} x={720} y={1030} size={520} />
        <Chibi spec={LIGHTOLLER} pose={{ ...idle(f, 1), look: -0.4, mouth: talkOf("L1", f) > 0.2 ? "o" : "flat", talk: talkOf("L1", f), armR: 30 }} x={1180} y={1030} size={560} facing={-1} />
      </g>} /></Win>;
      day("rp");
      html.push(<VTag key="lt" f={f} a={sc.a} dur={sc.b - sc.a} y={1180} name="Charles Lightoller" role="new Second Officer" color="#22304f" />);
      html.push(<Bubble key="b" f={f} a={S("L1") - 2} b={sc.b} y={540} tx={640} ty={720} text="There are no glasses for you." />);
      html.push(<Label key="l" f={f} a={S("L1")} b={sc.b} y={560} text="as Lightoller recalled it, British inquiry" />);
      hideCaps = true;
      break;
    }
    case "berg": {
      const spot = W("K06", 14), cut = spot + 4;
      if (f < cut) world = <Win cx={960} cy={760} z={pz(0.85, 0.95)}><CrowsNest f={f} fleetSpec={FLEET} leeSpec={LEE} bell={W("K06", 16)} fleet={{ ...idle(f, 1), look: f >= spot - 6 ? 0.9 : 0.3, eyes: f >= spot - 6 ? "wide" : "normal", mouth: f >= spot - 6 ? "o" : "flat", armR: f >= spot - 6 ? 150 : 10 }} lee={{ ...idle(f, 2), look: 0.8 }} /></Win>;
      else world = <Win cx={1250} cy={560} z={lerp(1.15, 1.5, prog(f, cut, sc.b))}><NightSea f={f} shipX={lerp(900, 1060, prog(f, cut, sc.b))} berg={1} bergX={1350} scale={0.6} /></Win>;
      bg = "#070b1c";
      over.push(<Grade key="g" f={f} id="bg" tint="night" vig={0.8} pools={[{ x: 540, y: 300, r: 500, c: "#cfe0ff", a: 0.2 }]} />);
      html.push(<Stamp key="st" f={f} a={sc.a + 2} b={W("K06", 11)} text="14 April 1912" sub="North Atlantic" />);
      if (f < cut) top.push(<g key="ck" transform="translate(800 1530) scale(0.7)"><Clock f={f} h={11} m={40} label="11:40 P.M." /></g>);
      if (f >= W("K06", 19)) top.push(<g key="tc" transform={`translate(540 1150) rotate(-4) scale(${prog(f, W("K06", 19), W("K06", 19) + 6)})`}><rect x={-260} y={-70} width={520} height={130} rx={65} fill="#c0473f" stroke={INK} strokeWidth={8} /><text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={68} fill="#fff4dc">TOO CLOSE</text></g>);
      break;
    }
    case "quote": {
      world = <Win cx={1250} cy={560} z={1.3}><NightSea f={f} shipX={1060} berg={1} bergX={1350} scale={0.6} /></Win>;
      bg = "#070b1c";
      over.push(<Grade key="g" f={f} id="qt" tint="night" vig={0.85} />);
      const qa = W("K07", 7);
      top.push(<Card key="q" f={f} a={sc.a + 2} b={sc.b + 2} y={760} rot={-1} s={0.95}>
        <g><rect x={-440} y={-300} width={880} height={600} rx={24} fill="#fbf4e4" stroke={INK} strokeWidth={8} />
          <text x={0} y={-200} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={36} fill="#7b2f2a">“How much sooner?”</text>
          <text x={0} y={-70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={INK} opacity={prog(f, qa, qa + 6)}>“Well, enough to</text>
          <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill="#c0473f" opacity={prog(f, qa + 8, qa + 14)}>get out of the way.”</text>
          <g transform="translate(-300 170)"><Binoculars s={0.8} /></g>
          <text x={60} y={170} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={32} fill="#4a3a30">Frederick Fleet, lookout</text>
          <text x={60} y={215} textAnchor="middle" fontFamily={FONT2} fontWeight={700} fontSize={30} fill="#4a3a30">US Senate inquiry, 1912</text></g>
      </Card>);
      break;
    }
    case "tag": {
      const ys = W("K08", 8), flip = prog(f, W("K08", 11), W("K08", 13)), maybe = W("K08", 16), none = W("K08", 23);
      world = <V><Velvet f={f} /></V>; bg = "#1c0709";
      top.push(<g key="k" transform={f >= W("K08", 10) && f < maybe ? `translate(540 ${lerp(880, 920, prog(f, W("K08", 10), maybe))}) scale(${lerp(2.6, 2.9, prog(f, W("K08", 10), maybe))}) translate(-540 -770)` : `translate(540 ${lerp(1000, 1080, prog(f, sc.a, sc.b))}) scale(${f < maybe ? lerp(1.3, 1.6, prog(f, sc.a, ys)) : 1.2}) translate(-540 -1000)`}><Key x={540} y={1000} s={1} rot={swing(f, 4, 26)} flip={flip} glint={0.4} /></g>);
      html.push(<Stamp key="ys" f={f} a={ys} b={W("K08", 13)} text="You see..." y={240} />);
      if (f >= maybe) {
        const p = prog(f, maybe, maybe + 8);
        top.push(<g key="ic" opacity={p} transform="translate(0 0)">
          <g transform="translate(300 1640)"><rect x={-150} y={-110} width={300} height={220} rx={26} fill="#fbf4e4" stroke={INK} strokeWidth={7} /><rect x={-40} y={-70} width={80} height={110} rx={12} fill="#7b4a2c" stroke={INK} strokeWidth={5} /><path d="M -70 -50 Q -60 -95 0 -95 Q 60 -95 70 -50 L 50 -40 Q 40 -70 0 -70 Q -40 -70 -50 -40 Z" fill={INK} /><circle cx={0} cy={-20} r={22} fill="#e8d6b0" stroke={INK} strokeWidth={4} /><text y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK}>TELEPHONE</text></g>
          <g transform="translate(780 1640)"><rect x={-150} y={-110} width={300} height={220} rx={26} fill="#fbf4e4" stroke={INK} strokeWidth={7} /><g transform="translate(0 -30) scale(0.7)"><Binoculars /></g><text y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK}>BINOCULARS?</text></g>
          <text x={540} y={1665} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill="#ffd84a" stroke={INK} strokeWidth={10} paintOrder="stroke">or</text>
        </g>);
      }
      if (f >= none) html.push(<Label key="l" f={f} a={none} b={sc.b} y={1800} text="tag text: Encyclopedia Titanica; Blair's daughter, 1958" />);
      break;
    }
    case "locked": {
      const put = prog(f, W("K09", 6), W("K09", 9)), door = prog(f, W("K09", 9), W("K09", 9) + 8);
      world = <Win cx={1400} cy={520} z={1.05}><Cabin f={f} packed={1} bino={put} door={door} lock={prog(f, W("K09", 9) + 8, W("K09", 9) + 14)}>
        <Chibi spec={BLAIR} pose={{ ...idle(f, 1), armR: lerp(30, 90, put), look: 0.5, mouth: "flat" }} x={1220} y={1020} size={560} />
      </Cabin></Win>;
      over.push(<Grade key="g" f={f} id="lk" tint="lamp" vig={0.6} pools={[{ x: 540, y: 620, r: 560, c: "#ffd27a", a: 0.5 }]} />);
      html.push(<Label key="l" f={f} a={sc.a + 6} b={sc.b} y={560} text="lookout George Hogg, British inquiry, 1912" />);
      break;
    }
    case "mech": {
      world = <Win cx={960} cy={760} z={0.9}><CrowsNest f={f} fleetSpec={FLEET} leeSpec={LEE} fleet={{ ...idle(f, 1), look: 0.6 }} lee={{ ...idle(f, 2), look: 0.6 }} /></Win>;
      bg = "#070b1c";
      over.push(<Grade key="g" f={f} id="mc" tint="night" vig={0.7} />);
      top.push(<Panel key="pn" y={820} w={1040} label="EYES vs GLASSES"><EyeVsGlasses f={f} a={sc.a} b2={W("K10", 10)} /></Panel>);
      html.push(<Label key="l" f={f} a={W("K10", 1)} b={sc.b} y={1560} text="Lightoller, British inquiry: “first with my eyes”" />);
      break;
    }
    case "charity": {
      const sold = W("K11", 10), edu = W("K11", 13);
      if (f < edu) {
        world = <V><Velvet f={f} /></V>; bg = "#1c0709";
        top.push(<Key key="k" x={540} y={930} s={1.15} rot={swing(f, 6, 20)} glint={0.5} />);
        top.push(<Gavel key="gv" f={f} hit={W("K11", 12)} x={840} y={1600} s={1.0} />);
        top.push(<PriceTag key="pt" f={f} a={sold} x={330} y={1580} text="£90,000" sub="2007" />);
        html.push(<Stamp key="st" f={f} a={sc.a + 2} b={sold - 2} text="Given to a sailors' charity" sub="by Blair's daughter" />);
      } else {
        world = <Win cx={960} cy={640} z={1.05}><School f={f}>
          <Chibi spec={CADET} pose={{ ...idle(f, 3), look: -0.2, mouth: "smile", eyes: "happy", armR: 60 }} x={1060} y={1030} size={500} />
          <Chibi spec={{ ...CADET, id: "cadet2", main: "#3f7a5a", mainDark: "#2f5e45", skin: "#f8d9bf", hair: "#a4532f" }} pose={{ ...idle(f, 4), look: 0.3, mouth: "smile", write: 1 }} x={820} y={1030} size={460} />
        </School></Win>;
        over.push(<Grade key="g" f={f} id="ch" tint="warm" vig={0.5} pools={[{ x: 540, y: 400, r: 700, c: "#fff1c4", a: 0.45 }]} />);
        html.push(<Label key="l" f={f} a={edu + 2} b={sc.b} y={560} text="the Sailors' Society education programme" />);
      }
      break;
    }
    case "end": {
      const endA = W("K12", 9);
      world = <V><Velvet f={f} /></V>; bg = "#1c0709";
      if (f < endA) top.push(<Key key="k" x={540} y={900} s={1.4} rot={swing(f, 8, 20)} glint={0.5} />);
      top.push(<EndCard key="ec" f={f} a={endA} title="THE REAL TITANIC" sub="5 tiny things · 3 minutes"><g transform="translate(-40 40)"><Chibi spec={FLEET} pose={{ ...idle(f, 2), mouth: "smile" }} x={-120} y={130} size={380} /><Key x={170} y={30} s={0.45} rot={swing(f, 8, 20)} /></g></EndCard>);
      break;
    }
  }
  void clamp;
  return (
    <AbsoluteFill style={{ background: bg }}>
      {world}
      {over}
      <V>{top}</V>
      {html}
      <Captions f={f} caps={TL.caps} hide={hideCaps} />
      <Watermark />
      {!noAudio && <Audio src={staticFile("shE_mix.wav")} />}
    </AbsoluteFill>
  );
};
