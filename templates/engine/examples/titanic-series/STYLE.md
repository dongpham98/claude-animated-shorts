# Titanic series: style guide (v1, 2026-11-08)

Series: "Titanic (1997) vs the real Titanic" (plan: claude/titanic-series-plan.md). One look for characters and scenes.

## Engine
- 2D SVG cut-out puppets and SVG scenery inside Remotion 4.0.290 (no three.js / WebGL). Code: `src/chibi.tsx` (puppet), `src/cast.ts` (people), `src/deck.tsx` (boat deck set), `src/style.ts` (palette + easing).
- Speed: the 12-s test (360 frames, 1920x1080) rendered in the cloud in ~2.5 min (~0.4 s/frame with 2 tabs). The 3D engine needed 70-120 s per frame in the cloud. Long episodes can be rendered in the cloud in parts, the laptop is the backup.

## Characters (chibi)
- Proportions: puppet 200 units tall; head ~50 % of the height (ellipse 100 x 94), short body and legs, mitten hands.
- Outline: warm dark brown `#2a1b16`, 3.2 units on puppets, 3.5 px on scenery, round joins. Never pure black.
- Colour: flat fills + exactly one shading layer (plum `rgba(70,30,60,0.22)`) on the side away from the sun; soft pink blush; eyes = dark ovals with two white highlights.
- Moving parts: legs (walk cycle with bob), arms (raise angle, wave), head (tilt, nod, look left/right shifts face and ears), eyes (blink, closed), brows (raise/frown), mouth (smile, grin, o, flat, talk 0-1), props (plans, violin + bow), idle sway and breathing.
- Real people only, drawn from period photos (see `src/cast.ts` notes). The film's fictional couple is never drawn; no recreated film shots.

## Cast v1
| Person | Look |
|---|---|
| Captain Edward J. Smith | white full beard, dark navy double-breasted uniform, gold buttons and cuff rings, peaked cap with gold badge |
| Thomas Andrews | clean-shaven (since 1901), dark side-parted hair, dark suit, red tie, rolled ship plans |
| Wallace Hartley | brown hair, moustache, band uniform with green facings, violin |
| Margaret "Molly" Brown | auburn up-do, plum Edwardian dress with lace collar, wide hat with roses and an ostrich feather |

## Scenery
- Same line weight and rounded shapes as the characters; simple 2-3 stop gradients; 3-5 parallax layers (sky 0.06-0.1, funnels 0.42, roof vents 0.6, deckhouse 0.78, deck + characters 1.0, foreground 1.35 with blur).
- Palette: warm gold/peach for first class and golden hour, wood and steel for third class and crew areas, deep blues for night and the sea.
- Something always moves: smoke, clouds, a gull, window glints, music notes; camera glides and push-ins (no static holds).
- Ship facts used: four buff funnels with black tops, raked aft, the 4th without smoke; white deckhouse; teak deck.

## Text on screen
- Location tags: Montserrat Black 30 px caps, cream on a dark brown pill, top left.
- Watermark: @LeoKnowledgeSharing bottom right, 40 px from the edges, Montserrat Bold 32 px, white 68 %, soft shadow (channel-plan spec).
- Captions (long video style): 2-5 word phrases, lower third, never over faces.
