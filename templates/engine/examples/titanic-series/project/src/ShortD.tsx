// Short D (vertical): "Titanic told an ice warning to shut up" — the Californian's last call, from Episode 2.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps } from "remotion";
import TL from "./shD_timeline.json";
import { Pose } from "./chibi";
import { PHILLIPS, EVANS } from "./cast";
import { prog, lerp, clamp, INK } from "./style";
import { ShockLines } from "./fx";
import { NightSea, RadioRoom, Bunk } from "./scenes";
import { SeaSky, Steamer, WaterFront, Iceberg } from "./ship";
import { WirelessMech } from "./ep2sets";
import { Marconigram, Clock, AtlMap } from "./kit16";
import { Win, V, Grade, Captions, Watermark, Stamp, Label, VTag, HookText, Card, EndCard, Bubble, Panel, useFonts, FONT } from "./vshort";
import { Chibi } from "./chibi";

export const SHD_FRAMES = TL.total;
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

export const ShortD: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFonts();
  if (!ok) return null;
  const noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  const sc = scene(f), name = sc.name, pz = (a: number, b: number) => lerp(a, b, prog(f, sc.a, sc.b));
  let world: React.ReactNode = null, bg = "#0b1430";
  const over: React.ReactNode[] = [], html: React.ReactNode[] = [], top: React.ReactNode[] = [];
  let hideCaps = false;
  const tapping = (fast = 1): Pose => ({ write: 1, armL: -38, armR: -30 - Math.abs(Math.sin(f * 1.1 * fast)) * 14, blink: blinkAt(f, 60, 4), mouth: "flat", eyes: "squint" });
  const titanicRoom = (pose: Pose, pile: number) => <Win cx={820} cy={640} z={1.25}><RadioRoom f={f} spec={PHILLIPS} pose={pose} pile={pile} clock="" /></Win>;
  const caliRoom = (pose: Pose) => <Win cx={820} cy={640} z={1.25}><RadioRoom f={f} spec={EVANS} pose={pose} pile={0.1} clock="" who="californian" /></Win>;
  const lamp = (id: string) => over.push(<Grade key="g" f={f} id={id} tint="lamp" vig={0.6} pools={[{ x: 300, y: 600, r: 520, c: "#ffd27a", a: 0.55, flicker: 0.15 }]} />);

  switch (name) {
    case "hook": {
      const shut = W("D01", 18);
      if (f < W("D01", 15)) {
        world = caliRoom({ ...tapping(), eyes: "normal" });
        over.push(<Grade key="g" f={f} id="hk" tint="cool" vig={0.65} />);
        top.push(<Card key="m" f={f} a={-20} b={W("D01", 15)} y={1000} rot={-2} s={0.95} dim={0.3}><Marconigram f={f} from="Californian" to="Titanic" time="about 11 p.m., 14 April 1912" lines={["SAY, OLD MAN, WE ARE STOPPED", "AND SURROUNDED BY ICE"]} typed={prog(f, 4, W("D01", 14))} /></Card>);
      } else {
        world = titanicRoom({ ...tapping(), brow: -1, mouth: f >= shut ? "o" : "flat", armL: 140 }, 0.95);
        lamp("hk2");
        if (f >= shut) top.push(<g key="sh"><ShockLines t={f - shut} x={540} y={760} s={2.4} /><g transform={`translate(540 1150) rotate(-6) scale(${1 + Math.sin(clamp((f - shut) / 6) * Math.PI) * 0.25})`}><rect x={-300} y={-80} width={600} height={150} rx={30} fill="#ff8a7a" stroke={INK} strokeWidth={8} /><text y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={90} fill={INK}>“SHUT UP”</text></g></g>);
      }
      html.push(<HookText key="h" f={f} a={0} b={sc.b} l1="A SHIP WARNED TITANIC" l2="IT SAID: SHUT UP" y={240} />);
      hideCaps = true;
      break;
    }
    case "cali": {
      const room = W("D02", 12);
      if (f < room) {
        world = <Win cx={pz(820, 980)} cy={620} z={1.1}><g><SeaSky f={f} mode="night" horizon={700} /><g transform="translate(960 760) scale(0.7)"><Steamer f={f} kind="californian" night lights={0.6} /></g><g transform="translate(0 760)"><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g>{[[600, 900, 0.35], [1350, 880, 0.3], [800, 980, 0.22], [1150, 1000, 0.28]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><Iceberg /></g>)}{Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={500 + ((i * 97) % 900)} cy={820 + ((i * 53) % 220)} rx={40 + (i % 3) * 20} ry={10} fill="#dfeaf5" opacity={0.7} />)}</g></Win>;
        over.push(<Grade key="g" f={f} id="cl" tint="night" vig={0.75} />);
        html.push(<Stamp key="st" f={f} a={sc.a + 2} b={room - 2} text="The Californian" sub="stopped for the night, in ice" />);
      } else {
        world = caliRoom({ ...tapping(), eyes: "normal", mouth: "smile" });
        over.push(<Grade key="g" f={f} id="cl2" tint="cool" vig={0.6} />);
        html.push(<VTag key="ev" f={f} a={W("D02", 16)} dur={sc.b - W("D02", 16)} y={600} name="Cyril Evans" role="Californian's only wireless operator" color="#3a4466" />);
      }
      break;
    }
    case "pile": {
      world = titanicRoom(tapping(1.6), lerp(0.4, 1, prog(f, sc.a, sc.b)));
      lamp("pl");
      html.push(<VTag key="ph" f={f} a={W("D03", 2)} dur={W("D03", 8) - W("D03", 2)} y={600} name="Jack Phillips" role="Titanic's senior wireless operator" color="#2c3a5e" />);
      if (f >= W("D03", 13)) top.push(<g key="ck" transform={`translate(800 380) scale(${prog(f, W("D03", 13), W("D03", 13) + 8) * 0.6})`}><Clock f={f} h={11} m={0} spin={4} label="≈ 6 HOURS DOWN" /></g>);
      break;
    }
    case "cape": {
      world = <V><rect width={1080} height={1920} fill="#9fc3d9" /></V>;
      over.push(<Grade key="g" f={f} id="cp" tint="none" vig={0.35} grain={false} />);
      top.push(<Panel key="pn" y={900} w={1040} label="CAPE RACE, NEWFOUNDLAND"><AtlMap f={f} ship={0.72} cape={1} range={prog(f, W("D04", 5), W("D04", 9))} /></Panel>);
      if (f >= W("D04", 12)) top.push(<g key="go" transform={`translate(540 1330) scale(${prog(f, W("D04", 12), W("D04", 12) + 8)})`}><rect x={-300} y={-60} width={600} height={110} rx={55} fill="#7fd08a" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>SEND THE PILE!</text></g>);
      break;
    }
    case "mech": {
      const ys = W("D05", 5), jam = W("D05", 32);
      if (f < ys) { world = titanicRoom(tapping(1.6), 0.9); lamp("mc"); top.push(<g key="q" transform={`translate(540 1150) scale(${prog(f, sc.a, sc.a + 8)})`}><rect x={-340} y={-70} width={680} height={130} rx={30} fill="#fff7e6" stroke={INK} strokeWidth={7} /><text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK}>WHY SO RUDE?</text></g>); }
      else {
        world = <V><rect width={1080} height={1920} fill="#e9eef2" /></V>;
        over.push(<Grade key="g" f={f} id="mc2" tint="none" vig={0.3} grain={false} />);
        top.push(<Panel key="pn" y={880} w={1040} label="ONE STATION AT A TIME"><WirelessMech f={f} a={ys} jam={prog(f, jam, jam + 10)} /></Panel>);
        html.push(<Stamp key="ys" f={f} a={ys} b={W("D05", 14)} text="You see..." />);
        if (f >= W("D05", 19)) top.push(<g key="lb" transform={`translate(540 1330)`}><rect x={-440} y={-50} width={880} height={96} rx={48} fill="#fff7e6" stroke={INK} strokeWidth={6} opacity={prog(f, W("D05", 19), W("D05", 19) + 6)} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={INK} opacity={prog(f, W("D05", 19), W("D05", 19) + 6)}>{f < W("D05", 26) ? "Cape Race: far + faint" : "Californian: close + LOUD"}</text></g>);
      }
      break;
    }
    case "reply": {
      world = titanicRoom({ ...tapping(), brow: -1, mouth: f >= S("P2") && f < E("P2") ? "o" : "flat", armL: 140 }, 0.95);
      lamp("rp");
      html.push(<Bubble key="b" f={f} a={S("P2") - 2} b={sc.b} y={560} tx={560} ty={760} text="Shut up, shut up, I am busy. I am working Cape Race." />);
      html.push(<Label key="l" f={f} a={S("P2")} b={sc.b} y={580} text="real reply, as Evans recalled it (US inquiry)" />);
      hideCaps = true;
      break;
    }
    case "evans": {
      const bed = W("D06", 16);
      if (f < bed) { world = caliRoom({ ...idle(f, 2), armR: 20, look: 0.2, mouth: "smile", eyes: "happy" }); over.push(<Grade key="g" f={f} id="ev" tint="cool" vig={0.6} />); html.push(<Label key="l" f={f} a={sc.a + 6} b={bed - 2} y={560} text="Evans: “you do not take it as an insult”" />); }
      else { world = <Win cx={1000} cy={560} z={1.05}><Bunk f={f} spec={EVANS} /></Win>; over.push(<Grade key="g" f={f} id="ev2" tint="night" vig={0.7} />); top.push(<g key="ck" transform="translate(540 1150) scale(0.75)"><Clock f={f} h={11} m={35} label="11:35 P.M." /></g>); }
      break;
    }
    case "berg": {
      world = <Win cx={1250} cy={560} z={pz(1.2, 1.4)}><NightSea f={f} shipX={lerp(900, 1050, prog(f, sc.a, sc.b))} berg={1} bergX={1350} scale={0.6} /></Win>;
      bg = "#070b1c";
      over.push(<Grade key="g" f={f} id="bg" tint="night" vig={0.8} />);
      top.push(<g key="ck" transform="translate(540 1150) scale(0.75)"><Clock f={f} h={11} m={40} label="11:40 P.M." /></g>);
      break;
    }
    case "off": {
      world = <Win cx={420} cy={420} z={1.6}><Bunk f={f} spec={EVANS} /></Win>;
      bg = "#26304f";
      over.push(<Grade key="g" f={f} id="of" tint="night" vig={0.75} />);
      top.push(<g key="cq">{[0, 1, 2].map((i) => { const t = ((f * 1.4 + i * 30) % 90) / 90; return <circle key={i} cx={1000} cy={300} r={60 + t * 700} fill="none" stroke="#ff8a7a" strokeWidth={10} opacity={(1 - t) * 0.7} />; })}<g transform="translate(760 330) rotate(-6)"><rect x={-160} y={-48} width={320} height={90} rx={45} fill="#ff8a7a" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>CQD · CQD</text></g></g>);
      html.push(<Label key="l" f={f} a={W("D08", 6)} b={sc.b} y={1150} text="Titanic's distress calls, from about 12:15 a.m." />);
      break;
    }
    case "end": {
      const endA = sc.a + 10;
      world = <Win cx={1250} cy={560} z={1.25}><NightSea f={f} shipX={1000} berg={1} bergX={1350} scale={0.6} /></Win>;
      bg = "#070b1c";
      over.push(<Grade key="g" f={f} id="en" tint="night" vig={0.8} />);
      top.push(<EndCard key="ec" f={f} a={endA} title="EPISODE 2" sub="“Four Days at Sea”"><g transform="translate(0 20)"><Chibi spec={PHILLIPS} pose={{ ...idle(f, 2), write: 1, armL: -38, armR: -40, mouth: "flat" }} x={0} y={130} size={400} /></g></EndCard>);
      if (f >= endA + 10) hideCaps = true;
      break;
    }
  }
  void env;
  return (
    <AbsoluteFill style={{ background: bg }}>
      {world}
      {over}
      <V>{top}</V>
      {html}
      <Captions f={f} caps={TL.caps} hide={hideCaps} />
      <Watermark />
      {!noAudio && <Audio src={staticFile("shD_mix.wav")} />}
    </AbsoluteFill>
  );
};
