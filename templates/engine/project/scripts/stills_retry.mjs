// like stills.mjs, but each still gets 150 s and up to 3 tries (the cloud's intermittent delayRender hang)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [id, prefix, frames, scale = "0.5"] = process.argv.slice(2);
const browserExecutable = "/usr/bin/google-chrome";
const chromiumOptions = { gl: process.env.GL || "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const inputProps = process.env.PROPS ? JSON.parse(process.env.PROPS) : {};
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000, inputProps });
for (const f of frames.split(",").map(Number)) {
  if (fs.existsSync(`${prefix}${f}.jpg`)) continue;
  for (let k = 0; k < 3; k++) {
    const t0 = Date.now();
    try {
      await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 85, scale: Number(scale), inputProps,
        browserExecutable, chromiumOptions, timeoutInMilliseconds: 150000 });
      console.log("still", f, ((Date.now() - t0) / 1000).toFixed(1) + "s"); break;
    } catch (e) { console.log("retry", f, String(e).slice(0, 120)); }
  }
}
