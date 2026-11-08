// 12-second movement test on the boat deck: Andrews walks in with the plans and talks, Captain Smith nods and laughs,
// Hartley plays the violin, Molly Brown walks in and waves. Camera glides right and pushes in.
import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, delayRender, continueRender } from "remotion";
import { Chibi, Pose } from "./chibi";
import { SMITH, ANDREWS, HARTLEY, BROWN } from "./cast";
import { Deck } from "./deck";
import { prog, lerp, clamp, INK } from "./style";

export const HANDLE = "@LeoKnowledgeSharing";
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

export const Watermark: React.FC = () => (
  <div style={{ position: "absolute", right: 40, bottom: 34, fontFamily: "WmBold, Montserrat, sans-serif", fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.68)",
    letterSpacing: 0.3, WebkitTextStroke: "1.5px rgba(10,8,20,0.55)", paintOrder: "stroke fill",
    textShadow: "0 2px 4px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.9)" }}>{HANDLE}</div>
);

/** natural blinks: list of start frames, 5-frame close/open */
const blinkAt = (f: number, starts: number[]) => {
  for (const s of starts) { const d = f - s; if (d >= 0 && d < 6) return [0.5, 1, 1, 0.6, 0.2, 0][d]; }
  return 0;
};
/** talking mouth: syllable-like pattern with small pauses */
const talkAt = (f: number, a: number, b: number, seed = 0) => {
  if (f < a || f > b) return 0;
  const v = Math.abs(Math.sin(f * 0.75 + seed)) * (0.55 + 0.45 * Math.sin(f * 0.21 + seed * 2));
  const pause = Math.sin(f * 0.09 + seed) > 0.82 ? 0 : 1;
  return clamp(v) * pause * prog(f, a, a + 4) * (1 - prog(f, b - 4, b));
};

const Notes: React.FC<{ f: number; x: number; y: number }> = ({ f, x, y }) => {
  const out: React.ReactNode[] = [];
  for (let k = 0; k < 4; k++) {
    const age = (f + k * 22) % 88, t = age / 88;
    const nx = x + age * 0.9 + Math.sin((age + k * 30) / 8) * 10, ny = y - age * 1.6;
    out.push(
      <g key={k} transform={`translate(${nx} ${ny}) rotate(${Math.sin(age / 10) * 12}) scale(${0.8 + t * 0.4})`} opacity={Math.sin(t * Math.PI)}>
        <ellipse cx={0} cy={0} rx={9} ry={7} fill="#fff4dc" stroke={INK} strokeWidth={3} transform="rotate(-20)" />
        <path d="M 8 -3 L 8 -34 Q 18 -30 22 -22" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <path d="M 8 -3 L 8 -34" fill="none" stroke="#fff4dc" strokeWidth={1.6} />
      </g>,
    );
  }
  return <g>{out}</g>;
};

