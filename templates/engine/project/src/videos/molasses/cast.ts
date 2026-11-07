// Cast of the molasses short: lit flat cards (cardShade) placed per shot, plus unlit effect cards (drips, rivet
// bursts, buckets, paint). Generic machinery (canvas pool, Actor/Fx meshes, person(), contact blobs, blinks) is the
// bridge short's, unchanged.
import * as THREE from "three";
import { Pen, bodyFront, bodySide, townsfolk, KID, fxBurst, fxCreak, fxSplash, fxShadow, fxContact, fxPuff, Outfit, Expr, FrontOpts, SideOpts, INK, shade } from "../bridge/toon";
import { FPS, SHOTS, V3, TANK, TANK_R, clamp01, smooth, RIVET0, SPLIT, streetFrontZ, KITCHEN, OFFICE, at } from "./story";
import { NOINK } from "../bridge/ink";
import { cardShade, blobMaterial, CARD_K } from "../bridge/cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const FOLK = [0, 1, 2, 3, 4, 5].map((v) => townsfolk(v));
const vOf = (i: number) => (i * 7 + (i >> 2)) % 4;
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

// ---------------- crowd by shot ----------------
// (Stage type defined above)

// ---------------- our cast ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };
/** FxPlace + wall: card standing upright with this yaw (faces +z rotated by yaw), not turned to the camera */
export type WallFx = FxPlace & { wall?: number; tilt?: number };
const FOLKS = [0, 1, 2, 3, 4, 5].map((v) => townsfolk(v));
const GRANNY: Outfit = { ...townsfolk(1), dress: "#6a4c7a", jacket: "#8a6a9a", skin: SKINS2(2) };
const WORKER: Outfit = { jacket: "#3f4e6a", pants: "#3b3f52", boots: "#4a3426", hat: "cap", cap: "#59525e", build: "stout", skin: SKINS2(1) };
const DOCKER: Outfit = { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "cap", cap: "#2f3a4a", skin: SKINS2(3) };
const PAINTER: Outfit = { jacket: "#ece5d2", pants: "#ece5d2", boots: "#5a3b2a", hat: "cap", cap: "#ece5d2", moustache: "#4a3020", skin: SKINS2(0) };
const RESCUER: Outfit = { jacket: "#2f4a6a", pants: "#2f3440", boots: "#1f1a1a", hat: "cap", cap: "#2f4a6a", skin: SKINS2(1) };
function SKINS2(i: number) { return ["#ffe2c2", "#f5c9a0", "#ecd0b6", "#c99067"][i % 4]; }
export { RESCUER };

const LEAD2 = 2 / FPS;
const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

/** a tin pail on a 260 x 260 canvas (full = molasses inside) */
const pail = (p: Pen, full: number) => {
  p.poly([[50, 90], [210, 90], [190, 240], [70, 240]], "#9aa3ad", 9);
  p.poly([[70, 110], [96, 110], [88, 230], [78, 230]], "#c4ccd4", 0);
  p.ell(130, 90, 80, 22, full > 0 ? "#4a200a" : "#5f6770", 9);
  if (full > 0) p.ell(118, 86, 30, 6, "#8a4a1c", 0);
  p.arc(130, 92, 86, 90, 180, 360, 7);
};
/** a cooking pot on a 260 x 200 canvas */
const pot = (p: Pen) => { p.poly([[40, 70], [220, 70], [205, 180], [55, 180]], "#4c4f5a", 9); p.ell(130, 70, 90, 20, "#2a1a10", 9); p.stroke([[20, 80], [40, 82]], 12); p.stroke([[220, 82], [240, 80]], 12); };
/** a molasses drop on a 120 x 200 canvas */
const drop = (p: Pen) => p.poly(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; const r = 40; return [60 + r * Math.sin(a) * (a < Math.PI ? 1 : 1), 130 - r * Math.cos(a) * (Math.cos(a) > 0 ? 2.2 : 1)] as [number, number]; }), "#5a2408", 7);
/** a drip streak down the tank wall on a 120 x 600 canvas */
const streak = (p: Pen, seed: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 12; i++) pts.push([60 + 10 * Math.sin(i * 1.3 + seed), 10 + i * 46]);
  p.line(pts, "#5a2a0e", 26, false);
  p.dot(60 + 10 * Math.sin(12 * 1.3 + seed), 570, 20, "#5a2a0e");
};
/** a flat patch of fresh brown paint on a 400 x 600 canvas */
const paintPatch = (p: Pen) => { const pts: [number, number][] = []; for (let i = 0; i <= 20; i++) pts.push([10 + 380 * i / 20, 20 + 14 * Math.sin(i * 2.1)]); for (let i = 20; i >= 0; i--) pts.push([10 + 380 * i / 20, 580 + 16 * Math.sin(i * 1.7)]); p.poly(pts, "#6b3a1c", 0); };
/** a paint roller on a stick, 300 x 300 */
const roller = (p: Pen) => { p.stroke([[150, 290], [150, 130], [200, 110]], 12); p.poly([[180, 40], [280, 40], [280, 120], [180, 120]], "#6b3a1c", 9); };

