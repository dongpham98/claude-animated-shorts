import React from "react";
import { Composition } from "remotion";
import { MolassesShort, MOLASSES_FRAMES } from "./videos/molasses/Molasses";
// Register every video here: one <Composition> per Short, or one per chapter (Ch01..Ch10) for long videos.
export const Root: React.FC = () => (
  <>
    <Composition id="MolassesShort" component={MolassesShort} durationInFrames={MOLASSES_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
