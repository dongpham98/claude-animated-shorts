import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { Lineup } from "./videos/titanic/Lineup";
import { TitanicPilot, TITANIC_PILOT_FRAMES, TitanicFull, TITANIC_FRAMES } from "./videos/titanic/Titanic";
import { MolassesShort, MOLASSES_FRAMES } from "./videos/molasses/Molasses";
export const Root: React.FC = () => (
  <>
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MolassesShort" component={MolassesShort} durationInFrames={MOLASSES_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="TitanicLineup" component={Lineup} durationInFrames={1} fps={30} width={3840} height={2160} />
    <Composition id="TitanicFull" component={TitanicFull} durationInFrames={TITANIC_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="TitanicPilot" component={TitanicPilot} durationInFrames={TITANIC_PILOT_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
