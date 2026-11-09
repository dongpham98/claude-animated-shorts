// "Titanic's Lifeboats: 7 Myths" — pilot composition (cold open + chapter 1). Same 3D post chain as the molasses
// short (ink -> lens -> bloom -> tone map -> grade) for the 3D shots; 2D board shots on a plain canvas.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, continueRender, delayRender, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World, loadKit } from "./world";
import { InkPass, noInkFallback } from "../bridge/ink";
import { LensBlur } from "../bridge/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../bridge/grade";
import { Kit } from "../bridge/build";
import { PILOT_END, SHOTS, shotAt, dofAt, flashAt, TOTAL, PILOT_NEW, warpOld, A } from "./story";
import { LE } from "./timing";
import { GRADE_OF } from "./lights";
import { CAPTIONS } from "./captions";
import { Board } from "./Board";
import { VERT } from "./vert";

export const TITANIC_PILOT_FRAMES = PILOT_END;
export const TITANIC_FRAMES = TOTAL;
type PostToggles = { ink: boolean; lens: boolean; bloom: boolean; grade: boolean };
const toggles = (): PostToggles => ({ ink: true, lens: true, bloom: true, grade: true, ...((getInputProps() as { post?: Partial<PostToggles> }).post ?? {}) });
const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.6, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1080 * w) / Math.max(h, 1)), 1080);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();
const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [h] = useState(() => delayRender("titanic kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(h); }); }, [h]);
  return kit;
};

const Inner: React.FC<{ id: number; kit: Kit; f: number }> = ({ id, kit, f }) => {
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(kit), [kit]);
  const on = useMemo(toggles, []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera), lens: new LensBlur({ maxCoC: 18, nearScale: 1.2 }), bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const post = useMemo(() => (
    <EffectComposer multisampling={4}>
      {on.ink ? <primitive object={fx.ink} dispose={null} /> : null}
      {on.lens ? <primitive object={fx.lens.pre} dispose={null} /> : null}
      {on.lens ? <primitive object={fx.lens.main} dispose={null} /> : null}
      {on.bloom ? <primitive object={fx.bloom} dispose={null} /> : null}
      <primitive object={fx.tone} dispose={null} />
      {on.grade ? <primitive object={fx.grade} dispose={null} /> : null}
    </EffectComposer>
  ), [fx, on]);
  const cam = camera as THREE.PerspectiveCamera;
  const target = world.update(id, f, cam, scene);
  noInkFallback(world.root);
  const d = dofAt(id);
  cam.getWorldDirection(fwd); fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd)); fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, GRADE_OF[SHOTS[id - 1].light]);
  return (<><primitive object={world.root} dispose={null} />{post}</>);
};
const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
const ShotView: React.FC<{ id: number; kit: Kit; f: number }> = ({ id, kit, f }) => (
  <AbsoluteFill>
    <ThreeCanvas width={VERT.on ? 1080 : 1920} height={VERT.on ? 1920 : 1080} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 38, near: 0.2, far: 3000 }}>
      <Inner id={id} kit={kit} f={f} />
    </ThreeCanvas>
  </AbsoluteFill>
);

