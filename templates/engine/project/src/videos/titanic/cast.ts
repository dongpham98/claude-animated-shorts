// Who stands where in each pilot shot (cards + effect cards), as a pure function of shot id and frame.
import { Pen, Outfit, Expr, fxPuff, INK } from "./toon";
import { person, blob, lidAt, hh, q, Stage, WallFx, CamInfo, setLight } from "./castcore";
import { CAST } from "./castdefs";
import { SHOTS, FPS, V3, at, ramp, BOAT_DECK, BOAT1, SEA_B1, OFFICE, boat1Y, SEA6, A } from "./story";
import { boatsFor, seatsOf, CARP } from "./scenes";

const C = (k: string) => CAST[k];
const STOKER: Outfit = { jacket: "#3a3a44", pants: "#2a2a30", boots: "#17141c", hat: "flatcap", cap: "#2a2a30", skin: "#ecd0b6" };
const SEAMAN: Outfit = { jacket: "#24305a", pants: "#1b2340", boots: "#17141c", hat: "cap", cap: "#24305a", skin: "#f5c9a0" };
const COMMISSIONER: Outfit = { jacket: "#1d1a22", dress: "#1d1a22", coat: true, pants: "#1d1a22", boots: "#111", hat: "hair", hair: "#f1efe9",
  hairSide: "#f1efe9", buttons: "#111", collar: "#f4f1ea", build: "stout", skin: "#ffe2c2" };
const PAX: Outfit[] = [C("firstwoman").o, C("firstman").o, C("steward").o, { ...C("firstwoman").o, dress: "#6a3a4a", jacket: "#7a4a5a", cap: "#3a2a3a", band: "#e8c45a" },
  { ...C("firstman").o, hat: "bowler", jacket: "#3a3540", dress: "#3a3540" }, { ...C("firstwoman").o, dress: "#4a5a3a", jacket: "#5a6a4a", hat: "bonnet" },
  { ...C("thirdman").o, lifebelt: true }, { ...C("thirdwoman").o, lifebelt: true }];

