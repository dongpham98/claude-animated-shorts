// RMS Titanic at night as a built model (real scale, bow +x, starboard +z, waterline y 0): lofted black hull with
// rows of lit portholes, white superstructure with lit windows, boat deck with deckhouses, 4 buff funnels with black
// tops (raked aft), masts, Welin davits with 16 boats swung out, collapsibles on deck, rail, deck lamps.
// Lifeboats are separate builders so the sea scenes can place them anywhere.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../bridge/build";
import { ctex, planksHD } from "../bridge/paint";
import { twoTone } from "../bridge/shade";
import { SHIP_L, SHELTER, BOAT_DECK, DECK_HALF, FUNNELS, BOAT_X, halfW } from "./story";

// ---------------- textures ----------------
/** hull side: black plating, faint plate seams, two rows of portholes (u = length, v = height 0..SHELTER+2) */
const hullTex = (lit: boolean) => ctex(lit ? "hullLit" : "hullCol", 4096, 256, (g, r) => {
  g.fillStyle = lit ? "#000000" : "#0b0b0f"; g.fillRect(0, 0, 4096, 256);
  if (!lit) { g.fillStyle = "#16161c"; for (let x = 0; x < 4096; x += 30) g.fillRect(x, 0, 2, 256); for (const y of [60, 120, 180]) g.fillRect(0, y, 4096, 2); }
  for (const [y, p] of [[70, 0.75], [130, 0.6], [190, 0.35]] as const) for (let x = 20; x < 4080; x += 11) {
    if (r() > p) continue;
    g.fillStyle = lit ? `rgb(${230 + r() * 25},${190 + r() * 30},${110 + r() * 40})` : "#2a2a30";
    g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill();
  }
});
/** superstructure side: white, window rows (lit) */
const supTex = (lit: boolean) => ctex(lit ? "supLit" : "supCol", 2048, 256, (g, r) => {
  g.fillStyle = lit ? "#000000" : "#eeeae0"; g.fillRect(0, 0, 2048, 256);
  if (!lit) { g.fillStyle = "#d6d1c4"; g.fillRect(0, 124, 2048, 5); g.fillRect(0, 250, 2048, 6); }
  for (const y0 of [40, 165]) for (let x = 10; x < 2040; x += 18) {
    const on = r() < 0.72;
    g.fillStyle = lit ? (on ? `rgb(255,${200 + r() * 30},${120 + r() * 40})` : "#000") : on ? "#f6d58a" : "#3a3a48";
    g.fillRect(x, y0, 10, 26);
  }
});
const houseTex = (lit: boolean) => ctex(lit ? "houseLit" : "houseCol", 1024, 128, (g, r) => {
  g.fillStyle = lit ? "#000000" : "#f1ede4"; g.fillRect(0, 0, 1024, 128);
  for (let x = 12; x < 1010; x += 40) { const on = r() < 0.8; g.fillStyle = lit ? (on ? "#ffd590" : "#000") : on ? "#f6d58a" : "#3a3a48"; g.fillRect(x, 34, 22, 40); }
  if (!lit) { g.fillStyle = "#b9b2a2"; g.fillRect(0, 120, 1024, 8); }
});

const emissiveLam = (key: string, map: THREE.Texture, emap: THREE.Texture, k = 1.6) => {
  const m = twoTone(new THREE.MeshLambertMaterial({ map, emissiveMap: emap, emissive: new THREE.Color(k, k * 0.92, k * 0.78) }));
  m.name = key; return m;
};

