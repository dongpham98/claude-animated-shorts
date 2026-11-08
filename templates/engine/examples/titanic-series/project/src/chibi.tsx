// Chibi cut-out puppet in SVG. Origin = between the feet on the ground; puppet is ~200 units tall.
// Every part is a separate shape so it can move: legs, torso, arms, head, eyes, brows, mouth, hair, hat, props.
import React from "react";
import { INK, LINE, SHADE, PAL, clamp } from "./style";

export type HairStyle = "none" | "sidepart" | "updo" | "short";
export type Spec = {
  id: string; name: string;
  skin: string; hair: string; hairStyle: HairStyle;
  beard?: "full" | "moustache"; beardColor?: string;
  outfit: "captain" | "suit" | "band" | "dress";
  main: string; mainDark: string; trim?: string;
  hat?: "captain" | "bighat"; hatColor?: string;
  prop?: "violin" | "plans" | "notebook";
  female?: boolean; scale?: number;
};
export type Pose = {
  walk?: number; phase?: number;         // walk amount 0..1 and cycle phase (radians)
  armL?: number; armR?: number;          // raise angle in degrees (0 = hanging, 90 = sideways, 160 = up)
  head?: number; nod?: number;           // head tilt (deg) and nod (0..1, head dips)
  look?: number;                         // -1..1 where the face looks (in the puppet's own space)
  blink?: number;                        // 0 open .. 1 closed
  mouth?: "smile" | "grin" | "o" | "flat"; talk?: number; // talk 0..1 = open amount
  brow?: number;                         // 0 normal, 1 raised, -1 frown
  eyes?: "normal" | "happy" | "squint" | "wide"; // eye shape
  write?: number;                        // pen stroke phase (notebook prop)
  bow?: number;                          // violin bow stroke -1..1
  sway?: number;                         // idle sway (deg)
  breathe?: number;                      // 0..1 breathing phase value
};