/** world point on the tank wall at height y, facing the camera side at angle a (radians, 0 = facing -x) */
export const wallAt = (a: number, y: number, out = 0.04): [number, number, number, number] => {
  const r = TANK_R + out;
  return [TANK[0] - r * Math.cos(a), y, TANK[2] + r * Math.sin(a), a - Math.PI / 2];
};

const runners = (cam: CamInfo, t: number, tw: number, out: Stage) => {
  const zf = streetFrontZ(tw);
  for (let i = 0; i < 8; i++) {
    const x = -6.4 + (i % 4) * 1.55 + (hh(i, 3) - 0.5) * 0.6, z = zf + 5 + (i >> 1) * 1.8 + hh(i, 4) * 1.2 + 3.2 * t;
    const o = i === 5 ? KID : FOLKS[i % 6];
    const fo: FrontOpts = { mode: "stroll", phase: q((t * 2.6 + hh(i, 5)) % 1, 12), expr: i % 3 === 0 ? "shock" : "nervous", blink: 0 };
    out.places.push(person(cam, { i, o, okey: i === 5 ? "kid" : `f${i % 6}` }, x, 0, z, { side: false, mirror: false }, fo, {}, i === 5 ? 0.72 : 1));
    blob(out, x, 0, z, i === 5 ? 0.72 : 1);
  }
};

const streetLife = (cam: CamInfo, t: number, out: Stage) => {
  const spots: [number, number][] = [[-5.2, -2], [-4.6, 3.5], [-5.5, 12], [4.2, 6], [-3.8, -14], [3.4, -20], [-5.0, 22], [16, -6], [19, 2]];
  spots.forEach(([x, z], i) => {
    const o = FOLKS[(i + 2) % 6];
    out.places.push(person(cam, { i: i + 50, o, okey: `f${(i + 2) % 6}` }, x, 0, z, { side: false, mirror: false },
      { mode: "stand", expr: (["smile", "neutral", "smile_closed"] as Expr[])[i % 3], blink: lidAt(t, i + 50) }, {}));
    blob(out, x, 0, z);
  });
};

