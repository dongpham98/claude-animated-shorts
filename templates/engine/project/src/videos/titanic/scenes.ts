// Per-scene placement of the loose boats (sea scenes, lowering boats, the Carpathia) shared by world.ts (meshes)
// and cast.ts (who sits where). Pure functions of the scene name and the frame.
import { V3, BOAT_DECK, ramp } from "./story";
export type BoatPl = { kind: "lifeboat" | "cutter" | "collapsible"; x: number; y: number; z: number; yaw: number; roll?: number; flip?: boolean; swamp?: boolean;
  lantern?: boolean; n: number; who?: string };
/** after the sinking: the boats drift around here (the ship is not drawn) */
export const L14: V3 = [20, 0, 80];
export const CARP: V3 = [300, 0, 260];
const W0 = -0.52;
export const boatsFor = (scene: string | undefined, f: number, a: number): BoatPl[] => {
  const t = (f - a) / 30;
  switch (scene) {
    case "southBoat": return [{ kind: "lifeboat", x: 40 - 0.6 * t, y: W0, z: 26, yaw: 0, n: 7, who: "seamen" }];
    case "southWide": return [{ kind: "lifeboat", x: 30 - 0.6 * t, y: W0, z: 26, yaw: 0, n: 7, who: "seamen" }];
    case "boat7": { const y = BOAT_DECK - 1.0 - (BOAT_DECK - 1.0 - W0) * ramp(f, a - 20, a + 330); return [{ kind: "lifeboat", x: 48, y, z: 15.5, yaw: 0, roll: 0.012 * Math.sin(f * 0.21), n: 28, who: "boat7" }]; }
    case "hookAgain": { const y = BOAT_DECK - 2.1 - 9 * ramp(f, a, a + 400); return [{ kind: "cutter", x: 72, y, z: 15.6, yaw: 0, n: 12, who: "boat1" }]; }
    case "boat1Ship": return [{ kind: "cutter", x: 62 - 0.4 * t, y: W0, z: 30 + 0.8 * t, yaw: 0.5, n: 12, who: "boat1" }];
    case "boat1Dark": return [{ kind: "cutter", x: 62, y: W0, z: 34, yaw: 0.5 + 0.02 * t, n: 12, who: "boat1" }];
    case "waiting": return [[0, 40, 0.3, 26], [36, 52, 0.9, 30], [70, 44, 0.1, 12], [18, 96, 0.1, 36], [58, 104, 0.5, 28], [92, 80, 0.2, 24]].map(([x, z, yaw, n], k) =>
      ({ kind: (k === 2 ? "cutter" : "lifeboat") as BoatPl["kind"], x, y: W0, z, yaw: yaw + 0.01 * t, n: Math.round(n / 2), who: "waiting" }));
    case "boat14": case "raft": {
      const raft: BoatPl[] = [0, 1, 2, 3, 4].map((k) => ({ kind: (k === 3 ? "collapsible" : "lifeboat") as BoatPl["kind"], x: L14[0] + (k - 2) * 0.2, y: W0, z: L14[2] + (k - 2) * 2.9, yaw: 0, n: k === 2 ? 40 : 34, who: k === 2 ? "boat14" : "raft" }));
      if (scene === "raft") raft[2].n = Math.max(8, Math.round(40 - 32 * ramp(f, a + 60, a + 160)));
      return raft;
    }
    case "rowBack": return [{ kind: "lifeboat", x: L14[0] - 1.6 * t, y: W0, z: L14[2] - 6, yaw: Math.PI, n: 8, who: "rowers", lantern: true }];
    case "lantern": return [{ kind: "lifeboat", x: L14[0] - 40, y: W0, z: L14[2] - 6, yaw: Math.PI, n: 8, who: "rowers", lantern: true }];
    case "boat4": return [{ kind: "lifeboat", x: L14[0] - 30, y: W0, z: L14[2] + 20, yaw: 2.2, n: 30, who: "boat4" }];
    case "collA": return [{ kind: "collapsible", x: L14[0] + 10, y: -0.55, z: L14[2] + 30, yaw: 0.4, swamp: true, n: 12, who: "collA" },
      { kind: "lifeboat", x: L14[0] + 2 + 1.2 * t, y: W0, z: L14[2] + 26, yaw: 0.2, n: 8, who: "rowers" }];
    case "collB": return [{ kind: "collapsible", x: L14[0] - 20, y: 0.28, z: L14[2] + 40, yaw: -0.3, flip: true, n: 28, who: "collB" }];
    case "dawnSea": return [[CARP[0] - 160, CARP[2] - 120, 0.2], [CARP[0] - 220, CARP[2] - 60, 1.1], [CARP[0] - 120, CARP[2] - 200, -0.5], [CARP[0] - 260, CARP[2] - 170, 0.7]]
      .map(([x, z, yaw]) => ({ kind: "lifeboat" as const, x, y: W0, z, yaw, n: 10, who: "waiting" }));
    case "ladder": return [{ kind: "lifeboat", x: CARP[0] - 10, y: W0, z: CARP[2] + 13.5, yaw: 0, n: 22, who: "ladder" }];
    default: return [];
  }
};
/** seat spots inside a placed boat: [x, y, z] world, two per thwart, middle-out */
export const seatsOf = (b: BoatPl, n: number): V3[] => {
  const L = b.kind === "cutter" ? 7.6 : b.kind === "collapsible" ? 8.0 : 9.1, D = b.kind === "cutter" ? 0.95 : 1.15;
  const c = Math.cos(b.yaw), s = Math.sin(b.yaw), out: V3[] = [];
  const rows = Math.max(1, Math.ceil(n / 3)), across = n > 14 ? [-0.75, 0, 0.75] : [-0.5, 0.5];
  for (let i = 0; i < n; i++) {
    const r = i % rows, k = Math.floor(i / rows) % across.length, dx = (r / Math.max(1, rows - 1) - 0.5) * L * 0.72, dz = across[k];
    out.push([b.x + dx * c + dz * s, b.y + D * 0.6 - 0.05, b.z - dx * s + dz * c]);
  }
  return out;
};
