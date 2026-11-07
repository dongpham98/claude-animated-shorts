# Titanic's Lifeboats: render the PILOT on your laptop (cold open + chapter 1, 1:55)

The pilot is 3,453 frames at 1920x1080, with voice, music, sound effects and word-by-word captions built in.
About a third of the frames are 2D "Clipboard board" shots, which render fast. Expected time on your laptop is
**about 1 hour** (the molasses Short took 40-45 min for 1,849 frames).

Your browser fix from the molasses render is reused: the scripts point at
`C:\YouTube\browser\chrome-headless-shell\win64-133.0.6943.141\chrome-headless-shell-win64\chrome-headless-shell.exe`.

## 1. Unzip
Unzip `titanic-pilot.zip` to `C:\YouTube\titanic-pilot`, so that `package.json` sits directly in that folder.

## 2. Install (once, about 3-5 min)
Open **PowerShell** and paste:
```
cd C:\YouTube\titanic-pilot
npm install
npm install-scripts approve esbuild
npm rebuild esbuild
```
If you see "vulnerabilities" warnings, ignore them. Never run `npm audit fix --force`.

## 3. Test one frame (about 1 min)
```
npm run test-still
```
Open `C:\YouTube\titanic-pilot\out\test_frame.png`. You should see **Clipboard** (the young purser with the red
cap band) on the night boat deck, holding his clipboard. A card at the top left reads **"MYTH #1 · Titanic broke the
law"** and the caption at the bottom reads **"Titanic"**. Your channel handle **@LeoKnowledgeSharing** sits small in the top-right corner (it is on every frame of the video).

## 4. Render the pilot
Plug in the charger, set Sleep to "Never", and close browsers, Teams and Outlook. Then:
```
npm run render-pilot
```
The finished file is `out\titanic_pilot.mp4`. Task Manager showing GPU "3D" near 99 % is normal.

**Split render (if the laptop has to stop):** run `npm run render-part1` (frames 0-1473) and later
`npm run render-part2` (frames 1474-3452). Then join the parts:
```
cd out
"file 'titanic_pilot_part1.mp4'" | Out-File -Encoding ascii list.txt
"file 'titanic_pilot_part2.mp4'" | Out-File -Encoding ascii -Append list.txt
npx remotion ffmpeg -f concat -safe 0 -i list.txt -c copy titanic_pilot.mp4
```

## 5. Send it back
Upload `out\titanic_pilot.mp4` in our chat. I'll check it the same way as the molasses video: freezes, black frames,
loudness, pacing and a contact sheet. Then the remaining chapters get built in the same style.

## Troubleshooting
| What you see | Fix |
|---|---|
| `No browser found` | The browser path in package.json must exist. Re-run `npx @puppeteer/browsers install chrome-headless-shell@133.0.6943.141 --path C:\YouTube\browser` |
| WebGL / GPU error | Edit package.json: change `--gl=angle` to `--gl=swangle` (works, but much slower) |
| `delayRender` timeout | Change `--timeout=300000` to `--timeout=600000` in package.json |
| Memory above 85 % | Close other apps. Or add `--concurrency=1` to the render line |
| Anything else | Send me a screenshot of the PowerShell window |
