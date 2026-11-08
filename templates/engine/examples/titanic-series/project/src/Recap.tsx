// "The Real Titanic in 3 Minutes: 5 tiny things" — main composition (1920x1080, 30 fps).
// Timeline (line starts, scenes, word timings) comes from recap/timeline.py -> src/timeline.json.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, delayRender, continueRender, getInputProps } from "remotion";
import TL from "./timeline.json";
import { Chibi, Pose, Spec } from "./chibi";
import { SMITH, ANDREWS, HARTLEY, BROWN, FLEET, LEE, PHILLIPS, MURDOCH, EVANS } from "./cast";
import { PAL, prog, lerp, clamp, INK } from "./style";
import { Sunburst, Sparkles, SmokePuff, SpeedLines, SweatDrop, ShockLines, SpeechBubble, NameTag, QuoteCard } from "./fx";
import { Titanic, Steamer, Iceberg, SeaSky, WaterFront } from "./ship";
import { Cam, TitleCard, Countdown, Departure, CrowsNest, RadioRoom, Bunk, Bridge, MapCard, LawBoard, NightSea, BandNight, Dawn, RulesCard, Icon } from "./scenes";
import { Deck } from "./deck";
import ENV from "./recap_env.json";

const FONT = "CapBlack, Montserrat, sans-serif";
export const RECAP_FRAMES = TL.total;
type LineKey = keyof typeof TL.lines;
const S = (k: LineKey) => TL.lines[k].start;
const E = (k: LineKey) => TL.lines[k].start + TL.lines[k].dur;
const W = (k: string, i: number) => {
  const w = (TL.words as Record<string, { w: string; s: number; e: number }[]>)[k];
  return TL.lines[k as LineKey].start + Math.round((w[Math.min(i, w.length - 1)].s) * 30);
};
const env = (k: "P1" | "F1" | "M1", f: number) => { const e = (ENV as Record<string, number[]>)[k]; const i = f - S(k); return i >= 0 && i < e.length ? e[i] : 0; };
const blinkAt = (f: number, every = 70, seed = 0) => { const d = (f + seed * 23) % every; return d < 6 ? [0.5, 1, 1, 0.6, 0.2, 0][d] : 0; };

// generic passengers for the lifeboat
const PASS_W: Spec = { id: "pw", name: "", skin: PAL.skinLight, hair: PAL.hairBrown, hairStyle: "updo", outfit: "dress", main: "#4f6a8f", mainDark: "#3a5070", female: true };
const PASS_W2: Spec = { ...PASS_W, id: "pw2", hair: PAL.hairDark, main: "#6b7f5a", mainDark: "#4f5f40" };
const PASS_M: Spec = { id: "pm", name: "", skin: PAL.skinMid, hair: PAL.hairDark, hairStyle: "short", outfit: "suit", main: "#5a4a3c", mainDark: "#3e3229" };
const HICHENS: Spec = { ...LEE, id: "hichens", name: "Robert Hichens", main: "#2c3a5e" };
const BAND2: Spec = { ...HARTLEY, id: "b2", beard: undefined, hair: PAL.hairDark };
const BAND3: Spec = { ...HARTLEY, id: "b3", hair: "#8a5a3a", beard: undefined };

