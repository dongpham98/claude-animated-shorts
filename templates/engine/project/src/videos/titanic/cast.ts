// Who stands where in each pilot shot (cards + effect cards), as a pure function of shot id and frame.
import { Pen, Outfit, Expr, fxPuff, INK } from "./toon";
import { person, blob, lidAt, hh, q, Stage, WallFx, CamInfo, setLight } from "./castcore";
import { CAST } from "./castdefs";
import { SHOTS, FPS, V3, at, ramp, BOAT_DECK, BOAT1, SEA_B1, OFFICE, boat1Y, SEA6 } from "./story";

const C = (k: string) => CAST[k];
const STOKER: Outfit = { jacket: "#3a3a44", pants: "#2a2a30", boots: "#17141c", hat: "flatcap", cap: "#2a2a30", skin: "#ecd0b6" };
const SEAMAN: Outfit = { jacket: "#24305a", pants: "#1b2340", boots: "#17141c", hat: "cap", cap: "#24305a", skin: "#f5c9a0" };
const COMMISSIONER: Outfit = { jacket: "#1d1a22", dress: "#1d1a22", coat: true, pants: "#1d1a22", boots: "#111", hat: "hair", hair: "#f1efe9",
  hairSide: "#f1efe9", buttons: "#111", collar: "#f4f1ea", build: "stout", skin: "#ffe2c2" };
const PAX: Outfit[] = [C("firstwoman").o, C("firstman").o, C("steward").o, { ...C("firstwoman").o, dress: "#6a3a4a", jacket: "#7a4a5a", cap: "#3a2a3a", band: "#e8c45a" },
  { ...C("firstman").o, hat: "bowler", jacket: "#3a3540", dress: "#3a3540" }, { ...C("firstwoman").o, dress: "#4a5a3a", jacket: "#5a6a4a", hat: "bonnet" },
  { ...C("thirdman").o, lifebelt: true }, { ...C("thirdwoman").o, lifebelt: true }];

type P = { o: Outfit; okey: string; i: number; x: number; y: number; z: number; expr?: Expr; sit?: boolean; scale?: number; look?: number; prop?: string; seed?: number; facing?: -1 | 0 | 1; wave?: number; side?: boolean; tilt?: number };
const put = (cam: CamInfo, t: number, out: Stage, p: P, swaps: number[] = []) => {
  const fo = { mode: p.sit ? "sit" : "stand", expr: p.expr ?? "neutral", blink: lidAt(t, p.i, swaps), look: p.look ?? 0, seed: p.seed ?? ((p.i * 5 + 3) % 7) + 1,
    facing: p.facing ?? 0, prop: (p.prop ?? null) as never, wave: p.wave, tilt: p.tilt ?? 0 } as const;
  out.places.push(person(cam, { i: p.i, o: p.o, okey: p.okey }, p.x, p.y, p.z, { side: !!p.side, mirror: false }, fo as never,
    { mode: "stand", expr: p.expr ?? "neutral", blink: lidAt(t, p.i) }, p.scale ?? 1));
  if (!p.sit) blob(out, p.x, p.y, p.z, p.scale ?? 1);
};

/** boat 1's twelve: Sir Cosmo, Lady Duff-Gordon, her secretary, two more passengers, seven crew (5 stokers, 2 seamen) */
const boat1Crew = (cam: CamInfo, t: number, out: Stage, base: V3, yaw = 0) => {
  // twelve people in forty seats: clustered at the stern and bow, the middle thwarts empty
  const seats: [number, number, Outfit, string, Expr][] = [
    [-3.0, 0, SEAMAN, "sea", "stern"], [-2.4, -0.5, STOKER, "stk", "neutral"], [-2.4, 0.5, C("cosmo").o, "cosmo", "neutral"], [-1.8, -0.5, C("lucy").o, "lucy", "nervous"],
    [-1.8, 0.5, C("firstwoman").o, "fw", "nervous"], [-1.2, 0, STOKER, "stk", "stern"], [1.6, -0.5, STOKER, "stk", "neutral"], [1.6, 0.5, STOKER, "stk", "nervous"],
    [2.2, 0, SEAMAN, "sea", "stern"], [2.8, -0.45, C("firstman").o, "fm", "neutral"], [2.8, 0.45, STOKER, "stk", "neutral"], [-3.4, 0.3, C("steward").o, "stw", "neutral"],
  ];
  const c = Math.cos(yaw), s = Math.sin(yaw);
  seats.forEach(([dx, dz, o, k, expr], i) => {
    const x = base[0] + dx * c + dz * s, z = base[2] - dx * s + dz * c;
    put(cam, t, out, { o, okey: k, i: 200 + i, x, y: base[1] + 0.5, z, expr, sit: true, scale: 0.78 });
  });
};

