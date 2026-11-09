// Timeline of "Titanic's Lifeboats: 7 Myths" — pilot = cold open + chapter 1 (frames 0..3452), timed to
// ~/channel/02-titanic/voice/words.json (Kokoro am_puck 0.9). Camera grammar from the skill: smootherstep glides,
// cuts on beats, a 6-frame white flash on every place/time jump, creeping holds, flip kicks on stamps and slams.
import type { TL } from "./lights";
import { LS, W, LE, VOICE_END } from "./timing";
import { WARP } from "./warp";
export const FPS = 30;
export const PILOT_END = 3453;            // end of the pilot in the OLD (v1 voice) timeline; pilot shots keep v1 frames
/** the pilot's end in the new (v2) timeline; frames before it are warped back to v1 frames for the pilot's logic */
export const PILOT_NEW = Math.round(WARP[WARP.length - 1][1]);
export const warpOld = (f: number) => {
  if (f >= PILOT_NEW) return f;
  for (let i = 1; i < WARP.length; i++) { const [o0, n0] = WARP[i - 1], [o1, n1] = WARP[i]; if (f <= n1) return Math.round(o0 + ((f - n0) * (o1 - o0)) / Math.max(1e-6, n1 - n0)); }
  return f;
};
export const warpNew = (f: number) => {
  for (let i = 1; i < WARP.length; i++) { const [o0, n0] = WARP[i - 1], [o1, n1] = WARP[i]; if (f <= o1) return n0 + ((f - o0) * (n1 - n0)) / Math.max(1e-6, o1 - o0); }
  return f;
};
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const ramp = (f: number, a: number, b: number) => smooth((f - a) / (b - a));
export const at = (o: V3, x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];

// ---------------- place ----------------
// The ship lies along x (bow +x), waterline y = 0, starboard = +z. Real scale (269 m long, 28 m beam).
export const SHIP_L = 269, BEAM = 28, BOAT_DECK = 19.5, SHELTER = 12.6;
/** hull half-width at x (m): parallel midbody, fine entrance at the bow, rounder run aft */
export const halfW = (x: number) => {
  const h = BEAM / 2;
  if (x > 60) return h * Math.sqrt(Math.max(0, 1 - ((x - 60) / (SHIP_L / 2 - 60)) ** 2.2));
  if (x < -80) return h * Math.max(0.12, Math.sqrt(Math.max(0, 1 - ((-80 - x) / (SHIP_L / 2 - 80 + 4)) ** 2.6)));
  return h;
};
export const DECK_HALF = 13.2;                         // boat deck edge (rail) half-width
export const FUNNELS = [52, 15.5, -21, -57.5];         // funnel centres along x
/** lifeboat stations (x) per side: forward group 1-8, aft group 9-16 (odd = starboard) */
export const BOAT_X = [72, 64, 56, 48, -26, -34, -42, -50];
export const BOAT1: V3 = [72, 0, 15.6];                // emergency cutter No. 1, starboard forward, swung out
export const SEA_B1: V3 = [62, 0.0, 30];               // boat 1 in the water, pulling away
/** shot 6: boats rowing away (x, z, yaw, people) */
export const SEA6: [number, number, number, number][] = [[62, 30, 0.5, 12], [30, 52, 0.3, 26], [6, 40, -0.2, 20], [44, 78, 0.1, 30]];
export const OFFICE: V3 = [-2000, 0, 0];               // interiors built far away (London 1894 / inquiry / Belfast)

