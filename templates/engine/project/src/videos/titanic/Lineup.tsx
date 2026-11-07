// Character lineup still for approval: every cast card on a neutral night-deck backdrop, two rows, with labels.
import React, { useEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { Pen, bodyFront } from "./toon";
import { CAST } from "./castdefs";

const ROWS = [
  ["clipboard", "clipboardStamp", "smith", "murdoch", "lightoller", "lowe", "rostron", "cottam", "carlisle"],
  ["clerk", "cosmo", "lucy", "steward", "firstwoman", "firstman", "thirdwoman", "thirdman", "thirdkid"],
];
export const Lineup: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => delayRender("lineup"));
  useEffect(() => {
    const cv = ref.current!, g = cv.getContext("2d")!, W = cv.width, H = cv.height;
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#1c2748"); bg.addColorStop(1, "#33406b"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + 0.6 * ((i * 37) % 10) / 10})`; g.fillRect((i * 733) % W, (i * 389) % (H * 0.12), 3, 3); }
    g.fillStyle = "#f4f1ea"; g.font = "900 64px Montserrat, Arial Black, sans-serif"; g.textAlign = "center";
    g.fillText("TITANIC'S LIFEBOATS — CAST LINEUP", W / 2, 96);
    const rowH = (H - 140) / 2, slot = W / 9, sc = 0.74;
    ROWS.forEach((row, r) => {
      const floorY = 140 + rowH * (r + 1) - 150;
      g.fillStyle = "#b08a5c"; g.fillRect(0, floorY, W, 30); g.fillStyle = "#8a6a44"; g.fillRect(0, floorY + 30, W, 8);
      row.forEach((k, i) => {
        const c = CAST[k], cx = slot * (i + 0.5);
        g.save(); g.translate(cx - 300 * sc, floorY + 12 - 975 * sc); g.scale(sc, sc);
        g.fillStyle = "rgba(20,14,30,0.35)"; g.beginPath(); g.ellipse(300, 975, 120, 18, 0, 0, Math.PI * 2); g.fill();
        bodyFront(new Pen(g), c.o, { light: (-120 * Math.PI) / 180, ...c.opts }); g.restore();
        g.fillStyle = "#ffffff"; g.font = "800 34px Montserrat, Arial, sans-serif"; g.fillText(c.name, cx, floorY + 76);
        g.fillStyle = "#c9d3ee"; g.font = "600 26px Montserrat, Arial, sans-serif"; g.fillText(c.role, cx, floorY + 104);
      });
    });
    continueRender(h);
  }, [h]);
  return <AbsoluteFill><canvas ref={ref} width={3840} height={2160} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};