const deckCrowd = (cam: CamInfo, t: number, out: Stage, n = 14, x0 = 34, x1 = 62) => {
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * (i + 0.5)) / n + (hh(i, 3) - 0.5) * 1.2, z = 11.2 + hh(i, 4) * 1.4;
    const arrive = 327 + 60 * hh(i, 7);
    if (t * FPS < arrive && i > 9) continue;
    put(cam, t, out, { o: PAX[i % PAX.length], okey: `pax${i % PAX.length}`, i: 300 + i, x, y: BOAT_DECK, z, expr: (["nervous", "neutral", "stern", "shock"] as Expr[])[i % 4], look: 0.6, scale: i % 7 === 3 ? 0.72 : 1 });
  }
};

const CB: V3 = [60, BOAT_DECK, 10.6];
const clipboardAt = (cam: CamInfo, t: number, out: Stage, f: number, id: number) => {
  let prop: string | undefined = "clipboard", expr: Expr = "smile", wave: number | undefined, facing: -1 | 0 | 1 = 1;
  if (id === 5) { expr = f < 548 ? "grin" : "stern"; if (f >= 546) { prop = undefined; wave = 0.6; facing = -1; } }
  if (id === 8) { expr = f < 1100 ? "grin" : "stern"; }
  if (id === 10) {
    if (f < 1388) { expr = "nervous"; prop = undefined; wave = 0.2; }       // the shrug: "awkward truth"
    else if (f < 1445) { expr = "grin"; prop = undefined; wave = 1; }        // thumbs up: "perfectly"
    else { expr = "stern"; prop = "ledger"; }                                // the dusty rulebook: "ancient"
  }
  // pops in on the flash (shot 5): scale from 0.6 -> 1 in 5 frames
  const pop = id === 5 ? 0.6 + 0.4 * ramp(f, 445, 451) : 1;
  put(cam, t, out, { ...{ o: C("clipboard").o, okey: "clip", i: 100 }, x: CB[0], y: CB[1], z: CB[2], expr, prop, wave, facing, seed: 31, scale: pop }, [1317 / FPS, 1391 / FPS, 1447 / FPS]);
  if (id === 10 && f >= 1447) {
    const u = q(ramp(f, 1447, 1470), 12);
    if (u < 1) out.fx.push({ key: `dust${u}`, cw: 400, ch: 400, draw: (p) => fxPuff(p, u), x: CB[0] + 0.25, y: CB[1] + 1.25, z: CB[2] - 0.35, w: 0.9, h: 0.9, soft: true });
  }
  // background passengers
  for (let i = 0; i < 4; i++) put(cam, t, out, { o: PAX[(i + 2) % PAX.length], okey: `pax${(i + 2) % PAX.length}`, i: 330 + i, x: 52 - i * 2.6, y: BOAT_DECK, z: 11.4 + (i % 2) * 0.9, expr: "nervous", look: 0.7 });
};