// ---------------- fonts, captions, on-screen cards ----------------
let fontP: Promise<void> | null = null;
const loadFont = () => {
  if (!fontP) fontP = new FontFace("CapBlack", `url(${staticFile("fonts/montserrat-latin-900-normal.woff2")})`).load()
    .then((ff) => { (document.fonts as unknown as { add: (f: FontFace) => void }).add(ff); }).catch(() => undefined);
  return fontP;
};
const useFont = () => {
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender("font"));
  useEffect(() => { Promise.all([loadFont(), loadWm()]).then(() => { setOk(true); continueRender(h); }); }, [h]);
  return ok;
};
const Caption: React.FC<{ f: number }> = ({ f }) => {
  const cap = CAPTIONS.find(([, a, b]) => f >= a && f < b);
  if (!cap) return null;
  const [text, a] = cap, k = f - a, pop = k === 0 ? 1.14 : k === 1 ? 1.06 : 1.0, size = text.length > 9 ? 84 : 96;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 838, width: "100%", textAlign: "center", transform: `scale(${pop})`, transformOrigin: "50% 50%",
        fontFamily: "CapBlack, sans-serif", fontWeight: 900, fontSize: size, lineHeight: 1, color: "#ffffff", letterSpacing: 1,
        WebkitTextStroke: "12px #000000", paintOrder: "stroke fill", textShadow: "0 5px 0 rgba(0,0,0,0.55)" }}>{text}</div>
    </AbsoluteFill>
  );
};
const captionsOn = () => (getInputProps() as { captions?: boolean }).captions !== false;
/** on-screen cards on top of 3D shots: [first frame, last frame, kind, text, sub] */
type Tag = [number, number, "date" | "count" | "name" | "place" | "myth", string, string?];
const TAGS: Tag[] = [
  [0, 44, "myth", "40 SEATS. 12 PEOPLE.", "Why was the boat half empty?"],
  [47, 114, "date", "APRIL 15, 1912 · 1:10 A.M.", "North Atlantic"],
  [240, 326, "count", "40", "SEATS"], [273, 326, "count", "12", "PEOPLE"],
  [451, 545, "name", "CLIPBOARD", "your myth checker"],
  [1058, 1134, "myth", "MYTH #1", "Titanic broke the law"],
  [1480, 1570, "place", "LONDON, 1894", "Board of Trade"],
  [2223, 2437, "count", "20", "BOATS"], [2249, 2437, "count", "14", "LIFEBOATS"], [2306, 2437, "count", "2", "CUTTERS"], [2368, 2437, "count", "4", "COLLAPSIBLES"],
  [2824, 2905, "place", "LONDON, 1912", "the British inquiry"],
  [3307, 3385, "place", "BELFAST", "Harland & Wolff"],
];
/** chapters 2-10 tags (v2 frames): names on first appearance, places/times on jumps, counters on numbers */
const T = (a: number, len: number, kind: Tag[2], s: string, sub?: string): Tag => [a, a + len, kind, s, sub];
const TAGS2: Tag[] = [
  T(A(49) + 8, 100, "name", "ALEXANDER CARLISLE", "Harland & Wolff, Belfast"),
  T(A(58) + 8, 90, "place", "BRITISH INQUIRY, 1912"), T(A(59, 3), 60, "count", "48", "BOATS, HE SAID"),
  T(A(80) + 8, 110, "place", "SOUTHAMPTON, 10 APRIL 1912", "Board of Trade inspection"), T(A(81, 3), 80, "count", "2", "BOATS LOWERED"),
  T(A(94) + 6, 100, "place", "BOAT DECK, 12:40 A.M.", "15 April 1912"),
  T(A(102) + 6, 90, "name", "LIFEBOAT 7", "first boat lowered"), T(A(103, 3), A(105) - A(103, 3), "count", "65", "SEATS"), T(A(104, 4), A(105) - A(104, 4), "count", "28", "ABOARD"),
  T(A(109), 80, "name", "FIRST OFFICER MURDOCH", "starboard side"),
  T(A(120) + 6, 80, "name", "CAPTAIN EDWARD SMITH"), T(A(122), 80, "name", "MURDOCH & LIGHTOLLER", "starboard & port"),
  T(A(124) + 4, 80, "place", "STARBOARD", "First Officer Murdoch"), T(A(126) + 4, 80, "place", "PORT", "Second Officer Lightoller"),
  T(A(147) + 6, 90, "place", "BRITISH INQUIRY, 1912"),
  T(A(162) + 6, 90, "place", "LIFEBOAT 1, 1:10 A.M."), T(A(164), 60, "count", "40", "SEATS"), T(A(164, 2), 60, "count", "12", "PEOPLE"),
  T(A(166, 5), 90, "name", "SIR COSMO & LADY DUFF-GORDON"), T(A(167) + 4, 80, "place", "AFTER 2:20 A.M.", "Titanic has sunk"),
  T(A(173) + 6, 90, "place", "BRITISH INQUIRY, 1912"),
  T(A(192), 110, "name", "FIFTH OFFICER HAROLD LOWE", "Lifeboat 14"), T(A(193), 80, "place", "2:20 A.M.", "Titanic sinks"), T(A(199, 2), 70, "count", "4", "FOUND ALIVE"),
  T(A(202) + 6, 100, "place", "FIRST LIGHT", "Collapsible A"), T(A(206) + 4, 100, "place", "COLLAPSIBLE B", "upside down"),
  T(A(211, 3) + 6, 110, "name", "HAROLD COTTAM", "Carpathia's wireless operator"), T(A(213), 90, "name", "CAPTAIN ARTHUR ROSTRON", "RMS Carpathia"),
  T(A(217) + 6, 90, "place", "JUST AFTER 4:00 A.M."), T(A(223) + 6, 100, "place", "LONDON, 1913-14", "Safety of Life at Sea"), T(A(235) + 6, 80, "place", "LONDON, 1894"),
];
void LE;
const Tags: React.FC<{ f: number; pilot: boolean }> = ({ f, pilot }) => {
  const live = (pilot ? TAGS : TAGS2).filter(([a, b]) => f >= a && f <= b);
  const counts = live.filter((t) => t[2] === "count");
  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontFamily: "CapBlack, sans-serif", fontWeight: 900 }}>
      {live.filter((t) => t[2] !== "count").map(([a, , kind, s, sub], i) => {
        const k = a === 0 ? 1 : Math.min(1, (f - a) / 6), typed = kind === "date" ? s.slice(0, Math.ceil(s.length * Math.min(1, (f - a) / 30))) : s;
        const pos = { left: 80, top: 70, transform: `translateX(${(1 - k) * -40}px) scale(${kind === "myth" ? 0.85 + 0.15 * k : 1})` };
        return (
          <div key={i} style={{ position: "absolute", ...pos, opacity: k, background: kind === "myth" ? "#f4ecd6" : "rgba(244,236,214,0.94)", border: "8px solid #241726", borderRadius: 10, padding: "14px 30px",
            boxShadow: "8px 10px 0 rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: kind === "myth" ? 46 : 54, color: kind === "myth" ? "#c0353a" : "#241726", letterSpacing: 1 }}>{typed}</div>
            {sub ? <div style={{ fontSize: 30, color: "#5a4a3a", fontWeight: 800 }}>{sub}</div> : null}
          </div>);
      })}
      {counts.map(([a, , , s, sub], i) => {
        const k = Math.min(1, (f - a) / 5), pop = k < 1 ? 0.6 + 0.6 * k : 1;
        return (
          <div key={"c" + i} style={{ position: "absolute", left: 80 + i * 300, top: 70, transform: `scale(${pop})`, transformOrigin: "0 0", background: "rgba(244,236,214,0.94)",
            border: "8px solid #241726", borderRadius: 10, padding: "8px 26px", textAlign: "center", boxShadow: "8px 10px 0 rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 96, lineHeight: 1, color: i === 0 && s === "20" ? "#241726" : "#c0353a" }}>{s}</div>
            <div style={{ fontSize: 30, color: "#241726" }}>{sub}</div>
          </div>);
      })}
    </AbsoluteFill>
  );
};

/** channel handle on every frame (channel-plan.md spec, long videos): bottom right ~40 px from the edges, Montserrat Bold
 *  ~32 px, white ~65 %, soft dark shadow, no box; above the picture and tags, below the captions */
export const HANDLE = "@LeoKnowledgeSharing";
let wmP: Promise<void> | null = null;
const loadWm = () => (wmP ??= new FontFace("WmBold", `url(${staticFile("fonts/montserrat-latin-700-normal.woff2")})`, { weight: "700" }).load()
  .then((ff) => { (document.fonts as unknown as { add: (f: FontFace) => void }).add(ff); }).catch(() => undefined));
const Watermark: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", right: 40, bottom: 34, fontFamily: "WmBold, Montserrat, sans-serif", fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.68)",
      letterSpacing: 0.3, WebkitTextStroke: "1.5px rgba(10,8,20,0.55)", paintOrder: "stroke fill",
      textShadow: "0 2px 4px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.9)" }}>{HANDLE}</div>
  </AbsoluteFill>
);
const watermarkOn = () => (getInputProps() as { watermark?: boolean }).watermark !== false;