// ---------------------------------------------------------------- captions with written numbers
const MERGE: [string, string][] = [
  ["eleven hundred and seventy-eight", "1,178"], ["two thousand", "2,000"], ["fifteen hundred", "1,500"], ["april tenth", "April 10th"],
  ["nineteen twelve", "1912"], ["number one", "#1"], ["number two", "#2"], ["number three", "#3"], ["number four", "#4"], ["number five", "#5"],
  ["nine forty p.m.", "9:40 p.m."], ["eleven forty p.m.", "11:40 p.m."], ["three times", "3 times"], ["five compartments", "5 compartments"],
  ["eighteen ninety-four", "1894"], ["ten thousand", "10,000"], ["forty-six thousand", "46,000"], ["twenty lifeboats", "20 lifeboats"],
  ["twenty-two hundred", "2,200"], ["twenty-eight", "28"], ["sixty-five", "65"], ["fifty-eight", "58"], ["three hours", "3 hours"],
  ["two twenty a.m.", "2:20 a.m."], ["seven hundred", "700"],
];
type Tok = { w: string; s: number; e: number };
const merged = (ws: Tok[]) => {
  const out: Tok[] = [];
  const norm = (x: string) => x.toLowerCase().replace(/[,.:;!?"]+$/g, "");
  for (let i = 0; i < ws.length; i++) {
    let done = false;
    for (const [sp, wr] of MERGE) {
      const n = sp.split(" ").length;
      if (i + n > ws.length) continue;
      const seq = ws.slice(i, i + n).map((x) => norm(x.w)).join(" ");
      if (seq === sp.replace(/[,.:;!?"]+$/g, "") || (seq + ".") === sp) {
        const last = ws[i + n - 1].w, punct = (last.match(/[,.:;!?"]+$/) || [""])[0];
        const tail = sp.endsWith(".") && punct.startsWith(".") ? punct.slice(1) : punct;
        out.push({ w: wr + tail, s: ws[i].s, e: ws[i + n - 1].e }); i += n - 1; done = true; break;
      }
    }
    if (!done) out.push(ws[i]);
  }
  return out;
};
const CAPS = (() => {
  const list: { text: string; a: number; b: number }[] = [];
  for (const [k, ws] of Object.entries(TL.words as Record<string, Tok[]>)) {
    const off = TL.lines[k as LineKey].start; let cur: Tok[] = [];
    const flush = () => { if (!cur.length) return; list.push({ text: cur.map((x) => x.w).join(" "), a: off + Math.round(cur[0].s * 30) - 1, b: off + Math.round(cur[cur.length - 1].e * 30) + 4 }); cur = []; };
    merged(ws).forEach((x) => { cur.push(x); if (/[.,:!?]["”]?$/.test(x.w) || cur.length >= 4) flush(); });
    flush();
  }
  list.sort((a, b) => a.a - b.a);
  for (let i = 0; i < list.length - 1; i++) if (list[i + 1].a <= list[i].b) list[i].b = list[i + 1].a - 1;
  return list;
})();
const Captions: React.FC<{ f: number; hide?: boolean }> = ({ f, hide }) => {
  const c = CAPS.find((p) => f >= p.a && f <= p.b);
  if (!c || hide) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 96, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 62, color: "#fff",
      WebkitTextStroke: "12px #1a1012", paintOrder: "stroke fill", textShadow: "0 5px 8px rgba(0,0,0,0.6)" }}>{c.text}</div>
  );
};

// ---------------------------------------------------------------- five icons (hook + callback)
const FiveIcons: React.FC<{ f: number; t0: number; hl?: number; y?: number }> = ({ f, t0, hl = 0, y = 380 }) => {
  const kinds = ["binoculars", "radio", "stopwatch", "law", "sleep"];
  return (
    <g>
      {kinds.map((k, i) => {
        const a = prog(f, t0 + i * 5, t0 + i * 5 + 7), pop = 1 + Math.sin(clamp((f - t0 - i * 5) / 8) * Math.PI) * 0.2;
        const isHl = hl > 0 && i === 4, wig = isHl ? Math.sin(f * 0.6) * 8 * hl : 0;
        return (
          <g key={k} transform={`translate(${360 + i * 300} ${y}) scale(${a * pop * (isHl ? 1 + 0.25 * hl : 1)}) rotate(${wig})`} opacity={hl > 0 && !isHl ? 1 - 0.55 * hl : 1}>
            <circle r={115} fill={isHl ? "#ff8a6b" : "#fff7e6"} stroke={INK} strokeWidth={7} />
            <g transform="scale(0.72)"><Icon kind={k} f={f} /></g>
            <circle cx={84} cy={-84} r={34} fill="#ffd84a" stroke={INK} strokeWidth={5} />
            <text x={84} y={-70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>{i + 1}</text>
            {isHl && hl > 0.5 && <text x={0} y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={90} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">?</text>}
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- telegram card overlay
const Telegram: React.FC<{ f: number; a: number; b: number; from: string; text: string; buried?: number; x?: number; y?: number; rot?: number }> = ({ f, a, b, from, text, buried = 0, x = 1180, y = 330, rot = -4 }) => {
  if (f < a || f > b) return null;
  const p = prog(f, a, a + 8);
  return (
    <g transform={`translate(${lerp(2300, x, p)} ${y + buried * 420}) rotate(${rot + buried * 20})`} opacity={1 - buried * 0.2}>
      <rect x={-330} y={-150} width={660} height={300} rx={10} fill="#fbf4e4" stroke={INK} strokeWidth={6} />
      <rect x={-330} y={-150} width={660} height={64} rx={10} fill="#e9dcc0" stroke={INK} strokeWidth={6} />
      <text x={-300} y={-106} fontFamily={FONT} fontWeight={900} fontSize={30} fill="#7b2f2a">{from}</text>
      {text.split("|").map((l, i) => <text key={i} x={-300} y={-36 + i * 48} fontFamily="Courier New, monospace" fontWeight={700} fontSize={32} fill={INK}>{l}</text>)}
    </g>
  );
};

// ---------------------------------------------------------------- fonts
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
  <div style={{ position: "absolute", right: 40, bottom: 34, fontFamily: "WmBold, Montserrat, sans-serif", fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.68)",
    letterSpacing: 0.3, WebkitTextStroke: "1.5px rgba(10,8,20,0.55)", paintOrder: "stroke fill", textShadow: "0 2px 4px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.55)" }}>@LeoKnowledgeSharing</div>
);

// ---------------------------------------------------------------- scenes
const scene = (f: number) => TL.scenes.find((s) => f >= s.a && f < s.b) ?? TL.scenes[TL.scenes.length - 1];

export const Recap: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFonts();
  if (!ok) return null;
  const noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  const sc = scene(f), lf = f - sc.a, name = sc.name;
  let svg: React.ReactNode = null; const html: React.ReactNode[] = [];
  let hideCaps = false;

  switch (name) {
    case "cold": {
      const z = lerp(1, 1.12, prog(f, 0, sc.b));
      const iconsT = W("N03", 8) - 4, hl = prog(f, S("N04") + 20, S("N04") + 34);
      svg = (<g>
        <Cam z={z} cy={620}><NightSea f={f} shipX={lerp(500, 820, prog(f, 0, sc.b))} berg={0.45 + 0.55 * prog(f, S("N02"), S("N02") + 40)} bergX={1700} scale={0.62} /></Cam>
        {f >= iconsT && <rect x={0} y={0} width={1920} height={1080} fill="#060a1c" opacity={0.55 * prog(f, iconsT, iconsT + 8)} />}
        {f >= iconsT && <FiveIcons f={f} t0={iconsT} hl={hl} />}
      </g>);
      break;
    }
    case "title": svg = <TitleCard f={lf} />; hideCaps = true; break;
    case "depart": {
      const z = f < S("N06") ? 1 : lerp(1, 1.25, prog(f, S("N06"), sc.b));
      svg = (<g>
        <Cam z={z} cy={560}><Departure f={f} shipX={lerp(820, 1100, prog(f, sc.a, sc.b))} /></Cam>
        {f >= W("N06", 7) - 2 && (
          <g transform={`translate(1380 300) rotate(-10) scale(${prog(f, W("N06", 7) - 2, W("N06", 7) + 4) * (1 + Math.sin(clamp((f - W("N06", 7)) / 7) * Math.PI) * 0.15)})`}>
            <rect x={-330} y={-70} width={660} height={130} rx={20} fill="none" stroke="#c0473f" strokeWidth={12} />
            <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill="#c0473f" letterSpacing={4}>UNSINKABLE?</text>
          </g>
        )}
        <Sparkles f={f} x={1000} y={360} spread={500} n={8} seed={2} />
      </g>);
      break;
    }
    case "who": {
      const appear = [S("N07"), S("N08"), S("N09"), S("N10")];
      const specs = [SMITH, ANDREWS, HARTLEY, BROWN], xs = [380, 770, 1160, 1550];
      const poses: Pose[] = [
        { look: 0.2, armL: f > appear[0] + 10 ? 30 : 0, blink: blinkAt(f, 80, 1), breathe: Math.sin(f / 18) },
        { look: -0.2, armR: 0, blink: blinkAt(f, 75, 2), mouth: "grin", breathe: Math.sin(f / 16) },
        { armL: 50 + Math.sin(f * 0.22) * 16, armR: 103, bow: Math.sin(f * 0.22), head: -8, eyes: "happy", breathe: Math.sin(f / 15) },
        { armR: f > appear[3] + 8 ? 150 + Math.sin(f * 0.45) * 14 : 0, look: -0.2, mouth: "grin", blink: blinkAt(f, 90, 3) },
      ];
      svg = (<g>
        <Departure f={f} shipX={1180}>
          {specs.map((s, i) => f >= appear[i] - 2 ? (
            <g key={s.id}>
              <g transform={`translate(${xs[i]} 1010) scale(${prog(f, appear[i], appear[i] + 6)}) translate(${-xs[i]} -1010)`}>
                <Chibi spec={s} pose={poses[i]} x={xs[i]} y={1010} size={430} facing={i === 2 ? -1 : 1} />
              </g>
              <SmokePuff t={f - appear[i] + 2} x={xs[i]} y={850} size={1.2} />
            </g>
          ) : null)}
        </Departure>
      </g>);
      const tags = [["Edward J. Smith", "Captain", "#c0473f"], ["Thomas Andrews", "Shipbuilder", "#3f7fbf"], ["Wallace Hartley", "Bandleader", "#3f7a5a"], ["Margaret Brown", "Passenger, 1st class", "#7b4a8c"]];
      tags.forEach(([n, r, c], i) => html.push(<NameTag key={n} f={f} a={appear[i] + 4} dur={sc.b - appear[i] - 6} x={xs[i]} y={i === 3 ? 560 : 600} name={n} role={r} color={c} />));
      break;
    }
    case "map1": svg = <Cam z={lerp(1, 1.08, prog(f, sc.a, sc.b))} cx={1100} cy={520}><MapCard f={lf} route={prog(f, sc.a + 6, E("N11") - 6)} show="route" /></Cam>; break;
    case "card1": hideCaps = true; svg = <Countdown f={lf} n={1} label="the binoculars" icon="binoculars" />; break;
    case "card2": hideCaps = true; svg = <Countdown f={lf} n={2} label="the radio room" icon="radio" />; break;
    case "card3": hideCaps = true; svg = <Countdown f={lf} n={3} label="a few seconds" icon="stopwatch" />; break;
    case "card4": hideCaps = true; svg = <Countdown f={lf} n={4} label="a law from 1894" icon="law" />; break;
    case "card5": hideCaps = true; svg = <Countdown f={lf} n={5} label="the ship that slept" icon="sleep" />; break;
    case "nest": case "nest2": case "quote1": case "nest3": {
      const shiver = Math.sin(f * 0.9) * 1.2;
      const spot = name === "nest3" ? prog(f, W("N24", 3), W("N24", 5)) : 0;
      const bells = name === "nest3" ? [W("N24", 10), W("N24", 10) + 12, W("N24", 10) + 24] : [];
      const bellAt = bells.filter((b) => f >= b).pop() ?? -99;
      const phone = name === "nest3" && f >= W("N24", 16) - 2;
      const fleetPose: Pose = {
        sway: shiver, look: name === "nest3" ? 0.7 : Math.sin(f * 0.05) * 0.6, eyes: spot > 0.5 ? "wide" : "normal", brow: spot > 0.5 ? 1 : 0,
        blink: blinkAt(f, 66, 4), armL: name === "nest2" ? 70 : bellAt > 0 && f - bellAt < 8 ? 110 : 0,
        armR: phone ? 120 : name === "nest2" ? 70 : 0, talk: env("F1", f), mouth: spot > 0.5 ? "o" : "flat",
      };
      const leePose: Pose = { sway: -shiver, look: name === "nest3" ? -0.7 : -Math.sin(f * 0.05 + 1) * 0.6, eyes: spot > 0.5 ? "wide" : "normal", blink: blinkAt(f, 72, 6), armL: name === "nest2" ? 70 : 0, armR: name === "nest2" ? 70 : 0, mouth: spot > 0.5 ? "o" : "flat" };
      const z = name === "quote1" ? lerp(1.5, 1.6, prog(f, sc.a, sc.b)) : name === "nest3" ? lerp(1, 1.18, prog(f, sc.a, sc.b)) : 1;
      svg = (<g>
        <Cam z={z} cx={name === "quote1" ? 820 : 960} cy={name === "quote1" ? 640 : 560}>
          <CrowsNest f={f} fleet={fleetPose} lee={leePose} fleetSpec={FLEET} leeSpec={LEE} bell={bellAt} phone={phone} berg={name === "nest3" ? spot : 0} />
        </Cam>
        {name === "nest2" && <g>{[620, 1260].map((x, i) => <text key={x} x={x} y={330 - Math.abs(Math.sin(f * 0.2 + i)) * 20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">?</text>)}</g>}
        {name === "nest3" && f >= W("N24", 3) && f < W("N24", 9) && <ShockLines t={f - W("N24", 4)} x={700} y={360} s={2.4} />}
      </g>);
      if (name === "nest") {
        html.push(<NameTag key="fl" f={f} a={W("N13", 6)} dur={70} x={820} y={330} name="Fred Fleet" role="Lookout" color="#3f7fbf" />);
        html.push(<NameTag key="le" f={f} a={W("N13", 9)} dur={60} x={1130} y={330} name="Reginald Lee" role="Lookout" color="#3f7a5a" />);
      }
      if (name === "quote1") html.push(<QuoteCard key="q" f={f} a={W("N15", 16) - 3} b={sc.b} quote="Well, enough to get out of the way." source="Frederick Fleet, lookout · US Senate inquiry, 1912" />);
      if (name === "nest3") html.push(<SpeechBubble key="f1" f={f} a={S("F1") - 2} b={sc.b} x={560} y={300} tx={760} ty={420} text="Iceberg right ahead!" width={500} color="#fff7d6" />);
      if (name === "quote1") hideCaps = f >= W("N15", 16) - 3;
      break;
    }
    case "key": {
      const leg = W("N14", 15), tag = W("N14", 22);
      const sw = Math.sin(f * 0.12) * 14;
      svg = (<g>
        <Sunburst f={f} c1="#bfe3f0" c2="#a6d6ea" />
        <g transform={`translate(960 260) rotate(${sw})`}>
          <path d="M 0 -300 L 0 0" stroke={INK} strokeWidth={6} />
          <g transform="translate(0 40)">
            <circle cx={0} cy={0} r={60} fill="none" stroke={INK} strokeWidth={36} /><circle cx={0} cy={0} r={60} fill="none" stroke="#e3b14a" strokeWidth={24} />
            <rect x={-16} y={50} width={32} height={260} fill="#e3b14a" stroke={INK} strokeWidth={6} />
            <path d="M 16 240 L 70 240 L 70 270 L 16 270 M 16 290 L 56 290 L 56 310 L 16 310" fill="#e3b14a" stroke={INK} strokeWidth={6} />
            {/* tag */}
            <g transform={`translate(-150 120) rotate(${-8 + sw * 0.4}) scale(${f >= tag ? 1 + Math.sin(clamp((f - tag) / 8) * Math.PI) * 0.25 : 1})`}>
              <path d="M 120 -60 L 40 0" stroke={INK} strokeWidth={5} />
              <rect x={-170} y={-10} width={240} height={110} rx={14} fill="#fbf4e4" stroke={INK} strokeWidth={6} />
              <text x={-50} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={f >= tag ? 26 : 30} fill={INK}>{f >= tag ? "CROW'S NEST" : "? ? ?"}</text>
              {f >= tag && <text x={-50} y={74} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#c0473f">TELEPHONE</text>}
            </g>
          </g>
        </g>
        {f >= leg && f < tag && (
          <g transform={`translate(1430 760) rotate(-12) scale(${prog(f, leg, leg + 5)})`}>
            <rect x={-250} y={-70} width={500} height={130} rx={18} fill="none" stroke="#c0473f" strokeWidth={12} />
            <text x={0} y={28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill="#c0473f">BINOCULARS?</text>
          </g>
        )}
        {f >= tag + 18 && <g transform={`translate(1430 760) rotate(-12) scale(${prog(f, tag + 18, tag + 24)})`}><rect x={-230} y={-70} width={460} height={130} rx={18} fill="none" stroke="#2f6fb0" strokeWidth={12} /><text x={0} y={28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill="#2f6fb0">HMM...</text></g>}
        <Sparkles f={f} x={960} y={420} spread={420} n={8} seed={7} />
      </g>);
      break;
    }
    case "radio": {
      const pile = prog(f, S("N18"), E("N20"));
      const cu = f >= S("N19") && f < S("N20") ? 1 : f >= S("P1") - 2 ? 2 : 0;
      const ph: Pose = {
        write: 1, armL: -38, armR: -30 - Math.abs(Math.sin(f * 1.1)) * 14, look: Math.sin(f * 0.2) * 0.4, eyes: f >= S("P1") - 2 ? "squint" : "normal",
        brow: f >= S("P1") - 2 ? -1 : -0.3, blink: blinkAt(f, 60, 8), talk: env("P1", f), mouth: f >= S("P1") - 2 ? "grin" : "flat", head: Math.sin(f * 0.6) * 2,
      };
      const flash = f >= S("N21") && f < S("N21") + 40 ? (Math.floor(f / 4) % 2) : 0;
      const z = cu === 1 ? 1.45 : cu === 2 ? lerp(1.8, 1.9, prog(f, S("P1"), sc.b)) : 1;
      svg = (<g>
        <Cam z={z} cx={cu ? 760 : 960} cy={cu ? 560 : 540} dx={cu === 2 ? Math.sin(f * 2.5) * 4 : 0}>
          <RadioRoom f={f} spec={PHILLIPS} pose={ph} pile={pile} clock={f >= S("N20") && f < E("N20") ? "9:40" : ""} flash={flash} />
          {cu !== 2 && f < E("N20") && Array.from({ length: 4 }, (_, i) => { const a = (f + i * 17) % 68; return <g key={i} transform={`translate(${-200 + a * 22} ${200 + i * 90 + Math.sin(a * 0.2) * 30}) rotate(${a * 3})`} opacity={a < 60 ? 1 : 0}><rect x={-60} y={-22} width={120} height={44} rx={4} fill="#fbf4e4" stroke={INK} strokeWidth={3} /></g>; })}
        </Cam>
        <Telegram f={f} a={W("N20", 5)} b={E("N20") + 6} from="MESABA → TITANIC" text={"Ice report... saw much|heavy pack ice and great|number large icebergs."} buried={prog(f, W("N20", 18), W("N20", 22))} />
        <Telegram f={f} a={W("N21", 5)} b={S("P1") - 3} from="CALIFORNIAN → TITANIC" text={"Say, old man, we are|stopped and surrounded|by ice."} x={1200} y={360} rot={3} />
        {cu === 2 && <ShockLines t={f - S("P1") - 4} x={1240} y={300} s={2.4} />}
      </g>);
      html.push(<NameTag key="ph" f={f} a={W("N19", 2)} dur={55} x={980} y={300} name="Jack Phillips" role="Radio operator" color="#3f7fbf" />);
      html.push(<SpeechBubble key="p1" f={f} a={S("P1") - 2} b={sc.b} x={1360} y={330} tx={1120} ty={430} text="Shut up, shut up! I am busy. I am working Cape Race!" width={600} />);
      if (f >= S("P1") - 2) html.push(<div key="lbl" style={{ position: "absolute", left: 1150, top: 74, background: "#ffd84a", border: `4px solid ${INK}`, borderRadius: 14, padding: "4px 14px", fontFamily: "WmBold, sans-serif", fontWeight: 700, fontSize: 24, color: INK }}>real message, as Evans recalled it</div>);
      break;
    }
    case "remember": {
      svg = (<g>
        <SeaSky f={f} mode="night" horizon={620} />
        {[[300, 640, 0.16], [1500, 630, 0.12], [700, 660, 0.1]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y})`}><Iceberg s={s as number} /></g>)}
        <g transform="translate(1000 700) scale(0.75)"><Steamer f={f} kind="californian" night /></g>
        <g transform="translate(960 700)"><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g>
        <circle cx={1000} cy={580} r={330 + Math.sin(f * 0.3) * 8} fill="none" stroke="#ffd84a" strokeWidth={12} strokeDasharray="30 18" opacity={prog(f, sc.a, sc.a + 8)} />
      </g>);
      html.push(<NameTag key="cal" f={f} a={sc.a + 6} dur={sc.b - sc.a - 8} x={1000} y={250} name="SS Californian" role="Remember this ship!" color="#c0473f" />);
      break;
    }
    case "bridge": {
      const wheel = -lerp(0, 300, prog(f, S("M1"), S("M1") + 30));
      const m: Pose = { look: -0.5, talk: env("M1", f), eyes: f >= S("M1") ? "wide" : "normal", brow: f >= S("M1") ? 1 : 0, armR: f >= S("M1") ? 110 : 0, blink: blinkAt(f, 70, 9), mouth: "o" };
      svg = <Bridge f={f} murdoch={m} mSpec={MURDOCH} helm={HICHENS} wheel={wheel} berg={prog(f, sc.a, sc.b) * 0.8 + 0.1} shake={0} />;
      html.push(<NameTag key="mu" f={f} a={W("N25", 2)} dur={60} x={1240} y={360} name="William Murdoch" role="First Officer" color="#c0473f" />);
      html.push(<SpeechBubble key="m1" f={f} a={S("M1") - 2} b={sc.b} x={1500} y={330} tx={1280} ty={430} text="Hard a-starboard!" width={440} color="#fff7d6" />);
      break;
    }
    case "turn": {
      const p = prog(f, sc.a, sc.b);
      svg = (<g>
        <Cam z={lerp(1.4, 1.6, p)} cx={1200} cy={700}><NightSea f={f} shipX={lerp(700, 980, p)} berg={1} bergX={1640} scale={0.62} tilt={-1.5 * p} /></Cam>
        <rect x={0} y={0} width={1920} height={1080} fill="none" stroke="#000" strokeWidth={120} opacity={0.35} />
      </g>);
      break;
    }
    case "hit": {
      const split = W("N27", 9) - 2;
      if (f < split) {
        const shake = prog(f, sc.a, sc.a + 4) * (1 - prog(f, split - 10, split));
        svg = (<g transform={`translate(${Math.sin(f * 2.3) * 10 * shake} ${Math.cos(f * 1.9) * 6 * shake})`}>
          <Cam z={1.6} cx={1250} cy={720}><NightSea f={f} shipX={lerp(980, 1060, prog(f, sc.a, split))} berg={1} bergX={1600} scale={0.62} /></Cam>
          {Array.from({ length: 10 }, (_, i) => { const a = (f * 3 + i * 23) % 60; return <line key={i} x1={1180 - a * 6} y1={700 + (i % 4) * 30} x2={1180 - a * 6 - 30} y2={700 + (i % 4) * 30 - 20} stroke="#ffd84a" strokeWidth={5} opacity={1 - a / 60} />; })}
        </g>);
      } else {
        const fill = prog(f, W("N27", 10), W("N27", 13) + 10);
        svg = (<g>
          <rect x={0} y={0} width={1920} height={1080} fill="#0b1430" />
          <g transform="translate(960 560) scale(1.05)">
            <path d="M -800 -120 L 760 -140 Q 800 -40 760 120 L -720 120 Q -820 40 -800 -120 Z" fill="#1d1b22" stroke={INK} strokeWidth={8} />
            <text x={-20} y={-170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#cfd2df">16 watertight compartments</text>
            {Array.from({ length: 16 }, (_, i) => {
              const x0 = 760 - (i + 1) * 95, flooded = i < 5;
              return <g key={i}>
                <rect x={x0} y={-110} width={92} height={220} fill="#e9e3d8" />
                {flooded && <rect x={x0} y={110 - 220 * fill} width={92} height={220 * fill} fill="#3f7fbf" opacity={0.9} />}
                <line x1={x0} y1={-120} x2={x0} y2={120} stroke={INK} strokeWidth={5} />
              </g>;
            })}
          </g>
          <g opacity={prog(f, W("N27", 14), W("N27", 14) + 6)}><rect x={430} y={740} width={500} height={90} rx={45} fill="#cfe8d6" stroke={INK} strokeWidth={5} /><text x={680} y={800} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>4 flooded: floats</text></g>
          <g opacity={prog(f, W("N27", 20), W("N27", 20) + 6)}><rect x={990} y={740} width={500} height={90} rx={45} fill="#ff8a6b" stroke={INK} strokeWidth={5} /><text x={1240} y={800} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>5 flooded: sinks</text></g>
          <text x={1740} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#ffd84a">BOW →</text>
        </g>);
      }
      break;
    }
    case "andrews": {
      svg = (<Deck f={f} camX={-120} zoom={lerp(1.25, 1.35, prog(f, sc.a, sc.b))} focusY={640} dim={0.62}
        stage={<g>
          <Chibi spec={ANDREWS} pose={{ armR: 70, look: 0.6, eyes: "wide", brow: 1, mouth: "flat", blink: blinkAt(f, 90, 2) }} x={820} y={1030} size={520} />
          <Chibi spec={SMITH} pose={{ look: -0.6, eyes: "normal", brow: 0.8, mouth: "flat", nod: Math.max(0, Math.sin((f - sc.a) * 0.08)) * 0.4 }} x={1260} y={1026} size={540} />
        </g>} />);
      break;
    }
    case "law": {
      const step = f < S("N31") ? 0 : 1;
      svg = <Cam z={lerp(1, 1.07, prog(f, sc.a, sc.b))}><LawBoard f={step === 0 ? f - sc.a : f - S("N31")} step={step} /></Cam>;
      break;
    }
    case "seats": svg = <Cam z={lerp(1, 1.05, prog(f, sc.a, sc.b))}><LawBoard f={lf * 1.6} step={2} /></Cam>; break;
    case "boat7": svg = <Cam z={lerp(1, 1.08, prog(f, sc.a, sc.b))} cy={600}><LawBoard f={lf} step={3} /></Cam>; break;
    case "bunk": {
      svg = <Bunk f={f} spec={EVANS} />;
      html.push(<NameTag key="ev" f={f} a={W("N35", 4)} dur={70} x={1260} y={330} name="Cyril Evans" role="Radio operator, SS Californian" color="#c0473f" />);
      break;
    }
    case "calls": {
      svg = (<g>
        <SeaSky f={f} mode="night" horizon={640} />
        <g transform="translate(420 700) scale(0.42)"><Titanic f={f} night smoke={false} /></g>
        <g transform="translate(1500 690) scale(0.5)"><Steamer f={f} kind="californian" night lights={0.3} /></g>
        <g transform="translate(960 700)"><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g>
        {Array.from({ length: 4 }, (_, i) => { const a = (lf + i * 14) % 56; const x = 520 + a * 16; return <path key={i} d={`M ${x} 420 q 30 60 0 120`} fill="none" stroke="#ffd84a" strokeWidth={8} strokeLinecap="round" opacity={x < 1340 ? 1 - a / 70 : 0} />; })}
        <text x={940} y={360} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill="#ffd84a" stroke={INK} strokeWidth={8} paintOrder="stroke">CQD... SOS...</text>
        {[0, 1, 2].map((i) => { const a = (f * 0.8 + i * 30) % 90; return <text key={i} x={1540 + a * 1.5} y={400 - a * 1.8} fontFamily={FONT} fontWeight={900} fontSize={50 + a * 0.4} fill="#fff" stroke={INK} strokeWidth={7} paintOrder="stroke" opacity={1 - a / 90}>Z</text>; })}
      </g>);
      break;
    }
    case "rockets": {
      svg = (<Cam z={lerp(1, 1.1, prog(f, sc.a, sc.b))} cx={1200} cy={600}>
        <NightSea f={f} shipX={1450} scale={0.32} rockets />
        <g transform="translate(560 900) scale(0.95)"><Steamer f={f} kind="californian" night lights={0.4} /></g>
        <g transform="translate(960 920)"><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g>
      </Cam>);
      break;
    }
    case "map2": svg = <Cam z={lerp(1, 1.18, prog(f, sc.a, sc.b))} cx={760} cy={600}><MapCard f={lf} route={1} show="ships" /></Cam>; break;
    case "sink": {
      const p = prog(f, sc.a, sc.b);
      svg = <Cam z={1.1} cy={640}><NightSea f={f} shipX={960} tilt={lerp(2, 14, p)} sink={lerp(0.05, 0.5, p)} lights={1 - prog(f, sc.a + 20, sc.a + 50)} scale={0.62} /></Cam>;
      break;
    }
    case "band": svg = <BandNight f={f} hartley={HARTLEY} extra={[BAND2, BAND3]} />; break;
    case "empty": svg = <g transform={`translate(0 ${lerp(0, -30, prog(f, sc.a, sc.b))})`}><SeaSky f={f} mode="night" horizon={640} /><g transform="translate(960 700)"><WaterFront f={f} width={4000} color="#0b1430" line="#3d4f86" /></g></g>; break;
    case "dawn": svg = <Dawn f={f} brown={BROWN} rowers={[PASS_W, PASS_M, PASS_W2]} carpX={lerp(1750, 1350, prog(f, sc.a, sc.b))} />; break;
    case "rules": {
      svg = f < S("N44") - 4
        ? <g><rect x={0} y={0} width={1920} height={1080} fill="#f3e6c8" /><FiveIcons f={f} t0={sc.a} y={500} /></g>
        : <Cam z={lerp(1, 1.08, prog(f, S("N44"), sc.b))}><RulesCard f={(f - S("N44")) * 0.9 + 8} /></Cam>;
      break;
    }
    case "final": {
      const all = [SMITH, ANDREWS, HARTLEY, BROWN, FLEET, PHILLIPS, MURDOCH];
      svg = (<g>
        <Sunburst f={f} c1="#ffe7a6" c2="#ffd77a" />
        {f < S("N46") ? (
          <g>
            <SeaSky f={f} mode="dawn" horizon={700} />
            <g transform={`translate(${lerp(700, 1100, prog(f, sc.a, S("N46")))} 800) scale(${lerp(0.62, 0.7, prog(f, sc.a, S("N46")))})`}><Titanic f={f} /></g>
            <g transform="translate(960 800)"><WaterFront f={f} width={4000} color="#5a6f9e" /></g>
            <text x={960} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#fff4dc" stroke={INK} strokeWidth={14} paintOrder="stroke" opacity={prog(f, W("N45", 5), W("N45", 6))}>1912</text>
          </g>
        ) : (
          <g>
            {all.map((s, i) => <Chibi key={s.id} spec={s} pose={{ armR: s.prop === "violin" ? 103 : 150 + Math.sin(f * 0.45 + i) * 14, armL: s.prop === "violin" ? 50 : 0, mouth: "grin", eyes: i % 2 ? "happy" : "normal", breathe: Math.sin(f / 15 + i), head: Math.sin(f * 0.1 + i) * 3 }} x={220 + i * 245} y={1000} size={380} facing={i > 3 ? -1 : 1} />)}
            <g transform={`translate(960 260) scale(${prog(f, S("N46"), S("N46") + 8)})`}>
              <path d="M -360 -90 Q -360 -140 -310 -140 L 310 -140 Q 360 -140 360 -90 L 360 60 Q 360 110 310 110 L -60 110 L -120 170 L -120 110 L -310 110 Q -360 110 -360 60 Z" fill="#fff" stroke={INK} strokeWidth={8} />
              <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK}>Which tiny thing</text>
              <text x={0} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK}>surprised you most?</text>
            </g>
          </g>
        )}
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
      {!noAudio && <Audio src={staticFile("recap_mix.wav")} />}
    </AbsoluteFill>
  );
};