const bucketQueue = (cam: CamInfo, t: number, out: Stage) => {
  const kidIn = ramp(t, 12.2, 12.55);                                     // steps in on "buckets" (12.39 s)
  const kx = 9.9 + 1.3 * kidIn, kz = -30.6;
  const who: [Outfit, string, number, number, number, Expr, number][] = [
    [GRANNY, "granny", 11.3, -29.55, 1, "smile_closed", 61],
    [WORKER, "worker", 11.0, -31.75, 1, "neutral", 62],
    [KID, "kid", kx, kz, 0.72, t > 13.2 ? "grin" : "smile", 63],
  ];
  for (const [o, k, x, z, sc, expr, i] of who) {
    const step = k === "kid" && kidIn > 0 && kidIn < 1 ? q((t * 3) % 1, 12) : undefined;
    out.places.push(person(cam, { i, o, okey: k }, x, 0, z, { side: false, mirror: false },
      { mode: step === undefined ? "stand" : "stroll", phase: step, expr, blink: lidAt(t, i), look: k === "kid" ? -0.5 : 0 }, {}, sc));
    blob(out, x, 0, z, sc);
  }
  // their containers, held in front at hand height (cards a little toward the lens)
  const toCam = (x: number, z: number, d: number): [number, number] => { const dx = cam.pos.x - x, dz = cam.pos.z - z, l = Math.hypot(dx, dz) || 1; return [x + (dx / l) * d, z + (dz / l) * d]; };
  const full = t > 13.25 ? 1 : 0;
  { const [x, z] = toCam(kx, kz, 0.3); out.fx.push({ key: `pail${full}`, cw: 260, ch: 260, draw: (p) => pail(p, full), x: x + cam.right.x * 0.12, y: 0.52, z: z + cam.right.z * 0.12, w: 0.34, h: 0.34 }); }
  { const [x, z] = toCam(11.3, -29.55, 0.3); out.fx.push({ key: "pot", cw: 260, ch: 200, draw: pot, x, y: 0.82, z, w: 0.42, h: 0.32 }); }
  { const [x, z] = toCam(11.0, -31.75, 0.3); out.fx.push({ key: "pail1", cw: 260, ch: 260, draw: (p) => pail(p, 1), x: x - cam.right.x * 0.2, y: 0.78, z: z - cam.right.z * 0.2, w: 0.38, h: 0.38 }); }
  // the drips: streaks down the seams above each of them, and one fat drop that lands in the kid's pail on "drips"
  const a0 = Math.asin((kz - TANK[2]) / TANK_R);
  for (const [dz, s] of [[0, 1], [1.8, 2], [-2.0, 3]] as const) {
    const a = Math.asin((kz + dz - TANK[2]) / TANK_R), [x, y, z, yaw] = wallAt(a, 2.6);
    out.fx.push({ key: `streak${s}`, cw: 120, ch: 600, draw: (p) => streak(p, s), x, y, z, w: 0.22, h: 2.2, wall: yaw } as WallFx);
  }
  const u = (t - 12.95) / 0.33;
  if (u >= 0 && u < 1) {
    const [x, , z] = wallAt(a0, 0, 0.35);
    out.fx.push({ key: "drop", cw: 120, ch: 200, draw: drop, x: x * 0.4 + kx * 0.6, y: 1.55 - 1.0 * u * u, z, w: 0.09, h: 0.15 });
  }
};

const painterAt = (cam: CamInfo, t: number, out: Stage) => {
  const z = -24.4, a = Math.asin((z - TANK[2]) / TANK_R), [wx, , wz] = wallAt(a, 0, 0.75);
  const proud = t > 16.1;
  out.places.push(person(cam, { i: 70, o: PAINTER, okey: "painter" }, wx, 1.45, wz, { side: false, mirror: false },
    { mode: "stand", expr: proud ? "grin" : "neutral", blink: lidAt(t, 70), look: proud ? 0 : -0.8 }, {}));
  // the leak streak, then the brown patch rolling down over it ("Paint the tank brown"), then a new drip (gag)
  const [sx, sy, sz, yaw] = wallAt(a - 0.05, 3.6);
  out.fx.push({ key: "streak7", cw: 120, ch: 600, draw: (p) => streak(p, 7), x: sx, y: sy, z: sz, w: 0.24, h: 2.4, wall: yaw } as WallFx);
  const k = ramp(t, 14.55, 15.15);
  if (k > 0) { const [px, , pz, py] = wallAt(a - 0.03, 0, 0.06); out.fx.push({ key: "patch", cw: 400, ch: 600, draw: paintPatch, x: px, y: 4.9 - 1.1 * k, z: pz, w: 1.1, h: 2.2 * k, wall: py } as WallFx); }
  if (t > 16.2) { const [x, y, z2, yw] = wallAt(a + 0.035, 3.5, 0.08); const g = ramp(t, 16.2, 16.6); out.fx.push({ key: "streak9", cw: 120, ch: 600, draw: (p) => streak(p, 9), x, y: y + 1.0 * (1 - g), z: z2, w: 0.2, h: 2.0 * g + 0.01, wall: yw } as WallFx); }
  const rk = proud ? 0 : Math.sin(t * 6) * 0.25;
  const [rx, , rz] = wallAt(a - 0.06, 0, 0.5);
  out.fx.push({ key: "roller", cw: 300, ch: 300, draw: roller, x: rx, y: 3.0 + rk, z: rz, w: 0.8, h: 0.8 });
};

const wharfHands = (cam: CamInfo, t: number, out: Stage) => {
  const look = t > 20.35 - LEAD2 && t < 22.5;
  for (const [x, z, i, o] of [[40.6, -11.6, 80, DOCKER], [39.0, -10.2, 81, WORKER], [41.9, -9.4, 82, FOLKS[3]]] as const) {
    out.places.push(person(cam, { i, o, okey: `w${i}` }, x, 0, z, { side: false, mirror: false },
      { mode: "stand", expr: look ? "shock" : t > 24.4 ? "shock" : "neutral", blink: lidAt(t, i), look: look ? 0.6 : 0 }, {}));
    blob(out, x, 0, z);
  }
};

