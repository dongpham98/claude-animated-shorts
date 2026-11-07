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
import { PILOT_END, SHOTS, shotAt, dofAt, flashAt } from "./story";
import { GRADE_OF } from "./lights";
import { CAPTIONS } from "./captions";
import { Board } from "./Board";

export const TITANIC_PILOT_FRAMES = PILOT_END;
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

const Inner: React.FC<{ id: number; kit: Kit }> = ({ id, kit }) => {
  const f = useCurrentFrame();
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
  const d = dofAt(f);
  cam.getWorldDirection(fwd); fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd)); fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, GRADE_OF[SHOTS[id - 1].light]);
  return (<><primitive object={world.root} dispose={null} />{post}</>);
};
const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
const ShotView: React.FC<{ id: number; kit: Kit }> = ({ id, kit }) => (
  <AbsoluteFill>
    <ThreeCanvas width={1920} height={1080} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 38, near: 0.2, far: 3000 }}>
      <Inner id={id} kit={kit} />
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
  useEffect(() => { loadFont().then(() => { setOk(true); continueRender(h); }); }, [h]);
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
  [47, 114, "date", "APRIL 15, 1912 · 1:10 A.M.", "North Atlantic"],
  [240, 326, "count", "40", "SEATS"], [273, 326, "count", "12", "PEOPLE"],
  [451, 545, "name", "CLIPBOARD", "your myth checker"],
  [1058, 1134, "myth", "MYTH #1", "Titanic broke the law"],
  [1480, 1570, "place", "LONDON, 1894", "Board of Trade"],
  [2223, 2437, "count", "20", "BOATS"], [2249, 2437, "count", "14", "LIFEBOATS"], [2306, 2437, "count", "2", "CUTTERS"], [2368, 2437, "count", "4", "COLLAPSIBLES"],
  [2824, 2905, "place", "LONDON, 1912", "the British inquiry"],
  [3307, 3385, "place", "BELFAST", "Harland & Wolff"],
];
const Tags: React.FC<{ f: number }> = ({ f }) => {
  const live = TAGS.filter(([a, b]) => f >= a && f <= b);
  const counts = live.filter((t) => t[2] === "count");
  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontFamily: "CapBlack, sans-serif", fontWeight: 900 }}>
      {live.filter((t) => t[2] !== "count").map(([a, , kind, s, sub], i) => {
        const k = Math.min(1, (f - a) / 6), typed = kind === "date" ? s.slice(0, Math.ceil(s.length * Math.min(1, (f - a) / 30))) : s;
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

export const TitanicPilot: React.FC = () => {
  const f = useCurrentFrame();
  const kit = useKit();
  const fontOk = useFont();
  if (!kit || !fontOk) return null;
  const s = shotAt(f), flash = flashAt(f), noAudio = (getInputProps() as { audio?: boolean }).audio === false;
  return (
    <AbsoluteFill style={{ background: "#0b1430" }}>
      {s.kind === "board" ? <Board id={s.board!} f={f} /> : <ShotView key={s.id} id={s.id} kit={kit} />}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      <Tags f={f} />
      {captionsOn() && <Caption f={f} />}
      {noAudio ? null : <Audio src={staticFile("titanic_pilot_mix.wav")} />}
    </AbsoluteFill>
  );
};