type P = { o: Outfit; okey: string; i: number; x: number; y: number; z: number; expr?: Expr; sit?: boolean; scale?: number; look?: number; prop?: string; seed?: number; facing?: -1 | 0 | 1; wave?: number; side?: boolean; tilt?: number; headTilt?: number; walk?: number };
const put = (cam: CamInfo, t: number, out: Stage, p: P, swaps: number[] = []) => {
  const fo = { mode: p.sit ? "sit" : p.walk !== undefined ? "stroll" : "stand", phase: p.walk, headTilt: p.headTilt ?? 0, expr: p.expr ?? "neutral", blink: lidAt(t, p.i, swaps), look: p.look ?? 0, seed: p.seed ?? ((p.i * 5 + 3) % 7) + 1,
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
const radioSet = (p: Pen) => {
  p.poly([[20, 60], [300, 60], [300, 280], [20, 280]], "#3a2a22", 10); p.poly([[330, 120], [480, 120], [480, 280], [330, 280]], "#2a2a30", 10);
  for (let i = 0; i < 3; i++) p.ell(80 + i * 80, 140, 26, 26, "#c9a24a", 6);
  p.poly([[60, 200], [260, 200], [260, 240], [60, 240]], "#151217", 5); p.stroke([[380, 120], [380, 30], [440, 10]], 8, INK); p.ell(405, 200, 30, 30, "#7a6a5a", 6);
};
const banner = (p: Pen) => { p.poly([[20, 30], [1180, 30], [1180, 270], [20, 270]], "#f4ecd6", 12); txt(p, "SAFETY OF LIFE AT SEA", 600, 110, 84, "#1d2a5e"); txt(p, "LONDON · 1913–1914", 600, 205, 56, "#c0353a"); };
const ropeLadder = (p: Pen) => { for (const x of [40, 160]) p.stroke([[x, 0], [x, 1000]], 10, "#b9a27a"); for (let y = 30; y < 1000; y += 70) p.stroke([[40, y], [160, y]], 12, "#8a6a44"); };

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

// ---------------- chapters 2-10 ----------------
const BLANKET: Outfit = { jacket: "#8a8478", dress: "#8a8478", pants: "#5a5650", boots: "#2a2420", hat: "hair", hair: "#5a4030", skin: "#ecd0b6" };
const BOSS = (k: number): Outfit => ({ jacket: k ? "#2e2a36" : "#3a3540", dress: k ? "#2e2a36" : "#3a3540", coat: true, pants: "#22202a", boots: "#111", hat: "hair",
  hair: k ? "#c9c6c0" : "#3a2a20", moustache: k ? "#e8e4dc" : "#3a2a20", build: "stout", buttons: "#222", skin: k ? "#ffe2c2" : "#f5c9a0" });
const DELEGATE = (k: number): Outfit => ({ ...BOSS(k % 2), jacket: ["#2e2a36", "#3a3540", "#2a3040", "#3a2e2a", "#30302e"][k % 5], hair: ["#c9c6c0", "#3a2a20", "#6a4a30", "#2a201a", "#a8a49c"][k % 5], moustache: k % 3 ? "#3a2a20" : undefined });
const WOMEN = [C("firstwoman").o, PAX[3], PAX[5], C("thirdwoman").o, { ...C("firstwoman").o, dress: "#5a3a6a", jacket: "#6a4a7a" }];
const MEN = [C("firstman").o, PAX[4], C("thirdman").o, STOKER, C("steward").o];
const lift = (cam: CamInfo, t: number, out: Stage, list: [Outfit, string, number, V3, Expr, Partial<P>?][]) =>
  list.forEach(([o, okey, i, [x, y, z], expr, extra]) => put(cam, t, out, { o, okey, i, x, y, z, expr, ...(extra ?? {}) }));
const seatBoats = (cam: CamInfo, t: number, out: Stage, scene: string, f: number, a: number) => {
  boatsFor(scene, f, a).forEach((b, k) => {
    const cap = b.who === "boat14" ? 18 : 16, n = Math.min(b.n, cap);
    if (b.flip) { // collapsible B: men standing on the upturned hull, two rows
      for (let i = 0; i < n; i++) { const r = i % 2, dx = -3.4 + (6.8 * Math.floor(i / 2)) / Math.max(1, Math.floor(n / 2) - 1), c = Math.cos(b.yaw), sn = Math.sin(b.yaw), dz = r ? 0.35 : -0.35;
        put(cam, t, out, { o: i === n - 1 ? C("lightoller").o : MEN[i % MEN.length], okey: i === n - 1 ? "light" : `men${i % MEN.length}`, i: 700 + i, x: b.x + dx * c + dz * sn, y: b.y + 0.12, z: b.z - dx * sn + dz * c,
          expr: i % 3 ? "stern" : "nervous", scale: 0.85, tilt: 0.04 * Math.sin(t * 1.3 + i), seed: i === n - 1 ? 23 : undefined }); }
      return;
    }
    const seats = seatsOf(b, n);
    seats.forEach(([x, y, z], i) => {
      let o: Outfit, okey: string, expr: Expr = "neutral";
      if (b.who === "seamen" || b.who === "rowers") { o = i % 2 ? SEAMAN : STOKER; okey = i % 2 ? "sea" : "stk"; expr = "stern"; }
      else if (b.who === "boat1") { o = [STOKER, SEAMAN, C("cosmo").o, C("lucy").o, C("firstwoman").o][i % 5]; okey = `b1_${i % 5}`; }
      else if (b.who === "collA") { o = i % 4 === 0 ? C("thirdwoman").o : MEN[i % MEN.length]; okey = `ca${i % 5}`; expr = i % 2 ? "pained" : "nervous"; }
      else { const w = (i + k) % 3 !== 0; o = w ? WOMEN[(i + k) % WOMEN.length] : MEN[(i + k) % MEN.length]; okey = w ? `w${(i + k) % WOMEN.length}` : `m${(i + k) % MEN.length}`; expr = (["nervous", "neutral", "stern"] as Expr[])[i % 3]; }
      const sunk = b.swamp ? -0.1 : 0;
      put(cam, t, out, { o, okey, i: 600 + k * 40 + i, x, y: y + sunk - 0.12, z, expr, sit: true, scale: 0.82 });
    });
    if (b.who === "boat14" || b.who === "rowers") { // Lowe standing at the tiller (stern = -x in boat space)
      const c = Math.cos(b.yaw), sn = Math.sin(b.yaw);
      put(cam, t, out, { o: C("lowe").o, okey: "lowe", i: 690, x: b.x - 3.9 * c, y: b.y + 0.55, z: b.z + 3.9 * sn, expr: "stern", seed: 44, scale: 0.9 });
      if (scene === "lantern") for (let i = 0; i < 3; i++)
        put(cam, t, out, { o: BLANKET, okey: "blanket", i: 695 + i, x: b.x - (2.6 - 0.7 * i) * c + 0.5 * sn, y: b.y + 0.45, z: b.z + (2.6 - 0.7 * i) * sn + 0.5 * c, expr: i === 1 ? "dazed" : "pained", sit: true, scale: 0.82 });
    }
  });
};
const stage2 = (cam: CamInfo, t: number, out: Stage, f: number, id: number) => {
  const sh = SHOTS[id - 1], sc = sh.scene ?? "", O = OFFICE, BD = BOAT_DECK;
  seatBoats(cam, t, out, sc, f, sh.a);
  switch (sc) {
    case "belfastCarlisle": put(cam, t, out, { o: C("carlisle").o, okey: "carlisle", i: 140, x: O[0] - 0.9, y: 0, z: O[2] - 1.2, expr: "smile", seed: 72, facing: 1, prop: "scroll" });
      out.fx.push({ key: "bp1", cw: 800, ch: 580, draw: (p) => blueprint(p, 1), ...xyz(at(O, 0.5, 1.1, -1.35)), w: 1.3, h: 0.94, wall: 0, tilt: Math.PI / 2 - 0.5 } as WallFx); break;
    case "meeting":
      put(cam, t, out, { o: C("carlisle").o, okey: "carlisle", i: 140, x: O[0] - 1.1, y: 0, z: O[2] - 1.0, expr: "smile", seed: 72, facing: 1, prop: "scroll" });
      put(cam, t, out, { o: BOSS(0), okey: "boss0", i: 141, x: O[0] + 1.4, y: 0, z: O[2] - 1.5, expr: f > A(62, 4) ? "neutral" : "smile", seed: 3, facing: -1, look: -0.6 });
      put(cam, t, out, { o: BOSS(1), okey: "boss1", i: 142, x: O[0] + 2.3, y: 0, z: O[2] - 0.9, expr: "smile_closed", seed: 5, facing: -1, look: -0.6 });
      out.fx.push({ key: "bp0", cw: 800, ch: 580, draw: (p) => blueprint(p, 0), ...xyz(at(O, 0.5, 1.1, -1.35)), w: 1.3, h: 0.94, wall: 0, tilt: Math.PI / 2 - 0.5 } as WallFx); break;
    case "inquiryCarlisle": case "inquiryEmpty": case "inquiryCosmo": {
      put(cam, t, out, { o: COMMISSIONER, okey: "comm", i: 130, x: O[0] - 2.6, y: 0.9, z: O[2] - 2.4, expr: sc === "inquiryEmpty" ? "stern" : "neutral", seed: 12, prop: sc === "inquiryEmpty" ? "ledger" : undefined });
      if (sc === "inquiryCarlisle") put(cam, t, out, { o: C("carlisle").o, okey: "carlisle", i: 140, x: O[0] + 0.9, y: 0, z: O[2] - 0.6, expr: f > A(59, 2) ? "smile" : "neutral", seed: 72, facing: -1, look: -0.7 });
      if (sc === "inquiryCosmo") put(cam, t, out, { o: { ...C("cosmo").o, lifebelt: false }, okey: "cosmo", i: 150, x: O[0] + 0.9, y: 0, z: O[2] - 0.6, expr: f > A(176) ? "relief" : "nervous", seed: 91, facing: -1, look: -0.7 });
      out.fx.push({ key: "cal1912", cw: 400, ch: 500, draw: (p) => calendar(p, "1912"), ...xyz(at(O, 1.3, 2.2, -2.88)), w: 0.7, h: 0.88, wall: 0 } as WallFx); break;
    }
    case "wireless": {
      const heard = f >= A(212, 6);
      put(cam, t, out, { o: C("cottam").o, okey: "cottam", i: 160, x: O[0] - 0.35, y: 0.05, z: O[2] - 1.85, expr: heard ? "shock" : "neutral", sit: true, seed: 61, look: heard ? 0.6 : -0.4 }, [A(212, 6) / FPS]);
      if (f >= A(213)) put(cam, t, out, { o: C("rostron").o, okey: "rostron", i: 161, x: O[0] + 1.5 - 0.6 * ramp(f, A(213), A(213) + 25), y: 0, z: O[2] - 1.0, expr: "stern", seed: 57, facing: -1, walk: f < A(213) + 25 ? (f / 14) % 1 : undefined });
      out.fx.push({ key: "radio", cw: 500, ch: 300, draw: radioSet, ...xyz(at(O, -0.35, 1.05, -2.42)), w: 1.1, h: 0.66, wall: 0 } as WallFx); break;
    }
    case "conference":
      for (let k = 0; k < 6; k++) put(cam, t, out, { o: DELEGATE(k), okey: `del${k}`, i: 170 + k, x: O[0] - 3 + k * 1.2, y: 0, z: O[2] - 2.6, expr: (["neutral", "smile", "stern"] as Expr[])[k % 3], seed: 3 + k * 7, look: (k - 2.5) * -0.2 });
      out.fx.push({ key: "banner", cw: 1200, ch: 300, draw: banner, ...xyz(at(O, 0, 2.75, -2.88)), w: 4.0, h: 1.0, wall: 0 } as WallFx); break;
    case "ledgerAgain": out.fx.push({ key: "ledger10", cw: 1024, ch: 680, draw: (p) => ledger(p, true, 0), ...xyz(at(O, 0, 0.93, -0.5)), w: 1.1, h: 0.73, flat: true, rot: 0 }); break;
    case "davitClose": put(cam, t, out, { o: SEAMAN, okey: "sea", i: 410, x: 57.6, y: BD, z: 12.4, expr: "stern", look: 0.8 }); break;
    case "clipShort": case "clipPractice": {
      const q2 = sc === "clipShort" ? f >= A(69) : f >= A(79, 4);
      put(cam, t, out, { o: C("clipboard").o, okey: "clip", i: 100, x: CB[0], y: CB[1], z: CB[2], expr: q2 ? "smile" : "stern", seed: 31, facing: 1, prop: q2 ? undefined : "clipboard", wave: q2 ? 0.5 : undefined });
      for (let i = 0; i < 3; i++) put(cam, t, out, { o: PAX[(i + 2) % PAX.length], okey: `pax${(i + 2) % PAX.length}`, i: 330 + i, x: 52 - i * 2.6, y: BD, z: 11.4 + (i % 2) * 0.9, expr: "neutral", look: 0.7 });
      break;
    }
    case "sailors": lift(cam, t, out, [[SEAMAN, "sea", 420, [63, BD, 12.2], "grin"], [STOKER, "stk", 421, [64.8, BD, 11.8], "smile"], [SEAMAN, "sea", 422, [61.6, BD, 11.4], "smile_closed"]]); break;
    case "deckCalm": for (let i = 0; i < 9; i++) put(cam, t, out, { o: PAX[i % PAX.length], okey: `pax${i % PAX.length}`, i: 440 + i, x: 46 + (i % 5) * 2.4 + hh(i, 2), y: BD, z: 6.4 + (i % 3) * 1.6, expr: (["smile", "laugh", "smile_closed", "neutral"] as Expr[])[i % 4], facing: i % 2 ? 1 : -1 }); break;
    case "railPOV": for (let i = 0; i < 5; i++) put(cam, t, out, { o: PAX[i % PAX.length], okey: `pax${i % PAX.length}`, i: 455 + i, x: 45.5 + i * 1.3, y: BOAT_DECK, z: 12.7, expr: "nervous", look: 0.8, scale: 1 }); break;
    case "deckNo": for (let i = 0; i < 4; i++) { const no = f >= A(101, 2); put(cam, t, out, { o: PAX[i * 2 % PAX.length], okey: `pax${i * 2 % PAX.length}`, i: 460 + i, x: 52 + i * 1.3, y: BD, z: 11.5 + (i % 2) * 0.5, expr: no ? "stern" : "nervous", headTilt: no ? 0.12 * Math.sin(f * 0.5 + i) : 0, look: no ? 0 : 0.8 }); } break;
    case "deckInside": for (let i = 0; i < 6; i++) { const k = ramp(f, sh.a + i * 6, sh.b); put(cam, t, out, { o: PAX[(i + 1) % PAX.length], okey: `pax${(i + 1) % PAX.length}`, i: 470 + i, x: 45 - 4 * k - i * 0.6, y: BD, z: 8.5 - 3.6 * k + (i % 2) * 0.5, expr: f > A(106) ? "smile_closed" : "smile", walk: (f / 14 + i * 0.3) % 1 }); } break;
    case "murdochDavit": lift(cam, t, out, [[C("murdoch").o, "murdoch", 480, [48.2, BD, 12.4], f > A(110) ? "nervous" : "stern", { seed: 12, look: 0.6 }], [SEAMAN, "sea", 481, [46.4, BD, 12.6], "stern"], [STOKER, "stk", 482, [50, BD, 12.9], "stern"]]); break;
    case "orderTrio": lift(cam, t, out, [[C("smith").o, "smith", 490, [76.4, BD, 0.2], f > A(121) ? "stern" : "neutral", { seed: 4 }], [C("lightoller").o, "light", 491, [74.6, BD, 1.8], f > A(123) ? "nervous" : "stern", { seed: 23, facing: 1 }],
      [C("murdoch").o, "murdoch", 492, [77.9, BD, 1.9], "stern", { seed: 12, facing: -1 }]]); break;
    case "stbdLoad": case "portLoad": {
      const s2 = sc === "stbdLoad" ? 1 : -1, menIn = sc === "stbdLoad" && f >= A(125, 4);
      put(cam, t, out, { o: C(sc === "stbdLoad" ? "murdoch" : "lightoller").o, okey: sc === "stbdLoad" ? "murdoch" : "light", i: 500, x: 57.6, y: BD, z: s2 * 12.3, expr: "stern", seed: sc === "stbdLoad" ? 12 : 23, wave: sc === "portLoad" && f > A(127) ? 0.9 : undefined });
      // the hung boat at station 56 with its people (women first; men fill starboard only)
      const boat = { kind: "lifeboat" as const, x: 56, y: BD - 1.0, z: s2 * 15.5, yaw: 0, n: 0 };
      const nw = sc === "stbdLoad" ? 7 : 6, seats = seatsOf(boat, 16);
      for (let i = 0; i < nw + (menIn ? 6 : 0); i++) { const [x, y, z] = seats[i], man = i >= nw; put(cam, t, out, { o: man ? MEN[i % MEN.length] : WOMEN[i % WOMEN.length], okey: man ? `m${i % MEN.length}` : `w${i % WOMEN.length}`, i: 510 + i, x, y: y - 0.12, z, sit: true, scale: 0.82, expr: "nervous" }); }
      // men waiting on deck
      for (let i = 0; i < (menIn ? 1 : 4); i++) put(cam, t, out, { o: MEN[i % MEN.length], okey: `m${i % MEN.length}`, i: 530 + i, x: 53 + i * 1.2, y: BD, z: s2 * (10.6 - (i % 2) * 0.8), expr: sc === "portLoad" ? "pained" : "nervous" });
      break;
    }
    case "boat1Ship": case "boat1Dark": {
      const b = boatsFor(sc, f, sh.a)[0];
      if (sc === "boat1Dark") { out.places.length = 0; boat1Crew(cam, t, out, [b.x, b.y, b.z], b.yaw); }
      break;
    }
    case "ladder": {
      out.fx.push({ key: "ropeLadder", cw: 200, ch: 1000, draw: ropeLadder, x: CARP[0] - 8, y: 4.6, z: CARP[2] + 9.85, w: 0.9, h: 9, wall: 0 } as WallFx);
      const k = ramp(f, sh.a + 20, sh.b - 10);
      put(cam, t, out, { o: C("firstwoman").o, okey: "w0", i: 560, x: CARP[0] - 8, y: 1.2 + 6 * k, z: CARP[2] + 10.3, expr: "relief", scale: 0.85, walk: (f / 10) % 1 });
      for (let i = 0; i < 3; i++) put(cam, t, out, { o: SEAMAN, okey: "sea", i: 565 + i, x: CARP[0] - 11 + i * 2.6, y: 9.6, z: CARP[2] + 9.2, expr: "smile", scale: 0.9 });
      break;
    }
  }
  if (sc === "boat1Ship" || sc === "southBoat" || sc === "southWide") { /* seated by seatBoats */ }
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
  if (id > 20) { setLight(s.light === "lamp" || s.light === "dawn" ? "golden" : "day", cam); stage2(cam, t, out, f, id); return out; }
  if (s.set === "office") officeScene(cam, t, out, f, id);
  return out;
};
