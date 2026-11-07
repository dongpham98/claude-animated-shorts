// Boston's North End waterfront, January 1919, as one three.js scene posed per frame (pure function of shot id + f):
// sky, harbor, Commercial Street with its brick rows and the elevated railway, the wharf yard with the molasses tank
// (24 riveted panels that burst outward at the split), the firehouse, a truck, a cargo ship with its delivery pipe,
// snow patches, and the molasses wave (a polar height field around the tank, glossy dark amber, inked by the post).
// Sky, light rig, clouds and water shading are the bridge short's (shared modules), re-pointed at this place.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, house, prop, Kit } from "../bridge/build";
import { ctex, rep, cobbleHD, stoneHD, planksHD, beamHD, waterNear, waterFar, cloudHD } from "../bridge/paint";
import { Pen } from "../bridge/toon";
import { LightPreset } from "../bridge/lights";
import { LIGHTS3 as LIGHTS, LOOK3 as LOOK, L3 } from "./lights2";
import { TONE, CHAR, LFB, twoTone, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx, stage, WallFx } from "./cast";
import {
  FPS, SHOTS, ShotDef, V3, camAt, waveTime, waveH, waveCrest, TANK, TANK_R, TANK_H, QUAY_X, WATER_Y, FIREHOUSE, smooth, clamp01, SPLIT, KITCHEN, OFFICE,
} from "./story";

export const loadKit = () => Promise.resolve({} as Kit);

// ---------------- painted textures ----------------
/** riveted steel plates around the whole tank (u = angle, v = height): 28 plates around x 5 courses, rivet rows on
 *  every seam; grey version carries old brown leak streaks, brown version is the company's paint job */
const tankTex = (brown: boolean) => ctex(brown ? "tankBrown" : "tankGrey", 4096, 768, (g, r) => {
  const W = 4096, H = 768, base = brown ? ["#6e3b1d", "#73401f", "#683619"] : ["#9aa1a8", "#a3a9af", "#949ba3"];
  for (let c = 0; c < 28; c++) for (let k = 0; k < 5; k++) {
    g.fillStyle = base[(c + k) % 3]; g.fillRect((c * W) / 28, (k * H) / 5, W / 28 + 1, H / 5 + 1);
  }
  g.fillStyle = brown ? "rgba(40,15,5,.55)" : "rgba(50,55,62,.6)";
  for (let c = 0; c <= 28; c++) g.fillRect((c * W) / 28 - 2, 0, 4, H);
  for (let k = 0; k <= 5; k++) g.fillRect(0, (k * H) / 5 - 2, W, 4);
  g.fillStyle = brown ? "#3a1a08" : "#5d636b";
  for (let c = 0; c < 28; c++) for (let y = 6; y < H; y += 12) { g.beginPath(); g.arc((c * W) / 28 + 7, y, 2.6, 0, 7); g.fill(); g.beginPath(); g.arc(((c + 1) * W) / 28 - 7, y, 2.6, 0, 7); g.fill(); }
  for (let k = 1; k < 5; k++) for (let x = 6; x < W; x += 12) { g.beginPath(); g.arc(x, (k * H) / 5 - 7, 2.6, 0, 7); g.fill(); }
  if (!brown) {
    // leak streaks from the seams: dark brown runs, wider at the bottom
    for (let i = 0; i < 60; i++) {
      const x = Math.floor(r() * 28) * (W / 28) + (r() < 0.5 ? 6 : W / 28 - 6), y0 = Math.floor(1 + r() * 4) * (H / 5), len = (0.4 + r() * 0.6) * (H - y0 + 60);
      g.strokeStyle = `rgba(90,40,12,${0.55 + r() * 0.35})`; g.lineCap = "round";
      g.lineWidth = 3 + r() * 5; g.beginPath(); g.moveTo(x, y0);
      for (let s = 1; s <= 8; s++) g.lineTo(x + Math.sin(s * 1.7 + i) * 3, Math.min(H, y0 + (len * s) / 8));
      g.stroke();
    }
  } else {
    g.fillStyle = "rgba(255,210,160,.08)";
    for (let i = 0; i < 200; i++) g.fillRect(r() * W, r() * H, 30 + r() * 80, 3); // brush marks
  }
});
/** glossy molasses: dark amber with lighter flow streaks along the direction of travel (v = distance) */
const molassesTex = () => ctex("molasses", 512, 1024, (g, r) => {
  g.fillStyle = "#d8c4b4"; g.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 40; i++) {
    const x = r() * 512, w = 2 + r() * 6;
    g.strokeStyle = `rgba(255,${220 + r() * 30},${170 + r() * 40},${0.35 + r() * 0.35})`; g.lineWidth = w;
    g.beginPath(); g.moveTo(x, -20);
    for (let y = 0; y <= 1044; y += 60) g.lineTo(x + Math.sin(y * 0.01 + i) * 14, y);
    g.stroke();
  }
});
const snowTex = () => ctex("snowPatch", 256, 256, (g, r) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2, rr = 80 + r() * 40; pts.push([128 + rr * Math.cos(a), 128 + rr * Math.sin(a)]); }
  g.fillStyle = "#f2f6fb"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  g.fillStyle = "#dbe5f2"; for (let i = 0; i < 10; i++) { g.beginPath(); g.arc(80 + r() * 100, 80 + r() * 100, 6 + r() * 14, 0, 7); g.fill(); }
});
const smokeTex = () => ctex("steam", 256, 256, (g) => {
  const p = new Pen(g);
  for (const [x, y, r, c] of [[90, 150, 60, "#e9ecf2"], [150, 120, 70, "#f4f6fa"], [170, 165, 55, "#e2e6ee"], [120, 100, 50, "#fbfcfe"]] as const) p.ell(x, y, r, r * 0.85, c, 0);
});
const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});

/** horizontal quad facing up at height y covering x0..x1, z0..z1, uv tiling u x v */
function quadUp(x0: number, x1: number, z0: number, z1: number, u: number, v: number, y = 0) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
}