const st = { stroke: INK, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const rot = (x: number, y: number, deg: number): [number, number] => {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [x * c - y * s, x * s + y * c];
};

const SHOULDER_Y = -84, SHOULDER_X = 27, ARM_LEN = 38;

const Arm: React.FC<{ spec: Spec; side: -1 | 1; raise: number; children?: React.ReactNode }> = ({ spec, side, raise, children }) => {
  const r = -side * (10 + raise);
  const sleeve = spec.outfit === "dress" ? spec.main : spec.main;
  const cuff = spec.outfit === "captain" ? PAL.gold : spec.outfit === "band" ? (spec.trim ?? PAL.bandGreen) : spec.outfit === "dress" ? PAL.lace : PAL.shirt;
  return (
    <g transform={`translate(${side * SHOULDER_X} ${SHOULDER_Y}) rotate(${r})`}>
      <path d={`M -8 -4 Q -9 ${ARM_LEN * 0.6} -7 ${ARM_LEN - 6} L 7 ${ARM_LEN - 6} Q 9 ${ARM_LEN * 0.6} 8 -4 Q 0 -10 -8 -4 Z`} fill={sleeve} {...st} />
      <path d={`M -6 0 Q -7 ${ARM_LEN * 0.6} -5 ${ARM_LEN - 7} L 1 ${ARM_LEN - 7} Q 2 ${ARM_LEN * 0.6} 1 0 Z`} fill={SHADE} transform={side < 0 ? "" : "scale(-1 1)"} />
      <rect x={-7.5} y={ARM_LEN - 10} width={15} height={5} rx={2} fill={cuff} {...st} strokeWidth={LINE * 0.8} />
      {spec.outfit === "captain" && <line x1={-7} y1={ARM_LEN - 13} x2={7} y2={ARM_LEN - 13} stroke={PAL.gold} strokeWidth={2} />}
      <circle cx={0} cy={ARM_LEN} r={8} fill={spec.skin} {...st} />
      {children}
    </g>
  );
};

/** hand position in body space for an arm (used by props like the violin bow) */
export const handPos = (side: -1 | 1, raise: number): [number, number] => {
  const [x, y] = rot(0, ARM_LEN, -side * (10 + raise));
  return [side * SHOULDER_X + x, SHOULDER_Y + y];
};

const Leg: React.FC<{ spec: Spec; side: -1 | 1; swing: number; lift: number }> = ({ spec, side, swing, lift }) => {
  const pants = spec.outfit === "captain" ? PAL.navyDark : spec.outfit === "band" ? PAL.bandJacket : spec.mainDark;
  return (
    <g transform={`translate(${side * 12} ${-32 - lift}) rotate(${swing})`}>
      <path d="M -8 -2 L -8 24 Q 0 28 8 24 L 8 -2 Z" fill={pants} {...st} />
      <ellipse cx={side * 2 + 3} cy={28} rx={11} ry={6.5} fill={PAL.shoe} {...st} />
      <ellipse cx={side * 2 + 6} cy={26} rx={3} ry={1.6} fill="#fff" opacity={0.35} />
    </g>
  );
};

const Torso: React.FC<{ spec: Spec }> = ({ spec }) => {
  const o = spec.outfit;
  if (o === "dress") {
    return (
      <g>
        {/* skirt */}
        <path d="M -27 -50 Q -36 -20 -44 -6 Q 0 4 44 -6 Q 36 -20 27 -50 Z" fill={spec.main} {...st} />
        <path d="M 6 -50 Q 14 -24 18 -4 Q 32 -4 44 -6 Q 36 -20 27 -50 Z" fill={SHADE} />
        <path d="M -40 -12 Q 0 -4 40 -12" fill="none" stroke={spec.mainDark} strokeWidth={2.4} />
        {/* bodice */}
        <path d="M -25 -90 Q -30 -70 -26 -48 Q 0 -42 26 -48 Q 30 -70 25 -90 Q 0 -96 -25 -90 Z" fill={spec.main} {...st} />
        <path d="M 8 -92 Q 22 -86 25 -88 Q 30 -70 26 -48 Q 16 -46 10 -46 Q 14 -70 8 -92 Z" fill={SHADE} />
        <path d="M -14 -92 Q 0 -78 14 -92" fill={PAL.lace} {...st} strokeWidth={LINE * 0.8} />
        <path d="M -26 -52 Q 0 -46 26 -52" fill="none" stroke={spec.mainDark} strokeWidth={5} />
        <circle cx={0} cy={-80} r={3.2} fill={PAL.gold} {...st} strokeWidth={1.6} />
      </g>
    );
  }
  const body = "M -26 -90 Q -31 -60 -27 -30 Q 0 -25 27 -30 Q 31 -60 26 -90 Q 0 -97 -26 -90 Z";
  return (
    <g>
      <path d={body} fill={spec.main} {...st} />
      <path d="M 8 -93 Q 22 -88 26 -90 Q 31 -60 27 -30 Q 17 -27 11 -27 Q 15 -60 8 -93 Z" fill={SHADE} />
      {o === "captain" && (
        <g>
          <path d="M -9 -94 L 0 -78 L 9 -94" fill={PAL.shirt} {...st} strokeWidth={LINE * 0.7} />
          <path d="M -3 -84 L 0 -78 L 3 -84" fill={INK} />
          {[-62, -50, -38].map((y) => <g key={y}><circle cx={-9} cy={y} r={2.6} fill={PAL.gold} stroke={INK} strokeWidth={1.2} /><circle cx={9} cy={y} r={2.6} fill={PAL.gold} stroke={INK} strokeWidth={1.2} /></g>)}
          <path d="M 0 -78 L 0 -28" stroke={INK} strokeWidth={1.6} />
        </g>
      )}
      {o === "suit" && (
        <g>
          <path d="M -10 -94 L 0 -58 L 10 -94 Z" fill={PAL.shirt} {...st} strokeWidth={LINE * 0.7} />
          <path d="M -2.5 -88 L 2.5 -88 L 3.5 -66 L 0 -60 L -3.5 -66 Z" fill={PAL.tie} stroke={INK} strokeWidth={1.4} />
          <path d="M -10 -94 L -15 -74 L -4 -62 M 10 -94 L 15 -74 L 4 -62" fill="none" stroke={INK} strokeWidth={1.8} />
          <circle cx={-3} cy={-46} r={2.2} fill={INK} /><circle cx={-3} cy={-37} r={2.2} fill={INK} />
          <path d="M 13 -56 L 22 -56" stroke={PAL.white} strokeWidth={2.5} />
        </g>
      )}
      {o === "band" && (
        <g>
          <path d="M -12 -94 Q 0 -86 12 -94 L 12 -86 Q 0 -78 -12 -86 Z" fill={spec.trim ?? PAL.bandGreen} {...st} strokeWidth={LINE * 0.7} />
          {[-74, -62, -50, -38].map((y) => <circle key={y} cx={0} cy={y} r={2.4} fill={PAL.gold} stroke={INK} strokeWidth={1.1} />)}
          <path d="M 0 -84 L 0 -28" stroke={INK} strokeWidth={1.4} />
          <path d="M -27 -34 Q 0 -29 27 -34" fill="none" stroke={spec.trim ?? PAL.bandGreen} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

const HairBack: React.FC<{ spec: Spec }> = ({ spec }) => {
  if (spec.hairStyle === "updo") return <path d="M -54 -132 Q -58 -106 -42 -102 L 42 -102 Q 58 -106 54 -132 Q 50 -192 0 -194 Q -50 -192 -54 -132 Z" fill={spec.hair} {...st} />;
  if (spec.hairStyle === "sidepart") return <path d="M -50 -140 Q -52 -112 -44 -108 L 44 -108 Q 52 -112 50 -140 Q 46 -190 0 -192 Q -46 -190 -50 -140 Z" fill={spec.hair} {...st} />;
  if (spec.hairStyle === "short") return <path d="M -49 -140 Q -50 -118 -45 -114 L 45 -114 Q 50 -118 49 -140 Q 46 -188 0 -190 Q -46 -188 -49 -140 Z" fill={spec.hair} {...st} />;
  return null;
};

const HairFront: React.FC<{ spec: Spec; look: number }> = ({ spec, look }) => {
  const s = look * 4;
  if (spec.hairStyle === "sidepart") return (
    <g transform={`translate(${s} 0)`}>
      <path d="M -50 -138 Q -50 -188 -2 -191 Q 44 -189 50 -140 Q 46 -158 30 -164 Q 4 -174 -18 -170 Q -38 -164 -50 -138 Z" fill={spec.hair} {...st} />
      <path d="M -18 -170 Q -6 -184 14 -186" fill="none" stroke={INK} strokeWidth={2} />
    </g>
  );
  if (spec.hairStyle === "updo") return (
    <g transform={`translate(${s} 0)`}>
      <path d="M -52 -132 Q -54 -184 0 -192 Q 54 -184 52 -132 Q 46 -158 22 -166 Q 6 -150 -10 -168 Q -36 -162 -52 -132 Z" fill={spec.hair} {...st} />
      <path d="M -50 -130 Q -58 -112 -48 -100" fill="none" stroke={INK} strokeWidth={LINE} />
      <path d="M -50 -130 Q -56 -114 -48 -100 Q -44 -116 -50 -130 Z" fill={spec.hair} />
    </g>
  );
  if (spec.hairStyle === "short") return (
    <g transform={`translate(${s} 0)`}>
      <path d="M -49 -140 Q -46 -186 0 -190 Q 46 -186 49 -140 Q 40 -162 18 -166 Q 6 -156 -8 -166 Q -34 -164 -49 -140 Z" fill={spec.hair} {...st} />
    </g>
  );
  return null;
};

const Hat: React.FC<{ spec: Spec; look: number }> = ({ spec, look }) => {
  const s = look * 3;
  if (spec.hat === "captain") return (
    <g transform={`translate(${s} 0)`}>
      <path d="M -48 -166 Q -54 -200 0 -204 Q 54 -200 48 -166 Z" fill={spec.hatColor ?? PAL.navy} {...st} />
      <path d="M 14 -202 Q 40 -198 46 -170 L 30 -168 Q 30 -190 14 -202 Z" fill={SHADE} />
      <rect x={-47} y={-172} width={94} height={10} rx={3} fill={PAL.navyDark} {...st} />
      <path d="M -46 -164 Q 0 -150 46 -164 Q 40 -152 0 -146 Q -40 -152 -46 -164 Z" fill={INK} />
      <path d="M -10 -186 L 10 -186 L 6 -174 L -6 -174 Z" fill={PAL.gold} stroke={INK} strokeWidth={1.4} />
      <path d="M 0 -194 L 2.6 -188 L 8 -188 L 3.8 -184 L 5.4 -178 L 0 -181.5 L -5.4 -178 L -3.8 -184 L -8 -188 L -2.6 -188 Z" fill={PAL.gold} stroke={INK} strokeWidth={1} />
    </g>
  );
  if (spec.hat === "bighat") return (
    <g transform={`translate(${s} 0)`}>
      <ellipse cx={0} cy={-178} rx={80} ry={19} fill={spec.hatColor ?? PAL.dressPlum} {...st} />
      <path d="M -40 -182 Q -42 -222 0 -224 Q 42 -222 40 -182 Z" fill={spec.hatColor ?? PAL.dressPlum} {...st} />
      <path d="M -40 -190 Q 0 -180 40 -190 L 40 -182 Q 0 -172 -40 -182 Z" fill={PAL.lace} {...st} strokeWidth={LINE * 0.7} />
      {/* ostrich feather */}
      <path d="M 26 -210 Q 70 -250 96 -214 Q 76 -228 58 -214 Q 48 -206 26 -210 Z" fill={PAL.cream} {...st} />
      <path d="M 30 -210 Q 64 -236 92 -216" fill="none" stroke={INK} strokeWidth={1.6} />
      {/* roses */}
      {[[-30, -192, "#e07a8a"], [-16, -196, "#f2a2ad"], [-44, -188, "#d0607a"]].map(([x, y, c]) => (
        <g key={String(x)}><circle cx={x as number} cy={y as number} r={8} fill={c as string} {...st} strokeWidth={1.8} /><path d={`M ${(x as number) - 3} ${y} q 3 -4 6 0`} fill="none" stroke={INK} strokeWidth={1.2} /></g>
      ))}
      <path d="M 20 -224 Q 40 -200 40 -182 L 28 -182 Q 30 -204 20 -224 Z" fill={SHADE} />
    </g>
  );
  return null;
};

const Face: React.FC<{ spec: Spec; pose: Pose }> = ({ spec, pose }) => {
  const look = pose.look ?? 0, fx = look * 9;
  const blink = clamp(pose.blink ?? 0), brow = pose.brow ?? 0;
  const eyeRy = 10 * (1 - blink);
  const talk = clamp(pose.talk ?? 0);
  const my = -116;
  const ev = pose.eyes ?? "normal";
  const eye = (cx: number) => (
    <g key={cx}>
      {ev === "happy" ? <path d={`M ${cx - 7} -133 Q ${cx} -143 ${cx + 7} -133`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      : ev === "squint" && blink < 0.85 ? <g><path d={`M ${cx - 8} -139 L ${cx + 8} -137`} stroke={INK} strokeWidth={3} strokeLinecap="round" /><ellipse cx={cx} cy={-134} rx={6} ry={3.2} fill={INK} /></g>
      : blink < 0.85 ? (
        <g>
          <ellipse cx={cx} cy={-136} rx={ev === "wide" ? 9.5 : 7.6} ry={Math.max(eyeRy * (ev === "wide" ? 1.25 : 1), 1)} fill={INK} />
          {eyeRy > 4 && <circle cx={cx + 2.2} cy={-140} r={3} fill="#fff" />}
          {eyeRy > 6 && <circle cx={cx - 2.4} cy={-132} r={1.4} fill="#fff" />}
        </g>
      ) : <path d={`M ${cx - 7} -135 Q ${cx} -130 ${cx + 7} -135`} fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />}
    </g>
  );
  const browY = -152 - brow * 4;
  const browC = spec.hairStyle === "none" || spec.hair === PAL.hairWhite ? "#b9b1a6" : spec.hair;
  let mouth: React.ReactNode;
  if (talk > 0.08) {
    const h = 3 + talk * 9;
    mouth = (<g><path d={`M ${fx - 8} ${my - 1} Q ${fx} ${my + h * 1.5} ${fx + 8} ${my - 1} Q ${fx} ${my + 1} ${fx - 8} ${my - 1} Z`} fill="#7a2e2e" {...st} strokeWidth={2.2} />
      <path d={`M ${fx - 4} ${my + h * 0.9} Q ${fx} ${my + h * 0.5} ${fx + 4} ${my + h * 0.9}`} fill="#e57a7a" /></g>);
  } else if (pose.mouth === "grin") {
    mouth = <path d={`M ${fx - 9} ${my - 2} Q ${fx} ${my + 10} ${fx + 9} ${my - 2} Z`} fill="#7a2e2e" {...st} strokeWidth={2.2} />;
  } else if (pose.mouth === "o") {
    mouth = <ellipse cx={fx} cy={my + 2} rx={4} ry={5} fill="#7a2e2e" {...st} strokeWidth={2.2} />;
  } else if (pose.mouth === "flat") {
    mouth = <path d={`M ${fx - 5} ${my + 1} L ${fx + 5} ${my + 1}`} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />;
  } else {
    mouth = <path d={`M ${fx - 6} ${my - 1} Q ${fx} ${my + 5} ${fx + 6} ${my - 1}`} fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />;
  }
  return (
    <g>
      {/* blush */}
      <ellipse cx={fx - 27} cy={-121} rx={8} ry={4.5} fill={PAL.blush} opacity={0.4} />
      <ellipse cx={fx + 27} cy={-121} rx={8} ry={4.5} fill={PAL.blush} opacity={0.4} />
      {eye(fx - 17)}{eye(fx + 17)}
      <path d={`M ${fx - 24} ${browY + (brow < 0 ? -2 : 0)} Q ${fx - 17} ${browY - 3} ${fx - 10} ${browY + (brow < 0 ? 3 : 0)}`} fill="none" stroke={browC} strokeWidth={3.2} strokeLinecap="round" />
      <path d={`M ${fx + 10} ${browY + (brow < 0 ? 3 : 0)} Q ${fx + 17} ${browY - 3} ${fx + 24} ${browY + (brow < 0 ? -2 : 0)}`} fill="none" stroke={browC} strokeWidth={3.2} strokeLinecap="round" />
      <path d={`M ${fx - 1.5} -124 Q ${fx + 1} -122 ${fx + 2} -125`} fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
      {spec.beard === "full" && (
        <g>
          <path d={`M ${-46 + fx * 0.3} -132 Q ${-46 + fx * 0.3} -88 ${fx} -84 Q ${46 + fx * 0.3} -88 ${46 + fx * 0.3} -132 Q ${36 + fx * 0.5} -116 ${fx + 18} -114 Q ${fx} -106 ${fx - 18} -114 Q ${-36 + fx * 0.5} -116 ${-46 + fx * 0.3} -132 Z`} fill={spec.beardColor ?? PAL.hairWhite} {...st} />
          <path d={`M ${fx + 10} -100 Q ${fx + 26} -104 ${36 + fx * 0.3} -118`} fill="none" stroke="#c9c2b8" strokeWidth={2} />
        </g>
      )}
      {mouth}
      {(spec.beard === "full" || spec.beard === "moustache") && (
        <path d={`M ${fx} -123 Q ${fx - 10} -126 ${fx - 18} -118 Q ${fx - 9} -116 ${fx} -119 Q ${fx + 9} -116 ${fx + 18} -118 Q ${fx + 10} -126 ${fx} -123 Z`} fill={spec.beardColor ?? spec.hair} {...st} strokeWidth={2} />
      )}
    </g>
  );
};

/** violin under the chin on the puppet's left shoulder (screen right when facing the viewer) */
const VIOLIN_AT: [number, number] = [30, -84];
const ViolinBody: React.FC = () => (
  <g transform={`translate(${VIOLIN_AT[0]} ${VIOLIN_AT[1]}) rotate(-30) scale(1.3)`}>
    <path d="M -18 0 Q -18 -12 -9 -12 Q -3 -12 0 -8 Q 3 -11 9 -11 Q 18 -11 18 0 Q 18 11 9 11 Q 3 11 0 8 Q -3 12 -9 12 Q -18 12 -18 0 Z" fill="#b4602c" {...st} strokeWidth={2.4} />
    <path d="M -6 -6 Q -3 0 -6 6 M 6 -6 Q 3 0 6 6" fill="none" stroke={INK} strokeWidth={1.3} />
    <rect x={-10} y={-2} width={6} height={4} rx={1} fill="#2a1a12" />
    <rect x={16} y={-2.6} width={28} height={5.2} rx={2} fill="#3a2418" stroke={INK} strokeWidth={1.6} />
    <circle cx={46} cy={0} r={4.2} fill="#3a2418" stroke={INK} strokeWidth={1.6} />
    <path d="M -14 0 L 44 0" stroke="#f3e2c0" strokeWidth={0.9} />
  </g>
);
const Bow: React.FC<{ bow: number; hand: [number, number] }> = ({ bow, hand }) => {
  const [hx, hy] = hand, vx = VIOLIN_AT[0] - 4 + bow * 3, vy = VIOLIN_AT[1] + 2;
  const dx = vx - hx, dy = vy - hy, ex = vx + dx * 0.5, ey = vy + dy * 0.5;
  return <g><line x1={hx} y1={hy} x2={ex} y2={ey} stroke={INK} strokeWidth={4.4} strokeLinecap="round" /><line x1={hx} y1={hy} x2={ex} y2={ey} stroke="#8a5a32" strokeWidth={2.2} strokeLinecap="round" /></g>;
};

const Book: React.FC = () => (
  <g transform={`translate(4 ${ARM_LEN - 2}) rotate(14)`}>
    <rect x={-15} y={-12} width={30} height={24} rx={3} fill="#7b4a2c" stroke={INK} strokeWidth={2.4} />
    <rect x={-12} y={-10} width={24} height={20} rx={2} fill="#fbf4e4" stroke={INK} strokeWidth={1.4} />
    <path d="M -8 -5 L 8 -5 M -8 0 L 6 0 M -8 5 L 4 5" stroke="#9aa6b8" strokeWidth={1.4} />
  </g>
);
const Pen: React.FC = () => (
  <g transform={`translate(0 ${ARM_LEN}) rotate(-35)`}>
    <rect x={-2.2} y={-22} width={4.4} height={20} rx={1.5} fill="#2b2b38" stroke={INK} strokeWidth={1.4} />
    <path d="M -2.2 -2 L 0 3 L 2.2 -2 Z" fill={PAL.gold} stroke={INK} strokeWidth={1} />
  </g>
);
const Plans: React.FC = () => (
  <g transform={`translate(0 ${ARM_LEN}) rotate(90)`}>
    <rect x={-6} y={-22} width={12} height={44} rx={5} fill="#7fa6c9" stroke={INK} strokeWidth={2.4} />
    <ellipse cx={0} cy={-22} rx={6} ry={2.5} fill="#cfe0ee" stroke={INK} strokeWidth={1.6} />
    <path d="M -6 -6 L 6 -6" stroke="#2f4f73" strokeWidth={1.4} />
  </g>
);

export const Chibi: React.FC<{ spec: Spec; pose: Pose; x: number; y: number; size: number; facing?: 1 | -1 }> = ({ spec, pose, x, y, size, facing = 1 }) => {
  const s = (size / 200) * (spec.scale ?? 1);
  const walk = pose.walk ?? 0, ph = pose.phase ?? 0;
  const bob = -Math.abs(Math.sin(ph)) * 5 * walk;
  const swingL = Math.sin(ph) * 26 * walk, swingR = -swingL;
  const liftL = Math.max(0, Math.sin(ph)) * 3 * walk, liftR = Math.max(0, -Math.sin(ph)) * 3 * walk;
  const breathe = (pose.breathe ?? 0) * 0.012;
  const sway = (pose.sway ?? 0) + Math.sin(ph) * 2.5 * walk;
  const armL = (pose.armL ?? 0) + (spec.prop === "violin" || spec.prop === "notebook" ? 0 : Math.sin(ph) * 12 * walk);
  const armR = (pose.armR ?? 0) - (spec.prop === "violin" || spec.prop === "notebook" ? 0 : Math.sin(ph) * 12 * walk);
  const nod = pose.nod ?? 0;
  const female = spec.outfit === "dress";
  const hand = handPos(-1, armL);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
      <ellipse cx={0} cy={0} rx={40} ry={8} fill="rgba(40,20,20,0.25)" />
      <g transform={`translate(0 ${bob})`}>
        {female ? (
          <g>
            <ellipse cx={-10 + swingL * 0.15} cy={-4 - liftL} rx={9} ry={5} fill={PAL.shoe} {...st} strokeWidth={2.4} />
            <ellipse cx={10 + swingR * 0.15} cy={-4 - liftR} rx={9} ry={5} fill={PAL.shoe} {...st} strokeWidth={2.4} />
          </g>
        ) : (
          <g><Leg spec={spec} side={-1} swing={swingL} lift={liftL} /><Leg spec={spec} side={1} swing={swingR} lift={liftR} /></g>
        )}
        <g transform={`rotate(${sway} 0 -30) translate(0 ${-breathe * 60}) scale(1 ${1 + breathe})`}>
          <Torso spec={spec} />
          {/* neck */}
          <rect x={-8} y={-102} width={16} height={12} fill={spec.skin} {...st} strokeWidth={LINE * 0.8} />
          {armL <= 95 && <Arm spec={spec} side={-1} raise={armL}>{spec.prop === "notebook" && <Book />}</Arm>}
          {armR <= 95 && <Arm spec={spec} side={1} raise={armR}>{spec.prop === "plans" && <Plans />}{spec.prop === "notebook" && <Pen />}</Arm>}
          <g transform={`translate(0 ${nod * 6}) rotate(${(pose.head ?? 0)} 0 -100)`}>
            {spec.hairStyle !== "none" && <HairBack spec={spec} />}
            <ellipse cx={-49 - (pose.look ?? 0) * 3} cy={-130} rx={8} ry={10} fill={spec.skin} {...st} />
            <ellipse cx={49 - (pose.look ?? 0) * 3} cy={-130} rx={8} ry={10} fill={spec.skin} {...st} />
            <ellipse cx={0} cy={-138} rx={50} ry={47} fill={spec.skin} {...st} />
            <path d="M 18 -182 Q 52 -168 50 -136 Q 48 -104 14 -92 Q 40 -116 38 -140 Q 36 -166 18 -182 Z" fill={SHADE} />
            <g transform={`translate(0 ${nod * 3})`}><Face spec={spec} pose={pose} /></g>
            <HairFront spec={spec} look={pose.look ?? 0} />
            <Hat spec={spec} look={pose.look ?? 0} />
          </g>
          {armL > 95 && <Arm spec={spec} side={-1} raise={armL}>{spec.prop === "notebook" && <Book />}</Arm>}
          {armR > 95 && <Arm spec={spec} side={1} raise={armR}>{spec.prop === "plans" && <Plans />}{spec.prop === "notebook" && <Pen />}</Arm>}
          {spec.prop === "violin" && (() => {
            const [nx, ny] = handPos(1, armR);
            return <g><ViolinBody /><circle cx={nx} cy={ny} r={8} fill={spec.skin} {...st} /><Bow bow={pose.bow ?? 0} hand={hand} /><circle cx={hand[0]} cy={hand[1]} r={8} fill={spec.skin} {...st} /></g>;
          })()}
        </g>
      </g>
    </g>
  );
};
