#!/bin/bash
# Resumable render of MolassesShort in 100-frame chunks: bash final/render_chunks.sh [first_chunk] [last_chunk]
# Each finished chunk is final/chunks/c_XX.mp4; existing chunks are skipped (resume after any interruption).
cd "$(dirname "$0")/.."
mkdir -p final/chunks
TOTAL=1849; STEP=100
A=${1:-0}; B=${2:-18}
for ((c=A; c<=B; c++)); do
  s=$((c*STEP)); e=$((s+STEP-1)); [ $e -ge $TOTAL ] && e=$((TOTAL-1)); [ $s -ge $TOTAL ] && break
  out=$(printf "final/chunks/c_%02d.mp4" $c)
  [ -f "$out" ] && { echo "skip $out"; continue; }
  echo "chunk $c: frames $s-$e  $(date +%H:%M:%S)"
  npx remotion render src/index.ts MolassesShort "$out.part.mp4" --frames=$s-$e --codec=h264 --crf=16 --muted \
    --browser-executable=/usr/bin/google-chrome --gl=${GL:-swangle} --concurrency=${CONC:-1} --timeout=900000 \
    ${PROPS:+--props="$PROPS"} --log=error && mv "$out.part.mp4" "$out" && echo "done $out $(date +%H:%M:%S)"
done