// ---------------- the tank ----------------
const NPANEL = 24;
type Panel = { m: THREE.Mesh; th: number; seed: number };

// ---------------- the wave grid ----------------
const NR = 260, NS = 220, DMAX = 130; // rings every 0.5 m out to 130 m, 220 spokes
const ringD = (i: number) => (i / (NR - 1)) * DMAX;

// truck flight: lifted on "truck", into the harbor on "harbor"
export const TRUCK_AT: V3 = [36, 0, 38];
const TRUCK_T0 = 32.05, TRUCK_T1 = 32.95, TRUCK_END: V3 = [53, WATER_Y - 0.4, 41];
const FIRE_T0 = 34.45, FIRE_T1 = 34.95;

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private WU: Record<string, THREE.IUniform>;
  private sunDisc: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<L3, THREE.Texture[]>;
  private snowG = new THREE.Group(); private pipeG = new THREE.Group(); private ladderG = new THREE.Group();
  private kitchen = new THREE.Group(); private office = new THREE.Group(); private summer = new THREE.Group(); private foot!: THREE.Mesh;
  private waveM!: THREE.MeshPhongMaterial;
  private clouds: THREE.Mesh[] = [];
  private panels: Panel[] = [];
  private tankGrey: THREE.Material; private tankBrown: THREE.Material;
  private lid: THREE.Mesh;
  private wave: THREE.Mesh; private waveGeo: THREE.BufferGeometry;
  private truck = new THREE.Group(); private firehouse = new THREE.Group();
  private steam: { m: THREE.Mesh; mat: THREE.MeshLambertMaterial; k: number }[] = [];
  private smoke: { m: THREE.Mesh; mat: THREE.MeshLambertMaterial; top: V3; k: number }[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(_kit: Kit) {
    const R = this.root;
    // ---- sky + light (as the bridge short) ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunDisc.frustumCulled = false; this.sunDisc.layers.set(NOINK); R.add(this.sunDisc);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.night.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 130 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 120 + (i % 4) * 38, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- ground: street, sidewalks, yard, quay (static batch) ----
    const b = new Batch();
    const cobble = lam("cobbleHD", () => ({ map: cobbleHD() }));
    const yard = lam("yardHD", () => ({ map: stoneHD("yardHD", ["#b9ab95", "#b0a28c", "#c2b49e", "#a99b85"], "#8d7f6b") }));
    const walk = lam("walkHD", () => ({ map: stoneHD("walkHD", ["#cfc4b2", "#c6baa7", "#d7cdbd", "#beb29f"], "#9c907e") }));
    const cope = lam("copeHD", () => ({ map: stoneHD("copeHD", ["#e6dccd", "#ddd3c3", "#ece4d6", "#d6cbba"], "#aea293") }));
    const quayW = lam("quayHD", () => ({ map: stoneHD("quayHD", ["#a99c8a", "#9f927f", "#b2a593", "#968975"], "#7a6e5e") }));
    const deckM = lam("planksHD", () => ({ map: planksHD() }));
    const wood = lam("beamHD", () => ({ map: beamHD() }));
    const iron = twoTone(new THREE.MeshPhongMaterial({ color: "#3a4a44", specular: "#7a8a84", shininess: 40 }), 0.15);
    b.add(quadUp(-7, 7, -260, 160, 3.5, 105), cobble);
    b.add(boxGeo(V(-9.5, 0, -260), V(-7, 0.15, 160), 2), walk);
    b.add(quadUp(-300, -9.5, -260, 160, 72, 105), cobble);
    b.add(boxGeo(V(7, 0, -260), V(8.6, 0.15, 160), 2), walk);
    b.add(quadUp(8.6, QUAY_X, -260, 160, 9, 105), yard);
    b.add(boxGeo(V(QUAY_X - 0.3, -0.1, -260), V(QUAY_X + 0.6, 0.35, 160), 2), cope);
    { // quay wall face toward the harbor
      const g = new THREE.BufferGeometry(), x = QUAY_X + 0.6, y0 = WATER_Y - 1, y1 = 0;
      g.setAttribute("position", new THREE.Float32BufferAttribute([x, y0, 160, x, y0, -260, x, y1, -260, x, y0, 160, x, y1, -260, x, y1, 160], 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(Array(6).fill([1, 0, 0]).flat(), 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 105, 0, 105, 0.4, 0, 0, 105, 0.4, 0, 0.4], 2));
      b.add(g, quayW);
    }
    // wooden piers into the harbor with bollards
    for (const zc of [-86, 6, 70]) {
      b.add(boxGeo(V(QUAY_X + 0.6, -0.15, zc - 4), V(QUAY_X + 26, 0.1, zc + 4), 2), deckM);
      for (let x = QUAY_X + 3; x < QUAY_X + 26; x += 4) for (const s of [-1, 1]) b.add(boxGeo(V(x - 0.2, WATER_Y - 1, zc + s * 3.8 - 0.2), V(x + 0.2, -0.15, zc + s * 3.8 + 0.2)), wood);
    }
    for (let z = -240; z < 150; z += 9) b.add(new THREE.CylinderGeometry(0.22, 0.28, 0.6, 10).translate(QUAY_X - 0.05, 0.6, z), iron);
    // ---- the elevated railway over the east half of the street ----
    for (let z = -250; z <= 150; z += 12) {
      for (const x of [0.6, 6.4]) {
        b.add(boxGeo(V(x - 0.18, 0, z - 0.18), V(x + 0.18, 6.4, z + 0.18)), iron);
        b.add(boxGeo(V(x - 0.32, 0, z - 0.32), V(x + 0.32, 0.5, z + 0.32)), iron);
      }
      b.add(boxGeo(V(0.2, 6.0, z - 0.25), V(6.8, 6.4, z + 0.25)), iron);
      for (const s of [-1, 1]) b.add(new THREE.BoxGeometry(0.12, 2.4, 0.12).rotateZ(s * 0.6).translate(s < 0 ? 1.2 : 5.8, 5.4, z), iron); // knee braces
    }
    for (const x of [0.6, 6.4]) b.add(boxGeo(V(x - 0.25, 6.4, -250), V(x + 0.25, 7.5, 150)), iron);
    b.add(boxGeo(V(0.1, 7.5, -250), V(6.9, 7.7, 150)), wood);
    for (const x of [1.9, 3.1, 3.9, 5.1]) b.add(boxGeo(V(x - 0.06, 7.7, -250), V(x + 0.06, 7.85, 150)), iron);
    for (let z = -250; z <= 150; z += 1.5) b.add(boxGeo(V(0.3, 7.7, z - 0.12), V(6.7, 7.76, z + 0.12)), wood);

    // ---- houses: brick North End rows on the west side (fronts on the sidewalk at x = -9.5), back rows behind ----
    const r = mulberry(19), pick = <T,>(a: T[]) => a[Math.floor(r() * a.length) % a.length];
    const brickish = [2, 7, 2, 1, 7, 6, 2, 0];
    for (const [xf, z0, z1] of [[-9.6, -230, 140], [-32, -230, 140], [-56, -230, 140]] as const) {
      let z = z0;
      while (z < z1) {
        const w = pick([7, 8, 9]), h = pick([9.8, 11.2, 12.6]), d = 9;
        house(b, xf - d / 2, z + w / 2, Math.PI / 2, w, d, h, pick(brickish), 0);
        z += w + (xf < -20 && r() < 0.2 ? 6 : 0.15);
      }
    }
    // warehouses closing the yard north (z = -90) and south (z = +78), fronts toward the yard
    for (const [zf, yaw] of [[-92, 0], [80, Math.PI]] as const) {
      let x = 10.5;
      while (x < 42) { const w = pick([9, 10]); house(b, x + w / 2, zf, yaw, w, 12, pick([8.4, 9.8]), pick([2, 7, 5]), 0); x += w + 0.3; }
    }
    // a few small yard sheds
    house(b, 33, -54, Math.PI, 8, 6, 4.2, 5, 0);
    house(b, 40, 20, -Math.PI / 2, 7, 6, 4.2, 1, 0);
    b.build(R);

    // ---- harbor water (bridge river shader) ----
    const wNear = waterNear(), wFar = waterFar();
    for (const t of [wNear, wFar]) { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 16; t.needsUpdate = true; }
    this.WU = {
      wNearC: { value: new THREE.Color() }, wMidC: { value: new THREE.Color() }, wFarC: { value: new THREE.Color() },
      wCrest: { value: new THREE.Color() }, wTrough: { value: new THREE.Color() }, wGlint: { value: new THREE.Color() },
      wShade: { value: new THREE.Vector3(0.5, 0.56, 0.72) }, wNearTex: { value: wNear }, wFarTex: { value: wFar }, wTime: { value: 0 },
    };
    const waterM = new THREE.MeshLambertMaterial({ color: 0xffffff });
    waterM.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.WU);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", WATER_DECL).replace("#include <map_fragment>", WATER_COL)
        .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    waterM.customProgramCacheKey = () => "harbor1";
    const wm = new THREE.Mesh(quadUp(QUAY_X + 0.6, 900, -700, 700, 1, 1, WATER_Y), waterM);
    wm.receiveShadow = true; R.add(wm);

    // ---- snow patches (flat decals on sidewalks, yard and street edges) ----
    const snowM = lam("snowPatch", () => ({ map: snowTex(), alphaTest: 0.5, transparent: false }));
    const sb = new Batch(), sr = mulberry(5);
    for (let i = 0; i < 70; i++) {
      const zone = i % 3, x = zone === 0 ? -9 + sr() * 2.2 : zone === 1 ? 9 + sr() * 34 : (sr() < 0.5 ? -6.6 : 5.6) + sr(), z = -200 + sr() * 330;
      if (Math.hypot(x - TANK[0], z - TANK[2]) < TANK_R + 1.5) continue;
      const s = 1.2 + sr() * 3.2, g = new THREE.PlaneGeometry(s, s * (0.5 + sr() * 0.5)).rotateX(-Math.PI / 2).rotateY(sr() * 6);
      sb.add(g, snowM, new THREE.Matrix4().makeTranslation(x, 0.17 + (zone === 1 ? -0.14 : 0) + i * 0.0003, z));
    }
    sb.build(this.snowG, false); R.add(this.snowG);

    // ---- the tank: 24 riveted panels around a lid; grey (leaking) or brown (painted) ----
    const gt = tankTex(false), bt = tankTex(true);
    for (const t of [gt, bt]) { t.anisotropy = 16; t.needsUpdate = true; }
    this.tankGrey = lam("tankGrey", () => ({ map: gt }));
    this.tankBrown = lam("tankBrown", () => ({ map: bt }));
    const dth = (Math.PI * 2) / NPANEL;
    for (let i = 0; i < NPANEL; i++) {
      const th0 = i * dth, thc = th0 + dth / 2;
      const g = new THREE.CylinderGeometry(TANK_R, TANK_R, TANK_H, 4, 1, true, th0, dth);
      g.translate(0, TANK_H / 2, 0);
      const uv = g.attributes.uv as THREE.BufferAttribute;
      for (let k = 0; k < uv.count; k++) uv.setX(k, (th0 + uv.getX(k) * dth) / (Math.PI * 2));
      const px = TANK_R * Math.sin(thc), pz = TANK_R * Math.cos(thc);
      g.translate(-px, 0, -pz);
      const m = new THREE.Mesh(g, this.tankGrey);
      m.position.set(TANK[0] + px, 0, TANK[2] + pz); m.castShadow = true; m.receiveShadow = true;
      this.panels.push({ m, th: thc, seed: i }); R.add(m);
    }
    const lidG = new THREE.ConeGeometry(TANK_R + 0.25, 1.6, 64, 1, false);
    this.lid = new THREE.Mesh(lidG, lam("tankLid", () => ({ color: "#7e858c" })));
    this.lid.castShadow = true; R.add(this.lid);
    // the ring footing
    const foot = this.foot = new THREE.Mesh(new THREE.CylinderGeometry(TANK_R + 0.6, TANK_R + 0.8, 0.5, 64), cope);
    foot.position.set(TANK[0], 0.25, TANK[2]); foot.receiveShadow = true; R.add(foot);

    // ---- molasses wave: polar grid around the tank ----
    const pos = new Float32Array(NR * NS * 3), nor = new Float32Array(NR * NS * 3), uvs = new Float32Array(NR * NS * 2), idx: number[] = [];
    for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) { const k = i * NS + j; uvs[k * 2] = (j / NS) * 24; uvs[k * 2 + 1] = ringD(i) / 6; }
    for (let i = 0; i < NR - 1; i++) for (let j = 0; j < NS; j++) {
      const a = i * NS + j, bb = i * NS + ((j + 1) % NS), c = (i + 1) * NS + j, d = (i + 1) * NS + ((j + 1) % NS);
      idx.push(a, d, c, a, bb, d);
    }
    this.waveGeo = new THREE.BufferGeometry();
    this.waveGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.waveGeo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    this.waveGeo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    this.waveGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(NR * NS * 3), 3));
    this.waveGeo.setIndex(idx);
    const mt = molassesTex(); mt.wrapS = mt.wrapT = THREE.RepeatWrapping; mt.anisotropy = 16;
    const waveM = this.waveM = twoTone(new THREE.MeshPhongMaterial({ map: mt, color: "#8f8274", vertexColors: true, specular: "#6e5038", shininess: 28 }), 0.12);
    this.wave = new THREE.Mesh(this.waveGeo, waveM);
    this.wave.frustumCulled = false; this.wave.castShadow = true; this.wave.receiveShadow = true; this.wave.visible = false;
    R.add(this.wave);

    // ---- firehouse (slides off its foundation in shot 8) ----
    {
      const fb = new Batch();
      house(fb, 0, 0, -Math.PI / 2, 11, 10, 8.4, 7, 0);
      const brickM = lam("fhTower", () => ({ map: stoneHD("fhTowerHD", ["#a8553c", "#9e4c35", "#b25e44", "#94452f"], "#6e3426") }));
      fb.add(boxGeo(V(2, 0, 2.5), V(5, 15, 5.5), 2), brickM);
      fb.add(new THREE.ConeGeometry(2.4, 2.4, 4).rotateY(Math.PI / 4).translate(3.5, 16.2, 4), lam("fhRoof", () => ({ color: "#5d5560" })));
      fb.add(boxGeo(V(-5.2, 0, -3.6), V(-5.05, 3.6, 3.6)), lam("fhDoors", () => ({ color: "#b5402a" })));
      fb.build(this.firehouse);
      this.firehouse.position.set(...FIREHOUSE);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.45, 12), cope); pad.position.set(FIREHOUSE[0], 0.2, FIREHOUSE[2]); pad.receiveShadow = true;
      R.add(this.firehouse, pad);
    }
    // ---- truck (thrown into the harbor in shot 8) ----
    {
      const body = lam("truckBody", () => ({ color: "#2f5f4a" })), dark = lam("truckDark", () => ({ color: "#2a2628" })), bed = lam("truckBed", () => ({ map: beamHD() }));
      const tb = new Batch();
      tb.add(boxGeo(V(-0.9, 0.55, -2.6), V(0.9, 0.85, 2.6)), dark);
      tb.add(boxGeo(V(-0.85, 0.85, 1.0), V(0.85, 2.3, 2.3)), body);       // cab
      tb.add(boxGeo(V(-0.7, 0.85, 2.3), V(0.7, 1.7, 3.3)), body);         // hood
      tb.add(boxGeo(V(-0.9, 0.85, -2.6), V(0.9, 1.25, 0.95)), bed);       // bed
      for (const s of [-1, 1]) tb.add(boxGeo(V(s * 0.9 - 0.06, 1.25, -2.6), V(s * 0.9 + 0.06, 1.6, 0.95)), bed);
      for (const [x, z] of [[-0.95, 2.4], [0.95, 2.4], [-0.95, -1.7], [0.95, -1.7]]) tb.add(new THREE.CylinderGeometry(0.48, 0.48, 0.3, 16).rotateZ(Math.PI / 2).translate(x, 0.48, z), dark);
      tb.build(this.truck);
      R.add(this.truck);
    }
    // ---- cargo ship at the pier with the delivery pipe to the tank top ----
    {
      const sb2 = new Batch(), hull = lam("hull", () => ({ color: "#3b3f4e" })), red = lam("hullRed", () => ({ color: "#a33a2e" })), cream = lam("shipCream", () => ({ color: "#efe2c4" }));
      const x0 = 60, x1 = 70, z0 = -62, z1 = -18;
      sb2.add(boxGeo(V(x0, WATER_Y - 0.6, z0), V(x1, WATER_Y + 0.4, z1)), red);
      sb2.add(boxGeo(V(x0, WATER_Y + 0.4, z0), V(x1, 3.2, z1)), hull);
      sb2.add(new THREE.CylinderGeometry(5, 5, WATER_Y * -1 + 3.7, 3, 1, false, -Math.PI / 2, Math.PI).scale(1, 1, 1.4).translate(65, (3.2 + WATER_Y - 0.6) / 2, z1), hull);
      sb2.add(boxGeo(V(x0 + 2, 3.2, -46), V(x1 - 2, 6.6, -36)), cream);
      sb2.add(new THREE.CylinderGeometry(1.1, 1.2, 6, 16).translate(65, 9.4, -41), lam("funnel", () => ({ color: "#2b2b30" })));
      for (const z of [-56, -26]) sb2.add(new THREE.CylinderGeometry(0.2, 0.25, 14, 8).translate(65, 10, z), lam("mast", () => ({ color: "#6b5034" })));
      // pipe: from the deck over the quay and the yard up to the tank rim
      const curve = new THREE.CubicBezierCurve3(V(62, 3.6, -30), V(48, 6, -30), V(44, 17, -30), V(TANK[0] + TANK_R - 1.2, TANK_H + 0.9, TANK[2]));
      const pb = new Batch();
      pb.add(new THREE.TubeGeometry(curve, 48, 0.32, 10, false), lam("pipe", () => ({ color: "#5c5452" })));
      for (const [x, h] of [[48, 6.4], [43, 10.5]] as const) pb.add(boxGeo(V(x - 0.2, 0, -30.2), V(x + 0.2, h, -29.8)), wood);
      pb.build(this.pipeG); R.add(this.pipeG);
      sb2.build(R);
    }
    // ---- ladder against the tank (painter, shot 4) and steam / chimney smoke sprites ----
    {
      const lb = new Batch(), a = Math.asin((-24.4 - TANK[2]) / TANK_R), wx = TANK[0] - (TANK_R + 0.9) * Math.cos(a), wz = TANK[2] + (TANK_R + 0.9) * Math.sin(a);
      for (const s of [-0.28, 0.28]) lb.add(new THREE.BoxGeometry(0.07, 4.6, 0.07).rotateZ(-0.18).translate(wx + 0.4, 2.25, wz + s), wood);
      for (let y = 0.4; y < 4.4; y += 0.45) lb.add(new THREE.BoxGeometry(0.05, 0.05, 0.56).translate(wx + 0.4 + (y - 2.25) * 0.182, y, wz), wood);
      lb.build(this.ladderG); R.add(this.ladderG);
    }
    this.buildKitchen(); this.buildOffice(); this.buildSummer(wood, cope);
    const st = smokeTex();
    for (let k = 0; k < 7; k++) {
      const mat = new THREE.MeshLambertMaterial({ map: st, transparent: true, depthWrite: false });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); m.layers.set(NOINK);
      this.steam.push({ m, mat, k: k / 7 }); R.add(m);
    }
    for (const top of [[-14, 15.5, -40], [-36, 14.5, 10], [-60, 15, -70]] as V3[]) for (let k = 0; k < 6; k++) {
      const mat = new THREE.MeshLambertMaterial({ map: st, transparent: true, depthWrite: false, color: "#b9b6bf" });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); m.layers.set(NOINK);
      this.smoke.push({ m, mat, top, k: k / 6 }); R.add(m);
    }
  }

  /** a 1910s kitchen corner: plank floor, papered walls with a frosty window, oak icebox, iron stove, table */
  private buildKitchen() {
    const b = new Batch(), o = KITCHEN, M4 = new THREE.Matrix4().makeTranslation(o[0], o[1], o[2]);
    const paper = lam("kitPaper", () => ({ map: ctex("kitPaper", 512, 512, (g) => { g.fillStyle = "#efe2bf"; g.fillRect(0, 0, 512, 512); g.fillStyle = "#d9c79a"; for (let x = 0; x < 512; x += 64) g.fillRect(x, 0, 22, 512); g.fillStyle = "#b9874a"; for (let x = 32; x < 512; x += 64) for (let y = 20; y < 512; y += 64) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); } }) }));
    const floor = lam("kitFloor", () => ({ map: planksHD() })), oak = lam("oak", () => ({ map: beamHD() })), iron = lam("stoveIron", () => ({ color: "#2c2a30" }));
    const brass = lam("brass", () => ({ color: "#d9b44a" })), white = lam("trimWhite", () => ({ color: "#f3efe4" })), glass = lam("frost", () => ({ color: "#cfe4f6" }));
    const add = (g: THREE.BufferGeometry, m: THREE.Material) => b.add(g, m, M4);
    add(boxGeo(V(-4, -0.05, -3), V(4, 0, 3.6), 2), floor);
    for (const [x0, x1, y0, y1] of [[-4, -1.65, 0, 3.2], [-0.35, 4, 0, 3.2], [-1.65, -0.35, 0, 1.2], [-1.65, -0.35, 2.4, 3.2]] as const) add(boxGeo(V(x0, y0, -3.2), V(x1, y1, -3.0), 2), paper);
    add(boxGeo(V(-4.2, 0, -3.2), V(-4, 3.2, 3.6), 2), paper);
    add(boxGeo(V(-1.65, 1.2, -3.25), V(-0.35, 2.4, -3.18)), glass);
    for (const [x0, x1, y0, y1] of [[-1.72, -1.6, 1.15, 2.45], [-0.4, -0.28, 1.15, 2.45], [-1.72, -0.28, 1.12, 1.22], [-1.72, -0.28, 2.38, 2.46], [-1.04, -0.96, 1.2, 2.4], [-1.65, -0.35, 1.76, 1.84]] as const) add(boxGeo(V(x0, y0, -3.05), V(x1, y1, -2.95)), white);
    add(boxGeo(V(-4, 0, -3.0), V(4, 0.18, -2.95)), oak);
    add(boxGeo(V(-3.4, 0, -2.95), V(-2.2, 1.55, -2.2), 2), oak);
    for (const y of [0.55, 1.15]) add(boxGeo(V(-2.55, y, -2.2), V(-2.4, y + 0.08, -2.15)), brass);
    add(boxGeo(V(-3.35, 0.78, -2.2), V(-2.25, 0.81, -2.17)), iron);
    add(boxGeo(V(1.4, 0, -2.95), V(2.9, 0.86, -2.15), 2), iron);
    add(boxGeo(V(1.35, 0.86, -3.0), V(2.95, 0.93, -2.1)), iron);
    add(boxGeo(V(1.6, 0.18, -2.15), V(2.2, 0.62, -2.12)), lam("ovenDoor", () => ({ color: "#45424a" })));
    add(new THREE.CylinderGeometry(0.12, 0.12, 2.3, 12).translate(2.6, 0.93 + 1.15, -2.75), iron);
    add(boxGeo(V(-1.0, 0.74, -2.0), V(0.7, 0.8, -1.0)), oak);
    for (const [x, z] of [[-0.92, -1.92], [0.62, -1.92], [-0.92, -1.08], [0.62, -1.08]]) add(boxGeo(V(x - 0.04, 0, z - 0.04), V(x + 0.04, 0.74, z + 0.04)), oak);
    add(boxGeo(V(-3.9, 1.6, -2.95), V(-2.4, 1.64, -2.6)), oak);
    for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16).rotateX(Math.PI / 2).translate(-3.7 + i * 0.36, 1.76, -2.86), white);
    b.build(this.kitchen); this.root.add(this.kitchen);
  }
  /** the engineer's office: drafting table, court papers, side desk, window onto a building site */
  private buildOffice() {
    const b = new Batch(), o = OFFICE, M4 = new THREE.Matrix4().makeTranslation(o[0], o[1], o[2]);
    const paint = lam("offWall", () => ({ map: ctex("offWall", 512, 512, (g) => { g.fillStyle = "#a9b79a"; g.fillRect(0, 0, 512, 512); g.fillStyle = "#7d6a52"; g.fillRect(0, 380, 512, 132); g.fillStyle = "#5e4e3c"; g.fillRect(0, 376, 512, 10); }) }));
    const floor = lam("offFloor", () => ({ map: planksHD() })), oak = lam("oak", () => ({ map: beamHD() })), paper = lam("papers", () => ({ map: ctex("papers", 256, 256, (g) => { g.fillStyle = "#efe9da"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#cfc6b2"; for (let y = 4; y < 256; y += 9) g.fillRect(0, y, 256, 2); g.fillStyle = "#a33a2e"; g.fillRect(0, 120, 256, 14); }) }));
    const white = lam("trimWhite", () => ({ color: "#f3efe4" })), board = lam("draftBoard", () => ({ color: "#e8dcc0" }));
    const add = (g: THREE.BufferGeometry, m: THREE.Material) => b.add(g, m, M4);
    add(boxGeo(V(-4, -0.05, -3), V(4, 0, 3.6), 2), floor);
    for (const [x0, x1, y0, y1] of [[-4, 0.6, 0, 3.3], [2.2, 4, 0, 3.3], [0.6, 2.2, 0, 1.15], [0.6, 2.2, 2.55, 3.3]] as const) add(boxGeo(V(x0, y0, -3.2), V(x1, y1, -3.0), 2), paint);
    add(boxGeo(V(-4.2, 0, -3.2), V(-4, 3.3, 3.6), 2), paint);
    for (const [x0, x1, y0, y1] of [[0.53, 0.65, 1.1, 2.6], [2.15, 2.27, 1.1, 2.6], [0.53, 2.27, 1.08, 1.18], [0.53, 2.27, 2.52, 2.6], [1.36, 1.44, 1.15, 2.55]] as const) add(boxGeo(V(x0, y0, -3.05), V(x1, y1, -2.95)), white);
    for (const [x, z] of [[-0.65, -1.75], [0.65, -1.75], [-0.65, -1.0], [0.65, -1.0]]) add(boxGeo(V(x - 0.04, 0, z - 0.04), V(x + 0.04, 0.95, z + 0.04)), oak);
    add(new THREE.BoxGeometry(1.4, 0.04, 1.0).rotateX(0.45).translate(0, 1.05, -1.35), board);
    for (const [x, z, h] of [[-3.3, -2.5, 1.3], [-2.75, -2.55, 0.95], [-3.35, -1.85, 0.7], [-2.2, -2.6, 0.55]] as const) add(boxGeo(V(x - 0.25, 0, z - 0.2), V(x + 0.25, h, z + 0.2)), paper);
    add(boxGeo(V(-2.0, 0.72, -1.25), V(-1.2, 0.78, -0.65)), oak);
    for (const [x, z] of [[-1.95, -1.2], [-1.25, -1.2], [-1.95, -0.7], [-1.25, -0.7]]) add(boxGeo(V(x - 0.03, 0, z - 0.03), V(x + 0.03, 0.72, z + 0.03)), oak);
    // ground and a half-built frame outside the window, under the crane
    add(boxGeo(V(-20, -0.06, -40), V(20, -0.05, -3.2)), lam("siteGround", () => ({ color: "#b7a68a" })));
    const steel = lam("siteSteel", () => ({ color: "#8a4a3a" }));
    for (let x = 0; x <= 6; x += 3) for (const z of [-16, -12]) add(boxGeo(V(x - 0.1, 0, z - 0.1), V(x + 0.1, 5, z + 0.1)), steel);
    for (const y of [2.5, 5]) for (const z of [-16, -12]) add(boxGeo(V(-0.1, y - 0.1, z - 0.1), V(6.1, y + 0.1, z + 0.1)), steel);
    b.build(this.office); this.root.add(this.office);
  }
  /** today, in summer: a grassy park where the tank stood, trees, benches */
  private buildSummer(wood: THREE.Material, cope: THREE.Material) {
    const b = new Batch();
    const lawn = lam("lawn", () => ({ color: "#6fae4a" }));
    b.add(new THREE.CircleGeometry(17, 48).rotateX(-Math.PI / 2).translate(TANK[0], 0.03, TANK[2]), lawn);
    b.add(new THREE.RingGeometry(17, 18.3, 48).rotateX(-Math.PI / 2).translate(TANK[0], 0.035, TANK[2]), cope);
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + 0.4, r = 13 + (i % 3); prop(b, {} as Kit, i % 3 ? "tree_oak" : "tree_fat", TANK[0] + r * Math.cos(a), 0, TANK[2] + r * Math.sin(a), 6 + (i % 3), 0); }
    for (const [x, z, yaw] of [[22, -26, 0.6], [30, -22, -0.4]] as const) {
      const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, 0, z);
      b.add(boxGeo(V(-0.9, 0.42, -0.25), V(0.9, 0.48, 0.25)), wood, m);
      b.add(boxGeo(V(-0.9, 0.48, -0.25), V(0.9, 0.9, -0.2)), wood, m);
      for (const s of [-0.8, 0.8]) b.add(boxGeo(V(s - 0.05, 0, -0.22), V(s + 0.05, 0.42, 0.22)), lam("benchIron", () => ({ color: "#2f3a34" })), m);
    }
    b.add(boxGeo(V(31.2, 0, -18.5), V(32.4, 0.9, -17.9)), lam("plaque", () => ({ color: "#6b6052" })));
    b.build(this.summer); this.root.add(this.summer);
  }

  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(SUN_SHOT[id]?.az ?? L.az), el = THREE.MathUtils.degToRad(SUN_SHOT[id]?.el ?? (L.el - (s.light === "day" ? 16 : 0)));
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light], tw = waveTime(id, t);
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig: January sun (lower than the bridge's summer day), frozen per shot ----
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 9, 14, 110);
    this.sun.position.copy(focus).addScaledVector(sunDir, 260); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 560; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar + 120;
    scene.fog = this.fog; scene.background = null;
    this.sunDisc.visible = s.light === "golden";
    if (this.sunDisc.visible) { this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900); this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7))); }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i]; m.lookAt(cam.position.x, m.position.y, cam.position.z);
      (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[s.light][i % 4];
    }
    const W = this.WU, wc = K.water;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t;

    // ---- which set is on stage ----
    const set = s.set ?? "street", summer = set === "summer";
    this.kitchen.visible = set === "kitchen"; this.office.visible = set === "office"; this.summer.visible = summer;
    this.snowG.visible = !summer; this.pipeG.visible = !summer; this.ladderG.visible = !summer && id <= 5; this.foot.visible = !summer;
    this.waveM.specular.set(s.light === "night" ? "#1e1814" : "#6e5038"); this.waveM.shininess = s.light === "night" ? 8 : 28;
    this.poseTank(id, t, tw, s);
    for (const p of this.panels) p.m.visible = !summer;
    this.lid.visible = !summer && !(tw > 0.15 || (id >= 9 && id !== 12));
    this.poseWave(tw);
    this.posePlace(id, t);
    for (const sm of this.smoke) {
      const u = (t * 0.1 + sm.k) % 1, sz = 2.5 + u * 8;
      sm.m.position.set(sm.top[0] + u * 14, sm.top[1] + u * 12, sm.top[2] - u * 4);
      sm.m.scale.set(sz, sz, 1); sm.m.quaternion.copy(cam.quaternion); sm.mat.opacity = 0.75 * (1 - u) ** 1.2;
    }
    for (const sm of this.steam) {
      const on = id === 5 ? smooth((t - 17.5) / 0.6) : 0, u = (t * 0.35 + sm.k) % 1, sz = 1.5 + u * 5;
      sm.m.visible = on > 0;
      sm.m.position.set(TANK[0] + TANK_R - 1.5 - u * 3, TANK_H + 1.2 + u * 6, TANK[2] + u * 1.5);
      sm.m.scale.set(sz, sz, 1); sm.m.quaternion.copy(cam.quaternion); sm.mat.opacity = 0.8 * on * (1 - u);
    }

    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const stg = stage(id, t, tw, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const tint = s.light === "golden" ? "#ffcf9e" : "#ffffff";
    let ai = 0;
    const used: Actor[] = [];
    for (const p of stg.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      // skill rule: nobody freezes -- a slow idle sway and a breathing bob on every card, staggered per character
      const ph = ai * 1.37 + p.x * 0.31, sway = 0.022 * Math.sin(t * 1.6 + ph) + 0.008 * Math.sin(t * 3.7 + 2 * ph);
      const bob = 0.012 * sc2 * Math.max(0, Math.sin(t * 2.4 + ph));
      a.mesh.visible = true; a.mesh.position.set(p.x, p.y + bob, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), (p.roll ?? 0) + sway);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      if (a.mat.emissiveMap) a.mat.emissive.set(tint);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p0 of stg.fx) {
      const p = p0 as WallFx;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const ef = this.fx(fi++);
      ef.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      ef.use(!!p.soft); ef.mesh.visible = true; ef.mesh.position.set(p.x, p.y, p.z);
      if (p.wall !== undefined) { ef.mesh.rotation.order = "YXZ"; ef.mesh.rotation.set(-(p.tilt ?? 0), p.wall, 0); }
      else if (p.flat) { ef.mesh.rotation.order = "XYZ"; ef.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0); }
      else { ef.mesh.quaternion.copy(cam.quaternion); ef.mesh.rotateZ(p.rot ?? 0); }
      ef.mesh.scale.set(p.w, p.h, 1);
      fused.push(ef);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return focus;
  }

  /** intact until the split; then every panel tips outward about its foot and slides away, the lid drops in */
  private poseTank(id: number, t: number, tw: number, s: ShotDef) {
    const mat = s.brown ? this.tankBrown : this.tankGrey;
    const ts = id >= 9 && id !== 12 ? 30 : tw > 0 ? tw : -1;
    const ax = this.v;
    for (const p of this.panels) {
      p.m.material = mat;
      const bx = TANK[0] + TANK_R * Math.sin(p.th), bz = TANK[2] + TANK_R * Math.cos(p.th);
      if (ts < 0) {
        // the groan: a small breathing bulge on "groan"
        const bulge = 0;
        p.m.position.set(bx + bulge * Math.sin(p.th), 0, bz + bulge * Math.cos(p.th)); p.m.quaternion.identity(); continue;
      }
      const toward = 0.6 + 0.4 * Math.cos(p.th + Math.PI / 2 - 0.3) ** 2, vel = (5 + 7 * hash(p.seed)) * toward;
      const out = Math.min(14, vel * ts * (1 - Math.min(0.5, ts / 8)));
      const tip = Math.min(Math.PI / 2 - 0.05, ts * (1.4 + hash(p.seed + 7)) * 1.1);
      p.m.position.set(bx + out * Math.sin(p.th), 0, bz + out * Math.cos(p.th));
      ax.set(Math.cos(p.th), 0, -Math.sin(p.th));
      p.m.quaternion.setFromAxisAngle(ax, tip).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), (hash(p.seed + 3) - 0.5) * 0.4 * clamp01(ts)));
    }
    const drop = ts < 0 ? 0 : Math.min(TANK_H - 1, 0.5 * 9.8 * ts * ts);
    this.lid.position.set(TANK[0], TANK_H + 0.8 - drop, TANK[2]);
    this.lid.rotation.set(ts < 0 ? 0 : 0.25 * clamp01(ts), 0, ts < 0 ? 0 : -0.15 * clamp01(ts));
    (this.lid.material as THREE.MeshLambertMaterial).color.set(s.brown ? "#6e3b1d" : "#7e858c");
  }

  private poseWave(tw: number) {
    this.wave.visible = tw > 0;
    if (tw <= 0) return;
    const pos = this.waveGeo.attributes.position.array as Float32Array, nor = this.waveGeo.attributes.normal.array as Float32Array;
    const col = this.waveGeo.attributes.color.array as Float32Array;
    const H = waveCrest(tw), ph = tw * 0.9;
    for (let j = 0; j < NS; j++) {
      const a = (j / NS) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      // lobed front and an uneven crest, drifting slowly as the wave travels
      const rOff = 1.7 * Math.sin(7 * a + 1.3 + ph) + 0.9 * Math.sin(13 * a + 0.4 - ph) + 0.5 * Math.sin(23 * a);
      const hMul = 1 + 0.12 * Math.sin(9 * a + 2 + ph) + 0.06 * Math.sin(17 * a);
      let hp = waveH(ringD(0), tw, rOff, hMul), h = hp;
      for (let i = 0; i < NR; i++) {
        const d = ringD(i), hn = waveH(ringD(Math.min(NR - 1, i + 1)), tw, rOff, hMul);
        const slope = (hn - hp) / (i === 0 || i === NR - 1 ? 0.5 : 1.0);
        const nl = Math.hypot(slope, 1), x = TANK[0] + d * ca, z = TANK[2] + d * sa, k = (i * NS + j) * 3;
        let y = h > 0.04 ? h + 0.03 : -2.5;
        if (x > QUAY_X + 0.6) y = h > 0.04 && x < QUAY_X + 6 + 4 * Math.sin(a * 11) ? WATER_Y + 0.06 + Math.min(0.25, h * 0.1) : -4;
        pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
        nor[k] = (-slope * ca) / nl; nor[k + 1] = 1 / nl; nor[k + 2] = (-slope * sa) / nl;
        // colour: glossy amber on the top and the crest, deep red-brown down the steep face, near-black at the toe
        const up = 1 / nl, top = Math.min(1, h / Math.max(0.5, H * hMul));
        const kk = 0.3 + 0.7 * top * (0.55 + 0.45 * up);
        col[k] = 0.3 * kk + 0.07; col[k + 1] = 0.12 * kk + 0.025; col[k + 2] = 0.035 * kk + 0.008;
        hp = h; h = hn;
      }
    }
    this.waveGeo.attributes.position.needsUpdate = true; this.waveGeo.attributes.normal.needsUpdate = true; this.waveGeo.attributes.color.needsUpdate = true;
    void H;
  }

  private posePlace(id: number, t: number) {
    // truck: parked, then thrown in an arc into the harbor
    const u = id >= 8 ? clamp01((t - TRUCK_T0) / (TRUCK_T1 - TRUCK_T0)) : 0, sink = id >= 8 ? clamp01((t - TRUCK_T1) / 1.2) : 0;
    const gone = id >= 9 || (SHOTS[id - 1].set ?? "street") !== "street";
    this.truck.visible = !gone;
    this.truck.position.set(TRUCK_AT[0] + (TRUCK_END[0] - TRUCK_AT[0]) * u, TRUCK_AT[1] + (TRUCK_END[1] - TRUCK_AT[1]) * u + 9 * 4 * u * (1 - u) - 1.2 * sink, TRUCK_AT[2] + (TRUCK_END[2] - TRUCK_AT[2]) * u);
    this.truck.rotation.set(0.0, Math.PI / 2 - 0.4, -2.6 * u);
    // firehouse: shoved toward the harbor and tilted on "foundation"
    const k = id >= 8 ? easeOutBack(clamp01((t - FIRE_T0) / (FIRE_T1 - FIRE_T0))) : 0;
    this.firehouse.position.set(FIREHOUSE[0] + 3.2 * k, -0.25 * k, FIREHOUSE[2] + 0.8 * k);
    this.firehouse.rotation.set(0, 0.05 * k, -0.07 * k);
  }
}