// ---------------- shots ----------------
export type Set3 = "ship" | "deck" | "sea" | "office" | "carp";
export type Dress = "london" | "inquiry" | "belfast" | "wireless" | "conference";
export type ShotDef = { id: number; a: number; b: number; kind: "3d" | "board"; set?: Set3; dress?: Dress; light: TL; board?: string; scene?: string; ship?: boolean };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 115, kind: "3d", set: "ship", light: "night" },
  { id: 2, a: 115, b: 232, kind: "3d", set: "ship", light: "night" },
  { id: 3, a: 232, b: 327, kind: "3d", set: "sea", light: "night" },
  { id: 4, a: 327, b: 445, kind: "3d", set: "deck", light: "deck" },
  { id: 5, a: 445, b: 579, kind: "3d", set: "deck", light: "deck" },
  { id: 6, a: 579, b: 766, kind: "3d", set: "sea", light: "night" },
  { id: 7, a: 766, b: 1049, kind: "board", light: "night", board: "title" },
  { id: 8, a: 1049, b: 1135, kind: "3d", set: "deck", light: "deck" },
  { id: 9, a: 1135, b: 1307, kind: "board", light: "night", board: "papers" },
  { id: 10, a: 1307, b: 1474, kind: "3d", set: "deck", light: "deck" },
  { id: 11, a: 1474, b: 1742, kind: "3d", set: "office", dress: "london", light: "lamp" },
  { id: 12, a: 1742, b: 1900, kind: "3d", set: "office", dress: "london", light: "lamp" },
  { id: 13, a: 1900, b: 2111, kind: "board", light: "night", board: "size" },
  { id: 14, a: 2111, b: 2198, kind: "3d", set: "office", dress: "london", light: "lamp" },
  { id: 15, a: 2198, b: 2438, kind: "3d", set: "deck", light: "deck" },
  { id: 16, a: 2438, b: 2818, kind: "board", light: "night", board: "seats" },
  { id: 17, a: 2818, b: 3113, kind: "3d", set: "office", dress: "inquiry", light: "lamp" },
  { id: 18, a: 3113, b: 3214, kind: "board", light: "night", board: "verdict1" },
  { id: 19, a: 3214, b: 3301, kind: "3d", set: "office", dress: "london", light: "lamp" },
  { id: 20, a: 3301, b: PILOT_END, kind: "3d", set: "office", dress: "belfast", light: "lamp" },
];
/** anchor: frame of word wi of narration line li, minus a small lead (reactions land 0-3 f early) */
export const A = (li: number, wi = 0, lead = 3) => W[li][Math.min(wi, W[li].length - 1)] - lead;
export const END_SCREEN = 600;
export const TOTAL = LE[LE.length - 1] + 30 + END_SCREEN;
type Row = [number, "3d" | "board", string, TL, string?, Dress?];   // [a, kind, set|board, light, scene, dress]
// chapters 2-10: one row per shot, each runs to the next row's start (see SHOTPLAN.md)
const ROWS: Row[] = [
  // ---- chapter 2: the designer wanted 64 boats
  [PILOT_NEW, "board", "myth2", "night"],
  [A(49), "3d", "office", "lamp", "belfastCarlisle", "belfast"],
  [A(51), "3d", "deck", "deck", "davitClose"],
  [A(53), "board", "davits", "night"],
  [A(58), "3d", "office", "lamp", "inquiryCarlisle", "inquiry"],
  [A(60), "board", "deckplan", "night"],
  [A(61), "3d", "office", "lamp", "meeting", "belfast"],
  [A(62), "board", "agenda", "night"],
  [A(65), "board", "verdict2", "night"],
  [A(68), "3d", "deck", "deck", "clipShort"],
  // ---- chapter 3: the crew never practised
  [A(70), "board", "myth3", "night"],
  [A(73), "board", "calendar", "night"],
  [A(79), "3d", "deck", "deck", "clipPractice"],
  [A(80), "3d", "ship", "day", "southWide"],
  [A(81, 2), "3d", "sea", "day", "southBoat"],
  [A(82), "3d", "deck", "day", "sailors"],
  [A(84), "board", "questions", "night"],
  [A(88), "board", "verdict3", "night"],
  // ---- chapter 4: panic emptied the boats
  [A(92), "board", "myth4", "night"],
  [A(94), "3d", "deck", "deck", "deckCalm"],
  [A(98), "3d", "ship", "night", "railPOV"],
  [A(100), "3d", "deck", "deck", "deckNo"],
  [A(102), "3d", "ship", "night", "boat7"],
  [A(105), "3d", "deck", "deck", "deckInside"],
  [A(108), "3d", "deck", "deck", "murdochDavit"],
  [A(111), "board", "doors", "night"],
  [A(113), "board", "spare", "night"],
  [A(114), "board", "verdict4", "night"],
  // ---- chapter 5: women and children first was the rule
  [A(118), "board", "myth5", "night"],
  [A(120), "3d", "deck", "deck", "orderTrio"],
  [A(124), "3d", "deck", "deck", "stbdLoad"],
  [A(126), "3d", "deck", "deck", "portLoad"],
  [A(128), "board", "split", "night"],
  [A(132), "board", "stats", "night"],
  [A(135), "board", "law", "night"],
  [A(139), "board", "verdict5", "night"],
  // ---- chapter 6: third class locked below (played straight)
  [A(141), "board", "myth6", "night"],
  [A(144), "board", "gates", "night"],
  [A(147), "3d", "office", "lamp", "inquiryEmpty", "inquiry"],
  [A(148), "board", "cutaway", "night"],
  [A(154), "board", "signs", "night"],
  [A(158), "board", "onein4", "night"],
  [A(159), "board", "verdict6", "night"],
  // ---- chapter 7: boat one was bribed
  [A(162), "3d", "sea", "night", "boat1Ship"],
  [A(167), "3d", "sea", "night", "boat1Dark"],
  [A(170), "board", "papers2", "night"],
  [A(173), "3d", "office", "lamp", "inquiryCosmo", "inquiry"],
  [A(177), "board", "verdict7", "night"],
  [A(180), "3d", "sea", "night", "waiting"],
  [A(186), "board", "answer", "night"],
  // ---- chapter 8: the boat that went back (played straight)
  [A(191), "3d", "sea", "night", "boat14"],
  [A(194), "3d", "sea", "night", "raft"],
  [A(196), "3d", "sea", "night", "rowBack"],
  [A(199), "3d", "sea", "night", "lantern"],
  [A(201), "3d", "sea", "night", "boat4"],
  [A(202), "3d", "sea", "firstlight", "collA"],
  [A(206), "3d", "sea", "firstlight", "collB"],
  [A(209), "board", "oneback", "night"],
  // ---- chapter 9: Carpathia
  [A(211), "board", "map", "night"],
  [A(211, 3), "3d", "office", "lamp", "wireless", "wireless"],
  [A(214), "3d", "carp", "night", "carpTurn"],
  [A(216), "3d", "carp", "night", "carpIce"],
  [A(217), "3d", "carp", "firstlight", "dawnSea"],
  [A(220), "3d", "carp", "dawn", "ladder"],
  [A(221), "board", "rescued", "night"],
  // ---- chapter 10: the rule
  [A(223), "3d", "office", "lamp", "conference", "conference"],
  [A(225), "board", "solas", "night"],
  [A(230), "board", "ferry", "night"],
  [A(231), "board", "callback", "night"],
  [A(234), "3d", "ship", "night", "hookAgain"],
  [A(235), "3d", "office", "lamp", "ledgerAgain", "london"],
  [A(236), "board", "teaser", "night"],
  [LE[238] + 30, "board", "endscreen", "night"],
];
ROWS.forEach(([a, kind, what, light, scene, dress], i) => {
  const b = i + 1 < ROWS.length ? ROWS[i + 1][0] : TOTAL;
  const id = SHOTS.length + 1;
  if (kind === "board") SHOTS.push({ id, a, b, kind, light, board: what });
  else SHOTS.push({ id, a, b, kind, set: what as Set3, light, scene, dress });
});
SHOTS[19].b = PILOT_END;
void VOICE_END; void LS;
const CH_STARTS = [70, 92, 118, 141, 162, 191, 211, 223].map((li) => A(li));
/** flashes: pilot cuts + every chapter start + place/time jumps in chapters 2-10 */
export const FLASHES = [445, 1049, 1135, 1474, 1900, 2198, 2438, 2818, 3113, 3301, PILOT_END, A(49), A(58), A(80), A(102), A(147), A(173), A(202), A(211, 3), A(214), A(217), A(223), A(234), A(235), A(236), ...CH_STARTS]
  .filter((v, i, a) => a.indexOf(v) === i).sort((x, y) => x - y);
