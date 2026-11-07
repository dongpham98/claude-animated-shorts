// Timeline of "The Syrup That Outran People" (Great Molasses Flood, 1919): shots timed to the voice
// (~/channel/01-molasses/voice/words.json, Kokoro am_puck), the wave physics, and the camera grammar of the skill
// (smootherstep glides 18-40 f, cuts on big jumps, creeping holds, flip kicks on impacts).
export const FPS = 30;
export const TOTAL = 1849;
export const D0 = 0; // street level (m)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

// ---------------- place ----------------
// Commercial Street runs along z (x = -7..7). West: brick North End rows (fronts at x = -8). East: the elevated
// railway over the east half of the street, then the wharf yard (x 7..45) with the tank, the firehouse and a truck,
// then the harbor (x > 45, water 1.5 m down).
export const TANK: V3 = [26, 0, -30];
export const TANK_R = 13.5, TANK_H = 15;
export const QUAY_X = 45, WATER_Y = -1.5;
export const FIREHOUSE: V3 = [13, 0, 14];
export const TRUCK: V3 = [9.5, 0, -12];
/** the two interior inserts are built far outside the town */
export const KITCHEN: V3 = [-400, 0, 0];
export const OFFICE: V3 = [-400, 0, 80];
export const at = (o: V3, x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];

// ---------------- the burst and the wave ----------------
/** "splits" at 26.53 s; rivets pop from 24.5 s ("popping") */
export const SPLIT = 26.5;
export const RIVET0 = 24.5, RIVET1 = 25.75;
/** wave time (s since the split) used by each shot; shot 1 is a flash-forward of shot 7 */
export const waveFront = (tw: number) => TANK_R + 15.5 * tw - 0.18 * tw * tw;          // ~35 mph, slowing a little
export const waveCrest = (tw: number) => 0.9 + 6.9 * Math.exp(-tw / 7);                    // 25 ft at the start
export const waveBed = (tw: number) => 0.55 + 2.2 * Math.exp(-tw / 4);                     // level behind the crest
/** molasses height above the street at distance d from the tank centre, tw seconds after the split */
export const waveH = (d: number, tw: number, rOff = 0, hMul = 1) => {
  if (tw <= 0) return 0;
  const rf = waveFront(tw) + rOff, H = waveCrest(tw) * hMul, B = waveBed(tw);
  if (d > rf) return H * Math.exp(-(((d - rf) / (1.6 + 0.35 * H)) ** 2));                 // rounded, leaning nose
  const back = rf - d;
  return B + (H - B) * Math.exp(-((back / (4 + 1.5 * tw)) ** 2));
};

// ---------------- shots ----------------
export type Light = "day" | "golden" | "night";
export type Crowd = "runners" | "street" | "buckets" | "painter" | "wharf" | "rescuer" | "kitchen" | "stuck" | "office" | "summer" | "none";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd; tw?: (t: number) => number; brown?: boolean; set?: "street" | "kitchen" | "office" | "summer" };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 104, light: "day", crowd: "runners", tw: (t) => 1.6 + t * 0.62, brown: true },
  { id: 2, a: 104, b: 308, light: "day", crowd: "street" },
  { id: 3, a: 308, b: 413, light: "day", crowd: "buckets" },
  { id: 4, a: 413, b: 500, light: "day", crowd: "painter" },
  { id: 5, a: 500, b: 663, light: "day", crowd: "wharf", brown: true },
  { id: 6, a: 663, b: 819, light: "day", crowd: "wharf", brown: true, tw: (t) => t - SPLIT },
  { id: 7, a: 819, b: 960, light: "day", crowd: "none", brown: true, tw: (t) => t - SPLIT },
  { id: 8, a: 960, b: 1060, light: "day", crowd: "none", brown: true, tw: (t) => t - SPLIT },
  { id: 9, a: 1060, b: 1115, light: "day", crowd: "none", brown: true, tw: () => 30 },
  { id: 10, a: 1115, b: 1235, light: "day", crowd: "rescuer", brown: true, tw: () => 30 },
  { id: 11, a: 1235, b: 1362, light: "day", crowd: "kitchen", set: "kitchen" },
  { id: 12, a: 1362, b: 1432, light: "day", crowd: "none", brown: true, tw: (t) => 0.3 + (t - 45.4) * 1.1 },
  { id: 13, a: 1432, b: 1530, light: "night", crowd: "stuck", brown: true, tw: () => 30 },
  { id: 14, a: 1530, b: 1720, light: "day", crowd: "office", set: "office" },
  { id: 15, a: 1720, b: TOTAL, light: "golden", crowd: "summer", set: "summer" },
];
// skill rule: hard cuts with a 6-frame white flash on place / time jumps (no crossfades)
export const XFADE: Record<number, number> = {};
export const FLASH_AT = 104;
export const FLASHES = [104, 1235, 1362, 1432, 1530, 1720];
const FLASH_K = [1, 0.8, 0.6, 0.4, 0.2, 0.08];
export const flashAt = (f: number) => { for (const a of FLASHES) if (f >= a && f < a + 6) return FLASH_K[f - a]; return 0; };

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};
export const waveTime = (id: number, t: number) => SHOTS[id - 1].tw?.(t) ?? -1;

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });

// where the street meets the wave front (for cameras that run ahead of it)
export const streetFrontZ = (tw: number) => { const rf = waveFront(tw), dx = TANK[0]; return rf > dx ? TANK[2] + Math.sqrt(rf * rf - dx * dx) : TANK[2]; };

// shot 1 (hook, flash-forward): low lens racing backward down the street ahead of the wave and the runners
const S1a = (f: number) => { const z = streetFrontZ(SHOTS[0].tw!(T(f))) + 20; return { pos: [-3.8, 1.5, z] as V3, look: [-1.6, 3.4, z - 20] as V3, fov: 52, roll: 0.05 }; };
// shot 2 (setting): harbor aerial -> the tank from the street -> crane up its wall
const S2a = (f: number) => zoom([-48, 44, 52], [22, 4, -22], 44, pushK(f, 104, 0.0018));
const S2b = (f: number) => zoom([9.6, 1.7, -6], [24, 3.2, -28], 50, pushK(f, 180, 0.0015));
const S2c = (f: number) => zoom([9.6, 2.0, -6], [25, 13.5, -29], 56, pushK(f, 231, 0.002, 0.005, 30));
// shot 3 (buckets): at the base of the tank, the queue under the drips
const S3a = (f: number) => dolly([3.4, 1.4, -33.6], [11.3, 1.1, -30.6], pushK(f, 308, 0.0025), { fov: 42 });
const S3b = (f: number) => dolly([4.6, 1.2, -33.1], [11.3, 1.05, -30.85], pushK(f, 368, 0.002, 0.005, 30), { fov: 40, roll: 0.03 });
// shot 4 (paint): the painter on his ladder, slight low angle
const S4a = (f: number) => dolly([6.3, 2.0, -21.8], [12.2, 3.2, -24.2], pushK(f, 413, 0.0025), { fov: 42 });
const S4b = (f: number) => dolly([7.6, 2.3, -22.6], [12.2, 3.6, -24.2], pushK(f, 480, 0.002, 0.006, 25), { fov: 40, roll: -0.035 });
// shot 5 (warm delivery): from the wharf toward the tank, the pipe from the ship
const S5a = (f: number) => zoom([98, 11, -24], [40, 7, -35], 46, pushK(f, 500, 0.002));
const S5b = (f: number) => zoom([46, 2.4, -4], [29, 6.5, -24], 52, pushK(f, 600, 0.002, 0.006, 30), { roll: 0.04 });
// shot 6 (rivets, burst): rivet seam close-up, then cut to the wide as it splits
const S6a = (f: number) => dolly([8.6, 6.4, -24.5], [12.9, 7.2, -27.6], pushK(f, 663, 0.002, 0.004, 40), { fov: 34 });
const S6b = (f: number) => zoom([32, 7, 24], [26, 7, -30], 50, pushK(f, 790, 0.003), { roll: -0.05 });
// shot 7 (the wave rolls down the street): low street lens gliding backward ahead of it
const S7a = (f: number) => { const z = streetFrontZ(T(f) - SPLIT) + 21 + 0.04 * (f - 819); return { pos: [-3.6, 5.2, z] as V3, look: [0.0, 2.6, z - 30] as V3, fov: 50, roll: -0.04 }; };
// shot 8 (truck, firehouse)
const S8a = (f: number) => zoom([20, 9.5, 70], [47, 2.8, 40], 48, pushK(f, 960, 0.002));
const S8b = (f: number) => dolly([27, 4.5, 43], [14, 4.5, 14], pushK(f, 1008, 0.002), { fov: 46, roll: 0.04 });
// shot 9 (serious beat): still empty street under molasses, an abandoned bucket
const S9a = (f: number) => dolly([-3, 2.4, 30], [2, 1.0, 4], pushK(f, 1060, 0.0015), { fov: 44 });
// shot 10 (mystery): a rescuer in the molasses, puzzled; glide to the street thermometer on "You see"
const S10a = (f: number) => dolly([-5.6, 1.45, 18.8], [-2.3, 1.15, 12.4], pushK(f, 1115, 0.0025), { fov: 40 });
const S10b = (f: number) => dolly([-3.6, 1.75, 16.2], [-0.5, 1.75, 11.4], pushK(f, 1168, 0.002, 0.006, 30), { fov: 40, roll: 0.03 });
// shot 11 (kitchen insert): granny with the honey jar at the table, then the stove on "Warm it up"
const S11a = (f: number) => dolly(at(KITCHEN, -0.3, 1.35, 2.8), at(KITCHEN, -0.1, 1.0, -1.7), pushK(f, 1235, 0.0025), { fov: 40 });
const S11b = (f: number) => dolly(at(KITCHEN, 1.2, 1.45, 1.7), at(KITCHEN, 1.35, 1.05, -2.1), pushK(f, 1306, 0.002, 0.006, 30), { fov: 38 });
// shot 12 (replay): high wide, the warm molasses racing out of the tank
const S12a = (f: number) => zoom([30, 15, 32], [24, 1, -20], 50, pushK(f, 1362, 0.002));
// shot 13 (night): rescuers stuck in the stiffening molasses
const S13a = (f: number) => dolly([-6.8, 1.6, 21.5], [-2.2, 0.9, 13.6], pushK(f, 1432, 0.0022), { fov: 40 });
const S13b = (f: number) => dolly([-4.8, 1.25, 17.8], [-2.2, 0.85, 13.6], pushK(f, 1500, 0.002, 0.005, 25), { fov: 38, roll: -0.035 });
// shot 14 (office): the engineer at the drafting table; push on "sign"
const S14a = (f: number) => dolly(at(OFFICE, -0.6, 1.55, 3.0), at(OFFICE, -0.3, 1.2, -1.6), pushK(f, 1530, 0.0022), { fov: 42 });
const S14b = (f: number) => dolly(at(OFFICE, 0.3, 2.05, 1.0), at(OFFICE, 0.1, 1.2, -1.45), pushK(f, 1636, 0.002, 0.006, 30), { fov: 38, roll: 0.03 });
// shot 15 (summer, today): golden park where the tank stood, a local stops and sniffs
const S15a = (f: number) => dolly([12.5, 1.45, -11], [24.5, 1.4, -31], pushK(f, 1720, 0.0035), { fov: 42, roll: 0.02 });
const S15b = (f: number) => dolly([15.5, 1.5, -16.5], [21.5, 1.45, -26.5], pushK(f, 1800, 0.003, 0.007, 30), { fov: 40, roll: -0.05 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }],
  2: [{ f: 104, s: S2a }, { f: 180, cut: true, s: S2b }, { f: 214, dur: 30, s: S2c }],
  3: [{ f: 308, s: S3a }, { f: 362, dur: 22, s: S3b }],
  4: [{ f: 413, s: S4a }, { f: 480, dur: 20, s: S4b }],
  5: [{ f: 500, s: S5a }, { f: 598, cut: true, s: S5b }],
  6: [{ f: 663, s: S6a }, { f: 790, cut: true, s: S6b }],
  7: [{ f: 819, s: S7a }],
  8: [{ f: 960, s: S8a }, { f: 1008, cut: true, s: S8b }],
  9: [{ f: 1060, s: S9a }],
  10: [{ f: 1115, s: S10a }, { f: 1166, dur: 26, s: S10b }],
  11: [{ f: 1235, s: S11a }, { f: 1300, dur: 22, s: S11b }],
  12: [{ f: 1362, s: S12a }],
  13: [{ f: 1432, s: S13a }, { f: 1500, dur: 22, s: S13b }],
  14: [{ f: 1530, s: S14a }, { f: 1630, dur: 24, s: S14b }],
  15: [{ f: 1720, s: S15a }, { f: 1790, dur: 30, s: S15b }],
};