/** rivets shooting out of the seam (machine-gun), on the wall toward the shot 6 lens */
export const RIVET_AT = (i: number): V3 => { const a = Math.asin((-27.4 - TANK[2]) / TANK_R); const [x, , z] = wallAt(a, 0, 0.15); return [x, 5.4 + i * 0.42, z]; };
const rivetFx = (t: number, out: Stage) => {
  for (let i = 0; i < 9; i++) {
    const u = (t - (RIVET0 + i * 0.14)) / 0.3;
    if (u < 0 || u >= 1) continue;
    const [x, y, z] = RIVET_AT(i);
    out.fx.push({ key: `rb${q(u, 15)}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, q(u, 15)), x: x - 0.3 * u, y, z, w: 1.4, h: 1.4 });
    out.fx.push({ key: "rivet", cw: 120, ch: 120, draw: (p) => { p.ell(60, 60, 40, 40, "#3a2a22", 8); p.ell(48, 48, 12, 12, "#9a8a80", 0); }, x: x - 3.2 * u, y: y + 0.6 * u - 1.5 * u * u, z: z + 2.2 * u, w: 0.2, h: 0.2 });
  }
};

/** strain ticks jittering on the wall on "groan" */
const groanFx = (t: number, out: Stage) => {
  for (const [a, y, i] of [[0.55, 6, 0], [0.75, 9.5, 1], [0.95, 4.5, 2]] as const) {
    const [x, , z] = wallAt(a, 0, 0.6), u = q((t * 1.3 + i * 0.37) % 1, 30);
    out.fx.push({ key: `creak${u}`, cw: 300, ch: 300, draw: (p) => fxCreak(p, u), x, y, z, w: 1.8, h: 1.8, rot: i * 0.6 - 0.6 });
  }
};
// ---------------- second half: drawings ----------------
type P2 = [number, number];
const HONEY = "#f2a81c", HONEY_D = "#c9780e";
/** glass honey jar on a 300 x 400 canvas; cold = frost ticks, blob = honey stuck at the lip (0..1 wobble) */
const jar = (p: Pen, cold: boolean, blob: number, level = 0.7) => {
  p.poly([[70, 90], [230, 90], [240, 370], [60, 370]], "rgba(225,240,250,0.55)", 9);
  const y0 = 370 - 270 * level;
  p.poly([[66, y0], [234, y0], [240, 366], [60, 366]], HONEY, 0);
  p.poly([[82, y0 + 10], [104, y0 + 10], [100, 350], [84, 350]], "#ffd36a", 0);
  p.poly([[60, 60], [240, 60], [240, 96], [60, 96]], "rgba(225,240,250,0.7)", 8);
  if (cold) for (let i = 0; i < 9; i++) { const x = 80 + (i % 3) * 60 + (i * 7) % 20, y = 130 + Math.floor(i / 3) * 70; p.stroke([[x, y], [x + 14, y + 14]], 5, "#ffffff"); p.stroke([[x + 14, y], [x, y + 14]], 5, "#ffffff"); }
  if (blob > 0) p.ell(150, 52 - 6 * blob, 46, 30 + 6 * blob, HONEY_D, 7);
};
/** honey stream from the lip to the cup on a 100 x 400 canvas */
const stream = (p: Pen, k: number) => { p.poly([[38, 0], [62, 0], [56 - 6 * k, 400 * k], [44 + 6 * k, 400 * k]], HONEY, 6); };
const cup = (p: Pen, fill: number) => { p.poly([[40, 60], [220, 60], [200, 200], [60, 200]], "#f4efe4", 9); if (fill > 0) p.ell(130, 60 + 10 * (1 - fill), 88, 14, HONEY, 0); p.arc(220, 120, 40, 40, -80, 80, 12); };
const plate = (p: Pen) => { p.ell(150, 60, 140, 34, "#f4efe4", 8); p.ell(150, 56, 90, 18, "#e6dccb", 0); };
const heat = (p: Pen, t: number) => { for (const x of [60, 150, 240]) { const pts: P2[] = []; for (let i = 0; i <= 10; i++) pts.push([x + 16 * Math.sin(i * 1.1 + t * 9 + x), 380 - i * 36]); p.line(pts, "#ffffff", 10); } };
const coldPuff = (p: Pen, t: number) => fxPuff(p, t);
/** "?" bubble on a 240 x 320 canvas */
const question = (p: Pen) => { p.arc(120, 110, 70, 70, 200, 400, 28); p.stroke([[120, 180], [120, 230]], 28); p.dot(120, 285, 20); };
/** street thermometer board on a 260 x 900 canvas; m = mercury 0..1 */
const thermo = (p: Pen, m: number) => {
  p.poly([[20, 20], [240, 20], [240, 880], [20, 880]], "#e9dcc0", 10);
  for (let i = 0; i < 12; i++) { const y = 140 + i * 52; p.stroke([[150, y], [i % 2 ? 180 : 200, y]], 6); }
  p.poly([[100, 90], [140, 90], [140, 720], [100, 720]], "#ffffff", 8);
  const col = m < 0.4 ? "#3f7fd8" : m < 0.6 ? "#c25ad0" : "#e23c2c";
  p.poly([[106, 714 - 600 * m], [134, 714 - 600 * m], [134, 716], [106, 716]], col, 0);
  p.ell(120, 770, 52, 52, col, 9);
};
/** rule book on a 400 x 300 canvas, open (0) .. slammed shut (1) */
const book = (p: Pen, k: number) => {
  if (k < 0.5) { p.poly([[20, 120], [200, 90], [200, 270], [20, 290]], "#f4efe4", 8); p.poly([[200, 90], [380, 120], [380, 290], [200, 270]], "#f4efe4", 8); for (let i = 0; i < 5; i++) { p.stroke([[50, 150 + i * 25], [170, 135 + i * 25]], 4, "#8a8070"); p.stroke([[230, 135 + i * 25], [350, 150 + i * 25]], 4, "#8a8070"); } }
  else { p.poly([[70, 110], [330, 110], [340, 260], [60, 260]], "#2f4a7a", 9); p.poly([[60, 260], [340, 260], [340, 285], [60, 285]], "#f4efe4", 7); p.poly([[180, 150], [220, 150], [220, 220], [180, 220]], "#d9b44a", 0); }
};
/** blueprint on a 700 x 500 canvas: a riveted tank drawing, plus maths, signature and the red seal as they arrive */
const blueprint = (p: Pen, math: boolean, sign: boolean, seal: boolean) => {
  p.poly([[0, 0], [700, 0], [700, 500], [0, 500]], "#2f5fa8", 0);
  const W = "#e9f1ff";
  p.poly([[180, 90], [400, 90], [400, 380], [180, 380]], null, 0);
  p.stroke([[180, 380], [180, 100]], 5, W); p.stroke([[400, 380], [400, 100]], 5, W); p.arc(290, 100, 110, 22, 180, 360, 5, W); p.arc(290, 100, 110, 22, 0, 180, 5, W);
  for (let y = 150; y < 380; y += 55) p.stroke([[180, y], [400, y]], 3, W);
  p.stroke([[140, 380], [440, 380]], 5, W);
  p.stroke([[440, 90], [440, 380]], 3, W); p.stroke([[430, 90], [450, 90]], 3, W); p.stroke([[430, 380], [450, 380]], 3, W);
  if (math) for (let r = 0; r < 4; r++) { const y = 90 + r * 50; const pts: P2[] = []; for (let i = 0; i <= 14; i++) pts.push([480 + i * 13, y + 10 * Math.sin(i * 2.3 + r)]); p.line(pts, W, 5); p.stroke([[480, y + 24], [620 - r * 20, y + 24]], 3, W); }
  if (sign) { const pts: P2[] = []; for (let i = 0; i <= 24; i++) pts.push([470 + i * 7, 440 + 14 * Math.sin(i * 1.4) - i * 0.6]); p.line(pts, "#10172a", 6); }
  if (seal) { p.ell(610, 420, 52, 52, "#d23a2e", 0); p.ell(610, 420, 38, 38, null, 0); p.arc(610, 420, 36, 36, 0, 360, 6, "#ffe2dc"); p.dot(610, 420, 12, "#ffe2dc"); }
};
/** tower crane outside the window on a 600 x 800 canvas */
const crane = (p: Pen) => {
  const Y = "#e8b13a";
  p.poly([[260, 800], [300, 800], [300, 120], [260, 120]], Y, 7);
  for (let y = 140; y < 800; y += 50) p.stroke([[262, y], [298, y + 40]], 4);
  p.poly([[40, 100], [580, 100], [580, 130], [40, 130]], Y, 7);
  p.poly([[40, 130], [110, 130], [110, 180], [40, 180]], "#6a6a72", 7);
  p.stroke([[520, 130], [520, 260]], 4);
};
const beamCard = (p: Pen) => { p.stroke([[150, 0], [150, 60]], 4); p.poly([[20, 60], [280, 60], [280, 100], [20, 100]], "#b8463a", 8); };
const sparkle = (p: Pen) => { p.poly([[60, 0], [72, 48], [120, 60], [72, 72], [60, 120], [48, 72], [0, 60], [48, 48]], "#eaf4ff", 5); };
const smell = (p: Pen, t: number) => { for (const x of [70, 150, 230]) { const pts: P2[] = []; for (let i = 0; i <= 12; i++) pts.push([x + 22 * Math.sin(i * 0.9 + t * 4 + x * 0.03), 560 - i * 42]); p.line(pts, "#ffd7a0", 12); } };

const ENGINEER: Outfit = { jacket: "#5d6a52", pants: "#4a4a52", boots: "#2a2020", hat: "hair", hair: "#3a2a20", moustache: "#3a2a20", skin: SKINS2(2) };
const LOCAL: Outfit = { jacket: "#2f8a8a", pants: "#3b5b9a", boots: "#f1ece0", hat: "hair", hair: "#7a4a2a", skin: SKINS2(3) };

const rescuerScene = (cam: CamInfo, t: number, out: Stage) => {
  const x = -2.3, z = 12.4;
  out.places.push(person(cam, { i: 90, o: RESCUER, okey: "resc" }, x, 0.3, z, { side: false, mirror: false },
    { mode: "stand", expr: t > 37.1 && t < 39.1 ? "nervous" : "neutral", blink: lidAt(t, 90), look: t > 39.2 ? 0.8 : 0 }, {}));
  if (t > 37.15 && t < 39.0) out.fx.push({ key: "q", cw: 240, ch: 320, draw: question, x: x + 0.45, y: 2.55 + 0.05 * Math.sin(t * 6), z, w: 0.45, h: 0.6 });
  // the thermometer swings in on "You see" (39.08 s), mercury jumps on "temperature" (40.38 s)
  const sw = ramp(t, 38.95, 39.45), m = 0.18 + 0.6 * ramp(t, 40.2, 40.55) + 0.06 * Math.sin(clamp01((t - 40.55) / 0.5) * Math.PI * 3) * (t > 40.55 ? 1 : 0);
  if (t > 38.9) out.fx.push({ key: `th${q(m, 40)}`, cw: 260, ch: 900, draw: (p) => thermo(p, q(m, 40)), x: -0.45 + 1.8 * (1 - sw), y: 1.75, z: 11.3, w: 0.62, h: 2.15, rot: 0.5 * (1 - sw) * Math.cos((t - 38.95) * 14) });
};

const kitchenScene = (cam: CamInfo, t: number, out: Stage) => {
  // granny at the table with the cold jar; walks to the stove while the camera glides ("Warm it up" 43.73 s)
  const walk = ramp(t, 43.2, 43.75), gx = -0.55 + 1.6 * walk, gz = -2.3;
  const [x, , z] = at(KITCHEN, gx, 0, gz);
  out.places.push(person(cam, { i: 95, o: GRANNY, okey: "granny" }, x, 0, z, { side: false, mirror: false },
    { mode: walk > 0 && walk < 1 ? "stroll" : "stand", phase: walk > 0 && walk < 1 ? q((t * 2.4) % 1, 12) : undefined,
      expr: t < 42.9 ? "nervous" : t < 44.6 ? "stern" : "smile_closed", blink: lidAt(t, 95) }, {}));
  const toCam = (p: V3, d: number): V3 => { const dx = cam.pos.x - p[0], dz = cam.pos.z - p[2], l = Math.hypot(dx, dz) || 1; return [p[0] + (dx / l) * d, p[1], p[2] + (dz / l) * d]; };
  out.fx.push({ key: "plate", cw: 300, ch: 120, draw: plate, ...xyz(at(KITCHEN, -0.25, 0.83, -1.45)), w: 0.36, h: 0.14 });
  if (t < 43.5) {
    // tipped over the plate on "barely moves": the honey sits in the jar, one blob clings to the lip
    const tip = 2.3 * ramp(t, 42.35, 42.75), blob = t > 42.6 ? 1 + 0.15 * Math.sin(t * 7) : 0;
    const j = toCam(at(KITCHEN, -0.2, 1.05 + 0.08 * (tip > 0 ? 1 : 0), -1.75), 0.15);
    out.fx.push({ key: `jar_c_${q(blob, 10)}`, cw: 300, ch: 400, draw: (p) => jar(p, true, q(blob, 10)), x: j[0], y: j[1], z: j[2], w: 0.22, h: 0.29, rot: -tip });
    if (t < 42.3) { const u = q((t * 0.7) % 1, 15); out.fx.push({ key: `cp${u}`, cw: 300, ch: 300, draw: (p) => coldPuff(p, u), x: j[0], y: j[1] + 0.22, z: j[2], w: 0.3, h: 0.3, soft: true }); }
  } else {
    const pour = ramp(t, 44.55, 44.8), tip = 2.0 * pour;
    const jp: V3 = pour > 0 ? at(KITCHEN, 1.55, 1.12, -2.1) : at(KITCHEN, 1.75, 1.0, -2.45);
    out.fx.push({ key: "jar_w", cw: 300, ch: 400, draw: (p) => jar(p, false, 0, 0.7 - 0.25 * ramp(t, 44.8, 45.3)), x: jp[0], y: jp[1], z: jp[2], w: 0.22, h: 0.29, rot: -tip });
    if (pour < 1) { const u = q((t * 1.2) % 1, 12); out.fx.push({ key: `heat${u}`, cw: 300, ch: 400, draw: (p) => heat(p, u), ...xyz(at(KITCHEN, 1.75, 1.32, -2.45)), w: 0.3, h: 0.4, soft: true }); }
    const cp = at(KITCHEN, 1.62, 0.95, -1.98), fill = ramp(t, 44.85, 45.35);
    out.fx.push({ key: `cup${q(fill, 8)}`, cw: 260, ch: 220, draw: (p) => cup(p, q(fill, 8)), x: cp[0], y: cp[1], z: cp[2], w: 0.16, h: 0.135 });
    if (pour >= 1) { const k = q(ramp(t, 44.8, 44.9), 6); out.fx.push({ key: `str${k}`, cw: 100, ch: 400, draw: (p) => stream(p, k), x: cp[0] - 0.04, y: cp[1] + 0.12, z: cp[2], w: 0.03, h: 0.12 }); }
  }
};
const xyz = (v: V3) => ({ x: v[0], y: v[1], z: v[2] });

const stuckScene = (cam: CamInfo, t: number, out: Stage) => {
  const men: [number, number, number, number, Expr][] = [[-3.5, 13.8, 0.12, 0.1, "pained"], [-2.3, 13.1, 0.2, -0.12, "nervous"], [-1.05, 14.2, 0.16, -0.18, "pained"]];
  men.forEach(([x, z, sink, lean, expr], i) => {
    const tug = Math.sin(t * 5 + i * 1.7) * 0.04 * (t > 48.6 ? 1 : 0.4);
    out.places.push({ ...person(cam, { i: 100 + i, o: RESCUER, okey: "resc" }, x, 0.55 - 0.35 - sink, z, { side: false, mirror: false },
      { mode: "stand", expr, blink: lidAt(t, 100 + i), tilt: lean }, {}), roll: lean + tug });
  });
  for (let i = 0; i < 14; i++) {
    const tw = q(0.5 + 0.5 * Math.sin(t * 3 + i * 2.1), 8);
    if (tw < 0.3) continue;
    out.fx.push({ key: "spk", cw: 120, ch: 120, draw: sparkle, x: -5 + (i % 7) * 1.3 + hh(i, 21) * 0.6, y: 0.62, z: 11.5 + Math.floor(i / 7) * 3 + hh(i, 22) * 1.5, w: 0.12 * tw, h: 0.12 * tw });
  }
};

const officeScene = (cam: CamInfo, t: number, out: Stage) => {
  const [x, , z] = at(OFFICE, 0.15, 0, -2.15);
  const signing = t > 54.9 && t < 55.9;
  out.places.push(person(cam, { i: 110, o: ENGINEER, okey: "eng" }, x, 0, z, { side: false, mirror: false },
    { mode: "stand", expr: t > 55.6 ? "smile_closed" : signing ? "stern" : t > 52.4 && t < 53.3 ? "shock" : "neutral", blink: lidAt(t, 110), look: t > 53.5 ? -0.6 : 0 }, {}));
  // rule book slams shut on "changed" (52.43 s)
  const bk = t > 52.4 ? 1 : 0;
  out.fx.push({ key: `book${bk}`, cw: 400, ch: 300, draw: (p) => book(p, bk), ...xyz(at(OFFICE, -1.6, 0.9, -0.95)), w: 0.5, h: 0.38 });
  // blueprint on the tilted board: maths on "math" (54.75), signature on "sign" (55.25), seal on "plans" (55.62)
  const mth = t > 54.7, sg = t > 55.2, sl = t > 55.55;
  out.fx.push({ key: `bp${+mth}${+sg}${+sl}`, cw: 700, ch: 500, draw: (p) => blueprint(p, mth, sg, sl), ...xyz(at(OFFICE, 0, 1.09, -1.33)), w: 1.25, h: 0.9, wall: 0, tilt: Math.PI / 2 - 0.45 } as WallFx);
  // crane outside lifts a beam on "built" (56.97 s)
  out.fx.push({ key: "crane", cw: 600, ch: 800, draw: crane, ...xyz(at(OFFICE, 2.6, 4.0, -14)), w: 6, h: 8, wall: 0 } as WallFx);
  const up = ramp(t, 56.6, 57.3);
  out.fx.push({ key: "beam", cw: 300, ch: 100, draw: beamCard, ...xyz(at(OFFICE, 4.2, 4.0 + 2.6 * up, -13.9)), w: 1.6, h: 0.55, wall: 0 } as WallFx);
};

const summerScene = (cam: CamInfo, t: number, out: Stage) => {
  const k = ramp(t, 57.3, 59.4), x = 16.6 + 4.2 * k, z = -21.5 - 3.4 * k;
  const walking = k > 0 && k < 1;
  out.places.push(person(cam, { i: 120, o: LOCAL, okey: "local" }, x, 0, z, { side: false, mirror: false },
    { mode: walking ? "stroll" : "stand", phase: walking ? q((t * 2.2) % 1, 12) : undefined, expr: t > 60.6 ? "smile_closed" : t > 59.5 ? "smile" : "neutral", blink: t > 60.6 ? 1 : lidAt(t, 120), headTilt: t > 59.8 ? 0.12 : 0 }, {}));
  blob(out, x, 0, z);
  if (t > 60.45) {
    const u = q((t * 0.9) % 1, 12);
    for (const [dx, dz] of [[-0.9, 0.6], [0.8, 0.9], [0.1, -0.6]] as const)
      out.fx.push({ key: `sm${u}`, cw: 300, ch: 600, draw: (p) => smell(p, u), x: x + dx, y: 0.9 + 0.3 * ramp(t, 60.45, 61.0), z: z + dz, w: 0.55, h: 1.1, soft: true });
  }
};

export const stage = (id: number, t: number, tw: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light === "night" ? "day" : s.light;
  findSun(cam, SUN);
  if (s.crowd === "runners") runners(cam, t, tw, out);
  if (s.crowd === "street") streetLife(cam, t, out);
  if (s.crowd === "buckets") bucketQueue(cam, t, out);
  if (s.crowd === "painter") painterAt(cam, t, out);
  if (s.crowd === "wharf") wharfHands(cam, t, out);
  if (s.crowd === "rescuer") rescuerScene(cam, t, out);
  if (s.crowd === "kitchen") kitchenScene(cam, t, out);
  if (s.crowd === "stuck") stuckScene(cam, t, out);
  if (s.crowd === "office") officeScene(cam, t, out);
  if (s.crowd === "summer") summerScene(cam, t, out);
  if (id === 6) rivetFx(t, out);
  if (id === 8) {                                                     // the truck's splash in the harbor ("harbor")
    const u = (t - 32.95) / 1.1;
    if (u >= 0 && u < 1) out.fx.push({ key: `splash${q(u, 30)}`, cw: 800, ch: 800, draw: (p) => fxSplash(p, q(u, 30)), x: 53, y: -1.5 + 4.6, z: 41, w: 11.5, h: 11.5 });
  }
  if (id === 9) out.fx.push({ key: "pail0", cw: 260, ch: 260, draw: (p) => pail(p, 0), x: -2.2, y: 0.85, z: 17, w: 0.55, h: 0.55, rot: 1.45 });
  if (id === 5 && t > 20.3 && t < 21.9) groanFx(t, out);
  return out;
};
export { FPS, clamp01, SPLIT, INK, shade, bodySide, fxPuff };
export type { SideOpts };