// ---------------- hull loft ----------------
const sheer = (x: number) => SHELTER + (x > 0 ? 2.2 * (x / (SHIP_L / 2)) ** 2 : 1.1 * (x / (SHIP_L / 2)) ** 2);
function hullGeo() {
  const xs: number[] = [];
  for (let x = -SHIP_L / 2; x <= SHIP_L / 2 + 0.01; x += 1.5) xs.push(x);
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const Y0 = -2;                                     // just under the waterline (the sea covers the rest)
  // each side: two rows (bottom, top) per station; stern rounded by halfW; bow converges to a point
  for (const s of [1, -1]) {
    const base = pos.length / 3;
    xs.forEach((x, i) => {
      const w = halfW(x) * s, top = sheer(x);
      pos.push(x, Y0, w, x, top, w);
      const u = (x + SHIP_L / 2) / SHIP_L;
      uv.push(u, 0, u, (top - Y0) / (SHELTER + 4));
      if (i) { const a = base + (i - 1) * 2, b = a + 1, c = a + 2, d = a + 3; if (s > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c); }
    });
  }
  // transom (stern) face
  const xb = xs[0], w = halfW(xb), base = pos.length / 3;
  pos.push(xb, Y0, -w, xb, Y0, w, xb, sheer(xb), w, xb, sheer(xb), -w); uv.push(0, 0, 0.01, 0, 0.01, 0.1, 0, 0.1);
  idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
/** the shelter deck as a flat plan following the hull outline */
function deckPlan(y: (x: number) => number, x0: number, x1: number, inset = 0) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  let n = 0;
  for (let x = x0; x <= x1 + 0.01; x += 1.5) {
    const w = Math.max(0.05, halfW(x) - inset);
    pos.push(x, y(x), -w, x, y(x), w); uv.push(x / 6, -w / 6, x / 6, w / 6);
    if (n) { const a = (n - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    n++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// ---------------- lifeboats ----------------
export type BoatKind = "lifeboat" | "cutter";
/** open wooden boat: white outside, varnished inside, thwarts (seats), gunwale. Origin = keel centre, length along x. */
export function boatGeo(kind: BoatKind) {
  const L = kind === "cutter" ? 7.6 : 9.1, B = kind === "cutter" ? 2.1 : 2.75, D = kind === "cutter" ? 0.95 : 1.15;
  const NS = 28, NT = 14, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NS; i++) {
    const s = i / NS, x = (s - 0.5) * L, b = (B / 2) * Math.pow(Math.max(0, 1 - Math.abs(2 * s - 1) ** 2.4), 0.55), sh = 0.18 * (2 * s - 1) ** 2;
    for (let j = 0; j <= NT; j++) {
      const th = (j / NT - 0.5) * Math.PI, z = b * Math.sin(th), y = D + sh - D * Math.pow(Math.cos(th), 0.6) * (1 - 0.25 * (2 * s - 1) ** 4);
      pos.push(x, y, z); uv.push(s * 3, j / NT);
      if (i && j) { const a = (i - 1) * (NT + 1) + j - 1, bb = a + 1, c = a + NT + 1, d = c + 1; idx.push(a, c, bb, bb, c, d); }
    }
  }
  const shell = new THREE.BufferGeometry();
  shell.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  shell.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  shell.setIndex(idx); shell.computeVertexNormals();
  const seats: THREE.BufferGeometry[] = [];
  const nSeat = kind === "cutter" ? 5 : 7;
  for (let k = 0; k < nSeat; k++) {
    const s = 0.16 + (0.68 * k) / (nSeat - 1), x = (s - 0.5) * L, b = (B / 2) * Math.pow(Math.max(0, 1 - Math.abs(2 * s - 1) ** 2.4), 0.55) * 0.94;
    seats.push(boxGeo(V(x - 0.13, D * 0.58, -b), V(x + 0.13, D * 0.64, b)));
  }
  // side benches along the inside
  for (const sd of [-1, 1]) seats.push(boxGeo(V(-L * 0.3, D * 0.55, sd > 0 ? B * 0.3 : -B * 0.42), V(L * 0.3, D * 0.6, sd > 0 ? B * 0.42 : -B * 0.3)));
  return { shell, seats, L, B, D, nSeat };
}
const boatMats = () => ({
  white: twoTone(new THREE.MeshLambertMaterial({ color: "#f3f0e8", side: THREE.FrontSide })),
  wood: twoTone(new THREE.MeshLambertMaterial({ color: "#b98a52", side: THREE.BackSide })),
  seat: lam("boatSeat", () => ({ color: "#a8784a" })),
});
let BM: ReturnType<typeof boatMats> | null = null;
/** a whole boat as a group (keel origin) */
export function makeBoat(kind: BoatKind) {
  BM ??= boatMats();
  const g = boatGeo(kind), grp = new THREE.Group();
  const outer = new THREE.Mesh(g.shell, BM.white), inner = new THREE.Mesh(g.shell, BM.wood);
  const b = new Batch(); for (const s of g.seats) b.add(s, BM.seat); b.build(grp);
  for (const m of [outer, inner]) { m.castShadow = true; m.receiveShadow = true; grp.add(m); }
  grp.userData = { L: g.L, B: g.B, D: g.D };
  return grp;
}

// ---------------- the ship ----------------
export function buildShip(root: THREE.Group) {
  const b = new Batch();
  const hullM = emissiveLam("hull", hullTex(false), hullTex(true), 2.2);
  b.add(hullGeo(), hullM);
  const deckM = lam("tDeck", () => ({ map: planksHD(), color: "#a07e5e" }));
  const whiteM = lam("tWhite", () => ({ color: "#ece8de" }));
  const supM = emissiveLam("sup", supTex(false), supTex(true), 1.8);
  const houseM = emissiveLam("house", houseTex(false), houseTex(true), 1.8);
  // shelter deck (well decks / forecastle / poop simplified to the sheer line)
  b.add(deckPlan(sheer, -SHIP_L / 2, SHIP_L / 2 - 0.3, 0.05), deckM);
  // white superstructure block (A-C decks) from the aft end of the forward well to the poop
  const sx0 = -88, sx1 = 82, sy0 = SHELTER, sy1 = BOAT_DECK, sh = DECK_HALF;
  { // sides with window texture (u along length)
    const L = sx1 - sx0;
    for (const s of [1, -1]) {
      const g = new THREE.PlaneGeometry(L, sy1 - sy0); g.translate((sx0 + sx1) / 2, (sy0 + sy1) / 2, 0);
      const uvA = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uvA.count; i++) uvA.setX(i, uvA.getX(i) * (L / 60));
      if (s < 0) g.rotateY(Math.PI).translate((sx0 + sx1), 0, 0);
      g.translate(0, 0, s * sh);
      b.add(g, supM);
    }
    b.add(boxGeo(V(sx1 - 0.3, sy0, -sh), V(sx1, sy1, sh)), whiteM);
    b.add(boxGeo(V(sx0, sy0, -sh), V(sx0 + 0.3, sy1, sh)), whiteM);
    for (const s of [1, -1]) b.add(boxGeo(V(sx0, sy1 - 0.35, s > 0 ? sh - 0.05 : -sh - 0.15), V(sx1, sy1 - 0.04, s > 0 ? sh + 0.15 : -sh + 0.05)), whiteM); // deck edge strakes
  }
  // boat deck planks
  b.add(boxGeo(V(sx0, sy1 - 0.02, -sh), V(sx1, sy1, sh), 6), deckM);
  // deckhouses (officers' quarters fwd, entrances, gym) with lit windows; the bridge across the front
  const houses: [number, number, number][] = [[60, 80, 5.2], [30, 46, 4.0], [-6, 8, 3.2], [-40, -30, 3.6], [-80, -64, 4.0]];
  for (const [x0, x1, hw] of houses) {
    b.add(boxGeo(V(x0, sy1, -hw), V(x1, sy1 + 2.9, hw)), whiteM);
    for (const s of [1, -1]) {
      const g = new THREE.PlaneGeometry(x1 - x0, 2.6); g.translate((x0 + x1) / 2, sy1 + 1.4, 0);
      const uvA = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uvA.count; i++) uvA.setX(i, uvA.getX(i) * ((x1 - x0) / 16));
      if (s < 0) g.rotateY(Math.PI).translate(x0 + x1, 0, 0);
      g.translate(0, 0, s * (hw + 0.02)); b.add(g, houseM);
    }
  }
  b.add(boxGeo(V(80.5, sy1, -DECK_HALF - 0.8), V(82, sy1 + 2.7, DECK_HALF + 0.8)), houseM); // bridge front + wings
  b.add(boxGeo(V(80.2, sy1 + 2.7, -DECK_HALF - 0.9), V(82.3, sy1 + 2.85, DECK_HALF + 0.9)), whiteM);
  // forecastle and poop raised a deck
  b.add(boxGeo(V(108, sheer(108), -halfW(108) + 0.1), V(SHIP_L / 2 - 6, sheer(108) + 0.4, halfW(108) - 0.1)), deckM);
  // rail along the boat deck edge: posts + top rail
  const railM = lam("tRail", () => ({ color: "#f4f1ea" }));
  for (const s of [1, -1]) {
    b.add(boxGeo(V(sx0, sy1 + 1.05, s * sh - 0.05), V(sx1, sy1 + 1.12, s * sh + 0.05)), railM);
    b.add(boxGeo(V(sx0, sy1 + 0.55, s * sh - 0.03), V(sx1, sy1 + 0.59, s * sh + 0.03)), railM);
    for (let x = sx0; x <= sx1; x += 1.6) b.add(boxGeo(V(x - 0.04, sy1, s * sh - 0.04), V(x + 0.04, sy1 + 1.1, s * sh + 0.04)), railM);
  }
  // funnels: elliptical, buff with black tops, raked aft; the 4th is a dummy (same look)
  const buff = lam("buff", () => ({ color: "#c98a3c" })), black = lam("funTop", () => ({ color: "#1a1a20" }));
  for (const fx of FUNNELS) {
    const m = new THREE.Matrix4().makeRotationZ(0.035).premultiply(new THREE.Matrix4().makeTranslation(fx, sy1 + 2.5, 0));
    const body = new THREE.CylinderGeometry(3.6, 3.6, 15, 32, 1, true).scale(1, 1, 0.74).translate(0, 7.5, 0);
    const top = new THREE.CylinderGeometry(3.62, 3.62, 4.2, 32, 1, true).scale(1, 1, 0.74).translate(0, 17.1, 0);
    const cap = new THREE.CircleGeometry(3.6, 32).rotateX(-Math.PI / 2).scale(1, 1, 0.74).translate(0, 19.1, 0);
    b.add(body, buff, m); b.add(top, black, m); b.add(cap, black, m);
    b.add(boxGeo(V(fx - 4.5, sy1, -3.6), V(fx + 4.5, sy1 + 2.5, 3.6)), whiteM); // casing
  }
  // masts
  const mastM = lam("mast", () => ({ color: "#8a6a44" }));
  for (const [x, h] of [[100, 48], [-104, 44]] as const) b.add(new THREE.CylinderGeometry(0.35, 0.5, h, 10).translate(x, sheer(x) + h / 2, 0), mastM);
  // Welin davits at each station (pair per boat) and collapsibles stowed on deck by the forward cutters
  const davM = lam("davit", () => ({ color: "#eceae4" }));
  for (const bx of BOAT_X) for (const s of [1, -1]) for (const dx of bx === 72 ? [-2.9, 2.9] : [-3.6, 3.6]) {
    const pts = [V(bx + dx, sy1, s * (sh - 0.3)), V(bx + dx, sy1 + 2.3, s * (sh - 0.15)), V(bx + dx, sy1 + 3.1, s * (sh + 0.9)), V(bx + dx, sy1 + 2.5, s * (sh + 2.3))];
    b.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.12, 8, false), davM);
  }
  const canvasM = lam("collapsible", () => ({ color: "#c9c2b0" }));
  for (const s of [1, -1]) for (const [x, k] of [[73.5, 0], [69.5, 1]] as const) b.add(boxGeo(V(x - 4.2, sy1 + (k ? 0 : 0), s * 9.4 - 1.0), V(x + 4.2, sy1 + 0.45, s * 9.4 + 1.0)), canvasM);
  b.build(root);
  // deck lamps: small warm globes on the deckhouse walls (bloom)
  const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(4.0, 3.2, 1.9) });
  const lampG = new THREE.SphereGeometry(0.16, 12, 8), lamps = new THREE.InstancedMesh(lampG, lampM, 80);
  let n = 0; const M = new THREE.Matrix4();
  for (const [x0, x1, hw] of houses) for (let x = x0 + 2; x < x1 - 1 && n < 78; x += 5) for (const s of [1, -1]) { M.makeTranslation(x, sy1 + 2.4, s * (hw + 0.25)); lamps.setMatrixAt(n++, M); }
  lamps.count = n; root.add(lamps);
  // hung boats: 7 lifeboats + 1 cutter per side forward/aft group, swung out from the davits
  const hung: THREE.Group[] = [];
  for (const bx of BOAT_X) for (const s of [1, -1]) {
    const kind: BoatKind = bx === 72 ? "cutter" : "lifeboat", boat = makeBoat(kind);
    boat.position.set(bx, sy1 - 1.0, s * (sh + 2.3)); root.add(boat);
    boat.userData.station = { x: bx, side: s };
    hung.push(boat);
  }
  return { hung, lamps };
}
export { sheer };
