# Titanic Episode 1 — "Get Off That Ship" (5:09, 1920x1080, 30 fps)

Published slot: Wed 11 Nov 2026 19:00 Paris (YouTube id smBDkF1PXps).

## Files
- `lines.py` — narration N01–N47 + character lines (after fact check). `SCRIPT.md` — readable script.
- `voice.py` — Kokoro TTS (narrator am_puck 1.0; characters bm_george / bm_lewis / bm_daniel / bm_fable en-gb, af_heart). Needs KOKORO_DIR and `templates/engine/project/tts/tts_timed.py` (edit the TT path at the top to your clone).
- `voice/` — the final voice files: `N01..N47/voice.wav + words.json` (word timings), character lines as `<ID>.wav`.
- `timeline.py` — builds `../project/src/ep1_timeline.json` (scenes, words, mouth envelopes, captions) and `seq.json`. Run from this folder.
- `../project/src/Ep1.tsx` (composition `Ep1`), `ep1sets.tsx` (sets), `cast1.ts` (cast), plus shared `chibi.tsx`, `scenes.tsx`, `fx.tsx`.
- `../project/sound_ep1.py` — score + SFX + voice mix → `public/ep1_mix.wav` (-14 LUFS). Run from `project/`.
- `../project/public/ep1_mix.flac` — the final mix, lossless. Convert before rendering:
  `ffmpeg -i public/ep1_mix.flac public/ep1_mix.wav`

## Render
```
cd project && npm i
ffmpeg -i public/ep1_mix.flac public/ep1_mix.wav
npx remotion render src/index.ts Ep1 out/titanic_ep1.mp4 --codec=h264 --crf=18 --x264-preset=veryfast --concurrency=2 --timeout=300000
```
Final master also needs: `alimiter=limit=0.70` after AAC to reach true peak -1.8 dBTP.
