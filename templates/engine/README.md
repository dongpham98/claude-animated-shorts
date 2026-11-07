# Animated story engine (v4)

Everything needed to make an animated story video in the "flat bean-head characters in a 3D toon world" style:
picture (three.js inside Remotion), word-by-word captions, Kokoro narration with exact word timings, an original
synthesized score + sound effects, the mix, and a one-command render on a Windows laptop.
Worked example: **The Syrup That Outran People** (Boston Molasses Flood, 61.6 s Short) in `project/src/videos/molasses/`
and `examples/molasses/`. The full workflow (research, script, characters, shot plan, long videos, upload) is in
`SKILL.md` (same content as the `animated-story-studio` skill).

## Folder map
| Path | What it is |
|---|---|
| `SKILL.md` | The full procedure and every rule/trap learned so far |
| `setup.sh` | Makes a working copy: `bash templates/engine/setup.sh <dir> [--install]` |
| `project/src/videos/molasses/` | The worked example: `story.ts` (shots, cameras, DOF, kicks, flashes), `world.ts` (sets, sky, lights, water, tank, wave, interiors), `cast.ts` (characters and effect cards per shot), `lights2.ts` (night preset), `captions.ts`, `Molasses.tsx` (composition: post chain, captions overlay, flashes, embedded mix) |
| `project/scripts/stills.mjs` | Cloud look checks: renders chosen frames to JPG |
| `project/tts/` | `get_models.sh` (Kokoro + duration-patched model), `say.py` (voice samples), `tts_timed.py` (voice.wav + words.json) |
| `project/tools/` | `gen_captions.py` (captions.ts from words.json), `analyze_video.py` (pacing + near-still QA) |
| `project/audio/sound.py` | Score + SFX cue tables and the mix (music = 50 % of voice, SFX at or below, -14 LUFS) |
| `project/final/` | `render_chunks.sh` (resumable Linux render), `finish.sh` (join + mux + QA) |
| `project/README_RENDER.md` | Step-by-step Windows render guide for the user |
| `examples/molasses/` | SCRIPT.md (facts + sources + beats), SHOTPLAN.md, script texts, words.json |
| `../bridge/`, `../audio/` | Shared modules from the original template (toon.ts Pen API, paint, shade, ink, lens, grade, build; dsp, instruments, sfx_gen) |

## Make a new video
1. `bash templates/engine/setup.sh ~/work/<slug> --install`
2. Copy `src/videos/molasses` to `src/videos/<slug>`, rename the composition, register it in `src/Root.tsx`.
3. Voice: `bash tts/get_models.sh`, then `python3 tts/tts_timed.py script_tts.txt script.txt am_puck 1.2 voice/`.
4. Captions: `python3 tools/gen_captions.py voice/words.json src/videos/<slug>/captions.ts --merge "nineteen nineteen,=1919,"`.
5. Rewrite `story.ts` (SHOTS/CAMS/DOF/KICKS/FLASHES from the word frames), `world.ts` (sets), `cast.ts` (staging).
6. Look checks: `node scripts/stills.mjs <Comp> out/x_ 100,400,800 0.5`; fix; repeat.
7. Sound: edit cue tables in `audio/sound.py`, run `python3 audio/sound.py voice/voice.wav voice/words.json audio_out`,
   copy `audio_out/mix.wav` to `public/<slug>_mix.wav` and point the `<Audio>` tag at it.
8. Zip the working copy (without node_modules) for the laptop and follow `README_RENDER.md`.

## Pinned versions
Remotion 4.0.290, three 0.175.0, @react-three/fiber 9.1.2, @react-three/postprocessing 3.0.4, postprocessing 6.37.2.
On Windows with Node 26 use Chrome Headless Shell 133.0.6943.141 via `--browser-executable` (see README_RENDER.md).
