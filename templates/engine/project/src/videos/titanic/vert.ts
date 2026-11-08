// Vertical (1080x1920) Shorts cut from the long video: global switch + per-shot reframing.
export const VERT = { on: false };
/** extended background area (design coords) so 2D boards fill the tall frame */
export const bgArea = (W: number, H: number) => (VERT.on ? { x: -1600, y: -2000, w: W + 3200, h: H + 4000 } : { x: 0, y: 0, w: W, h: H });
/** 3D shots: cover = share of the long video's horizontal view kept (fov widened to match); yaw = pan in radians (+ = left) */
export const VCAM: Record<number, { cover?: number; yaw?: number; pitch?: number }> = {
  11: { cover: 0.7, yaw: -0.25 }, 14: { cover: 0.8, pitch: 0.1 }, 17: { cover: 0.45, pitch: -0.08 }, 19: { cover: 1.0, pitch: 0.24 },
  71: { pitch: -0.1 }, 73: { yaw: -0.3 }, 74: { pitch: -0.05 },
};
/** boards: s = scale of the 1920x1080 design, cx/cy = design point placed at the frame centre column / y = 820 */
export const VBOARD: Record<string, { s?: number; cx?: number; cy?: number }> = {
  myth5: { s: 0.702, cx: 995, cy: 595 },
  split: { s: 0.595, cx: 960, cy: 450 },
  stats: { s: 0.595, cx: 960, cy: 450 },
  law: { s: 1.000, cx: 960, cy: 468 },
  verdict5: { s: 0.711, cx: 975, cy: 585 },
  oneback: { s: 0.654, cx: 960, cy: 450 },
  papers: { s: 0.883, cx: 960, cy: 485 },
  size: { s: 0.575, cx: 968, cy: 460 },
  seats: { s: 0.625, cx: 968, cy: 452 },
  verdict1: { s: 0.711, cx: 975, cy: 585 },
};
export const vfov = (fov: number, id: number) => {
  const c = VCAM[id]?.cover ?? 0.55, t = Math.tan((fov * Math.PI) / 360) * c * (16 / 9) * (16 / 9);
  return (Math.atan(t) * 360) / Math.PI;
};
