import React from "react";
import { Composition } from "remotion";
import { Lineup } from "./Lineup";
import { StyleTest, DURATION } from "./StyleTest";
import { Test2, DURATION2 } from "./Test2";
import { Preview } from "./Preview";
import { Recap, RECAP_FRAMES } from "./Recap";
import { Ep1, EP1_FRAMES } from "./Ep1";
import { ShortA, SHA_FRAMES } from "./ShortA";
import { ShortB, SHB_FRAMES } from "./ShortB";
export const Root: React.FC = () => (
  <>
    <Composition id="Lineup" component={Lineup} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="StyleTest" component={StyleTest} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
    <Composition id="Test2" component={Test2} durationInFrames={DURATION2} fps={30} width={1920} height={1080} />
    <Composition id="Preview" component={Preview} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="Recap" component={Recap} durationInFrames={RECAP_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Ep1" component={Ep1} durationInFrames={EP1_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ShortA" component={ShortA} durationInFrames={SHA_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ShortB" component={ShortB} durationInFrames={SHB_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
