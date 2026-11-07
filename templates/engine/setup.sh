#!/bin/bash
# Create a working copy of the engine for a new video.
# usage: bash templates/engine/setup.sh <work_dir> [--install]
#   copies project/ -> <work_dir>, the shared character/world modules (templates/bridge) -> src/videos/bridge,
#   the synth libraries (templates/audio) -> audio/lib; with --install also runs npm install.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; T="$(dirname "$HERE")"; W="$1"
[ -z "$W" ] && { echo "usage: bash setup.sh <work_dir> [--install]"; exit 1; }
mkdir -p "$W"
cp -r "$HERE/project/." "$W/"
mkdir -p "$W/src/videos/bridge" "$W/audio/lib"
cp "$T"/bridge/*.ts "$T"/bridge/*.tsx "$W/src/videos/bridge/"
cp "$T"/audio/*.py "$W/audio/lib/"
[ "$2" = "--install" ] && (cd "$W" && npm install --no-audit --no-fund)
echo "engine ready in $W"
