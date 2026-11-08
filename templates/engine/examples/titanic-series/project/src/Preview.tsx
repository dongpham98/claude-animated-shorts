import React from "react";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { Titanic, Steamer, Iceberg, SeaSky } from "./ship";
export const Preview: React.FC = () => {
  const f = useCurrentFrame(); const w = (getInputProps() as { w?: string }).w ?? "night";
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {w === "night" && <g><SeaSky f={f} mode="night" /><g transform="translate(1600 640) scale(0.6)"><Iceberg /></g><g transform="translate(800 700) scale(0.85)"><Titanic f={f} night /></g></g>}
        {w === "day" && <g><SeaSky f={f} mode="day" /><g transform="translate(960 700) scale(0.95)"><Titanic f={f} /></g></g>}
        {w === "dawn" && <g><SeaSky f={f} mode="dawn" /><g transform="translate(700 700) scale(0.8)"><Steamer f={f} kind="carpathia" /></g><g transform="translate(1500 680) scale(0.5)"><Steamer f={f} kind="californian" night /></g></g>}
      </svg>
    </AbsoluteFill>
  );
};
