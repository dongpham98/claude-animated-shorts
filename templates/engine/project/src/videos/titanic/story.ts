// Timeline of "Titanic's Lifeboats: 7 Myths" — pilot = cold open + chapter 1 (frames 0..3452), timed to
// ~/channel/02-titanic/voice/words.json (Kokoro am_puck 0.9). Camera grammar from the skill: smootherstep glides,
// cuts on beats, a 6-frame white flash on every place/time jump, creeping holds, flip kicks on stamps and slams.
import type { TL } from "./lights";
export const FPS = 30;
export const PILOT_END = 3453;
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
export type Set3 = "ship" | "deck" | "sea" | "office";
export type Dress = "london" | "inquiry" | "belfast";
export type ShotDef = { id: number; a: number; b: number; kind: "3d" | "board"; set?: Set3; dress?: Dress; light: TL; board?: string };
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
export const FLASHES = [445, 1049, 1135, 1474, 1900, 2198, 2438, 2818, 3113, 3301];
const FLASH_K = [1, 0.8, 0.6, 0.4, 0.2, 0.08];
export const flashAt = (f: number) => { for (const a of FLASHES) if (f >= a && f < a + 6) return FLASH_K[f - a]; return 0; };
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** 7-frame flip-sign impact kicks (frame, strength) */
export const KICKS: [number, number][] = [[877, 1], [911, 1], [1213, 0.8], [1258, 0.8], [1849, 1.2], [2169, 0.8], [3126, 1.3], [3230, 0.6]];
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
  1: [{ f: 0, s: (f) => dolly([116, 4.5, 66], [58, 11, 10], push(f, 0, 0.0018), { fov: 36 }) }],
  // 2: close on the hull: tilt down with boat 1 past the portholes, slight roll
  2: [{ f: 115, s: (f) => ({ pos: [104, 7.5 + 0.02 * (f - 115), 52], look: [72, boat1Y(f) + 1.2, 15.6], fov: 34, roll: -0.035 }) }],
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
  12: [{ f: 1742, s: (f) => dolly(at(O, 0.3, 1.7, 0.35), at(O, 0.24, 0.92, -0.42), push(f, 1742, 0.004), { fov: 40 }) },
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
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), k = kickAt(f);
  if (!k) return c;
  return { ...c, pos: [c.pos[0], c.pos[1] + 0.02 * k, c.pos[2]], look: [c.look[0], c.look[1] - 0.03 * k, c.look[2]], roll: c.roll + 0.006 * k };
};
/** depth of field per shot: cInf = circle of confusion at infinity in px at 1080p (0 = sharp) */
export const dofAt = (f: number): { cInf: number } => {
  const s = shotAt(f);
  if (s.set === "ship" || s.id === 6 || s.id === 15) return { cInf: 0 };
  return { cInf: s.set === "office" ? 9 : 7 };
};