const FLASH_K = [0.85, 0.65, 0.45, 0.28, 0.14, 0.05];
export const flashAt = (f: number) => { for (const a of FLASHES) if (f >= a && f < a + 6) return FLASH_K[f - a]; return 0; };
/** pilot = the frame belongs to the pilot (its f is then a v1 frame) */
export const shotAt = (f: number, pilot = f < PILOT_NEW) => (pilot ? SHOTS.slice(0, 20) : SHOTS.slice(20)).find((s) => f >= s.a && f < s.b) ?? SHOTS[pilot ? 19 : SHOTS.length - 1];
/** 7-frame flip-sign impact kicks (frame, strength) */
export const KICKS: [number, number][] = [[877, 1], [911, 1], [1213, 0.8], [1258, 0.8], [1849, 1.2], [2169, 0.8], [3126, 1.3], [3230, 0.6]];
/** verdict stamps in chapters 2-7 land on the verdict word (line, word index) */
export const STAMPS: Record<string, number> = { verdict2: A(65, 1, 0), verdict3: A(88, 1, 0), verdict4: A(114, 1, 0), verdict5: A(139, 1, 0), verdict7: A(178, 1, 0) };
for (const k of ["verdict2", "verdict3", "verdict4", "verdict5", "verdict7"]) KICKS.push([STAMPS[k], 1.2]);
const KICK_K = [1, -0.8, 0.6, -0.4, 0.25, -0.12, 0.05];
export const kickAt = (f: number) => { let k = 0; for (const [a, s] of KICKS) if (f >= a && f < a + 7) k += KICK_K[f - a] * s; return k; };

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mixC = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 38, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mixC(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** creeping push: exp(-rate * frames) distance factor */
const push = (f: number, f0: number, rate: number) => Math.exp(-rate * Math.max(0, f - f0));
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });

