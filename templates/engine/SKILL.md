---
name: animated-story-studio
description: Turn any idea into a finished animated story video (60-90 s Short or 10-15 min long video) with research, script, characters, voice, captions, code package, laptop render help and upload plan.
---

# Animated Story Studio

End-to-end partner for the user's YouTube channel: from a raw idea to a rendered, uploaded animated video. Style: flat 2D
bean-head cartoon characters (canvas-drawn cards with plum ink outlines) in a colourful 3D toon world (painted
textures, black ink outlines, depth of field, gliding cameras), rendered with three.js inside Remotion on the user's
Windows laptop. Proven on "The Syrup That Outran People" (Boston Molasses Flood, 61.6 s Short, 15 shots, 224 captions,
rendered on an Intel UHD 620 laptop in roughly 40-45 minutes (estimated from chat timestamps), QA clean: -14.0 LUFS, no frozen or black frames).

The user is not a programmer. Whenever they must do something on their computer, give numbered steps with
ready-to-paste commands (PowerShell), say what they should see, and ask for a screenshot if anything differs.

## 0. Where the code lives (load before building)
- **Everything is in the user's GitHub repo `dongpham98/claude-animated-shorts`** (synced into the "YouTube Video
  Creation" project, branch main). In a session: attach it with `add_repo` (owner dongpham98, repo
  claude-animated-shorts; `push` access only when saving changes back), then
  `git clone --depth 1 https://github.com/dongpham98/claude-animated-shorts.git`.
  - `templates/engine/` = this engine: `SKILL.md` (canonical copy of this file), `README.md` (folder map), `setup.sh`,
    `project/` (full working Remotion project with the molasses example: story.ts, world.ts, cast.ts, lights2.ts,
    captions.ts, Molasses.tsx; scripts/stills.mjs; tts/ get_models.sh, say.py, tts_timed.py; tools/ gen_captions.py,
    analyze_video.py; audio/sound.py; final/ render_chunks.sh, finish.sh; README_RENDER.md; pinned package.json +
    lock), `examples/molasses/` (SCRIPT.md, SHOTPLAN.md, script texts, words.json).
  - `templates/bridge/` = shared modules (toon.ts Pen API, cast machinery, paint, shade, lights, ink, lensblur, grade,
    build) and `templates/audio/` = synth libraries (dsp, instruments, sfx_gen).
- Start a new video: `bash templates/engine/setup.sh ~/work/<slug> --install` (copies the project, the shared
  modules into src/videos/bridge and the synths into audio/lib, runs npm install), then copy
  `src/videos/molasses` to `src/videos/<slug>` and adapt. Fallbacks without repo access: project docs `kit/engine/`
  and the user's `molasses-short-code-v4.zip`.
- Save improvements back to the repo: branch, commit, push, open a PR to main (merge when the user asks); per-video
  docs go to `templates/engine/examples/<slug>/`; new lessons go into `templates/engine/SKILL.md` and this skill.

## 1. Intake (always first, one AskUserQuestion)
Ask together:
1. **Format:** Short (60-90 s, vertical 1080x1920) or Long (10-15 min, horizontal 1920x1080).
2. **The idea** in their words (topic, era, book/legend/true event, any must-have moments).
3. **Voice:** free Kokoro AI voice (default; offer 4 samples), their own recording, or ElevenLabs.
4. **Captions:** word-by-word burned-in (default for Shorts) / phrase captions (default for Long) / none.
Then plan the build for that format and confirm the plan (scope, number of shots/chapters, render time estimate)
before writing code.

## 2. Rights and safety gate
- Original story, characters and voice only. Never recreate another creator's video, characters or shots.
- Copyrighted books/films (e.g. Harry Potter): do NOT retell or reproduce them; it invites copyright strikes. Offer
  (a) an original "inspired-by" world with own names, places and events, or (b) a public-domain source (myths,
  fairy tales, pre-1929 works, history).
- No real living people as characters or butts of jokes; no brand mascots/logos; nothing graphic.
- Tragedies (deaths): jokes aim at the absurdity or the negligent company, never at victims; play the deaths line
  straight (music silence, still camera, no faces).

## 3. Research (web search, before any script)
- 5-10 sources; prefer Wikipedia + its cited books, national archives, museums, NPR/BBC, peer-reviewed or university
  studies; skip content farms. Write a facts sheet at the top of SCRIPT.md: each fact + source + confidence.