export const DURATION = 360;
export const StyleTest: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFonts();
  if (!ok) return null;
  const camX = lerp(0, 300, prog(f, 0, DURATION));
  const zoom = 1 + 0.06 * prog(f, 200, DURATION);
  const SIZE = 520, GROUND = 1030;

  // Andrews: walks in (0-130), stops, raises the plans and explains (140-215), then looks at Molly
  const aWalk = 1 - prog(f, 118, 136);
  const aX = lerp(150, 680, prog(f, 0, 132) * 0.15 + clamp(f / 132) * 0.85);
  const andrews: Pose = {
    walk: aWalk, phase: f * 0.32, armR: lerp(0, 98, prog(f, 136, 152)) * (1 - prog(f, 222, 240)) + Math.sin(f * 0.2) * 6 * prog(f, 152, 160) * (1 - prog(f, 214, 222)),
    look: f < 270 ? 0.55 : lerp(0.55, 0.9, prog(f, 270, 284)), talk: talkAt(f, 142, 214, 1), mouth: f > 236 ? "grin" : "smile",
    blink: blinkAt(f, [60, 128, 230, 300, 340]), brow: prog(f, 140, 150) * (1 - prog(f, 210, 220)), breathe: Math.sin(f / 18),
    head: Math.sin(f * 0.12) * 3 * prog(f, 140, 150) * (1 - prog(f, 214, 222)),
  };
  // Smith: listens, nods twice (172, 196), laughs (224-250), then turns to Molly
  const nod = Math.max(0, Math.sin(((f - 170) / 14) * Math.PI)) * (f > 170 && f < 212 ? 1 : 0);
  const smith: Pose = {
    look: f < 272 ? -0.6 : lerp(-0.6, 0.65, prog(f, 272, 288)), nod, blink: blinkAt(f, [30, 110, 160, 262, 330]),
    talk: talkAt(f, 224, 252, 3), mouth: f > 252 ? "grin" : "smile", head: f > 224 && f < 254 ? Math.sin(f * 0.6) * 3 : 0,
    armR: f > 286 ? lerp(0, 135, prog(f, 286, 300)) * (1 - prog(f, 336, 350)) + Math.sin(f * 0.4) * 10 * prog(f, 298, 304) * (1 - prog(f, 330, 336)) : 0, breathe: Math.sin(f / 22 + 1), brow: f > 222 && f < 256 ? 0.6 : 0,
  };
  // Hartley: plays all the time, bow strokes, swaying with the tune
  const hartley: Pose = {
    armL: 50 + Math.sin(f * 0.22) * 16, armR: 103, bow: Math.sin(f * 0.22), head: -8 + Math.sin(f * 0.11) * 4,
    sway: Math.sin(f * 0.11) * 3, look: -0.15, blink: (f % 96) > 60 && (f % 96) < 84 ? 0.9 : blinkAt(f, [20, 140, 250]), mouth: "smile", breathe: Math.sin(f / 16),
  };
  // Molly Brown: walks in from the right (176-292), waves and greets (290-360)
  const mWalk = prog(f, 170, 180) * (1 - prog(f, 282, 296));
  const mX = lerp(2380, 1930, prog(f, 176, 292) * 0.2 + clamp((f - 176) / 116) * 0.8);
  const brown: Pose = {
    walk: mWalk, phase: f * 0.28, armR: f > 288 ? lerp(0, 150, prog(f, 288, 300)) + Math.sin(f * 0.45) * 14 * prog(f, 298, 304) : 0,
    look: 0.35, talk: talkAt(f, 300, 344, 5), mouth: "grin", blink: blinkAt(f, [210, 270, 320]), breathe: Math.sin(f / 15),
  };
  const stage = (
    <g>
      <Chibi spec={ANDREWS} pose={andrews} x={aX} y={GROUND} size={SIZE} />
      <Chibi spec={SMITH} pose={smith} x={1110} y={GROUND - 6} size={SIZE} />
      <Chibi spec={HARTLEY} pose={hartley} x={1530} y={GROUND - 14} size={SIZE} facing={-1} />
      <Notes f={f} x={1480} y={GROUND - 430} />
      <Chibi spec={BROWN} pose={brown} x={mX} y={GROUND + 4} size={SIZE} facing={-1} />
    </g>
  );
  const tag = prog(f, 8, 22) * (1 - prog(f, 120, 136));
  return (
    <AbsoluteFill style={{ background: "#0b1430" }}>
      <Deck f={f} camX={camX} zoom={zoom} stage={stage} />
      <div style={{ position: "absolute", left: 56, top: 48, opacity: tag, transform: `translateY(${(1 - tag) * -12}px)`,
        fontFamily: "CapBlack, sans-serif", fontWeight: 900, fontSize: 30, letterSpacing: 2, color: "#fff7e8",
        background: "rgba(42,27,22,0.72)", border: "3px solid #2a1b16", borderRadius: 999, padding: "10px 26px" }}>
        THE BOAT DECK · APRIL 1912
      </div>
      <Watermark />
    </AbsoluteFill>
  );
};