// ---------------- office props as effect cards ----------------
const txt = (p: Pen, s: string, x: number, y: number, size: number, col = INK, align: CanvasTextAlign = "center", weight = 900) => {
  const g = p.g; g.font = `${weight} ${size}px CapBlack, Montserrat, Arial Black, sans-serif`; g.textAlign = align; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, x, y);
};
/** the 1894 table, open (1024 x 680): lines of scribbled bands, the last one legible */
const ledger = (p: Pen, open: boolean, crack = 0) => {
  if (!open) {
    p.poly([[60, 120], [960, 120], [960, 600], [60, 600]], "#6b2f2f", 14);
    p.stroke([[120, 120], [120, 600]], 10, "#e8c45a"); txt(p, "LIFE-SAVING", 540, 300, 64, "#e8c45a"); txt(p, "APPLIANCES 1894", 540, 390, 52, "#e8c45a");
    if (crack > 0) { p.stroke([[500, 120], [530, 260], [480, 380], [520, 600]], 12, INK); for (let i = 0; i < 4; i++) p.poly([[700 + i * 60, 60 - i * 30 * crack], [760 + i * 60, 40 - i * 30 * crack], [770 + i * 60, 110 - i * 30 * crack], [710 + i * 60, 130 - i * 30 * crack]], "#f4ecd6", 5); }
    return;
  }
  p.poly([[20, 40], [1004, 40], [1004, 660], [20, 660]], "#6b2f2f", 12);
  p.poly([[50, 60], [505, 70], [505, 640], [50, 640]], "#f4ecd6", 8); p.poly([[519, 70], [974, 60], [974, 640], [519, 640]], "#f4ecd6", 8);
  txt(p, "BOARD OF TRADE · 1894", 278, 110, 34, "#6b2f2f"); txt(p, "GROSS TONS", 160, 170, 26, "#6b2f2f"); txt(p, "BOATS", 420, 170, 26, "#6b2f2f");
  for (let i = 0; i < 9; i++) { const y = 215 + i * 44; p.stroke([[90, y], [230 + 40 * hh(i, 1), y]], 7, "#9a8c76"); p.stroke([[400, y], [440, y]], 7, "#9a8c76"); }
  for (let i = 0; i < 5; i++) { const y = 215 + i * 44; p.stroke([[560, y], [700 + 40 * hh(i, 2), y]], 7, "#9a8c76"); p.stroke([[860, y], [900, y]], 7, "#9a8c76"); }
  p.poly([[540, 440], [955, 440], [955, 560], [540, 560]], "#ffe58a", 0);
  txt(p, "10,000 tons", 650, 470, 34, INK); txt(p, "and upwards", 650, 520, 30, INK); txt(p, "16", 880, 495, 72, "#c0353a");
  p.stroke([[540, 600], [955, 600]], 6, "#6b2f2f"); txt(p, "— END OF TABLE —", 748, 625, 22, "#6b2f2f");
};
const shipModel = (p: Pen, len: number, label: string) => {
  const x0 = 300 - len / 2, x1 = 300 + len / 2;
  p.poly([[x0, 150], [x1, 150], [x1 - 20, 200], [x0 + 10, 200]], "#22222a", 6);
  p.poly([[x0 + 30, 120], [x1 - 40, 120], [x1 - 40, 150], [x0 + 30, 150]], "#efe9da", 5);
  for (let i = 0; i < Math.max(1, Math.round(len / 120)); i++) p.poly([[x0 + 60 + i * 70, 70], [x0 + 90 + i * 70, 70], [x0 + 90 + i * 70, 120], [x0 + 60 + i * 70, 120]], "#c98a3c", 5);
  txt(p, label, 300, 250, 40, "#f4ecd6");
};
const calendar = (p: Pen, year: string) => { p.poly([[30, 30], [370, 30], [370, 470], [30, 470]], "#f4ecd6", 12); p.poly([[30, 30], [370, 30], [370, 130], [30, 130]], "#c0353a", 12); txt(p, "YEAR", 200, 82, 54, "#ffffff"); txt(p, year, 200, 300, 130, INK); };
const blueprint = (p: Pen, glow: number) => {
  p.poly([[20, 20], [780, 20], [780, 560], [20, 560]], glow > 0 ? "#2f5fa8" : "#2a4f8a", 10);
  p.g.globalAlpha = 0.9;
  for (let x = 60; x < 780; x += 60) p.stroke([[x, 30], [x, 550]], 2, "#5a86c8");
  for (let y = 60; y < 560; y += 60) p.stroke([[30, y], [770, y]], 2, "#5a86c8");
  p.g.globalAlpha = 1;
  // a Welin quadrant davit with stacked boats (side view)
  p.stroke([[300, 480], [300, 230], [360, 150], [470, 150]], 14, "#eaf2ff"); p.stroke([[470, 150], [470, 200]], 6, "#eaf2ff");
  for (let k = 0; k < 4; k++) p.ell(470 + (k % 2 ? 90 : 0) * 0 + 110 * Math.floor(k / 2), 230 + 70 * (k % 2), 70, 22, null, 6);
  p.stroke([[100, 480], [700, 480]], 8, "#eaf2ff");
  txt(p, "WELIN DAVIT — 4 BOATS EACH", 400, 520, 34, "#eaf2ff");
  if (glow > 0) { p.g.globalAlpha = 0.25 * glow; p.poly([[20, 20], [780, 20], [780, 560], [20, 560]], "#bfe0ff", 0); p.g.globalAlpha = 1; }
};
const xyz = (v: V3) => ({ x: v[0], y: v[1], z: v[2] });

