#!/bin/bash
# Join the chunks, add the mix, encode, QA.  bash final/finish.sh <mix.wav> <out.mp4>
cd "$(dirname "$0")/.."
MIX=$1; OUT=$2
ls final/chunks/c_*.mp4 | sort | sed "s|^|file '$PWD/|; s|$|'|" > final/list.txt
ffmpeg -v error -y -f concat -safe 0 -i final/list.txt -i "$MIX" -map 0:v:0 -map 1:a:0 -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 256k -t 61.633 -movflags +faststart "$OUT"
echo "== duration"; ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT"
echo "== frozen spans >= 0.4 s"; ffmpeg -v info -i "$OUT" -vf freezedetect=n=0.002:d=0.4 -map 0:v:0 -f null - 2>&1 | grep -E "freeze_(start|duration)" || echo none
echo "== black frames"; ffmpeg -v info -i "$OUT" -vf blackdetect=d=0.05:pix_th=0.08 -an -f null - 2>&1 | grep black_start || echo none
echo "== loudness"; ffmpeg -v info -i "$OUT" -af ebur128=peak=true -vn -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2
ffmpeg -v error -y -i "$OUT" -vf "fps=1,scale=180:-1,tile=10x7" -frames:v 1 final/qa_sheet.jpg && echo "qa sheet: final/qa_sheet.jpg"
