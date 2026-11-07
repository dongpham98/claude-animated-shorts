// Light presets for the Titanic video. "night" = the open North Atlantic, no moon, starlight key (cool, low);
// "deck" = the boat deck under electric lamps (warm key from the deckhouse, deep blue shade);
// "lamp" = gas-lit interiors (London office, inquiry hall, Belfast drawing office); "dawn" = Carpathia (Ch9).
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { NIGHT, NIGHT_LOOK } from "../molasses/lights2";

export type TL = "night" | "deck" | "lamp" | "dawn" | "day";
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
export const LIGHTS_T: Record<TL, LightPreset> = { night: NIGHT_T, deck: DECK, lamp: LAMP, dawn: LIGHTS.golden, day: LIGHTS.day };
const NIGHT_SEA: WorldLook = {
  ...NIGHT_LOOK,
  sky: { c: ["#26386a", "#1c2c5a", "#14224a", "#0d1838", "#070f26"], e: [0, 3, 8, 16, 40] },
  water: { near: "#0a1530", mid: "#0a1430", far: "#172650", crest: "#1d3264", trough: "#070e22", glint: "#56709e", shade: [0.45, 0.5, 0.75] },
};
export const LOOK_T: Record<TL, WorldLook> = { night: NIGHT_SEA, deck: NIGHT_SEA, lamp: NIGHT_SEA, dawn: LOOK.golden, day: LOOK.day };
/** which colour grade each light uses (grade.ts only has day / golden) */
export const GRADE_OF: Record<TL, "day" | "golden"> = { night: "day", deck: "day", lamp: "golden", dawn: "golden", day: "day" };
