// 2D board shots of chapters 2-10 (same style as Board.tsx): myth cards, diagrams, counters, verdict stamps.
import { Pen, bodyFront, INK, Expr, Prop, Outfit } from "./toon";
import { CAST } from "./castdefs";
import { A, ramp, clamp01, STAMPS, SHOTS } from "./story";
import { LE } from "./timing";

const W = 1920, H = 1080, PAPER = "#f4ecd6", RED = "#c0353a", GREEN = "#2f8a4a", NAVY = "#162447", ORANGE = "#d9822b", MUTE = "#5a4a3a";
type G = CanvasRenderingContext2D;
const font = (g: G, size: number, weight = 900) => { g.font = `${weight} ${size}px CapBlack, Montserrat, Arial Black, sans-serif`; };
export const text = (g: G, s: string, x: number, y: number, size: number, col = INK, align: CanvasTextAlign = "center", stroke = 0) => {
  font(g, size); g.textAlign = align; g.textBaseline = "middle";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y);
};
const night = (g: G, f: number, dim = 1) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, dim < 1 ? "#070b1a" : "#0b1430"); gr.addColorStop(1, dim < 1 ? "#141c3a" : "#1f3166"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 220; i++) { const tw = 0.6 + 0.4 * Math.sin(f * 0.07 + i); g.fillStyle = `rgba(255,255,255,${(0.2 + 0.5 * ((i * 37) % 10) / 10) * tw * dim})`; const s = 1 + ((i * 13) % 3); g.fillRect((i * 733 + f * 0.15) % W, (i * 389) % H, s, s); }
};
const card = (p: Pen, x0: number, y0: number, x1: number, y1: number, col = PAPER) => {
  p.poly([[x0 + 10, y0 + 14], [x1 + 10, y0 + 14], [x1 + 10, y1 + 14], [x0 + 10, y1 + 14]], "rgba(0,0,0,0.35)", 0);
  p.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], col, 10);
};
const pop = (f: number, a: number, n = 8) => { const k = clamp01((f - a) / n); return k <= 0 ? 0 : k < 1 ? 0.5 + 0.6 * k - 0.1 * Math.sin(k * Math.PI) : 1; };
/** draws fn scaled by an appear factor around (x, y); nothing before a */
const at = (g: G, f: number, a: number, x: number, y: number, fn: () => void, n = 8) => {
  const k = pop(f, a, n); if (k <= 0) return;
  g.save(); g.translate(x, y); g.scale(k, k); g.globalAlpha = Math.min(1, (f - a) / 4); g.translate(-x, -y); fn(); g.restore();
};
const stamp = (g: G, word: string, col: string, x: number, y: number, k: number, rot = -0.16, size = 110) => {
  if (k <= 0) return;
  const s = 1 + 0.6 * (1 - clamp01(k * 1.5));
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha = Math.min(1, k * 2);
  font(g, size); const w = g.measureText(word).width + 70, h = size * 1.45;
  g.lineWidth = 14; g.strokeStyle = col; g.strokeRect(-w / 2, -h / 2, w, h); g.lineWidth = 5; g.strokeRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28);
  g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(word, 0, 6); g.restore();
};
/** a character drawn on the board: feet at (x, y), height h px; idle bob + blinks */
const who = (g: G, o: Outfit, x: number, y: number, h: number, f: number, opts: { expr?: Expr; prop?: Prop; wave?: number; facing?: -1 | 0 | 1; seed?: number; mode?: "stand" | "sit" | "stroll"; phase?: number } = {}) => {
  const sc = h / 1000;
  g.save(); g.translate(x - 300 * sc, y - 975 * sc + 5 * Math.max(0, Math.sin(f * 0.15 + x))); g.scale(sc, sc);
  g.translate(300, 975); g.rotate(0.02 * Math.sin(f * 0.11 + x)); g.translate(-300, -975);
  const blink = ((f + Math.round(x)) % 71) < 3 ? 1 : 0;
  bodyFront(new Pen(g), o, { mode: opts.mode ?? "stand", phase: opts.phase, expr: opts.expr ?? "neutral", prop: opts.prop ?? null, wave: opts.wave, facing: opts.facing ?? 0, seed: opts.seed ?? 3, blink, light: (-120 * Math.PI) / 180 });
  g.restore();
};
const clip = (g: G, f: number, expr: Expr, prop: Prop = "clipboard", x = 330, h = 760, wave?: number) => who(g, CAST.clipboard.o, x, 1020, h, f, { expr, prop, wave, facing: 1, seed: 31 });
const boatIcon = (p: Pen, x: number, y: number, w: number, col = "#f3f0e8", seats = 0, filled = 0) => {
  p.poly([[x - w / 2, y - w * 0.12], [x + w / 2, y - w * 0.12], [x + w * 0.38, y + w * 0.12], [x - w * 0.38, y + w * 0.12]], col, Math.max(2, w * 0.05));
  for (let i = 0; i < seats; i++) { const sx = x - w * 0.36 + (w * 0.72 * (i % 10)) / 9, sy = y - w * 0.04 + (i >= 10 ? w * 0.08 : 0); p.dot(sx, sy, w * 0.022, i < filled ? "#2f8a4a" : "#e8c45a"); }
};
const person = (p: Pen, x: number, y: number, s: number, col: string) => { p.ell(x, y - s * 1.6, s * 0.55, s * 0.55, col, 0); p.poly([[x - s * 0.6, y - s], [x + s * 0.6, y - s], [x + s * 0.5, y], [x - s * 0.5, y]], col, 0); };
const shipSide = (p: Pen, x0: number, y: number, len: number, col = "#16161c") => {
  const h = len * 0.1;
  p.poly([[x0, y - h], [x0 + len, y - h * 1.1], [x0 + len * 0.97, y], [x0 + len * 0.03, y]], col, 6);
  p.poly([[x0 + len * 0.15, y - h * 1.5], [x0 + len * 0.8, y - h * 1.5], [x0 + len * 0.8, y - h], [x0 + len * 0.15, y - h]], "#efe9da", 5);
  for (let i = 0; i < 4; i++) { const fx = x0 + len * (0.25 + (0.5 * i) / 3); p.poly([[fx, y - h * 2.6], [fx + len * 0.04, y - h * 2.6], [fx + len * 0.04, y - h * 1.5], [fx, y - h * 1.5]], "#c98a3c", 5); p.poly([[fx, y - h * 2.6], [fx + len * 0.04, y - h * 2.6], [fx + len * 0.04, y - h * 2.3], [fx, y - h * 2.3]], "#1a1a20", 3); }
};
/** myth intro card; odd myths mirror the layout (card left, Clipboard walking in from the right) so it never repeats twice in a row */
const mythCard = (g: G, p: Pen, f: number, a: number, n: number, l1: string, l2: string, quiet = false) => {
  night(g, f, quiet ? 0.6 : 1);
  const right = n % 2 === 0, cx = right ? 1150 : 770;
  at(g, f, a, cx, 430, () => { card(p, cx - 510, 150, cx + 510, 700, quiet ? "#e6dfcc" : PAPER); text(g, `MYTH #${n}`, cx, 250, 70, quiet ? MUTE : RED); text(g, l1, cx, 400, 84); text(g, l2, cx, 510, 84); }, 10);
  if (right) clip(g, f, quiet ? "neutral" : f < a + 40 ? "grin" : "stern", "clipboard", 330, 720);
  else { const k = ramp(f, a, a + 24), walking = k < 1; who(g, CAST.clipboard.o, 1720 - 120 * k, 1020, 720, f, { expr: walking ? "smile" : "stern", prop: "clipboard", facing: -1, seed: 31, mode: walking ? "stroll" : "stand", phase: (f / 14) % 1 }); }
};
const verdict = (g: G, p: Pen, f: number, a: number, n: number, l1: string, l2: string, word: string, col: string, sf: number, extra?: () => void, quiet = false) => {
  night(g, f, quiet ? 0.6 : 1);
  card(p, 620, 120, 1700, 760, quiet ? "#e6dfcc" : PAPER);
  text(g, `MYTH #${n}`, 1160, 220, 64, quiet ? MUTE : RED); text(g, l1, 1160, 340, 84); text(g, l2, 1160, 440, 84);
  stamp(g, word, col, 1160, 575, ramp(f, sf - 2, sf + 2), -0.12, word.length > 8 ? 84 : 104);
  if (!quiet) clip(g, f, f < sf ? "stern" : "grin", "stamp", 360, 800); else clip(g, f, "neutral", "clipboard", 360, 760);
  extra?.();
  void a;
};
const bullets = (g: G, f: number, items: [number, string, string?][], x: number, y0: number, dy = 90, size = 54) =>
  items.forEach(([a, s, col], i) => at(g, f, a, x + 200, y0 + i * dy, () => text(g, s, x, y0 + i * dy, size, col ?? INK, "left")));

