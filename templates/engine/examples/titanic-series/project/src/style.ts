// Titanic series: one shared style for characters and scenes (see STYLE.md)
export const INK = "#2a1b16";          // outline colour (dark warm brown, never pure black)
export const LINE = 3.2;               // outline width in puppet units (puppet = 200 units tall)
export const BG_LINE = 3.5;            // outline width for scenery at 1920x1080
export const SHADE = "rgba(70,30,60,0.22)"; // the one soft shading layer (warm plum, multiply look)

export const PAL = {
  skinLight: "#f8d9bf", skinMid: "#efc19c", skinTan: "#d9a074",
  blush: "#f39a8f",
  navy: "#22304f", navyDark: "#18223a", gold: "#e3b14a",
  white: "#f6f1e7", cream: "#efe6d2",
  suit: "#3a3b46", suitDark: "#2b2c35", shirt: "#fbf8f2", tie: "#6b2f3a",
  bandGreen: "#3f7a5a", bandJacket: "#1f2a44",
  dressPlum: "#7b4a8c", dressLight: "#b98ac6", lace: "#f7efe9",
  hairWhite: "#eeeae4", hairDark: "#4a3326", hairBrown: "#6e4a31", hairAuburn: "#a4532f",
  shoe: "#2d2422",
  funnelBuff: "#d89b45", funnelBuffDark: "#b77d33", funnelBlack: "#262225",
  deckWood: "#c99a66", deckWoodDark: "#a97b4c", deckLine: "#8e6440",
  wall: "#f3ede2", wallShade: "#ddd2c0", glass: "#355275", glassLight: "#f6c97a",
  skyTop: "#5b78b4", skyMid: "#e9a27d", skyLow: "#f7cf8f", sun: "#fff1c4",
  boatHull: "#f5f0e6", boatTrim: "#8a5a36", canvas: "#d9ccb2",
};

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (x: number) => { const t = clamp(x); return t * t * t * (t * (t * 6 - 15) + 10); };
/** 0..1 progress of frame f between a and b, smootherstep */
export const prog = (f: number, a: number, b: number) => smooth((f - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
