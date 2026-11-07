// 2D "Clipboard's board" shots: title, 1912 front pages, the size chart, the seats grid, the verdict stamp.
// Drawn on one 1920 x 1080 canvas per frame (no WebGL: these frames render fast on the laptop).
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { Pen, bodyFront, INK, Expr, Prop } from "./toon";
import { CAST } from "./castdefs";
import { ramp, kickAt, clamp01, SHOTS } from "./story";
import { BOARDS2 } from "./Board2";

const W = 1920, H = 1080, PAPER = "#f4ecd6", RED = "#c0353a", GREEN = "#2f8a4a", NAVY = "#162447";
const font = (g: CanvasRenderingContext2D, size: number, weight = 900) => { g.font = `${weight} ${size}px CapBlack, Montserrat, Arial Black, sans-serif`; };
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, col = INK, align: CanvasTextAlign = "center", stroke = 0) => {
  font(g, size); g.textAlign = align; g.textBaseline = "middle";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y);
};
const night = (g: CanvasRenderingContext2D) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#0b1430"); gr.addColorStop(1, "#1f3166"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(255,255,255,${0.25 + 0.6 * ((i * 37) % 10) / 10})`; const s = 1 + ((i * 13) % 3); g.fillRect((i * 733) % W, (i * 389) % H, s, s); }
};
const card = (p: Pen, x0: number, y0: number, x1: number, y1: number, col = PAPER) => {
  p.poly([[x0 + 10, y0 + 14], [x1 + 10, y0 + 14], [x1 + 10, y1 + 14], [x0 + 10, y1 + 14]], "rgba(0,0,0,0.35)", 0);
  p.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], col, 10);
};
/** rubber stamp: rotated box + word, scale-in over 4 frames */
const stamp = (g: CanvasRenderingContext2D, p: Pen, word: string, col: string, x: number, y: number, k: number, rot = -0.18, sz = 1) => {
  if (k <= 0) return;
  const s = 1 + 0.6 * (1 - clamp01(k * 1.5));
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * sz, s * sz); g.globalAlpha = Math.min(1, k * 2);
  font(g, 110); const w = g.measureText(word).width + 70;
  g.lineWidth = 14; g.strokeStyle = col; g.strokeRect(-w / 2, -80, w, 160); g.lineWidth = 5; g.strokeRect(-w / 2 + 14, -66, w - 28, 132);
  g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(word, 0, 6);
  g.restore(); void p;
};
/** Clipboard drawn at (x, foot y) with a given height in px */
const guide = (g: CanvasRenderingContext2D, x: number, y: number, h: number, expr: Expr, prop: Prop, f: number, wave?: number, facing: -1 | 0 | 1 = 1) => {
  const sc = h / 1000;
  g.save(); g.translate(x - 300 * sc, y - 975 * sc + 6 * Math.max(0, Math.sin(f * 0.15))); g.scale(sc, sc);
  g.translate(300, 975); g.rotate(0.02 * Math.sin(f * 0.11)); g.translate(-300, -975);
  const blink = (f % 71) < 3 ? 1 : 0;
  bodyFront(new Pen(g), CAST.clipboard.o, { mode: "stand", expr, prop, wave, facing, seed: 31, blink, light: (-120 * Math.PI) / 180 });
  g.restore();
};

