// Test 2 (~22 s): recap-style scene with narrator + captions, character voices in speech bubbles, name tags,
// close-ups, comic effects and a music/SFX mix. Facts: Andrews designed Titanic and sailed on the maiden voyage;
// he thought the reading & writing room was too large (Ismay, British inquiry); steward Henry Etches told the US
// inquiry "He was working all the time" (US Senate inquiry, 1912). Smith's line and "Not yet, Captain!" are playful.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, delayRender, continueRender, getInputProps } from "remotion";
import { Chibi, Pose } from "./chibi";
import { SMITH, ANDREWS_NB, HARTLEY } from "./cast";
import { Deck } from "./deck";
import { prog, lerp, clamp } from "./style";
import { Sunburst, Sparkles, SmokePuff, SpeedLines, SweatDrop, ShockLines, SpeechBubble, NameTag, QuoteCard, Captions, phrases } from "./fx";
import { VOICE } from "./voicedata";
import { Watermark } from "./StyleTest";

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

// ---- timeline (frames @30 fps); sound2.py uses the same numbers via cues2.json ----
export const T = {
  COLD: 0, WIDE: 54, MED: 168, CU1: 238, QUOTE: 330, TWO: 436, CU2: 574, END: 626, OUT: 690,
  n1: 60, n2: 172, a1: 244, n3: 334, card: 384, s1: 500, a2: 578, tagA: 82, tagS: 446, sweat: 634,
};
export const DURATION2 = T.OUT;

const SIZE = 520, GROUND = 1030, HEAD = 0.97; // head top ≈ 0.97 * size above the feet
const env = (key: "a1" | "a2" | "s1", f: number, start: number) => {
  const e = VOICE[key].env as readonly number[]; const i = f - start;
  return i >= 0 && i < e.length ? e[i] : 0;
};
const blinkAt = (f: number, starts: number[]) => {
  for (const s of starts) { const d = f - s; if (d >= 0 && d < 6) return [0.5, 1, 1, 0.6, 0.2, 0][d]; }
  return 0;
};

type Cam = { camX: number; zoom: number; focusY: number };
const toScreen = (c: Cam, wx: number, wy: number) => [960 + (wx - c.camX - 960) * c.zoom, 540 + (wy - c.focusY) * c.zoom] as const;

