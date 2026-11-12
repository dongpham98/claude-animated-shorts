# Episode 3 "The Iceberg": status (12 Nov 2026, daily run)

- Slot: **Wed 18 Nov 19:00 Paris**. Final watch due Tue 17 Nov 19:00. Length **7:07** (12,797 frames, 1920x1080, 30 fps).
- Research: RESEARCH.md (9 Nov, 38 sources). Script v2 after independent fact check: SCRIPT.md, FACTCHECK.md (2 FIX + 11 SOFTEN applied). Upload pack: UPLOAD.md.
- Built in the cloud: Remotion composition `Ep3` (src/Ep3.tsx, ep3sets.tsx), timeline ep03/timeline.py, voices ep03/voice, mix sound_ep3.py (music ≈ -10 dB under voice, -14 LUFS, TP ≤ -1.3 dB before AAC).
- Stills of all 59 scenes checked on contact sheets; layout fixes applied (labels above bubbles, bottom pills moved away from captions, FILM vs REAL layout, lifebelt shapes removed).
- Render: cloud, 13 parts × 1,000 frames, muted; audio muxed once at the end (AAC + limiter).

## Story spine
Paradox hook from a small object: three strokes of a bell, and the answer "Thank you." Protagonists Fleet (lookout) → Andrews (verdict). Clock: "less than a minute" (37 s myth debunked), then Andrews' "hour and a half" dial, half gone when boat 7 is lowered. "You see" #1 tiller orders (hard-a-starboard turns LEFT); #2 ice-cube tray (bulkheads open at the top; 4 survivable, 6 opened). Callback ending: quiet, half-empty boat 7 under a fully lit ship. Ends asking whether to make Episode 4 (episodes 4-7 are paused by the 11 Nov plan).

## FILM vs REAL cards (text only on the film side)
A) Lookouts distracted by the lovers (film) vs Fleet "as soon as I saw it" (British inquiry).
B) Andrews' "mathematical certainty" (film) vs no recorded words; Bullock 1912 "an hour and a half".

## Decisions
- Narrator am_puck 0.92. Fleet bm_daniel, Moody am_liam, Murdoch am_onyx, Smith bm_george, passenger am_michael, carpenter am_adam, clerk am_eric, Bride bm_lewis, Titanic message bm_fable.
- No real photos (Wikimedia/LoC still blocked); documents redrawn and labelled.
- Half-size draft pass skipped: stills QA on every scene + final in 1,000-frame parts, with blackdetect/freezedetect on the final instead (time). Any bad part is re-rendered alone.
- Bug found and fixed in the mixer: `mono()` averaged stereo pads over time, so soft pads were silent in the Ep 2 / Shorts mixes. Fixed in sound_ep3.py (worth porting to the shared audio kit).
- Series: Ep 3 is the last scheduled Titanic episode (Ep 4-7 paused) → user told 2 days before (by Mon 16 Nov) with 3 options.