// ---------------- the boards ----------------
export const BOARDS2: Record<string, (g: G, p: Pen, f: number, a: number, b: number) => void> = {
  myth2: (g, p, f, a) => { mythCard(g, p, f, a, 2, "The designer wanted", "64 lifeboats"); at(g, f, A(48, 9), 1150, 640, () => text(g, "...and the owners cut them for looks?", 1150, 630, 42, MUTE)); },
  davits: (g, p, f, a) => {
    night(g, f); card(p, 80, 60, 1840, 800);
    // one Welin davit with four boats
    p.stroke([[300, 700], [300, 360], [380, 250], [520, 250]], 18, NAVY); p.stroke([[520, 250], [520, 300]], 8, NAVY);
    for (let k = 0; k < 4; k++) at(g, f, a + k * 8, 560, 330, () => boatIcon(p, 600 + (k % 2) * 0, 330 + k * 90, 220));
    text(g, "1 DAVIT = 4 BOATS", 420, 760, 44, NAVY);
    const g16 = A(54), g64 = A(55);
    for (let i = 0; i < 16; i++) at(g, f, g16 + i * 2, 1000 + (i % 8) * 100, 200 + Math.floor(i / 8) * 220, () => { p.stroke([[980 + (i % 8) * 100, 300 + Math.floor(i / 8) * 220], [980 + (i % 8) * 100, 180 + Math.floor(i / 8) * 220]], 8, NAVY);
      for (let k = 0; k < 4; k++) boatIcon(p, 1015 + (i % 8) * 100, 190 + Math.floor(i / 8) * 220 + k * 26, 60, f >= g64 ? "#ffe58a" : "#f3f0e8"); }, 6);
    at(g, f, g16, 1400, 610, () => text(g, "16 sets × 4", 1400, 610, 64, NAVY));
    at(g, f, g64, 1400, 700, () => text(g, "= 64 BOATS", 1400, 700, 84, RED, "center", 6));
    at(g, f, A(56), 1400, 770, () => text(g, "ready for rules that might change", 1400, 770, 38, MUTE));
  },
  deckplan: (g, p, f, a) => {
    night(g, f); card(p, 80, 80, 1840, 820);
    text(g, "CARLISLE'S PLANS: ROOM FOR UP TO 64", 960, 160, 54, NAVY);
    p.poly([[160, 470], [1450, 290], [1780, 470], [1450, 650]], "#c9b48a", 8);
    for (let i = 0; i < 64; i++) { const row = Math.floor(i / 16), x = 330 + (i % 16) * 72, y = [330, 390, 550, 610][row];
      at(g, f, a + i, x, y, () => boatIcon(p, x, y, 62, "#f3f0e8"), 4); }
    at(g, f, A(61), 960, 740, () => { stamp(g, "NEVER INSISTED", RED, 960, 740, 1, -0.06, 70); });
  },
  agenda: (g, p, f, a) => {
    night(g, f); card(p, 80, 80, 1840, 820);
    const cx = 560, cy = 450, R0 = 260, sweep = ramp(f, a + 10, A(63) + 30);
    p.ell(cx, cy, R0, R0, "#fbf6e8", 10);
    g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R0 - 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.04); g.closePath(); g.fillStyle = RED; g.fill(); g.restore();
    if (f >= A(63)) { g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R0 - 8, -Math.PI / 2 + Math.PI * 2 * 0.04, -Math.PI / 2 + Math.PI * 2 * (0.04 + 0.96 * sweep)); g.closePath(); g.fillStyle = "#9fb0d8"; g.fill(); g.restore(); }
    for (let h = 0; h < 12; h++) p.stroke([[cx + (R0 - 30) * Math.cos(h / 12 * 6.283), cy + (R0 - 30) * Math.sin(h / 12 * 6.283)], [cx + (R0 - 10) * Math.cos(h / 12 * 6.283), cy + (R0 - 10) * Math.sin(h / 12 * 6.283)]], 6);
    text(g, "A 4-HOUR MEETING", 560, 140, 50, NAVY);
    bullets(g, f, [[a + 20, "Boats: 5–10 minutes", RED], [A(63), "Everything else: the rest", NAVY], [A(64), "Boats were a footnote", MUTE]], 980, 330, 120, 56);
  },
  verdict2: (g, p, f, a) => verdict(g, p, f, a, 2, "The designer wanted", "64 boats", "HALF TRUE", ORANGE, STAMPS.verdict2, () => {
    at(g, f, A(66), 1160, 712, () => text(g, "Space was built in. Nobody filled it.", 1160, 712, 38, MUTE)); }),
  myth3: (g, p, f, a) => { mythCard(g, p, f, a, 3, "The crew never", "practised"); at(g, f, A(72, 6), 1150, 640, () => text(g, "...seen in almost every documentary", 1150, 630, 42, MUTE)); },
  calendar: (g, p, f, a) => {
    night(g, f); card(p, 520, 70, 1400, 820);
    p.poly([[520, 70], [1400, 70], [1400, 220], [520, 220]], RED, 10); text(g, "SUNDAY 14 APRIL 1912", 960, 145, 62, "#ffffff");
    text(g, "late morning:", 960, 330, 50, MUTE); text(g, "LIFEBOAT DRILL", 960, 420, 86, NAVY);
    if (f >= A(73, 9)) { const k = ramp(f, A(73, 9), A(73, 9) + 8); p.stroke([[640, 470], [640 + 640 * k, 370]], 18, RED); }
    at(g, f, A(76, 5), 960, 600, () => text(g, "WHY?", 960, 600, 110, RED, "center", 6));
    at(g, f, A(77), 300, 400, () => { text(g, "wind?", 300, 300, 64, "#ffffff", "center", 8); for (let i = 0; i < 3; i++) p.arc(300, 420 + i * 40, 120 - i * 20, 30, 200, 340, 10, "#cfe0ff"); });
    at(g, f, A(78), 1650, 400, () => { text(g, "church?", 1650, 300, 64, "#ffffff", "center", 8); p.poly([[1590, 520], [1710, 520], [1710, 420], [1650, 360], [1590, 420]], "#f4ecd6", 8); p.stroke([[1650, 360], [1650, 310]], 8); p.stroke([[1630, 330], [1670, 330]], 8); });
  },
  questions: (g, p, f, a) => {
    night(g, f);
    text(g, "A PLAN FOR THIS SHIP?", 960, 140, 84, "#ffffff", "center", 10);
    const qs: [number, string][] = [[A(85), "WHO GOES TO WHICH BOAT?"], [A(86), "HOW FULL IS FULL?"], [A(87), "WHO DECIDES?"]];
    qs.forEach(([t0, s], i) => at(g, f, t0, 960, 330 + i * 170, () => { card(p, 360, 260 + i * 170, 1560, 400 + i * 170); text(g, s, 960, 330 + i * 170, 64, NAVY); }));
    clip(g, f, f > A(87) ? "stern" : "nervous", "clipboard", 200, 640);
  },
  verdict3: (g, p, f, a) => verdict(g, p, f, a, 3, "The crew never", "practised", "MOSTLY FALSE", ORANGE, STAMPS.verdict3, () => {
    at(g, f, A(89), 1160, 712, () => text(g, "Trained: yes.  Rehearsed: no.", 1160, 712, 38, MUTE)); }),
  myth4: (g, p, f, a) => mythCard(g, p, f, a, 4, "Boats left empty", "because of panic"),
  doors: (g, p, f, a) => {
    night(g, f); card(p, 80, 80, 1840, 820);
    text(g, "THE PLAN: TOP THEM UP FROM LOWER DOORS", 960, 150, 50, NAVY);
    shipSide(p, 200, 700, 1500);
    for (let i = 0; i < 3; i++) { const x = 500 + i * 380, y = 330 + 300 * ramp(f, a + i * 10, a + 60 + i * 10); boatIcon(p, x, y, 150, "#f3f0e8", 10, 5); }
    for (let i = 0; i < 3; i++) { const x = 560 + i * 380; p.poly([[x - 26, 600], [x + 26, 600], [x + 26, 650], [x - 26, 650]], "#ffd590", 5); }
    at(g, f, A(111, 9), 1000, 560, () => { for (let i = 0; i < 3; i++) p.stroke([[560 + i * 380, 600], [500 + i * 380, 680]], 10, GREEN); });
    at(g, f, A(112), 960, 450, () => stamp(g, "MOSTLY NEVER HAPPENED", RED, 960, 450, 1, -0.06, 64));
  },
  spare: (g, p, f, a) => {
    night(g, f); card(p, 80, 80, 1840, 820);
    text(g, "THE BOATS THAT GOT AWAY: SEATS USED", 960, 150, 52, NAVY);
    for (let i = 0; i < 18; i++) boatIcon(p, 260 + (i % 6) * 280, 300 + Math.floor(i / 6) * 170, 230, "#f3f0e8", 20, 6 + ((i * 7) % 8));
    if (f >= A(113, 11)) { const k = 0.5 + 0.5 * Math.sin(f * 0.3); g.save(); g.globalAlpha = 0.25 + 0.25 * k; g.fillStyle = "#e8c45a"; g.fillRect(100, 220, 1720, 520); g.restore(); }
    at(g, f, A(113, 11), 960, 520, () => text(g, "400+ EMPTY SEATS", 960, 520, 110, "#e8c45a", "center", 12));
  },
  verdict4: (g, p, f, a) => verdict(g, p, f, a, 4, "Boats left empty", "because of panic", "FALSE", RED, STAMPS.verdict4, () => {
    at(g, f, A(115), 1160, 712, () => text(g, "Not panic. Too much calm, too early.", 1160, 712, 38, MUTE)); }),
  myth5: (g, p, f, a) => mythCard(g, p, f, a, 5, "\"Women and children", "first\" was the rule"),
  split: (g, p, f, a) => {
    night(g, f); card(p, 80, 80, 1840, 820);
    p.poly([[160, 450], [1500, 330], [1780, 450], [1500, 570]], "#c9b48a", 8); p.stroke([[160, 450], [1780, 450]], 6, MUTE);
    text(g, "STARBOARD", 700, 250, 50, GREEN); text(g, "PORT", 700, 680, 50, RED);
    who(g, CAST.murdoch.o, 1600, 420, 200, f, { expr: "stern", seed: 12 }); who(g, CAST.lightoller.o, 1600, 690, 200, f, { expr: "stern", seed: 23 });
    at(g, f, a + 10, 450, 350, () => text(g, "women & children FIRST", 450, 360, 40, GREEN));
    at(g, f, a + 20, 450, 560, () => text(g, "women & children ONLY", 450, 560, 40, RED));
    at(g, f, A(130), 960, 770, () => text(g, "Opposite rules, a few dozen steps apart", 960, 770, 42, NAVY));
    if (f >= A(131)) { const k = 0.5 + 0.5 * Math.sin((f - A(131)) * 0.08); person(p, 1150, 360 + 230 * k, 26, "#2a2a30"); }
  },
  stats: (g, p, f, a) => {
    night(g, f); card(p, 80, 80, 1840, 820);
    text(g, "WHO SURVIVED", 960, 150, 64, NAVY);
    const bars: [number, string, number, string][] = [[A(132), "WOMEN", 74, GREEN], [A(133), "CHILDREN", 52, ORANGE], [A(134), "MEN", 20, RED]];
    bars.forEach(([t0, lab, v, col], i) => { const k = ramp(f, t0, t0 + 20), y = 300 + i * 170; text(g, lab, 470, y, 54, INK, "right");
      if (k > 0) { p.poly([[510, y - 45], [510 + 13 * v * k, y - 45], [510 + 13 * v * k, y + 45], [510, y + 45]], col, 6); text(g, `${Math.round(v * k)}%`, 540 + 13 * v * k, y, 60, col, "left"); } });
  },
  law: (g, p, f, a) => {
    night(g, f); card(p, 460, 80, 1460, 820);
    text(g, "MARITIME LAW", 960, 170, 74, NAVY);
    for (let i = 0; i < 6; i++) p.stroke([[560, 270 + i * 60], [1360 - (i % 3) * 120, 270 + i * 60]], 8, "#b9ae98");
    at(g, f, A(136, 6), 960, 560, () => stamp(g, "NOT IN IT", RED, 960, 560, 1, -0.1, 100));
    at(g, f, A(137), 960, 740, () => text(g, "a custom", 960, 740, 64, MUTE));
    at(g, f, A(138), 960, 790, () => text(g, "Titanic made it famous", 960, 790, 40, NAVY));
  },
  verdict5: (g, p, f, a) => verdict(g, p, f, a, 5, "\"Women and children", "first\" was the rule", "FALSE", RED, STAMPS.verdict5, () => {
    at(g, f, A(140), 1160, 712, () => text(g, "Two rules, one ship, one night.", 1160, 712, 38, MUTE)); }),
  myth6: (g, p, f, a) => mythCard(g, p, f, a, 6, "Third class was", "locked below decks", true),
  gates: (g, p, f, a) => {
    night(g, f, 0.6); card(p, 360, 80, 1560, 820, "#e6dfcc");
    for (let i = 0; i < 9; i++) p.stroke([[520 + i * 110, 220], [520 + i * 110, 680]], 16, "#3a3a44");
    p.stroke([[500, 260], [1420, 260]], 14, "#3a3a44"); p.stroke([[500, 640], [1420, 640]], 14, "#3a3a44");
    at(g, f, A(146), 960, 760, () => text(g, "US immigration rules: classes kept apart", 960, 760, 44, NAVY));
  },
  cutaway: (g, p, f, a) => {
    night(g, f, 0.6); card(p, 80, 80, 1840, 840, "#e6dfcc");
    // side cutaway: hull, decks; third class low at both ends; boats high in the middle
    p.poly([[160, 300], [1780, 260], [1700, 720], [240, 720]], "#2a2a30", 8);
    for (let i = 1; i < 6; i++) p.stroke([[190 + i * 8, 300 + i * 70], [1750 - i * 10, 270 + i * 70]], 4, "#5a5a66");
    for (let i = 0; i < 8; i++) boatIcon(p, 560 + i * 110, 230, 90, "#f3f0e8");
    const third = (x: number) => { g.save(); g.globalAlpha = 0.85; g.fillStyle = "#3f6fb5"; g.fillRect(x, 520, 260, 180); g.restore(); text(g, "3rd", x + 130, 610, 44, "#ffffff"); };
    third(260); third(1400);
    at(g, f, A(152), 960, 170, () => text(g, "boats: top, middle", 960, 170, 40, NAVY));
    if (f >= A(153)) { const k = ramp(f, A(153), A(153) + 60), pts: [number, number][] = [[390, 600], [520, 600], [520, 460], [700, 460], [700, 540], [820, 540], [820, 380], [980, 380], [980, 300], [1050, 260]];
      const n = Math.max(2, Math.round(pts.length * k)); p.stroke(pts.slice(0, n), 10, "#e8c45a"); }
    if (f >= A(148) && f < A(149)) { const k = ramp(f, A(148, 3), A(148, 3) + 90); for (let i = 0; i < 5; i++) person(p, 400 + 600 * k - i * 30, 600 - 330 * k, 16, "#e8c45a"); text(g, "steward John Hart: two groups up", 960, 775, 40, NAVY); }
  },
  signs: (g, p, f, a) => {
    night(g, f, 0.6); card(p, 80, 80, 1840, 840, "#e6dfcc");
    for (let i = 0; i < 5; i++) { const x = 300 + i * 320; person(p, x, 620, 40, "#3f6fb5"); at(g, f, a + i * 6, x, 430, () => { p.ell(x + 40, 440, 70, 50, "#ffffff", 5); text(g, "?", x + 40, 440, 60, NAVY); }); }
    at(g, f, A(155), 960, 200, () => text(g, "the way up was hard to find", 960, 200, 56, NAVY));
    at(g, f, A(156), 960, 720, () => text(g, "some arrived after the boats had gone", 960, 720, 40, MUTE));
    at(g, f, A(157), 960, 785, () => text(g, "others waited where they were told", 960, 785, 40, MUTE));
  },
  onein4: (g, p, f, a) => {
    night(g, f, 0.6); card(p, 360, 80, 1560, 820, "#e6dfcc");
    for (let i = 0; i < 4; i++) person(p, 600 + i * 240, 560, 80, i === 0 && f >= a + 15 ? "#e8c45a" : "#5a5a66");
    text(g, "about 1 in 4 third-class", 960, 200, 60, NAVY); text(g, "passengers survived", 960, 700, 60, NAVY);
  },
  verdict6: (g, p, f, a) => verdict(g, p, f, a, 6, "Third class was", "locked below decks", "MOSTLY MYTH", MUTE, A(159, 5, 0), () => {
    at(g, f, A(160), 1160, 712, () => text(g, "The barriers: distance, language, time", 1160, 712, 38, MUTE)); }, true),
  papers2: (g, p, f, a) => {
    night(g, f);
    const one = (t0: number, x: number, y: number, rot: number, head: string, sub: string) => at(g, f, t0, x, y, () => {
      g.save(); g.translate(x, y); g.rotate(rot); card(p, -440, -260, 440, 260, "#efe8d8"); text(g, "THE DAILY BULLETIN", 0, -200, 48); p.stroke([[-400, -160], [400, -160]], 6);
      text(g, head, 0, -50, 76); text(g, sub, 0, 30, 34, MUTE); for (let i = 0; i < 4; i++) p.stroke([[-400, 100 + i * 30], [400, 100 + i * 30]], 5, "#b9ae98"); g.restore(); }, 12);
    one(a + 6, 760, 420, -0.07, "£5 EACH!", "A baronet pays his boat crew");
    one(A(171, 2), 1180, 520, 0.05, "SCANDAL!", "The newspapers go wild");
    one(A(172, 4), 960, 620, -0.02, "PAID NOT TO GO BACK?", "Boat 1 under fire");
  },
  verdict7: (g, p, f, a) => verdict(g, p, f, a, 7, "Boat one", "was bribed", "FALSE", RED, STAMPS.verdict7, () => {
    at(g, f, A(179), 1160, 712, () => text(g, "No proof of a bribe", 1160, 712, 38, MUTE)); }),
  answer: (g, p, f, a) => {
    night(g, f); card(p, 220, 80, 1700, 860);
    text(g, "WHY DID BOATS LEAVE HALF EMPTY?", 960, 170, 58, RED);
    bullets(g, f, [[A(187), "1. Nobody believed she would sink"], [A(188), "2. Officers didn't trust the boats"], [A(189), "3. One deck, two rules"], [A(190), "4. In the water, they stayed away"]], 320, 330, 130, 56);
  },
  oneback: (g, p, f, a) => {
    night(g, f, 0.6); card(p, 160, 80, 1760, 820, "#e6dfcc");
    text(g, "18 BOATS LOWERED", 960, 160, 64, NAVY);
    for (let i = 0; i < 18; i++) { const special = i === 13, k = special ? ramp(f, A(210), A(210) + 30) : 0;
      g.save(); g.translate(330 + (i % 6) * 250, 330 + Math.floor(i / 6) * 160); g.rotate(Math.PI * k); boatIcon(p, 0, 0, 180, special && f >= A(210) ? "#e8c45a" : "#f3f0e8"); g.restore(); }
    at(g, f, A(210), 960, 770, () => text(g, "ONE WENT BACK", 960, 770, 70, "#c08a10", "center"));
  },
  map: (g, p, f, a) => {
    g.fillStyle = "#1c3a6a"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 12; i++) p.stroke([[0, i * 100], [W, i * 100]], 2, "#2a4c80"); for (let i = 0; i < 20; i++) p.stroke([[i * 100, 0], [i * 100, H]], 2, "#2a4c80");
    const tx = 760, ty = 420, cx = 1240, cy = 700;
    p.ell(tx, ty, 18, 18, RED, 6); text(g, "TITANIC", tx, ty - 60, 50, "#ffffff", "center", 8);
    p.ell(cx, cy, 16, 16, "#e8c45a", 6); text(g, "CARPATHIA", cx, cy + 60, 50, "#ffffff", "center", 8);
    const k = ramp(f, a + 4, a + 30); p.stroke([[cx, cy], [cx + (tx - cx) * k, cy + (ty - cy) * k]], 8, "#e8c45a");
    at(g, f, a + 10, 1050, 520, () => text(g, "58 MILES", 1080, 540, 70, "#e8c45a", "center", 8));
    for (let i = 0; i < 14; i++) { const x = 380 + ((i * 97) % 380) + (i % 2 ? 1000 : 0), y = 180 + ((i * 53) % 160) + (i % 3) * 260; p.poly([[x, y], [x + 18, y - 26], [x + 34, y]], "#e9f3fb", 3); }
  },
  rescued: (g, p, f, a) => {
    night(g, f); card(p, 360, 120, 1560, 800);
    const n = Math.round(705 * ramp(f, a + 4, A(221, 7)));
    text(g, `${n}`, 960, 380, 220, GREEN, "center", 10); text(g, "SURVIVORS", 960, 560, 70, NAVY);
    at(g, f, A(222), 960, 690, () => text(g, "out of about 2,200", 960, 690, 60, MUTE));
  },
  solas: (g, p, f, a) => {
    night(g, f); card(p, 140, 80, 1780, 880);
    text(g, "SOLAS 1914: THE NEW RULES", 960, 160, 64, NAVY);
    const items: [number, string][] = [[A(225), "Lifeboats for everyone aboard"], [A(226), "Crews must drill"], [A(227), "Radio watch, day and night"], [A(228), "An official ice patrol"]];
    items.forEach(([t0, s], i) => at(g, f, t0, 960, 280 + i * 130, () => { p.ell(330, 280 + i * 130, 44, 44, GREEN, 6); p.stroke([[310, 280 + i * 130], [328, 298 + i * 130], [356, 260 + i * 130]], 10, "#ffffff"); text(g, s, 410, 280 + i * 130, 58, INK, "left"); }));
    at(g, f, A(229), 960, 830, () => text(g, "...still on watch today", 960, 830, 40, MUTE));
  },
  ferry: (g, p, f, a) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#8cc4ef"); gr.addColorStop(1, "#d8ecfa"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    p.poly([[0, 760], [W, 760], [W, H], [0, H]], "#c9b48a", 0);
    p.poly([[1300, 200], [1760, 200], [1760, 420], [1300, 420]], "#2f8a4a", 10); text(g, "ASSEMBLY", 1530, 280, 56, "#ffffff"); text(g, "STATION", 1530, 360, 56, "#ffffff");
    const jacket: Outfit = { ...CAST.firstman.o, lifebelt: false, jacket: "#e8622a", dress: undefined, coat: false, hat: "hair", hair: "#3a2a20" };
    for (let i = 0; i < 5; i++) who(g, { ...jacket, hair: ["#3a2a20", "#c9a24a", "#6a4a30", "#2a201a", "#8a5a3a"][i] }, 500 + i * 170, 900, 360, f, { expr: (["smile", "neutral", "smile_closed"] as Expr[])[i % 3], seed: 3 + i * 5 });
    clip(g, f, f > A(230, 14) ? "grin" : "smile", null, 220, 700, 0.6);
    at(g, f, A(230, 15), 1530, 560, () => stamp(g, "THAT'S TITANIC", RED, 1530, 560, 1, -0.1, 70));
  },
  callback: (g, p, f, a) => {
    night(g, f); card(p, 120, 60, 1800, 800);
    const cols = 55, x0 = 200, y0 = 110, d = 17.5, fill = f >= A(233) ? ramp(f, A(233), A(233) + 30) : 0;
    for (let i = 0; i < 2200; i++) { const x = x0 + (i % cols) * d, y = y0 + Math.floor(i / cols) * d; const seat = i < 1178; g.fillStyle = seat ? (fill > i / 1178 ? GREEN : "#e3d9c2") : f >= A(233, 12) ? RED : "#7a6a5a"; g.fillRect(x, y, d - 4, d - 4); }
    text(g, "1,178 SEATS", 1210, 200, 60, GREEN, "left"); text(g, "2,200 PEOPLE", 1210, 300, 60, INK, "left");
    if (f >= A(233, 12)) { text(g, "EVEN IF FULL:", 1210, 470, 48, RED, "left"); text(g, "1,000+", 1210, 560, 96, RED, "left", 6); text(g, "no seat", 1210, 650, 48, RED, "left"); }
  },
  teaser: (g, p, f, a) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#5a6e8a"); gr.addColorStop(1, "#a9b8c8"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    p.poly([[0, 820], [W, 820], [W, H], [0, H]], "#3a5a7a", 0);
    const tw = Math.sin(f * 0.25) * 30;
    for (const x of [460, 1460]) p.poly([[x - 20, 820], [x + 20, 820], [x + 14, 300], [x - 14, 300]], "#4a5560", 6);
    const pts: [number, number][] = []; for (let i = 0; i <= 40; i++) { const x = 160 + i * 40; pts.push([x, 620 + tw * Math.sin((i / 40) * Math.PI * 2)]); } p.stroke(pts, 22, "#6a7580");
    text(g, "NEXT TIME", 960, 140, 70, "#ffffff", "center", 10); text(g, "THE BRIDGE THAT DANCED", 960, 240, 84, "#e8c45a", "center", 10);
    at(g, f, A(238), 960, 380, () => text(g, "SUBSCRIBE", 960, 380, 80, RED, "center", 10));
  },
  endscreen: (g, p, f, a) => {
    night(g, f);
    text(g, "@LeoKnowledgeSharing", 480, 210, 64, "#ffffff", "center", 10);
    text(g, "Which story should we tell next?", 480, 320, 42, "#e8c45a", "center", 8);
    text(g, "Tell us in the comments", 480, 385, 36, "#ffffff", "center", 8);
    clip(g, f, "smile", null, 300, 600, 0.4 + 0.4 * Math.sin(f * 0.25));
    void a; void p;
  },
};
void SHOTS; void LE;
