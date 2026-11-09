// Light presets for the Titanic video. "night" = the open North Atlantic, no moon, starlight key (cool, low);
// "deck" = the boat deck under electric lamps (warm key from the deckhouse, deep blue shade);
// "lamp" = gas-lit interiors (London office, inquiry hall, Belfast drawing office); "dawn" = Carpathia (Ch9).
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { NIGHT, NIGHT_LOOK } from "../molasses/lights2";

export type TL = "night" | "deck" | "lamp" | "dawn" | "day" | "firstlight";
const NIGHT_T: LightPreset = { ...NIGHT, el: 26, lit: [0.55, 0.66, 1.05], fogNear: 500, fogFar: 3200, fog: "#1c2a55" };
const DECK: LightPreset = {
  ...NIGHT, az: 150, el: 30,
  lit: [1.1, 0.88, 0.6], shade: [0.1, 0.12, 0.26], lift: [0.03, 0.04, 0.12],
  charTint: [1.0, 0.86, 0.66], charShade: 0.82, charGrad: 0.1, bodyGrad: 0.24, sideTint: [0.72, 0.76, 1.0],
  sunCol: "#ffd9a0", fogNear: 500, fogFar: 3200, fog: "#1c2a55",
};
const LAMP: LightPreset = {
  ...LIGHTS.golden, az: 140, el: 34,
  lit: [1.45, 1.05, 0.62], shade: [0.2, 0.17, 0.26], lift: [0.05, 0.05, 0.09], term: 0.15,
  charTint: [1.0, 0.86, 0.68], charShade: 0.86, charGrad: 0.09, bodyGrad: 0.22, actorShadow: false,
  fog: "#3a2c2a", fogNear: 40, fogFar: 200,
};
const FIRST: LightPreset = { ...NIGHT_T, el: 12, lit: [0.85, 0.82, 1.05], shade: [0.2, 0.2, 0.36], lift: [0.05, 0.05, 0.12], charTint: [0.92, 0.88, 1.0], sunCol: "#d8c8e8", fog: "#6a6a96", fogNear: 300, fogFar: 2600 };
const DAWN: LightPreset = { ...LIGHTS.golden, fogNear: 300, fogFar: 2600 };
const DAY: LightPreset = { ...LIGHTS.day, fogNear: 400, fogFar: 3000 };
export const LIGHTS_T: Record<TL, LightPreset> = { night: NIGHT_T, deck: DECK, lamp: LAMP, dawn: DAWN, day: DAY, firstlight: FIRST };
const NIGHT_SEA: WorldLook = {
  ...NIGHT_LOOK,
  sky: { c: ["#26386a", "#1c2c5a", "#14224a", "#0d1838", "#070f26"], e: [0, 3, 8, 16, 40] },
  water: { near: "#0a1530", mid: "#0a1430", far: "#172650", crest: "#1d3264", trough: "#070e22", glint: "#56709e", shade: [0.45, 0.5, 0.75] },
};
const FIRST_LOOK: WorldLook = {
  ...NIGHT_SEA,
  sky: { c: ["#d9a7a8", "#a88aa8", "#6f6f9e", "#3e4a82", "#1d2a5e"], e: [0, 3, 8, 16, 40] },
  water: { near: "#2a3560", mid: "#2f3a68", far: "#8a7a9a", crest: "#4a5a8a", trough: "#1a2244", glint: "#e8c8d0", shade: [0.5, 0.52, 0.72] },
};
const DAY_SEA: WorldLook = { ...LOOK.day, water: { near: "#1d4f80", mid: "#1a4a7a", far: "#2a5c8e", crest: "#4f86b8", trough: "#123a66", glint: "#d8ecff", shade: [0.5, 0.56, 0.72] } };
export const LOOK_T: Record<TL, WorldLook> = { night: NIGHT_SEA, deck: NIGHT_SEA, lamp: NIGHT_SEA, dawn: LOOK.golden, day: DAY_SEA, firstlight: FIRST_LOOK };
/** which colour grade each light uses (grade.ts only has day / golden) */
export const GRADE_OF: Record<TL, "day" | "golden"> = { night: "day", deck: "day", lamp: "golden", dawn: "golden", day: "day", firstlight: "day" };