/** the whole video (pilot + chapters 2-10 + end screen) */
export const TitanicFull: React.FC = () => <TitanicPilot />;
export const TitanicPilot: React.FC = () => {
  const f = useCurrentFrame();
  const kit = useKit();
  const fontOk = useFont();
  if (!kit || !fontOk) return null;
  // the pilot's logic runs on v1 frames (warped), chapters 2-10 on the v2 voice frames
  const pilot = f < PILOT_NEW, lf = pilot ? warpOld(f) : f;
  const s = shotAt(lf, pilot), flash = flashAt(lf), noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  return (
    <AbsoluteFill style={{ background: "#0b1430" }}>
      {s.kind === "board" ? <Board id={s.board!} f={lf} shot={s.id} /> : <ShotView key={s.id} id={s.id} kit={kit} f={lf} />}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      <Tags f={lf} pilot={pilot} />
      {watermarkOn() && <Watermark />}
      {captionsOn() && <Caption f={f} />}
      {noAudio ? null : <Audio src={staticFile("titanic_full_mix.m4a")} />}
    </AbsoluteFill>
  );
};

// ---------------- vertical Shorts (1080x1920) cut from the long video ----------------
export type ShortProps = { from: number; to: number; audio: string; hook: [string, string]; };
export const SHORTS: Record<string, ShortProps> = {
  TitanicShortRules: { from: 8742, to: 10520, audio: "titanic_short_rules.m4a", hook: ["SAME SHIP. SAME ORDER.", "OPPOSITE RULES."] },
  TitanicShortOneBack: { from: 14702, to: 16348, audio: "titanic_short_oneback.m4a", hook: ["18 BOATS LOWERED.", "ONLY ONE WENT BACK."] },
  TitanicShortLaw: { from: 1049, to: 3328, audio: "titanic_short_law.m4a", hook: ["TITANIC FOLLOWED THE LAW.", "THAT WAS THE PROBLEM."] },
};
const VCaption: React.FC<{ f: number }> = ({ f }) => {
  const cap = CAPTIONS.find(([, a, b]) => f >= a && f < b);
  if (!cap) return null;
  const [text, a] = cap, k = f - a, pop = k === 0 ? 1.14 : k === 1 ? 1.06 : 1.0, size = text.length > 9 ? 100 : 114;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 1300 - size / 2, width: "100%", textAlign: "center", transform: `scale(${pop})`, transformOrigin: "50% 50%",
        fontFamily: "CapBlack, sans-serif", fontWeight: 900, fontSize: size, lineHeight: 1, color: "#ffffff", letterSpacing: 1,
        WebkitTextStroke: "14px #000000", paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(0,0,0,0.55)" }}>{text}</div>
    </AbsoluteFill>
  );
};
const VWatermark: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", top: 230 - 20, width: "100%", textAlign: "center", fontFamily: "WmBold, Montserrat, sans-serif", fontWeight: 700, fontSize: 40,
      color: "rgba(255,255,255,0.68)", letterSpacing: 0.3, WebkitTextStroke: "1.5px rgba(10,8,20,0.55)", paintOrder: "stroke fill",
      textShadow: "0 2px 4px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.9)" }}>{HANDLE}</div>
  </AbsoluteFill>
);
/** big two-line card: hook at the start, link to the full video at the end */
const VCard: React.FC<{ k: number; l1: string; l2: string; top: number; small?: boolean }> = ({ k, l1, l2, top, small }) => (
  <div style={{ position: "absolute", top, left: 0, width: "100%", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
    <div style={{ transform: `scale(${k < 1 ? 0.6 + 0.4 * k + 0.08 * Math.sin(k * Math.PI) : 1})`, opacity: Math.min(1, k * 1.5), background: "#f4ecd6", border: "9px solid #241726",
      borderRadius: 14, padding: small ? "16px 34px" : "22px 40px", boxShadow: "10px 12px 0 rgba(0,0,0,0.4)", textAlign: "center", fontFamily: "CapBlack, sans-serif", fontWeight: 900, maxWidth: 960 }}>
      <div style={{ fontSize: small ? 40 : 62, lineHeight: 1.08, color: "#241726" }}>{l1}</div>
      <div style={{ fontSize: small ? 46 : 70, lineHeight: 1.08, color: "#c0353a", marginTop: 6 }}>{l2}</div>
    </div>
  </div>
);
export const TitanicShort: React.FC<ShortProps> = ({ from, to, audio, hook }) => {
  VERT.on = true;
  const f0 = useCurrentFrame(), f = f0 + from, n = to - from;
  const kit = useKit();
  const fontOk = useFont();
  if (!kit || !fontOk) return null;
  const pilot = f < PILOT_NEW, lf = pilot ? warpOld(f) : f;
  const s = shotAt(lf, pilot), flash = flashAt(lf), noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  const hookK = f0 < 84 ? Math.min(1, f0 / 6) * Math.min(1, (84 - f0) / 6) : 0, endK = f0 >= n - 60 ? Math.min(1, (f0 - (n - 60)) / 6) : 0;
  return (
    <AbsoluteFill style={{ background: "#0b1430" }}>
      {s.kind === "board" ? <Board id={s.board!} f={lf} shot={s.id} /> : <ShotView key={s.id} id={s.id} kit={kit} f={lf} />}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      {hookK === 0 && <AbsoluteFill style={{ transform: "scale(0.8)", transformOrigin: "0 0", top: 290, left: 0 }}><Tags f={lf} pilot={pilot} /></AbsoluteFill>}
      {hookK > 0 && <VCard k={hookK} l1={hook[0]} l2={hook[1]} top={330} />}
      {endK > 0 && <VCard k={endK} l1="FULL STORY: 7 TITANIC" l2="LIFEBOAT MYTHS ▶" top={330} small />}
      <VWatermark />
      {captionsOn() && <VCaption f={f} />}
      {noAudio ? null : <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
