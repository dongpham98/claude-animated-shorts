# Short 01 — "The Syrup That Outran People" (Great Molasses Flood, 1919)
Format: cartoon-3d-short skill, vertical 1080x1920, ~58-62 s (223 words at ~3.7 words/s), one steady narrator (free Kokoro TTS), no captions.
Status: APPROVED 2026-11-07 (v1.1: court line changed to "After years in court"). Voice (am_puck) and word timings DONE. Next: shot plan (story.ts).

## Facts (with sources)
- 15 Jan 1919, ~12:30-12:40 pm, Purity Distilling Co. tank, Commercial Street, North End, Boston. Tank ~50 ft tall, 90 ft wide, >2.3 million gallons. (Britannica; CS Monitor; NPR)
- Air had warmed above 40 °F after frigid days. (Wikipedia, citing Puleo "Dark Tide")
- Warmer molasses was pumped into the tank two days before; tank walls reportedly "groaned" after deliveries. (Live Science, N. Sharp)
- Tank leaked; it was painted brown to hide leaks; residents collected the drips. (Wikipedia; Puleo)
- Steel was about half as thick as it should have been. (Popular Science)
- Witnesses heard a sound like a machine gun as the rivets shot out of the tank. (Wikipedia, citing Puleo pp. 92-95; NYT 16 Jan 1919) VERIFIED
- Wave ~25 ft high, ~35 mph; a truck was thrown into the harbor; firehouse knocked off its foundation; elevated railway damaged. (Wikipedia; Live Science; APS News)
- 21 dead, ~150 injured. (Wikipedia; NPR)
- Molasses cooled and thickened in the freezing night, viscosity up 4x or more, trapping victims and slowing rescue. (Harvard / Sharp et al., APS 2016; Live Science; CBC)
- Court case: auditor Hugh Ogden's report came in April 1925; sources give 3 to 6 years of hearings, so the script says "years in court". (Wikipedia; History.com; Mass Moments)
- Aftermath: engineers must show their calculations and sign and seal plans; inspections, as a result of the court case. (Stephen Puleo on NPR)
- Folklore: locals say the area still smells of molasses on hot days. (Wikipedia; NPR)

## Beats
| Beat | Line |
|---|---|
| Hook | In 1919, a wave of syrup outran people down a city street. |
| Setting | It's January in Boston, and by the harbor stands a steel tank five stories tall, holding over two million gallons of molasses. |
| Escalation 1 | The tank leaks so badly that neighbors bring buckets to collect the drips. |
| Escalation 2 (joke) | The company's fix? Paint the tank brown, so the leaks don't show. |
| Escalation 3 | Two days ago, fresh warm molasses was pumped in on top, and now the walls groan every time it settles. |
| Snap | Then, on an oddly mild afternoon, the rivets start popping like gunshots, and the whole tank splits open. |
| Wave | A brown wave twenty-five feet tall rolls down the street at thirty-five miles an hour. |
| Damage | It throws a truck into the harbor and shoves a firehouse off its foundation. |
| Serious beat | Twenty-one people never made it out. |
| Mystery | But wait. How does molasses move that fast? |
| Pivot | You see, molasses is all about temperature. |
| Analogy | Ever poured honey straight from the fridge? It barely moves. Warm it up, and it runs like juice. |
| Mechanism | The warm molasses raced out of the tank, then the freezing evening air thickened it, and it held on to everyone it caught. |
| Rule | After years in court, the rules changed: engineers now have to show their math and sign their plans before anything gets built. |
| Callback twist | And locals say that on hot summer days, the old waterfront still smells sweet. |

TTS note: the voice reads "In nineteen nineteen," spelled out so the year is spoken correctly.

## Voice
CHOSEN: Kokoro v1.0 voice **am_puck**, speed 1.2, sentences joined with 0.12 s gaps, peak-normalised to 0.89. Final voice.wav = 60.98 s, 3.69 words/s (24 kHz mono).
Word timings: words.json (225 words, start/end in seconds, sentence number), taken from Kokoro's own per-phoneme durations (duration node exposed in the ONNX graph), so they are exact for this audio; sentence onsets checked against the waveform, all within 30 ms. Words are the spoken text ("nineteen nineteen" for 1919).
Other candidates rendered: am_fenrir 1.28, am_michael 1.33, bm_george 1.35.

## Tone note
21 people died, so the humor stays on the company and the absurdity of syrup (buckets, brown paint), never on the victims. The deaths line is played straight: music drops out, camera holds.

## Visual ideas (for the shot plan)
- Cold bright January day (day preset), sky cooling to blue-violet at the "freezing evening" beat.
- Neighbors with buckets under drip streaks; a painter rolling brown paint over a leak.
- Rivets as cartoon spark/burst FX cards; brown wave as a glossy dark-amber sheet with ink outline.
- Honey-jar insert in a kitchen for the analogy (fridge, then warm).
- Engineer stamping a plan with a seal for the rule beat.
- Ending: quiet summer street, cartoon smell squiggles drifting from the cobbles.
