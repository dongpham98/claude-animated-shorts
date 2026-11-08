import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const [comp, prefix, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const inputProps = { audio: false };
const composition = await selectComposition({ serveUrl, id: comp, inputProps, browserExecutable: "/usr/bin/google-chrome" });
for (const fr of frames) {
  await renderStill({ composition, serveUrl, output: `${prefix}${fr}.png`, frame: Number(fr), inputProps, browserExecutable: "/usr/bin/google-chrome" });
  console.log("ok", fr);
}
