# Render "The Syrup That Outran People" on your Windows laptop

Everything is ready: picture, captions, voice, music and sound effects are all inside this project.
One command produces the finished video `out\molasses_flood.mp4` (1080x1920, 30 fps, 61.6 s, with sound).

## 1. Install Node.js (one time)
Open **PowerShell** (Start menu -> type `PowerShell`) and paste:
```
winget install OpenJS.NodeJS.LTS
```
Close PowerShell and open it again afterwards. (Or download "LTS" from https://nodejs.org and install it.)

## 2. Unzip the project
Unzip `molasses-short-code-v4.zip` to `C:\shorts\` so you have the folder `C:\shorts\molasses-short`.

## 3. Install the project (one time, ~2-5 min)
```
cd C:\shorts\molasses-short
npm install
```

## 4. Test one frame (~1 min)
```
npm run test-still
```
Open `C:\shorts\molasses-short\out\test_frame.png`. You should see the molasses wave rolling down the street with the caption **"rolls"**.

## 5. Render the whole video
Plug the laptop in, turn off sleep (Settings -> System -> Power -> Sleep: Never), then:
```
npm run render
```
It shows a progress bar. On integrated graphics expect roughly 1-4 hours. When it finishes, the video is `out\molasses_flood.mp4`. Upload that file to YouTube as a Short.

### If it stops in the middle or you want to do it in two sittings
Render the two halves separately (each can be run on a different evening):
```
npm run render-part1
npm run render-part2
```
Then join them (uses the ffmpeg that came with Remotion):
```
"file 'part1.mp4'`nfile 'part2.mp4'" | Out-File -Encoding ascii out\list.txt
npx remotion ffmpeg -f concat -safe 0 -i out\list.txt -c copy out\molasses_flood.mp4
```

### If you see a WebGL / GPU error
Add `-- --gl=angle` to the command, for example `npm run render -- --gl=angle`.