- Verify every number and every "viral" detail; when sources disagree, write the script so it stays true
  ("After years in court" when sources say 3-6 years). Flag legends as "legend says".
- Also research the **visual world**: period clothing, buildings, vehicles, tools, weather/season, landmarks, what
  the place looked like. Note 6-10 concrete visual details per set; these drive the world build.
- Find the physical mechanism and an everyday analogy (honey from the fridge) for the explanation beat.

## 4. Story and script
Narration only, no stage directions. Plain spoken English, contractions, sentences 8-15 words. Never describe what
the viewer already sees. Spell out years and numbers the way they must be spoken in the TTS input ("nineteen
nineteen") but keep the written form for captions ("1919,").
- **Short (60-90 s, ~3.7 words/s, 220-330 words):** Hook (absurd fact, sentence 1) -> Setting (when, where, a
  concrete detail) -> Escalation 3-4 beats with one exaggeration joke -> Snap -> (serious beat if tragedy) -> "But
  wait..." mystery -> "You see," mechanism + everyday analogy -> Consequence/rule -> Callback twist as the last words.
- **Long (10-15 min, ~2.6-2.9 words/s = 1,600-2,500 words):** see section 12.
Deliver: script block with word count and estimated length, a beat table (beat -> line), a one-paragraph visual
plan, tone note. Wait for approval ("the script is fine") before voicing.

## 5. Characters (sketch -> approve -> use)
- Write a **character bible**: role, personality in 3 words, outfit, palette, build (adult/stout/kid), head seed,
  hat/hair, props, signature expression set, scale (kid 0.72).
- Map to `toon.ts` Outfit fields: jacket, pants, boots, hat ("cap" | "hair" | "tophat" | "bonnet" | "shako" |
  "shako_tall"), cap/hair colour, dress, moustache, belt, buttons, sash, skin (4 tones), build. Expressions:
  neutral, stern, grin, laugh, whistle, nervous, shock, relief, relief_open, dazed, pained, smile, smile_closed, lick.
  Front modes: stand, stroll (phase), march, sit, fall; options tilt, headTilt, look, wave, blink.
- For new period costumes or props, copy `toon.ts` into the video folder and extend it (new hat shapes, aprons,
  armour, tools) in the same style: flat fills, plum ink #241726, thick-thin outline, painted crescent, no blush.
- Hand-held objects (buckets, jars, books, rollers) are separate fx cards placed at hand height, nudged 0.3 m toward
  the lens; never place a prop card over a head (it reads as a hat).
- **Sketch:** render a character lineup still (all cast on a neutral set) and send it for approval before staging.
- If the user supplies painted model sheets: the Pen API cannot reproduce painterly art exactly; offer (a) closest
  bean-head translation, or (b) "cut-out" cards using their images as billboard textures (Route B), consistent per
  shot.

## 6. Voice and word timing
**Kokoro (default, free, local):** `bash tts/get_models.sh` downloads the models from GitHub releases (Hugging Face is
blocked in the cloud) and builds the duration-patched `kokoro-dur.onnx`.
- Render 4 candidate voices of the full script with `tts/say.py` (am_puck, am_fenrir, am_michael, bm_george; female:
  af_heart, af_bella, bf_emma) at the target pace and send MP3s. Pace is not linear in `speed`: measure words/s and
  retune. Short target 3.6-3.9 w/s (Puck 1.2 gave 3.69); Long target 2.6-2.9 w/s.
- **Exact word timings without ASR:** `tts/tts_timed.py` synthesizes sentence by sentence with the patched model
  (per-phoneme frame durations from `/encoder/Round_output_0`), maps phoneme words to text words, splits espeak's
  fused function words ("from the", "out of") and joins sentences with 0.12 s gaps. Check every sentence onset
  against the waveform (all within 30 ms on the molasses voice).
- **User's own recording / ElevenLabs:** ask for the final script text; align with Whisper on the laptop or
  silence-segment + syllable alignment; hand-check sentence starts.
- Deliver `voice.wav` + `words.json`. Never edit or re-time the voice afterwards; any word change means regenerate
  both and re-run sound.

## 7. Sets, scenes and shot plan
- Turn the visual research into 2-4 **sets** built once and reused (main location + inserts like a kitchen or
  office built far away at x = -400 and toggled per shot), plus light presets per beat: day (normal), golden (drama
  or ending), night-blue (explanation/cooling), and a "today/summer" variant for callbacks.
- Building blocks: `house()` rows (brick styles 2/7/1/6), `boxGeo`, `quadUp`, `Batch` merges, painted canvas textures
  (`ctex`, `stoneHD`, `cobbleHD`, `planksHD`, `beamHD`, wallpaper/plaster painters), `prop(b, {}, "tree_oak"...)`
  cartoon trees, cylinders/tubes for tanks and pipes, polar height fields for liquids/floods, pivoted panel groups
  for collapses, InstancedMesh for repeats. Water: the bridge river shader. Snow/decals: alpha-tested flat cards.
- **Shot plan (`SHOTPLAN.md` before code):** one row per shot: frames, key words with frames (word start x 30),
  set, picture, camera, DOF, SFX cue. Frame 0 is already the hook image. One shot per sentence or beat, 2-7 s each.
- Measured pacing of the finished molasses Short: shots 1.8-6.8 s (mean 4.1 s), 75 picture changes in 61 s
  (cuts, flashes, big glides), median frame-to-frame change never zero, captions median 7 frames per word.

## 8. Camera, motion and timing rules
- Every visual reaction lands 0-3 frames before its word. Big jumps are cuts; everything else a smootherstep glide
  of 18-45 f. Every hold creeps (push 0.15-0.35 %/f, 0.6 %/f on punch words). Rolls 3-5 deg on drama. Impacts:
  7-frame flip-sign kicks (rivets every 4 f, collapse 1.6, stamp 0.5).
- **Flat surfaces fill the frame -> creep is invisible.** Measured: the rivet close-up held 16 near-still frames.
  On close-ups of walls/paper use >= 0.4 %/f, a slow pan, or a moving element (drip, sparkle, steam).
- Characters never freeze: idle sway (+-1.3 deg) + breathing bob on every card, blinks every 0.5-2.3 s, a blink across
  every expression swap, walk cycles with planted feet.
- Place or time jumps: hard cut + 6-frame white flash (1, .8, .6, .4, .2, .08). No crossfades.
- Cameras that chase moving geometry must stay ahead of it (camera z = wave front + 21 m); otherwise the frame goes
  solid. Check the first and last frame of every moving shot.
- Twist line: push-in with roll; the last physical payoff lands on the final word; video ends ~20 f after it.
- DOF on close-ups/mediums only (cInf 6-14 px at 1080, focus on the eyes); wides and grazing walls sharp.

## 9. Look check (cloud stills) and the trap list
Render stills with `node scripts/stills.mjs <Comp> out/x_ <frames> 0.5` (Linux Chrome, `--gl swangle`, 50-120 s
per still). Make side-by-side sheets with PIL, look at them, fix, re-render. Known traps (all hit on molasses):
- Narrow vertical frame: horizontal half-width = d * tan(hfov/2), hfov = 2*atan(tan(vfov/2)*0.5625). Stage groups
  in depth; check nobody is cut at the edge.
- Walls facing away from the sun render dull purple: per-shot sun override (az 120-155 = light from behind camera).
- Camera inside houses, under elevated structures, or behind a pillar: move to open ground; verify with a still.
- Wall-aligned cards: yaw = a - PI/2 for a point at angle a on a cylinder (x = cx - r cos a, z = cz + r sin a).
  Tilted cards: tilt is measured from vertical (a board 0.45 rad from horizontal needs tilt PI/2 - 0.45).
- Height-field liquids: index winding must face up (a, d, c / a, bb, d) or you see the underside; colour by vertex
  (glossy top, darker face), low specular, dark base (#8f8274 material tint); clip slicks near shores.
- Broken objects: hide parts that would float (tank lid), keep panels visible in replays, no panel offsets that
  open sky-coloured cracks (use strain fx + kicks instead).
- Props closer than 2 m to the lens become blobs; foreground props must be recognisable.
- Text must read correctly (not mirrored); diegetic signs use unlit materials.
- Intermittent stills hang ("delayRender ... not cleared") in the cloud: rerun that frame alone.

## 10. Captions
- `python3 tools/gen_captions.py voice/words.json src/videos/<slug>/captions.ts --merge "nineteen nineteen,=1919,"`
  builds [text, firstFrame, endFrame): start 1 f before the word; hold until 1 f before the next word if the gap <
  0.35 s, else end + 0.25 s; --merge turns spoken-number words into their written form.
- Short style: one word at a time, Montserrat Black (npm `@fontsource/montserrat`, latin-900 woff2 in public/fonts,
  loaded with FontFace + delayRender), 114 px (100 px if > 9 chars), white, 14 px black stroke with paint-order
  stroke, drop shadow, centre at y 1300/1920 (~67 %), 1.14 -> 1.06 -> 1.0 pop on each swap.
- Long style: 2-5 word phrases, 64-72 px at 1920x1080, lower third, no pop; never cover faces.
- Captions are a DOM overlay in the composition (crisp text, toggle with inputProps captions:false).

## 11. Sound and mix
`audio/sound.py` (rewrite the cue tables per story; synths from templates/audio stay, copied to audio/lib):
- Score: original synthesized cues per beat (setup motif, tension build, chaos, silence for serious lines, curious
  explanation, rule/resolve, twist hit + drone). Composed silence is part of the score, not a duck.
- SFX on picture events (frames/30): whooshes on big moves, impacts, splash, creaks, crowd whoas/oofs, ambiences.
  Wrap every generator in `safe()`.
- Mix rule: voice unchanged; music = 50 % of the voice's gated RMS (-6.0 dB); SFX at or below that, peaks soft-capped
  at 0.7 x voice peak; no ducking/compression; one linear gain to -14 LUFS; soft limiter at -1.6 dBFS sample peak so
  true peak <= -1 dBTP; exactly the picture length. Print and confirm the measured levels.
- Embed the mix: `<Audio src={staticFile("<slug>_mix.wav")} />` in the composition so the render outputs final MP4.
- Picture timing must be locked before sound; any timing change -> re-run sound.

## 12. Long videos (10-15 min)
**Structure for retention:**
- Cold open 20-40 s: the most dramatic moment (flash-forward) + the central question; title card by ~0:35.
- 6-10 chapters of 60-120 s, each a mini-story: hook line, escalation, a reveal, and an open loop into the next
  ("But that wasn't the strangest part...").
- Re-hook every 60-90 s; pattern interrupt every 5-10 s (new angle, insert, map, diagram, character reaction,
  light change); a recurring guide character or narrator avatar for continuity; humour beats every ~45 s; one
  emotional or serious beat played straight; mid-video payoff around 55-65 % (retention dip zone).
- Visual grammar for long form: maps with animated routes, timeline inserts, object close-ups, era-establishing
  wides, re-used sets under different light (day/golden/night/rain/snow) to save build time.
- End: payoff of the opening question, callback to the cold open, 10-15 s teaser of the next video + end-screen space
  (last 20 s keep the bottom-right and centre clear).
**Production:**
- 1920x1080, 30 fps. Re-check framing rules for the wide frame (hfov = 2*atan(tan(vfov/2)*16/9)).
- One Remotion composition per chapter (`Ch01`..`Ch10`), shared sets/cast/fx modules, a global style file (palette,
  light presets, grade, caption style) so quality stays identical across chapters. Each chapter: its own SHOTPLAN
  section, stills sheet, mix stem; the final mix is made over the whole voice track and split per chapter at
  chapter boundaries (or embedded once in a stitching composition).
- Voice the full script once, then cut chapter boundaries at sentence ends from words.json.
- Render chapter by chapter on the laptop (overnight sessions), then concat with
  `npx remotion ffmpeg -f concat -safe 0 -i list.txt -c copy final.mp4`. Estimate: ~1.3-1.5 s per frame on the UHD 620
  (molasses: 1,849 frames in roughly 40-45 min, estimated) -> 10 min = 18,000 frames = ~6-7 h; 15 min = ~10 h. Plan 2-3 evenings.
- Build in stages: script approval -> voice -> chapter 1 complete (stills + preview) as a pilot -> remaining
  chapters. Keep a running QA table per chapter.

## 13. Cloud workspace notes (what works here)
- Remotion 4.0.290 + three 0.175 + @react-three/fiber 9.1.2 + @react-three/postprocessing 3.0.4 + postprocessing
  6.37.2; Chrome at /usr/bin/google-chrome with gl swangle. `npx tsc --noEmit` after every edit.
- Full renders are impossible here (70-120 s per full frame, ~2 days per minute of video). Only stills and previews.
- Tool calls time out at 600 s: <= 4-5 stills per call, or `nohup` background jobs polled with sleep. Two parallel
  jobs are not faster (2 cores).
- Low-res animatic for reviewing timing: inputProps `{"post":{"dpr":0.25}}`, every 10th frame (~19 s each), ffmpeg
  `-framerate 3` + mix; burn preview captions with an ASS file (Montserrat converted to TTF with fontTools).
- Blocked: Hugging Face, OpenAI Whisper model CDN, pytorch.org downloads. GitHub releases and npm/PyPI work.

## 14. Package for the laptop
- Zip: src/, public/ (font + mix, no unused assets), scripts/, audio/, package.json with Remotion packages pinned to
  4.0.290 and three 0.175.0, package-lock.json, tsconfig.json, README_RENDER.md, SHOTPLAN.md, words.json.
- npm scripts: test-still (a frame with a known caption), render, render-part1/2.
- README_RENDER.md: install Node, unzip to C:\YouTube\<slug>, `npm install`, test still, full render, split + join,
  troubleshooting. Always tell the user which caption the test still should show.

## 15. Laptop render and troubleshooting (Windows, Intel UHD 620, 16 GB)
Working command (proven):
```
npx remotion render src/index.ts <Comp> out/<slug>.mp4 --codec=h264 --crf=17 --gl=angle --timeout=300000 --browser-executable="C:\YouTube\browser\chrome-headless-shell\win64-133.0.6943.141\chrome-headless-shell-win64\chrome-headless-shell.exe"
```
| Symptom | Fix |
|---|---|
| `No browser found for rendering frames` after "Got Headless Shell" (Node 26) | `npx @puppeteer/browsers install chrome-headless-shell@133.0.6943.141 --path C:\YouTube\browser`, pass the printed .exe with `--browser-executable` |
| npm warn install-scripts esbuild | `npm install-scripts approve esbuild` then `npm rebuild esbuild` |
| WebGL/GPU error | try `--gl=swangle` (works, much slower) |
| delayRender timeout | raise `--timeout` to 600000; check fonts/assets exist in public/ |
| Memory > 85 % in Task Manager | close browsers/Teams/Outlook; keep only PowerShell |
| Laptop sleeps / stops | charger in, Sleep: Never, lid open; render halves with `--frames` and join |
| "15 vulnerabilities" | ignore; never run `npm audit fix --force` |
| Persistent Node 26 problems | install Node 22 LTS (.msi), delete node_modules, `npm install` |
GPU 3D at ~99 % in Task Manager means it is rendering correctly. Claude Code installed natively on Windows
(`irm https://claude.ai/install.ps1 | iex`) can run and troubleshoot the render; give it a ready-to-paste brief.

## 16. QA of the rendered file (user uploads it)
```
ffprobe (1080x1920 or 1920x1080, 30 fps, h264 + aac, duration = picture length)
ffmpeg -vf freezedetect=n=0.002:d=0.4   -> none
ffmpeg -vf blackdetect=d=0.05:pix_th=0.08 -> none
ffmpeg -af ebur128=peak=true            -> I about -14 LUFS, peak <= -1 dBFS
ffmpeg -vf "fps=1,scale=150:-1,tile=11x6" contact sheet -> look at it
```
Also run `python3 tools/analyze_video.py <file>` (near-still spans >= 4 frames, hard picture changes, frame-diff
stats) and record the pacing numbers; turn every problem found into a new trap rule in this skill.

## 17. Upload package
Research at upload time with web search (never invent trends or numbers): current search interest for the topic,
similar successful videos' title patterns, anniversaries or news hooks, related trending formats/hashtags.
Deliver:
- 3 title options (<= 60 chars, curiosity gap, the key noun first; Shorts add #shorts) and the recommended one.
- Description: 2-line hook, 3-5 line story summary, sources list, chapters with timestamps (long videos), 3-5
  hashtags.
- Thumbnail (long) / cover frame (Short): the most striking frame with timestamp; for long videos a thumbnail
  concept (one face/character + one object + 2-4 words) and a still render of it.
- Pinned comment question to drive replies; end screen plan; best posting time research if available.
- For long videos: chapter titles that each promise a reveal.

## 18. Tracking and handoff
- Task list for every build stage; send the stills sheet before the long render; send previews early.
- Save SCRIPT.md, SHOTPLAN.md, words.json to project docs `shorts/<nn>-<slug>/` (or `long/<nn>-<slug>/`) and to
  `templates/engine/examples/<slug>/` in the repo; update `claude/channel-plan.md` (status, lessons). Package code as
  `<slug>-code-vN.zip` and send it.

## 19. 2D chibi engine (SVG puppets) — Titanic series, 2026-11-08
Use it for character-driven stories and recaps (many people, faces, talking, quick cuts); keep the 3D toon engine for
spaces and physical spectacle. Code: branch `titanic-series`, `templates/engine/examples/titanic-series/project/`.
- **Files:** `style.ts` (palette, ink #2a1b16, easing), `chibi.tsx` (puppet: walk, arms, head tilt/nod/look, blink,
  eyes normal/happy/squint/wide, brows, mouth smile/grin/o/flat/talk, props plans/notebook/violin, headphones,
  outfits captain/officer/suit/band/marconi/crew/dress, hats captain/sailor/bighat), `cast.ts` (real people from period
  photos), `fx.tsx` (sunburst, sparkles, smoke puff, speed lines, sweat drop, shock lines, speech bubble, name tag,
  quote card), `ship.tsx` (liner side view day/night, steamers, iceberg, sea/sky, water line), `scenes.tsx` (sets,
  countdown cards, map, boards), `Recap.tsx` (timeline-driven scene switcher + captions with written numbers),
  `stills.mjs` (bundle once, many stills), `recap/timeline.py` (line starts + scenes from voice durations ->
  `src/timeline.json`), `sound3.py` (per-section score + SFX + mix).
- **Renders in the cloud:** ~0.16-0.4 s/frame with `--concurrency=2 --browser-executable=/usr/bin/google-chrome`
  (3-min video ≈ 15 min). No laptop needed; copy the MP4 to `C:\YouTube\<project>\out\`.
- **Puppet traps:** arms raised > 95° are drawn after the head (waves), lower arms before it; inward arms use negative
  raise (hands meet at the chest for notebook writing); lying down = wrap the puppet in `rotate(-90)` and draw pillow
  before, blanket after; bubbles and tags must not overlap in time or place (shift the line, shorten the tag).
- **Voices:** narrator am_puck (1.2 for Shorts and ~3-min recaps, 0.9 for 10-15 min); British character voices
  bm_george, bm_lewis, bm_daniel, bm_fable (lang en-gb), American af_heart/af_bella. Mouth flaps from the line's RMS
  envelope per frame. Real quotes only when sourced and labelled; other lines clearly playful.
- **Captions:** 2-5 word phrases; merge spoken numbers to written forms; hide captions on countdown/quote cards.
- **Recap structure that holds viewers:** 10-s cold open with stakes + open loop, title card, intro of the people with
  name tags, numbered countdown cards (one plot point every 2-5 s), a planted callback paid off later, deaths played
  straight (music drops, no jokes), what changed, comment question. Analysis of reference recaps:
  project doc `long/03-titanic-series/REFERENCE_ANALYSIS.md`.
- **QA:** freezedetect n=0.002 d=1.0; give every information board a slow camera creep (1.05-1.1 zoom) so no span
  is still for 1 s+.
- **Rights:** film recaps are commentary only; never draw a film's fictional characters or recreate its scenes, in any
  style; animate the real people.
- **Upload:** set "not made for kids" (cute style gets auto-flagged).

## Lessons from the Titanic long video (2026-11-08)
- Laptop render of a long 3D video: ~1,000-frame parts, `--concurrency=2`, `--timeout=600000`, 3 retries per part,
  progress log, render watcher (`C:\YouTube\queue\<name>.run`). ~0.76 s/frame on the UHD 620.
- Music in long videos: about -10 dB vs the voice per 30-s window (not "50 % over the whole track").
- Vertical Shorts from a long video: native vertical composition reusing the timeline, not crops.
