// Light presets for the molasses short: the bridge short's day and golden, plus a cold night-blue evening for the
// "freezing evening air" beat (moonlight key, deep blue shade, dark navy sky, low fog).
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";

export const NIGHT: LightPreset = {
  az: 120, el: 34,
  lit: [0.62, 0.74, 1.12], shade: [0.11, 0.13, 0.27], lift: [0.03, 0.05, 0.13], lambert: 0.35, sideK: 0.84, term: 0.2,
  charTint: [0.66, 0.74, 1.0], charShade: 0.84, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.8, 0.84, 1.0],
  blob: [0.55, 0.58, 0.72], actorShadow: false,
  top: "#0f1d44", hor: "#3a4f86", skyCurve: [0.0, 0.5, 0.6], fog: "#33467a", fogNear: 30, fogFar: 260, sunDisc: "#000000",
  sunCol: "#b8c8ff", sunI: 1.6, sky: "#3a4f86", ground: "#2a2a3a", hemiI: 0.35,
  bias: -0.00025, normalBias: 0.015,
};
export const NIGHT_LOOK: WorldLook = {
  sky: { c: ["#3a4f86", "#2d4178", "#22336a", "#182858", "#0f1d44"], e: [0, 3, 8, 16, 40] },
  water: { near: "#1a2f5a", mid: "#16284e", far: "#24386a", crest: "#5f7ab8", trough: "#0c1832", glint: "#c8d6ff", shade: [0.45, 0.5, 0.75] },
  cloud: { lit: "#8d9cc8", mid: "#6a7aaa", shade: "#4a5888" },
  bounce: [0, 0, 0.02],
  sat: 1.0,
};
export type L3 = "day" | "golden" | "night";
export const LIGHTS3: Record<L3, LightPreset> = { ...LIGHTS, night: NIGHT };
export const LOOK3: Record<L3, WorldLook> = { ...LOOK, night: NIGHT_LOOK };