/** boat 1 lowering: height of the keel above the water (m) by frame (shots 1-2) */
export const boat1Y = (f: number) => 17.4 - 15.6 * ramp(f, -60, 260) - 0.25 * Math.max(0, Math.sin(f * 0.9)) * (f < 230 ? 1 : 0);
const O = OFFICE;
const CAMS: Record<number, Key[]> = {
  // 1: hook. The whole lit ship side-on from the starboard quarter, boat 1 halfway down the hull
  1: [{ f: 0, s: (f) => ({ pos: [83, 10.5 - 0.02 * f, 27], look: [72, boat1Y(f) + 0.7, 15.6], fov: 34, roll: -0.03 }) }],
  // 2: close on the hull: tilt down with boat 1 past the portholes, slight roll
  2: [{ f: 115, s: (f) => dolly([116, 4.5, 66], [58, 11, 10], push(f, 115, 0.0018), { fov: 36 }) }],
  // 3: boat 1 in the water from above, 3/4; tighter cut at "Twelve"
  3: [{ f: 232, s: (f) => dolly([SEA_B1[0] + 7, 8.5, SEA_B1[2] + 9], [SEA_B1[0], 0.4, SEA_B1[2]], push(f, 232, 0.002), { fov: 36 }) },
    { f: 271, cut: true, s: (f) => dolly([SEA_B1[0] + 4.2, 4.6, SEA_B1[2] + 5.4], [SEA_B1[0], 0.6, SEA_B1[2]], push(f, 271, 0.003), { fov: 36 }) }],
  // 4: on deck, low along the rail toward the crowd
  4: [{ f: 327, s: (f) => dolly([62, BOAT_DECK + 1.5, 8.0], [47, BOAT_DECK + 1.1, 12.0], push(f, 327, 0.0025), { fov: 40 }) }],
  // 5: Clipboard by a davit, medium
  5: [{ f: 445, s: (f) => dolly([64.2, BOAT_DECK + 1.25, 6.4], [60, BOAT_DECK + 1.05, 10.6], push(f, 445, 0.003), { fov: 38 }) },
    { f: 545, dur: 30, s: (f) => dolly([65.5, BOAT_DECK + 1.6, 5.2], [57, BOAT_DECK + 1.1, 12.4], push(f, 545, 0.002), { fov: 40 }) }],
  // 6: sea wide: crane down toward the half-empty boats, roll on "empty"
  6: [{ f: 579, s: (f) => ({ pos: [52, 15 - 9 * ramp(f, 579, 760), 132 - 22 * ramp(f, 579, 760)], look: [36, 2, 36], fov: 38, roll: -0.07 * ramp(f, 725, 760) }) }],
  // 8: Clipboard close with the myth card
  8: [{ f: 1049, s: (f) => dolly([63.0, BOAT_DECK + 1.3, 7.8], [60, BOAT_DECK + 1.15, 10.6], push(f, 1049, 0.004), { fov: 38 }) }],
  // 10: Clipboard medium -> close on the dusty rulebook
  10: [{ f: 1307, s: (f) => dolly([64.0, BOAT_DECK + 1.3, 6.8], [60, BOAT_DECK + 1.1, 10.6], push(f, 1307, 0.002), { fov: 38 }) },
    { f: 1440, dur: 20, s: (f) => dolly([62.4, BOAT_DECK + 1.15, 8.6], [60.1, BOAT_DECK + 0.95, 10.4], push(f, 1440, 0.004), { fov: 38 }) }],
  // 11: London 1894: dolly in to the clerk's desk
  11: [{ f: 1474, s: (f) => dolly(at(O, 2.4, 1.85, 3.4), at(O, -0.3, 1.45, -1.2), 1 - 0.3 * ramp(f, 1474, 1741), { fov: 40 }) },
    { f: 1700, dur: 30, s: (f) => dolly(at(O, 0.6, 2.05, 1.2), at(O, 0, 0.95, -0.55), push(f, 1700, 0.003), { fov: 40 }) }],
  // 12: insert on the ledger, then cut to the clerk on "That's it"
  12: [{ f: 1742, s: (f) => dolly(at(O, 0.3, 1.75, 0.5), at(O, 0.24, 0.92, -0.32), push(f, 1742, 0.003), { fov: 40 }) },
    { f: 1847, cut: true, s: (f) => dolly(at(O, 1.0, 1.55, 1.4), at(O, 0, 1.35, -1.2), push(f, 1847, 0.004), { fov: 38 }) }],
  14: [{ f: 2111, s: (f) => dolly(at(O, -0.9, 1.6, 1.5), at(O, 0, 1.3, -1.2), push(f, 2111, 0.005), { fov: 38 }) }],
  // 15: lateral dolly along the starboard boats (forward group), counters on top
  15: [{ f: 2198, s: (f) => { const x = 82 - 40 * ramp(f, 2198, 2437); return { pos: [x, BOAT_DECK + 0.6, 30], look: [x - 7, BOAT_DECK - 0.4, 15], fov: 40 }; } }],
  // 17: inquiry hall two-shot
  17: [{ f: 2818, s: (f) => dolly(at(O, 3.2, 2.4, 4.6), at(O, -0.2, 1.6, -1.0), push(f, 2818, 0.0012), { fov: 40 }) },
    { f: 3040, dur: 26, s: (f) => dolly(at(O, -1.6, 2.2, 2.0), at(O, -2.6, 2.3, -2.4), push(f, 3040, 0.003), { fov: 38 }) }],
  // 19: the rulebook cracking, close
  19: [{ f: 3214, s: (f) => dolly(at(O, 0.15, 1.6, 0.4), at(O, 0, 0.95, -0.5), push(f, 3214, 0.004), { fov: 40 }) }],
  // 20: Belfast drawing office, slow push to Carlisle who turns on "Someone did"
  20: [{ f: 3301, s: (f) => dolly(at(O, 2.4, 1.9, 4.2), at(O, -0.4, 1.5, -1.4), push(f, 3301, 0.0025), { fov: 38 }) }],
};
// ---------------- cameras of chapters 2-10, by scene (f, shot start a, shot end b) ----------------
const BD = BOAT_DECK;
const u01 = (f: number, a: number, b: number) => clamp01((f - a) / Math.max(1, b - a));
const CARPV: V3 = [300, 0, 260], L14V: V3 = [20, 0, 80];
type SC = (f: number, a: number, b: number) => Shot;
const SCENE_CAMS: Record<string, SC> = {
  belfastCarlisle: (f, a) => dolly(at(OFFICE, 2.4, 1.9, 4.2), at(OFFICE, -0.4, 1.5, -1.4), push(f, a, 0.0022), { fov: 38 }),
  davitClose: (f, a, b) => { const u = u01(f, a, b); return { pos: [50 + 3 * u, BD + 0.8, 24], look: [56, BD + 0.6, 14.5], fov: 38 }; },
  inquiryCarlisle: (f, a) => dolly(at(OFFICE, 3.4, 2.0, 4.2), at(OFFICE, 0.2, 1.4, -1.0), push(f, a, 0.0022), { fov: 38 }),
  meeting: (f, a) => dolly(at(OFFICE, 2.2, 1.8, 3.4), at(OFFICE, 0.1, 1.35, -1.1), push(f, a, 0.002), { fov: 40 }),
  clipShort: (f, a) => dolly([63.6, BD + 1.3, 7.2], [60, BD + 1.1, 10.6], push(f, a, 0.003), { fov: 38 }),
  clipPractice: (f, a) => dolly([62.6, BD + 1.25, 8.0], [60, BD + 1.1, 10.6], push(f, a, 0.003), { fov: 38, roll: 0.02 }),
  southWide: (f, a, b) => { const u = u01(f, a, b); return { pos: [92 - 10 * u, 7, 112 - 12 * u], look: [36, 9, 0], fov: 38 }; },
  southBoat: (f, a, b) => { const u = u01(f, a, b); return { pos: [53 - 4 * u, 2.6, 46], look: [38 - 2 * u, 1.8, 26], fov: 36 }; },
  sailors: (f, a) => dolly([70.5, BD + 1.6, 7.0], [63, BD + 1.1, 12], push(f, a, 0.002), { fov: 40 }),
  deckCalm: (f, a, b) => { const u = u01(f, a, b); return { pos: [36 + 4 * u, BD + 1.7, 3.0], look: [52 + 2 * u, BD + 1.3, 9.5], fov: 42 }; },
  railPOV: (f, a, b) => { const u = u01(f, a, b); return { pos: [50 + 2 * u, 1.0, 34], look: [48, 15 + 2 * u, 14], fov: 46, roll: -0.04 }; },
  deckNo: (f, a) => dolly([57.8, BD + 1.4, 7.6], [53.4, BD + 1.15, 11.6], push(f, a, 0.003), { fov: 38 }),
  boat7: (f, a, b) => { const u = u01(f, a, b); return { pos: [74, 6 + 2 * u, 46], look: [48, BD - 1.0 - 14 * u, 15.5], fov: 36 }; },
  deckInside: (f, a, b) => { const u = u01(f, a, b); return { pos: [47 - 2 * u, BD + 1.5, 9.4], look: [40, BD + 1.2, 4.6], fov: 40 }; },
  murdochDavit: (f, a) => dolly([42.2, BD + 1.7, 8.2], [48, BD + 1.5, 13.0], push(f, a, 0.0022), { fov: 40 }),
  orderTrio: (f, a) => dolly([69.2, BD + 1.6, 4.4], [75.8, BD + 1.25, 0.4], push(f, a, 0.002), { fov: 38 }),
  stbdLoad: (f, a) => dolly([61.5, BD + 2.2, 6.0], [56, BD + 0.9, 13.6], push(f, a, 0.0018), { fov: 40 }),
  portLoad: (f, a) => dolly([61.5, BD + 2.2, -6.0], [56, BD + 0.9, -13.6], push(f, a, 0.0018), { fov: 40 }),
  inquiryEmpty: (f, a) => dolly(at(OFFICE, 2.8, 2.0, 3.6), at(OFFICE, -2.6, 1.9, -2.2), push(f, a, 0.0015), { fov: 38 }),
  boat1Ship: (f, a) => dolly([76, 3.2, 47], [61, 1.2, 31], push(f, a, 0.0015), { fov: 38 }),
  boat1Dark: (f, a) => dolly([66.5, 2.4, 40], [62, 0.6, 34], push(f, a, 0.002), { fov: 38 }),
  inquiryCosmo: (f, a) => dolly(at(OFFICE, 3.4, 2.0, 4.2), at(OFFICE, 0.2, 1.4, -1.0), push(f, a, 0.0022), { fov: 38 }),
  waiting: (f, a, b) => { const u = u01(f, a, b); return { pos: [46, 16 - 6 * u, 160 - 20 * u], look: [42, 0, 70], fov: 40 }; },
  boat14: (f, a) => dolly([L14V[0] + 7.5, 2.6, L14V[2] + 4], [L14V[0], 1.1, L14V[2]], push(f, a, 0.0018), { fov: 38 }),
  raft: (f, a, b) => { const u = u01(f, a, b); return { pos: [L14V[0] + 16 - 3 * u, 11 - 2 * u, L14V[2] + 14], look: [L14V[0], 0.4, L14V[2]], fov: 40 }; },
  rowBack: (f, a, b) => { const u = u01(f, a, b), x = L14V[0] - 1.6 * (f - a) / 30; return { pos: [x + 9, 1.9, L14V[2] - 2], look: [x - 6 - 4 * u, 0.9, L14V[2] - 6], fov: 40 }; },
  lantern: (f, a) => dolly([L14V[0] - 40 - 5.5, 2.1, L14V[2] - 2.5], [L14V[0] - 40 - 3.4, 1.4, L14V[2] - 5.8], push(f, a, 0.0012), { fov: 36 }),
  boat4: (f, a) => dolly([L14V[0] - 22, 3.4, L14V[2] + 27], [L14V[0] - 30, 0.9, L14V[2] + 20], push(f, a, 0.002), { fov: 38 }),
  collA: (f, a, b) => { const u = u01(f, a, b); return { pos: [L14V[0] + 20 - 2 * u, 3.0, L14V[2] + 40], look: [L14V[0] + 8, 0.3, L14V[2] + 29], fov: 38 }; },
  collB: (f, a) => dolly([L14V[0] - 9, 3.4, L14V[2] + 52], [L14V[0] - 20, 0.9, L14V[2] + 40], push(f, a, 0.002), { fov: 38 }),
  wireless: (f, a) => dolly(at(OFFICE, 1.9, 1.7, 1.2), at(OFFICE, -0.3, 1.15, -2.4), push(f, a, 0.002), { fov: 40 }),
  carpTurn: (f, a, b) => { const u = u01(f, a, b); return { pos: [CARPV[0] - 120 + 90, 26 - 6 * u, CARPV[2] - 200 + 110], look: [CARPV[0] - 120, 6, CARPV[2] - 200], fov: 38 }; },
  carpIce: (f, a) => { const x = CARPV[0] - 200 + 7 * (f - a) / 30; return { pos: [x + 70, 4, CARPV[2] - 150 - 60], look: [x, 8, CARPV[2] - 150], fov: 38 }; },
  dawnSea: (f, a, b) => { const u = u01(f, a, b); return { pos: [CARPV[0] - 200 - 30 * u, 22 - 6 * u, CARPV[2] - 60 + 40 * u], look: [CARPV[0] - 80, 2, CARPV[2] - 120], fov: 42 }; },
  ladder: (f, a) => dolly([CARPV[0] + 6, 4.2, CARPV[2] + 32], [CARPV[0] - 8, 4.4, CARPV[2] + 11], push(f, a, 0.0018), { fov: 40 }),
  conference: (f, a) => dolly(at(OFFICE, 0.4, 2.1, 3.8), at(OFFICE, 0, 1.4, -1.5), push(f, a, 0.002), { fov: 40 }),
  hookAgain: (f, a) => dolly([116, 4.5, 66], [58, 11, 10], push(f, a, 0.0015), { fov: 36 }),
  ledgerAgain: (f, a) => dolly(at(OFFICE, 0.3, 1.75, 0.5), at(OFFICE, 0.24, 0.92, -0.32), push(f, a, 0.003), { fov: 40 }),
};
export const camAt = (id: number, f: number): Cam => {
  const sh = SHOTS[id - 1];
  const c = CAMS[id] ? run(CAMS[id], f) : full(SCENE_CAMS[sh.scene!](f, sh.a, sh.b)), k = kickAt(f);
  if (!k) return c;
  return { ...c, pos: [c.pos[0], c.pos[1] + 0.02 * k, c.pos[2]], look: [c.look[0], c.look[1] - 0.03 * k, c.look[2]], roll: c.roll + 0.006 * k };
};
/** depth of field per shot: cInf = circle of confusion at infinity in px at 1080p (0 = sharp) */
export const dofAt = (id: number): { cInf: number } => {
  const s = SHOTS[id - 1];
  if (s.set === "ship" || s.set === "carp" || s.id === 6 || s.id === 15 || ["waiting", "raft", "dawnSea", "southWide", "davitClose"].includes(s.scene ?? "")) return { cInf: 0 };
  return { cInf: s.set === "office" ? 9 : 7 };
};