const SUN_SHOT: Record<number, { az?: number; el?: number }> = { 2: { az: 115 }, 3: { az: 140 }, 4: { az: 140 }, 5: { az: 155 }, 6: { az: 140 }, 10: { az: 140 }, 11: { az: 150, el: 40 }, 13: { az: 135 }, 14: { az: 150, el: 40 }, 15: { az: 35, el: 14 } };
const hash = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const easeOutBack = (x: number) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;
function mulberry(a: number) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const WATER_DECL = `#include <common>
varying vec3 vWP;
uniform vec3 wNearC, wMidC, wFarC, wCrest, wTrough, wGlint, wShade;
uniform sampler2D wNearTex, wFarTex;
uniform float wTime;`;
const WATER_COL = `
  vec3 wV = vWP - cameraPosition;
  float wd = length(wV);
  float wDep = asin(clamp(-wV.y / wd, 0.0, 1.0));
  float wf = 1.0 - smoothstep(0.0, 0.42, wDep);
  vec3 wc = mix(mix(wNearC, wMidC, smoothstep(0.0, 0.55, wf)), wFarC, smoothstep(0.55, 1.0, wf));
  vec2 wp = vWP.xz + vec2(0.0, 0.25 * wTime);
  vec4 mk = mix(texture2D(wNearTex, wp / 8.0), texture2D(wFarTex, wp / 40.0 + 0.37), smoothstep(25.0, 90.0, wd));
  wc = mix(wc, wTrough, mk.g * 0.6);
  wc = mix(wc, wCrest, mk.r * 0.7);
  wc = mix(wc, wGlint, mk.b * (0.3 + 0.5 * wf));
  diffuseColor.rgb = wc;`;
export { SPLIT, rep };
