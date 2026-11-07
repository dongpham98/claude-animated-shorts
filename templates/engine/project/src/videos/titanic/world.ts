// The Titanic video as one three.js scene posed per frame: night sky with stars, the North Atlantic, the ship
// (ship.ts), boat 1 lowering / afloat, the boats of shot 6, and an interior room far away with three dressings
// (London 1894 office, the 1912 inquiry hall, the Belfast drawing office). Light rig and sky as the molasses short.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "../bridge/build";
import { ctex, planksHD, beamHD, waterNear, waterFar } from "../bridge/paint";
import { TONE, CHAR, LFB, untone, twoTone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "./castcore";
import type { WallFx } from "./castcore";
import { stage } from "./cast";
import { LIGHTS_T, LOOK_T } from "./lights";
import { buildShip, makeBoat, buildCarpathia, makeIceberg, BoatKind } from "./ship";
import { boatsFor, CARP, L14 } from "./scenes";
import { SHOTS, camAt, FPS, OFFICE, BOAT1, SEA_B1, SEA6, boat1Y } from "./story";

export const loadKit = () => Promise.resolve({} as Kit);
const starTex = () => ctex("star", 64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.8)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
function mulberry(a: number) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private stars: THREE.Points;
  private fog = new THREE.Fog("#1c2a55", 120, 1400);
  private WU: Record<string, THREE.IUniform>;
  private water: THREE.Mesh;
  private ship = new THREE.Group(); private hung: THREE.Group[] = [];
  private boat1: THREE.Group; private sea6: THREE.Group[] = [];
  private room = new THREE.Group(); private dress: Record<string, THREE.Group> = { london: new THREE.Group(), inquiry: new THREE.Group(), belfast: new THREE.Group(), wireless: new THREE.Group(), conference: new THREE.Group() };
  private carp = new THREE.Group(); private ice = new THREE.Group();
  private pool2: Record<string, THREE.Group[]> = { lifeboat: [], cutter: [], collapsible: [] };
  private lanternM = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.4, 1.4) }); private lanterns: THREE.Mesh[] = [];
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(_kit: Kit) {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1300, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    { // stars: no moon that night, a very bright sky
      const r = mulberry(7), n = 2600, p = new Float32Array(n * 3), c = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const az = r() * Math.PI * 2, el = Math.asin(0.02 + 0.98 * r() ** 1.3), d = 1150, b = 0.4 + 2.2 * r() ** 6;
        p.set([d * Math.cos(el) * Math.cos(az), d * Math.sin(el), d * Math.cos(el) * Math.sin(az)], i * 3);
        c.set([b, b * (0.92 + 0.08 * r()), b * (0.95 + 0.15 * r())], i * 3);
      }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("color", new THREE.BufferAttribute(c, 3));
      this.stars = new THREE.Points(g, new THREE.PointsMaterial({ size: 3.2, sizeAttenuation: false, map: starTex(), vertexColors: true, transparent: true, depthWrite: false, fog: false }));
      this.stars.frustumCulled = false; this.stars.layers.set(NOINK); R.add(this.stars);
    }
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 0.4);
    this.sun = new THREE.DirectionalLight("#b8c8ff", 1.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);

    // ---- the sea (bridge river shader, night colours) ----
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
    waterM.customProgramCacheKey = () => "atlantic1";
    const wg = new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2);
    this.water = new THREE.Mesh(wg, waterM); this.water.receiveShadow = true; R.add(this.water);

    // ---- the ship and the boats ----
    const sh = buildShip(this.ship); this.hung = sh.hung; R.add(this.ship);
    this.boat1 = makeBoat("cutter"); R.add(this.boat1);
    for (const [, , , n] of SEA6) { const b = makeBoat(n > 14 ? "lifeboat" : "cutter"); this.sea6.push(b); R.add(b); }
    this.buildRoom();
    buildCarpathia(this.carp); R.add(this.carp);
    // icebergs: a field around the Carpathia's approach and a few far off where the boats drift
    const ib: [number, number, number, number][] = [[CARP[0] + 90, CARP[2] - 160, 9, 3], [CARP[0] - 60, CARP[2] + 200, 14, 7], [CARP[0] + 260, CARP[2] + 60, 18, 11],
      [CARP[0] - 420, CARP[2] - 380, 16, 13], [CARP[0] - 120, CARP[2] - 420, 11, 17], [L14[0] - 420, L14[2] + 520, 16, 19], [L14[0] + 560, L14[2] + 380, 14, 23], [CARP[0] + 60, CARP[2] + 70, 4, 29], [CARP[0] - 160, CARP[2] + 40, 5, 31]];
    for (const [x, z, sz, seed] of ib) { const m = makeIceberg(seed, sz); m.position.set(x, -sz * 0.15, z); this.ice.add(m); }
    R.add(this.ice);
  }
  private boatOf(kind: string, i: number) {
    const l = this.pool2[kind];
    while (l.length <= i) { const b = makeBoat(kind as BoatKind); this.pool2[kind].push(b); this.root.add(b); }
    return l[i];
  }

  /** one interior (10 x 7 m, 3.6 m high) at OFFICE with three dressings */
  private buildRoom() {
    const O = OFFICE, M = new THREE.Matrix4().makeTranslation(O[0], O[1], O[2]);
    const b = new Batch();
    const paper = lam("tPaper", () => ({ map: ctex("tPaper", 512, 512, (g) => { g.fillStyle = "#6e7f5e"; g.fillRect(0, 0, 512, 512); g.fillStyle = "#62734f"; for (let x = 0; x < 512; x += 64) g.fillRect(x, 0, 20, 512); g.fillStyle = "#4a3a2a"; g.fillRect(0, 400, 512, 112); g.fillStyle = "#3a2c1e"; g.fillRect(0, 396, 512, 8); }) }));
    const floor = lam("tFloor", () => ({ map: planksHD() })), oak = lam("tOak", () => ({ map: beamHD() }));
    const white = lam("tTrim", () => ({ color: "#efe7d4" })), fogM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.6, 0.7) });
    const add = (g: THREE.BufferGeometry, m: THREE.Material, bb = b) => bb.add(g, m, M);
    add(boxGeo(V(-5, -0.05, -3), V(5, 0, 4), 2), floor);
    add(boxGeo(V(-5, 0, -3.2), V(-1.2, 3.6, -3.0), 2), paper); add(boxGeo(V(1.2, 0, -3.2), V(5, 3.6, -3.0), 2), paper);
    add(boxGeo(V(-1.2, 0, -3.2), V(1.2, 1.0, -3.0), 2), paper); add(boxGeo(V(-1.2, 2.8, -3.2), V(1.2, 3.6, -3.0), 2), paper);
    add(boxGeo(V(-5.2, 0, -3.2), V(-5.0, 3.6, 4), 2), paper); add(boxGeo(V(5.0, 0, -3.2), V(5.2, 3.6, 4), 2), paper);
    add(boxGeo(V(-5, 3.6, -3.2), V(5, 3.7, 4)), white);
    for (const [x0, x1, y0, y1] of [[-1.28, -1.16, 0.95, 2.85], [1.16, 1.28, 0.95, 2.85], [-1.28, 1.28, 0.92, 1.02], [-1.28, 1.28, 2.78, 2.86], [-0.05, 0.05, 1.0, 2.8], [-1.2, 1.2, 1.86, 1.94]] as const)
      add(boxGeo(V(x0, y0, -3.05), V(x1, y1, -2.95)), white);
    b.build(this.room);
    const fogPane = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), fogM); fogPane.position.set(O[0], O[1] + 1.9, O[2] - 3.12); fogPane.layers.set(NOINK); this.room.add(fogPane);
    const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.6, 1.8) });
    // London 1894: the clerk's desk, a gas lamp, a shelf for the ship models
    { const d = new Batch();
      add(boxGeo(V(-0.9, 0.84, -0.95), V(0.9, 0.9, 0.0)), oak, d);
      for (const [x, z] of [[-0.85, -0.9], [0.85, -0.9], [-0.85, -0.05], [0.85, -0.05]]) add(boxGeo(V(x - 0.05, 0, z - 0.05), V(x + 0.05, 0.84, z + 0.05)), oak, d);
      add(boxGeo(V(-2.8, 1.75, -3.0), V(0.8, 1.8, -2.7)), oak, d);
      add(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8).translate(1.4, 3.0, -1.0), lam("brassT", () => ({ color: "#c9a24a" })), d);
      d.build(this.dress.london);
      const g = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), lampM); g.position.set(O[0] + 1.4, 2.35, O[2] - 1.0); this.dress.london.add(g); }
    // inquiry hall: the commissioner's raised bench, a big ship model on a table
    { const d = new Batch();
      add(boxGeo(V(-4.2, 0, -3.0), V(-1.0, 0.9, -1.8)), oak, d);
      add(boxGeo(V(-4.2, 0.9, -2.0), V(-1.0, 1.95, -1.8)), oak, d);
      add(boxGeo(V(0.2, 0.75, -1.6), V(3.6, 0.82, -0.6)), oak, d);
      add(boxGeo(V(0.6, 0.82, -1.25), V(3.2, 1.05, -0.95)), lam("modelHull", () => ({ color: "#1e1e26" })), d);
      add(boxGeo(V(0.9, 1.05, -1.2), V(2.9, 1.18, -1.0)), white, d);
      for (const x of [1.3, 1.8, 2.3, 2.75]) add(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 12).translate(x, 1.33, -1.1), lam("buff", () => ({ color: "#c98a3c" })), d);
      d.build(this.dress.inquiry);
      for (const x of [-3.6, -1.6]) { const g = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 10), lampM); g.position.set(O[0] + x, 2.6, O[2] - 1.9); this.dress.inquiry.add(g); } }
    // Belfast drawing office: tilted drawing board, plan chest, lamp
    { const d = new Batch();
      for (const [x, z] of [[-0.2, -1.6], [1.2, -1.6], [-0.2, -1.1], [1.2, -1.1]]) add(boxGeo(V(x - 0.04, 0, z - 0.04), V(x + 0.04, 0.95, z + 0.04)), oak, d);
      add(new THREE.BoxGeometry(1.5, 0.04, 1.0).rotateX(0.5).translate(0.5, 1.05, -1.35), lam("draftBoardT", () => ({ color: "#e8dcc0" })), d);
      add(boxGeo(V(-4.2, 0, -2.9), V(-2.4, 1.0, -1.9)), oak, d);
      d.build(this.dress.belfast);
      const g = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 10), lampM); g.position.set(O[0] + 0.5, 2.1, O[2] - 0.6); this.dress.belfast.add(g); }
    // Carpathia's wireless cabin: small desk, the set, a bunk
    { const d = new Batch();
      add(boxGeo(V(-1.2, 0.74, -2.9), V(1.2, 0.8, -2.1)), oak, d);
      for (const [x, z] of [[-1.15, -2.85], [1.15, -2.85], [-1.15, -2.15], [1.15, -2.15]]) add(boxGeo(V(x - 0.04, 0, z - 0.04), V(x + 0.04, 0.74, z + 0.04)), oak, d);
      add(boxGeo(V(-0.9, 0.8, -2.85), V(0.2, 1.25, -2.45)), lam("radioBox", () => ({ color: "#3a2a22" })), d);
      add(boxGeo(V(0.35, 0.8, -2.8), V(0.95, 1.05, -2.5)), lam("radioBox2", () => ({ color: "#2a2a30" })), d);
      add(boxGeo(V(2.4, 0.45, -2.9), V(4.6, 0.65, -1.9)), lam("bunk", () => ({ color: "#d9d2c0" })), d);
      add(boxGeo(V(2.4, 0, -2.9), V(4.6, 0.45, -1.9)), oak, d);
      d.build(this.dress.wireless);
      const g = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), lampM); g.position.set(O[0] - 0.4, 2.0, O[2] - 2.3); this.dress.wireless.add(g); }
    // the London conference of 1913-14: a long table
    { const d = new Batch();
      add(boxGeo(V(-3.6, 0.74, -2.2), V(3.6, 0.82, -0.9)), oak, d);
      for (const x of [-3.5, 3.5]) for (const z of [-2.1, -1.0]) add(boxGeo(V(x - 0.05, 0, z - 0.05), V(x + 0.05, 0.74, z + 0.05)), oak, d);
      add(boxGeo(V(-3.4, 0.82, -1.7), V(3.4, 0.84, -1.3)), lam("papers2", () => ({ color: "#efe9da" })), d);
      d.build(this.dress.conference);
      for (const x of [-2.6, 0, 2.6]) { const g = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), lampM); g.position.set(O[0] + x, 2.9, O[2] - 1.6); this.dress.conference.add(g); } }
    for (const k of Object.keys(this.dress)) this.room.add(this.dress[k]);
    this.root.add(this.room);
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS_T[s.light], K = LOOK_T[s.light];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = s.set === "ship" || s.set === "sea" ? 1.0 : 0.15; cam.far = 3000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light: key direction camera-relative, frozen per shot (az from the camera's forward axis) ----
    const fx0 = c.look[0] - c.pos[0], fz0 = c.look[2] - c.pos[2], n0 = Math.hypot(fx0, fz0) || 1;
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = (fx0 / n0) * Math.cos(az) - (fz0 / n0) * Math.sin(az), hz = (fz0 / n0) * Math.cos(az) + (fx0 / n0) * Math.sin(az);
    const sunDir = V(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.2 + 6, 8, 260);
    this.sun.position.copy(focus).addScaledVector(sunDir, 600); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 50; sc.far = 1200; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad; CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position); this.stars.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    const W = this.WU, wc = K.water;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t * 0.4;

    // ---- which set ----
    const outside = s.set !== "office", scn = s.scene;
    const shipOn = s.set === "ship" || s.set === "deck" || (s.set === "sea" && (id <= 20 || scn === "southBoat" || scn === "boat1Ship"));
    this.ship.visible = shipOn; this.water.visible = outside; this.stars.visible = outside && s.light !== "day" && s.light !== "dawn"; this.room.visible = !outside;
    this.carp.visible = s.set === "carp"; this.ice.visible = id > 20 && (s.set === "carp" || (s.set === "sea" && !shipOn));
    for (const k of Object.keys(this.dress)) this.dress[k].visible = !outside && s.dress === k;
    // boat 1 (pilot shots 1-3): hung -> lowering -> afloat; its davit copy hides while it is out
    const b1out = id <= 3 || id === 6 || scn === "hookAgain" || scn === "boat1Ship" || scn === "boat1Dark";
    const b7out = scn === "boat7";
    for (const h of this.hung) { const st = h.userData.station; h.visible = !((st.x === 72 && st.side > 0 && b1out) || (st.x === 48 && st.side > 0 && b7out)); }
    this.boat1.visible = id <= 3;
    if (id <= 2) { this.boat1.position.set(BOAT1[0], boat1Y(f), BOAT1[2]); this.boat1.rotation.set(0, 0, 0.012 * Math.sin(f * 0.21)); }
    if (id === 3) { this.boat1.position.set(SEA_B1[0], -0.52, SEA_B1[2]); this.boat1.rotation.set(0.01 * Math.sin(t * 1.3), 0.5, 0.015 * Math.sin(t * 1.1)); }
    this.sea6.forEach((b, k) => { b.visible = id === 6; const [x, z, yaw] = SEA6[k]; b.position.set(x - 0.03 * (f - 579) * Math.sin(yaw), -0.52, z + 0.05 * (f - 579)); b.rotation.set(0.01 * Math.sin(t + k), yaw, 0.015 * Math.sin(t * 1.2 + k)); });
    // loose boats of chapters 2-10
    const used2: Record<string, number> = { lifeboat: 0, cutter: 0, collapsible: 0 };
    let li = 0;
    for (const bp of boatsFor(scn, f, s.a)) {
      const b = this.boatOf(bp.kind, used2[bp.kind]++);
      b.visible = true; b.position.set(bp.x, bp.y, bp.z);
      const bob = bp.y < 0 ? 0.012 * Math.sin(t * 1.3 + bp.x) : 0;
      b.rotation.set(bp.flip ? Math.PI : bob, bp.yaw, (bp.roll ?? 0) + (bp.y < 0 ? 0.015 * Math.sin(t * 1.1 + bp.z) : 0));
      if (bp.lantern) {
        while (this.lanterns.length <= li) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), this.lanternM); m.layers.set(NOINK); this.lanterns.push(m); this.root.add(m); }
        const m = this.lanterns[li++], c = Math.cos(bp.yaw), sn = Math.sin(bp.yaw);
        m.visible = true; m.position.set(bp.x - 3.6 * c, bp.y + 1.9, bp.z + 3.6 * sn);
      }
    }
    for (const k of Object.keys(this.pool2)) this.pool2[k].forEach((b, i) => { if (i >= used2[k]) b.visible = false; });
    for (let i = li; i < this.lanterns.length; i++) this.lanterns[i].visible = false;
    // the Carpathia
    if (this.carp.visible) {
      let x = CARP[0], z = CARP[2], yaw = 0;
      if (scn === "carpTurn") { yaw = -0.9 * (0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, (f - s.a) / Math.max(1, s.b - s.a)))); x -= 120; z -= 200; }
      if (scn === "carpIce") { x = CARP[0] - 200 + 7 * (f - s.a) / 30; z = CARP[2] - 150; yaw = -0.9; }
      if (scn === "dawnSea") { x = CARP[0] + 40; z = CARP[2] - 40; yaw = Math.PI * 0.85; }
      this.carp.position.set(x, 0, z); this.carp.rotation.set(0, yaw, 0);
    }

    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const stg = stage(id, f, { pos: cam.position, right, sun: sunDir });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const tint = s.light === "lamp" ? "#ffd9a8" : "#ffffff";
    let ai = 0; const used: Actor[] = [];
    for (const p of stg.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++), [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      const ph = ai * 1.37 + p.x * 0.31, sway = 0.022 * Math.sin(t * 1.6 + ph) + 0.008 * Math.sin(t * 3.7 + 2 * ph);
      const bob = 0.012 * sc2 * Math.max(0, Math.sin(t * 2.4 + ph));
      a.mesh.visible = true; a.mesh.position.set(p.x, p.y + bob, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), (p.roll ?? 0) + sway);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      if (a.mat.emissiveMap) a.mat.emissive.set(tint);
      a.mesh.castShadow = L.actorShadow; used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0; const fused: Fx[] = [];
    for (const p0 of stg.fx) {
      const p = p0 as WallFx;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const ef = this.fx(fi++);
      ef.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      ef.use(!!p.soft); ef.mesh.visible = true; ef.mesh.position.set(p.x, p.y, p.z);
      if (p.wall !== undefined) { ef.mesh.rotation.order = "YXZ"; ef.mesh.rotation.set(-(p.tilt ?? 0), p.wall, 0); }
      else if (p.flat) { ef.mesh.rotation.order = "XYZ"; ef.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0); }
      else { ef.mesh.quaternion.copy(cam.quaternion); ef.mesh.rotateZ(p.rot ?? 0); }
      ef.mesh.scale.set(p.w, p.h, 1); fused.push(ef);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return focus;
  }
}
void twoTone;

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
  wc = mix(wc, wCrest, mk.r * 0.35);
  wc = mix(wc, wGlint, mk.b * (0.08 + 0.25 * wf));
  diffuseColor.rgb = wc;`;