const officeScene = (cam: CamInfo, t: number, out: Stage, f: number, id: number) => {
  const O = OFFICE, dress = SHOTS[id - 1].dress;
  if (dress === "london") {
    const slam = f >= 1849 && id >= 12, crack = id === 19 ? q(ramp(f, 3230, 3270), 8) : 0;
    const smug = (id === 12 && f >= 1878) || id === 14;
    put(cam, t, out, { o: C("clerk").o, okey: "clerk", i: 120, x: O[0], y: 0, z: O[2] - 1.25, expr: id === 19 ? "shock" : smug ? "smile_closed" : f > 1700 ? "smile" : "neutral", seed: 83, facing: 0,
      prop: id === 14 && f > 2160 ? "stamp" : "quill", look: id === 11 ? -0.5 : 0 }, [1878 / FPS, 2160 / FPS, 3228 / FPS]);
    out.fx.push({ key: `ledger${+!slam}${crack}`, cw: 1024, ch: 680, draw: (p) => ledger(p, !slam && id !== 19, crack), ...xyz(at(O, 0, 0.93, -0.5)), w: 1.1, h: 0.73, flat: true, rot: 0 });
    // shelf of ship models (sizes in 1894)
    for (const [k, len, lab] of [[0, 260, "3,000 t"], [1, 380, "6,000 t"], [2, 500, "10,000 t"]] as const)
      out.fx.push({ key: `model${k}`, cw: 600, ch: 280, draw: (p) => shipModel(p, len, lab), ...xyz(at(O, -2.2 + k * 1.15, 2.05, -2.88)), w: 1.0, h: 0.47, wall: 0 } as WallFx);
  }
  if (dress === "inquiry") {
    const scold = f >= 2955;
    put(cam, t, out, { o: COMMISSIONER, okey: "comm", i: 130, x: O[0] - 2.6, y: 0.9, z: O[2] - 2.4, expr: scold ? "stern" : "neutral", wave: scold ? 0.5 + 0.5 * Math.sin(f * 0.6) : undefined, seed: 12 }, [2955 / FPS]);
    put(cam, t, out, { o: C("clerk").o, okey: "clerk", i: 120, x: O[0] + 0.9, y: 0, z: O[2] - 0.6, expr: scold ? "nervous" : "smile_closed", seed: 83, facing: -1, look: -0.8 });
    const yr = f < 3062 ? "1894" : f < 3070 ? "1903" : "1912";
    out.fx.push({ key: `cal${yr}`, cw: 400, ch: 500, draw: (p) => calendar(p, yr), ...xyz(at(O, 1.8, 2.2, -2.88)), w: 0.7, h: 0.88, wall: 0 } as WallFx);
  }
  if (dress === "belfast") {
    const turned = f >= 3388;
    put(cam, t, out, { o: C("carlisle").o, okey: "carlisle", i: 140, x: O[0] - 0.9, y: 0, z: O[2] - 1.2, expr: turned ? "smile" : "neutral", seed: 72, facing: turned ? 1 : 0, prop: "scroll", side: !turned }, [3388 / FPS]);
    const glow = q(ramp(f, 3392, 3420), 6);
    out.fx.push({ key: `bp${glow}`, cw: 800, ch: 580, draw: (p) => blueprint(p, glow), ...xyz(at(O, 0.5, 1.1, -1.35)), w: 1.3, h: 0.94, wall: 0, tilt: Math.PI / 2 - 0.5 } as WallFx);
  }
};

export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] }, t = f / FPS, s = SHOTS[id - 1];
  setLight(s.light === "lamp" ? "golden" : "day", cam);
  if (id === 1 || id === 2) boat1Crew(cam, t, out, [BOAT1[0], boat1Y(f), BOAT1[2]]);
  if (id === 3) boat1Crew(cam, t, out, [SEA_B1[0], -0.52, SEA_B1[2]], 0.5);
  if (id === 4) deckCrowd(cam, t, out);
  if (id === 6) SEA6.forEach(([x0, z0, yaw, n], k) => {
    let x = x0, z = z0;
    x -= 0.03 * (f - 579) * Math.sin(yaw); z += 0.05 * (f - 579);
    const c = Math.cos(yaw), s2 = Math.sin(yaw), m = Math.max(4, Math.round(n / 5));     // a few heads per boat: half empty
    for (let i = 0; i < m; i++) { const dx = -3 + (6 * i) / Math.max(1, m - 1), dz = (i % 2 ? 0.45 : -0.45);
      put(cam, t, out, { o: i % 3 ? PAX[(i + k) % PAX.length] : STOKER, okey: i % 3 ? `pax${(i + k) % PAX.length}` : "stk", i: 500 + k * 20 + i, x: x + dx * c + dz * s2, y: -0.52 + 0.58, z: z - dx * s2 + dz * c, sit: true, scale: 0.9 }); }
  });
  if (id === 5 || id === 8 || id === 10) clipboardAt(cam, t, out, f, id);
  if (id === 15) for (let i = 0; i < 3; i++) put(cam, t, out, { o: SEAMAN, okey: "sea", i: 400 + i, x: 70 - i * 9, y: BOAT_DECK, z: 12.1, expr: "stern", look: 0.8 });
  if (s.set === "office") officeScene(cam, t, out, f, id);
  return out;
};