// impact kicks: rivets (machine-gun, small), the split (big), the groan, the firehouse
const RIVETS = Array.from({ length: 9 }, (_, i) => RIVET0 + i * 0.14);
const KICKS: [number, number][] = [[20.38, 0.5], ...RIVETS.map((t) => [t, 0.45] as [number, number]), [SPLIT, 1.6], [34.6, 1.2], [52.43, 0.8], [55.55, 0.6]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 7, focus: (f) => [-3.5, 1.3, streetFrontZ(SHOTS[0].tw!(T(f))) + 12] }, // hook: runners sharp, the wave mildly soft
  { f: 104, cInf: 0 },                                   // aerial + tank establishing
  { f: 308, cInf: 11, focus: () => [11.2, 1.2, -30.6] }, // queue with buckets
  { f: 413, cInf: 10, focus: () => [12.1, 3.4, -24.4] }, // painter
  { f: 500, cInf: 0 },
  { f: 663, cInf: 6 },                                   // rivet seam CU
  { f: 790, cInf: 0 },                                   // burst wide, wave, damage
  { f: 1060, cInf: 0 },
  { f: 1115, cInf: 10, focus: () => [-2.3, 1.2, 12.4] },  // rescuer, then the thermometer
  { f: 1166, dur: 26, cInf: 10, focus: () => [-0.5, 1.7, 11.4] },
  { f: 1235, cInf: 9 },                                   // kitchen (focus = look)
  { f: 1362, cInf: 0 },                                   // replay aerial
  { f: 1432, cInf: 9, focus: () => [-2.2, 1.0, 13.6] },   // stuck rescuers
  { f: 1530, cInf: 9 },                                   // office (focus = look)
  { f: 1720, cInf: 7 },                                   // summer park
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