export const Test2: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFonts();
  if (!ok) return null;
  const noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  const caps = [
    ...phrases(VOICE.n1.words as never, T.n1), ...phrases(VOICE.n2.words as never, T.n2), ...phrases(VOICE.n3.words as never, T.n3),
  ].filter((c) => c.a < T.card - 2 || c.a >= T.TWO);

  // ---------- Andrews ----------
  const write = (spd: number) => -30 - Math.abs(Math.sin(f * spd)) * 16;
  let aX = 760, aPose: Pose = { armL: -38, armR: write(0.5), blink: blinkAt(f, [100, 200, 300, 470, 520, 640]), breathe: Math.sin(f / 15) };
  if (f < T.MED) {
    aX = lerp(260, 760, prog(f, T.WIDE, T.WIDE + 66));
    const walking = 1 - prog(f, T.WIDE + 60, T.WIDE + 70);
    aPose = { ...aPose, walk: walking, phase: f * 0.32, nod: 0.5 * walking, look: f > T.tagA - 4 ? 0 : 0.2, mouth: f > T.tagA ? "grin" : "smile", armR: f > T.tagA ? -38 : write(0.4) };
  } else if (f < T.CU1) {
    aPose = { ...aPose, armR: write(0.9), look: Math.sin(f * 0.18) * 0.7, brow: -0.6, eyes: "squint", nod: 0.3 };
  } else if (f < T.QUOTE) {
    const t = env("a1", f, T.a1);
    aPose = { ...aPose, talk: t, brow: -1, eyes: f < T.a1 + 30 ? "squint" : "wide", look: 0.2, head: Math.sin(f * 0.3) * 3, armR: -38 };
  } else if (f < T.TWO) {
    // zips back and forth, writing
    const ph = (f - T.QUOTE) / 26;
    aX = 960 + Math.sin(ph * Math.PI) * 520;
    aPose = { ...aPose, walk: 1, phase: f * 0.75, armR: write(1.2), eyes: "squint", brow: -0.6, look: Math.cos(ph * Math.PI) > 0 ? 0.6 : -0.6 };
  } else if (f < T.CU2) {
    aPose = { ...aPose, armR: f > T.s1 - 6 ? -38 : write(0.9), look: f > T.tagS ? 0.65 : 0, eyes: f > T.s1 + 40 ? "wide" : "normal", brow: f > T.s1 ? 0.6 : 0, mouth: "flat" };
  } else if (f < T.END) {
    aPose = { ...aPose, talk: env("a2", f, T.a2), mouth: "grin", eyes: "happy", armR: -60 + Math.sin(f * 0.5) * 6, head: Math.sin(f * 0.25) * 4 };
  } else {
    aPose = { ...aPose, armR: write(1.3), eyes: "squint", brow: -0.6, look: -0.2 };
  }

  // ---------- Smith ----------
  const sX = f < T.TWO ? 2400 : lerp(2100, 1260, prog(f, T.TWO, T.TWO + 40));
  const sWalk = f >= T.TWO && f < T.TWO + 44 ? 1 - prog(f, T.TWO + 36, T.TWO + 44) : 0;
  const sPose: Pose = {
    walk: sWalk, phase: f * 0.3, look: -0.65, blink: blinkAt(f, [490, 600, 660]), breathe: Math.sin(f / 18 + 1),
    talk: env("s1", f, T.s1), brow: f > T.s1 && f < T.s1 + 75 ? 0.8 : f >= T.END ? -0.4 : 0, mouth: f >= T.END ? "flat" : "smile",
    armL: f > T.s1 && f < T.s1 + 70 ? 60 + Math.sin(f * 0.35) * 10 : 0,
  };
  const hPose: Pose = { armL: 50 + Math.sin(f * 0.22) * 16, armR: 103, bow: Math.sin(f * 0.22), head: -8 + Math.sin(f * 0.11) * 4, sway: Math.sin(f * 0.11) * 3, look: -0.15, blink: (f % 96) > 60 && (f % 96) < 84 ? 0.9 : 0, breathe: Math.sin(f / 16) };

  // ---------- cameras ----------
  let cam: Cam = { camX: 0, zoom: 1, focusY: 540 };
  if (f >= T.WIDE && f < T.MED) cam = { camX: lerp(-40, 40, prog(f, T.WIDE, T.MED)), zoom: 1 + 0.04 * prog(f, T.WIDE, T.MED), focusY: 560 };
  else if (f >= T.MED && f < T.CU1) cam = { camX: -200, zoom: lerp(1.55, 1.62, prog(f, T.MED, T.CU1)), focusY: 690 };
  else if (f >= T.CU1 && f < T.QUOTE) cam = { camX: -200 + Math.sin(f * 0.9) * (f > T.a1 + 52 && f < T.a1 + 60 ? 6 : 0), zoom: lerp(2.6, 2.72, prog(f, T.CU1, T.QUOTE)), focusY: 610 };
  else if (f >= T.QUOTE && f < T.TWO) cam = { camX: 0, zoom: 1.04, focusY: 540 };
  else if (f >= T.TWO && f < T.CU2) cam = { camX: 50, zoom: lerp(1.12, 1.18, prog(f, T.TWO, T.CU2)), focusY: 620 };
  else if (f >= T.END) cam = { camX: 50, zoom: lerp(1.18, 1.26, prog(f, T.END, T.OUT)), focusY: 620 };

  const [ahx, ahy] = toScreen(cam, aX, GROUND - SIZE * 1.06 * HEAD);
  const [shx, shy] = toScreen(cam, sX, GROUND - SIZE * 1.04 * HEAD);

  const stage = (
    <g>
      {f < T.QUOTE || f >= T.TWO ? <Chibi spec={HARTLEY} pose={hPose} x={1720} y={GROUND - 30} size={430} facing={-1} /> : null}
      <Chibi spec={ANDREWS_NB} pose={aPose} x={aX} y={GROUND} size={SIZE} facing={f >= T.QUOTE && f < T.TWO && Math.cos(((f - T.QUOTE) / 26) * Math.PI) < 0 ? -1 : 1} />
      {f >= T.TWO && <Chibi spec={SMITH} pose={sPose} x={sX} y={GROUND - 4} size={SIZE} facing={1} />}
    </g>
  );

  const cold = f < T.WIDE, cu2 = f >= T.CU2 && f < T.END;
  return (
    <AbsoluteFill style={{ background: "#0b1430" }}>
      {cold || cu2 ? (
        <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
          <Sunburst f={f} c1={cu2 ? "#ffd84a" : "#8fd3f0"} c2={cu2 ? "#ffc21f" : "#6fc0e6"} />
          {cold && <SpeedLines f={f} opacity={0.5} />}
          <Chibi spec={ANDREWS_NB} pose={cold
            ? { armL: -38, armR: write(1.4), eyes: "squint", brow: -0.8, head: Math.sin(f * 0.8) * 2, blink: 0, breathe: 0 }
            : { ...aPose }} x={960} y={cold ? 1290 : 1580} size={cold ? 1000 * (0.7 + 0.3 * prog(f, 6, 14)) : 1320} />
          <Sparkles f={f} x={960} y={cu2 ? 420 : 520} spread={cu2 ? 560 : 430} n={cu2 ? 14 : 9} seed={cu2 ? 3 : 1} />
          {cold && <SmokePuff t={f - 2} x={960} y={620} size={2.2} />}
        </svg>
      ) : (
        <Deck f={f} camX={cam.camX} zoom={cam.zoom} focusY={cam.focusY} stage={stage} dim={f >= T.QUOTE && f < T.TWO ? 0.42 * prog(f, T.QUOTE, T.QUOTE + 8) : 0}
          overlay={<g>
            {f >= T.QUOTE && f < T.TWO && <SpeedLines f={f} y0={700} y1={1040} dir={Math.cos(((f - T.QUOTE) / 26) * Math.PI) > 0 ? -1 : 1} opacity={0.55} />}
            {f >= T.CU1 && f < T.QUOTE && <ShockLines t={f - (T.a1 + 30)} x={1560} y={560} s={2.2} />}
            {f >= T.END && <SweatDrop t={f - T.sweat} x={shx + 150} y={shy + 110} s={1.4} />}
          </g>} />
      )}
      {/* speech bubbles: character lines (their own voices) */}
      <SpeechBubble f={f} a={T.a1 - 2} b={T.QUOTE - 1} x={1420} y={330} tx={1180} ty={430} text="Hmm. This writing room is far too big!" width={560} />
      <SpeechBubble f={f} a={T.s1 - 2} b={T.CU2 - 1} x={Math.min(shx + 330, 1560)} y={shy - 40} tx={shx + 120} ty={shy + 70} text="Mister Andrews, do you ever rest?" width={500} />
      <SpeechBubble f={f} a={T.a2 - 2} b={T.END - 1} x={1450} y={300} tx={1180} ty={420} text="Not yet, Captain!" width={420} color="#fff7d6" />
      {/* name tags on first appearance */}
      <NameTag f={f} a={T.tagA} x={ahx} y={ahy - 14} name="Thomas Andrews" role="Titanic's designer" color="#3f7fbf" />
      <NameTag f={f} a={T.tagS} dur={52} x={Math.min(shx, 1640)} y={shy - 14} name="Edward J. Smith" role="Captain of the Titanic" color="#c0473f" />
      <QuoteCard f={f} a={T.card} b={T.TWO} quote="He was working all the time, sir." source="Henry Etches, Andrews' steward · US Senate inquiry, 1912" />
      <Captions f={f} list={caps} />
      <Watermark />
      {!noAudio && <Audio src={staticFile("test2_mix.wav")} />}
    </AbsoluteFill>
  );
};