// ---------------- boards ----------------
const title = (g: CanvasRenderingContext2D, p: Pen, f: number) => {
  night(g);
  const k = ramp(f, 766, 780);
  g.save(); g.translate(1060, 470); g.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); g.globalAlpha = k; g.translate(-1060, -470);
  card(p, 560, 110, 1560, 700);
  text(g, "TITANIC'S", 1060, 210, 92); text(g, "LIFEBOATS", 1060, 320, 120, NAVY);
  const s7 = ramp(f, 792, 800);
  if (s7 > 0) { g.save(); g.translate(1060, 490); g.scale(0.4 + 0.6 * s7 + 0.15 * Math.sin(s7 * Math.PI), 0.4 + 0.6 * s7 + 0.15 * Math.sin(s7 * Math.PI)); text(g, "7 MYTHS", 0, 0, 150, RED, "center", 8); g.restore(); }
  text(g, "vs. the facts", 1060, 610, 54, "#5a4a3a");
  g.restore();
  g.save(); g.translate(0, 0); g.scale(1, 1);
  stamp(g, p, "TRUE", GREEN, 830, 765, ramp(f, 875, 879), -0.12, 0.62);
  stamp(g, p, "FALSE", RED, 1300, 765, ramp(f, 909, 913), 0.1, 0.62); g.restore();
  const seal = ramp(f, 966, 980);
  if (seal > 0) {
    g.save(); g.translate(1640, 150); g.rotate((1 - seal) * 3); g.scale(seal, seal);
    p.ell(0, 0, 120, 120, "#e8c45a", 8); p.ell(0, 0, 96, 96, null, 4);
    text(g, "1914", 0, -10, 64); text(g, "LAW OF THE SEA", 0, 50, 20); g.restore();
  }
  guide(g, 250, 1020, 640, f < 870 ? "grin" : f < 960 ? "stern" : "smile", f >= 868 && f < 925 ? "stamp" : "clipboard", f, undefined, 1);
};
const papers = (g: CanvasRenderingContext2D, p: Pen, f: number) => {
  night(g);
  const one = (f0: number, x: number, y: number, rot: number, head: string, sub: string) => {
    const k = ramp(f, f0 - 14, f0);
    if (k <= 0) return;
    g.save(); g.translate(x, y); g.rotate(rot + (1 - k) * 6); g.scale(0.2 + 0.8 * k, 0.2 + 0.8 * k);
    card(p, -440, -300, 440, 300, "#efe8d8");
    text(g, "THE DAILY BULLETIN", 0, -240, 48, INK); p.stroke([[-400, -200], [400, -200]], 6); text(g, "APRIL 1912 · ONE PENNY", 0, -175, 22, "#5a4a3a");
    text(g, head, 0, -70, 76, INK); text(g, sub, 0, 10, 34, "#5a4a3a");
    for (let i = 0; i < 6; i++) { p.stroke([[-400, 80 + i * 30], [-20, 80 + i * 30]], 5, "#b9ae98"); p.stroke([[20, 80 + i * 30], [400, 80 + i * 30]], 5, "#b9ae98"); }
    g.restore();
  };
  one(1165, 820, 470, -0.08, "TITANIC LOST", "Fury over the lifeboats");
  one(1213, 1100, 560, 0.06, "NOT ENOUGH BOATS!", "Seats for barely half");
  one(1258, 960, 650, -0.03, "WHO BROKE THE RULES?", "Questions in Parliament");
};
const silhouette = (p: Pen, x0: number, y: number, len: number, col: string, funnels: number) => {
  const h = len * 0.1;
  p.poly([[x0, y - h], [x0 + len, y - h * 1.1], [x0 + len * 0.97, y], [x0 + len * 0.03, y]], col, 6);
  p.poly([[x0 + len * 0.15, y - h * 1.5], [x0 + len * 0.8, y - h * 1.5], [x0 + len * 0.8, y - h], [x0 + len * 0.15, y - h]], "#efe9da", 5);
  for (let i = 0; i < funnels; i++) { const fx = x0 + len * (0.25 + (0.5 * i) / Math.max(1, funnels - 1)); p.poly([[fx, y - h * 2.6], [fx + len * 0.04, y - h * 2.6], [fx + len * 0.04, y - h * 1.5], [fx, y - h * 1.5]], "#c98a3c", 5); p.poly([[fx, y - h * 2.6], [fx + len * 0.04, y - h * 2.6], [fx + len * 0.04, y - h * 2.3], [fx, y - h * 2.3]], "#1a1a20", 3); }
};
const sizeChart = (g: CanvasRenderingContext2D, p: Pen, f: number) => {
  night(g);
  const z = 1 + 0.04 * ramp(f, 1900, 2110);
  g.save(); g.translate(960, 540); g.scale(z, z); g.translate(-960, -540);
  card(p, 60, 100, 1860, 800);
  text(g, "SHIP SIZE (gross tons)", 1800, 160, 40, NAVY, "right");
  p.stroke([[120, 640], [1800, 640]], 6, "#7a8aa8");
  silhouette(p, 160, 640, 260, "#3a3a48", 1);
  text(g, "biggest liners", 290, 690, 30, "#5a4a3a"); text(g, "of 1894: ~13,000", 290, 735, 34, "#5a4a3a");
  const k = ramp(f, 1918, 1940);
  if (k > 0) { g.save(); g.translate((1 - k) * 900, 0); silhouette(p, 520, 640, 1200, "#16161c", 4); text(g, "TITANIC: 46,328", 1120, 710, 50, RED); g.restore(); }
  const bars = ramp(f, 1990, 2010);
  if (bars > 0) { p.poly([[160, 200], [160 + 260 * bars, 200], [160 + 260 * bars, 230], [160, 230]], "#7a8aa8", 5); p.poly([[160, 250], [160 + 1200 * bars, 250], [160 + 1200 * bars, 280], [160, 280]], RED, 5); if (bars > 0.9) { text(g, "4.6 ×", 1390, 262, 60, RED, "left", 6); text(g, "table top: 10,000", 160, 180, 26, "#5a4a3a", "left"); } }
  g.restore();
};
const seats = (g: CanvasRenderingContext2D, p: Pen, f: number) => {
  night(g);
  const z = 1 + 0.25 * ramp(f, 2765, 2810);
  g.save(); g.translate(960, 560); g.scale(z, z); g.translate(-960 - 60 * ramp(f, 2765, 2810), -560);
  card(p, 120, 60, 1800, 800);
  const cols = 55, x0 = 200, y0 = 100, d = 16;
  const seatN = Math.round(1178 * ramp(f, 2478, 2530)), peopleN = Math.round(2200 * ramp(f, 2572, 2620));
  for (let i = 0; i < 2200; i++) {
    const x = x0 + (i % cols) * d, y = y0 + Math.floor(i / cols) * d;
    const seated = i < seatN, person = i < peopleN;
    if (!seated && !person) { g.fillStyle = "#e3d9c2"; g.fillRect(x, y, d - 4, d - 4); continue; }
    g.fillStyle = seated ? GREEN : f >= 2770 ? RED : "#7a6a5a"; g.fillRect(x, y, d - 4, d - 4);
  }
  text(g, `${seatN.toLocaleString("en-US")} SEATS`, 1210, 200, 60, GREEN, "left");
  if (peopleN > 0) text(g, `${peopleN.toLocaleString("en-US")} PEOPLE`, 1210, 300, 60, INK, "left");
  if (f >= 2770) { text(g, "NO SEAT:", 1210, 470, 52, RED, "left"); text(g, "1,000+", 1210, 560, 96, RED, "left", 6); }
  g.restore();
};
const verdict1 = (g: CanvasRenderingContext2D, p: Pen, f: number) => {
  night(g);
  card(p, 620, 120, 1700, 760);
  text(g, "MYTH #1", 1160, 220, 64, RED); text(g, "Titanic broke", 1160, 350, 96); text(g, "the law", 1160, 460, 96);
  stamp(g, p, "FALSE", RED, 1180, 620, ramp(f, 3124, 3128), -0.14);
  guide(g, 360, 1030, 800, f < 3124 ? "stern" : "grin", "stamp", f, undefined, 1);
};
const BOARDS: Record<string, (g: CanvasRenderingContext2D, p: Pen, f: number) => void> = { title, papers, size: sizeChart, seats, verdict1 };

export const Board: React.FC<{ id: string; f: number; shot: number }> = ({ id, f, shot }) => {
  const sh = SHOTS[shot - 1];
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current!, g = cv.getContext("2d")!, k = kickAt(f);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    // every board creeps (a slow push toward the centre) so no frame ever holds still
    const u = clamp01((f - sh.a) / Math.max(1, sh.b - sh.a)), z = 1 + 0.025 * u + 0.012 * Math.abs(k);
    g.translate(W / 2, H / 2); g.rotate(0.004 * k); g.scale(z, z); g.translate(-W / 2, -H / 2 + 6 * k);
    if (BOARDS[id]) BOARDS[id](g, new Pen(g), f); else BOARDS2[id](g, new Pen(g), f, sh.a, sh.b);
  }, [id, f, sh]);
  return <AbsoluteFill><canvas ref={ref} width={W} height={H} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};
